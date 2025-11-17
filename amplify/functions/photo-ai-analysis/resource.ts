import { defineFunction } from '@aws-amplify/backend';

export const photoAiAnalysis = defineFunction({
  name: 'photo-ai-analysis',
  entry: './handler.ts',
  timeoutSeconds: 60, // Image analysis may take some time
  memoryMB: 512,
  environment: {
    AWS_REGION_OVERRIDE: 'us-east-2', // Override region for Bedrock access
  },
});
