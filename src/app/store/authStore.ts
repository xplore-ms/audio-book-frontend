import { create } from 'zustand';
import type { User } from '../../types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  token: localStorage.getItem('narrio_token'),
  refreshToken: localStorage.getItem('narrio_refresh_token'),
  user: null,
  setTokens: (token: string | null, refreshToken: string | null) => {
    if (token) localStorage.setItem('narrio_token', token); else localStorage.removeItem('narrio_token');
    if (refreshToken) localStorage.setItem('narrio_refresh_token', refreshToken); else localStorage.removeItem('narrio_refresh_token');
    set({ token, refreshToken });
  },
  setUser: (user: User | null) => set({ user }),
  clear: () => {
    localStorage.removeItem('narrio_token');
    localStorage.removeItem('narrio_refresh_token');
    set({ token: null, refreshToken: null, user: null });
  }
}));
