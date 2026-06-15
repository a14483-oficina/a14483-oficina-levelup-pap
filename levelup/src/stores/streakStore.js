import { create } from 'zustand'

/**
 * Streak store — holds the current user's `streaks` row.
 * `lastChecked` lets the hook avoid re-checking the streak multiple times
 * on the same calendar day.
 */
export const useStreakStore = create((set) => ({
  streak: null,
  loading: false,
  lastChecked: null, // ISO date (YYYY-MM-DD) of the last checkAndUpdateStreak run

  setStreak: (streak) => set({ streak, loading: false }),
  setLoading: (loading) => set({ loading }),
  setLastChecked: (lastChecked) => set({ lastChecked }),

  clear: () => set({ streak: null, loading: false, lastChecked: null }),
}))
