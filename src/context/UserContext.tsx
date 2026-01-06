import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse } from '../types';
import { loginUser, registerUser, getUserInfo } from '../api/api';

interface UserContextType {
  user: User | null;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  claimSocial: (platform: 'x' | 'telegram' | 'whatsapp') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('narrio_user');
    const token = localStorage.getItem('narrio_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
    }
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
      token: data.access_token,
      refreshToken: data.refresh_token,
      socialsClaimed: { x: false, telegram: false, whatsapp: false }
    };
    localStorage.setItem('narrio_token', data.access_token);
    localStorage.setItem('narrio_refresh_token', data.refresh_token);
    saveSession(newUser);
  };

  const handleRegister = async (email: string, password: string) => {
    await registerUser(email, password);
  };

  const logout = () => saveSession(null);

  const claimSocial = (platform: 'x' | 'telegram' | 'whatsapp') => {
    // This should also ideally be a backend call, but for MVP we sync after action
    if (!user || user.socialsClaimed[platform]) return;
    const updated = {
      ...user,
      credits: user.credits + 5,
      socialsClaimed: { ...user.socialsClaimed, [platform]: true }
    };
    saveSession(updated);
  };

  return (
    <div id="user-provider-container">
      <UserContext.Provider value={{ user, handleLogin, handleRegister, refreshUser, logout, claimSocial }}>
        {children}
      </UserContext.Provider>
    </div>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};