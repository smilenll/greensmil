import { getUsersAction } from "@/actions/user-actions";
import { UsersTable } from "@/components/admin/users-table";
import { Suspense } from 'react';

export default function UsersPage() {
  // No noStore() needed - action handles auth internally (forces dynamic)
  return (
    <div className="p-6">
      {/* Header - Static */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage users, roles, and permissions</p>
      </div>

      {/* Users table - Dynamic */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTableServer />
      </Suspense>
    </div>
  );
}

// Server component for users table
async function UsersTableServer() {
  const response = await getUsersAction(60);

  if (response.status !== 'success') {
    return (
      <div className="text-center py-8">
        <p className="text-destructive dark:text-red-400">Error loading users: {response.error}</p>
      </div>
    );
  }

  return <UsersTable users={response.data.users} />;
}

// Loading skeleton for users table
function UsersTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="h-14 bg-muted animate-pulse" />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="h-16 border-t bg-muted/50 animate-pulse" />
      ))}
    </div>
  );
}