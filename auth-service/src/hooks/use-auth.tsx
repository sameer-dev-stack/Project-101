
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: 'rider' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, name: string, role?: 'rider' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect will run once on mount to check for a persisted session.
    // In a real JWT setup, you'd verify a token here.
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      // Clear corrupted data
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, name: string, role: 'rider' | 'admin' = 'rider') => {
    const userData = { email, name, role };
    // In a real app, you would get a JWT from your API here.
    // We are mocking this by storing user data in localStorage.
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    // In a real app, you'd call a '/api/logout' endpoint to invalidate the token.
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
