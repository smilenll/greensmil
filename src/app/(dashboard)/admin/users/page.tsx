import { getUsersAction } from "@/actions/user-actions";
import { UsersTable } from "@/components/admin/users-table";
import { Suspense } from 'react';

// Note: No revalidate needed - admin pages are dynamic by default (use cookies() in layout)

export default function UsersPage() {
  return (
    <div className="p-6">
      {/* Header - Static */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
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
  const { users } = await getUsersAction(60);
  return <UsersTable users={users} />;
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