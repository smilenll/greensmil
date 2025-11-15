import { Eye } from 'lucide-react';
import { getVisitorStats } from '@/actions/analytics-actions';
import { StatusCard } from './StatusCard';

/**
 * VisitsStatusCard - Fully self-contained component
 * Handles its own data fetching, transformation, and error handling
 * Shows total website visits from AWS Amplify metrics
 */
export async function VisitsStatusCard() {
  // Fetch data
  const response = await getVisitorStats();

  // Determine values based on response
  const isSuccess = response.status === 'success';
  const data = isSuccess ? response.data : { totalVisits: 0, period: 'Last 7 days' };

  // Render with all data handled internally
  return (
    <StatusCard
      title="Total Visits"
      value={data.totalVisits.toLocaleString()}
      icon={<Eye className="h-6 w-6" />}
      variant="default"
      subtitle={data.period}
    />
  );
}
