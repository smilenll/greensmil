'use client';

import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AmplifyImage } from './amplify-image';
import type { Photo } from '@/actions/photo-actions';

interface PhotoCardProps {
  photo: Photo;
  isLoading: boolean;
  onImageLoad: (photoId: string) => void;
  onImageError: (photoId: string) => void;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export function PhotoCard({ photo, isLoading, onImageLoad, onImageError, actions, onClick }: PhotoCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden py-0 gap-0 h-full">
      {/* Image */}
      <div
        className={`relative w-full aspect-4/3 bg-muted overflow-hidden rounded-t-lg ${onClick ? 'cursor-pointer group' : ''}`}
        onClick={onClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 h-full w-full`}>
          <AmplifyImage
            imageUrl={photo.imageUrl}
            alt={photo.title}
            fill
            className={`object-cover transition-transform duration-300 ${onClick ? 'group-hover:scale-105' : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => onImageLoad(photo.id)}
            onError={() => onImageError(photo.id)}
          />
        </div>
      </div>

      {/* Card Content */}
      <CardHeader
        className={`flex-1 px-4 py-4 flex flex-col justify-start ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <CardTitle className="line-clamp-1">{photo.title}</CardTitle>
        {photo.description && (
          <CardDescription className="line-clamp-4 mt-1.5">
            {photo.description}
          </CardDescription>
        )}
      </CardHeader>

      {/* Card Footer with Actions */}
      {actions && (
        <CardFooter className="border-t px-4 py-2">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}
