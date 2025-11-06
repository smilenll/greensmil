export const PAGINATION_LIMITS = {
  USERS: 60,
  GROUPS: 50,
} as const;

export const ERROR_MESSAGES = {
  USER_CREATE_FAILED: 'Failed to create user. Please try again.',
  USER_UPDATE_FAILED: 'Failed to update user. Please try again.',
  USER_DELETE_FAILED: 'Failed to delete user. Please try again.',
  GROUP_CREATE_FAILED: 'Failed to create group. Please try again.',
  GROUP_DELETE_FAILED: 'Failed to delete group. Please try again.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;