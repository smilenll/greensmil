'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2, AlertCircle } from 'lucide-react';

interface CodeFormData {
  code: string;
}

interface ForgotPasswordStepCodeProps {
  email: string;
  onCodeVerified: (code: string) => void;
  onBack: () => void;
}

export function ForgotPasswordStepCode({
  email,
  onCodeVerified,
  onBack
}: ForgotPasswordStepCodeProps) {
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CodeFormData>({
    mode: 'onTouched',
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: CodeFormData) => {
    try {
      setError('');
      setResendMessage('');
      onCodeVerified(data.code.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
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

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-lg">Enter Confirmation Code</h3>
        <p className="text-sm text-muted-foreground">
          We sent a reset code to
        </p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            Confirmation Code
          </label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            {...register('code', {
              required: 'Code is required',
              pattern: {
                value: /^[0-9]{6}$/,
                message: 'Code must be 6 digits'
              }
            })}
            placeholder="000000"
            autoFocus
            disabled={isSubmitting}
            className="text-center text-lg tracking-widest"
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400 rounded-md">
            {resendMessage}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
        </Button>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendCode}
            disabled={isResending || isSubmitting}
          >
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Code
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back to Email
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        Didn't receive the code? Check your spam folder or click "Resend Code"
      </p>
    </div>
  );
}
