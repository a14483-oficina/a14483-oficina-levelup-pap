import { Star } from 'lucide-react'

import styles from './DifficultyStars.module.css'

/**
 * Render up to 5 stars representing a mission's difficulty (1–5).
 * Filled stars use the warning/gold colour; the rest are muted.
 */
export default function DifficultyStars({ value = 1, size = 14, label }) {
  const safeValue = Math.max(0, Math.min(5, Math.round(value)))

  return (
    <span
      className={styles.wrapper}
      role="img"
      aria-label={label ?? `Dificuldade ${safeValue} de 5`}
    >
      {[1, 2, 3, 4, 5].map((idx) => (
        <Star
          key={idx}
          size={size}
          className={idx <= safeValue ? styles.filled : styles.empty}
          fill={idx <= safeValue ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}
