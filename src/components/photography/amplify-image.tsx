'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AmplifyImageProps {
  imageUrl: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: (width?: number, height?: number) => void;
  onError?: (error: any) => void;
}

export function AmplifyImage({
  imageUrl,
  alt,
  fill,
  className,
  sizes,
  onLoad,
  onError
}: AmplifyImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onLoad) {
      const img = e.currentTarget;
      onLoad(img.naturalWidth, img.naturalHeight);
    }
  };

  const handleError = (error: any) => {
    if (!hasError) {
      setHasError(true);
      console.error('[AmplifyImage] Failed to load:', imageUrl, error);
      if (onError) {
        onError(error);
      }
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
        Failed to load image
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      unoptimized={true} // Bypass Next.js optimization, proxy already serves images
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
