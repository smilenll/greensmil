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
    <Card className="flex flex-col overflow-hidden">
      {/* Image */}
      <div
        className={`relative w-full aspect-square bg-muted overflow-hidden ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={onClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
          <AmplifyImage
            imageKey={photo.imageKey}
            alt={photo.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => onImageLoad(photo.id)}
            onError={() => onImageError(photo.id)}
          />
        </div>
      </div>

      {/* Card Content */}
      <CardHeader className="flex-shrink-0">
        <CardTitle className="line-clamp-1">{photo.title}</CardTitle>
        {photo.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {photo.description}
          </CardDescription>
        )}
      </CardHeader>

      {/* Card Footer with Actions */}
      {actions && (
        <CardFooter className="flex items-center justify-between gap-4 mt-auto border-t pt-4">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}
