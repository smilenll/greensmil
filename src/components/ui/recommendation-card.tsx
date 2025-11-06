'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface RecommendationCardProps {
  name: string;
  title: string;
  relationship: string;
  date: string;
  text: string;
}

export function RecommendationCard({ name, title, relationship, date, text }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  return (
    <div className="bg-muted/30 p-6 rounded-lg">
      <div className="flex flex-col mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {relationship} • {date}
        </p>
      </div>
      <div
        ref={textRef}
        className={`text-muted-foreground text-sm whitespace-pre-line leading-relaxed ${
          isExpanded ? '' : 'line-clamp-4'
        }`}
      >
        {text}
      </div>
      {isTruncated && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary hover:text-primary/80"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
}
