'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword, confirmResetPassword, resendSignUpCode, confirmSignUp } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface ForgotPasswordFormData {
  email: string;
}

interface CodeFormData {
  code: string;
}

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

const RESET_EMAIL_KEY = 'password_reset_email';
const RESET_CODE_KEY = 'password_reset_code';

export function ForgotPasswordForm({ onSuccess, onSwitchToSignIn }: ForgotPasswordFormProps) {
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'verify-email'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>();
  const { register: registerCode, handleSubmit: handleSubmitCode, formState: { isSubmitting: isVerifying } } = useForm<CodeFormData>();
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { isSubmitting: isResetting }, watch } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  // Load pending password reset from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(RESET_EMAIL_KEY);
    const savedCode = localStorage.getItem(RESET_CODE_KEY);

    if (savedEmail && savedCode) {
      setEmail(savedEmail);
      setCode(savedCode);
      setStep('password');
    } else if (savedEmail) {
      setEmail(savedEmail);
      setStep('code');
    }
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
      const { nextStep } = await resetPassword({ username: data.email });

      setEmail(data.email);
      // Save email to localStorage for state persistence
      localStorage.setItem(RESET_EMAIL_KEY, data.email);

      // Check nextStep to determine flow
      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setStep('code');
      } else if (nextStep.resetPasswordStep === 'DONE') {
        // Password reset complete without code
        localStorage.removeItem(RESET_EMAIL_KEY);
        onSuccess?.();
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Cannot reset password for the user as there is no registered/verified email')) {
          setStep('verify-email');
        } else if (err.message.includes('UserNotFoundException')) {
          setError('No account found with this email address.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to send reset code');
      }
    }
  };

  const onVerifyCode = async (data: CodeFormData) => {
    try {
      setError('');
      setCode(data.code);
      // Save code to localStorage
      localStorage.setItem(RESET_CODE_KEY, data.code);
      // Move to password entry step
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    }
  };

  const onReset = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: data.newPassword
      });
      // Clear saved data from localStorage on success
      localStorage.removeItem(RESET_EMAIL_KEY);
      localStorage.removeItem(RESET_CODE_KEY);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setError('');
      setResendMessage('');
      await resetPassword({ username: email });
      setResendMessage('Code resent successfully! Check your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setError('');
    setResendMessage('');
    localStorage.removeItem(RESET_EMAIL_KEY);
    localStorage.removeItem(RESET_CODE_KEY);
  };

  const handleBackToCode = () => {
    setStep('code');
    setCode('');
    setError('');
    setResendMessage('');
    localStorage.removeItem(RESET_CODE_KEY);
  };

  const handleSendVerificationCode = async () => {
    try {
      setIsResending(true);
      setError('');
      setResendMessage('');
      await resendSignUpCode({ username: email });
      setResendMessage('Verification code sent! Check your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async (data: CodeFormData) => {
    try {
      setError('');
      await confirmSignUp({ username: email, confirmationCode: data.code });
      setResendMessage('Email verified! You can now reset your password.');
      // Go back to email step to retry password reset
      setTimeout(() => {
        setStep('email');
        setResendMessage('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    }
  };

  // Step: Email verification
  if (step === 'verify-email') {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Email Verification Required</h3>
          <p className="text-sm text-muted-foreground">
            Your email address <span className="font-medium">{email}</span> needs to be verified before you can reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmitCode(handleVerifyEmail)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="verifyCode" className="text-sm font-medium">Verification Code</label>
            <Input
              id="verifyCode"
              {...registerCode('code', { required: 'Code is required' })}
              placeholder="123456"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {resendMessage && <p className="text-sm text-green-600">{resendMessage}</p>}

          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
        </form>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleSendVerificationCode}
            disabled={isResending}
          >
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Code
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={handleBackToEmail}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Code verification
  if (step === 'code') {
    return (
      <form onSubmit={handleSubmitCode(onVerifyCode)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">Confirmation Code</label>
          <Input
            id="code"
            {...registerCode('code', { required: 'Code is required' })}
            placeholder="123456"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            We sent a reset code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {resendMessage && <p className="text-sm text-green-600">{resendMessage}</p>}

        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleResendCode}
            disabled={isResending}
          >
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Code
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={handleBackToEmail}
          >
            Back
          </Button>
        </div>
      </form>
    );
  }

  // Step 3: New password entry
  if (step === 'password') {
    return (
      <form onSubmit={handleSubmitReset(onReset)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
          <Input
            id="newPassword"
            type="password"
            {...registerReset('newPassword', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
            placeholder="••••••••"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
          <Input
            id="confirmPassword"
            type="password"
            {...registerReset('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isResetting}>
          {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleBackToCode}
        >
          Back to Code
        </Button>
      </form>
    );
  }

  // Step 1: Email entry

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: 'Email is required' })}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Reset Code
      </Button>

      <div className="text-sm text-center">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-muted-foreground hover:text-primary"
        >
          Back to <span className="font-medium">Sign in</span>
        </button>
      </div>
    </form>
  );
}
