import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { headers as getHeaders, cookies } from 'next/headers';
import type { Schema } from '../../../../../amplify/data/resource';
import outputs from '../../../../../amplify_outputs.json';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 1. Get request body and headers
    const body = await request.text();
    const headersList = await getHeaders();
    const svixId = headersList.get('svix-id');
    const svixTimestamp = headersList.get('svix-timestamp');
    const svixSignature = headersList.get('svix-signature');

    console.log('[webhook] Received webhook request');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[webhook] Missing webhook headers');
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 401 });
    }

    // 2. Verify webhook signature
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[webhook] RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify webhook using Resend SDK
    let payload: any;
    try {
      const verified = await resend.webhooks.verify({
        payload: body,
        headers: {
          'svix-id': svixId!,
          'svix-timestamp': svixTimestamp!,
          'svix-signature': svixSignature!,
        } as any,
        webhookSecret,
      });
      payload = verified;
      console.log('[webhook] Signature verified successfully');
    } catch (error) {
      console.error('[webhook] Signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Check event type
    if (payload.type !== 'email.received') {
      console.log('[webhook] Ignoring event type:', payload.type);
      return NextResponse.json({ received: true });
    }

    const emailData = payload.data;
    console.log('[webhook] Processing email:', emailData.email_id);

    // 4. Fetch full email content from Resend API
    const { data: emailContent, error: fetchError } = await resend.emails.get(emailData.email_id);

    if (fetchError || !emailContent) {
      console.error('[webhook] Failed to fetch email content:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch email' }, { status: 500 });
    }

    // 5. Parse sender information
    const fromMatch = emailData.from?.match(/^(.*?)\s*<(.+)>$/) || [null, emailData.from, emailData.from];
    const fromName = fromMatch[1]?.trim() || null;
    const fromEmail = fromMatch[2]?.trim() || emailData.from;

    // 6. Determine thread ID and reply references
    // Note: Email headers are not available in the current Resend API response
    // We'll use the email_id as the threadId for now
    const inReplyTo = null;
    const references = null;
    const threadId = emailData.email_id;

    // 7. Store in database (using server context)
    // Note: Webhooks run without user auth, but Amplify Data uses Cognito user pool auth
    // We use cookies() to get an empty cookie store for the client
    const serverClient = generateServerClientUsingCookies<Schema>({
      config: outputs,
      cookies,
    });

    const { data: createdEmail, errors: createErrors } = await serverClient.models.Email.create({
      messageId: emailData.email_id,
      from: fromEmail,
      fromName: fromName,
      to: Array.isArray(emailData.to) ? emailData.to[0] : emailData.to,
      subject: emailData.subject || '(No Subject)',
      htmlBody: emailContent.html || null,
      textBody: emailContent.text || null,
      threadId,
      inReplyTo,
      references,
      isRead: false,
      isStarred: false,
      receivedAt: new Date(payload.created_at).toISOString(),
    });

    if (createErrors) {
      console.error('[webhook] Failed to create email:', createErrors);
      return NextResponse.json({ error: 'Failed to store email' }, { status: 500 });
    }

    console.log('[webhook] Email stored successfully:', createdEmail?.id);

    // 8. Handle attachments (store metadata only)
    if (emailData.attachments && Array.isArray(emailData.attachments) && emailData.attachments.length > 0) {
      for (const attachment of emailData.attachments) {
        await serverClient.models.EmailAttachment.create({
          emailId: createdEmail!.id,
          resendAttachmentId: attachment.id || attachment.filename,
          filename: attachment.filename,
          contentType: attachment.content_type || attachment.contentType || 'application/octet-stream',
          size: attachment.size || null,
        });
      }
      console.log('[webhook] Stored', emailData.attachments.length, 'attachments');
    }

    return NextResponse.json({
      received: true,
      emailId: createdEmail?.id,
      messageId: emailData.email_id,
    });
  } catch (error) {
    console.error('[webhook] Error processing email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
