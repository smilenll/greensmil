import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import amplifyConfig from '../amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
});

// Check if user is authenticated
async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        return await fetchAuthSession(contextSpec);
      },
    });

    return !!session?.tokens?.accessToken;
  } catch (error) {
    console.error('Middleware auth error:', error);
    return false;
  }
}

// Check if user has admin role from JWT token
async function hasAdminRole(): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        return await fetchAuthSession(contextSpec);
      },
    });

    const groups = session?.tokens?.accessToken?.payload['cognito:groups'];

    if (Array.isArray(groups)) {
      return groups.includes('admin');
    }

    return false;
  } catch (error) {
    console.error('Middleware auth error:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isAdmin = await hasAdminRole();

    if (!isAdmin) {
      // Return 404 to hide admin area existence
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }
  }

  // Check if the request is for photography page
  if (request.nextUrl.pathname.startsWith('/photography')) {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      // Redirect to sign in page
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/photography/:path*',
  ],
};
