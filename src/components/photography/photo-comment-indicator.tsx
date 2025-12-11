'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoCommentIndicatorProps {
  commentCount: number;
  size?: 'sm' | 'default';
  className?: string;
}

export function PhotoCommentIndicator({
  commentCount,
  size = 'default',
  className,
}: PhotoCommentIndicatorProps) {
  return (
    <Button
      variant="link"
      size="sm"
      className={cn(
        'flex items-center gap-2 has-[>svg]:px-0 pointer-events-none',
        className
      )}
      tabIndex={-1}
    >
      <MessageSquare
        className={cn(
          'transition-all text-muted-foreground',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
        )}
      />
      <span className={cn(
        'text-muted-foreground',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
      </span>
    </Button>
  );
}
