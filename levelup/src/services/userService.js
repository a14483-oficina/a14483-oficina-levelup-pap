import { supabase } from './supabase'

/**
 * Get the public profile of a user by ID.
 * Returns null when the row hasn't been created yet by the auth trigger.
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Best-effort upsert of the public.users row.
 * In production, the on_auth_user_created trigger handles this automatically,
 * but we run this client-side as a fallback when the trigger isn't configured yet.
 */
export async function ensureUserProfile({ id, email, username }) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { id, email, username },
      { onConflict: 'id', ignoreDuplicates: false },
    )
    .select()
    .maybeSingle()
  if (error) {
    // Don't crash the app if RLS / triggers haven't been set up yet.

    console.warn('ensureUserProfile failed (continuing):', error.message)
    return null
  }
  return data
}
