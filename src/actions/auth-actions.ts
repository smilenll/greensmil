'use server';

import { deleteUser, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server';
import { ActionResponse, success, error } from '@/types/action-response';
import { AdminUpdateUserAttributesCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { cookies } from 'next/headers';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '../../amplify_outputs.json';

// Create server runner for Amplify server-side operations
const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

// Initialize Cognito client with admin credentials
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.COGNITO_ACCESS_KEY_ID!,
    secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY!,
  },
});

/**
 * Deletes the currently authenticated user's account
 * This action does NOT require admin privileges - users can delete their own accounts
 */
export async function deleteOwnAccount(): Promise<ActionResponse<void>> {
  try {
    // deleteUser works on the currently authenticated user
    await deleteUser();

    return success(undefined);
  } catch (err) {
    console.error('Error deleting account:', err);
    return error(err instanceof Error ? err.message : 'Failed to delete account');
  }
}

/**
 * Updates the preferred username for the current authenticated user
 * This is especially useful for Google OAuth users who don't have a username set initially
 */
export async function updatePreferredUsername(preferredUsername: string): Promise<ActionResponse<void>> {
  try {
    // Validate username format
    if (!preferredUsername || preferredUsername.trim().length < 3) {
      return error('Username must be at least 3 characters long');
    }

    // Get the current user's session using Amplify server context
    const result = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec);
        const attributes = await fetchUserAttributes(contextSpec);
        return {
          userId: session.userSub,
          currentUsername: attributes.preferred_username,
        };
      },
    });

    if (!result.userId) {
      return error('User not authenticated');
    }

    // Get User Pool ID from environment
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    if (!userPoolId) {
      return error('User pool configuration not found');
    }

    // Update the user attribute using Cognito Admin API
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: result.userId,
      UserAttributes: [
        {
          Name: 'preferred_username',
          Value: preferredUsername.trim(),
        },
      ],
    });

    await cognitoClient.send(command);

    return success(undefined);
  } catch (err) {
    console.error('Error updating preferred username:', err);
    return error(err instanceof Error ? err.message : 'Failed to update username');
  }
}

/**
 * Gets user information including OAuth provider details
 * Returns information about whether the user signed in with Google or regular Cognito
 */
export async function getUserInfo(): Promise<ActionResponse<{
  userId?: string;
  email?: string;
  emailVerified?: boolean;
  preferredUsername?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  isGoogleUser: boolean;
  provider: string;
}>> {
  try {
    const result = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec);
        const idToken = session.tokens?.idToken;

        if (!idToken) {
          throw new Error('User not authenticated');
        }

        const payload = idToken.payload;

        // Check if user signed in with Google OAuth
        // Google users have identities in the token
        const identities = payload.identities as Array<{
          providerName: string;
          providerType: string;
          userId: string;
        }> | undefined;

        const isGoogleUser = identities?.some(
          (identity) => identity.providerName === 'Google'
        ) || false;

        return {
          userId: payload.sub as string | undefined,
          email: payload.email as string | undefined,
          emailVerified: payload.email_verified as boolean | undefined,
          preferredUsername: payload.preferred_username as string | undefined,
          name: payload.name as string | undefined,
          givenName: payload.given_name as string | undefined,
          familyName: payload.family_name as string | undefined,
          picture: payload.picture as string | undefined,
          isGoogleUser,
          provider: isGoogleUser ? 'Google' : 'Cognito',
        };
      },
    });

    return success(result);
  } catch (err) {
    console.error('Error getting user info:', err);
    return error(err instanceof Error ? err.message : 'Failed to get user info');
  }
}
