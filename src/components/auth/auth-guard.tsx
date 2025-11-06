'use client';

import { LoadingSpinner } from '@/components';
import { useAuth } from '@/contexts/auth-context';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallback = null,
  loadingFallback = <LoadingSpinner />
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <AuthGuard requireAdmin={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function AuthenticatedOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}