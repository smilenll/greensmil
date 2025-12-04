'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { Loader2 } from 'lucide-react';

/**
 * OAuth callback page
 * This page handles redirects from external OAuth providers (Google, etc.)
 * Amplify automatically processes the OAuth code and stores the auth tokens
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    async function handleCallback() {
      // Check for OAuth errors in URL params
      const searchParams = new URLSearchParams(window.location.search);
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam);
        setTimeout(() => {
          router.push(`/?auth_error=${encodeURIComponent(errorDescription || errorParam)}`);
        }, 3000);
        return;
      }

      // Listen for Amplify auth events
      const unsubscribe = Hub.listen('auth', async (data) => {
        const { payload } = data;
        authEventReceived = true;

        if (payload.event === 'signInWithRedirect') {
          // Wait a moment for auth state to fully update
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (mounted) {
            router.push('/');
          }
        } else if (payload.event === 'signInWithRedirect_failure') {
          setError('Sign in failed. Please try again.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      });

      // Wait a bit for Amplify to process the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user is now authenticated
      try {
        const user = await getCurrentUser();

        if (user && mounted) {
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push('/');
          return;
        }
      } catch (err) {
        // Not authenticated yet, wait for the auth event
      }

      // Fallback: if no auth event received after 8 seconds, redirect anyway
      setTimeout(() => {
        if (mounted && !authEventReceived) {
          router.push('/');
        }
      }, 8000);

      return unsubscribe;
    }

    const cleanup = handleCallback();

    return () => {
      mounted = false;
      cleanup.then(unsub => unsub?.());
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
