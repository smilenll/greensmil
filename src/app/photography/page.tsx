import { ContentSection } from '@/components/sections';
import { Camera } from 'lucide-react';

export default function PhotographyPage() {
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

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards - replace with actual photos */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="group relative aspect-square bg-muted rounded-lg overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-center px-4">
                    Photo {item}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 text-center">
            <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
              <p className="text-muted-foreground">
                I&apos;m currently curating my photography collection.
                Check back soon to see my latest work!
              </p>
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
}
