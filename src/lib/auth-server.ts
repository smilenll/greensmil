import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth/server';
import outputs from '../../amplify_outputs.json';

const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export interface ServerUser {
  userId: string;
  username: string;
  attributes?: Record<string, string | undefined>;
  groups?: string[];
}

/**
 * Get the authenticated user on the server side
 * Use this in API routes and server actions
 */
export async function getAuthenticatedUser(): Promise<ServerUser | null> {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        try {
          return await getCurrentUser(contextSpec);
        } catch (authError: unknown) {
          // Handle authentication errors gracefully
          if (authError instanceof Error &&
              (authError.name === 'UserUnAuthenticatedException' ||
               authError.message?.includes('User needs to be authenticated'))) {
            return null;
          }
          throw authError;
        }
      },
    });

    if (!user) return null;

    // Get groups from JWT token
    const groups = await getUserGroups();

    return {
      userId: user.userId,
      username: user.username,
      groups
    };
  } catch (error) {
    console.error('Server auth error:', error);
    return null;
  }
}

/**
 * Get user attributes on the server side
 */
export async function getAuthenticatedUserWithAttributes(): Promise<ServerUser | null> {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        try {
          const currentUser = await getCurrentUser(contextSpec);
          if (!currentUser) return null;

          const attributes = await fetchUserAttributes(contextSpec);

          return {
            userId: currentUser.userId,
            username: currentUser.username,
            attributes
          };
        } catch (authError: unknown) {
          // Handle authentication errors gracefully
          if (authError instanceof Error &&
              (authError.name === 'UserUnAuthenticatedException' ||
               authError.message?.includes('User needs to be authenticated'))) {
            return null;
          }
          throw authError;
        }
      },
    });

    return user;
  } catch (error) {
    console.error('Server auth with attributes error:', error);
    return null;
  }
}

/**
 * Get user groups from JWT token
 * This is the recommended Amplify Gen 2 approach - groups are in the token!
 */
export async function getUserGroups(): Promise<string[]> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        return await fetchAuthSession(contextSpec);
      },
    });

    // Groups are available in the access token payload as 'cognito:groups'
    const groups = session?.tokens?.accessToken?.payload['cognito:groups'];

    if (Array.isArray(groups)) {
      return groups as string[];
    }

    return [];
  } catch (error) {
    console.error('Get groups error:', error);
    return [];
  }
}

/**
 * Check if user has a specific role/group
 * Uses JWT token claims (recommended Amplify Gen 2 approach)
 */
export async function userHasRole(role: string): Promise<boolean> {
  try {
    const groups = await getUserGroups();
    return groups.includes(role);
  } catch (error) {
    console.error('Role check error:', error);
    return false;
  }
}

/**
 * Require authentication for server actions/API routes
 * Throws error if user is not authenticated
 */
export async function requireAuth(): Promise<ServerUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require specific role for server actions/API routes
 * Throws error if user doesn't have the required role
 */
export async function requireRole(role: string): Promise<ServerUser> {
  const user = await requireAuth();
  const hasRole = await userHasRole(role);

  if (!hasRole) {
    throw new Error(`Role '${role}' required`);
  }

  return user;
}

/**
 * Require specific role for server components (pages/layouts)
 * Automatically redirects to specified path if user doesn't have the required role
 * This is more elegant than try-catch blocks in components
 */
export async function requireRoleOrRedirect(
  role: string,
  redirectPath = '/'
): Promise<ServerUser> {
  const user = await getAuthenticatedUser();

  if (!user || !(await userHasRole(role))) {
    const { redirect } = await import('next/navigation');
    redirect(redirectPath);
  }

  // TypeScript doesn't know redirect() never returns, so we assert user is non-null here
  return user!;
}
