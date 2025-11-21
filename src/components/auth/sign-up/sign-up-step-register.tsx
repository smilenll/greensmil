'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signUp } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { verifyRecaptcha } from '@/actions/recaptcha-actions';

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignUpStepRegisterProps {
  onSuccess: (email: string) => void;
}

export function SignUpStepRegister({ onSuccess }: SignUpStepRegisterProps) {
  const [error, setError] = useState('');
  const { executeRecaptcha } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<SignUpData>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpData) => {
    try {
      setError('');

      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('signup');
      if (!recaptchaToken) {
        setError('Failed to verify reCAPTCHA. Please try again.');
        return;
      }

      // Verify reCAPTCHA on server
      const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'signup');
      if (!recaptchaResult.success) {
        setError(recaptchaResult.error || 'reCAPTCHA verification failed');
        return;
      }

      // Sign up with Cognito
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: { email: data.email },
          autoSignIn: true
        }
      });

      // Check if confirmation is needed
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        onSuccess(data.email);
      } else if (nextStep.signUpStep === 'DONE') {
        // User already confirmed (shouldn't happen, but handle it)
        onSuccess(data.email);
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific Cognito errors
        if (err.message.includes('UsernameExistsException') || err.message.includes('already exists')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Sign up failed. Please try again.');
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
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password', {
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
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
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
            validate: value => value === password || 'Passwords do not match'
          })}
          placeholder="••••••••"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        This site is protected by reCAPTCHA and the Google{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Terms of Service
        </a>{' '}
        apply.
      </p>
    </form>
  );
}
