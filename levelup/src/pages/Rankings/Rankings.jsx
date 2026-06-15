import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

import { getWeeklyRankings } from '../../services/rankingService'
import { useAuthStore } from '../../stores/authStore'
import { CLASS_TYPES } from '../../utils/constants'

import Header from '../../components/layout/Header/Header'
import Card from '../../components/ui/Card/Card'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import Spinner from '../../components/ui/Spinner/Spinner'

import styles from './Rankings.module.css'

const POSITION_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Rankings() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = useAuthStore((s) => s.user?.id)

  useEffect(() => {
    async function load() {
      try {
        const data = await getWeeklyRankings()
        setRankings(data)
      } catch (err) {
        toast.error('Erro ao carregar o ranking.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <Header title="Ranking Semanal" />
      <div className={styles.page}>
        {loading ? (
          <Spinner fullScreen={false} />
        ) : rankings.length === 0 ? (
          <Card className={styles.placeholderCard}>
            <EmptyState
              icon={<Trophy size={48} />}
              title="Ainda não há classificações esta semana"
              description="Completa missões para entrar no ranking semanal."
            />
          </Card>
        ) : (
          <div className={styles.list}>
            {rankings.map((entry, idx) => {
              const position = entry.position ?? idx + 1
              const classDef = CLASS_TYPES[entry.character?.class_type] ?? CLASS_TYPES.paladin
              const isMe = entry.user_id === userId

              return (
                <Card
                  key={entry.id}
                  className={`${styles.row} ${isMe ? styles.rowMe : ''} ${position <= 3 ? styles[`top${position}`] : ''}`}
                >
                  <span className={styles.position}>
                    {POSITION_ICONS[position] ?? `#${position}`}
                  </span>
                  <span className={styles.classIcon} aria-hidden="true">
                    {classDef.icon}
                  </span>
                  <div className={styles.info}>
                    <span className={styles.username}>
                      {entry.user?.username ?? 'Herói'}
                      {isMe && <span className={styles.youBadge}> (tu)</span>}
                    </span>
                    <span className={styles.sub}>
                      {entry.character?.name} · Nível {entry.character?.level}
                    </span>
                  </div>
                  <div className={styles.stats}>
                    <span className={styles.xp}>✨ {entry.weekly_xp} XP</span>
                    <span className={styles.missions}>{entry.missions_completed} missões</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
