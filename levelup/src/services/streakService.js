import { supabase } from './supabase'
import { calculateStreakBonus } from '../utils/constants'
import { todayISO, yesterdayISO } from '../utils/helpers'

/**
 * Streak data access. The `streaks` table has a single row per user
 * (enforced by UNIQUE(user_id)). The handle_new_user() database trigger
 * inserts an initial row on signup, but we also self-heal below in case
 * the trigger isn't installed yet.
 */

/** Fetch the user's streak row. Returns `null` if no row exists yet. */
export async function getStreak(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Ensure a streak row exists for this user. Creates one with default values
 * when missing. Returns the existing/created row.
 */
export async function ensureStreak(userId) {
  if (!userId) throw new Error('Missing userId')
  const existing = await getStreak(userId)
  if (existing) return existing

  const payload = {
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: null,
    streak_bonus_xp: 0,
  }
  const { data, error } = await supabase
    .from('streaks')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Apply a partial update to the user's streak row. */
export async function updateStreak(userId, updates) {
  if (!userId) throw new Error('Missing userId')
  const { data, error } = await supabase
    .from('streaks')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Streak bookkeeping logic.
 * Compares `last_active_date` against today/yesterday to decide whether to
 * increment, keep, or reset the streak. Pure function — does not touch the DB.
 *
 * Returns an object describing both the new state and whether it actually
 * changed (so callers can skip writes when nothing has to be persisted).
 */
export function computeStreakUpdate(streak) {
  const today = todayISO()
  const yesterday = yesterdayISO()
  const last = streak?.last_active_date ?? null
  const currentStreak = streak?.current_streak ?? 0
  const longestStreak = streak?.longest_streak ?? 0

  let nextStreak
  if (!last) {
    // First ever activity.
    nextStreak = 1
  } else if (last === today) {
    // Already active today — nothing to change beyond bonus recompute.
    nextStreak = currentStreak
  } else if (last === yesterday) {
    nextStreak = currentStreak + 1
  } else {
    // Gap of 2+ days — streak resets, but today still counts.
    nextStreak = 1
  }

  const nextLongest = Math.max(longestStreak, nextStreak)
  const nextBonus = calculateStreakBonus(nextStreak)

  const changed =
    last !== today ||
    nextStreak !== currentStreak ||
    nextLongest !== longestStreak ||
    nextBonus !== (streak?.streak_bonus_xp ?? 0)

  return {
    changed,
    last_active_date: today,
    current_streak: nextStreak,
    longest_streak: nextLongest,
    streak_bonus_xp: nextBonus,
    // Useful flags for callers (e.g. confetti when streak grows).
    incremented: last === yesterday && nextStreak > currentStreak,
    reset: !!last && last !== today && last !== yesterday,
    firstActivity: !last,
  }
}

/**
 * Read-only "preview" of what the streak will look like after today's check.
 * Does NOT write to the database — useful for the dashboard banner.
 */
export async function previewStreak(userId) {
  const streak = await ensureStreak(userId)
  return { streak, ...computeStreakUpdate(streak) }
}

/**
 * Run the streak bookkeeping for the given user and persist any changes.
 * Returns `{ streak, incremented, reset, changed, firstActivity }`.
 */
export async function checkAndUpdateStreak(userId) {
  const current = await ensureStreak(userId)
  const update = computeStreakUpdate(current)

  if (!update.changed) {
    return { streak: current, ...update }
  }

  const next = await updateStreak(userId, {
    last_active_date: update.last_active_date,
    current_streak: update.current_streak,
    longest_streak: update.longest_streak,
    streak_bonus_xp: update.streak_bonus_xp,
  })
  return { streak: next, ...update }
}
