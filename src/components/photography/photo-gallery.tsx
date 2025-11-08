'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { togglePhotoLike, type Photo } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { AmplifyImage } from './amplify-image';
import { toast } from 'sonner';

interface PhotoGalleryProps {
  photos: Photo[];
}

interface ImageDimensions {
  width: number;
  height: number;
}

export function PhotoGallery({ photos: initialPhotos }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [imageDimensions, setImageDimensions] = useState<Map<string, ImageDimensions>>(new Map());
  const { isAuthenticated } = useAuth();
  const initialPhotoIdsRef = useRef<string>(initialPhotos.map(p => p.id).sort().join(','));

  // Initialize loading state only once on mount
  const [loadingImages] = useState<Set<string>>(() => new Set(initialPhotos.map(p => p.id)));

  // Update photos state only when initialPhotos prop actually changes (new photos added/removed)
  useEffect(() => {
    const newIds = initialPhotos.map(p => p.id).sort().join(',');
    
    // Only update if photo IDs actually changed (not just likes)
    if (initialPhotoIdsRef.current !== newIds) {
      initialPhotoIdsRef.current = newIds;
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

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

  const handleImageLoad = useCallback((photoId: string, width?: number, height?: number) => {
    setLoadedImages(prev => {
      // Only update if not already loaded
      if (prev.has(photoId)) return prev;
      return new Set([...prev, photoId]);
    });
    
    // Store image dimensions if provided
    if (width && height) {
      setImageDimensions(prev => {
        if (prev.has(photoId)) return prev;
        const next = new Map(prev);
        next.set(photoId, { width, height });
        return next;
      });
    }
  }, []);

  const handleImageError = useCallback((photoId: string) => {
    setLoadedImages(prev => {
      // Mark as loaded (even if error) to prevent re-loading
      if (prev.has(photoId)) return prev;
      return new Set([...prev, photoId]);
    });
  }, []);

  return (
    <>
      <div className="flex flex-col gap-8 md:gap-12 max-w-4xl mx-auto">
        {photos.map((photo) => {
          // Only show loading if image hasn't been loaded yet
          const isLoading = !loadedImages.has(photo.id) && loadingImages.has(photo.id);
          const dimensions = imageDimensions.get(photo.id);
          const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;

          return (
            <div key={photo.id} className="photography-container flex flex-col w-full">
              {/* Image container */}
              <div className="relative w-full bg-muted">
                {dimensions && (
                  <div
                    className="relative w-full"
                    style={{
                      aspectRatio: aspectRatio.toString()
                    }}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <div className={`relative w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                      <AmplifyImage
                        imageKey={photo.imageKey}
                        alt={photo.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onLoad={(width, height) => handleImageLoad(photo.id, width, height)}
                        onError={() => handleImageError(photo.id)}
                      />
                    </div>
                  </div>
                )}
                {!dimensions && (
                  <div className="relative w-full" style={{ aspectRatio: '1', minHeight: '400px' }}>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <div className={`relative w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                      <AmplifyImage
                        imageKey={photo.imageKey}
                        alt={photo.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onLoad={(width, height) => handleImageLoad(photo.id, width, height)}
                        onError={() => handleImageError(photo.id)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Photo data container - title, description, likes */}
              <div className="flex flex-col gap-2 mt-4">
                <h3 className="text-sm md:text-base font-medium text-foreground">
                  {photo.title}
                </h3>
                {photo.description && (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {photo.description}
                  </p>
                )}
                
                {/* Like button */}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(photo.id)}
                    disabled={likingId === photo.id || !isAuthenticated}
                  >
                    {likingId === photo.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Heart
                          className={`h-4 w-4 mr-2 ${
                            photo.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        <span>{photo.likeCount}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
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
    </>
  );
}
