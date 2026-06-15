import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

import {
  ensureStreak,
  checkAndUpdateStreak as checkStreakService,
} from '../services/streakService'
import { useStreakStore } from '../stores/streakStore'
import { useAuthStore } from '../stores/authStore'
import { todayISO } from '../utils/helpers'
import { STREAK_MILESTONE_DAYS } from '../utils/constants'

/**
 * Streak hook.
 *
 * `autoCheck = true` (default) runs the streak bookkeeping once per calendar
 * day after the user logs in. The check is idempotent — if `last_active_date`
 * already equals today, nothing is written.
 */
export function useStreak({ autoCheck = true } = {}) {
  const userId = useAuthStore((s) => s.user?.id)
  const streak = useStreakStore((s) => s.streak)
  const loading = useStreakStore((s) => s.loading)
  const lastChecked = useStreakStore((s) => s.lastChecked)
  const setStreak = useStreakStore((s) => s.setStreak)
  const setLoading = useStreakStore((s) => s.setLoading)
  const setLastChecked = useStreakStore((s) => s.setLastChecked)

  const fetchStreak = useCallback(async () => {
    if (!userId) {
      setStreak(null)
      return null
    }
    try {
      setLoading(true)
      const data = await ensureStreak(userId)
      setStreak(data)
      return data
    } catch (error) {
      // The dashboard tolerates a missing streak — just log and reset.

      console.error('ensureStreak error:', error)
      setLoading(false)
      return null
    }
  }, [userId, setStreak, setLoading])

  /**
   * Run the once-per-day streak check.
   * Toasts when a new milestone (every 7 days) is reached.
   */
  const checkAndUpdate = useCallback(
    async ({ silent = false } = {}) => {
      if (!userId) return null
      try {
        setLoading(true)
        const result = await checkStreakService(userId)
        setStreak(result.streak)
        setLastChecked(todayISO())

        if (!silent && result.incremented) {
          const days = result.streak.current_streak
          if (days % STREAK_MILESTONE_DAYS === 0) {
            toast.success(
              `🔥 ${days} dias seguidos! Continua assim, herói!`,
              { duration: 4000 },
            )
          }
        }
        return result
      } catch (error) {

        console.error('checkAndUpdateStreak error:', error)
        setLoading(false)
        return null
      }
    },
    [userId, setStreak, setLoading, setLastChecked],
  )

  useEffect(() => {
    if (!autoCheck || !userId) return
    if (lastChecked === todayISO()) return
    checkAndUpdate({ silent: false })
  }, [autoCheck, userId, lastChecked, checkAndUpdate])

  return {
    streak,
    loading,
    fetchStreak,
    checkAndUpdate,
  }
}
