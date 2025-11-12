'use client';

import { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { DialogHeader, DialogTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

interface AuthDialogContentProps {
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthDialogContent({ onClose, defaultTab = 'signin' }: AuthDialogContentProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  // If user is authenticated, show simple profile
  if (isAuthenticated && user) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              signOut();
              onClose();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </>
    );
  }

  // If not authenticated, show auth forms
  return (
    <>
      {showForgotPassword ? (
        <>
          <DialogHeader>
            <DialogTitle data-test="auth-dialog-title">Reset Password</DialogTitle>
          </DialogHeader>
          <ForgotPasswordForm
            onSuccess={() => {
              setShowForgotPassword(false);
              onClose();
            }}
            onSwitchToSignIn={() => {
              setShowForgotPassword(false);
              // Clear password reset localStorage when switching back to sign in
              localStorage.removeItem('password_reset_email');
              localStorage.removeItem('password_reset_code');
            }}
          />
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle data-test="auth-dialog-title">Welcome</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm
                onSuccess={onClose}
                onForgotPassword={() => {
                  // Clear any old password reset data when starting fresh
                  localStorage.removeItem('password_reset_email');
                  localStorage.removeItem('password_reset_code');
                  setShowForgotPassword(true);
                }}
              />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm onSuccess={onClose} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}
