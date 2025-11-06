'use client';

import { useState } from 'react';
import { createUser } from '@/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AddUserPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (formData: FormData) => {
    if (loading) return;
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    setLoading(true);
    try {
      await createUser(email, password);
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New User</h1>
        <p className="text-gray-600 mt-2">Create a new user account</p>
      </div>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" placeholder="user@example.com" type="email" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temporary Password</label>
              <Input name="password" placeholder="Temporary password" type="password" required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
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