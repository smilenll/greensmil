'use client';

import { useState } from 'react';
import { togglePhotoLike, type Photo } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { PhotoCard } from './photo-card';
import { AmplifyImage } from './amplify-image';
import { toast } from 'sonner';

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos: initialPhotos }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set(initialPhotos.map(p => p.id)));
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { isAuthenticated } = useAuth();

  const handleLike = async (photoId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like photos');
      return;
    }

    setLikingId(photoId);

    const result = await togglePhotoLike(photoId);

    if (result.success) {
      setPhotos(
        photos.map((photo) =>
          photo.id === photoId
            ? {
                ...photo,
                isLikedByCurrentUser: result.isLiked,
                likeCount: result.likeCount,
              }
            : photo
        )
      );
      toast.success(result.isLiked ? 'Photo liked!' : 'Photo unliked');
    } else {
      toast.error('Failed to like photo');
    }

    setLikingId(null);
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

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => {
          const isLoading = loadingImages.has(photo.id);

          return (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isLoading={isLoading}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              onClick={() => setSelectedPhoto(photo)}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(photo.id);
                  }}
                  disabled={likingId === photo.id || !isAuthenticated}
                  className="flex items-center gap-2"
                >
                  <Heart
                    className={`h-4 w-4 transition-all ${
                      likingId === photo.id
                        ? 'fill-red-500 text-red-500 animate-pulse scale-110'
                        : photo.isLikedByCurrentUser
                        ? 'fill-red-500 text-red-500'
                        : ''
                    }`}
                  />
                  <span>{photo.likeCount} likes</span>
                </Button>
              }
            />
          );
        })}
      </div>

      {/* Sign in prompt for guests */}
      {!isAuthenticated && photos.length > 0 && (
        <div className="mt-8">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-center">Sign In to Like Photos</CardTitle>
              <CardDescription className="text-center">
                Sign in to like photos and see your favorites!
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Photo Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="!max-w-none w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden !bg-muted/50 dark:!bg-muted/30">
          <DialogTitle className="sr-only">{selectedPhoto?.title || 'Photo'}</DialogTitle>
          <div className="max-h-[90vh] overflow-y-auto px-8 py-8 dark-scrollbar">
            {selectedPhoto && (
              <Card className="border-0 shadow-none mt-4 mb-4">
                {/* Image */}
                <div className="relative w-full aspect-video bg-muted overflow-hidden rounded-t-lg">
                  <AmplifyImage
                    imageKey={selectedPhoto.imageKey}
                    alt={selectedPhoto.title}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>

                {/* Card Content */}
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedPhoto.title}</CardTitle>
                  {selectedPhoto.description && (
                    <CardDescription className="text-base mt-2">
                      {selectedPhoto.description}
                    </CardDescription>
                  )}

                  {/* Likes */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(selectedPhoto.id);
                      }}
                      disabled={likingId === selectedPhoto.id || !isAuthenticated}
                      className="flex items-center gap-2"
                    >
                      <Heart
                        className={`h-4 w-4 transition-all ${
                          likingId === selectedPhoto.id
                            ? 'fill-red-500 text-red-500 animate-pulse scale-110'
                            : selectedPhoto.isLikedByCurrentUser
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                      <span>{selectedPhoto.likeCount} likes</span>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
