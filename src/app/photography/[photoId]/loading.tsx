import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Loading() {
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

        {/* Photo content skeleton */}
        <div className="flex flex-col items-center">
          {/* Image skeleton with picture frame */}
          <div className="w-full max-w-4xl">
            <div className="relative w-full">
              {/* Simulate picture frame with padding and border */}
              <div className="p-4 md:p-6 lg:p-8 bg-card border rounded-lg shadow-lg">
                <div className="aspect-[4/3] bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Details skeleton */}
          <div className="flex flex-col gap-4 mt-8 p-6 w-full max-w-2xl shadow-2xl border rounded-lg bg-card">
            {/* Title skeleton */}
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center pt-2 border-t">
              <div className="h-10 bg-muted animate-pulse rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
