import { EmailComposeForm } from '@/components/admin/email-compose-form';

export default function ComposeEmailPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-gray-100">Compose Email</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Send a new email from web@greensmil.com
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-6 max-w-3xl">
        <EmailComposeForm />
      </div>
    </div>
  );
}
