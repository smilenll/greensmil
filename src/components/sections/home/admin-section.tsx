'use client';

import { AdminOnly, AdminButton } from '@/components/auth';
import { useRouter } from 'next/navigation';

export function AdminSection() {
  const router = useRouter();

  return (
    <AdminOnly>
      <div className="mt-8 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Admin Panel Access
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4">
          You have administrator privileges. Access admin features below.
        </p>
        <div className="flex justify-center gap-2">
          <AdminButton onClick={() => router.push('/admin')}>
            Go to Admin Dashboard
          </AdminButton>
          <AdminButton variant="outline" onClick={() => alert('System settings coming soon!')}>
            System Settings
          </AdminButton>
        </div>
      </div>
    </AdminOnly>
  );
}
