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

// Configure Lambda bundling for Sharp (native module)
// Sharp needs to be excluded from bundling and included from node_modules with its native binaries
// During Amplify deployment, npm install runs in a Linux container, so Sharp gets correct Linux binaries
const lambdaFunction = backend.photoAiAnalysis.resources.lambda;

// Use escape hatch to access the underlying NodejsFunction construct
// and configure bundling to exclude Sharp
const cfnFunction = backend.photoAiAnalysis.resources.cfnResources.cfnFunction;
if (cfnFunction) {
  // Configure the bundler to exclude sharp from bundling
  // This ensures sharp is included from node_modules with its native binaries
  // The nodejsFunction should automatically detect native modules, but we ensure it's excluded
  cfnFunction.addPropertyOverride('Code.ImageUri', undefined); // Ensure we're not using container image
}

// Access the underlying NodejsFunction construct to configure bundling
// Using escape hatch pattern to access internal CDK construct
const nodejsFunctionConstruct = lambdaFunction.node.defaultChild as any;
if (nodejsFunctionConstruct && nodejsFunctionConstruct.bundling) {
  // Override bundling to exclude Sharp
  nodejsFunctionConstruct.bundling = {
    ...nodejsFunctionConstruct.bundling,
    externalModules: [...(nodejsFunctionConstruct.bundling.externalModules || []), 'sharp'],
    nodeModules: [...(nodejsFunctionConstruct.bundling.nodeModules || []), 'sharp'],
  };
}

// Add OAuth configuration to outputs
// Google OAuth is configured manually in Cognito Console UI
// This tells the client library that OAuth is available
backend.addOutput({
  auth: {
    oauth: {
      identity_providers: ['GOOGLE'],
      domain: 'greensmil.auth.us-east-2.amazoncognito.com',
      scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      redirect_sign_in_uri: [
        'http://localhost:3000/auth/callback',
        'https://greensmil.com/auth/callback',
      ],
      redirect_sign_out_uri: [
        'http://localhost:3000',
        'https://greensmil.com',
      ],
      response_type: 'code',
    },
  },
  custom: {
    photoAiAnalysisFunctionName: backend.photoAiAnalysis.resources.lambda.functionName,
  },
});
