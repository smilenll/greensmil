'use server';

import {
  CognitoIdentityProviderClient,
  ListGroupsCommand,
  CreateGroupCommand,
  DeleteGroupCommand,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../amplify_outputs.json';
import { ActionResponse, success, error } from '@/types/action-response';
import { withRole } from '@/lib/action-helpers';

import { Group } from '@/types/group';

// Legacy export for backward compatibility
export type CognitoGroup = Group;

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

export async function getGroups(): Promise<ActionResponse<Group[]>> {
  return withRole('admin', async () => {
    const client = createCognitoClient();

    const command = new ListGroupsCommand({
      UserPoolId: outputs.auth.user_pool_id,
    });

    const result = await client.send(command);

    const groups: Group[] = [];
    for (const group of result.Groups || []) {
      groups.push({
        groupName: group.GroupName || '',
        description: group.Description,
        userCount: 0, // Simplified for now
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

export async function addUserToGroupAction(username: string, groupName: string): Promise<ActionResponse<void>> {
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