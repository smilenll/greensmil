import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AdminSidebar from './admin-sidebar';
import type { ServerUser } from '@/lib/auth-server';

interface AdminPanelProps {
  children: React.ReactNode;
  user: ServerUser;
}

export default function AdminPanel({ children, user }: AdminPanelProps) {
  // No auth checks needed - layout already verified admin role
  // Just render the UI with user data from server

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
                  <p className="text-sm text-gray-600">Welcome, {user.username}</p>
                  {user.groups && user.groups.length > 0 && (
                    <p className="text-xs text-gray-500">Groups: {user.groups.join(', ')}</p>
                  )}
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