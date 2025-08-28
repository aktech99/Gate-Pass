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
      setAuth: (token, user) => {
        console.log(
          '🔐 Setting auth - Token exists:',
          !!token,
          'User:',
          user?.email,
        );
        set({ token, user });
      },
      clearAuth: () => {
        console.log('🔐 Clearing auth');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);

// Helper function to manually get auth data from localStorage
export const getStoredAuthData = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📦 Stored auth data:', parsed);
      return {
        token: parsed.state?.token || null,
        user: parsed.state?.user || null,
      };
    }
  } catch (error) {
    console.error('Error reading stored auth:', error);
  }
  return { token: null, user: null };
};
