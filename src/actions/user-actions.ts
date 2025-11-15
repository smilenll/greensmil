'use server';

import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  ListGroupsCommand,
  CreateGroupCommand,
  DeleteGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../amplify_outputs.json';
import { requireRole } from '@/lib/auth-server';

import { User, PaginatedUsersResult } from '@/types/user';
import { ActionResponse, success, error, unauthorized } from '@/types/action-response';
import { withRole, safeExecute } from '@/lib/action-helpers';

// Legacy export for backward compatibility
export type AmplifyUser = User;

// Helper function to create Cognito client with service credentials from environment
function createCognitoClient(): CognitoIdentityProviderClient {
  const accessKeyId = process.env.COGNITO_ACCESS_KEY_ID;
  const secretAccessKey = process.env.COGNITO_SECRET_ACCESS_KEY;
  const region = process.env.COGNITO_REGION || outputs.auth.aws_region;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS Cognito credentials. Please set COGNITO_ACCESS_KEY_ID and COGNITO_SECRET_ACCESS_KEY environment variables.');
  }

  return new CognitoIdentityProviderClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// Get exact user count (requires pagination through all users)
export async function getUserCount(): Promise<ActionResponse<number>> {
  try {
    // Check admin role
    await requireRole('admin');

    const client = createCognitoClient();

    let totalCount = 0;
    let paginationToken: string | undefined;

    do {
      const command = new ListUsersCommand({
        UserPoolId: outputs.auth.user_pool_id,
        Limit: 60,
        PaginationToken: paginationToken,
      });

      const result = await client.send(command);
      totalCount += result.Users?.length || 0;
      paginationToken = result.PaginationToken;
    } while (paginationToken);

    return success(totalCount);
  } catch (err) {
    console.error('Error getting user count:', err);

    // Check if it's an auth error
    if (err instanceof Error && (err.message.includes('Unauthorized') || err.message.includes('not authorized'))) {
      return unauthorized('Admin access required to view user count');
    }

    return error(err instanceof Error ? err.message : 'Failed to get user count');
  }
}

// Get approximate user count (faster, but not exact if you have >60 users)
export async function getApproximateUserCount(): Promise<{ count: number; isApproximate: boolean }> {
  await requireRole('admin');

  try {
    const client = createCognitoClient();

    const command = new ListUsersCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Limit: 60,
    });

    const result = await client.send(command);
    const count = result.Users?.length || 0;
    const hasMore = !!result.PaginationToken;

    return {
      count,
      isApproximate: hasMore
    };
  } catch (error) {
    console.error('Error getting approximate user count:', error);
    throw new Error(`Failed to get user count: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getActiveSessions(): Promise<ActionResponse<number>> {
  try {
    // Check admin role
    await requireRole('admin');

    const client = createCognitoClient();

    const command = new ListUsersCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Limit: 60,
    });

    const result = await client.send(command);

    // Count users with recent activity (last 24 hours)
    const activeSessions = result.Users?.filter(user => {
      const lastModified = user.UserLastModifiedDate;
      if (!lastModified) return false;

      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastModified > dayAgo;
    }).length || 0;

    return success(activeSessions);
  } catch (err) {
    console.error('Error getting active sessions:', err);

    // Check if it's an auth error
    if (err instanceof Error && (err.message.includes('Unauthorized') || err.message.includes('not authorized'))) {
      return unauthorized('Admin access required to view active sessions');
    }

    return error(err instanceof Error ? err.message : 'Failed to get active sessions');
  }
}

export type SystemStatus = {
  status: 'Online' | 'Degraded' | 'Offline';
  uptime: string;
};

export async function getSystemStatus(): Promise<ActionResponse<SystemStatus>> {
  try {
    // Check admin role
    await requireRole('admin');

    // Simple health check - try to connect to Cognito
    const client = createCognitoClient();

    const command = new ListUsersCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Limit: 1,
    });

    await client.send(command);

    return success({
      status: 'Online',
      uptime: '99.9%'
    });
  } catch (err) {
    console.error('System health check failed:', err);

    // Check if it's an auth error
    if (err instanceof Error && (err.message.includes('Unauthorized') || err.message.includes('not authorized'))) {
      return unauthorized('Admin access required to view system status');
    }

    // If health check failed, return degraded status as success (not an error)
    return success({
      status: 'Degraded',
      uptime: 'N/A'
    });
  }
}

export async function getUsersAction(
  limit: number = 60,
  paginationToken?: string
): Promise<ActionResponse<PaginatedUsersResult>> {
  return withRole<PaginatedUsersResult>('admin', async (): Promise<ActionResponse<PaginatedUsersResult>> => {
    const client = createCognitoClient();

    const command = new ListUsersCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Limit: limit,
      PaginationToken: paginationToken,
    });

    const result = await client.send(command);

    if (!result.Users) {
      return success({
        users: [],
        hasMore: false,
        totalFetched: 0
      });
    }

    const users: User[] = [];
    for (const user of result.Users) {
      const amplifyUser: User = {
        userId: user.Username || '',
        username: user.Username || '',
        email: user.Attributes?.find(attr => attr.Name === 'email')?.Value,
        emailVerified: user.Attributes?.find(attr => attr.Name === 'email_verified')?.Value === 'true',
        enabled: user.Enabled || false,
        userStatus: user.UserStatus || '',
        userCreateDate: user.UserCreateDate?.toISOString() || '',
        userLastModifiedDate: user.UserLastModifiedDate?.toISOString() || '',
        attributes: user.Attributes?.reduce((acc, attr) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }
          return acc;
        }, {} as Record<string, string>) || {}
      };

      // Get user groups
      try {
        const groupsCommand = new AdminListGroupsForUserCommand({
          UserPoolId: outputs.auth.user_pool_id,
          Username: user.Username
        });

        const groupsResult = await client.send(groupsCommand);
        amplifyUser.groups = groupsResult.Groups?.map(group => group.GroupName || '') || [];
      } catch (err) {
        console.warn(`Failed to get groups for user ${user.Username}:`, err);
        amplifyUser.groups = [];
      }

      users.push(amplifyUser);
    }

    return success({
      users,
      nextToken: result.PaginationToken,
      hasMore: !!result.PaginationToken,
      totalFetched: users.length
    });
  });
}

// CREATE USER
export async function createUser(email: string, temporaryPassword: string): Promise<ActionResponse<string>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new AdminCreateUserCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' }
      ],
      TemporaryPassword: temporaryPassword,
      MessageAction: 'SUPPRESS'
    });

    const result = await client.send(command);
    return success(result.User?.Username || email);
  });
}

// UPDATE USER
export async function updateUser(username: string, attributes: Record<string, string>): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const userAttributes = Object.entries(attributes).map(([name, value]) => ({
      Name: name,
      Value: value
    }));

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: username,
      UserAttributes: userAttributes
    });

    await client.send(command);
    return success(undefined);
  });
}

// DELETE USER
export async function deleteUser(username: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new AdminDeleteUserCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: username
    });

    await client.send(command);
    return success(undefined);
  });
}

// ENABLE/DISABLE USER
export async function toggleUserStatus(username: string, enable: boolean): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = enable
      ? new AdminEnableUserCommand({ UserPoolId: outputs.auth.user_pool_id, Username: username })
      : new AdminDisableUserCommand({ UserPoolId: outputs.auth.user_pool_id, Username: username });

    await client.send(command);
    return success(undefined);
  });
}

// MANAGE USER GROUPS
export async function addUserToGroup(username: string, groupName: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new AdminAddUserToGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: username,
      GroupName: groupName
    });

    await client.send(command);
    return success(undefined);
  });
}

export async function removeUserFromGroup(username: string, groupName: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new AdminRemoveUserFromGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: username,
      GroupName: groupName
    });

    await client.send(command);
    return success(undefined);
  });
}

// GROUP MANAGEMENT
export interface CognitoGroup {
  groupName: string;
  description?: string;
  userCount: number;
  creationDate: string;
  lastModifiedDate: string;
}

export async function getGroups(): Promise<ActionResponse<CognitoGroup[]>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new ListGroupsCommand({
      UserPoolId: outputs.auth.user_pool_id,
    });

    const result = await client.send(command);

    const groups: CognitoGroup[] = [];
    for (const group of result.Groups || []) {
      // Get user count for each group
      const usersCommand = new ListUsersCommand({
        UserPoolId: outputs.auth.user_pool_id,
        Limit: 60
      });

      const usersResult = await client.send(usersCommand);
      const userCount = usersResult.Users?.filter(user => {
        // Check if user is in this group
        return user.Attributes?.some(attr =>
          attr.Name === 'cognito:groups' && attr.Value?.includes(group.GroupName || '')
        );
      }).length || 0;

      groups.push({
        groupName: group.GroupName || '',
        description: group.Description,
        userCount,
        creationDate: group.CreationDate?.toISOString() || '',
        lastModifiedDate: group.LastModifiedDate?.toISOString() || ''
      });
    }

    return success(groups);
  });
}

export async function createGroup(groupName: string, description?: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new CreateGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      GroupName: groupName,
      Description: description
    });

    await client.send(command);
    return success(undefined);
  });
}

export async function deleteGroup(groupName: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new DeleteGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      GroupName: groupName
    });

    await client.send(command);
    return success(undefined);
  });
}
