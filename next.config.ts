import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for AWS Amplify SSR support
  // Explicitly expose environment variables for AWS Amplify
  env: {
    COGNITO_ACCESS_KEY_ID: process.env.COGNITO_ACCESS_KEY_ID,
    COGNITO_SECRET_ACCESS_KEY: process.env.COGNITO_SECRET_ACCESS_KEY,
    COGNITO_REGION: process.env.COGNITO_REGION,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.amplifyapp.com',
      },
      {
        protocol: 'https',
        hostname: 'greensmil.com',
      },
      {
        protocol: 'https',
        hostname: 'www.greensmil.com',
      },
    ],
    // Image optimization settings for production
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
  async headers() {
    return [
      {
        source: '/api/images',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
