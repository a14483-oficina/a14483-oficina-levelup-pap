import { supabase } from './supabase'

export async function getItem(itemId) {
  if (!itemId) return null
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getCharacterItems(characterId) {
  if (!characterId) return []
  const { data, error } = await supabase
    .from('character_items')
    .select(
      `id, character_id, item_id, equipped, obtained_at,
       item:items ( id, name, description, type, rarity, stat_bonus, image_url )`,
    )
    .eq('character_id', characterId)
    .order('obtained_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function awardItem({ characterId, itemId }) {
  if (!characterId || !itemId) throw new Error('Missing characterId or itemId')

  const { data: existing, error: existErr } = await supabase
    .from('character_items')
    .select('*')
    .eq('character_id', characterId)
    .eq('item_id', itemId)
    .maybeSingle()
  if (existErr) throw existErr
  if (existing) return { row: existing, alreadyOwned: true }

  const { data, error } = await supabase
    .from('character_items')
    .insert({
      character_id: characterId,
      item_id: itemId,
      equipped: false,
      obtained_at: new Date().toISOString(),
    })
    .select(
      `id, character_id, item_id, equipped, obtained_at,
       item:items ( id, name, description, type, rarity, stat_bonus, image_url )`,
    )
    .single()
  if (error) throw error
  return { row: data, alreadyOwned: false }
}

export async function setItemEquipped({ characterItemId, equipped }) {
  if (!characterItemId) throw new Error('Missing characterItemId')
  const { data, error } = await supabase
    .from('character_items')
    .update({ equipped })
    .eq('id', characterItemId)
    .select()
    .single()
  if (error) throw error
  return data
}