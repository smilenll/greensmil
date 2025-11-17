'use client';

import { useState } from 'react';
import { analyzePhotoWithAI } from '@/actions/photo-actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';

interface PhotoAIAnalysisButtonProps {
  photoId: string;
  isAnalyzed?: boolean;
  onAnalysisComplete?: () => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  className?: string;
}

export function PhotoAIAnalysisButton({
  photoId,
  isAnalyzed,
  onAnalysisComplete,
  variant,
  size = 'sm',
  className,
}: PhotoAIAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setIsAnalyzing(true);

    try {
      const result = await analyzePhotoWithAI(photoId);

      if (result.status === 'success') {
        toast.success('Photo analyzed successfully!', {
          description: `Overall score: ${result.data.overall.toFixed(1)}/5`,
        });
        onAnalysisComplete?.();
      } else {
        toast.error('Analysis failed', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      variant={variant || (isAnalyzed ? 'outline' : 'default')}
      size={size}
      className={className}
    >
      {isAnalyzing ? (
        <>
          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          {isAnalyzed ? 'Re-analyze with AI' : 'Analyze with AI'}
        </>
      )}
    </Button>
  );
}
