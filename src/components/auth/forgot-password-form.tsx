'use client';

import { useState } from 'react';
import { ForgotPasswordStepEmail } from './forgot-password/forgot-password-step-email';
import { ForgotPasswordStepCode } from './forgot-password/forgot-password-step-code';
import { ForgotPasswordStepPassword } from './forgot-password/forgot-password-step-password';
import { ForgotPasswordStepVerifyEmail } from './forgot-password/forgot-password-step-verify-email';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

type Step = 'email' | 'code' | 'password' | 'verify-email';

export function ForgotPasswordForm({ onSuccess, onSwitchToSignIn }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleCodeSent = (userEmail: string) => {
    setEmail(userEmail);
    setStep('code');
  };

  const handleEmailNotVerified = (userEmail: string) => {
    setEmail(userEmail);
    setStep('verify-email');
  };

  const handleCodeVerified = (verificationCode: string) => {
    setCode(verificationCode);
    setStep('password');
  };

  const handleEmailVerified = () => {
    setStep('email');
  };

  const handleBackToEmail = () => {
    setEmail('');
    setCode('');
    setStep('email');
  };

  const handleBackToCode = () => {
    setCode('');
    setStep('code');
  };

  // Render the appropriate step
  if (step === 'verify-email' && email) {
    return (
      <ForgotPasswordStepVerifyEmail
        email={email}
        onEmailVerified={handleEmailVerified}
        onBack={handleBackToEmail}
      />
    );
  }

  if (step === 'code' && email) {
    return (
      <ForgotPasswordStepCode
        email={email}
        onCodeVerified={handleCodeVerified}
        onBack={handleBackToEmail}
      />
    );
  }

  if (step === 'password' && email && code) {
    return (
      <ForgotPasswordStepPassword
        email={email}
        code={code}
        onSuccess={onSuccess || (() => {})}
        onBack={handleBackToCode}
      />
    );
  }

  // Default: Email step
  return (
    <ForgotPasswordStepEmail
      onCodeSent={handleCodeSent}
      onEmailNotVerified={handleEmailNotVerified}
      onSwitchToSignIn={onSwitchToSignIn}
    />
  );
}
