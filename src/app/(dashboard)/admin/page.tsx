import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UsersStatusCard, SessionsStatusCard, SystemStatusCard, DeploymentStatusCard, VisitsStatusCard } from '@/components/admin/status-cards';
import { Loader2 } from 'lucide-react';

function CardSkeleton() {
  return (
    <div className="p-6 rounded-lg border text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div>
            <h3 className="text-lg font-medium">Loading...</h3>
            <p className="text-sm opacity-75 mt-1">Please wait</p>
          </div>
        </div>
      </div>
      <div className="text-4xl font-bold">...</div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to the administration panel</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Suspense fallback={<CardSkeleton />}>
          <UsersStatusCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <SessionsStatusCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <SystemStatusCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <DeploymentStatusCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <VisitsStatusCard />
        </Suspense>
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