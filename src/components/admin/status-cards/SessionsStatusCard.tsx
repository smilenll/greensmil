import { Activity } from 'lucide-react';
import { getActiveSessions } from '@/actions/user-actions';
import { StatusCard } from './StatusCard';

/**
 * SessionsStatusCard - Fully self-contained component
 * Shows active user sessions (users active in last 24 hours)
 */
export async function SessionsStatusCard() {
  // Fetch data
  const response = await getActiveSessions();

  // Determine values based on response
  const isSuccess = response.status === 'success';
  const count = isSuccess ? response.data : 0;

  // Render with all data handled internally
  return (
    <StatusCard
      title="Active Sessions"
      value={count}
      icon={<Activity className="h-6 w-6" />}
      variant="default"
      subtitle="Active in last 24 hours"
    />
  );
}
