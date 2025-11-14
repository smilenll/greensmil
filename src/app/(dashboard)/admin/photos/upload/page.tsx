import { PhotoUploadForm } from '@/components/admin/photo-upload-form';

// This page is mostly static (just a form), so we can cache it
export const revalidate = 300; // 5 minutes

export default function AdminPhotosUploadPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header - Static */}
      <div>
        <h1 className="text-3xl font-bold">Upload Photos</h1>
        <p className="text-gray-600 mt-2">Upload new photos to the gallery</p>
      </div>

      {/* Upload Form - Static (client component handles interactivity) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Upload New Photo</h2>
        <PhotoUploadForm />
      </div>
    </div>
  );
}

