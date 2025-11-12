import imageCompression from 'browser-image-compression';

/**
 * Client-side image optimization configuration
 * - Resize to max 10 megapixels
 * - High quality compression
 * - Preserve EXIF data (GPS, camera info)
 */
const MAX_MEGAPIXELS = 10; // 10 million pixels
const QUALITY = 0.9; // 90% quality

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Calculate max width/height to fit within max megapixels
 */
function calculateMaxDimension(maxMegapixels: number): number {
  // For square: width * height = megapixels * 1,000,000
  // So: width = height = sqrt(megapixels * 1,000,000)
  return Math.floor(Math.sqrt(maxMegapixels * 1000000));
}

/**
 * Optimize image on the client side (browser)
 * - Resizes to max 10MP
 * - Compresses with high quality
 * - Preserves EXIF metadata (GPS, camera info)
 *
 * @param file - Original image file
 * @param onProgress - Optional progress callback (0-100)
 */
export async function optimizeImageClient(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OptimizedImageResult> {
  const originalSize = file.size;

  try {
    const maxDimension = calculateMaxDimension(MAX_MEGAPIXELS);

    const options = {
      maxSizeMB: 10, // Max file size in MB (safety limit)
      maxWidthOrHeight: maxDimension, // Max dimension to achieve ~10MP
      quality: QUALITY,
      useWebWorker: true, // Use web worker for better performance
      preserveExif: true, // Preserve EXIF data (GPS, camera, date)
      onProgress: onProgress ? (progress: number) => onProgress(Math.round(progress)) : undefined,
    };

    // Compress/optimize the image
    const compressedFile = await imageCompression(file, options);

    // Get dimensions of compressed image
    const dimensions = await getImageDimensions(compressedFile);

    const optimizedSize = compressedFile.size;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

    console.log(
      '[ClientOptimizer] Optimized:',
      `${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`,
      `(${compressionRatio.toFixed(1)}% reduction)`,
      `${dimensions.width}x${dimensions.height}px`
    );

    return {
      file: compressedFile,
      originalSize,
      optimizedSize,
      compressionRatio,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    console.error('[ClientOptimizer] Error:', error);
    throw new Error(
      `Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get image dimensions from a file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
