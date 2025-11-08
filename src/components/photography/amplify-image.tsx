'use client';

import Image from 'next/image';

interface AmplifyImageProps {
  imageKey: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

export function AmplifyImage({ imageKey, alt, fill, className, sizes }: AmplifyImageProps) {
  // Use proxy API route to avoid 431 errors from long signed URLs
  const imageUrl = `/api/images?key=${encodeURIComponent(imageKey)}`;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      unoptimized={false} // Enable Next.js image optimization
    />
  );
}
