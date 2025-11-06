import AdminPanel from './components/admin-panel';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-16">
      <AdminPanel>
        {children}
      </AdminPanel>
    </div>
  );
}