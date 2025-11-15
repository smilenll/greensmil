import { getGroups } from "@/actions/group-actions";
import { GroupsTable } from "@/components/admin/groups-table";
import { Suspense } from 'react';

export default function GroupsPage() {
  // No noStore() needed - action handles auth internally (forces dynamic)
  return (
    <div className="p-6">
      {/* Header - Static */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">Groups Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage user groups and permissions</p>
      </div>

      {/* Groups table - Dynamic */}
      <Suspense fallback={<GroupsTableSkeleton />}>
        <GroupsTableServer />
      </Suspense>
    </div>
  );
}

// Server component for groups table
async function GroupsTableServer() {
  const response = await getGroups();

  if (response.status !== 'success') {
    return (
      <div className="text-center py-8">
        <p className="text-destructive dark:text-red-400">Error loading groups: {response.error}</p>
      </div>
    );
  }

  return <GroupsTable groups={response.data} />;
}

// Loading skeleton for groups table
function GroupsTableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="h-14 bg-muted animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 border-t bg-muted/50 animate-pulse" />
      ))}
    </div>
  );
}