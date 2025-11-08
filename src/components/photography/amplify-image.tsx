'use client';

import Image from 'next/image';

interface AmplifyImageProps {
  imageKey: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: (width?: number, height?: number) => void;
  onError?: (error: any) => void;
}

export function AmplifyImage({ 
  imageKey, 
  alt, 
  fill, 
  className, 
  sizes, 
  onLoad, 
  onError 
}: AmplifyImageProps) {
  // Use proxy API route to avoid 431 errors from long signed URLs
  const imageUrl = `/api/images?key=${encodeURIComponent(imageKey)}`;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onLoad) {
      const img = e.currentTarget;
      onLoad(img.naturalWidth, img.naturalHeight);
    }
  };

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      unoptimized={true} // Bypass Next.js optimization, proxy already serves images
      onLoad={handleLoad}
      onError={onError}
    />
  );
}
