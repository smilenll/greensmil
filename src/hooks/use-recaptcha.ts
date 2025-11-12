'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  // Only disable if no site key is provided
  const isDisabled = !siteKey;

  useEffect(() => {
    if (isDisabled) {
      console.warn('reCAPTCHA disabled - no site key provided');
      setIsReady(true); // Mark as ready so forms work
      return;
    }
    
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(
      `script[src*="recaptcha/api.js"]`
    );

    if (existingScript) {
      // Script already loaded, check if grecaptcha is ready
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
        });
      }
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount if needed
      // Note: We keep it loaded since other components might use it
    };
  }, [siteKey, isDisabled]);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (isDisabled) {
      console.warn('reCAPTCHA disabled - no site key provided');
      return 'mock-token-for-development';
    }
    
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return null;
    }

    if (!isReady || !window.grecaptcha) {
      console.warn('reCAPTCHA not ready yet');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  };

  return {
    isReady,
    executeRecaptcha,
  };
}
