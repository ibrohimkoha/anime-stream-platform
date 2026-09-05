'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, fetchAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  isVIPModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openVIPModal: () => void;
  closeVIPModal: () => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthModalOpen: false,
  isVIPModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  openVIPModal: () => {},
  closeVIPModal: () => {},
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchAPI('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.warn('Auth check failed:', err);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        isVIPModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openVIPModal: () => setIsVIPModalOpen(true),
        closeVIPModal: () => setIsVIPModalOpen(false),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
