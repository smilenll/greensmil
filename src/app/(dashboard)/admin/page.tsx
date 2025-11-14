import { getUserCount, getActiveSessions, getSystemStatus } from "@/actions/user-actions";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DeploymentStatusCard } from '@/components/admin/deployment-status';
import { unstable_noStore as noStore } from 'next/cache';

export default async function AdminPage() {
  noStore();
  let users, activeSessions, systemStatus;

  // Layout already verified admin role - just fetch data
  try {
    [users, activeSessions, systemStatus] = await Promise.all([
      getUserCount(),
      getActiveSessions(),
      getSystemStatus()
    ]);
  } catch (error) {
    // Only system errors reach here (not auth errors)
    console.error('Admin page error:', error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-bold mb-2">Error Loading Admin Panel</h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <p className="text-sm text-red-500 mt-2">
            System error occurred. Please check server logs.
          </p>
        </div>
      </div>
    );
  }

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

      {/* Deployment Status */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Deployment Status</h3>
        <DeploymentStatusCard />
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