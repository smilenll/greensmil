'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { confirmSignUp, resendSignUpCode, autoSignIn } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2, AlertCircle } from 'lucide-react';

interface VerifyCodeData {
  code: string;
}

interface SignUpStepVerifyProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SignUpStepVerify({ email, onSuccess, onCancel }: SignUpStepVerifyProps) {
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<VerifyCodeData>();

  const onSubmit = async (data: VerifyCodeData) => {
    try {
      setError('');
      setResendMessage('');

      const { nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: data.code.trim()
      });

      // Handle auto sign-in if enabled
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        await autoSignIn();
      }

      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific errors
        if (err.message.includes('CodeMismatchException')) {
          setError('Invalid verification code. Please check and try again.');
        } else if (err.message.includes('ExpiredCodeException')) {
          setError('Verification code has expired. Please request a new one.');
        } else if (err.message.includes('LimitExceededException')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Verification failed. Please try again.');
      }
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setError('');
      setResendMessage('');

      await resendSignUpCode({ username: email });

      setResendMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="font-semibold text-lg">Verify Your Email</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a verification code to
        </p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            Verification Code
          </label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            {...register('code', {
              required: 'Verification code is required',
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
          Verify & Complete Sign Up
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
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Use Different Email
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        Didn't receive the code? Check your spam folder or click "Resend Code"
      </p>
    </div>
  );
}
