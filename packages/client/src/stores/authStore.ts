import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDTO, SmokingProfileDTO, RegisterInput, LoginInput, OnboardingData } from '@kvitifai/shared';
import { api, setAccessToken } from '../services/api';

interface AuthState {
  user: (UserDTO & { profile?: SmokingProfileDTO | null }) | null;
  isLoading: boolean;
  register: (data: RegisterInput) => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  onboarding: (data: OnboardingData) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      register: async (data) => {
        const { data: res } = await api.post('/auth/register', data);
        setAccessToken(res.accessToken);
        set({ user: res.user });
      },

      login: async (data) => {
        const { data: res } = await api.post('/auth/login', data);
        setAccessToken(res.accessToken);
        set({ user: res.user });
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        setAccessToken('');
        set({ user: null });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/user/me');
          set({ user: data, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      },

      onboarding: async (data) => {
        const { data: profile } = await api.post('/user/onboarding', data);
        set((state) => ({
          user: state.user ? { ...state.user, profile } : null,
        }));
      },
    }),
    {
      name: 'kvitifai-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
