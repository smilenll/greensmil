import { Resend } from 'resend';
import type { EmailProvider, SendEmailParams, EmailResponse } from './email-provider';

// Initialize Resend client once
const resend = new Resend(process.env.RESEND_API_KEY);

export const resendProvider: EmailProvider = {
  async sendEmail(params: SendEmailParams): Promise<EmailResponse> {
    const { to, from, replyTo, subject, html, text } = params;

    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        replyTo,
        subject,
        html,
        text,
      });

      if (error) {
        console.error('Resend Error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error('Resend Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  },
};
