/**
 * Standard action response types for server actions
 *
 * These types ensure consistent error handling and auth state management
 * across all server actions, eliminating the need for noStore() in pages.
 */

/**
 * Generic action response type with discriminated unions for type safety
 */
export type ActionResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'unauthorized'; error: string; requiresAuth: true };

/**
 * Action result for operations with no return data (void operations)
 */
export type ActionResult = ActionResponse<void>;

/**
 * Helper function to create a success response
 */
export function success<T>(data: T): ActionResponse<T> {
  return { status: 'success', data };
}

/**
 * Helper function to create an error response
 */
export function error<T>(message: string): ActionResponse<T> {
  return { status: 'error', error: message };
}

/**
 * Helper function to create an unauthorized response
 */
export function unauthorized<T>(message: string = 'Authentication required'): ActionResponse<T> {
  return { status: 'unauthorized', error: message, requiresAuth: true };
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(response: ActionResponse<T>): response is { status: 'success'; data: T } {
  return response.status === 'success';
}

/**
 * Type guard to check if response is unauthorized
 */
export function isUnauthorized<T>(response: ActionResponse<T>): response is { status: 'unauthorized'; error: string; requiresAuth: true } {
  return response.status === 'unauthorized';
}

/**
 * Type guard to check if response is an error
 */
export function isError<T>(response: ActionResponse<T>): response is { status: 'error'; error: string } {
  return response.status === 'error';
}
