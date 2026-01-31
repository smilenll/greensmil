'use client';

import { useState } from 'react';
import { replyToEmail } from '@/actions/email-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EmailReplyFormProps {
  emailId: string;
  originalSubject: string;
  recipientEmail: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EmailReplyForm({
  emailId,
  originalSubject,
  recipientEmail,
  onCancel,
  onSuccess,
}: EmailReplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const textBody = formData.get('message') as string;

    const response = await replyToEmail({
      emailId,
      to,
      subject,
      textBody,
    });

    if (response.status === 'success') {
      onSuccess();
    } else {
      setError(response.error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4">Reply</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            name="to"
            type="email"
            defaultValue={recipientEmail}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            defaultValue={originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            rows={10}
            required
            disabled={loading}
            placeholder="Type your reply..."
          />
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reply'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
