import { getAllPhotos } from '@/actions/photo-actions';
import { PhotoGalleryAdmin } from '@/components/admin/photo-gallery-admin';
import { Suspense } from 'react';

// Note: No revalidate needed - admin pages are dynamic by default (use cookies() in layout)

export default function AdminPhotosPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header - Static */}
      <div>
        <h1 className="text-3xl font-bold">Photo Gallery</h1>
        <p className="text-gray-600 mt-2">Manage your photography gallery</p>
      </div>

      {/* Photo Gallery - Dynamic */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
        <Suspense fallback={<PhotoGallerySkeleton />}>
          <PhotoGalleryServer />
        </Suspense>
      </div>
    </div>
  );
}

// Server component for photo gallery
async function PhotoGalleryServer() {
  const photos = await getAllPhotos();
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Uploaded Photos ({photos.length})</h2>
      <PhotoGalleryAdmin photos={photos} />
    </>
  );
}

// Loading skeleton for photo gallery
function PhotoGallerySkeleton() {
  return (
    <>
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </>
  );
}
