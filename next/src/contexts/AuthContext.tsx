'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, isAuthenticated, logout as logoutUtil, getCurrentUser, removeAuthToken } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Fetch user data from API
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If no user data returned, token is likely invalid
            removeAuthToken();
          }
        } catch {
          // If fetching user fails, remove invalid token
          console.log('Invalid auth token, clearing...');
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await logoutUtil();
    setUser(null);
  };

  const isSuperAdmin = user?.is_superuser ?? false;

  return (
    <AuthContext.Provider value={{ user, isLoading, isSuperAdmin, login, logout }}>
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
