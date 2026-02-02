import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser, getUserInfo } from '../api/auth.api';
import type { User, LoginResponse } from '../types';
import { useAuthStore } from '../app/store/authStore';

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
  const [authChecked, setAuthChecked] = useState(false);
  const setTokens = useAuthStore((state: any) => state.setTokens);
  const setUser = useAuthStore((state: any) => state.setUser);
  const clear = useAuthStore((state: any) => state.clear);
  const token = useAuthStore((state: any) => state.token);

  const isAuthenticated = !!token;

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('narrio_token');
      if (!storedToken) {
        setAuthChecked(true);
        return;
      }

      try {
        const data = await getUserInfo();
        setUser({ id: data.email, email: data.email, credits: data.credits, isLoggedIn: true });
      } catch {
        clear();
      } finally {
        setAuthChecked(true);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data: LoginResponse = await loginUser(email, password);
    setTokens(data.access_token, data.refresh_token);
    setUser({ id: email, email, credits: data.credits, isLoggedIn: true, token: data.access_token, refreshToken: data.refresh_token });
  };

  const register = async (email: string, password: string, deviceFingerprintHash: string) => {
    await registerUser(email, password, deviceFingerprintHash);
  };

  const logout = () => {
    clear();
    window.location.href = '/signin';
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('narrio_token');
    if (!currentToken) return;
    const data = await getUserInfo();
    setUser((prev: any) => prev ? { ...prev, credits: data.credits } : prev);
  };

  return (
    <UserContext.Provider
      value={{ user: useAuthStore.getState().user, authChecked, isAuthenticated, login, register, logout, refreshUser }}
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
