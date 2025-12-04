import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * IMPORTANT: Google OAuth credentials are configured manually in Cognito Console.
 * This configuration ensures OAuth settings are included in amplify_outputs.json
 * so the client library knows OAuth is available.
 *
 * The actual Google client ID/secret must be configured in Cognito Console:
 * User Pool → Social and external providers → Google
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        // Placeholder values - actual Google OAuth credentials configured in Cognito Console
        // This tells Amplify to include OAuth config in amplify_outputs.json
        clientId: 'configured-in-cognito-console',
        clientSecret: 'configured-in-cognito-console',
        scopes: ['email', 'openid', 'profile'],
        attributeMapping: {
          email: 'email',
          givenName: 'given_name',
          familyName: 'family_name',
          preferredUsername: 'name',
        },
      },
      callbackUrls: [
        'http://localhost:3000/auth/callback',
        'https://greensmil.com/auth/callback',
      ],
      logoutUrls: [
        'http://localhost:3000',
        'https://greensmil.com',
      ],
    },
  },
  groups: ['admin'],
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    // Standard Cognito attribute for display name
    // Users sign in with email only, but preferredUsername protects email privacy
    preferredUsername: {
      mutable: true,
      required: false, // Enforced as required at application level
    },
  },
});
