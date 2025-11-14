'use client';

import { useState, useEffect } from 'react';
import { togglePhotoLike, type Photo } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
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

  // Sync selectedPhoto with photos array when it changes
  useEffect(() => {
    if (selectedPhoto) {
      const updatedPhoto = photos.find(p => p.id === selectedPhoto.id);
      if (updatedPhoto) {
        setSelectedPhoto(updatedPhoto);
      }
    }
  }, [photos, selectedPhoto]);

  const handleLike = async (photoId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like photos');
      return;
    }

    // Prevent multiple simultaneous likes on the same photo
    if (likingId === photoId) {
      console.log('[PhotoGallery] Already processing like for:', photoId);
      return;
    }

    setLikingId(photoId);

    // Capture current state BEFORE any updates
    const currentPhoto = photos.find(p => p.id === photoId);
    if (!currentPhoto) {
      console.error('[PhotoGallery] Photo not found:', photoId);
      setLikingId(null);
      return;
    }

    const originalIsLiked = currentPhoto.isLikedByCurrentUser;
    const originalLikeCount = currentPhoto.likeCount;

    // Optimistic update
    const optimisticIsLiked = !originalIsLiked;
    const optimisticLikeCount = optimisticIsLiked
      ? originalLikeCount + 1
      : Math.max(0, originalLikeCount - 1);

    console.log('[PhotoGallery] Optimistic update:', {
      photoId,
      originalIsLiked,
      originalLikeCount,
      optimisticIsLiked,
      optimisticLikeCount,
    });

    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              isLikedByCurrentUser: optimisticIsLiked,
              likeCount: optimisticLikeCount,
            }
          : photo
      )
    );

    // Call server action
    const result = await togglePhotoLike(photoId);
    console.log('[PhotoGallery] Server response:', result);

    if (result.success) {
      // Update with actual server response for accuracy
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
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
      // Revert to original state on error
      console.error('[PhotoGallery] Reverting to original state:', {
        originalIsLiked,
        originalLikeCount,
      });
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo.id === photoId
            ? {
                ...photo,
                isLikedByCurrentUser: originalIsLiked,
                likeCount: originalLikeCount,
              }
            : photo
        )
      );
      toast.error(result.error || 'Failed to like photo');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  className="flex items-center gap-1 p-0!"
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
      <PhotoDialog
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onLike={handleLike}
        likingId={likingId}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
