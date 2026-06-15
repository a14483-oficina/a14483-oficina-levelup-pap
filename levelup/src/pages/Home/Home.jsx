import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Swords, Trophy, ChevronRight, Check } from 'lucide-react'

import { useCharacter } from '../../hooks/useCharacter'
import { useMissions } from '../../hooks/useMissions'
import { useStreak } from '../../hooks/useStreak'
import { getWeeklyRankings } from '../../services/rankingService'
import { useAuthStore } from '../../stores/authStore'
import { CLASS_TYPES } from '../../utils/constants'

import Header from '../../components/layout/Header/Header'
import Card from '../../components/ui/Card/Card'
import ProgressBar from '../../components/ui/ProgressBar/ProgressBar'
import Badge from '../../components/ui/Badge/Badge'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import Skeleton from '../../components/ui/Skeleton/Skeleton'
import StreakCard from '../../components/ui/StreakCard/StreakCard'
import LevelUpModal from '../../components/ui/LevelUpModal/LevelUpModal'

import MissionCard from '../Missions/MissionCard'
import MissionDetailModal from '../Missions/MissionDetailModal'

import styles from './Home.module.css'

const POSITION_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Home() {
  const navigate = useNavigate()
  const { character, loading: charLoading } = useCharacter({ autoLoad: false })
  const {
    inProgress,
    todayCompleted,
    loading: missionsLoading,
    acceptMission,
    completeMission,
  } = useMissions()
  const { streak } = useStreak()
  const userId = useAuthStore((s) => s.user?.id)

  const [selected, setSelected] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  const [rankings, setRankings] = useState([])

  useEffect(() => {
    getWeeklyRankings().then(setRankings).catch(console.error)
  }, [])

  async function handleComplete(userMissionId) {
    const result = await completeMission(userMissionId)
    if (result?.leveledUp) {
      const gains = result.levelUps.reduce(
        (acc, lu) => {
          Object.entries(lu.gains).forEach(([stat, val]) => {
            acc[stat] = (acc[stat] ?? 0) + val
          })
          return acc
        },
        { strength: 0, agility: 0, intelligence: 0 },
      )
      const top = result.levelUps[result.levelUps.length - 1]
      setLevelUp({ newLevel: top.newLevel, gains })
    }
    return result
  }

  return (
    <>
      <Header title="LevelUP" />
      <div className={styles.page}>
        <section className={styles.heroSection}>
          {charLoading || !character ? (
            <Card className={styles.heroCard}>
              <Skeleton height={20} width="60%" />
              <Skeleton height={14} width="40%" />
              <Skeleton height={10} width="100%" />
            </Card>
          ) : (
            <CharacterHero character={character} />
          )}
        </section>

        <section className={styles.statsRow}>
          <StreakCard streak={streak} compact />
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>
              <Check size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{todayCompleted.length}</div>
              <div className={styles.statLabel}>
                Completas <span className={styles.statSublabel}>hoje</span>
              </div>
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Missões em curso</h2>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => navigate('/missions')}
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </header>

          {missionsLoading && inProgress.length === 0 ? (
            <Card className={styles.placeholderCard}>
              <Skeleton height={64} width="100%" />
            </Card>
          ) : inProgress.length === 0 ? (
            <Card className={styles.placeholderCard}>
              <EmptyState
                icon={<Swords size={36} />}
                title="Sem missões em curso"
                description="Aceita uma missão na página de Missões para começares a ganhar XP."
              />
            </Card>
          ) : (
            <div className={styles.missionList}>
              {inProgress.slice(0, 3).map((um) => (
                <MissionCard
                  key={um.id}
                  userMission={um}
                  onClick={() => setSelected({ userMission: um })}
                />
              ))}
            </div>
          )}
        </section>

        {todayCompleted.length > 0 && (
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Concluídas hoje</h2>
              <Badge variant="success">+{totalXPToday(todayCompleted)} XP</Badge>
            </header>
            <div className={styles.missionList}>
              {todayCompleted.slice(0, 2).map((um) => (
                <MissionCard
                  key={um.id}
                  userMission={um}
                  onClick={() => setSelected({ userMission: um })}
                />
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ranking semanal</h2>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => navigate('/rankings')}
            >
              Ver tudo <ChevronRight size={14} />
            </button>
          </header>

          {rankings.length === 0 ? (
            <Card className={styles.placeholderCard}>
              <EmptyState
                icon={<Trophy size={36} />}
                title="Sem classificação"
                description="Completa missões para entrar no ranking semanal."
              />
            </Card>
          ) : (
            <div className={styles.rankingList}>
              {rankings.slice(0, 3).map((entry, idx) => {
                const position = idx + 1
                const classDef = CLASS_TYPES[entry.character?.class_type] ?? CLASS_TYPES.paladin
                const isMe = entry.user_id === userId
                return (
                  <Card key={entry.id} className={`${styles.rankingRow} ${isMe ? styles.rankingRowMe : ''}`}>
                    <span className={styles.rankingPos}>{POSITION_ICONS[position] ?? `#${position}`}</span>
                    <span className={styles.rankingIcon}>{classDef.icon}</span>
                    <div className={styles.rankingInfo}>
                      <span className={styles.rankingName}>
                        {entry.user?.username ?? 'Herói'}
                        {isMe && <span className={styles.youBadge}> (tu)</span>}
                      </span>
                      <span className={styles.rankingSub}>
                        {entry.character?.name} · Nível {entry.character?.level}
                      </span>
                    </div>
                    <span className={styles.rankingXp}>✨ {entry.weekly_xp} XP</span>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <MissionDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        mission={selected?.mission}
        userMission={selected?.userMission}
        onAccept={acceptMission}
        onComplete={handleComplete}
      />

      <LevelUpModal
        isOpen={!!levelUp}
        onClose={() => setLevelUp(null)}
        newLevel={levelUp?.newLevel}
        gains={levelUp?.gains}
        classType={character?.class_type}
      />
    </>
  )
}

function CharacterHero({ character }) {
  const classDef = CLASS_TYPES[character.class_type] ?? CLASS_TYPES.paladin
  return (
    <Card className={styles.heroCard} glow>
      <div className={styles.heroTop}>
        <div className={styles.heroIcon} aria-hidden="true">{classDef.icon}</div>
        <div className={styles.heroInfo}>
          <h2 className={styles.heroName}>{character.name}</h2>
          <p className={styles.heroSubtitle}>{classDef.name} · Nível {character.level}</p>
        </div>
        <Badge variant="xp"><Sparkles size={12} /> Nv. {character.level}</Badge>
      </div>
      <div className={styles.xpBlock}>
        <div className={styles.xpLabels}>
          <span className={styles.xpLabel}>XP</span>
          <span className={styles.xpValue}>{character.xp} / {character.xp_to_next_level}</span>
        </div>
        <ProgressBar current={character.xp} max={character.xp_to_next_level} variant="primary" height={10} />
      </div>
    </Card>
  )
}

function totalXPToday(completed) {
  return completed.reduce((sum, um) => sum + (um.xp_earned ?? 0), 0)
}
