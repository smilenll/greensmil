'use server';

import { revalidatePath } from 'next/cache';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Schema } from '../../amplify/data/resource';
import { requireRole, requireAuth } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import outputs from '../../amplify_outputs.json';

// S3 configuration
const BUCKET_NAME = 'amplify-d22ytonhmq8rvo-ma-photogallerybucketb708eb-zyv7kknvywi7';
const AWS_REGION = process.env.COGNITO_REGION || 'us-east-2';

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
};

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

export type PhotoUploadResult = {
  success: boolean;
  photo?: Photo;
  error?: string;
};

/**
 * Upload a new photo (Admin only)
 */
export async function uploadPhoto(input: CreatePhotoInput): Promise<PhotoUploadResult> {
  try {
    const user = await requireRole('admin');
    const { title, description, file } = input;

    // Validate inputs
    if (!title || !file) {
      return { success: false, error: 'Title and file are required' };
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' };
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
      throw new Error('Failed to create database entry');
    }

    console.log('[uploadPhoto] Success:', photoData.id);

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    return {
      success: true,
      photo: {
        id: photoData.id,
        title: photoData.title,
        description: photoData.description || undefined,
        imageUrl: photoData.imageUrl!,
        imageKey: photoData.imageKey,
        uploadedBy: photoData.uploadedBy,
        likeCount: photoData.likeCount || 0,
        createdAt: photoData.createdAt!,
      },
    };
  } catch (error) {
    console.error('[uploadPhoto] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photo',
    };
  }
}

/**
 * Get all photos
 * Returns photos if user is authenticated, or error requiring auth
 */
export async function getAllPhotos(): Promise<GetPhotosResponse> {
  try {
    // Check authentication first
    let currentUserId: string | undefined;
    let isAuthenticated = false;

    try {
      const user = await requireAuth();
      currentUserId = user.userId;
      isAuthenticated = true;
    } catch {
      // User not authenticated
      return {
        success: false,
        error: 'Authentication required to view photos',
        requiresAuth: true,
      };
    }

    // User is authenticated - fetch photos
    const { data: photos } = await cookieBasedClient.models.Photo.list();

    if (!photos) {
      return {
        success: true,
        photos: [],
        isAuthenticated: true,
      };
    }

    const photoList = await Promise.all(
      photos.map(async (photo) => {
        let isLiked = false;

        if (currentUserId) {
          const { data: like } = await cookieBasedClient.models.PhotoLike.get({
            photoId: photo.id,
            userId: currentUserId,
          });
          isLiked = !!like;
        }

        // Get accurate like count from PhotoLike records
        const { data: allLikes } = await cookieBasedClient.models.PhotoLike.list({
          filter: { photoId: { eq: photo.id } },
        });
        const actualLikeCount = allLikes?.length || 0;

        // If the stored count doesn't match actual, update it silently
        if (photo.likeCount !== actualLikeCount) {
          console.log(`[getAllPhotos] Syncing like count for photo ${photo.id}: ${photo.likeCount} -> ${actualLikeCount}`);
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

        return {
          id: photo.id,
          title: photo.title,
          description: photo.description || undefined,
          imageUrl: signedUrl, // Use signed URL instead of public URL
          imageKey: photo.imageKey,
          uploadedBy: photo.uploadedBy,
          likeCount: actualLikeCount,
          isLikedByCurrentUser: isLiked,
          createdAt: photo.createdAt!,
        };
      })
    );

    return {
      success: true,
      photos: photoList,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Get photos error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load photos',
      requiresAuth: false,
    };
  }
}

/**
 * Toggle like on a photo
 */
export async function togglePhotoLike(photoId: string): Promise<{ success: boolean; isLiked: boolean; likeCount: number; error?: string }> {
  try {
    const user = await requireAuth();

    // First, get the photo to ensure it exists
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
    if (!photo) {
      console.error('[togglePhotoLike] Photo not found:', photoId);
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Photo not found',
      };
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
        return {
          success: false,
          isLiked: true,
          likeCount: photo.likeCount || 0,
          error: 'Failed to unlike photo',
        };
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
        return {
          success: false,
          isLiked: false,
          likeCount: photo.likeCount || 0,
          error: 'Failed to like photo',
        };
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

    return {
      success: true,
      isLiked,
      likeCount: newLikeCount,
    };
  } catch (error) {
    console.error('[togglePhotoLike] Error:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: error instanceof Error ? error.message : 'Failed to toggle like',
    };
  }
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  try {
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });

    if (!photo) return null;

    // Get current user to check likes
    let currentUserId: string | undefined;
    try {
      const user = await requireAuth();
      currentUserId = user.userId;
    } catch {
      // User not authenticated - that's ok
    }

    let isLiked = false;
    if (currentUserId) {
      const { data: like } = await cookieBasedClient.models.PhotoLike.get({
        photoId: photo.id,
        userId: currentUserId,
      });
      isLiked = !!like;
    }

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

    return {
      id: photo.id,
      title: photo.title,
      description: photo.description || undefined,
      imageUrl: signedUrl, // Use signed URL instead of public URL
      imageKey: photo.imageKey,
      uploadedBy: photo.uploadedBy,
      likeCount: actualLikeCount,
      isLikedByCurrentUser: isLiked,
      createdAt: photo.createdAt!,
    };
  } catch (error) {
    console.error('Get photo by ID error:', error);
    return null;
  }
}

/**
 * Delete a photo (Admin only)
 */
export async function deletePhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole('admin');

    // Get photo to get image key
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
    if (!photo) {
      return { success: false, error: 'Photo not found' };
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

    return { success: true };
  } catch (error) {
    console.error('Delete photo error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete photo',
    };
  }
}
