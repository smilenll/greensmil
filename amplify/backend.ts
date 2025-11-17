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
// Use cross-region inference profile for on-demand access
backend.photoAiAnalysis.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      // Cross-region inference profile (required for on-demand access)
      'arn:aws:bedrock:us-east-2::foundation-model/us.anthropic.claude-3-haiku-20240307-v1:0',
      // Also allow direct model access as fallback
      'arn:aws:bedrock:us-east-2::foundation-model/anthropic.claude-3-haiku-20240307-v1:0',
      'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0',
    ],
  })
);

// Export function name for Next.js to use
backend.addOutput({
  custom: {
    photoAiAnalysisFunctionName: backend.photoAiAnalysis.resources.lambda.functionName,
  },
});
