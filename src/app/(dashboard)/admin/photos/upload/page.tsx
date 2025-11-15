import { PhotoUploadForm } from '@/components/admin/photo-upload-form';

export default function AdminPhotosUploadPage() {
  // No noStore() needed - layout handles auth (forces dynamic)
  return (
    <div className="p-6 space-y-8">
      {/* Header - Static */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100">Upload Photos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Upload new photos to the gallery</p>
      </div>

      {/* Upload Form - Static (client component handles interactivity) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-gray-100 mb-4">Upload New Photo</h2>
        <PhotoUploadForm />
      </div>
    </div>
  );
}

