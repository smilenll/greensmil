import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Configure Cognito to use SES for email sending
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.emailConfiguration = {
  emailSendingAccount: 'DEVELOPER',
  sourceArn: `arn:aws:ses:us-east-2:${backend.auth.resources.userPool.stack.account}:identity/greensmil.com`,
};
