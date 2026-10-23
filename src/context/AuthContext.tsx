import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (payload: { name?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shs_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('shs_auth_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session check failed or expired, clearing token.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.auth.login({ email, password });
    if (res.token && res.user) {
      localStorage.setItem('shs_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Authentication response invalid.');
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }): Promise<User> => {
    const res = await api.auth.register(payload);
    if (res.token && res.user) {
      localStorage.setItem('shs_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration response invalid.');
  };

  const logout = () => {
    localStorage.removeItem('shs_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload: { name?: string; phone?: string }) => {
    const res = await api.auth.updateProfile(payload);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
