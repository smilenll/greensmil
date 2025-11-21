'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface EmailFormData {
  email: string;
}

interface ForgotPasswordStepEmailProps {
  onCodeSent: (email: string) => void;
  onEmailNotVerified: (email: string) => void;
  onSwitchToSignIn?: () => void;
}

export function ForgotPasswordStepEmail({
  onCodeSent,
  onEmailNotVerified,
  onSwitchToSignIn
}: ForgotPasswordStepEmailProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<EmailFormData>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    try {
      setError('');
      const { nextStep } = await resetPassword({ username: data.email });

      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        onCodeSent(data.email);
      } else if (nextStep.resetPasswordStep === 'DONE') {
        // Password reset complete without code (shouldn't happen normally)
        onCodeSent(data.email);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Cannot reset password for the user as there is no registered/verified email')) {
          onEmailNotVerified(data.email);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          placeholder="you@example.com"
          autoFocus
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Reset Code
      </Button>

      {onSwitchToSignIn && (
        <div className="text-sm text-center">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-muted-foreground hover:text-primary"
          >
            Back to <span className="font-medium">Sign in</span>
          </button>
        </div>
      )}
    </form>
  );
}
