import { supabase } from './supabase'
import {
  MISSION_STATUS,
  DAILY_MISSION_COUNT,
  WEEKLY_MISSION_COUNT,
} from '../utils/constants'
import { todayISO, startOfWeekISO, pickRandom } from '../utils/helpers'

/**
 * Mission data access. Each function is a thin wrapper over Supabase queries.
 * No business logic — that lives in hooks/stores.
 */

/** All active missions (catalog), optionally filtered by type/category. */
export async function getMissions({ type, category } = {}) {
  let query = supabase
    .from('missions')
    .select(
      'id, title, description, type, category, xp_reward, item_reward_id, difficulty, is_active',
    )
    .eq('is_active', true)

  if (type) query = query.eq('type', type)
  if (category) query = query.eq('category', category)

  const { data, error } = await query.order('difficulty', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Active missions of a particular category. Convenience wrapper. */
export async function getMissionsByCategory(category) {
  return getMissions({ category })
}

/**
 * Active missions currently *available* (not yet accepted by this user).
 * Used to populate the "Disponíveis" tab on the Missions page.
 */
export async function getActiveMissions(userId) {
  if (!userId) return []
  const today = todayISO()
  const weekStart = startOfWeekISO()

  // Fetch the user's currently assigned (any state) missions to exclude them.
  const { data: existing, error: existErr } = await supabase
    .from('user_missions')
    .select('mission_id, assigned_date, status')
    .eq('user_id', userId)
  if (existErr) throw existErr

  const excludedIds = new Set(
    (existing ?? [])
      .filter((row) => {
        // Only exclude rows that are still relevant for "today" or "this week".
        if (row.status === MISSION_STATUS.EXPIRED) return false
        return row.assigned_date >= weekStart || row.assigned_date === today
      })
      .map((row) => row.mission_id),
  )

  const all = await getMissions()
  return all.filter((m) => !excludedIds.has(m.id) && m.type !== 'daily')
}

/**
 * All `user_missions` rows for the current user, joined with their mission row.
 * Default scope: this week (covers daily + weekly assignments).
 */
export async function getUserMissions(userId, { since } = {}) {
  if (!userId) return []
  const sinceDate = since ?? startOfWeekISO()

  const { data, error } = await supabase
    .from('user_missions')
    .select(
      `id, user_id, mission_id, status, completed_at, xp_earned, assigned_date,
       mission:missions ( id, title, description, type, category, xp_reward, item_reward_id, difficulty, is_active )`,
    )
    .eq('user_id', userId)
    .gte('assigned_date', sinceDate)
    .order('assigned_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

/** All assigned (active) missions for the user — daily today + weekly this week. */
export async function getAssignedMissions(userId) {
  const all = await getUserMissions(userId)
  return all.filter(
    (um) =>
      um.status === MISSION_STATUS.ASSIGNED ||
      um.status === MISSION_STATUS.IN_PROGRESS,
  )
}

/**
 * Accept a mission: creates a `user_missions` row in `in_progress` state for today.
 * Idempotent — returns the existing row if the user already accepted this mission today.
 */
export async function acceptMission({ userId, missionId }) {
  if (!userId || !missionId) throw new Error('Missing userId or missionId')

  const today = todayISO()

  // Prevent duplicates for the same day.
  const { data: existing, error: existErr } = await supabase
    .from('user_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('mission_id', missionId)
    .eq('assigned_date', today)
    .maybeSingle()
  if (existErr) throw existErr
  if (existing) return existing

  const payload = {
    user_id: userId,
    mission_id: missionId,
    status: MISSION_STATUS.IN_PROGRESS,
    assigned_date: today,
    xp_earned: 0,
  }

  const { data, error } = await supabase
    .from('user_missions')
    .insert(payload)
    .select(
      `id, user_id, mission_id, status, completed_at, xp_earned, assigned_date,
       mission:missions ( id, title, description, type, category, xp_reward, item_reward_id, difficulty, is_active )`,
    )
    .single()
  if (error) throw error
  return data
}

/**
 * Mark a `user_missions` row as completed.
 * `xpEarned` should already include any streak bonus computed in the hook layer.
 */
export async function completeMission({ userMissionId, xpEarned }) {
  if (!userMissionId) throw new Error('Missing userMissionId')

  const { data, error } = await supabase
    .from('user_missions')
    .update({
      status: MISSION_STATUS.COMPLETED,
      completed_at: new Date().toISOString(),
      xp_earned: xpEarned ?? 0,
    })
    .eq('id', userMissionId)
    .select(
      `id, user_id, mission_id, status, completed_at, xp_earned, assigned_date,
       mission:missions ( id, title, description, type, category, xp_reward, item_reward_id, difficulty, is_active )`,
    )
    .single()
  if (error) throw error
  return data
}

/**
 * Auto-assign daily/weekly missions to the user if they don't have any
 * for today (daily) or this week (weekly). Returns the inserted rows.
 *
 * Safe to call on every app open — checks for existing assignments first.
 */
export async function autoAssignMissions(userId) {
  if (!userId) return []
  const today = todayISO()
  const weekStart = startOfWeekISO()
  const inserted = []

  // ----- Daily -----
  const { data: dailyExisting, error: dailyErr } = await supabase
    .from('user_missions')
    .select('id, mission:missions ( type )')
    .eq('user_id', userId)
    .eq('assigned_date', today)
  if (dailyErr) throw dailyErr

  const hasDailyToday = (dailyExisting ?? []).some(
    (row) => row.mission?.type === 'daily',
  )

  if (!hasDailyToday) {
    const dailyPool = await getMissions({ type: 'daily' })
    const picks = pickRandom(dailyPool, DAILY_MISSION_COUNT)
    if (picks.length > 0) {
      const rows = picks.map((m) => ({
        user_id: userId,
        mission_id: m.id,
        status: MISSION_STATUS.ASSIGNED,
        assigned_date: today,
        xp_earned: 0,
      }))
      const { data, error } = await supabase
        .from('user_missions')
        .insert(rows)
        .select()
      if (error) throw error
      inserted.push(...(data ?? []))
    }
  }

  return inserted
}
