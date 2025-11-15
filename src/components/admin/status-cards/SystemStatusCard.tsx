import { Server } from 'lucide-react';
import { getSystemStatus } from '@/actions/user-actions';
import { StatusCard, type StatusVariant } from './StatusCard';

/**
 * SystemStatusCard - Fully self-contained component
 * Handles its own data fetching, transformation, and error handling
 */
export async function SystemStatusCard() {
  // Fetch data
  const response = await getSystemStatus();

  // Determine values based on response
  const isSuccess = response.status === 'success';
  const data = isSuccess ? response.data : { status: 'Offline', uptime: '0s' };

  // Transform data
  const statusLower = data.status.toLowerCase();
  const variant: StatusVariant =
    statusLower === 'online' ? 'success' :
    statusLower === 'degraded' ? 'warning' : 'destructive';

  // Render with all data handled internally
  return (
    <StatusCard
      title="System Status"
      value={data.status}
      icon={<Server className="h-6 w-6" />}
      variant={variant}
      subtitle={`Uptime: ${data.uptime}`}
    />
  );
}
