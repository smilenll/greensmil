'use client';

import { useState } from 'react';
import { PhotoLikeButton } from './photo-like-button';
import { togglePhotoLike } from '@/actions/photo-actions';
import { toast } from 'sonner';

interface PhotoDetailActionsProps {
  photoId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isAuthenticated: boolean;
}

export function PhotoDetailActions({
  photoId,
  initialLikeCount,
  initialIsLiked,
  isAuthenticated,
}: PhotoDetailActionsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like photos');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // Optimistic update
    const optimisticIsLiked = !isLiked;
    const optimisticLikeCount = optimisticIsLiked
      ? likeCount + 1
      : Math.max(0, likeCount - 1);

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(optimisticIsLiked);
    setLikeCount(optimisticLikeCount);

    // Call server action
    const response = await togglePhotoLike(photoId);

    if (response.status === 'success') {
      // Update with actual server response
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);
      toast.success(response.data.isLiked ? 'Photo liked!' : 'Photo unliked');
    } else {
      // Revert to original state on error
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
      toast.error(response.error || 'Failed to like photo');
    }

    setIsLoading(false);
  };

  return (
    <PhotoLikeButton
      photoId={photoId}
      likeCount={likeCount}
      isLiked={isLiked}
      isLoading={isLoading}
      isAuthenticated={isAuthenticated}
      onClick={handleLike}
    />
  );
}
