import { getEmailById } from '@/actions/email-actions';
import { EmailDetailView } from '@/components/admin/email-detail-view';
import { notFound } from 'next/navigation';

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ emailId: string }>;
}) {
  const { emailId } = await params;
  const response = await getEmailById(emailId);

  if (response.status !== 'success') {
    notFound();
  }

  return (
    <div className="p-6">
      <EmailDetailView email={response.data} />
    </div>
  );
}
