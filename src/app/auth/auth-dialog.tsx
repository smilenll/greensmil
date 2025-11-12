'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui';
import { AuthDialogContent } from '@/components/auth/auth-dialog-content';

interface AuthDialogProps {
  children: React.ReactNode;
  defaultTab?: 'signin' | 'signup';
}

export function AuthDialog({ children, defaultTab = 'signin' }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent data-test="auth-dialog" className="sm:max-w-md">
        <AuthDialogContent onClose={() => setIsOpen(false)} defaultTab={defaultTab} />
      </DialogContent>
    </Dialog>
  );
}