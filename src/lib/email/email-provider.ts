// Email provider interface - allows easy switching between providers
export interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResponse>;
}

export interface SendEmailParams {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken?: string;
}
