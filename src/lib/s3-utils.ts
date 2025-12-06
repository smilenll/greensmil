/**
 * S3 utility functions for file handling
 */

/**
 * Generate a safe S3 key for photo uploads
 * @param fileName - Original file name
 * @param prefix - S3 key prefix (e.g., 'photos')
 * @returns Safe S3 key with timestamp
 */
export function generatePhotoS3Key(fileName: string, prefix: string = 'photos'): string {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${prefix}/${timestamp}.${extension}`;
}
