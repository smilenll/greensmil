import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth/server';
import outputs from './amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

// Define protected routes that require authentication
const protectedPaths = ['/admin', '/profile'];

// Define admin-only routes
const adminPaths = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files like .css, .js, .ico
  ) {
    return NextResponse.next();
  }

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    try {
      const authenticated = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async (contextSpec) => {
          try {
            const user = await getCurrentUser(contextSpec);

            // If this is an admin path, check for admin role
            if (isAdminPath && user) {
              const attributes = await fetchUserAttributes(contextSpec);
              const userGroups = attributes['cognito:groups'];

              if (typeof userGroups === 'string') {
                const groups = userGroups.split(',');
                return groups.includes('admin');
              }
              return false;
            }

            return !!user;
          } catch (error) {
            return false;
          }
        },
      });

      if (!authenticated) {
        // Redirect to home page if not authenticated
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Redirect to home on error
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};