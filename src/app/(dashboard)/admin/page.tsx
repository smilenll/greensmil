import { getUserCount, getActiveSessions, getSystemStatus } from "@/actions/user-actions";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [users, activeSessions, systemStatus] = await Promise.all([
    getUserCount(),
    getActiveSessions(),
    getSystemStatus()
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the administration panel</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-green-600">{users}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-blue-600">{activeSessions}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">System Status</h3>
          <p className={`text-3xl font-bold ${
            systemStatus.status === 'Online' ? 'text-green-600' : 
            systemStatus.status === 'Degraded' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {systemStatus.status}
          </p>
          <p className="text-sm text-gray-500 mt-1">Uptime: {systemStatus.uptime}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/users">
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/groups">
              Manage Groups
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}