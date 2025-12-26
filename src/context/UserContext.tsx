
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginResponse } from '../types';
import { loginUser, registerUser } from '../api/api';

interface UserContextType {
  user: User | null;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  claimSocial: (platform: 'x' | 'telegram' | 'whatsapp') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Using React.PropsWithChildren to ensure children are correctly typed and recognized in JSX usage (e.g., in index.tsx)
export function UserProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('narrio_user');
    const token = localStorage.getItem('narrio_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const saveSession = (u: User | null, token?: string) => {
    setUser(u);
    if (u && token) {
      localStorage.setItem('narrio_user', JSON.stringify(u));
      localStorage.setItem('narrio_token', token);
    } else {
      localStorage.removeItem('narrio_user');
      localStorage.removeItem('narrio_token');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const data: LoginResponse = await loginUser(email, password);
    const newUser: User = {
      id: email, // Backend doesn't return user ID explicitly, using email
      email,
      credits: data.credits,
      isLoggedIn: true,
      token: data.access_token,
      socialsClaimed: { x: false, telegram: false, whatsapp: false }
    };
    saveSession(newUser, data.access_token);
  };

  const handleRegister = async (email: string, password: string) => {
    await registerUser(email, password);
    // After registration, we don't automatically log in here 
    // to allow the UI to handle the transition or follow with handleLogin
  };

  const logout = () => saveSession(null);

  const addCredits = (amount: number) => {
    if (!user) return;
    const updated = { ...user, credits: user.credits + amount };
    saveSession(updated, user.token);
  };

  const spendCredits = (amount: number): boolean => {
    if (!user || user.credits < amount) return false;
    const updated = { ...user, credits: user.credits - amount };
    saveSession(updated, user.token);
    return true;
  };

  const claimSocial = (platform: 'x' | 'telegram' | 'whatsapp') => {
    if (!user || user.socialsClaimed[platform]) return;
    const updated = {
      ...user,
      credits: user.credits + 5,
      socialsClaimed: { ...user.socialsClaimed, [platform]: true }
    };
    saveSession(updated, user.token);
  };

  return (
    <UserContext.Provider value={{ user, handleLogin, handleRegister, logout, addCredits, spendCredits, claimSocial }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
