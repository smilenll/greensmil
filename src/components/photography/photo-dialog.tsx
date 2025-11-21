'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SafeHtml } from '@/components/ui/safe-html';
import { Heart } from 'lucide-react';
import type { Photo } from '@/actions/photo-actions';
import { PictureFrame } from './picture-frame';

interface PhotoDialogProps {
  photo: Photo | null;
  onClose: () => void;
  onLike: (photoId: string) => void;
  likingId: string | null;
  isAuthenticated: boolean;
}

export function PhotoDialog({ photo, onClose, onLike, likingId, isAuthenticated }: PhotoDialogProps) {
  return (
    <Dialog open={!!photo} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-full md:!max-w-[60vw] max-h-[95vh] p-0 md:pt-12 overflow-y-scroll">
        {photo && (
          <div className="flex flex-col items-center dark-scrollbar">
            {/* Image */}
            <PictureFrame className="w-full">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-auto"
              />
            </PictureFrame>
            {/* Content */}
            <div className="flex flex-col gap-4 mt-4 md:mt-8 p-4 md:p-6 w-full md:w-2/3 md:shadow-2xl md:border">
              <DialogTitle className="text-lg md:text-xl">{photo.title}</DialogTitle>

              {photo.description && (
                <SafeHtml
                  html={photo.description}
                  className="text-sm md:text-base text-muted-foreground"
                />
              )}

              {/* Likes */}
              <div className="flex items-center pt-2 md:pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(photo.id);
                  }}
                  disabled={likingId === photo.id || !isAuthenticated}
                  className="flex items-center gap-2 p-0"
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
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
