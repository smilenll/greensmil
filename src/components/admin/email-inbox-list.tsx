'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MailOpen, Star, Trash2 } from 'lucide-react';
import { markEmailAsRead, toggleEmailStarred, deleteEmail } from '@/actions/email-actions';
import type { Email } from '@/actions/email-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface EmailInboxListProps {
  emails: Email[];
}

export function EmailInboxList({ emails: initialEmails }: EmailInboxListProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleRead = async (emailId: string, currentState: boolean) => {
    setLoading(emailId);
    try {
      const response = await markEmailAsRead(emailId, !currentState);
      if (response.status === 'success') {
        setEmails(emails.map(e =>
          e.id === emailId ? { ...e, isRead: !currentState } : e
        ));
      }
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStarred = async (emailId: string) => {
    setLoading(emailId);
    try {
      const response = await toggleEmailStarred(emailId);
      if (response.status === 'success') {
        setEmails(emails.map(e =>
          e.id === emailId ? { ...e, isStarred: response.data } : e
        ));
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return;

    setLoading(emailId);
    try {
      const response = await deleteEmail(emailId);
      if (response.status === 'success') {
        setEmails(emails.filter(e => e.id !== emailId));
      }
    } finally {
      setLoading(null);
    }
  };

  if (emails.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No emails yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y dark:divide-gray-700">
      {emails.map(email => (
        <div
          key={email.id}
          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            !email.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Star button */}
            <button
              onClick={() => handleToggleStarred(email.id)}
              disabled={loading === email.id}
              className="mt-1"
            >
              <Star
                className={`h-5 w-5 ${
                  email.isStarred
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              />
            </button>

            {/* Email content */}
            <Link
              href={`/admin/inbox/${email.id}`}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold ${!email.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {email.fromName || email.from}
                </span>
                {!email.isRead && (
                  <Badge variant="default" className="text-xs">New</Badge>
                )}
                {email.replyCount && email.replyCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {email.replyCount} {email.replyCount === 1 ? 'reply' : 'replies'}
                  </Badge>
                )}
              </div>
              <div className={`text-sm mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                {email.subject}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleRead(email.id, email.isRead)}
                disabled={loading === email.id}
              >
                {email.isRead ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <MailOpen className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(email.id)}
                disabled={loading === email.id}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
