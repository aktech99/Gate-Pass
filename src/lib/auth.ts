// src/lib/auth.ts - Fixed version with proper SSR handling
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

// SSR-safe function to get stored auth data
export const getStoredAuthData = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    console.log('🚫 SSR - localStorage not available');
    return { token: null, user: null };
  }

  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📦 Stored auth data:', parsed);

      // The zustand persist middleware stores data in this format:
      // { state: { token, user }, version: 0 }
      if (parsed.state) {
        return {
          token: parsed.state.token,
          user: parsed.state.user,
        };
      }

      // Fallback for direct storage format
      return {
        token: parsed.token,
        user: parsed.user,
      };
    }
  } catch (error) {
    console.error('Error reading stored auth:', error);
  }

  return { token: null, user: null };
};

// Hook to safely get auth data (works in SSR and client)
export const useAuthData = () => {
  const { token, user } = useAuth();

  // If zustand hasn't hydrated yet (common in SSR), try to get from localStorage
  if (!token && typeof window !== 'undefined') {
    const stored = getStoredAuthData();
    return stored;
  }

  return { token, user };
};
