'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoLikeButtonProps {
  photoId: string;
  likeCount: number;
  isLiked: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'default';
  className?: string;
}

export function PhotoLikeButton({
  likeCount,
  isLiked,
  isLoading,
  isAuthenticated,
  onClick,
  size = 'default',
  className,
}: PhotoLikeButtonProps) {
  return (
    <Button
      variant="link"
      size="sm"
      onClick={onClick}
      disabled={isLoading || !isAuthenticated}
      className={cn(
        'flex items-center gap-2 has-[>svg]:px-0',
        className
      )}
    >
      <Heart
        className={cn(
          'transition-all',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          isLoading && 'fill-red-500 text-red-500 animate-pulse scale-110',
          !isLoading && isLiked && 'fill-red-500 text-red-500'
        )}
      />
      <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
        {likeCount} likes
      </span>
    </Button>
  );
}
