import { Camera } from 'lucide-react';
import { getAllPhotos } from '@/actions/photo-actions';
import { PhotoGallery } from '@/components/photography/photo-gallery';
import { requireAuth } from '@/lib/auth-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

// PPR enabled - no force-dynamic needed!
// Static shell renders instantly, dynamic content streams in

export default function PhotographyPage() {
  return (
    <div className="pt-20 pb-16">
      {/* Header Section - Static (cached at CDN) */}
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Photography</h1>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Capturing moments and perspectives through the lens.
              A collection of my photographic work exploring light, composition, and storytelling.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Gallery - Dynamic (streams in based on auth) */}
      <Suspense fallback={<GallerySkeleton />}>
        <PhotoGalleryServer />
      </Suspense>
    </div>
  );
}

// Server component for dynamic gallery content
async function PhotoGalleryServer() {
  let isAuthenticated = false;
  try {
    await requireAuth();
    isAuthenticated = true;
  } catch {
    // User not authenticated
  }

  const photos = isAuthenticated ? await getAllPhotos() : [];

  return (
    <div className="pb-16">
      {!isAuthenticated ? (
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Authentication Required</CardTitle>
              <CardDescription className="text-center text-base">
                To view the photography gallery, you need to be signed in.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-center text-muted-foreground">
                Register for a free account or sign in to explore my collection of photographic work.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : photos.length > 0 ? (
        <PhotoGallery photos={photos} />
      ) : (
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
              <p className="text-muted-foreground">
                I&apos;m currently curating my photography collection.
                Check back soon to see my latest work!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading skeleton for gallery
function GallerySkeleton() {
  return (
    <div className="pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
