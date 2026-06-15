import { Sparkles, Gift } from 'lucide-react'

import Card from '../../components/ui/Card/Card'
import Badge from '../../components/ui/Badge/Badge'
import DifficultyStars from '../../components/ui/DifficultyStars/DifficultyStars'
import {
  MISSION_CATEGORIES,
  MISSION_TYPE_LABELS,
  MISSION_STATUS,
} from '../../utils/constants'

import styles from './MissionCard.module.css'

/**
 * MissionCard — list item for the Missions page.
 *
 * Modes:
 *  - "available": catalog mission, not yet accepted (no `userMission` prop).
 *  - "in_progress": user_mission row with status assigned/in_progress.
 *  - "completed": user_mission row with status completed.
 *
 * Tap the card to open the detail modal (handled by parent via `onClick`).
 */
export default function MissionCard({ mission, userMission, onClick }) {
  // Resolve the actual mission record (joined from user_mission when present).
  const miss = mission ?? userMission?.mission
  if (!miss) return null

  const status = userMission?.status ?? null
  const category = MISSION_CATEGORIES[miss.category] ?? {
    name: miss.category,
    icon: '✨',
    color: 'var(--color-primary)',
  }

  const isCompleted = status === MISSION_STATUS.COMPLETED
  const isInProgress =
    status === MISSION_STATUS.ASSIGNED || status === MISSION_STATUS.IN_PROGRESS

  return (
    <Card
      className={`${styles.card} ${isCompleted ? styles.completed : ''} ${
        isInProgress ? styles.inProgress : ''
      }`}
      onClick={onClick}
      hoverable
    >
      <div className={styles.iconWrap} style={{ color: category.color }}>
        <span className={styles.icon} aria-hidden="true">
          {category.icon}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{miss.title}</h3>
          {isCompleted && (
            <Badge variant="success" className={styles.statusBadge}>
              Concluída
            </Badge>
          )}
          {isInProgress && (
            <Badge variant="info" className={styles.statusBadge}>
              Em curso
            </Badge>
          )}
        </div>

        {miss.description && (
          <p className={styles.description}>{miss.description}</p>
        )}

        <div className={styles.metaRow}>
          <Badge variant="neutral" className={styles.categoryBadge}>
            {category.name}
          </Badge>
          <Badge variant="xp" className={styles.typeBadge}>
            {MISSION_TYPE_LABELS[miss.type] ?? miss.type}
          </Badge>
          <DifficultyStars value={miss.difficulty ?? 1} size={12} />
        </div>

        <div className={styles.rewards}>
          <span className={styles.rewardItem}>
            <Sparkles size={14} />
            <strong>+{miss.xp_reward}</strong> XP
          </span>
          {miss.item_reward_id && (
            <span className={styles.rewardItem}>
              <Gift size={14} />
              Item
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
