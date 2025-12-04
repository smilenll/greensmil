'use client';

import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { useEffect } from 'react';

// Configure Amplify at module level (runs once when module loads)
Amplify.configure(outputs, { ssr: true });

export default function AmplifyClientConfig() {
  useEffect(() => {
    // Ensure Amplify is configured on client side
    // This is important for OAuth callback handling
    Amplify.configure(outputs, { ssr: true });
  }, []);

  return null;
}