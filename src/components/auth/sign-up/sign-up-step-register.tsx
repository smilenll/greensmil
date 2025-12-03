'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signUp } from 'aws-amplify/auth';
import { Button } from '@/components/ui';
import { FormInput } from '@/components/form-fields';
import { Loader2 } from 'lucide-react';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { verifyRecaptcha } from '@/actions/recaptcha-actions';

interface SignUpData {
  username: string;
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
      username: '',
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
      // Note: username = email (for login), preferred_username = display name
      const { nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            preferred_username: data.username
          },
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
      <FormInput
        label="Username"
        type="text"
        autoComplete="username"
        placeholder="johndoe"
        required
        registration={register('username', {
          required: 'Username is required',
          minLength: {
            value: 3,
            message: 'Username must be at least 3 characters'
          },
          maxLength: {
            value: 20,
            message: 'Username must be at most 20 characters'
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores'
          }
        })}
        error={errors.username?.message}
        hint="3-20 characters, letters, numbers, and underscores only"
        disabled={isSubmitting}
      />

      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        registration={register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <FormInput
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        registration={register('password', {
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
        error={errors.password?.message}
        hint="At least 8 characters with uppercase, lowercase, number and special character"
        disabled={isSubmitting}
      />

      <FormInput
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        registration={register('confirmPassword', {
          required: 'Please confirm your password',
          validate: value => value === password || 'Passwords do not match'
        })}
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
      />

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
