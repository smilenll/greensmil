'use client';

import { useState, useEffect } from 'react';
import { deletePhoto, type Photo } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { AmplifyImage } from '@/components/photography/amplify-image';
import { toast } from 'sonner';

interface PhotoGalleryAdminProps {
  photos: Photo[];
}

export function PhotoGalleryAdmin({ photos }: PhotoGalleryAdminProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localPhotos, setLocalPhotos] = useState(photos);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set(photos.map(p => p.id)));

  // Update local state when props change (after upload/refresh)
  useEffect(() => {
    setLocalPhotos(photos);
    // Mark all new photos as loading
    setLoadingImages(new Set(photos.map(p => p.id)));
  }, [photos]);

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingId(photoId);
    const result = await deletePhoto(photoId);

    if (result.success) {
      setLocalPhotos(localPhotos.filter((p) => p.id !== photoId));
      toast.success('Photo deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete photo');
    }

    setDeletingId(null);
  };

  const handleImageLoad = (photoId: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
  };

  const handleImageError = (photoId: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
  };

  if (localPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos uploaded yet. Use the "Upload Photos" page to add your first photo!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {localPhotos.map((photo) => {
        const isLoading = loadingImages.has(photo.id);
        
        return (
          <Card key={photo.id} className="flex flex-col overflow-hidden">
            {/* Image */}
            <div className="relative w-full aspect-square bg-muted overflow-hidden">
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
                  onLoad={() => handleImageLoad(photo.id)}
                  onError={() => handleImageError(photo.id)}
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
            <CardFooter className="flex items-center justify-between gap-4 mt-auto border-t pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Heart className="h-4 w-4" />
                <span>{photo.likeCount} likes</span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="flex-shrink-0"
              >
                {deletingId === photo.id ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
