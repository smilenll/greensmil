import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * IMPORTANT: Google OAuth is configured manually in Cognito Console UI.
 * OAuth settings are added to amplify_outputs.json via backend.ts customization.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
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
