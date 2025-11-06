'use client';

import { User, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { AuthDialog } from './auth-dialog';
import { useAuth } from '@/contexts/auth-context';

export function UserMenu() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <UserCircle className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }

  return (
    <AuthDialog>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label={isAuthenticated ? "User profile" : "Sign in"}
        data-test="sign-in-button"
      >
        {isAuthenticated ? (
          <User className="h-4 w-4" />
        ) : (
          <UserCircle className="h-4 w-4" />
        )}
      </Button>
    </AuthDialog>
  );
}
