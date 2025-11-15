'use server';

import { AmplifyClient, ListJobsCommand, GetJobCommand } from '@aws-sdk/client-amplify';
import { ActionResponse, success, error } from '@/types/action-response';
import { withRole } from '@/lib/action-helpers';

// Initialize Amplify client with credentials
const amplifyClient = new AmplifyClient({
  region: process.env.AWS_REGION || process.env.COGNITO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.COGNITO_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.COGNITO_SECRET_ACCESS_KEY || '',
  },
});

export interface DeploymentStatus {
  status: 'PENDING' | 'PROVISIONING' | 'RUNNING' | 'SUCCEED' | 'FAILED' | 'CANCELLED' | 'UNAVAILABLE';
  commitMessage?: string;
  commitId?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  branchName?: string;
  jobId?: string;
  buildUrl?: string;
}

/**
 * Get the latest deployment status from AWS Amplify
 * Requires admin role
 */
export async function getDeploymentStatus(): Promise<ActionResponse<DeploymentStatus>> {
  return withRole<DeploymentStatus>('admin', async (): Promise<ActionResponse<DeploymentStatus>> => {
    const appId = process.env.AMPLIFY_APP_ID;
    const branchName = process.env.AMPLIFY_BRANCH_NAME || 'main';

    if (!appId) {
      console.warn('AMPLIFY_APP_ID not set in environment variables');
      return success({ status: 'UNAVAILABLE' } as DeploymentStatus);
    }

    // List recent jobs for the branch
    const listJobsCommand = new ListJobsCommand({
      appId,
      branchName,
      maxResults: 1, // Get only the latest job
    });

    const jobsResponse = await amplifyClient.send(listJobsCommand);
    const latestJob = jobsResponse.jobSummaries?.[0];

    if (!latestJob) {
      return success({
        status: 'UNAVAILABLE',
        branchName,
      } as DeploymentStatus);
    }

    // Get detailed job information
    const getJobCommand = new GetJobCommand({
      appId,
      branchName,
      jobId: latestJob.jobId!,
    });

    const jobDetails = await amplifyClient.send(getJobCommand);
    const job = jobDetails.job;

    if (!job) {
      return success({ status: 'UNAVAILABLE' } as DeploymentStatus);
    }

    // Calculate duration if job is complete
    let duration: number | undefined;
    if (job.summary?.startTime && job.summary?.endTime) {
      duration = Math.floor(
        (new Date(job.summary.endTime).getTime() - new Date(job.summary.startTime).getTime()) / 1000
      );
    }

    // Build Amplify Console URL
    const buildUrl = `https://console.aws.amazon.com/amplify/home?region=${process.env.AWS_REGION || 'us-east-1'}#/${appId}/${branchName}/${job.summary?.jobId}`;

    return success({
      status: (job.summary?.status as DeploymentStatus['status']) || 'UNAVAILABLE',
      commitMessage: job.summary?.commitMessage,
      commitId: job.summary?.commitId?.substring(0, 7), // Short commit hash
      startTime: job.summary?.startTime ? new Date(job.summary.startTime) : undefined,
      endTime: job.summary?.endTime ? new Date(job.summary.endTime) : undefined,
      duration,
      branchName,
      jobId: job.summary?.jobId,
      buildUrl,
    });
  });
}

