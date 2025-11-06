'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/navigation';

interface User {
  userId: string;
  username: string;
  email?: string;
  groups?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserGroups: () => string[];
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();

    // Listen for auth events from Amplify
    const authListener = (data: { payload: { event: string } }) => {
      const { payload } = data;

      switch (payload.event) {
        case 'signInWithRedirect':
        case 'signedIn':
        case 'autoSignIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          setError(null);
          break;
        case 'tokenRefresh':
          checkUser();
          break;
        default:
          break;
      }
    };

    // Subscribe to auth events
    const unsubscribe = Hub.listen('auth', authListener);

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  async function checkUser() {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      // Get groups from the ID token payload
      const idToken = session.tokens?.idToken;
      let groups: string[] = [];

      if (idToken) {
        const payload = idToken.payload;
        const cognitoGroups = payload['cognito:groups'];
        groups = Array.isArray(cognitoGroups) ? cognitoGroups.filter(g => typeof g === 'string') : [];
      }

      const userData = {
        userId: currentUser.userId,
        username: currentUser.username,
        email: (typeof idToken?.payload.email === 'string' ? idToken.payload.email : undefined) || currentUser.signInDetails?.loginId || currentUser.username,
        groups: groups
      };

      setUser(userData);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setError(null);
      // Navigate to home page after successful sign out
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  }

  function getUserGroups(): string[] {
    return user?.groups || [];
  }

  function hasRole(role: string): boolean {
    const groups = getUserGroups();
    return groups.some(group => group.toLowerCase() === role.toLowerCase());
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    checkUser,
    signOut: handleSignOut,
    getUserGroups,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}