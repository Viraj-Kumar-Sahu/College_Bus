import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';
import * as authUtils from '@/utils/auth';

export type UserRole = 'admin' | 'student' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  busId?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      const token = authUtils.getToken();
      const savedUser = authUtils.getUser();

      if (token && savedUser) {
        // Attach token for validation
        (api.defaults.headers as any).Authorization = `Bearer ${token}`;
        // Validate token by fetching user info
        try {
          const response = await api.get('/auth/me');
          const userData = response.data.user;
          setUser(userData);
          authUtils.setUser(userData);
        } catch (error) {
          // Token invalid, clear storage
          authUtils.logout();
          delete (api.defaults.headers as any).Authorization;
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.status === 200) {
        const { token, user: userData } = response.data;
        
        // Store token and user data
        authUtils.setToken(token);
        authUtils.setUser(userData);
        setUser(userData);
        // Attach token for subsequent requests
        (api.defaults.headers as any).Authorization = `Bearer ${token}`;
        
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    authUtils.logout();
    delete (api.defaults.headers as any).Authorization;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};