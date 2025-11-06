import { Group } from '@/types/group';
import { Badge } from '@/components/ui/badge';

interface GroupsDisplayProps {
  groups: Group[];
}

export function GroupsDisplay({ groups }: GroupsDisplayProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">Group Name</th>
            <th className="px-4 py-3 text-left">Description</th>
            <th className="px-4 py-3 text-left">Users</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.groupName} className="border-t">
              <td className="px-4 py-3">
                <Badge variant="outline">{group.groupName}</Badge>
              </td>
              <td className="px-4 py-3">{group.description || 'No description'}</td>
              <td className="px-4 py-3">{group.userCount}</td>
              <td className="px-4 py-3">
                {new Date(group.creationDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}