# Amplify Configuration Notes

## ⚠️ IMPORTANT: Production Pool Configuration

**Current Setup (DO NOT CHANGE until ready for sandbox):**

This project is currently configured to use the **PRODUCTION Cognito User Pool** for local development.

### Current Configuration:
- **User Pool ID**: `us-east-2_NpbKvoIJO` (PRODUCTION)
- **App Client ID**: `g9f6up71005psnb01kprhlkq1` (GreenSmil)
- **Google OAuth**: Configured on production pool
- **Admin Group**: Configured on production pool

### Why Production Pool?
- Google OAuth is fully configured on the production pool
- Managed login/hosted UI is set up on production pool
- Admin groups and users are managed in production pool
- Simpler to use production pool until sandbox environment is needed

### When Switching to Sandbox:
When you're ready to introduce a local sandbox environment, you'll need to:

1. **Create/Configure Sandbox Pool**: `us-east-2_1Mn7yhbsC`
2. **Set up Google OAuth** on sandbox pool with:
   - Google Cloud Console credentials
   - Cognito domain
   - Managed login style
   - Callback URLs
3. **Create admin group** on sandbox pool
4. **Add users** to sandbox pool admin group
5. **Update** `amplify_outputs.json` to use sandbox pool ID

### Files That Reference Pool Configuration:
- `/amplify_outputs.json` - Main configuration file
- `/src/lib/auth-server.ts` - Server-side auth utilities
- `/src/middleware.ts` - Admin route protection

---

**Last Updated**: December 2025
**Configured For**: Production Pool (PRODUCTION)
