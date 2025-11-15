import { Camera } from 'lucide-react';

export default function Loading() {
  return (
    <div className="pt-20 pb-16">
      {/* Header skeleton */}
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

      {/* Gallery skeleton */}
      <div className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden border">
                {/* Image skeleton */}
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                {/* Content skeleton */}
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 bg-muted animate-pulse rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
