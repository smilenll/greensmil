import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import amplifyConfig from '../amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
});

/**
 * Middleware for protecting admin routes
 * Only runs on /admin/* paths for optimal performance
 */
export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const session = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async (contextSpec) => fetchAuthSession(contextSpec),
      });

      const groups = session?.tokens?.accessToken?.payload['cognito:groups'] as string[] | undefined;
      const isAdmin = Array.isArray(groups) && groups.includes('admin');

      if (!isAdmin) {
        // Return 404 to hide admin area from non-admins
        return new NextResponse(null, { status: 404 });
      }
    } catch (error) {
      // Not authenticated - return 404
      console.error('Admin middleware auth error:', error);
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

// CRITICAL: Narrow matcher - only runs on admin routes for optimal performance
export const config = {
  matcher: '/admin/:path*',
};