import { useState } from 'react'
import { Sparkles, Gift, Calendar, Target } from 'lucide-react'

import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import Badge from '../../components/ui/Badge/Badge'
import DifficultyStars from '../../components/ui/DifficultyStars/DifficultyStars'
import {
  MISSION_CATEGORIES,
  MISSION_TYPE_LABELS,
  MISSION_STATUS,
} from '../../utils/constants'

import styles from './MissionDetailModal.module.css'

/**
 * Detail modal for a mission. Action buttons depend on the mission's state:
 *  - "available"   → "Aceitar Missão"
 *  - "in_progress" → "Completar Missão"
 *  - "completed"   → no actions (just a status label)
 */
export default function MissionDetailModal({
  isOpen,
  onClose,
  mission,
  userMission,
  onAccept,
  onComplete,
}) {
  const [busy, setBusy] = useState(false)

  // Resolve the mission record from either the catalog or the user_mission row.
  const miss = mission ?? userMission?.mission
  const status = userMission?.status ?? null

  if (!isOpen || !miss) return null

  const category = MISSION_CATEGORIES[miss.category] ?? {
    name: miss.category,
    icon: '✨',
    color: 'var(--color-primary)',
  }

  const isCompleted = status === MISSION_STATUS.COMPLETED
  const isInProgress =
    status === MISSION_STATUS.ASSIGNED || status === MISSION_STATUS.IN_PROGRESS
  const isAvailable = !status

  async function handleAccept() {
    if (!onAccept || busy) return
    setBusy(true)
    try {
      await onAccept(miss.id)
      onClose?.()
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete() {
    if (!onComplete || busy || !userMission) return
    setBusy(true)
    try {
      await onComplete(userMission.id)
      onClose?.()
    } finally {
      setBusy(false)
    }
  }

  const actions = isCompleted ? (
    <Button variant="ghost" onClick={onClose} fullWidth>
      Fechar
    </Button>
  ) : isInProgress ? (
    <>
      <Button variant="ghost" onClick={onClose} disabled={busy}>
        Cancelar
      </Button>
      <Button onClick={handleComplete} loading={busy} fullWidth>
        Completar Missão
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={onClose} disabled={busy}>
        Cancelar
      </Button>
      <Button onClick={handleAccept} loading={busy} fullWidth>
        Aceitar Missão
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} actions={actions}>
      <div className={styles.body}>
        <div className={styles.heroRow}>
          <div className={styles.icon} style={{ color: category.color }}>
            <span aria-hidden="true">{category.icon}</span>
          </div>
          <div className={styles.heroText}>
            <h2 className={styles.title}>{miss.title}</h2>
            <div className={styles.heroBadges}>
              <Badge variant="neutral">{category.name}</Badge>
              <Badge variant="xp">
                {MISSION_TYPE_LABELS[miss.type] ?? miss.type}
              </Badge>
            </div>
          </div>
        </div>

        {miss.description && (
          <p className={styles.description}>{miss.description}</p>
        )}

        <ul className={styles.statsGrid}>
          <li className={styles.statItem}>
            <Target size={16} />
            <span className={styles.statLabel}>Dificuldade</span>
            <DifficultyStars value={miss.difficulty ?? 1} size={14} />
          </li>
          <li className={styles.statItem}>
            <Sparkles size={16} />
            <span className={styles.statLabel}>Recompensa</span>
            <strong className={styles.statValue}>+{miss.xp_reward} XP</strong>
          </li>
          {miss.item_reward_id && (
            <li className={styles.statItem}>
              <Gift size={16} />
              <span className={styles.statLabel}>Item bónus</span>
              <strong className={styles.statValue}>Sim</strong>
            </li>
          )}
          {userMission?.assigned_date && (
            <li className={styles.statItem}>
              <Calendar size={16} />
              <span className={styles.statLabel}>Atribuída</span>
              <strong className={styles.statValue}>
                {formatAssignedDate(userMission.assigned_date)}
              </strong>
            </li>
          )}
        </ul>

        {isCompleted && (
          <div className={styles.completedBanner}>
            ✅ Missão concluída · ganhaste {userMission?.xp_earned ?? 0} XP
          </div>
        )}
        {isAvailable && (
          <p className={styles.hint}>
            Aceita esta missão para a juntares à tua lista de missões em curso.
          </p>
        )}
      </div>
    </Modal>
  )
}

function formatAssignedDate(iso) {
  if (!iso) return ''
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return iso
  }
}
