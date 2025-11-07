import { ContentSection } from '@/components/sections';
import { Camera } from 'lucide-react';
import { getAllPhotos } from '@/actions/photo-actions';
import { PhotoGallery } from '@/components/photography/photo-gallery';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function PhotographyPage() {
  const photos = await getAllPhotos();

  return (
    <div className="pt-20 pb-16">
      <ContentSection title="Photography">
        <div className="max-w-6xl mx-auto">
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

          {/* Photo Gallery */}
          {photos.length > 0 ? (
            <PhotoGallery photos={photos} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
                <p className="text-muted-foreground">
                  I&apos;m currently curating my photography collection.
                  Check back soon to see my latest work!
                </p>
              </div>
            </div>
          )}
        </div>
      </ContentSection>
    </div>
  );
}
