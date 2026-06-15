import { supabase } from './supabase'
import {
  CLASS_TYPES,
  calculateXPToNextLevel,
  getLevelUpStatGains,
} from '../utils/constants'

/** Returns null when no character exists for this user yet. */
export async function getCharacter(userId) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Create a new character. Initial stats are derived from the chosen class.
 */
export async function createCharacter({ userId, name, classType }) {
  const classDef = CLASS_TYPES[classType]
  if (!classDef) throw new Error(`Unknown class type: ${classType}`)

  const payload = {
    user_id: userId,
    name,
    class_type: classType,
    level: 1,
    xp: 0,
    xp_to_next_level: calculateXPToNextLevel(1),
    strength: classDef.baseStats.strength,
    agility: classDef.baseStats.agility,
    intelligence: classDef.baseStats.intelligence,
  }

  const { data, error } = await supabase
    .from('characters')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCharacter(characterId, updates) {
  const { data, error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', characterId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Pure XP-gain calculator. Given the current character snapshot and an XP
 * amount, returns the resulting character snapshot AND a log of any level ups
 * that occurred. Loop handles multiple level ups in a single call.
 *
 * Does NOT write to the database — call `applyXPGain` for the persisted version.
 */
export function computeXPGain(character, xpDelta) {
  if (!character) {
    return { character: null, levelUps: [], leveledUp: false, xpGained: 0 }
  }

  let level = character.level ?? 1
  let xp = (character.xp ?? 0) + Math.max(0, xpDelta)
  let xpToNext = character.xp_to_next_level ?? calculateXPToNextLevel(level)
  let strength = character.strength ?? 0
  let agility = character.agility ?? 0
  let intelligence = character.intelligence ?? 0
  const levelUps = []

  // Multi-level support: keep promoting while the user has enough XP.
  // Hard cap at +20 levels per single call as a safety net against runaway loops.
  let safety = 20
  while (xp >= xpToNext && safety > 0) {
    const gains = getLevelUpStatGains(character.class_type)
    xp -= xpToNext
    level += 1
    strength += gains.strength
    agility += gains.agility
    intelligence += gains.intelligence
    xpToNext = calculateXPToNextLevel(level)

    levelUps.push({
      newLevel: level,
      gains,
      xpToNext,
    })
    safety -= 1
  }

  return {
    character: {
      ...character,
      level,
      xp,
      xp_to_next_level: xpToNext,
      strength,
      agility,
      intelligence,
    },
    levelUps,
    leveledUp: levelUps.length > 0,
    xpGained: Math.max(0, xpDelta),
  }
}

/**
 * Award XP to a character and persist any level ups.
 * Returns `{ character, levelUps, leveledUp, xpGained }` matching `computeXPGain`.
 */
export async function applyXPGain(character, xpDelta) {
  if (!character) throw new Error('Missing character')
  const result = computeXPGain(character, xpDelta)

  const updates = {
    xp: result.character.xp,
    level: result.character.level,
    xp_to_next_level: result.character.xp_to_next_level,
  }
  if (result.leveledUp) {
    updates.strength = result.character.strength
    updates.agility = result.character.agility
    updates.intelligence = result.character.intelligence
  }

  const persisted = await updateCharacter(character.id, updates)
  return { ...result, character: persisted }
}
