'use client';

import { useState } from 'react';
import { createGroup } from '@/actions/group-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AddGroupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (formData: FormData) => {
    if (loading) return;
    
    const groupName = formData.get('groupName') as string;
    const description = formData.get('description') as string;
    
    setLoading(true);
    try {
      await createGroup(groupName, description);
      router.push('/admin/groups');
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Group</h1>
        <p className="text-gray-600 mt-2">Create a new user group</p>
      </div>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <Input name="groupName" placeholder="admin, user, etc." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input name="description" placeholder="Group description (optional)" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}