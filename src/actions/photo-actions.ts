'use server';

import { revalidatePath } from 'next/cache';
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import { requireRole, requireAuth } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '../../amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageKey: string;
  uploadedBy: string;
  likeCount: number;
  isLikedByCurrentUser?: boolean;
  createdAt: string;
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: Photo;
  error?: string;
}

/**
 * Upload a new photo (Admin only)
 */
export async function uploadPhoto(formData: FormData): Promise<PhotoUploadResult> {
  try {
    const user = await requireRole('admin');
    console.log('[uploadPhoto] Starting upload for user:', user.userId);

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;

    console.log('[uploadPhoto] Form data:', { title, hasFile: !!file, fileName: file?.name });

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

    let uploadResult;
    try {
      uploadResult = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async (contextSpec) => {
          const result = uploadData({
            path: fileKey,
            data: new Uint8Array(fileBuffer),
            options: {
              contentType: file.type,
            },
          });
          return await result.result;
        },
      });
      console.log('[uploadPhoto] S3 upload successful:', uploadResult.path);
    } catch (uploadError) {
      console.error('[uploadPhoto] S3 upload failed:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
    }

    // Get public URL
    let imageUrl;
    try {
      imageUrl = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async (contextSpec) => {
          const result = await getUrl({
            path: fileKey,
            options: {
              expiresIn: 31536000, // 1 year
            },
          });
          return result.url.toString();
        },
      });
      console.log('[uploadPhoto] Got URL:', imageUrl.substring(0, 50) + '...');
    } catch (urlError) {
      console.error('[uploadPhoto] Get URL failed:', urlError);
      throw new Error('Failed to get image URL');
    }

    // Create database entry
    let photoData;
    try {
      photoData = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async (contextSpec) => {
          const client = generateClient<Schema>({ authMode: 'userPool' });
          return await client.models.Photo.create({
            title,
            description: description || null,
            imageKey: fileKey,
            imageUrl: imageUrl,
            uploadedBy: user.userId,
            likeCount: 0,
          });
        },
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
    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const client = generateClient<Schema>({ authMode: 'userPool' });
        const { data: photos } = await client.models.Photo.list();

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
              const { data: like } = await client.models.PhotoLike.get({
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
      },
    });
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

    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const client = generateClient<Schema>({ authMode: 'userPool' });

        // Check if already liked
        const { data: existingLike } = await client.models.PhotoLike.get({
          photoId,
          userId: user.userId,
        });

        if (existingLike) {
          // Unlike
          await client.models.PhotoLike.delete({
            photoId,
            userId: user.userId,
          });

          // Decrement like count
          const { data: photo } = await client.models.Photo.get({ id: photoId });
          if (photo) {
            await client.models.Photo.update({
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
          await client.models.PhotoLike.create({
            photoId,
            userId: user.userId,
          });

          // Increment like count
          const { data: photo } = await client.models.Photo.get({ id: photoId });
          if (photo) {
            await client.models.Photo.update({
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
      },
    });
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

    return await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const client = generateClient<Schema>({ authMode: 'userPool' });

        // Get photo to get image key
        const { data: photo } = await client.models.Photo.get({ id: photoId });
        if (!photo) {
          return { success: false, error: 'Photo not found' };
        }

        // Delete from S3
        try {
          await remove({
            path: photo.imageKey,
          });
          console.log('[deletePhoto] S3 file deleted:', photo.imageKey);
        } catch (storageError) {
          console.error('[deletePhoto] S3 deletion failed:', storageError);
          // Continue even if S3 deletion fails - we still want to remove from DB
        }

        // Delete all likes first
        const { data: likes } = await client.models.PhotoLike.list({
          filter: { photoId: { eq: photoId } },
        });

        if (likes) {
          await Promise.all(
            likes.map((like) =>
              client.models.PhotoLike.delete({
                photoId: like.photoId,
                userId: like.userId,
              })
            )
          );
        }

        // Delete photo record
        await client.models.Photo.delete({ id: photoId });

        revalidatePath('/photography');
        revalidatePath('/admin/photos');

        return { success: true };
      },
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete photo',
    };
  }
}
