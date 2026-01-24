import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse } from '../types';
import { loginUser, registerUser, getUserInfo } from '../api/api';

interface UserContextType {
  user: User | null;
  authChecked: boolean;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  /**
   * 🔐 AUTH BOOTSTRAP
   * Source of truth = backend (/auth/me)
   * Axios interceptor will refresh token automatically
   */
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('narrio_token');
      if (!token) {
        setAuthChecked(true);
        return;
      }

      try {
        const data = await getUserInfo();

        const restoredUser: User = {
          id: data.email,
          email: data.email,
          credits: data.credits,
          isLoggedIn: true,
        };

        setUser(restoredUser);
        localStorage.setItem('narrio_user', JSON.stringify(restoredUser));
      } catch {
        localStorage.clear();
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    bootstrapAuth();
  }, []);

  const saveSession = (u: User | null) => {
    setUser(u);

    if (u) {
      localStorage.setItem('narrio_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('narrio_user');
      localStorage.removeItem('narrio_token');
      localStorage.removeItem('narrio_refresh_token');
    }
  };

  const refreshUser = async () => {
    try {
      const data = await getUserInfo();
      setUser(prev =>
        prev
          ? { ...prev, credits: data.credits, email: data.email }
          : prev
      );
    } catch (e) {
      console.error('Failed to refresh user info:', e);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const data: LoginResponse = await loginUser(email, password);

    const newUser: User = {
      id: email,
      email,
      credits: data.credits,
      isLoggedIn: true,
    };

    localStorage.setItem('narrio_token', data.access_token);
    localStorage.setItem('narrio_refresh_token', data.refresh_token);

    saveSession(newUser);
  };

  const handleRegister = async (email: string, password: string) => {
    await registerUser(email, password);
  };

  const logout = () => {
    saveSession(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        authChecked,
        handleLogin,
        handleRegister,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
