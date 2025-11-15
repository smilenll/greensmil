"use client";

import { useState, useEffect } from "react";
import { deletePhoto, type Photo } from "@/actions/photo-actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { PhotoCard } from "@/components/photography/photo-card";
import { toast } from "sonner";
import { PhotoLikeButton } from "../photography/photo-like-button";

interface PhotoGalleryAdminProps {
  photos: Photo[];
}

export function PhotoGalleryAdmin({ photos }: PhotoGalleryAdminProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setDeletingId(photoId);
    const response = await deletePhoto(photoId);

    if (response.status === 'success') {
      setLocalPhotos(localPhotos.filter((p) => p.id !== photoId));
      toast.success("Photo deleted successfully");
    } else {
      toast.error(response.error || "Failed to delete photo");
    }

    setDeletingId(null);
  };

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

  if (localPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No photos uploaded yet. Use the "Upload Photos" page to add your first
        photo!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {localPhotos.map((photo) => {
        const isLoading = loadingImages.has(photo.id);

        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isLoading={isLoading}
            onImageLoad={handleImageLoad}
            onImageError={handleImageError}
            actions={
              <div className={"flex w-full justify-between"}>
                <PhotoLikeButton
                  photoId={photo.id}
                  likeCount={photo.likeCount}
                  isLiked={photo.isLikedByCurrentUser || false}
                  isLoading={!!photo.id}
                  isAuthenticated={true}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.error("not implemented");
                  }}
                  size="sm"
                  className="gap-1"
                />

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
              </div>
            }
          />
        );
      })}
    </div>
  );
}
