import { useMemo, useState } from 'react'
import { Swords, ListChecks } from 'lucide-react'

import { useMissions } from '../../hooks/useMissions'
import { MISSION_CATEGORIES } from '../../utils/constants'

import Header from '../../components/layout/Header/Header'
import Card from '../../components/ui/Card/Card'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import Skeleton from '../../components/ui/Skeleton/Skeleton'
import LevelUpModal from '../../components/ui/LevelUpModal/LevelUpModal'
import { useCharacterStore } from '../../stores/characterStore'

import MissionCard from './MissionCard'
import MissionDetailModal from './MissionDetailModal'

import styles from './MissionsPage.module.css'

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'in_progress', label: 'Em curso' },
  { id: 'completed', label: 'Concluídas' },
]

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Todas as categorias', icon: '✨' },
  ...Object.entries(MISSION_CATEGORIES).map(([id, def]) => ({
    id,
    label: def.name,
    icon: def.icon,
  })),
]

export default function MissionsPage() {
  const {
    available,
    inProgress,
    completed,
    todayCompleted,
    loading,
    loaded,
    acceptMission,
    completeMission,
  } = useMissions()
  const character = useCharacterStore((s) => s.character)

  const [statusTab, setStatusTab] = useState('all')
  const [categoryTab, setCategoryTab] = useState('all')
  const [selected, setSelected] = useState(null) // { mission?, userMission? }
  const [levelUp, setLevelUp] = useState(null) // { newLevel, gains }

  /**
   * Combine catalog `available` + user_missions into a single sortable array
   * tagged by status. Each entry carries either a `mission` (catalog) or
   * `userMission` (DB row).
   */
  const filteredEntries = useMemo(() => {
    const all = []
    if (statusTab === 'all' || statusTab === 'available') {
      available.forEach((m) =>
        all.push({ key: `m-${m.id}`, mission: m, status: 'available' }),
      )
    }
    if (statusTab === 'all' || statusTab === 'in_progress') {
      inProgress.forEach((um) =>
        all.push({
          key: `um-${um.id}`,
          userMission: um,
          status: 'in_progress',
        }),
      )
    }
    if (statusTab === 'all' || statusTab === 'completed') {
      completed.forEach((um) =>
        all.push({
          key: `um-${um.id}`,
          userMission: um,
          status: 'completed',
        }),
      )
    }

    // Apply category filter.
    const cat = categoryTab
    return all.filter((entry) => {
      if (cat === 'all') return true
      const m = entry.mission ?? entry.userMission?.mission
      return m?.category === cat
    })
  }, [available, inProgress, completed, statusTab, categoryTab])

  async function handleAccept(missionId) {
    return await acceptMission(missionId)
  }

  async function handleComplete(userMissionId) {
    const result = await completeMission(userMissionId)
    if (result?.leveledUp) {
      // Aggregate stat gains across all level ups in this single completion.
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

  const inProgressCount = inProgress.length
  const completedTodayCount = todayCompleted.length

  return (
    <>
      <Header title="Missões" />
      <div className={styles.page}>
        <header className={styles.summary}>
          <SummaryCard
            label="Em curso"
            value={inProgressCount}
            icon={<Swords size={18} />}
            tone="primary"
          />
          <SummaryCard
            label="Hoje"
            value={completedTodayCount}
            icon={<ListChecks size={18} />}
            tone="success"
          />
        </header>

        {/* Status tabs */}
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Filtrar missões por estado"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusTab === tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`${styles.tab} ${
                statusTab === tab.id ? styles.tabActive : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filter chips */}
        <div className={styles.chips} role="tablist" aria-label="Categorias">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={categoryTab === cat.id}
              onClick={() => setCategoryTab(cat.id)}
              className={`${styles.chip} ${
                categoryTab === cat.id ? styles.chipActive : ''
              }`}
            >
              <span aria-hidden="true" className={styles.chipIcon}>
                {cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mission list */}
        <section className={styles.list}>
          {loading && !loaded ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : filteredEntries.length === 0 ? (
            <Card className={styles.emptyCard}>
              <EmptyState
                icon={<Swords size={36} />}
                title={emptyTitle(statusTab)}
                description={emptyDescription(statusTab)}
              />
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <MissionCard
                key={entry.key}
                mission={entry.mission}
                userMission={entry.userMission}
                onClick={() => setSelected(entry)}
              />
            ))
          )}
        </section>
      </div>

      <MissionDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        mission={selected?.mission}
        userMission={selected?.userMission}
        onAccept={handleAccept}
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

function SummaryCard({ label, value, icon, tone = 'primary' }) {
  return (
    <Card className={`${styles.summaryCard} ${styles[`tone-${tone}`]}`}>
      <span className={styles.summaryIcon}>{icon}</span>
      <span className={styles.summaryValue}>{value}</span>
      <span className={styles.summaryLabel}>{label}</span>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <Card className={styles.skeletonCard}>
      <Skeleton variant="rect" width={48} height={48} />
      <div className={styles.skeletonBody}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={12} width="90%" />
        <Skeleton height={12} width="40%" />
      </div>
    </Card>
  )
}

function emptyTitle(tab) {
  switch (tab) {
    case 'in_progress':
      return 'Sem missões em curso'
    case 'completed':
      return 'Ainda não completaste nenhuma missão'
    default:
      return 'Sem missões disponíveis'
  }
}

function emptyDescription(tab) {
  switch (tab) {
    case 'in_progress':
      return 'Aceita uma missão para a veres aqui em curso.'
    case 'completed':
      return 'Completa missões para ganhares XP e itens.'
    default:
      return 'Volta mais tarde — novas missões surgem todos os dias.'
  }
}
