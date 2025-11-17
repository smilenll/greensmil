"use client";

import { useState, useEffect } from "react";
import { deletePhoto, updatePhoto, type Photo, type UpdatePhotoInput } from "@/actions/photo-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Trash2, Edit, MoreHorizontal, Sparkles } from "lucide-react";
import { PhotoCard } from "@/components/photography/photo-card";
import { toast } from "sonner";
import { PhotoLikeButton } from "../photography/photo-like-button";
import { PhotoAIAnalysisButton } from "../photography/photo-ai-analysis-button";

interface PhotoGalleryAdminProps {
  photos: Photo[];
}

export function PhotoGalleryAdmin({ photos }: PhotoGalleryAdminProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleEdit = (photoId: string) => {
    const photo = localPhotos.find(p => p.id === photoId);
    if (photo) {
      setEditingPhoto(photo);
    }
  };

  const handleUpdatePhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsUpdating(true);
    const response = await updatePhoto({
      id: editingPhoto.id,
      title: title.trim(),
      description: description.trim() || undefined,
    });

    if (response.status === 'success') {
      setLocalPhotos(localPhotos.map(p => 
        p.id === editingPhoto.id 
          ? { ...p, title: response.data.title, description: response.data.description }
          : p
      ));
      toast.success('Photo updated successfully');
      setEditingPhoto(null);
    } else {
      toast.error(response.error || 'Failed to update photo');
    }

    setIsUpdating(false);
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(photo.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div>
                        <PhotoAIAnalysisButton
                          photoId={photo.id}
                          isAnalyzed={photo.aiAnalyzed}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start font-normal h-8 px-2"
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(photo.id)}
                      disabled={deletingId === photo.id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingId === photo.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
          />
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={(open) => !open && setEditingPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePhoto} className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                name="title"
                defaultValue={editingPhoto?.title || ''}
                required
                disabled={isUpdating}
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingPhoto?.description || ''}
                rows={3}
                disabled={isUpdating}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPhoto(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
