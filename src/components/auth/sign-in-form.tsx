'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'aws-amplify/auth';
import { Button, Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { verifyRecaptcha } from '@/actions/recaptcha-actions';

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>();
  const { executeRecaptcha } = useRecaptcha();

  const onSubmit = async (data: SignInFormData) => {
    try {
      setError('');

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
      
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

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
          {...register('password', { required: 'Password is required' })}
          placeholder="••••••••"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

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
