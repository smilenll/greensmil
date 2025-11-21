"use client";

import { useState, useEffect } from "react";
import { updatePhoto, deletePhoto, type Photo } from "@/actions/photo-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { optimizeImageClient } from "@/lib/client-image-optimizer";
import Image from "next/image";
import { Loader2, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PhotoAIAnalysisButton } from "@/components/photography/photo-ai-analysis-button";

interface PhotoEditFormProps {
  photo: Photo;
  onSuccess: (updatedPhoto: Photo) => void;
}

export function PhotoEditForm({ photo, onSuccess }: PhotoEditFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setNewImageFile(null);
      setNewImagePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      toast.error('File must be less than 40MB');
      return;
    }

    setNewImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setNewImagePreview(previewUrl);
  };

  const handleRemoveNewImage = () => {
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  useEffect(() => {
    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [newImagePreview]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      let fileToUpload = newImageFile;

      if (newImageFile) {
        setIsOptimizing(true);
        setOptimizationProgress(0);

        const optimized = await optimizeImageClient(newImageFile, (progress) => {
          setOptimizationProgress(progress);
        });

        setIsOptimizing(false);
        toast.success(
          `Image optimized: ${(optimized.originalSize / 1024 / 1024).toFixed(1)}MB → ${(optimized.optimizedSize / 1024 / 1024).toFixed(1)}MB`
        );

        fileToUpload = optimized.file;
      }

      setIsUpdating(true);
      const response = await updatePhoto({
        id: photo.id,
        title: title.trim(),
        description: description.trim() || undefined,
        file: fileToUpload || undefined,
      });

      if (response.status === 'success') {
        toast.success('Photo updated successfully');
        onSuccess(response.data);
        handleRemoveNewImage();
        setOptimizationProgress(0);
        router.refresh();
      } else {
        toast.error(response.error || 'Failed to update photo');
      }

      setIsUpdating(false);
    } catch (error) {
      setIsOptimizing(false);
      setIsUpdating(false);
      setOptimizationProgress(0);
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const response = await deletePhoto(photo.id);

    if (response.status === 'success') {
      toast.success('Photo deleted successfully');
      router.push('/admin/photos');
      router.refresh();
    } else {
      toast.error(response.error || 'Failed to delete photo');
      setIsDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="text-sm font-medium">
            Title *
          </label>
          <Input
            id="title"
            name="title"
            defaultValue={photo.title}
            required
            disabled={isUpdating || isOptimizing}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            defaultValue={photo.description || ''}
            rows={4}
            disabled={isUpdating || isOptimizing}
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Replace Image (optional)
          </label>

          {/* Current Image */}
          {!newImagePreview && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Current image:</p>
              <div className="relative rounded-lg overflow-hidden border">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* Upload New Image */}
          {!newImagePreview ? (
            <label className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to upload a new photo
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 40MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUpdating || isOptimizing}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-lg overflow-hidden border">
              <Image
                src={newImagePreview}
                alt="New preview"
                width={600}
                height={400}
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveNewImage}
                disabled={isUpdating || isOptimizing}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                New image selected
              </div>
            </div>
          )}
        </div>

        {/* Optimization Progress */}
        {isOptimizing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Optimizing image... {optimizationProgress}%</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isUpdating || isOptimizing || isDeleting}
            className="flex-1"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing... {optimizationProgress}%
              </>
            ) : isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>

      {/* Secondary Actions */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-semibold">Actions</h3>

        <div className="flex flex-col gap-2">
          <PhotoAIAnalysisButton
            photoId={photo.id}
            isAnalyzed={photo.aiAnalyzed}
            variant="outline"
            size="default"
            className="w-full justify-start"
            isAdmin
          />

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating || isOptimizing}
            className="w-full justify-start"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Photo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
