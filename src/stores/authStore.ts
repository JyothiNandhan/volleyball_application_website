import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { requireSupabaseConfig, supabase } from '@/services/supabase';
import { isSupabaseConfigured } from '@/services/env';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: null,
  restoreSession: async () => {
    try {
      if (!isSupabaseConfigured) {
        // Dev fallback: provide a local user so the app UI is usable without Supabase.
        const devUser = { id: 'local-user', email: 'local@local.test' } as unknown as User;
        set({ session: null, user: devUser, loading: false, error: null });
        return;
      }

      requireSupabaseConfig();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null, loading: false, error: null });
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, loading: false });
      });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Authentication setup failed.' });
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (!isSupabaseConfigured) {
        // Dev login: create a local user session
        const devUser = { id: 'local-user', email } as unknown as User;
        set({ session: null, user: devUser, loading: false });
        return;
      }

      requireSupabaseConfig();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ session: data.session, user: data.user, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Invalid login.' });
    }
  },
  logout: async () => {
    set({ loading: true });
    if (!isSupabaseConfigured) {
      set({ session: null, user: null, loading: false });
      return;
    }
    await supabase.auth.signOut();
    set({ session: null, user: null, loading: false });
  }
}));
