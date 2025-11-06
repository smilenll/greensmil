'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getUsersAction, AmplifyUser } from '@/actions/user-actions';

export default function UserList() {
  const [users, setUsers] = useState<AmplifyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsersAction(60);
      setUsers(result.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4" data-test="user-list-loading">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium" data-test="user-list-title">All Users</h3>
          <p className="text-sm text-gray-600" data-test="loading-status">Loading...</p>
        </div>
        <div className="border rounded-lg p-8 text-center" data-test="loading-spinner">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4" data-test="user-list-error">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium" data-test="user-list-title">All Users</h3>
          <p className="text-sm text-red-600" data-test="error-status">Error loading users</p>
        </div>
        <div className="border rounded-lg p-8 text-center" data-test="error-container">
          <p className="text-red-600 mb-4" data-test="error-message">{error}</p>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            data-test="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getName = (user: AmplifyUser) => {
    return user.attributes?.name ||
           `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim() ||
           user.username;
  };

  return (
    <div className="space-y-4" data-test="user-list">
      <div className="flex justify-between items-center" data-test="user-list-header">
        <h3 className="text-lg font-medium" data-test="user-list-title">All Users</h3>
        <p className="text-sm text-gray-600" data-test="user-count">{users.length} users total</p>
      </div>

      <div className="border rounded-lg" data-test="user-table-container">
        <Table data-test="user-table">
          <TableHeader data-test="user-table-header">
            <TableRow data-test="user-table-header-row">
              <TableHead data-test="user-table-header-id">ID</TableHead>
              <TableHead data-test="user-table-header-name">Name</TableHead>
              <TableHead data-test="user-table-header-email">Email</TableHead>
              <TableHead data-test="user-table-header-groups">Groups</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-test="user-table-body">
            {users.map((user) => (
              <TableRow key={user.userId} data-test={`user-row-${user.userId}`}>
                <TableCell className="font-mono text-sm" data-test={`user-id-${user.userId}`}>{user.userId}</TableCell>
                <TableCell className="font-medium" data-test={`user-name-${user.userId}`}>{getName(user)}</TableCell>
                <TableCell data-test={`user-email-${user.userId}`}>{user.email || 'No email'}</TableCell>
                <TableCell data-test={`user-groups-${user.userId}`}>
                  <div className="flex gap-1 flex-wrap">
                    {user.groups && user.groups.length > 0 ? (
                      user.groups.map((group) => (
                        <Badge key={group} variant="secondary" className="text-xs" data-test={`user-group-badge-${group}`}>
                          {group}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs" data-test="user-no-groups-badge">
                        No groups
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}