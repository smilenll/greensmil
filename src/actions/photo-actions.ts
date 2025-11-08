'use server';

import { revalidatePath } from 'next/cache';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { Schema } from '../../amplify/data/resource';
import { requireRole, requireAuth } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import outputs from '../../amplify_outputs.json';

// S3 configuration
const BUCKET_NAME = 'amplify-d22ytonhmq8rvo-ma-photogallerybucketb708eb-eofbcbyvznxm';
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
    console.log('[uploadPhoto] Starting upload for user:', user.userId);

    const { title, description, file } = input;

    console.log('[uploadPhoto] Input data:', { title, hasFile: !!file, fileName: file?.name });

    if (!title || !file) {
      return { success: false, error: 'Title and file are required' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Upload to S3
    const fileKey = `photos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileBuffer = await file.arrayBuffer();
    console.log('[uploadPhoto] File key:', fileKey, 'Size:', file.size);

    // Upload to S3 using SDK
    let uploadResult;
    try {
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
      });

      uploadResult = await s3Client.send(putCommand);
      console.log('[uploadPhoto] S3 upload successful:', fileKey);
    } catch (uploadError) {
      console.error('[uploadPhoto] S3 upload failed:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
    }

    // Construct public S3 URL (photos are configured for guest read access)
    const imageUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
    console.log('[uploadPhoto] Image URL:', imageUrl.substring(0, 50) + '...');

    // Create database entry
    let photoData;
    try {
      photoData = await cookieBasedClient.models.Photo.create({
        title,
        description: description || null,
        imageKey: fileKey,
        imageUrl: imageUrl,
        uploadedBy: user.userId,
        likeCount: 0,
      });

      if (!photoData.data) {
        throw new Error('No data returned from database');
      }
      console.log('[uploadPhoto] Database entry created:', photoData.data.id);
    } catch (dbError) {
      console.error('[uploadPhoto] Database creation failed:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    revalidatePath('/photography');
    revalidatePath('/admin/photos');

    return {
      success: true,
      photo: {
        id: photoData.data.id,
        title: photoData.data.title,
        description: photoData.data.description || undefined,
        imageUrl: photoData.data.imageUrl!,
        imageKey: photoData.data.imageKey,
        uploadedBy: photoData.data.uploadedBy,
        likeCount: photoData.data.likeCount || 0,
        createdAt: photoData.data.createdAt!,
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
 */
export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const { data: photos } = await cookieBasedClient.models.Photo.list();

    if (!photos) return [];

    // Get current user to check likes
    let currentUserId: string | undefined;
    try {
      const user = await requireAuth();
      currentUserId = user.userId;
    } catch {
      // User not authenticated - that's ok
    }

    return await Promise.all(
      photos.map(async (photo) => {
        let isLiked = false;

        if (currentUserId) {
          const { data: like } = await cookieBasedClient.models.PhotoLike.get({
            photoId: photo.id,
            userId: currentUserId,
          });
          isLiked = !!like;
        }

        return {
          id: photo.id,
          title: photo.title,
          description: photo.description || undefined,
          imageUrl: photo.imageUrl!,
          imageKey: photo.imageKey,
          uploadedBy: photo.uploadedBy,
          likeCount: photo.likeCount || 0,
          isLikedByCurrentUser: isLiked,
          createdAt: photo.createdAt!,
        };
      })
    );
  } catch (error) {
    console.error('Get photos error:', error);
    return [];
  }
}

/**
 * Toggle like on a photo
 */
export async function togglePhotoLike(photoId: string): Promise<{ success: boolean; isLiked: boolean; likeCount: number }> {
  try {
    const user = await requireAuth();

    // Check if already liked
    const { data: existingLike } = await cookieBasedClient.models.PhotoLike.get({
      photoId,
      userId: user.userId,
    });

    if (existingLike) {
      // Unlike
      await cookieBasedClient.models.PhotoLike.delete({
        photoId,
        userId: user.userId,
      });

      // Decrement like count
      const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
      if (photo) {
        await cookieBasedClient.models.Photo.update({
          id: photoId,
          likeCount: Math.max(0, (photo.likeCount || 0) - 1),
        });
      }

      revalidatePath('/photography');

      return {
        success: true,
        isLiked: false,
        likeCount: Math.max(0, (photo?.likeCount || 0) - 1),
      };
    } else {
      // Like
      await cookieBasedClient.models.PhotoLike.create({
        photoId,
        userId: user.userId,
      });

      // Increment like count
      const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
      if (photo) {
        await cookieBasedClient.models.Photo.update({
          id: photoId,
          likeCount: (photo.likeCount || 0) + 1,
        });
      }

      revalidatePath('/photography');

      return {
        success: true,
        isLiked: true,
        likeCount: (photo?.likeCount || 0) + 1,
      };
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
    };
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
