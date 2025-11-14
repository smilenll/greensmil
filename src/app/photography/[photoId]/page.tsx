import { notFound } from 'next/navigation';
import { getPhotoById } from '@/actions/photo-actions';
import { PictureFrame } from '@/components/photography/picture-frame';
import { PhotoDetailActions } from '@/components/photography/photo-detail-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

interface PhotoPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  // Opt out of static generation - uses cookies for auth
  noStore();

  const { photoId } = await params;

  // Fetch photo (handles auth internally)
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
          <PictureFrame className="w-full max-w-4xl">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-auto"
            />
          </PictureFrame>

          <div className="flex flex-col gap-4 mt-8 p-6 w-full max-w-2xl shadow-2xl border rounded-lg bg-card">
            <h1 className="text-2xl font-bold">{photo.title}</h1>

            {photo.description && (
              <p className="text-base text-muted-foreground whitespace-pre-line">
                {photo.description}
              </p>
            )}

            <div className="flex items-center pt-2 border-t">
              <PhotoDetailActions
                photoId={photo.id}
                initialLikeCount={photo.likeCount}
                initialIsLiked={photo.isLikedByCurrentUser || false}
                isAuthenticated={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
