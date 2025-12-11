'use server';

import { revalidatePath } from 'next/cache';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import type { Schema } from '../../amplify/data/resource';
import { cookies } from 'next/headers';
import outputs from '../../amplify_outputs.json';
import { ActionResponse, success, error } from '@/types/action-response';
import { withAuth, withRole } from '@/lib/action-helpers';
import {
  type Comment,
  type CommentsData,
  type CreateCommentInput,
  createCommentSchema,
  validateCommentResponse,
} from '@/types/comment';

const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

/**
 * Create a new comment on a photo
 * Only authenticated users can create comments
 */
export async function createComment(input: CreateCommentInput): Promise<ActionResponse<Comment>> {
  return withAuth(async (user) => {
    // Validate input with Zod schema
    const validation = createCommentSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return error(firstError.message);
    }

    const { photoId, content } = validation.data;

    // Check if photo exists
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
    if (!photo) {
      return error('Photo not found');
    }

    // Create comment - use preferredUsername if available, fallback to email (split at @) or username
    let displayName = user.preferredUsername;

    if (!displayName && user.attributes?.email) {
      // Use email username part (before @) as fallback
      displayName = user.attributes.email.split('@')[0];
    }

    if (!displayName) {
      // Last resort: use Cognito username
      displayName = user.username;
    }

    const { data: commentData } = await cookieBasedClient.models.Comment.create({
      photoId,
      userId: user.userId,
      username: displayName,
      content,
    });

    if (!commentData) {
      return error('Failed to create comment');
    }

    console.log('[createComment] Comment created:', commentData.id);

    // Revalidate paths
    revalidatePath('/photography');
    revalidatePath(`/photography/${photoId}`);

    const validatedComment = validateCommentResponse(commentData);

    return success(validatedComment);
  });
}

/**
 * Get all comments for a specific photo
 * Only authenticated users can view comments
 */
export async function getCommentsByPhotoId(photoId: string): Promise<ActionResponse<CommentsData>> {
  return withAuth(async () => {
    // Verify photo exists
    const { data: photo } = await cookieBasedClient.models.Photo.get({ id: photoId });
    if (!photo) {
      return error('Photo not found');
    }

    // Get all comments for this photo
    const { data: comments } = await cookieBasedClient.models.Comment.list({
      filter: { photoId: { eq: photoId } },
    });

    if (!comments) {
      return success({ comments: [] });
    }

    // Sort comments by creation date (newest first)
    const sortedComments = comments
      .map(comment => validateCommentResponse(comment))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return success({ comments: sortedComments });
  });
}

/**
 * Delete a comment
 * Users can delete their own comments, admins can delete any comment
 */
export async function deleteComment(commentId: string): Promise<ActionResponse<void>> {
  return withAuth(async (user) => {
    // Get comment to check ownership
    const { data: comment } = await cookieBasedClient.models.Comment.get({ id: commentId });
    if (!comment) {
      return error('Comment not found');
    }

    // Check authorization: owner or admin
    const isOwner = comment.userId === user.userId;
    const isAdmin = user.groups.includes('admin');

    if (!isOwner && !isAdmin) {
      return error('You can only delete your own comments');
    }

    // Delete comment
    await cookieBasedClient.models.Comment.delete({ id: commentId });

    console.log(`[deleteComment] Comment deleted by ${isOwner ? 'owner' : 'admin'}:`, commentId);

    // Revalidate paths
    revalidatePath('/photography');
    revalidatePath(`/photography/${comment.photoId}`);

    return success(undefined);
  });
}

/**
 * Get comment count for a photo
 * Only authenticated users can view comment counts
 */
export async function getCommentCount(photoId: string): Promise<ActionResponse<number>> {
  return withAuth(async () => {
    const { data: comments } = await cookieBasedClient.models.Comment.list({
      filter: { photoId: { eq: photoId } },
    });

    return success(comments?.length || 0);
  });
}
