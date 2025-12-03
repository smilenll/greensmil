'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn, signInWithRedirect } from 'aws-amplify/auth';
import { Button } from '@/components/ui';
import { FormInput } from '@/components/form-fields';
import { Loader2 } from 'lucide-react';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { verifyRecaptcha } from '@/actions/recaptcha-actions';

// Google icon component
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SignInFormData>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { executeRecaptcha } = useRecaptcha();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleError('');
      setIsGoogleLoading(true);
      await signInWithRedirect({ provider: 'Google' });
    } catch (err) {
      setIsGoogleLoading(false);

      // Provide better error message based on error type
      const errorMessage = err instanceof Error ? err.message : 'Google sign in failed';

      if (errorMessage.includes('oauth') || errorMessage.includes('not configured')) {
        setGoogleError(
          'Google Sign-In is not available in development mode. ' +
          'This feature is enabled only in production. ' +
          'Please use email/password sign-in for local development.'
        );
      } else {
        setGoogleError(errorMessage);
      }
    }
  };

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
      {/* Google Sign-In Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span className="ml-2">Continue with Google</span>
      </Button>

      {/* Google Sign-In Error - shown right below the button */}
      {googleError && (
        <div className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900">
          <p className="font-medium mb-1">Development Mode Notice</p>
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
