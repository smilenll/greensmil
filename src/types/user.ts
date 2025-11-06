export interface User {
  userId: string;
  username: string;
  email?: string;
  emailVerified: boolean;
  enabled: boolean;
  userStatus: string;
  userCreateDate: string;
  userLastModifiedDate: string;
  attributes: Record<string, string>;
  groups?: string[];
}

export interface PaginatedUsersResult {
  users: User[];
  nextToken?: string;
  hasMore: boolean;
  totalFetched: number;
}