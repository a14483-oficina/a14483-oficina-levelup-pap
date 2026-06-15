import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  signIn as signInService,
  signUp as signUpService,
  signOut as signOutService,
} from '../services/authService'
import { ensureUserProfile } from '../services/userService'
import { useAuthStore } from '../stores/authStore'
import { useCharacterStore } from '../stores/characterStore'
import { useMissionStore } from '../stores/missionStore'
import { useStreakStore } from '../stores/streakStore'
import { translateAuthError } from '../utils/helpers'

/** Wraps Supabase auth calls with toast feedback + navigation. */
export function useAuth() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const clearAuth = useAuthStore((s) => s.clear)
  const clearCharacter = useCharacterStore((s) => s.clear)
  const clearMissions = useMissionStore((s) => s.clear)
  const clearStreak = useStreakStore((s) => s.clear)

  async function signUp({ email, password, username }) {
    try {
      const data = await signUpService({ email, password, username })

      // Best-effort row creation (in case the DB trigger isn't installed yet)
      if (data?.user) {
        await ensureUserProfile({
          id: data.user.id,
          email: data.user.email,
          username,
        })
      }

      toast.success('Conta criada com sucesso!')
      navigate('/create-character', { replace: true })
      return data
    } catch (error) {
      toast.error(translateAuthError(error))
      throw error
    }
  }

  async function signIn({ email, password }) {
    try {
      const data = await signInService({ email, password })
      toast.success('Bem-vindo de volta!')
      navigate('/', { replace: true })
      return data
    } catch (error) {
      toast.error(translateAuthError(error))
      throw error
    }
  }

  async function signOut() {
    try {
      await signOutService()
      clearAuth()
      clearCharacter()
      clearMissions()
      clearStreak()
      toast.success('Sessão terminada.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error('Erro ao sair. Tenta novamente.')

      console.error('signOut error:', error)
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    signUp,
    signIn,
    signOut,
  }
}
