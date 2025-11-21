"use client";

import { type Photo } from "@/actions/photo-actions";
import { PhotoCard } from "@/components/photography/photo-card";
import { PhotoLikeButton } from "@/components/photography/photo-like-button";

interface PhotoPreviewProps {
  photo: Photo;
}

export function PhotoPreview({ photo }: PhotoPreviewProps) {
  return (
    <div className="border-2 border-dashed rounded-lg p-6 bg-muted/20">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        This is how your photo appears to users
      </p>
      <div className="max-w-md mx-auto">
        <PhotoCard
          photo={photo}
          isLoading={false}
          onImageLoad={() => {}}
          onImageError={() => {}}
          actions={
            <PhotoLikeButton
              photoId={photo.id}
              likeCount={photo.likeCount}
              isLiked={photo.isLikedByCurrentUser || false}
              isLoading={false}
              isAuthenticated={true}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              size="sm"
              className="gap-1"
            />
          }
        />
      </div>
    </div>
  );
}
