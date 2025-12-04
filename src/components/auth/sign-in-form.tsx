'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui';
import { FormInput } from '@/components/form-fields';
import { Loader2 } from 'lucide-react';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { verifyRecaptcha } from '@/actions/recaptcha-actions';
import { GoogleOAuthButton } from './google-oauth-button';

interface SignInFormData {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export function SignInForm({ onSuccess, onForgotPassword }: SignInFormProps) {
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SignInFormData>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { executeRecaptcha } = useRecaptcha();

  const onSubmit = async (data: SignInFormData) => {
    try {
      setError('');
      setGoogleError('');

      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('login');
      if (!recaptchaToken) {
        setError('Failed to verify reCAPTCHA. Please try again.');
        return;
      }

      // Verify reCAPTCHA on server
      const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login');
      if (!recaptchaResult.success) {
        setError(recaptchaResult.error || 'reCAPTCHA verification failed');
        return;
      }

      const signInResult = await signIn({ username: data.email, password: data.password });

      // Check if user needs to verify their email
      if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setError('Please verify your email address before signing in. Check your inbox for a verification code.');
        return;
      }

      reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Google OAuth Button */}
      <GoogleOAuthButton
        disabled={isSubmitting}
        onError={setGoogleError}
      />

      {/* Google Sign-In Error */}
      {googleError && (
        <div className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900">
          <p className="font-medium mb-1">Error</p>
          <p>{googleError}</p>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

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
        autoComplete="current-password"
        placeholder="••••••••"
        required
        registration={register('password', { required: 'Password is required' })}
        error={errors.password?.message}
        disabled={isSubmitting}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <div className="text-sm text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-primary hover:underline"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}
