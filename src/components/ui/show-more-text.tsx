'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShowMoreTextProps {
  children: string;
  lineClamp?: number;
  className?: string;
  buttonClassName?: string;
}

export function ShowMoreText({
  children,
  lineClamp = 4,
  className,
  buttonClassName,
}: ShowMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current && !isExpanded) {
        setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [children, isExpanded]);

  return (
    <div className={className}>
      <div
        ref={textRef}
        className={cn(
          'whitespace-pre-line leading-relaxed',
          !isExpanded && `line-clamp-${lineClamp}`
        )}
        style={!isExpanded ? { display: '-webkit-box', WebkitLineClamp: lineClamp, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
      >
        {children}
      </div>
      {isTruncated && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'mt-2 pl-0 text-primary hover:text-primary/80',
            buttonClassName
          )}
        >
          {isExpanded ? 'Show less...' : 'Show more...'}
        </Button>
      )}
    </div>
  );
}
