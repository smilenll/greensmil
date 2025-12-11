/**
 * Comment domain types
 * Uses Amplify-generated types as the source of truth with Zod validation for inputs
 */

import { z } from 'zod';
import type { Schema } from '../../amplify/data/resource';

// ============================================================================
// Database Model Types (from Amplify Schema)
// ============================================================================

/**
 * Comment model type from Amplify schema
 * Single source of truth for database structure
 */
export type CommentModel = Schema['Comment']['type'];

// ============================================================================
// Input Validation Schemas (Zod)
// ============================================================================

/**
 * Validation schema for creating a new comment
 */
export const createCommentSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
});

/**
 * Validation schema for updating a comment
 */
export const updateCommentSchema = z.object({
  id: z.string().min(1, 'Comment ID is required'),
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
});

// ============================================================================
// Response Validation Schemas (Zod)
// ============================================================================

/**
 * Schema for validating comment data from Amplify
 * Ensures data is properly shaped before returning to client
 */
export const commentResponseSchema = z.object({
  id: z.string(),
  photoId: z.string(),
  userId: z.string(),
  username: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// Input Types (inferred from Zod schemas)
// ============================================================================

/**
 * Input for creating a new comment
 * Type automatically inferred from Zod schema
 */
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/**
 * Input for updating an existing comment
 * Type automatically inferred from Zod schema
 */
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Comment entity for API responses
 */
export interface Comment {
  id: string;
  photoId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Response data for comment list queries
 */
export interface CommentsData {
  comments: Comment[];
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates and transforms raw comment data from Amplify into a safe Comment type
 *
 * @param data - Raw data from Amplify
 * @returns Validated Comment object safe to return to client
 * @throws ZodError if data doesn't match expected schema
 */
export function validateCommentResponse(data: unknown): Comment {
  return commentResponseSchema.parse(data);
}

/**
 * Safe version that returns a result object instead of throwing
 *
 * @param data - Raw data from Amplify
 * @returns { success: true, data: Comment } | { success: false, error: string }
 */
export function safeValidateCommentResponse(data: unknown):
  | { success: true; data: Comment }
  | { success: false; error: string } {
  const result = commentResponseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.errors[0]?.message || 'Invalid comment data'
  };
}
