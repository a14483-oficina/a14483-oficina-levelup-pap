import { create } from 'zustand'

/**
 * Auth store — mirrors the Supabase auth session.
 * The actual session/token persistence is handled by Supabase
 * (autoRefreshToken + persistSession in the client config).
 * This store exposes a synchronous slice of auth state for the UI.
 */
export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    }),

  setLoading: (loading) => set({ loading }),

  clear: () => set({ user: null, session: null, loading: false }),
}))
