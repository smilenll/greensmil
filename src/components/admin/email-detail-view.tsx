'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Reply, Star, Trash2 } from 'lucide-react';
import { markEmailAsRead, toggleEmailStarred, deleteEmail } from '@/actions/email-actions';
import type { EmailDetail } from '@/actions/email-actions';
import { Button } from '@/components/ui/button';
import { EmailReplyForm } from './email-reply-form';
import { format } from 'date-fns';

interface EmailDetailViewProps {
  email: EmailDetail;
}

export function EmailDetailView({ email: initialEmail }: EmailDetailViewProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mark as read on mount
  useEffect(() => {
    if (!email.isRead) {
      markEmailAsRead(email.id, true);
    }
  }, [email.id, email.isRead]);

  const handleToggleStarred = async () => {
    setLoading(true);
    try {
      const response = await toggleEmailStarred(email.id);
      if (response.status === 'success') {
        setEmail({ ...email, isStarred: response.data });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this email?')) return;

    setLoading(true);
    const response = await deleteEmail(email.id);
    if (response.status === 'success') {
      router.push('/admin/inbox');
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStarred}
            disabled={loading}
          >
            <Star
              className={`h-4 w-4 ${
                email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReplyForm(true)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700">
        {/* Subject */}
        <div className="border-b dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>

          {/* Sender info */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-semibold">
                {email.fromName || email.from}
              </div>
              <div className="text-gray-500">{email.from}</div>
            </div>
            <div className="text-gray-500">
              {format(new Date(email.receivedAt), 'PPpp')}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {email.htmlBody ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.htmlBody) }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{email.textBody}</div>
          )}
        </div>

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="border-t dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-3">Attachments ({email.attachments.length})</h3>
            <div className="space-y-2">
              {email.attachments.map(att => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium">{att.filename}</div>
                    <div className="text-xs text-gray-500">
                      {att.contentType} • {att.size ? formatBytes(att.size) : 'Unknown size'}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {email.replies.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">Replies ({email.replies.length})</h2>
          {email.replies.map(reply => (
            <div
              key={reply.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">You</div>
                  <div className="text-sm text-gray-500">To: {reply.to}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(reply.sentAt), 'PPpp')}
                </div>
              </div>
              {reply.htmlBody ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply.htmlBody) }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{reply.textBody}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-6">
          <EmailReplyForm
            emailId={email.id}
            originalSubject={email.subject}
            recipientEmail={email.from}
            onCancel={() => setShowReplyForm(false)}
            onSuccess={() => {
              setShowReplyForm(false);
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}

// Sanitize HTML to prevent XSS
function sanitizeHtml(html: string): string {
  // Basic sanitization for MVP - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
