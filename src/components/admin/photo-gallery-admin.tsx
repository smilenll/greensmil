"use client";

import { useState, useEffect } from "react";
import { type Photo } from "@/actions/photo-actions";
import { PhotoCard } from "@/components/photography/photo-card";
import { useRouter } from "next/navigation";

interface PhotoGalleryAdminProps {
  photos: Photo[];
}

export function PhotoGalleryAdmin({ photos }: PhotoGalleryAdminProps) {
  const router = useRouter();
  const [localPhotos, setLocalPhotos] = useState(photos);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(
    new Set(photos.map((p) => p.id))
  );

  // Update local state when props change (after upload/refresh)
  useEffect(() => {
    setLocalPhotos(photos);
    // Mark all new photos as loading
    setLoadingImages(new Set(photos.map((p) => p.id)));
  }, [photos]);

  const handleImageLoad = (photoId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
  };

  const handleImageError = (photoId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
  };

  const handleCardClick = (photoId: string) => {
    router.push(`/admin/photos/${photoId}`);
  };

  if (localPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos uploaded yet. Use the &quot;Upload Photos&quot; page to add your first
        photo!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {localPhotos.map((photo) => {
        const isLoading = loadingImages.has(photo.id);

        return (
          <div
            key={photo.id}
            onClick={() => handleCardClick(photo.id)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <PhotoCard
              photo={photo}
              isLoading={isLoading}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
            />
          </div>
        );
      })}
    </div>
  );
}
