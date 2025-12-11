/**
 * Photo domain types
 * Uses Amplify-generated types as the source of truth with Zod validation for inputs
 */

import { z } from 'zod';
import type { Schema } from '../../amplify/data/resource';

// ============================================================================
// Database Model Types (from Amplify Schema)
// ============================================================================

/**
 * Photo model type from Amplify schema
 * Single source of truth for database structure
 */
export type PhotoModel = Schema['Photo']['type'];

/**
 * PhotoAIReport model type from Amplify schema
 */
export type PhotoAIReportModel = Schema['PhotoAIReport']['type'];

/**
 * PhotoLike model type from Amplify schema
 */
export type PhotoLikeModel = Schema['PhotoLike']['type'];

// ============================================================================
// Input Validation Schemas (Zod)
// ============================================================================

/**
 * Validation schema for creating a new photo
 */
export const createPhotoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  file: z.instanceof(File, { message: 'File is required' })
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Only image files are allowed',
    }),
});

/**
 * Validation schema for updating a photo
 */
export const updatePhotoSchema = z.object({
  id: z.string().min(1, 'Photo ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  file: z.instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Only image files are allowed',
    })
    .optional(),
});

// ============================================================================
// Response Validation Schemas (Zod)
// ============================================================================

/**
 * Schema for validating photo data from Amplify
 * Ensures data is properly shaped before returning to client
 */
export const photoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional().transform(val => val ?? undefined),
  imageUrl: z.string(),
  imageKey: z.string(),
  likeCount: z.number().default(0),
  commentCount: z.number().optional().default(0),
  createdAt: z.string(),
  isLikedByCurrentUser: z.boolean().optional(),
  aiReports: z.array(z.object({
    id: z.string(),
    photoId: z.string(),
    compositionScore: z.number(),
    compositionRationale: z.string(),
    lightingScore: z.number(),
    lightingRationale: z.string(),
    subjectScore: z.number(),
    subjectRationale: z.string(),
    technicalScore: z.number(),
    technicalRationale: z.string(),
    creativityScore: z.number(),
    creativityRationale: z.string(),
    overallScore: z.number(),
    analyzedAt: z.string(),
    createdAt: z.string(),
  })).optional(),
});

// ============================================================================
// Input Types (inferred from Zod schemas)
// ============================================================================

/**
 * Input for creating a new photo
 * Type automatically inferred from Zod schema
 */
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;

/**
 * Input for updating an existing photo
 * Type automatically inferred from Zod schema
 */
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

// ============================================================================
// API Response Types (with computed/additional fields)
// ============================================================================

/**
 * AI analysis report with all score details
 * Used for displaying historical AI analysis data
 */
export interface PhotoAIReport {
  id: string;
  photoId: string;
  compositionScore: number;
  compositionRationale: string;
  lightingScore: number;
  lightingRationale: string;
  subjectScore: number;
  subjectRationale: string;
  technicalScore: number;
  technicalRationale: string;
  creativityScore: number;
  creativityRationale: string;
  overallScore: number;
  analyzedAt: string;
  createdAt: string | null;
}

/**
 * Photo entity with computed fields for API responses
 * Extends Amplify model with client-specific fields
 */
export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageKey: string;
  likeCount: number;
  commentCount?: number;
  createdAt: string;
  // Computed/additional fields not in database
  isLikedByCurrentUser?: boolean;
  aiReports?: PhotoAIReport[];
}

/**
 * Response data for photo list queries
 */
export interface PhotosData {
  photos: Photo[];
  isAuthenticated: boolean;
}

/**
 * Result of toggling a like on a photo
 */
export interface PhotoLikeResult {
  isLiked: boolean;
  likeCount: number;
}

// ============================================================================
// AI Analysis Types
// ============================================================================

/**
 * AI analysis category (composition, lighting, etc.)
 * Reusable structure for all analysis categories
 */
export interface AIAnalysisCategory {
  score: number;
  rationale: string;
}

/**
 * Complete AI analysis result for a photo
 * Contains scores and rationales for 5 categories plus overall score
 */
export interface PhotoAIAnalysis {
  composition: AIAnalysisCategory;
  lighting: AIAnalysisCategory;
  subject: AIAnalysisCategory;
  technical: AIAnalysisCategory;
  creativity: AIAnalysisCategory;
  overall: number;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates and transforms raw photo data from Amplify into a safe Photo type
 * Removes null values, provides defaults, and ensures type safety
 *
 * @param data - Raw data from Amplify (may have null values)
 * @returns Validated Photo object safe to return to client
 * @throws ZodError if data doesn't match expected schema
 */
export function validatePhotoResponse(data: unknown): Photo {
  return photoResponseSchema.parse(data);
}

/**
 * Safe version that returns a result object instead of throwing
 * Use this when you want to handle validation errors gracefully
 *
 * @param data - Raw data from Amplify
 * @returns { success: true, data: Photo } | { success: false, error: string }
 */
export function safeValidatePhotoResponse(data: unknown):
  | { success: true; data: Photo }
  | { success: false; error: string } {
  const result = photoResponseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.errors[0]?.message || 'Invalid photo data'
  };
}
