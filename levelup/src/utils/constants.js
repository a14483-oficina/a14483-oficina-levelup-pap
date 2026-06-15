/**
 * Game constants, formulas, and i18n labels.
 * All UI labels here are in Portuguese (pt-PT). Code identifiers stay in English.
 */

export const CLASS_TYPES = {
  warrior: {
    name: 'Guerreiro',
    description: 'Forte e resistente. Especialista em força física.',
    baseStats: { strength: 8, agility: 4, intelligence: 3 },
    icon: '⚔️',
    primaryStat: 'strength',
  },
  mage: {
    name: 'Mago',
    description: 'Sábio e poderoso. Mestre do intelecto.',
    baseStats: { strength: 3, agility: 4, intelligence: 8 },
    icon: '🧙',
    primaryStat: 'intelligence',
  },
  rogue: {
    name: 'Ladino',
    description: 'Rápido e ágil. Mestre da velocidade.',
    baseStats: { strength: 4, agility: 8, intelligence: 3 },
    icon: '🗡️',
    primaryStat: 'agility',
  },
  paladin: {
    name: 'Paladino',
    description: 'Equilibrado e versátil. Bom em tudo.',
    baseStats: { strength: 5, agility: 5, intelligence: 5 },
    icon: '🛡️',
    primaryStat: null,
  },
}

export const STAT_LABELS = {
  strength: 'Força',
  agility: 'Agilidade',
  intelligence: 'Inteligência',
}

/**
 * Mission categories.
 * Keys MUST match the `category` column values in the `missions` table.
 * Labels are Portuguese (pt-PT) following the project design language.
 */
export const MISSION_CATEGORIES = {
  exercise: { name: 'Fitness', icon: '💪', color: '#ef4444' },
  study: { name: 'Estudo', icon: '📚', color: '#3b82f6' },
  wellness: { name: 'Bem-estar', icon: '🧘', color: '#149e61' },
}

export const MISSION_TYPE_LABELS = {
  daily: 'Diária',
  weekly: 'Semanal',
  bonus: 'Bónus',
}

export const MISSION_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
}

export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary']

export const RARITY_LABELS = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
}

export const DAILY_MISSION_COUNT = 4
export const WEEKLY_MISSION_COUNT = 2
export const MAX_STREAK_BONUS = 50
export const STREAK_BONUS_PER_DAY = 5
export const STREAK_MILESTONE_DAYS = 7

/**
 * XP required to reach the next level.
 * Phase 2 formula: xp_to_next_level = round(100 * level ^ 1.5)
 *
 * Examples:
 *   Level 1 → 2: 100
 *   Level 2 → 3: 283
 *   Level 3 → 4: 520
 *   Level 4 → 5: 800
 *   Level 5 → 6: 1118
 */
export function calculateXPToNextLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5))
}

/** Bonus XP applied per mission based on the user's current streak. */
export function calculateStreakBonus(currentStreak) {
  return Math.min((currentStreak ?? 0) * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS)
}

/**
 * Stat points awarded on level up.
 * Primary stat (defined by class) gets +2, every other stat gets +1.
 * Paladin (no primary stat) receives +1 to every stat (balanced growth).
 */
export function getLevelUpStatGains(classType) {
  const classDef = CLASS_TYPES[classType] ?? CLASS_TYPES.paladin
  const primary = classDef.primaryStat
  const stats = ['strength', 'agility', 'intelligence']

  if (!primary) {
    return { strength: 1, agility: 1, intelligence: 1 }
  }
  return stats.reduce((acc, stat) => {
    acc[stat] = stat === primary ? 2 : 1
    return acc
  }, {})
}
