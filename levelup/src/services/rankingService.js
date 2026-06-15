import { supabase } from './supabase'
import { startOfWeekISO } from '../utils/helpers'

export async function getWeeklyRankings() {
  const weekStart = startOfWeekISO()

  const { data, error } = await supabase
    .from('rankings')
    .select(`
      id, user_id, week_start, week_end, weekly_xp, position, missions_completed,
      user:users ( username )
    `)
    .eq('week_start', weekStart)
    .order('weekly_xp', { ascending: false })
    .limit(50)

  if (error) throw error

  // Fetch characters separately
  if (!data || data.length === 0) return []

  const userIds = data.map((r) => r.user_id)
  const { data: characters } = await supabase
    .from('characters')
    .select('user_id, name, level, class_type')
    .in('user_id', userIds)

  return data.map((entry, idx) => ({
    ...entry,
    position: idx + 1,
    character: characters?.find((c) => c.user_id === entry.user_id) ?? null,
  }))
}

export async function upsertRanking({ userId, weeklyXp, missionsCompleted }) {
  const weekStart = startOfWeekISO()
  const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('rankings')
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        weekly_xp: weeklyXp,
        missions_completed: missionsCompleted,
      },
      { onConflict: 'user_id,week_start' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
