import { getUsersAction } from "@/actions/user-actions";
import { UsersTable } from "@/components/admin/users-table";

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const { users } = await getUsersAction(60);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
      </div>
      
      <UsersTable users={users} />
    </div>
  );
}