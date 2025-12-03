# Google OAuth Implementation Guide

## Overview

This document explains how Google OAuth authentication is integrated into the system and how it works alongside regular Cognito email/password authentication.

## Architecture & Data Flow

### 1. **User Signs in with Google**
```
User clicks "Continue with Google" → Redirected to Google → Google authenticates → Cognito receives OAuth response
```

### 2. **What Google Returns to Cognito**

When a user successfully authenticates with Google, Cognito automatically receives:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `email` | User's Google email | john.smith@gmail.com |
| `name` | Full name | John Smith |
| `given_name` | First name | John |
| `family_name` | Last name | Smith |
| `picture` | Profile picture URL | https://lh3.googleusercontent.com/... |
| `sub` | Google user ID (unique) | 1234567890 |
| `email_verified` | Email verification status | true |

### 3. **Cognito User Pool Creation**

Cognito **automatically creates or updates** a user in your User Pool with:
- Username format: `Google_{google-user-id}` (e.g., `Google_1234567890`)
- Email: from Google
- Email verified: automatically set to `true`
- **`preferredUsername`: NOT SET** ⚠️ This is our custom attribute that Google doesn't provide

### 4. **The Problem: Missing `preferredUsername`**

Your system requires `preferredUsername` for displaying usernames throughout the app. Google OAuth users don't have this attribute set automatically, so we need to handle it.

## Implementation Strategy

### Phase 1: Local Development (Sandbox)

**Current State:**
- ✅ Google OAuth is commented out in `amplify/auth/resource.ts`
- ✅ Sandbox deploys successfully with email/password auth only
- ✅ Google sign-in button is present in UI (won't work locally - expected behavior)

**Why?**
- Amplify Gen2 sandbox doesn't fully support external OAuth providers
- Google OAuth requires production infrastructure (Cognito User Pool Domain)
- Local development uses email/password auth for testing

### Phase 2: Production Deployment

Google OAuth will be enabled **only in production**. Here's the complete flow:

#### Step 1: Deploy to Production

1. **Uncomment Google OAuth** in `amplify/auth/resource.ts`:
```typescript
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile', 'openid'],
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
  // ... rest of config
});
```

2. **Deploy with secrets**:
```bash
npx ampx pipeline-deploy \
  --branch main \
  --app-id d22ytonhmq8rvo \
  --secret GOOGLE_CLIENT_ID=your-google-client-id \
  --secret GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> **Note:** Replace `your-google-client-id` and `your-google-client-secret` with your actual Google OAuth credentials from `.env` file.

3. **Get Cognito Domain URL** from Amplify Console:
   - Navigate to: Amplify Console → Your App → Backend → Authentication
   - Look for: "User Pool Domain" or "Hosted UI Domain"
   - Format: `https://<domain-prefix>.auth.us-east-2.amazoncognito.com`

4. **Update Google OAuth Config**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit your OAuth 2.0 Client ID
   - Add to "Authorized redirect URIs":
     ```
     https://<your-cognito-domain>.auth.us-east-2.amazoncognito.com/oauth2/idpresponse
     ```

#### Step 2: Handle `preferredUsername` for Google Users

**Where the mapping happens: In your application code after authentication**

The flow:

```
1. User signs in with Google
   ↓
2. Cognito creates user (email, name, picture set automatically)
   ↓
3. User redirected to /auth/callback
   ↓
4. Auth context detects sign-in (signInWithRedirect event)
   ↓
5. checkUser() fetches user attributes
   ↓
6. IF preferredUsername is missing → Prompt user to set it
   ↓
7. Call updatePreferredUsername() server action
   ↓
8. Username saved to Cognito via Admin API
   ↓
9. Google user now has same attributes as regular users
```

### Monitoring & Testing

#### 1. **Check if User is from Google**

Use the `getUserInfo()` server action (already created in `src/actions/auth-actions.ts`):

```typescript
import { getUserInfo } from '@/actions/auth-actions';

const result = await getUserInfo();
if (result.success && result.data) {
  console.log('Provider:', result.data.provider); // "Google" or "Cognito"
  console.log('Is Google User:', result.data.isGoogleUser); // true/false
  console.log('User Data:', result.data);
  // Output for Google user:
  // {
  //   userId: "us-east-2:abc123...",
  //   email: "john.smith@gmail.com",
  //   emailVerified: true,
  //   preferredUsername: undefined, // ← Will be missing on first login
  //   name: "John Smith",
  //   givenName: "John",
  //   familyName: "Smith",
  //   picture: "https://lh3.googleusercontent.com/...",
  //   isGoogleUser: true,
  //   provider: "Google"
  // }
}
```

#### 2. **Set Username for Google Users**

Use the `updatePreferredUsername()` server action:

```typescript
import { updatePreferredUsername } from '@/actions/auth-actions';

// Option A: Auto-generate from name or email
const username = user.givenName || user.email.split('@')[0];
const result = await updatePreferredUsername(username);

// Option B: Prompt user to choose their own username
const result = await updatePreferredUsername(userInputValue);

if (result.success) {
  // Username set successfully
  // Refresh user data in auth context
  await checkUser();
}
```

#### 3. **Where to Add Username Prompt**

**Recommended: In the Auth Context after OAuth callback**

Update `src/contexts/auth-context.tsx`:

```typescript
async function checkUser() {
  try {
    setLoading(true);
    const currentUser = await getCurrentUser();
    const attributes = await fetchUserAttributes();

    // ... existing code to set user data ...

    // Check if user is missing preferredUsername (new Google user)
    if (!attributes.preferred_username) {
      // Get user info to check if they're a Google user
      const userInfo = await getUserInfo();
      if (userInfo.success && userInfo.data?.isGoogleUser) {
        // Set a flag or trigger username prompt modal
        setNeedsUsername(true);
        // Auto-generate username suggestion from Google name
        const suggestedUsername = userInfo.data.givenName ||
                                 userInfo.data.email?.split('@')[0] ||
                                 'user';
        setSuggestedUsername(suggestedUsername);
      }
    }
  } catch (err) {
    // ... error handling ...
  }
}
```

## Monitoring in Production

### CloudWatch Logs

Monitor Google OAuth flow in AWS CloudWatch:

1. **User Pool Events**:
   - Log Group: `/aws/cognito/userpools/<user-pool-id>`
   - Events to watch:
     - `PreSignUp_ExternalProvider` - New Google user signing up
     - `TokenRefresh_Authentication` - User session being refreshed
     - `PostAuthentication_Authentication` - Successful login

2. **Application Logs**:
   ```typescript
   // Add logging in your auth actions
   console.log('[Google OAuth] User signed in:', {
     provider: userInfo.data.provider,
     hasUsername: !!userInfo.data.preferredUsername,
     email: userInfo.data.email
   });
   ```

### Cognito User Pool Console

Monitor users in AWS Console:
- Navigate to: Cognito → User Pools → Your Pool → Users
- Google users identifiable by:
  - Username format: `Google_{id}`
  - "Identities" attribute will show Google provider

## Data Consistency

**Google Users vs Regular Users - Same Structure:**

| Attribute | Regular User | Google User (After Setup) |
|-----------|--------------|---------------------------|
| email | ✅ Set during signup | ✅ From Google |
| email_verified | ✅ Via verification code | ✅ Automatic (true) |
| preferredUsername | ✅ Set during signup | ✅ Set via `updatePreferredUsername()` |
| User Groups | ✅ Same | ✅ Same |
| Permissions | ✅ Same | ✅ Same |

**Result:** Google users are **functionally identical** to regular users once `preferredUsername` is set.

## Testing Checklist

### Before Production Deployment

- [  ] Google OAuth credentials configured in Google Cloud Console
- [  ] Callback URLs include both localhost and production domain
- [  ] Google OAuth config uncommented in `amplify/auth/resource.ts`
- [  ] Secrets set via `pipeline-deploy` command

### After Production Deployment

- [  ] Cognito User Pool Domain URL retrieved
- [  ] Cognito domain added to Google OAuth authorized redirect URIs
- [  ] Test Google sign-in flow works
- [  ] New Google user created in Cognito User Pool
- [  ] User prompted to set `preferredUsername`
- [  ] Username saved successfully
- [  ] User can access app with same permissions as regular users
- [  ] User profile displays correctly
- [  ] Sign out and sign back in works

### Monitor for Issues

- [  ] Check CloudWatch logs for authentication errors
- [  ] Monitor Cognito User Pool for new Google users
- [  ] Verify all Google users have `preferredUsername` set
- [  ] Test username prompt UI/UX flow

## Security Considerations

1. **Secrets Management:**
   - Google OAuth secrets stored in AWS Systems Manager Parameter Store
   - Never commit secrets to git
   - Secrets accessible only via `secret()` function in backend

2. **User Verification:**
   - Google users automatically have verified emails
   - No need for email verification flow
   - Still enforce username requirements

3. **Admin API Access:**
   - `updatePreferredUsername()` uses Cognito Admin API
   - Requires IAM credentials with `cognito-idp:AdminUpdateUserAttributes` permission
   - Credentials stored in environment variables (COGNITO_ACCESS_KEY_ID, COGNITO_SECRET_ACCESS_KEY)

## Troubleshooting

### Issue: Google Sign-in Button Doesn't Work Locally
**Expected behavior** - Google OAuth only works in production. Use email/password auth for local development.

### Issue: "preferredUsername is undefined" for Google Users
**Solution:** User hasn't set their username yet. Prompt them using the username setup flow.

### Issue: "Failed to update username"
**Check:**
1. COGNITO_ACCESS_KEY_ID and COGNITO_SECRET_ACCESS_KEY in environment variables
2. IAM user has correct permissions
3. User is authenticated (session exists)

### Issue: Redirect URI mismatch error from Google
**Solution:** Ensure all callback URLs are added to Google OAuth config:
- `http://localhost:3000/auth/callback`
- `https://greensmil.com/auth/callback`
- `https://<cognito-domain>.auth.us-east-2.amazoncognito.com/oauth2/idpresponse`

## Summary

**Key Points:**
1. ✅ Google OAuth users are stored in the same Cognito User Pool as regular users
2. ✅ Google provides: email, name, picture (all auto-mapped)
3. ✅ Custom attribute `preferredUsername` must be set programmatically
4. ✅ Use `getUserInfo()` to check if user is from Google
5. ✅ Use `updatePreferredUsername()` to set username
6. ✅ After username is set, Google users are identical to regular users
7. ✅ Monitor via CloudWatch logs and Cognito console

**Next Steps:**
1. Add username prompt UI component for new Google users
2. Integrate username setup into auth flow
3. Deploy to production with Google OAuth enabled
4. Test complete flow and monitor user creation
