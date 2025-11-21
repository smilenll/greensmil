'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { confirmResetPassword } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2, AlertCircle } from 'lucide-react';

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ForgotPasswordStepPasswordProps {
  email: string;
  code: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function ForgotPasswordStepPassword({
  email,
  code,
  onSuccess,
  onBack
}: ForgotPasswordStepPasswordProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<PasswordFormData>({
    mode: 'onTouched',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setError('');

      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: data.newPassword
      });

      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific errors
        if (err.message.includes('CodeMismatchException')) {
          setError('Invalid or expired code. Please go back and request a new code.');
        } else if (err.message.includes('InvalidPasswordException')) {
          setError('Password does not meet the requirements.');
        } else if (err.message.includes('LimitExceededException')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to reset password');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-lg">Set New Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your new password for
        </p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Password must contain uppercase, lowercase, number and special character'
              }
            })}
            placeholder="••••••••"
            autoFocus
            disabled={isSubmitting}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            At least 8 characters with uppercase, lowercase, number and special character
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back to Code
        </Button>
      </form>
    </div>
  );
}
