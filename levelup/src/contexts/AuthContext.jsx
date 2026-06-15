import { createContext, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { useCharacterStore } from '../stores/characterStore'
import { useMissionStore } from '../stores/missionStore'
import { useStreakStore } from '../stores/streakStore'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

/**
 * Wraps the app and bridges Supabase auth events into our Zustand store.
 * Token refreshing is handled automatically by supabase-js — we simply
 * react to onAuthStateChange to keep our store in sync.
 *
 * Consumers should import useAuthContext from './useAuthContext'.
 */
export function AuthProvider({ children }) {
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    let mounted = true

    // Restore session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return
        setSession(session)
      })
      .catch(() => {
        if (!mounted) return
        setLoading(false)
      })

    // Subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      // When the user signs out, drop any cached per-user data from the
      // domain stores so the next user starts clean.
      if (event === 'SIGNED_OUT') {
        useCharacterStore.getState().clear()
        useMissionStore.getState().clear()
        useStreakStore.getState().clear()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setSession, setLoading])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
