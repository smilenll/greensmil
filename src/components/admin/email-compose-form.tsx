'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmail } from '@/actions/email-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function EmailComposeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const textBody = formData.get('message') as string;

    const response = await sendEmail({
      to,
      subject,
      textBody,
    });

    setLoading(false);

    if (response.status === 'success') {
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/inbox');
      }, 1500);
    } else {
      setError(response.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          type="email"
          required
          disabled={loading}
          placeholder="recipient@example.com"
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          required
          disabled={loading}
          placeholder="Email subject"
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={15}
          required
          disabled={loading}
          placeholder="Type your message..."
        />
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {success && (
        <div className="text-sm text-green-600 dark:text-green-400">
          Email sent successfully! Redirecting...
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Email'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
