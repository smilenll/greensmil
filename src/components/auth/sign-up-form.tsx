'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { signUp, confirmSignUp, resendSignUpCode, autoSignIn } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ConfirmFormData {
  code: string;
}

interface SignUpFormProps {
  onSuccess?: () => void;
}

const CONFIRMATION_EMAIL_KEY = 'signup_confirmation_email';

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<SignUpFormData>();
  const { register: registerConfirm, handleSubmit: handleSubmitConfirm, formState: { isSubmitting: isConfirming } } = useForm<ConfirmFormData>();

  const password = watch('password');

  // Load pending confirmation from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(CONFIRMATION_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setNeedsConfirmation(true);
    }
  }, []);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError('');
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: { email: data.email },
          autoSignIn: true // Auto sign-in after confirmation
        }
      });

      setEmail(data.email);
      // Save email to localStorage for state persistence
      localStorage.setItem(CONFIRMATION_EMAIL_KEY, data.email);

      // Check nextStep to determine flow
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true);
      } else if (nextStep.signUpStep === 'DONE') {
        // User is already confirmed
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  const onConfirm = async (data: ConfirmFormData) => {
    try {
      setError('');
      const { nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: data.code
      });

      // Handle autoSignIn if enabled
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        await autoSignIn();
      }

      // Clear saved email from localStorage on success
      localStorage.removeItem(CONFIRMATION_EMAIL_KEY);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setError('');
      setResendMessage('');
      await resendSignUpCode({ username: email });
      setResendMessage('Code resent successfully! Check your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignUp = () => {
    setNeedsConfirmation(false);
    setEmail('');
    localStorage.removeItem(CONFIRMATION_EMAIL_KEY);
  };

  if (needsConfirmation) {
    return (
      <form onSubmit={handleSubmitConfirm(onConfirm)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">Confirmation Code</label>
          <Input
            id="code"
            {...registerConfirm('code', { required: 'Code is required' })}
            placeholder="123456"
          />
          <p className="text-xs text-muted-foreground">
            We sent a confirmation code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {resendMessage && <p className="text-sm text-green-600">{resendMessage}</p>}

        <Button type="submit" className="w-full" disabled={isConfirming}>
          {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm
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
            onClick={handleBackToSignUp}
          >
            Back to Sign Up
          </Button>
        </div>
      </form>
    );
  }

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

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input
          id="password"
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' }
          })}
          placeholder="••••••••"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign Up
      </Button>
    </form>
  );
}
