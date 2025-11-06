'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserList from './user-list';

interface AdminContentProps {
  activeItem?: string;
}

const contentMap: Record<string, { title: string; description: string; content: React.ReactNode }> = {
  'All Users': {
    title: 'User Management',
    description: 'View and manage all users in the system',
    content: <UserList />,
  },
  'Add User': {
    title: 'Add New User',
    description: 'Create a new user account',
    content: (
      <div className="space-y-4">
        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select className="w-full p-2 border rounded-md">
              <option>User</option>
              <option>Admin</option>
              <option>Moderator</option>
            </select>
          </div>
          <Button type="submit">Create User</Button>
        </form>
      </div>
    ),
  },
  'User Roles': {
    title: 'User Roles',
    description: 'Manage user roles and permissions',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Full system access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">23 users</p>
              <Button variant="outline" className="mt-2">Manage</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Moderator</CardTitle>
              <CardDescription>Content moderation access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">45 users</p>
              <Button variant="outline" className="mt-2">Manage</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User</CardTitle>
              <CardDescription>Standard user access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">1,179 users</p>
              <Button variant="outline" className="mt-2">Manage</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  'General': {
    title: 'General Settings',
    description: 'Configure general system settings',
    content: (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                defaultValue="My Web Application"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Site Description</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                defaultValue="A powerful web application built with Next.js"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Enable user registration</span>
              </label>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    ),
  },
  'Query Builder': {
    title: 'Database Query Builder',
    description: 'Execute database queries safely',
    content: (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Query Interface</CardTitle>
            <CardDescription>Execute read-only queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                className="w-full p-3 border rounded-md font-mono text-sm"
                rows={8}
                placeholder="SELECT * FROM users WHERE active = true;"
              />
              <div className="flex space-x-2">
                <Button>Execute Query</Button>
                <Button variant="outline">Save Query</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
};

export default function AdminContent({ activeItem }: AdminContentProps) {
  const content = activeItem ? contentMap[activeItem] : null;

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Admin Panel</h2>
          <p className="text-gray-600">Select an item from the sidebar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <p className="text-gray-600 mt-2">{content.description}</p>
      </div>
      {content.content}
    </div>
  );
}