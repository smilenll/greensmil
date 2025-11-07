'use client';

import { useState } from 'react';
import Image from 'next/image';
import { togglePhotoLike, type Photo } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos: initialPhotos }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [likingId, setLikingId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const handleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to like photos');
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
    }

    setLikingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square bg-muted rounded-lg overflow-hidden hover:shadow-lg transition-all"
        >
          {/* Photo Image */}
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 z-10">
            <div>
              <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
              {photo.description && (
                <p className="text-white/80 text-sm mt-2 line-clamp-3">
                  {photo.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Heart
                  className={`h-5 w-5 ${
                    photo.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                <span className="text-sm">{photo.likeCount} likes</span>
              </div>

              <Button
                variant={photo.isLikedByCurrentUser ? 'default' : 'secondary'}
                size="sm"
                onClick={(e) => handleLike(photo.id, e)}
                disabled={likingId === photo.id || !isAuthenticated}
              >
                <Heart
                  className={`h-4 w-4 mr-1 ${
                    photo.isLikedByCurrentUser ? 'fill-current' : ''
                  }`}
                />
                {photo.isLikedByCurrentUser ? 'Liked' : 'Like'}
              </Button>
            </div>
          </div>

          {/* Like button (always visible on mobile) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                <div className="flex items-center space-x-2 text-white/70 text-xs mt-1">
                  <Heart
                    className={`h-3 w-3 ${
                      photo.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  <span>{photo.likeCount}</span>
                </div>
              </div>

              <button
                onClick={(e) => handleLike(photo.id, e)}
                disabled={likingId === photo.id || !isAuthenticated}
                className={`p-2 rounded-full transition-colors ${
                  photo.isLikedByCurrentUser
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${likingId === photo.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={photo.isLikedByCurrentUser ? 'Unlike photo' : 'Like photo'}
              >
                <Heart
                  className={`h-4 w-4 ${
                    photo.isLikedByCurrentUser ? 'fill-current' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Sign in prompt for guests */}
      {!isAuthenticated && photos.length > 0 && (
        <div className="col-span-full mt-8">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to like photos and see your favorites!
            </p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
