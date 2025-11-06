'use server';

import {
  CognitoIdentityProviderClient,
  ListGroupsCommand,
  CreateGroupCommand,
  DeleteGroupCommand,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../amplify_outputs.json';
import { requireRole } from '@/lib/auth-server';

import { Group } from '@/types/group';

// Legacy export for backward compatibility
export type CognitoGroup = Group;

export async function getGroups(): Promise<Group[]> {
  await requireRole('admin');

  try {

    const client = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
    });

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

    return groups;
  } catch (error) {
    console.error('Error getting groups:', error);
    throw new Error(`Failed to get groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createGroup(groupName: string, description?: string): Promise<void> {
  await requireRole('admin');

  try {

    const client = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
    });

    const command = new CreateGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      GroupName: groupName,
      Description: description
    });

    await client.send(command);
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error(`Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteGroup(groupName: string): Promise<void> {
  await requireRole('admin');

  try {

    const client = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
    });

    const command = new DeleteGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      GroupName: groupName
    });

    await client.send(command);
  } catch (error) {
    console.error('Error deleting group:', error);
    throw new Error(`Failed to delete group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function addUserToGroupAction(username: string, groupName: string): Promise<void> {
  await requireRole('admin');

  try {

    const client = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
    });

    const command = new AdminAddUserToGroupCommand({
      UserPoolId: outputs.auth.user_pool_id,
      Username: username,
      GroupName: groupName
    });

    await client.send(command);
  } catch (error) {
    console.error('Error adding user to group:', error);
    throw new Error(`Failed to add user to group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}