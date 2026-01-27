import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser, getUserInfo } from '../api/api';
import type { User, LoginResponse } from '../types';

interface UserContextType {
  user: User | null;
  authChecked: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, deviceFingerprintHash: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const token = localStorage.getItem('narrio_token');
  const isAuthenticated = !!token;

  /** 🔁 Restore session on app load */
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setAuthChecked(true);
        return;
      }

      try {
        const data = await getUserInfo();
        setUser({
          id: data.email,
          email: data.email,
          credits: data.credits,
          isLoggedIn: true,
        });
      } catch {
        localStorage.clear();
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data: LoginResponse = await loginUser(email, password);

    localStorage.setItem('narrio_token', data.access_token);
    localStorage.setItem('narrio_refresh_token', data.refresh_token);

    setUser({
      id: email,
      email,
      credits: data.credits,
      isLoggedIn: true,
    });
  };

  const register = async (email: string, password: string, deviceFingerprintHash: string) => {
    await registerUser(email, password, deviceFingerprintHash);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/signin';
  };

  const refreshUser = async () => {
    if (!token) return;
    const data = await getUserInfo();
    setUser(prev => prev ? { ...prev, credits: data.credits } : prev);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        authChecked,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
