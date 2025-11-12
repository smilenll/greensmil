'use client';

import { useEffect, useState } from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-foreground"></div>
    </div>
  );
}

export function GlobalSplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const minDisplayTime = 500; // Show splash for at least 0.5 seconds

    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      // Wait for remaining time, then start fade out
      setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after fade animation completes
        setTimeout(() => {
          setShouldRender(false);
        }, 500); // Match transition duration
      }, remainingTime);
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-primary transition-opacity duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-foreground"></div>
    </div>
  );
}

export function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-primary-foreground">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
        <p className="text-red-300 mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}