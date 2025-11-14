import { notFound } from 'next/navigation';
import { getPhotoById } from '@/actions/photo-actions';
import { PictureFrame } from '@/components/photography/picture-frame';
import { PhotoDetailActions } from '@/components/photography/photo-detail-actions';
import { requireAuth } from '@/lib/auth-server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PhotoPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  // Await params as per Next.js 15+
  const { photoId } = await params;

  // Check if user is authenticated
  let isAuthenticated = false;
  try {
    await requireAuth();
    isAuthenticated = true;
  } catch {
    // User not authenticated
  }

  const photo = await getPhotoById(photoId);

  if (!photo) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 lg:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/photography">
            <Button variant="ghost" size="sm" className="gap-2 pl-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>

        {/* Photo content */}
        <div className="flex flex-col items-center">
          {/* Image */}
          <PictureFrame className="w-full max-w-4xl">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-auto"
            />
          </PictureFrame>

          {/* Content */}
          <div className="flex flex-col gap-4 mt-8 p-6 w-full max-w-2xl shadow-2xl border rounded-lg bg-card">
            <h1 className="text-2xl font-bold">{photo.title}</h1>

            {photo.description && (
              <p className="text-base text-muted-foreground whitespace-pre-line">
                {photo.description}
              </p>
            )}

            {/* Likes */}
            <div className="flex items-center pt-2 border-t">
              <PhotoDetailActions
                photoId={photo.id}
                initialLikeCount={photo.likeCount}
                initialIsLiked={photo.isLikedByCurrentUser || false}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
