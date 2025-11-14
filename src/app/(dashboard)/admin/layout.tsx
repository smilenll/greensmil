import AdminPanel from './components/admin-panel';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AdminPanel>
        {children}
      </AdminPanel>
    </div>
  );
}