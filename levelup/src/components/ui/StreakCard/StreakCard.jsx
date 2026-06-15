import { Flame, Trophy } from 'lucide-react'

import Card from '../Card/Card'
import { calculateStreakBonus } from '../../../utils/constants'

import styles from './StreakCard.module.css'

/**
 * StreakCard — flame icon, current streak counter, longest streak, and bonus info.
 *
 * Variants:
 *  - `compact = false` (default): full card for the dashboard
 *  - `compact = true`: smaller variant for inline placement
 */
export default function StreakCard({ streak, compact = false, glow = false }) {
  const current = streak?.current_streak ?? 0
  const longest = streak?.longest_streak ?? 0
  const bonus = streak?.streak_bonus_xp ?? calculateStreakBonus(current)

  const isActive = current > 0

  return (
    <Card
      className={`${styles.card} ${compact ? styles.compact : ''}`}
      glow={glow && isActive}
    >
      <div
        className={`${styles.flame} ${isActive ? styles.flameActive : ''}`}
        aria-hidden="true"
      >
        <Flame
          size={compact ? 22 : 28}
          strokeWidth={2}
          fill={isActive ? 'currentColor' : 'none'}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.value}>{current}</span>
          <span className={styles.unit}>
            {current === 1 ? 'dia' : 'dias'}
          </span>
        </div>
        <div className={styles.label}>Sequência atual</div>
        {!compact && (
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Trophy size={12} />
              Recorde: <strong>{longest}</strong>
            </span>
            <span className={styles.metaItem}>
              Bónus por missão: <strong>+{bonus} XP</strong>
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
