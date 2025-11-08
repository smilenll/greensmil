'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { uploadPhoto, type CreatePhotoInput } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';

// Validation schema
const photoFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  file: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, 'Photo is required')
    .refine((files) => files?.[0]?.type.startsWith('image/'), 'Only image files are allowed')
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, 'File must be less than 5MB'),
});

type PhotoFormData = z.infer<typeof photoFormSchema>;

export function PhotoUploadForm() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PhotoFormData>({
    resolver: zodResolver(photoFormSchema),
  });

  const fileList = watch('file');

  // Automatically update preview when file changes
  useEffect(() => {
    const file = fileList?.[0];

    if (!file) {
      setPreview(null);
      return;
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreview(newPreviewUrl);

    // Cleanup function runs when component unmounts or effect re-runs
    return () => {
      URL.revokeObjectURL(newPreviewUrl);
    };
  }, [fileList]);

  const handleRemove = () => {
    // Use setValue instead of reset to only clear the file field
    setValue('file', undefined as any);
  };

  const onSubmit = async (data: PhotoFormData) => {
    const file = data.file?.[0];
    if (!file) {
      toast.error('Please select a photo');
      return;
    }

    const input: CreatePhotoInput = {
      title: data.title.trim(),
      description: data.description?.trim(),
      file,
    };

    const result = await uploadPhoto(input);

    if (result.success) {
      toast.success('Photo uploaded successfully!');
      reset();
      // Consider state management
      router.refresh();
    } else {
      toast.error(result.error || 'Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          {...register('title')}
          placeholder="Enter photo title"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          {...register('description')}
          placeholder="Enter photo description (optional)"
          disabled={isSubmitting}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Photo *</label>

        {!preview ? (
          <label className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload photo</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            <input
              type="file"
              accept="image/*"
              {...register('file')}
              disabled={isSubmitting}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              width={800}
              height={400}
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSubmitting}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {errors.file && (
          <p className="text-sm text-red-600 mt-1">{errors.file.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </>
        )}
      </Button>
    </form>
  );
}
