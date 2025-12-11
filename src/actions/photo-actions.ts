'use server';

import { revalidatePath } from 'next/cache';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { Schema } from '../../amplify/data/resource';
import { cookies } from 'next/headers';
import outputs from '../../amplify_outputs.json';
import { generatePhotoS3Key } from '@/lib/s3-utils';
import { ActionResponse, success, error, unauthorized } from '@/types/action-response';
import { withRole, withAuth } from '@/lib/action-helpers';
import {
  type Photo,
  type PhotoAIReport,
  type PhotosData,
  type PhotoLikeResult,
  type PhotoAIAnalysis,
  type CreatePhotoInput,
  type UpdatePhotoInput,
  createPhotoSchema,
  updatePhotoSchema,
  validatePhotoResponse,
} from '@/types/photo';

const BUCKET_NAME = outputs.storage.bucket_name;
const AWS_REGION = outputs.storage.aws_region;

const s3Client = new S3Client({
  region: AWS_REGION,
  ...(process.env.COGNITO_ACCESS_KEY_ID ? {
    credentials: {
      accessKeyId: process.env.COGNITO_ACCESS_KEY_ID,
      secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY || '',
    },
  } : {}),
});

const lambdaClient = new LambdaClient({
  region: AWS_REGION,
  ...(process.env.COGNITO_ACCESS_KEY_ID && process.env.COGNITO_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId: process.env.COGNITO_ACCESS_KEY_ID,
      secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY,
    },
  } : {}),
});

const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export async function createPhoto(input: CreatePhotoInput): Promise<ActionResponse<Photo>> {
  return withRole('admin', async (user) => {
    // Validate input with Zod schema
    const validation = createPhotoSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return error(firstError.message);
    }

    const { title, description, file } = validation.data;

    console.log('[uploadPhoto] Uploading:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const fileKey = generatePhotoS3Key(file.name);

    const fileBuffer = await file.arrayBuffer();

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

    const { data: photoData } = await cookieBasedClient.models.Photo.create({
      title,
      description: description || null,
      imageKey: fileKey,
      imageUrl,
      uploadedBy: user.userId,
    });

    if (!photoData) {
      return error('Failed to create database entry');
    }

    console.log('[uploadPhoto] Success:', photoData.id);

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    const validatedPhoto = validatePhotoResponse(photoData);

    return success(validatedPhoto);
  });
}

export async function getAllPhotos(): Promise<ActionResponse<PhotosData>> {
    return withAuth(async (user) =>{

    const { data: photos } = await cookieBasedClient.models.Photo.list({
      selectionSet: ['id', 'title', 'description', 'imageKey', 'createdAt', 'updatedAt', 'likes.*', 'comments.*']
    });

    if (!photos) {
      return success({ photos: [], isAuthenticated: true });
    }

    const photoList = await Promise.all(
      photos.map(async (photo) => {
        const likeCount = photo.likes?.length || 0;
        const userLiked = photo.likes?.some(like => like.userId === user.userId) ?? false;
        const commentCount = photo.comments?.length || 0;

        // Debug logging
        console.log(`[getAllPhotos] Photo ${photo.id}: comments=${commentCount}, likes=${likeCount}`);
        if (photo.comments && photo.comments.length > 0) {
          console.log(`[getAllPhotos] Comments for ${photo.id}:`, photo.comments);
        }

        const signedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({ Bucket: BUCKET_NAME, Key: photo.imageKey }),
          { expiresIn: 3600 }
        );

        return validatePhotoResponse({
          ...photo,
          imageUrl: signedUrl,
          likeCount,
          commentCount,
          isLikedByCurrentUser: userLiked,
        });
      })
    );

    return success({ photos: photoList, isAuthenticated: true });
    })
  }

export async function togglePhotoLike(photoId: string): Promise<ActionResponse<PhotoLikeResult>> {
  return withAuth(async (user) => {
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId }, {selectionSet: ['id', 'title', 'description', 'imageKey', 'createdAt', 'updatedAt', 'likes.*']});
    if (!photo) return error('Photo not found');


    const isLiking = photo.likes.some((like) => like.userId === user.userId);

    const result = isLiking 
      ? await cookieBasedClient.models.PhotoLike.create({ photoId, userId: user.userId })
      : await cookieBasedClient.models.PhotoLike.delete({ photoId, userId: user.userId });

    if (!result.data && isLiking) return error(isLiking ? 'Failed to like photo' : 'Failed to unlike photo');

    const { data: allLikes } = await cookieBasedClient.models.PhotoLike.list({
      filter: { photoId: { eq: photoId } },
    });
    
    revalidatePath('/photography');

    return success({
      isLiked: isLiking,
      likeCount: allLikes?.length || 0,
    });
  });
}

export async function getPhotoById(photoId: string): Promise<ActionResponse<Photo>> {
  return withAuth(async (user) => {
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId }, {selectionSet: ['id', 'title', 'description', 'imageKey', 'createdAt', 'updatedAt', 'likes.*', 'aiReports.*']});

    if (!photo) {
      return error('Photo not found');
    }

    const likeCount = photo.likes.length || 0;
    const isLiked = photo.likes?.some(like => like.userId === user.userId) ?? false;

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: photo.imageKey,
      }),
      { expiresIn: 3600 }
    );

    const aiReports: PhotoAIReport[] = photo.aiReports
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());

    return success(validatePhotoResponse({
      ...photo,
      imageUrl: signedUrl,
      likeCount,
      isLikedByCurrentUser: isLiked,
      aiReports,
    }));
  });
}

export async function updatePhoto(input: UpdatePhotoInput): Promise<ActionResponse<Photo>> {
  return withRole('admin', async () => {
    const validation = updatePhotoSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return error(firstError.message);
    }

    const { id, title, description, file } = validation.data;
    const { data: existingPhoto } = await cookieBasedClient.models.Photo.get({ id });

    if (!existingPhoto) {
      return error('Photo not found');
    }

    let newImageKey = existingPhoto.imageKey;
    let newImageUrl = existingPhoto.imageUrl!;

    if (file) {
      console.log('[updatePhoto] Uploading new image:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      newImageKey = generatePhotoS3Key(file.name);

      // Get file buffer
      const fileBuffer = await file.arrayBuffer();

      // Upload new file to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: newImageKey,
          Body: new Uint8Array(fileBuffer),
          ContentType: file.type,
        })
      );

      console.log('[updatePhoto] New image uploaded to S3:', newImageKey);

      // Delete old file from S3
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: existingPhoto.imageKey,
          })
        );
        console.log('[updatePhoto] Old image deleted from S3:', existingPhoto.imageKey);
      } catch (deleteError) {
        console.error('[updatePhoto] Failed to delete old image:', deleteError);
        // Continue even if deletion fails
      }

      // Construct new public S3 URL
      newImageUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${newImageKey}`;
    }

    // Update photo record
    const { data: updatedPhoto } = await cookieBasedClient.models.Photo.update({
      id,
      title,
      description: description || null,
      imageKey: newImageKey,
      imageUrl: newImageUrl,
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

    console.log('[updatePhoto] Photo updated successfully:', id);

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    // Validate and transform photo data (likeCount will default to 0)
    const validatedPhoto = validatePhotoResponse({
      ...updatedPhoto,
      imageUrl: signedUrl,
    });

    return success(validatedPhoto);
  });
}

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
 * Analyze a photo using AI (Admin only)
 * Uses AWS Lambda + Bedrock (Claude) for cost-effective image analysis
 */
export async function analyzePhotoWithAI(photoId: string): Promise<ActionResponse<PhotoAIAnalysis>> {
  // Only new users with 15 credits can use thi functionality or payed users or admins
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
                          process.env.PHOTO_AI_ANALYSIS_FUNCTION_NAME;

      if (!functionName) {
        console.error('[analyzePhotoWithAI] Lambda function not deployed. Run: npx ampx sandbox');
        return error('AI analysis service not available. Please contact administrator.');
      }

      console.log('[analyzePhotoWithAI] Using function name:', functionName);

      const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: JSON.stringify(payload),
      });

      const lambdaResponse = await lambdaClient.send(command);
      const responsePayload = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      console.log('[analyzePhotoWithAI] Lambda response:', responsePayload);

      if (responsePayload.statusCode !== 200) {
        let errorMessage = 'Failed to analyze photo';
        if (responsePayload.body) {
          try {
            const errorBody = JSON.parse(responsePayload.body);
            errorMessage = errorBody.error || errorMessage;
            console.error('[analyzePhotoWithAI] Lambda error:', errorBody);
          } catch (parseError) {
            console.error('[analyzePhotoWithAI] Failed to parse error body:', responsePayload.body);
          }
        } else {
          console.error('[analyzePhotoWithAI] Lambda error - no response body:', responsePayload);
        }
        return error(errorMessage);
      }

      const result = JSON.parse(responsePayload.body);
      const analysis: PhotoAIAnalysis = result.analysis;

      // Try to create a new AI report (stores history) if table exists
      try {
        await cookieBasedClient.models.PhotoAIReport.create({
          photoId,
          compositionScore: analysis.composition.score,
          compositionRationale: analysis.composition.rationale,
          lightingScore: analysis.lighting.score,
          lightingRationale: analysis.lighting.rationale,
          subjectScore: analysis.subject.score,
          subjectRationale: analysis.subject.rationale,
          technicalScore: analysis.technical.score,
          technicalRationale: analysis.technical.rationale,
          creativityScore: analysis.creativity.score,
          creativityRationale: analysis.creativity.rationale,
          overallScore: analysis.overall,
          analyzedAt: new Date().toISOString(),
        });
        console.log('[analyzePhotoWithAI] AI report created in PhotoAIReport table');
      } catch (error) {
        console.log('[analyzePhotoWithAI] PhotoAIReport table not available yet, using legacy storage:', error);
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
 * Get AI analysis for a photo (gets the most recent report)
 */
export async function getPhotoAIAnalysis(photoId: string): Promise<ActionResponse<PhotoAIAnalysis | null>> {
  return withAuth(async () => {
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });

    if (!photo) {
      return error('Photo not found');
    }

    // Get all AI reports for this photo
    const { data: reports } = await cookieBasedClient.models.PhotoAIReport.list({
      filter: { photoId: { eq: photoId } },
    });

    if (!reports || reports.length === 0) {
      return success(null);
    }

    // Sort by analyzedAt descending and get the most recent
    const sortedReports = [...reports].sort(
      (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    );
    const latestReport = sortedReports[0];

    const analysis: PhotoAIAnalysis = {
      composition: {
        score: latestReport.compositionScore,
        rationale: latestReport.compositionRationale,
      },
      lighting: {
        score: latestReport.lightingScore,
        rationale: latestReport.lightingRationale,
      },
      subject: {
        score: latestReport.subjectScore,
        rationale: latestReport.subjectRationale,
      },
      technical: {
        score: latestReport.technicalScore,
        rationale: latestReport.technicalRationale,
      },
      creativity: {
        score: latestReport.creativityScore,
        rationale: latestReport.creativityRationale,
      },
      overall: latestReport.overallScore,
    };

    return success(analysis);
  });
}
