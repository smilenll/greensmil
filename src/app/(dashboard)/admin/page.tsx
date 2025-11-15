import { getUserCount, getActiveSessions, getSystemStatus } from "@/actions/user-actions";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DeploymentStatusCard } from '@/components/admin/deployment-status';
import { UsersStatusCard, SessionsStatusCard, SystemStatusCard } from '@/components/admin/status-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  // No noStore() needed! Actions handle auth internally with ActionResponse pattern
  // Fetch data - actions now return ActionResponse instead of throwing
  const [usersResponse, sessionsResponse, statusResponse] = await Promise.all([
    getUserCount(),
    getActiveSessions(),
    getSystemStatus()
  ]);

  // Check for unauthorized state (should not happen since layout checks auth)
  if (usersResponse.status === 'unauthorized' ||
      sessionsResponse.status === 'unauthorized' ||
      statusResponse.status === 'unauthorized') {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-yellow-800 dark:text-yellow-200">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for errors
  if (usersResponse.status === 'error' ||
      sessionsResponse.status === 'error' ||
      statusResponse.status === 'error') {
    const errorMessage =
      usersResponse.status === 'error' ? usersResponse.error :
      sessionsResponse.status === 'error' ? sessionsResponse.error :
      statusResponse.status === 'error' ? statusResponse.error : 'Unknown error';

    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-red-800 dark:text-red-200">Error Loading Admin Panel</CardTitle>
            <CardDescription className="text-center text-red-600 dark:text-red-300">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-500 dark:text-red-400 text-center">
              System error occurred. Please check server logs or try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All successful - extract data (TypeScript knows these are success responses)
  const users = usersResponse.data;
  const activeSessions = sessionsResponse.data;
  const systemStatus = statusResponse.data;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to the administration panel</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <UsersStatusCard count={users} />
        <SessionsStatusCard count={activeSessions} />
        <SystemStatusCard status={systemStatus.status} uptime={systemStatus.uptime} />
      </div>

      {/* Deployment Status */}
      <div className="mb-6">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Deployment Status</h3>
        <DeploymentStatusCard />
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border dark:border-gray-700">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Quick Actions</h3>
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