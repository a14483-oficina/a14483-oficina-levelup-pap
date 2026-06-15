import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, ChevronUp } from 'lucide-react'

import Button from '../Button/Button'
import { CLASS_TYPES, STAT_LABELS } from '../../../utils/constants'

import styles from './LevelUpModal.module.css'

/**
 * Full-screen celebration modal triggered after a level up.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - newLevel: number (the highest level achieved this session)
 *  - gains: { strength, agility, intelligence } cumulative stats earned
 *  - classType: character class (used to pick the icon)
 *
 * Confetti is rendered with pure CSS — no extra dependency required.
 */
export default function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  gains,
  classType,
}) {
  // Memoise the confetti stripe configuration so it doesn't re-randomise on
  // every render while the modal is open.
  const confetti = useMemo(() => buildConfetti(36), [])

  if (!isOpen) return null

  const classDef = CLASS_TYPES[classType] ?? CLASS_TYPES.paladin

  return createPortal(
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      <div className={styles.confettiLayer} aria-hidden="true">
        {confetti.map((piece, idx) => (
          <span
            key={idx}
            className={styles.piece}
            style={{
              left: `${piece.left}%`,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className={styles.modal}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.icon} aria-hidden="true">
          {classDef.icon}
        </div>

        <p className={styles.kicker}>
          <Sparkles size={14} /> SUBISTE DE NÍVEL
        </p>
        <h2 id="levelup-title" className={styles.title}>
          Nível {newLevel}
        </h2>
        <p className={styles.subtitle}>
          O teu personagem ficou mais forte. Continua a tua aventura!
        </p>

        {gains && (
          <ul className={styles.gainsList}>
            {Object.entries(gains)
              .filter(([, value]) => value > 0)
              .map(([stat, value]) => (
                <li key={stat} className={styles.gainItem}>
                  <ChevronUp size={14} className={styles.gainIcon} />
                  <span>{STAT_LABELS[stat] ?? stat}</span>
                  <strong>+{value}</strong>
                </li>
              ))}
          </ul>
        )}

        <Button onClick={onClose} fullWidth size="lg">
          Continuar
        </Button>
      </div>
    </div>,
    document.body,
  )
}

const CONFETTI_COLORS = [
  '#7132f5',
  '#a78bfa',
  '#f59e0b',
  '#149e61',
  '#3b82f6',
  '#ef4444',
]

function buildConfetti(count) {
  const out = []
  for (let i = 0; i < count; i += 1) {
    out.push({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    })
  }
  return out
}
