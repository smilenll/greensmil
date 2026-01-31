import { Suspense } from 'react';
import { getEmails, getEmailStats } from '@/actions/email-actions';
import { EmailInboxList } from '@/components/admin/email-inbox-list';
import { EmailStatsCards } from '@/components/admin/email-stats-cards';

export default function InboxPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100">Email Inbox</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage emails received at web@greensmil.com
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <EmailStatsCardsServer />
      </Suspense>

      {/* Email List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700">
        <Suspense fallback={<EmailListSkeleton />}>
          <EmailInboxListServer />
        </Suspense>
      </div>
    </div>
  );
}

async function EmailStatsCardsServer() {
  const response = await getEmailStats();

  if (response.status !== 'success') {
    return null;
  }

  return <EmailStatsCards stats={response.data} />;
}

async function EmailInboxListServer() {
  const response = await getEmails();

  if (response.status !== 'success') {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading emails: {response.error}
      </div>
    );
  }

  return <EmailInboxList emails={response.data} />;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function EmailListSkeleton() {
  return (
    <div className="p-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 bg-muted animate-pulse rounded mb-2" />
      ))}
    </div>
  );
}
