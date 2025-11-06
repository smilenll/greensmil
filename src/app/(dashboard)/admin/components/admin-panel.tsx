'use client';

import { LoadingSpinner } from '@/components';
import { useAuth } from '@/contexts/auth-context';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AdminSidebar from './admin-sidebar';

export default function AdminPanel({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, getUserGroups } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div>Please sign in to access this area.</div>;
  }

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  const userGroups = getUserGroups();

  return (
    <SidebarProvider>
      <div className="flex h-[calc(100vh-4rem)] w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Welcome, {user.email}</p>
                  <p className="text-xs text-gray-500">Groups: {userGroups.join(', ')}</p>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}