import { defineFunction } from '@aws-amplify/backend';

export const photoAiAnalysis = defineFunction({
  name: 'photo-ai-analysis',
  entry: './handler.ts',
  timeoutSeconds: 60, // Image analysis may take some time
  memoryMB: 1024, // Increased memory for Sharp image processing
  environment: {
    AWS_REGION_OVERRIDE: 'us-east-2', // Override region for Bedrock access
  },
  // Bundling configuration for Sharp is handled in backend.ts
  // to ensure it's excluded from bundling and included from node_modules
});
