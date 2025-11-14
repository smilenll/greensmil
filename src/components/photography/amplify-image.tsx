'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AmplifyImageProps {
  imageUrl: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  style?: React.CSSProperties;
  onLoad?: (width?: number, height?: number) => void;
  onError?: (error: any) => void;
}

export function AmplifyImage({
  imageUrl,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  style,
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
      <div className="flex items-center justify-center h-full w-full text-muted-foreground text-sm">
        Failed to load image
      </div>
    );
  }

  // When using fill, don't pass width/height
  const imageProps = fill
    ? {
        fill: true as const,
        sizes: sizes || '100vw',
      }
    : {
        width: width!,
        height: height!,
      };

  return (
    <Image
      src={imageUrl}
      alt={alt}
      {...imageProps}
      className={className}
      style={style}
      unoptimized={true} // Bypass Next.js optimization, proxy already serves images
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
