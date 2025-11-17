'use server';

import { revalidatePath } from 'next/cache';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { Schema } from '../../amplify/data/resource';
import { requireAuth } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import outputs from '../../amplify_outputs.json';
import { ActionResponse, success, error, unauthorized } from '@/types/action-response';
import { withRole, withAuth } from '@/lib/action-helpers';

// S3 configuration - read from Amplify Gen2 outputs
const BUCKET_NAME = outputs.storage.bucket_name;
const AWS_REGION = outputs.storage.aws_region;

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  // Use environment credentials if available (production), otherwise use default provider (development)
  ...(process.env.COGNITO_ACCESS_KEY_ID ? {
    credentials: {
      accessKeyId: process.env.COGNITO_ACCESS_KEY_ID,
      secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY || '',
    },
  } : {}),
});

// Initialize Lambda client
const lambdaClient = new LambdaClient({
  region: AWS_REGION,
  ...(process.env.COGNITO_ACCESS_KEY_ID ? {
    credentials: {
      accessKeyId: process.env.COGNITO_ACCESS_KEY_ID,
      secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY || '',
    },
  } : {}),
});

// Generate cookie-based Amplify Data client for server-side operations
// For authenticated users, uses userPool auth
// For guests, uses IAM with unauthenticated identities
const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export type Photo = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageKey: string;
  uploadedBy: string;
  likeCount: number;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
  // AI Analysis fields
  aiAnalyzed?: boolean;
  aiCompositionScore?: number;
  aiCompositionRationale?: string;
  aiLightingScore?: number;
  aiLightingRationale?: string;
  aiSubjectScore?: number;
  aiSubjectRationale?: string;
  aiTechnicalScore?: number;
  aiTechnicalRationale?: string;
  aiCreativityScore?: number;
  aiCreativityRationale?: string;
  aiOverallScore?: number;
  aiAnalyzedAt?: string;
};

export type PhotosData = {
  photos: Photo[];
  isAuthenticated: boolean;
};

// Deprecated: Use ActionResponse<PhotosData> instead
export type GetPhotosResponse = {
  success: true;
  photos: Photo[];
  isAuthenticated: boolean;
} | {
  success: false;
  error: string;
  requiresAuth: boolean;
};

export type CreatePhotoInput = {
  title: string;
  description?: string;
  file: File;
};

export type UpdatePhotoInput = {
  id: string;
  title: string;
  description?: string;
};

/**
 * Upload a new photo (Admin only)
 */
export async function uploadPhoto(input: CreatePhotoInput): Promise<ActionResponse<Photo>> {
  return withRole('admin', async (user) => {
    const { title, description, file } = input;

    // Validate inputs
    if (!title || !file) {
      return error('Title and file are required');
    }

    if (!file.type.startsWith('image/')) {
      return error('Only image files are allowed');
    }

    console.log('[uploadPhoto] Uploading:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Generate S3 key (file is already optimized on client-side)
    const sanitizedName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '_');
    const extension = file.name.split('.').pop() || 'jpg';
    const fileKey = `photos/${Date.now()}-${sanitizedName}.${extension}`;

    // Get file buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
      })
    );

    console.log('[uploadPhoto] Uploaded to S3:', fileKey);

    // Construct public S3 URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;

    // Create database entry
    const { data: photoData } = await cookieBasedClient.models.Photo.create({
      title,
      description: description || null,
      imageKey: fileKey,
      imageUrl,
      uploadedBy: user.userId,
      likeCount: 0,
    });

    if (!photoData) {
      return error('Failed to create database entry');
    }

    console.log('[uploadPhoto] Success:', photoData.id);

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    return success({
      id: photoData.id,
      title: photoData.title,
      description: photoData.description || undefined,
      imageUrl: photoData.imageUrl!,
      imageKey: photoData.imageKey,
      uploadedBy: photoData.uploadedBy,
      likeCount: photoData.likeCount || 0,
      createdAt: photoData.createdAt!,
    });
  });
}

/**
 * Get all photos
 * Returns photos if user is authenticated, or unauthorized response
 * Optimized: Reduces N+1 queries by batching all likes fetch
 */
export async function getAllPhotos(): Promise<ActionResponse<PhotosData>> {
  try {
    // Check authentication first
    let currentUserId: string | undefined;

    try {
      const user = await requireAuth();
      currentUserId = user.userId;
    } catch {
      return unauthorized('Authentication required to view photos');
    }

    // Fetch photos and ALL likes in parallel (2 queries instead of 2N+1)
    const [photosResult, allLikesResult] = await Promise.all([
      cookieBasedClient.models.Photo.list(),
      cookieBasedClient.models.PhotoLike.list(),
    ]);

    const { data: photos } = photosResult;
    const { data: allLikes } = allLikesResult;

    if (!photos) {
      return success({
        photos: [],
        isAuthenticated: true,
      });
    }

    // Build like lookup map for O(1) access instead of N queries
    const likesByPhoto = new Map<string, { count: number; userLiked: boolean }>();

    if (allLikes) {
      for (const like of allLikes) {
        const existing = likesByPhoto.get(like.photoId) || { count: 0, userLiked: false };
        existing.count++;
        if (currentUserId && like.userId === currentUserId) {
          existing.userLiked = true;
        }
        likesByPhoto.set(like.photoId, existing);
      }
    }

    // Track photos needing like count sync
    const photosToUpdate: Array<{ id: string; likeCount: number }> = [];

    // Process photos in parallel (signed URLs + build response)
    const photoList = await Promise.all(
      photos.map(async (photo) => {
        // O(1) lookup instead of 2 database queries
        const likeInfo = likesByPhoto.get(photo.id) || { count: 0, userLiked: false };
        const actualLikeCount = likeInfo.count;

        // Queue for batch update if stale
        if (photo.likeCount !== actualLikeCount) {
          console.log(`[getAllPhotos] Queuing like count sync for photo ${photo.id}: ${photo.likeCount} -> ${actualLikeCount}`);
          photosToUpdate.push({ id: photo.id, likeCount: actualLikeCount });
        }

        // Generate signed URL for the photo (1 hour expiration)
        const signedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: photo.imageKey,
          }),
          { expiresIn: 3600 }
        );

        return {
          id: photo.id,
          title: photo.title,
          description: photo.description || undefined,
          imageUrl: signedUrl,
          imageKey: photo.imageKey,
          uploadedBy: photo.uploadedBy,
          likeCount: actualLikeCount,
          isLikedByCurrentUser: likeInfo.userLiked,
          createdAt: photo.createdAt!,
          // AI Analysis fields
          aiAnalyzed: photo.aiAnalyzed || false,
          aiCompositionScore: photo.aiCompositionScore || undefined,
          aiCompositionRationale: photo.aiCompositionRationale || undefined,
          aiLightingScore: photo.aiLightingScore || undefined,
          aiLightingRationale: photo.aiLightingRationale || undefined,
          aiSubjectScore: photo.aiSubjectScore || undefined,
          aiSubjectRationale: photo.aiSubjectRationale || undefined,
          aiTechnicalScore: photo.aiTechnicalScore || undefined,
          aiTechnicalRationale: photo.aiTechnicalRationale || undefined,
          aiCreativityScore: photo.aiCreativityScore || undefined,
          aiCreativityRationale: photo.aiCreativityRationale || undefined,
          aiOverallScore: photo.aiOverallScore || undefined,
          aiAnalyzedAt: photo.aiAnalyzedAt || undefined,
        };
      })
    );

    // Batch update all stale like counts in parallel
    if (photosToUpdate.length > 0) {
      await Promise.all(
        photosToUpdate.map((update) =>
          cookieBasedClient.models.Photo.update({
            id: update.id,
            likeCount: update.likeCount,
          })
        )
      );
      console.log(`[getAllPhotos] Synced ${photosToUpdate.length} photo like counts`);
    }

    return success({
      photos: photoList,
      isAuthenticated: true,
    });
  } catch (err) {
    console.error('Get photos error:', err);
    return error(err instanceof Error ? err.message : 'Failed to load photos');
  }
}

export type PhotoLikeResult = {
  isLiked: boolean;
  likeCount: number;
};

/**
 * Toggle like on a photo
 */
export async function togglePhotoLike(photoId: string): Promise<ActionResponse<PhotoLikeResult>> {
  return withAuth(async (user) => {

    // First, get the photo to ensure it exists
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
    if (!photo) {
      console.error('[togglePhotoLike] Photo not found:', photoId);
      return error('Photo not found');
    }

    // Check if already liked
    const { data: existingLike } = await cookieBasedClient.models.PhotoLike.get({
      photoId,
      userId: user.userId,
    });

    let newLikeCount: number;
    let isLiked: boolean;

    if (existingLike) {
      // Unlike: Delete the like first
      const deleteResult = await cookieBasedClient.models.PhotoLike.delete({
        photoId,
        userId: user.userId,
      });

      if (!deleteResult.data) {
        console.error('[togglePhotoLike] Failed to delete like');
        return error('Failed to unlike photo');
      }

      // Count all remaining likes for this photo to ensure accuracy
      const { data: allLikes } = await cookieBasedClient.models.PhotoLike.list({
        filter: { photoId: { eq: photoId } },
      });
      newLikeCount = allLikes?.length || 0;
      isLiked = false;

      console.log('[togglePhotoLike] Unlike - Remaining likes:', newLikeCount);
    } else {
      // Like: Create the like first
      const createResult = await cookieBasedClient.models.PhotoLike.create({
        photoId,
        userId: user.userId,
      });

      if (!createResult.data) {
        console.error('[togglePhotoLike] Failed to create like');
        return error('Failed to like photo');
      }

      // Count all likes for this photo to ensure accuracy
      const { data: allLikes } = await cookieBasedClient.models.PhotoLike.list({
        filter: { photoId: { eq: photoId } },
      });
      newLikeCount = allLikes?.length || 0;
      isLiked = true;

      console.log('[togglePhotoLike] Like - Total likes:', newLikeCount);
    }

    // Update the photo's like count with the accurate count
    const updateResult = await cookieBasedClient.models.Photo.update({
      id: photoId,
      likeCount: newLikeCount,
    });

    if (!updateResult.data) {
      console.error('[togglePhotoLike] Failed to update photo like count');
      // Still return success since the like/unlike operation succeeded
    }

    console.log('[togglePhotoLike] Success - photoId:', photoId, 'isLiked:', isLiked, 'likeCount:', newLikeCount);

    revalidatePath('/photography');

    return success({
      isLiked,
      likeCount: newLikeCount,
    });
  });
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(photoId: string): Promise<ActionResponse<Photo>> {
  return withAuth(async (user) => {
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });

    if (!photo) {
      return error('Photo not found');
    }

    // Check if user liked this photo
    const { data: like } = await cookieBasedClient.models.PhotoLike.get({
      photoId: photo.id,
      userId: user.userId,
    });
    const isLiked = !!like;

    // Get accurate like count from PhotoLike records
    const { data: allLikes } = await cookieBasedClient.models.PhotoLike.list({
      filter: { photoId: { eq: photo.id } },
    });
    const actualLikeCount = allLikes?.length || 0;

    // If the stored count doesn't match actual, update it silently
    if (photo.likeCount !== actualLikeCount) {
      console.log(`[getPhotoById] Syncing like count for photo ${photo.id}: ${photo.likeCount} -> ${actualLikeCount}`);
      await cookieBasedClient.models.Photo.update({
        id: photo.id,
        likeCount: actualLikeCount,
      });
    }

    // Generate signed URL for the photo (1 hour expiration)
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: photo.imageKey,
      }),
      { expiresIn: 3600 } // 1 hour
    );

    return success({
      id: photo.id,
      title: photo.title,
      description: photo.description || undefined,
      imageUrl: signedUrl,
      imageKey: photo.imageKey,
      uploadedBy: photo.uploadedBy,
      likeCount: actualLikeCount,
      isLikedByCurrentUser: isLiked,
      createdAt: photo.createdAt!,
      // AI Analysis fields
      aiAnalyzed: photo.aiAnalyzed || false,
      aiCompositionScore: photo.aiCompositionScore || undefined,
      aiCompositionRationale: photo.aiCompositionRationale || undefined,
      aiLightingScore: photo.aiLightingScore || undefined,
      aiLightingRationale: photo.aiLightingRationale || undefined,
      aiSubjectScore: photo.aiSubjectScore || undefined,
      aiSubjectRationale: photo.aiSubjectRationale || undefined,
      aiTechnicalScore: photo.aiTechnicalScore || undefined,
      aiTechnicalRationale: photo.aiTechnicalRationale || undefined,
      aiCreativityScore: photo.aiCreativityScore || undefined,
      aiCreativityRationale: photo.aiCreativityRationale || undefined,
      aiOverallScore: photo.aiOverallScore || undefined,
      aiAnalyzedAt: photo.aiAnalyzedAt || undefined,
    });
  });
}

/**
 * Update a photo's title and description (Admin only)
 */
export async function updatePhoto(input: UpdatePhotoInput): Promise<ActionResponse<Photo>> {
  return withRole('admin', async () => {
    const { id, title, description } = input;

    if (!title) {
      return error('Title is required');
    }

    // Update photo record
    const { data: updatedPhoto } = await cookieBasedClient.models.Photo.update({
      id,
      title,
      description: description || null,
    });

    if (!updatedPhoto) {
      return error('Failed to update photo');
    }

    // Generate signed URL for the updated photo
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: updatedPhoto.imageKey,
      }),
      { expiresIn: 3600 }
    );

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    return success({
      id: updatedPhoto.id,
      title: updatedPhoto.title,
      description: updatedPhoto.description || undefined,
      imageUrl: signedUrl,
      imageKey: updatedPhoto.imageKey,
      uploadedBy: updatedPhoto.uploadedBy,
      likeCount: updatedPhoto.likeCount || 0,
      createdAt: updatedPhoto.createdAt!,
    });
  });
}

/**
 * Delete a photo (Admin only)
 */
export async function deletePhoto(photoId: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    // Get photo to get image key
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
    if (!photo) {
      return error('Photo not found');
    }

    // Delete from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: photo.imageKey,
      });
      await s3Client.send(deleteCommand);
      console.log('[deletePhoto] S3 file deleted:', photo.imageKey);
    } catch (storageError) {
      console.error('[deletePhoto] S3 deletion failed:', storageError);
      // Continue even if S3 deletion fails - we still want to remove from DB
    }

    // Delete all likes first
    const { data: likes } = await cookieBasedClient.models.PhotoLike.list({
      filter: { photoId: { eq: photoId } },
    });

    if (likes) {
      await Promise.all(
        likes.map((like) =>
          cookieBasedClient.models.PhotoLike.delete({
            photoId: like.photoId,
            userId: like.userId,
          })
        )
      );
    }

    // Delete photo record
    await cookieBasedClient.models.Photo.delete({ id: photoId });

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    return success(undefined);
  });
}

/**
 * AI Analysis types
 */
export type PhotoAIAnalysis = {
  composition: {
    score: number;
    rationale: string;
  };
  lighting: {
    score: number;
    rationale: string;
  };
  subject: {
    score: number;
    rationale: string;
  };
  technical: {
    score: number;
    rationale: string;
  };
  creativity: {
    score: number;
    rationale: string;
  };
  overall: number;
};

/**
 * Analyze a photo using AI (Admin only)
 * Uses AWS Lambda + Bedrock (Claude) for cost-effective image analysis
 */
export async function analyzePhotoWithAI(photoId: string): Promise<ActionResponse<PhotoAIAnalysis>> {
  return withRole('admin', async () => {
    try {
      // Get photo details
      const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
      if (!photo) {
        return error('Photo not found');
      }

      console.log('[analyzePhotoWithAI] Starting analysis for:', photo.imageKey);

      // Invoke Lambda function
      const payload = {
        imageKey: photo.imageKey,
        bucketName: BUCKET_NAME,
      };

      // Get function name from Amplify outputs
      const functionName = (outputs as any).custom?.photoAiAnalysisFunctionName ||
                          process.env.PHOTO_AI_ANALYSIS_FUNCTION_NAME ||
                          'photo-ai-analysis';

      console.log('[analyzePhotoWithAI] Using function name:', functionName);

      const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: JSON.stringify(payload),
      });

      const lambdaResponse = await lambdaClient.send(command);
      const responsePayload = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      console.log('[analyzePhotoWithAI] Lambda response:', responsePayload);

      if (responsePayload.statusCode !== 200) {
        const errorBody = JSON.parse(responsePayload.body);
        console.error('[analyzePhotoWithAI] Lambda error:', errorBody);
        return error(errorBody.error || 'Failed to analyze photo');
      }

      const result = JSON.parse(responsePayload.body);
      const analysis: PhotoAIAnalysis = result.analysis;

      // Update photo with AI analysis results
      const { data: updatedPhoto } = await cookieBasedClient.models.Photo.update({
        id: photoId,
        aiAnalyzed: true,
        aiCompositionScore: analysis.composition.score,
        aiCompositionRationale: analysis.composition.rationale,
        aiLightingScore: analysis.lighting.score,
        aiLightingRationale: analysis.lighting.rationale,
        aiSubjectScore: analysis.subject.score,
        aiSubjectRationale: analysis.subject.rationale,
        aiTechnicalScore: analysis.technical.score,
        aiTechnicalRationale: analysis.technical.rationale,
        aiCreativityScore: analysis.creativity.score,
        aiCreativityRationale: analysis.creativity.rationale,
        aiOverallScore: analysis.overall,
        aiAnalyzedAt: new Date().toISOString(),
      });

      if (!updatedPhoto) {
        return error('Failed to save analysis results');
      }

      console.log('[analyzePhotoWithAI] Analysis saved successfully');

      revalidatePath('/photography');
      revalidatePath(`/photography/${photoId}`);
      revalidatePath('/admin/photos');

      return success(analysis);
    } catch (err) {
      console.error('[analyzePhotoWithAI] Error:', err);
      return error(err instanceof Error ? err.message : 'Failed to analyze photo');
    }
  });
}

/**
 * Get AI analysis for a photo
 */
export async function getPhotoAIAnalysis(photoId: string): Promise<ActionResponse<PhotoAIAnalysis | null>> {
  return withAuth(async () => {
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });

    if (!photo) {
      return error('Photo not found');
    }

    if (!photo.aiAnalyzed || !photo.aiOverallScore) {
      return success(null);
    }

    const analysis: PhotoAIAnalysis = {
      composition: {
        score: photo.aiCompositionScore || 0,
        rationale: photo.aiCompositionRationale || '',
      },
      lighting: {
        score: photo.aiLightingScore || 0,
        rationale: photo.aiLightingRationale || '',
      },
      subject: {
        score: photo.aiSubjectScore || 0,
        rationale: photo.aiSubjectRationale || '',
      },
      technical: {
        score: photo.aiTechnicalScore || 0,
        rationale: photo.aiTechnicalRationale || '',
      },
      creativity: {
        score: photo.aiCreativityScore || 0,
        rationale: photo.aiCreativityRationale || '',
      },
      overall: photo.aiOverallScore,
    };

    return success(analysis);
  });
}
