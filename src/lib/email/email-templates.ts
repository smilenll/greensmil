import type { ContactFormData } from './email-provider';

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Email template for admin notification (you receive this)
export function generateContactEmailHtml(data: ContactFormData): string {
  const { name, email, subject, message } = data;

  // Escape all user inputs to prevent XSS
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">From greensmil.com</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="margin-bottom: 20px;">
      <strong style="color: #14532d; display: block; margin-bottom: 5px;">Name:</strong>
      <p style="margin: 0; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #14532d;">${safeName}</p>
    </div>

    <div style="margin-bottom: 20px;">
      <strong style="color: #14532d; display: block; margin-bottom: 5px;">Email:</strong>
      <p style="margin: 0; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #14532d;">
        <a href="mailto:${safeEmail}" style="color: #14532d; text-decoration: none;">${safeEmail}</a>
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <strong style="color: #14532d; display: block; margin-bottom: 5px;">Subject:</strong>
      <p style="margin: 0; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #14532d;">${safeSubject}</p>
    </div>

    <div style="margin-bottom: 20px;">
      <strong style="color: #14532d; display: block; margin-bottom: 5px;">Message:</strong>
      <div style="margin: 0; padding: 15px; background: white; border-radius: 5px; border-left: 3px solid #14532d; white-space: pre-wrap;">${safeMessage}</div>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 12px; margin: 0;">
      This email was sent from the contact form on <a href="https://greensmil.com" style="color: #14532d;">greensmil.com</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function generateContactEmailText(data: ContactFormData): string {
  const { name, email, subject, message } = data;

  return `
New Contact Form Submission
From: greensmil.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${name}

Email: ${email}

Subject: ${subject}

Message:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This email was sent from the contact form on greensmil.com
  `.trim();
}

// Customer confirmation email (sent from noreply@greensmil.com)
export function generateCustomerConfirmationHtml(data: ContactFormData): string {
  const { name } = data;
  const safeName = escapeHtml(name);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">We've received your message</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${safeName},</p>

    <p style="margin: 0 0 20px 0;">Thank you for reaching out through our website. We have received your message and will get back to you as soon as possible.</p>

    <p style="margin: 0 0 20px 0;">We typically respond within 24-48 hours during business days.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #14532d; margin: 20px 0;">
      <p style="margin: 0; color: #14532d; font-weight: bold;">What happens next?</p>
      <p style="margin: 10px 0 0 0;">Our team will review your message and respond directly to the email address you provided.</p>
    </div>

    <p style="margin: 20px 0 0 0; color: #666;">If you have any urgent matters, please feel free to reach out to us directly at <a href="mailto:web@greensmil.com" style="color: #14532d; text-decoration: none;">web@greensmil.com</a>.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
      Best regards,<br>
      <strong style="color: #14532d;">The Greensmil Team</strong>
    </p>

    <p style="color: #999; font-size: 11px; margin: 20px 0 0 0;">
      This is an automated confirmation from <a href="https://greensmil.com" style="color: #14532d;">greensmil.com</a>.<br>
      Please do not reply to this email. For inquiries, contact us at web@greensmil.com.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function generateCustomerConfirmationText(data: ContactFormData): string {
  const { name } = data;

  return `
Thank You for Contacting Us!

Hi ${name},

Thank you for reaching out through our website. We have received your message and will get back to you as soon as possible.

We typically respond within 24-48 hours during business days.

WHAT HAPPENS NEXT?
Our team will review your message and respond directly to the email address you provided.

If you have any urgent matters, please feel free to reach out to us directly at web@greensmil.com.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
The Greensmil Team

This is an automated confirmation from greensmil.com.
Please do not reply to this email. For inquiries, contact us at web@greensmil.com.
  `.trim();
}
