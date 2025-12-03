import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback route handler
 * This route handles redirects from external OAuth providers (Google, etc.)
 * After successful authentication, Cognito redirects here with auth tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // Handle OAuth error
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error_description || error)}`, request.url)
    );
  }

  // Handle successful OAuth (code is present)
  if (code) {
    // Amplify automatically handles the OAuth code exchange
    // Just redirect to home page, the auth context will update automatically
    return NextResponse.redirect(new URL('/', request.url));
  }

  // No code or error - shouldn't happen, but redirect to home
  return NextResponse.redirect(new URL('/', request.url));
}
