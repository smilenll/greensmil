import { requireRoleOrRedirect } from '@/lib/auth-server';
import AdminPanel from './components/admin-panel';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No noStore() needed - auth check uses cookies internally (forces dynamic)
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