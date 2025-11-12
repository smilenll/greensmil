'use server';

import { resendProvider } from '@/lib/email/resend-provider';
import {
  generateContactEmailHtml,
  generateContactEmailText,
  generateCustomerConfirmationHtml,
  generateCustomerConfirmationText
} from '@/lib/email/email-templates';
import { verifyRecaptcha } from './recaptcha-actions';
import type { ContactFormData } from '@/lib/email/email-provider';

export async function sendContactEmail(data: ContactFormData) {
  try {
    console.log('[DEBUG] sendContactEmail called with captchaToken:', !!data.captchaToken);

    // Verify reCAPTCHA token
    if (data.captchaToken) {
      console.log('[DEBUG] Verifying reCAPTCHA token...');
      const captchaResult = await verifyRecaptcha(data.captchaToken, 'contact_form');
      console.log('[DEBUG] reCAPTCHA result:', captchaResult);

      if (!captchaResult.success) {
        console.error('[ERROR] reCAPTCHA verification failed');
        return {
          success: false,
          message: captchaResult.error || 'reCAPTCHA verification failed. Please try again.',
        };
      }

      console.log(`[SUCCESS] reCAPTCHA verified. Score: ${captchaResult.score}`);
    } else if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      // If reCAPTCHA is configured but no token provided
      console.error('[ERROR] reCAPTCHA configured but no token provided');
      return {
        success: false,
        message: 'Please complete the CAPTCHA verification.',
      };
    }

    // Validate environment variables
    if (!process.env.RESEND_FROM_EMAIL || !process.env.RESEND_TO_EMAIL) {
      console.error('Email configuration error: Missing Resend environment variables');
      return {
        success: false,
        message: 'Something went wrong. Please try again later.',
      };
    }

    // Send notification email to admin (web@greensmil.com)
    // NOTE: We only send to our verified business email to comply with email best practices
    // Sending automated emails to unverified user-submitted addresses is against best practices
    const adminHtml = generateContactEmailHtml(data);
    const adminText = generateContactEmailText(data);

    const adminResult = await resendProvider.sendEmail({
      to: process.env.RESEND_TO_EMAIL, // web@greensmil.com (verified address)
      from: process.env.RESEND_FROM_EMAIL, // noreply@greensmil.com
      replyTo: data.email, // Customer's email (so we can reply directly)
      subject: `[Contact Form] ${data.subject}`,
      html: adminHtml,
      text: adminText,
    });

    if (!adminResult.success) {
      console.error('Failed to send admin notification:', adminResult.error);
      throw new Error(adminResult.error || 'Failed to send notification email');
    }

    // Send confirmation email to customer (from noreply@greensmil.com)
    const customerHtml = generateCustomerConfirmationHtml(data);
    const customerText = generateCustomerConfirmationText(data);

    const customerResult = await resendProvider.sendEmail({
      to: data.email, // Customer's email
      from: process.env.RESEND_FROM_EMAIL, // noreply@greensmil.com
      replyTo: process.env.RESEND_TO_EMAIL, // web@greensmil.com (so they can reply)
      subject: 'Thank you for contacting Greensmil',
      html: customerHtml,
      text: customerText,
    });

    // Don't fail the entire operation if customer confirmation fails
    // But log it for monitoring
    if (!customerResult.success) {
      console.error('Failed to send customer confirmation:', customerResult.error);
      // Still return success since the main notification was sent
      return {
        success: true,
        message: `Your message has been sent successfully! We will respond to: ${data.email}`,
      };
    }

    return {
      success: true,
      message: `Your message has been sent successfully! We will respond to: ${data.email}. Please check your inbox for a confirmation email.`,
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}
