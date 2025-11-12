/**
 * Cognito email templates with consistent branding
 */

// Base template structure for consistency
function createCognitoTemplate({
  title,
  subtitle,
  message,
  codeLabel = 'Your verification code is:',
  footerMessage
}: {
  title: string;
  subtitle?: string;
  message: string;
  codeLabel?: string;
  footerMessage?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <div style="font-size: 32px; margin-bottom: 10px;">🌿</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Greensmil</h1>
    ${subtitle ? `<p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">${subtitle}</p>` : ''}
  </div>

  <div style="background: white; padding: 40px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #1f2937; margin: 0; font-size: 20px;">${title}</h2>
    </div>

    <p style="margin: 0 0 30px 0; font-size: 16px; text-align: center;">${message}</p>

    <div style="background: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; border: 2px solid #14532d;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${codeLabel}</p>
      <div style="font-size: 32px; font-weight: bold; color: #14532d; letter-spacing: 8px; font-family: 'Courier New', monospace;">{####}</div>
    </div>

    <p style="text-align: center; margin: 30px 0; font-size: 14px; color: #6b7280;">
      This code will expire in 24 hours. If you didn't request this code, you can safely ignore this email.
    </p>

    ${footerMessage ? `<div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #14532d; margin: 20px 0;"><p style="margin: 0; color: #14532d; font-size: 14px;">${footerMessage}</p></div>` : ''}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <div style="text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Best regards,<br><strong style="color: #14532d;">The Greensmil Team</strong></p>
      <p style="margin: 15px 0 0 0;">
        <a href="https://greensmil.com" style="color: #14532d; text-decoration: none; font-size: 14px;">Visit our website</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Email verification template
export function generateVerificationEmailTemplate(): string {
  return createCognitoTemplate({
    title: 'Welcome!',
    subtitle: 'Verify your email address',
    message: 'Thank you for signing up with Greensmil. To complete your registration, please verify your email address.',
    codeLabel: 'Your verification code is:',
    footerMessage: 'Enter this code in the verification page to activate your account.'
  });
}

// Password reset template
export function generatePasswordResetTemplate(): string {
  return createCognitoTemplate({
    title: 'Password Reset',
    subtitle: 'Reset your password',
    message: 'You requested to reset your password for your Greensmil account.',
    codeLabel: 'Your password reset code is:',
    footerMessage: 'Enter this code to set your new password.'
  });
}
