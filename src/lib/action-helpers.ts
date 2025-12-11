/**
 * Reusable helper functions for server actions
 * Handles auth checks early and bubbles errors to reduce try/catch blocks
 */

import { requireAuth, requireRole, getAuthenticatedUserWithAttributes, type ServerUser } from '@/lib/auth-server';
import { ActionResponse, success, error, unauthorized } from '@/types/action-response';

/**
 * Wrapper for actions that require authentication
 * Catches auth errors early and returns ActionResponse
 *
 * @example
 * export async function getPhotos() {
 *   return withAuth(async (user) => {
 *     const photos = await fetchPhotos(user.userId);
 *     return success(photos);
 *   });
 * }
 */
export async function withAuth<T>(
  handler: (user: ServerUser) => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    const user = await getAuthenticatedUserWithAttributes();
    if (!user) {
      return unauthorized('Authentication required');
    }
    return await handler(user);
  } catch (err) {
    // Auth error caught early - no need for try/catch in handler
    if (err instanceof Error && (err.message.includes('Authentication required') || err.message.includes('not authenticated'))) {
      return unauthorized('Authentication required');
    }
    return error(err instanceof Error ? err.message : 'Authentication failed');
  }
}

/**
 * Wrapper for actions that require a specific role
 * Catches auth errors early and returns ActionResponse
 *
 * @example
 * export async function deleteUser(username: string) {
 *   return withRole('admin', async (user) => {
 *     await performDelete(username);
 *     return success(undefined);
 *   });
 * }
 */
export async function withRole<T>(
  role: 'admin' | 'user',
  handler: (user: ServerUser) => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    const user = await requireRole(role);
    return await handler(user);
  } catch (err) {
    // Auth error caught early
    if (err instanceof Error) {
      if (err.message.includes('Authentication required') || err.message.includes('not authenticated')) {
        return unauthorized('Authentication required');
      }
      if (err.message.includes('Unauthorized') || err.message.includes('not authorized') || err.message.includes('Admin access required') || err.message.includes('Role')) {
        return unauthorized(`${role.charAt(0).toUpperCase() + role.slice(1)} access required`);
      }
    }
    return error(err instanceof Error ? err.message : 'Authorization failed');
  }
}

/**
 * Wrapper for safe execution with automatic error handling
 * Use for operations that don't need auth but need error handling
 *
 * @example
 * export async function getPublicData() {
 *   return safeExecute(async () => {
 *     const data = await fetchData();
 *     return success(data);
 *   });
 * }
 */
export async function safeExecute<T>(
  handler: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    return await handler();
  } catch (err) {
    console.error('Safe execute error:', err);
    return error(err instanceof Error ? err.message : 'Operation failed');
  }
}

/**
 * Helper to validate required parameters
 * Throws error if any parameter is missing or invalid
 */
export function validateParams(params: Record<string, unknown>, required: string[]): void {
  for (const field of required) {
    if (!params[field]) {
      throw new Error(`Missing required parameter: ${field}`);
    }
  }
}

/**
 * Helper to handle void operations (delete, update, etc.)
 * Automatically wraps void operations in ActionResponse
 */
export async function voidOperation(
  operation: () => Promise<void>
): Promise<ActionResponse<void>> {
  try {
    await operation();
    return success(undefined);
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Operation failed');
  }
}
