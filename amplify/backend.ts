import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import { generateVerificationEmailTemplate, generatePasswordResetTemplate } from '../src/lib/email/cognito-templates.js';

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Customize email templates
const { cfnUserPool } = backend.auth.resources.cfnResources;

// Email verification template
cfnUserPool.verificationMessageTemplate = {
  defaultEmailOption: 'CONFIRM_WITH_CODE',
  emailSubject: 'Welcome to Greensmil - Verify Your Email',
  emailMessage: generateVerificationEmailTemplate(),
};

// Password reset email template (used for forgot password flow)
cfnUserPool.emailVerificationMessage = generatePasswordResetTemplate();
cfnUserPool.emailVerificationSubject = 'Reset Your Greensmil Password';
