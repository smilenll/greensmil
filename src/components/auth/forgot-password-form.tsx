'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface ForgotPasswordFormData {
  email: string;
}

interface ResetPasswordFormData {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function ForgotPasswordForm({ onSuccess, onSwitchToSignIn }: ForgotPasswordFormProps) {
  const [error, setError] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [email, setEmail] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>();
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { isSubmitting: isResetting }, watch } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
      await resetPassword({ username: data.email });
      setEmail(data.email);
      setNeedsCode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    }
  };

  const onReset = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      await confirmResetPassword({
        username: email,
        confirmationCode: data.code,
        newPassword: data.newPassword
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  if (needsCode) {
    return (
      <form onSubmit={handleSubmitReset(onReset)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">Confirmation Code</label>
          <Input
            id="code"
            {...registerReset('code', { required: 'Code is required' })}
            placeholder="123456"
          />
          <p className="text-xs text-muted-foreground">Check your email for the reset code</p>
        </div>

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
