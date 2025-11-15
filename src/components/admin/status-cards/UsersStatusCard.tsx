import { Users } from 'lucide-react';
import { getUserCount } from '@/actions/user-actions';
import { StatusCard } from './StatusCard';

export async function UsersStatusCard() {
  // Fetch data
  const response = await getUserCount();

  // Determine values based on response
  const isSuccess = response.status === 'success';
  const count = isSuccess ? response.data : 0;

  // Render with all data handled internally
  return (
    <StatusCard
      title="Total Users"
      value={count}
      icon={<Users className="h-6 w-6" />}
      variant="success"
      subtitle="Registered in the system"
    />
  );
}
