'use client';

import { useState } from 'react';
import { updateUser, deleteUser, toggleUserStatus, addUserToGroup, removeUserFromGroup } from '@/actions/user-actions';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Power, PowerOff, Users } from 'lucide-react';

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [managingGroups, setManagingGroups] = useState<User | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleUpdate = async (formData: FormData) => {
    if (!editingUser || isSubmitting) return;
    
    const email = formData.get('email') as string;
    
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.username, { email });
      // Update local state
      setUsers(users.map(u =>
        u.username === editingUser.username
          ? { ...u, email }
          : u
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(username);
    try {
      await deleteUser(username);
      setUsers(users.filter(u => u.username !== username));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (username: string, enable: boolean) => {
    setLoading(username);
    try {
      await toggleUserStatus(username, enable);
      setUsers(users.map(u => 
        u.username === username ? { ...u, enabled: enable } : u
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleAddToGroup = async (formData: FormData) => {
    if (!managingGroups || isSubmitting) return;
    
    const groupName = formData.get('groupName') as string;
    
    setIsSubmitting(true);
    try {
      await addUserToGroup(managingGroups.username, groupName);
      setUsers(users.map(u => 
        u.username === managingGroups.username 
          ? { ...u, groups: [...(u.groups || []), groupName] }
          : u
      ));
      // Clear form
      const form = document.querySelector('form') as HTMLFormElement;
      form?.reset();
    } catch (error) {
      console.error('Failed to add user to group:', error);
      alert('Failed to add user to group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFromGroup = async (username: string, groupName: string) => {
    setLoading('group');
    try {
      await removeUserFromGroup(username, groupName);
      setUsers(users.map(u => 
        u.username === username 
          ? { ...u, groups: u.groups?.filter(g => g !== groupName) }
          : u
      ));
    } catch (error) {
      console.error('Failed to remove user from group:', error);
      alert('Failed to remove user from group. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Users ({users.length})</h2>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Groups</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Actions</th>
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
                      <Badge key={group} variant="outline" className="cursor-pointer hover:bg-red-100" 
                        onClick={() => handleRemoveFromGroup(user.username, group)}
                        title="Click to remove from group"
                      >
                        {group} ×
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {new Date(user.userCreateDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                      disabled={loading === user.username}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setManagingGroups(user)}
                      disabled={loading === user.username}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(user.username, !user.enabled)}
                      disabled={loading === user.username}
                    >
                      {user.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.username)}
                      disabled={loading === user.username}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form action={handleUpdate} className="space-y-4">
              <Input 
                name="email" 
                defaultValue={editingUser.email} 
                placeholder="Email" 
                type="email" 
                required 
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {managingGroups && (
        <Dialog open={!!managingGroups} onOpenChange={() => setManagingGroups(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Groups - {managingGroups.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Current Groups:</h4>
                <div className="flex flex-wrap gap-2">
                  {managingGroups.groups?.map(group => (
                    <Badge key={group} variant="outline" className="cursor-pointer hover:bg-red-100" 
                      onClick={() => handleRemoveFromGroup(managingGroups.username, group)}
                    >
                      {group} ×
                    </Badge>
                  )) || <span className="text-gray-500">No groups</span>}
                </div>
              </div>
              
              <form action={handleAddToGroup} className="space-y-4">
                <Input 
                  name="groupName" 
                  placeholder="Group name (e.g., admin, user)" 
                  required 
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add to Group'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}