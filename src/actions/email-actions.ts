'use server';

import { revalidatePath } from 'next/cache';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { cookies } from 'next/headers';
import type { Schema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';
import { ActionResponse, success, error } from '@/types/action-response';
import { withRole } from '@/lib/action-helpers';
import { resendProvider } from '@/lib/email/resend-provider';
import { z } from 'zod';

const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

// Types
export interface Email {
  id: string;
  messageId: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  threadId?: string;
  isRead: boolean;
  isStarred: boolean;
  receivedAt: string;
  replyCount?: number;
}

export interface EmailDetail extends Email {
  replies: EmailReply[];
  attachments: EmailAttachment[];
}

export interface EmailReply {
  id: string;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  sentBy: string;
  sentAt: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size?: number;
  resendAttachmentId: string;
}

// Validation schemas
const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  htmlBody: z.string().optional(),
  textBody: z.string().min(1, 'Message is required'),
  inReplyTo: z.string().optional(),
});

const replyEmailSchema = z.object({
  emailId: z.string().min(1, 'Email ID is required'),
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  htmlBody: z.string().optional(),
  textBody: z.string().min(1, 'Message is required'),
});

/**
 * Get all emails (inbox view)
 */
export async function getEmails(): Promise<ActionResponse<Email[]>> {
  return withRole('admin', async () => {
    const { data: emails } = await cookieBasedClient.models.Email.list({
      selectionSet: ['id', 'messageId', 'from', 'fromName', 'to', 'subject',
                     'isRead', 'isStarred', 'receivedAt', 'replies.*'],
    });

    if (!emails) {
      return success([]);
    }

    const emailList = emails
      .map(email => ({
        id: email.id,
        messageId: email.messageId,
        from: email.from,
        fromName: email.fromName || undefined,
        to: email.to,
        subject: email.subject,
        isRead: email.isRead ?? false,
        isStarred: email.isStarred ?? false,
        receivedAt: email.receivedAt,
        replyCount: email.replies?.length || 0,
      }))
      .sort((a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      );

    return success(emailList);
  });
}

/**
 * Get email by ID with full details
 */
export async function getEmailById(emailId: string): Promise<ActionResponse<EmailDetail>> {
  return withRole('admin', async () => {
    const { data: email } = await cookieBasedClient.models.Email.get(
      { id: emailId },
      {
        selectionSet: [
          'id', 'messageId', 'from', 'fromName', 'to', 'subject',
          'htmlBody', 'textBody', 'threadId', 'inReplyTo', 'references',
          'isRead', 'isStarred', 'receivedAt',
          'replies.*'
        ]
      }
    );

    if (!email) {
      return error('Email not found');
    }

    // Get attachments
    const { data: attachments } = await cookieBasedClient.models.EmailAttachment.list({
      filter: { emailId: { eq: emailId } },
    });

    const emailDetail: EmailDetail = {
      id: email.id,
      messageId: email.messageId,
      from: email.from,
      fromName: email.fromName || undefined,
      to: email.to,
      subject: email.subject,
      htmlBody: email.htmlBody || undefined,
      textBody: email.textBody || undefined,
      threadId: email.threadId || undefined,
      isRead: email.isRead ?? false,
      isStarred: email.isStarred ?? false,
      receivedAt: email.receivedAt,
      replies: (email.replies || []).map(reply => ({
        id: reply.id,
        messageId: reply.messageId,
        from: reply.from,
        to: reply.to,
        subject: reply.subject,
        htmlBody: reply.htmlBody || undefined,
        textBody: reply.textBody || undefined,
        sentBy: reply.sentBy,
        sentAt: reply.sentAt,
      })),
      attachments: (attachments || []).map(att => ({
        id: att.id,
        filename: att.filename,
        contentType: att.contentType,
        size: att.size || undefined,
        resendAttachmentId: att.resendAttachmentId,
      })),
    };

    return success(emailDetail);
  });
}

/**
 * Mark email as read/unread
 */
export async function markEmailAsRead(
  emailId: string,
  isRead: boolean
): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    await cookieBasedClient.models.Email.update({
      id: emailId,
      isRead,
    });

    revalidatePath('/admin/inbox');
    revalidatePath(`/admin/inbox/${emailId}`);
    return success(undefined);
  });
}

/**
 * Toggle email starred status
 */
export async function toggleEmailStarred(emailId: string): Promise<ActionResponse<boolean>> {
  return withRole('admin', async () => {
    const { data: email } = await cookieBasedClient.models.Email.get({ id: emailId });

    if (!email) {
      return error('Email not found');
    }

    const newStarredState = !email.isStarred;

    await cookieBasedClient.models.Email.update({
      id: emailId,
      isStarred: newStarredState,
    });

    revalidatePath('/admin/inbox');
    revalidatePath(`/admin/inbox/${emailId}`);
    return success(newStarredState);
  });
}

/**
 * Send new email
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  htmlBody?: string;
  textBody: string;
  inReplyTo?: string;
}): Promise<ActionResponse<string>> {
  return withRole('admin', async (user) => {
    const validation = sendEmailSchema.safeParse(input);
    if (!validation.success) {
      return error(validation.error.errors[0].message);
    }

    const { to, subject, htmlBody, textBody, inReplyTo } = validation.data;

    // Send via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'web@greensmil.com';

    const result = await resendProvider.sendEmail({
      to,
      from: fromEmail,
      replyTo: fromEmail,
      subject,
      html: htmlBody || textBody.replace(/\n/g, '<br>'),
      text: textBody,
    });

    if (!result.success) {
      return error(result.error || 'Failed to send email');
    }

    // If this is a reply, store in EmailReply table
    if (inReplyTo && result.messageId) {
      await cookieBasedClient.models.EmailReply.create({
        emailId: inReplyTo,
        messageId: result.messageId,
        from: fromEmail,
        to,
        subject,
        htmlBody: htmlBody || null,
        textBody,
        sentBy: user.userId,
        sentAt: new Date().toISOString(),
      });

      revalidatePath(`/admin/inbox/${inReplyTo}`);
    }

    revalidatePath('/admin/inbox');
    return success(result.messageId || '');
  });
}

/**
 * Reply to email
 */
export async function replyToEmail(input: {
  emailId: string;
  to: string;
  subject: string;
  htmlBody?: string;
  textBody: string;
}): Promise<ActionResponse<string>> {
  return withRole('admin', async (user) => {
    const validation = replyEmailSchema.safeParse(input);
    if (!validation.success) {
      return error(validation.error.errors[0].message);
    }

    const { emailId, to, subject, htmlBody, textBody } = validation.data;

    // Get original email for threading
    const { data: originalEmail } = await cookieBasedClient.models.Email.get({ id: emailId });

    if (!originalEmail) {
      return error('Original email not found');
    }

    // Send via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'web@greensmil.com';

    const result = await resendProvider.sendEmail({
      to,
      from: fromEmail,
      replyTo: fromEmail,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      html: htmlBody || textBody.replace(/\n/g, '<br>'),
      text: textBody,
    });

    if (!result.success) {
      return error(result.error || 'Failed to send reply');
    }

    // Store reply in database
    if (result.messageId) {
      await cookieBasedClient.models.EmailReply.create({
        emailId,
        messageId: result.messageId,
        from: fromEmail,
        to,
        subject,
        htmlBody: htmlBody || null,
        textBody,
        sentBy: user.userId,
        sentAt: new Date().toISOString(),
      });
    }

    // Mark original as read
    await cookieBasedClient.models.Email.update({
      id: emailId,
      isRead: true,
    });

    revalidatePath('/admin/inbox');
    revalidatePath(`/admin/inbox/${emailId}`);

    return success(result.messageId || '');
  });
}

/**
 * Delete email
 */
export async function deleteEmail(emailId: string): Promise<ActionResponse<void>> {
  return withRole('admin', async () => {
    // Delete all replies first
    const { data: replies } = await cookieBasedClient.models.EmailReply.list({
      filter: { emailId: { eq: emailId } },
    });

    if (replies && replies.length > 0) {
      await Promise.all(
        replies.map(reply => cookieBasedClient.models.EmailReply.delete({ id: reply.id }))
      );
    }

    // Delete all attachments
    const { data: attachments } = await cookieBasedClient.models.EmailAttachment.list({
      filter: { emailId: { eq: emailId } },
    });

    if (attachments && attachments.length > 0) {
      await Promise.all(
        attachments.map(att => cookieBasedClient.models.EmailAttachment.delete({ id: att.id }))
      );
    }

    // Delete email
    await cookieBasedClient.models.Email.delete({ id: emailId });

    revalidatePath('/admin/inbox');
    return success(undefined);
  });
}

/**
 * Get email statistics
 */
export async function getEmailStats(): Promise<ActionResponse<{
  total: number;
  unread: number;
  starred: number;
}>> {
  return withRole('admin', async () => {
    const { data: emails } = await cookieBasedClient.models.Email.list({
      selectionSet: ['id', 'isRead', 'isStarred'],
    });

    if (!emails) {
      return success({ total: 0, unread: 0, starred: 0 });
    }

    const stats = {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      starred: emails.filter(e => e.isStarred).length,
    };

    return success(stats);
  });
}
