import { getAllPhotos } from '@/actions/photo-actions';
import { PhotoUploadForm } from '@/components/admin/photo-upload-form';
import { PhotoGalleryAdmin } from '@/components/admin/photo-gallery-admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPhotosPage() {
  const photos = await getAllPhotos();

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Photo Gallery Management</h1>
        <p className="text-gray-600 mt-2">Upload and manage photography gallery</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Upload New Photo</h2>
        <PhotoUploadForm />
      </div>

      {/* Photo Gallery */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Uploaded Photos ({photos.length})</h2>
        <PhotoGalleryAdmin photos={photos} />
      </div>
    </div>
  );
}
