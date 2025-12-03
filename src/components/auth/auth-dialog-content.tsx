'use client';

import { useState } from 'react';
import { User, LogOut, Trash2 } from 'lucide-react';
import { DialogHeader, DialogTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { deleteUser } from 'aws-amplify/auth';
import { toast } from 'sonner';

interface AuthDialogContentProps {
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthDialogContent({ onClose, defaultTab = 'signin' }: AuthDialogContentProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUser();
      toast.success('Account deleted successfully');
      await signOut();
      onClose();
    } catch (err) {
      toast.error('Failed to delete account');
      console.error('Delete account error:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

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
            <h3 className="font-medium">{user.preferredUsername || user.email}</h3>
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

          {!showDeleteConfirmation ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-destructive rounded-md bg-destructive/5">
              <p className="text-sm font-medium text-destructive">
                Are you sure you want to delete your account?
              </p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
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
