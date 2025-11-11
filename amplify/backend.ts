import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Configure Cognito to use SES for email sending
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.emailConfiguration = {
  emailSendingAccount: 'DEVELOPER',
  sourceArn: `arn:aws:ses:us-east-2:${backend.auth.resources.userPool.stack.account}:identity/greensmil.com`,
};

// Customize email verification message template
cfnUserPool.verificationMessageTemplate = {
  defaultEmailOption: 'CONFIRM_WITH_CODE',
  emailSubject: 'Welcome to Greensmil - Verify Your Email',
  emailMessage: `<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 10px;
    }
    .code-container {
      background-color: #f3f4f6;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      border: 2px solid #10b981;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿 Greensmil</div>
      <h2 style="color: #1f2937; margin: 0;">Welcome!</h2>
    </div>

    <p>Thank you for signing up with Greensmil. To complete your registration, please verify your email address.</p>

    <div class="code-container">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
      <div class="code">{####}</div>
    </div>

    <p>Enter this code in the verification page to activate your account.</p>

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      This code will expire in 24 hours. If you didn't request this code, you can safely ignore this email.
    </p>

    <div class="footer">
      <p>Best regards,<br><strong>The Greensmil Team</strong></p>
      <p style="margin-top: 15px;">
        <a href="https://greensmil.com" style="color: #10b981; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
</body>
</html>`,
};
