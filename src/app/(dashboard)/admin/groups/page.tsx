import { getGroups } from "@/actions/group-actions";
import { GroupsTable } from "@/components/admin/groups-table";
import { Suspense } from 'react';

// Note: No revalidate needed - admin pages are dynamic by default (use cookies() in layout)

export default function GroupsPage() {
  return (
    <div className="p-6">
      {/* Header - Static */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Groups Management</h1>
        <p className="text-gray-600 mt-2">Manage user groups and permissions</p>
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
  const groups = await getGroups();
  return <GroupsTable groups={groups} />;
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