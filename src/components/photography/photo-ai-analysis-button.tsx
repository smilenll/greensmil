'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyzePhotoWithAI } from '@/actions/photo-actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Sparkles, Lock } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';

interface PhotoAIAnalysisButtonProps {
  photoId: string;
  isAnalyzed?: boolean;
  isAdmin?: boolean;
  onAnalysisComplete?: () => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  className?: string;
}

export function PhotoAIAnalysisButton({
  photoId,
  isAnalyzed,
  isAdmin = false,
  onAnalysisComplete,
  variant,
  size = 'sm',
  className,
}: PhotoAIAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

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

        // Refresh the page to show the AI report
        router.refresh();
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

  // Show disabled button with tooltip for non-admin users
  if (!isAdmin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled
              size={size}
              variant="outline"
              className={className}
            >
              <Lock className="h-4 w-4 mr-2" />
              AI Analysis
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI photo analysis is only available for admin users</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Show functional button for admin users
  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
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
