import { notFound } from 'next/navigation';
import { getPhotoById, getPhotoAIAnalysis } from '@/actions/photo-actions';
import { getCommentsByPhotoId } from '@/actions/comment-actions';
import { PictureFrame } from '@/components/photography/picture-frame';
import { PhotoDetailActions } from '@/components/photography/photo-detail-actions';
import { PhotoAIReport } from '@/components/photography/photo-ai-report';
import { PhotoAIAnalysisButton } from '@/components/photography/photo-ai-analysis-button';
import { PhotoComments } from '@/components/photography/photo-comments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeHtml } from '@/components/ui/safe-html';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth-server';

interface PhotoPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { photoId } = await params;

  const response = await getPhotoById(photoId);
  if (response.status === 'unauthorized') {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 lg:px-6">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Authentication Required</CardTitle>
              <CardDescription className="text-center">
                Please sign in to view this photo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/photography">Back to Gallery</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (response.status === 'error') {
    notFound();
  }

  const photo = response.data;

  // Get user info for admin check and comments
  let isAdmin = false;
  let currentUserId: string | undefined;
  try {
    const user = await requireAuth();
    isAdmin = user.groups?.includes('admin') || false;
    currentUserId = user.userId;
  } catch {
    // Not admin or not authenticated
  }

  // Get AI analysis if available
  const aiAnalysisResponse = await getPhotoAIAnalysis(photoId);
  const aiAnalysis = aiAnalysisResponse.status === 'success' ? aiAnalysisResponse.data : null;

  // Get comments for the photo
  const commentsResponse = await getCommentsByPhotoId(photoId);
  const initialComments = commentsResponse.status === 'success' ? commentsResponse.data.comments : [];

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
              <SafeHtml
                html={photo.description}
                className="text-base text-muted-foreground"
              />
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <PhotoDetailActions
                photoId={photo.id}
                initialLikeCount={photo.likeCount}
                initialIsLiked={photo.isLikedByCurrentUser || false}
                isAuthenticated={true}
              />
               <PhotoAIAnalysisButton
                  photoId={photo.id}
                  isAnalyzed={!!photo.aiReports && photo.aiReports.length > 0}
                  isAdmin={isAdmin}
                />
            </div>
          </div>

          {/* AI Analysis Report */}
          {aiAnalysis && (
            <div className="mt-8 w-full max-w-4xl">
              <PhotoAIReport analysis={aiAnalysis} />
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8 w-full max-w-4xl">
            <PhotoComments
              photoId={photo.id}
              initialComments={initialComments}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
