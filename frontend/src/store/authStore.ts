/**
 * Auth Store (Zustand)
 * Integrated with Supabase Auth via Backend.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type UserProfile } from '@/lib/api';

interface AuthState {
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, department?: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.login({ email, password });
                    set({ user: res.user, token: res.access_token, isLoading: false });
                } catch (err: unknown) {
                    set({ error: (err as Error).message || 'Login failed', isLoading: false });
                    throw err;
                }
            },

            signup: async (email, password, fullName, department) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.signup({ email, password, full_name: fullName, department });
                    set({ user: res.user, token: res.access_token, isLoading: false });
                } catch (err: unknown) {
                    set({ error: (err as Error).message || 'Signup failed', isLoading: false });
                    throw err;
                }
            },

            logout: () => {
                set({ user: null, token: null, error: null });
            },

            clearError: () => set({ error: null }),

            fetchProfile: async () => {
                const token = get().token;
                if (!token) return;
                try {
                    const user = await authApi.getMe(token);
                    set({ user });
                } catch {
                    set({ user: null, token: null });
                }
            },
        }),
        {
            name: 'unigpt-auth',
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);
