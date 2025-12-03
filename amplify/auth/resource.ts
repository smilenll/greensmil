import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * GOOGLE OAUTH: For production deployment, uncomment the externalProviders section below
 * and set secrets using: npx ampx pipeline-deploy --secret GOOGLE_CLIENT_ID=... --secret GOOGLE_CLIENT_SECRET=...
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // Google OAuth will be configured manually in Cognito Console after deployment
    // This avoids the complexity of backend secrets for initial deployment
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
