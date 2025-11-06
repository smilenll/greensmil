'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui';
import { ReactNode } from 'react';

interface AdminButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function AdminButton({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  ...props
}: AdminButtonProps) {
  const { isAdmin } = useAuth();

  // Don't render if user is not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}