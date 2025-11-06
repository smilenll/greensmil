import { User } from '@/types/user';
import { Badge } from '@/components/ui/badge';

interface UsersDisplayProps {
  users: User[];
}

export function UsersDisplay({ users }: UsersDisplayProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Groups</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.username} className="border-t">
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={user.enabled ? 'default' : 'secondary'}>
                  {user.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {user.groups?.map(group => (
                    <Badge key={group} variant="outline">
                      {group}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                {new Date(user.userCreateDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}