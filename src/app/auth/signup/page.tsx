'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui';
import { AuthDialogContent } from '@/components/auth/auth-dialog-content';
import { useAuth } from '@/contexts/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleClose = () => {
    setIsOpen(false);
    // Navigate back to home when dialog is closed
    router.push('/');
  };

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AuthDialogContent onClose={handleClose} defaultTab="signup" />
      </DialogContent>
    </Dialog>
  );
}
