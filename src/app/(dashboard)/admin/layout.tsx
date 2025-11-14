import { requireRoleOrRedirect } from '@/lib/auth-server';
import AdminPanel from './components/admin-panel';
import { unstable_noStore as noStore } from 'next/cache';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Opt out of static generation - admin pages must be dynamic for auth
  noStore();

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