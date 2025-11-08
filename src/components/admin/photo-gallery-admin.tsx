'use client';

import { useState, useEffect } from 'react';
import { deletePhoto, type Photo } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import { AmplifyImage } from '@/components/photography/amplify-image';

interface PhotoGalleryAdminProps {
  photos: Photo[];
}

export function PhotoGalleryAdmin({ photos }: PhotoGalleryAdminProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localPhotos, setLocalPhotos] = useState(photos);

  // Update local state when props change (after upload/refresh)
  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingId(photoId);
    const result = await deletePhoto(photoId);

    if (result.success) {
      setLocalPhotos(localPhotos.filter((p) => p.id !== photoId));
    } else {
      alert(result.error || 'Failed to delete photo');
    }

    setDeletingId(null);
  };

  if (localPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos uploaded yet. Upload your first photo above!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {localPhotos.map((photo) => (
        <div
          key={photo.id}
          className="group relative bg-muted rounded-lg overflow-hidden"
        >
          <div className="aspect-square relative">
            <AmplifyImage
              imageKey={photo.imageKey}
              alt={photo.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
            <div>
              <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
              {photo.description && (
                <p className="text-white/80 text-sm mt-1 line-clamp-2">
                  {photo.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{photo.likeCount} likes</span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
              >
                {deletingId === photo.id ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Bar (always visible) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white text-sm font-medium truncate">{photo.title}</p>
            <div className="flex items-center space-x-2 text-white/70 text-xs mt-1">
              <Heart className="h-3 w-3" />
              <span>{photo.likeCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
