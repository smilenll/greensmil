'use client';

import { useState, useEffect } from 'react';
import { SignUpStepRegister } from './sign-up/sign-up-step-register';
import { SignUpStepVerify } from './sign-up/sign-up-step-verify';

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SIGNUP_STATE_KEY = 'signup_pending_verification';

interface PendingSignUpState {
  email: string;
  timestamp: number;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');

  // Check for pending verification on mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIGNUP_STATE_KEY);
    if (savedState) {
      try {
        const state: PendingSignUpState = JSON.parse(savedState);

        // Check if state is less than 24 hours old (verification codes expire)
        const hoursSinceSignUp = (Date.now() - state.timestamp) / (1000 * 60 * 60);

        if (hoursSinceSignUp < 24) {
          // Resume verification flow
          setEmail(state.email);
          setStep('verify');
        } else {
          // State too old, clean up
          localStorage.removeItem(SIGNUP_STATE_KEY);
        }
      } catch (error) {
        // Invalid state, clean up
        localStorage.removeItem(SIGNUP_STATE_KEY);
      }
    }
  }, []);

  const handleRegistrationSuccess = (userEmail: string) => {
    // Save state for persistence across dialog closes/refreshes
    const state: PendingSignUpState = {
      email: userEmail,
      timestamp: Date.now()
    };
    localStorage.setItem(SIGNUP_STATE_KEY, JSON.stringify(state));

    setEmail(userEmail);
    setStep('verify');
  };

  const handleVerificationSuccess = () => {
    // Clean up persisted state
    localStorage.removeItem(SIGNUP_STATE_KEY);
    onSuccess?.();
  };

  const handleCancelVerification = () => {
    // User wants to start over with different email
    localStorage.removeItem(SIGNUP_STATE_KEY);
    setEmail('');
    setStep('register');
  };

  if (step === 'verify' && email) {
    return (
      <SignUpStepVerify
        email={email}
        onSuccess={handleVerificationSuccess}
        onCancel={handleCancelVerification}
      />
    );
  }

  return <SignUpStepRegister onSuccess={handleRegistrationSuccess} />;
}
