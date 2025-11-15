'use server';

import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { ActionResponse, success } from '@/types/action-response';
import { withRole } from '@/lib/action-helpers';

// Initialize CloudWatch client
const cloudWatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION || process.env.COGNITO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.COGNITO_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.COGNITO_SECRET_ACCESS_KEY || '',
  },
  requestHandler: {
    requestTimeout: 5000, // 5 second timeout
  },
});

export interface VisitorStats {
  totalVisits: number;
  period: string; // e.g., "Last 7 days"
}

/**
 * Get visitor statistics from AWS Amplify CloudWatch metrics
 * Requires admin role
 */
export async function getVisitorStats(): Promise<ActionResponse<VisitorStats>> {
  return withRole<VisitorStats>('admin', async (): Promise<ActionResponse<VisitorStats>> => {
    const appId = process.env.AMPLIFY_APP_ID;

    if (!appId) {
      console.warn('AMPLIFY_APP_ID not set in environment variables');
      return success({ totalVisits: 0, period: 'Last 7 days' });
    }

    try {
      // Get request count from CloudWatch for the last 7 days
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 7);

      const command = new GetMetricStatisticsCommand({
        Namespace: 'AWS/AmplifyHosting',
        MetricName: 'Requests',
        Dimensions: [
          {
            Name: 'App',
            Value: appId,
          },
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 86400, // 1 day in seconds
        Statistics: ['Sum'],
      });

      const response = await cloudWatchClient.send(command);

      // Sum up all the datapoints
      const totalVisits = response.Datapoints?.reduce((sum, point) => {
        return sum + (point.Sum || 0);
      }, 0) || 0;

      return success({
        totalVisits: Math.round(totalVisits),
        period: 'Last 7 days',
      });
    } catch (err) {
      console.error('Failed to fetch visitor stats:', err);
      return success({
        totalVisits: 0,
        period: 'Last 7 days',
      });
    }
  });
}
