import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';
import { photoAiAnalysis } from './functions/photo-ai-analysis/resource.js';
import { generateVerificationEmailTemplate, generatePasswordResetTemplate } from './cognito-templates.js';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  photoAiAnalysis,
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

// Configure CORS for S3 bucket
const { cfnBucket } = backend.storage.resources.cfnResources;
cfnBucket.corsConfiguration = {
  corsRules: [
    {
      allowedHeaders: ['*'],
      allowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
      allowedOrigins: ['*'],
      exposedHeaders: [
        'ETag',
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2',
      ],
      maxAge: 3000,
    },
  ],
};

// Grant photo AI analysis function access to S3 bucket
backend.photoAiAnalysis.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [`${backend.storage.resources.bucket.bucketArn}/*`],
  })
);

// Grant photo AI analysis function access to Bedrock (Claude)
// Use wildcard permissions to allow all regions and inference profiles
backend.photoAiAnalysis.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      // Allow all foundation models in any region
      'arn:aws:bedrock:*::foundation-model/*',
      // Allow all inference profiles in any region
      'arn:aws:bedrock:*:*:inference-profile/*',
    ],
  })
);

// Grant AWS Marketplace permissions for auto-enabling Bedrock models
// Required for first-time model access (one-time subscription)
backend.photoAiAnalysis.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['aws-marketplace:ViewSubscriptions', 'aws-marketplace:Subscribe'],
    resources: ['*'],
  })
);

// Export function name for Next.js to use
backend.addOutput({
  custom: {
    photoAiAnalysisFunctionName: backend.photoAiAnalysis.resources.lambda.functionName,
  },
});
