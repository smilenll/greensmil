'use client';

import { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

interface AuthDialogProps {
  children: React.ReactNode;
}

export function AuthDialog({ children }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();


  // If user is authenticated, show simple profile
  if (isAuthenticated && user) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" data-test="auth-dialog">
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
                setIsOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If not authenticated, show auth forms
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setShowForgotPassword(false);
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent data-test="auth-dialog" className="sm:max-w-md">
        {showForgotPassword ? (
          <>
            <DialogHeader>
              <DialogTitle data-test="auth-dialog-title">Reset Password</DialogTitle>
            </DialogHeader>
            <ForgotPasswordForm
              onSuccess={() => {
                setShowForgotPassword(false);
                setIsOpen(false);
              }}
              onSwitchToSignIn={() => setShowForgotPassword(false)}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle data-test="auth-dialog-title">Welcome</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm
                  onSuccess={() => setIsOpen(false)}
                  onForgotPassword={() => setShowForgotPassword(true)}
                />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm onSuccess={() => setIsOpen(false)} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}