import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isApproved: boolean;
  } | null;
  setAuth: (
    token: string,
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isApproved: boolean;
    },
  ) => void;
  clearAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
