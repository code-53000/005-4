import { create } from 'zustand';
import { api } from '@/utils/api';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username: string, password: string) => {
    const response = await api.login({ username, password });
    localStorage.setItem('token', response.token);
    localStorage.setItem('username', response.username);
    set({
      token: response.token,
      username: response.username,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({
      token: null,
      username: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    set({
      token,
      username,
      isAuthenticated: !!token,
    });
  },
}));
