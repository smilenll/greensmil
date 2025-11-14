import { requireRoleOrRedirect } from '@/lib/auth-server';
import AdminPanel from './components/admin-panel';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check (defense in depth with middleware)
  const user = await requireRoleOrRedirect('admin', '/');

  return (
    <div className="min-h-screen">
      <AdminPanel user={user}>
        {children}
      </AdminPanel>
    </div>
  );
}