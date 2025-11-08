'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { uploadPhoto } from '@/actions/photo-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';

export function PhotoUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate
    if (!selectedFile.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File must be less than 5MB' });
      return;
    }

    // Set file and create preview
    setFile(selectedFile);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !file) {
      setMessage({ type: 'error', text: 'Please provide a title and select a photo' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('file', file);

    const result = await uploadPhoto(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview(null);
      // Refresh the page to show the new photo
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Upload failed' });
    }

    setIsUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter photo title"
          disabled={isUploading}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter photo description (optional)"
          disabled={isUploading}
          rows={3}
        />
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
              onChange={handleFileSelect}
              disabled={isUploading}
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
              disabled={isUploading}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isUploading || !file || !title.trim()}
        className="w-full"
      >
        {isUploading ? (
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
