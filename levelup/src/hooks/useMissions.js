import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

import {
  getActiveMissions,
  getUserMissions,
  acceptMission as acceptMissionService,
  completeMission as completeMissionService,
  autoAssignMissions,
} from '../services/missionService'
import { applyXPGain } from '../services/characterService'
import { checkAndUpdateStreak } from '../services/streakService'
import { awardItem, getItem } from '../services/itemService'
import { upsertRanking } from '../services/rankingService'
import { useMissionStore } from '../stores/missionStore'
import { useCharacterStore } from '../stores/characterStore'
import { useStreakStore } from '../stores/streakStore'
import { useAuthStore } from '../stores/authStore'
import { calculateStreakBonus, MISSION_STATUS } from '../utils/constants'

export function useMissions({ autoLoad = true } = {}) {
  const userId = useAuthStore((s) => s.user?.id)
  const available = useMissionStore((s) => s.available)
  const userMissions = useMissionStore((s) => s.userMissions)
  const loading = useMissionStore((s) => s.loading)
  const loaded = useMissionStore((s) => s.loaded)
  const setAvailable = useMissionStore((s) => s.setAvailable)
  const setUserMissions = useMissionStore((s) => s.setUserMissions)
  const setLoading = useMissionStore((s) => s.setLoading)
  const setLoaded = useMissionStore((s) => s.setLoaded)
  const upsertUserMission = useMissionStore((s) => s.upsertUserMission)
  const removeAvailable = useMissionStore((s) => s.removeAvailable)

  const character = useCharacterStore((s) => s.character)
  const setCharacter = useCharacterStore((s) => s.setCharacter)
  const streak = useStreakStore((s) => s.streak)
  const setStreak = useStreakStore((s) => s.setStreak)

  const fetchAll = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      try {
        await autoAssignMissions(userId)
      } catch (err) {
        console.error('autoAssignMissions error:', err)
      }
      const [um, av] = await Promise.all([
        getUserMissions(userId),
        getActiveMissions(userId),
      ])
      setUserMissions(um)
      setAvailable(av)
      setLoaded(true)
    } catch (error) {
      toast.error('Erro ao carregar missões. Tenta novamente.')
      console.error('fetchMissions error:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, setUserMissions, setAvailable, setLoading, setLoaded])

  useEffect(() => {
    if (autoLoad && userId && !loaded) {
      fetchAll()
    }
  }, [autoLoad, userId, loaded, fetchAll])

  const acceptMission = useCallback(
    async (missionId) => {
      if (!userId) return null
      try {
        const row = await acceptMissionService({ userId, missionId })
        upsertUserMission(row)
        removeAvailable(missionId)
        toast.success('Missão aceite! Boa sorte, herói.')
        return row
      } catch (error) {
        toast.error('Erro ao aceitar missão. Tenta novamente.')
        console.error('acceptMission error:', error)
        return null
      }
    },
    [userId, upsertUserMission, removeAvailable],
  )

  const completeMission = useCallback(
    async (userMissionId) => {
      if (!userId) return null
      const userMission = userMissions.find((um) => um.id === userMissionId)
      if (!userMission) { toast.error('Missão não encontrada.'); return null }
      if (!character) { toast.error('Personagem não carregado.'); return null }

      const baseXP = userMission.mission?.xp_reward ?? 0
      const itemRewardId = userMission.mission?.item_reward_id ?? null

      try {
        // 1. Streak
        let streakResult = null
        try {
          streakResult = await checkAndUpdateStreak(userId)
          if (streakResult?.streak) setStreak(streakResult.streak)
        } catch (err) {
          console.error('checkAndUpdateStreak error:', err)
        }

        const bonusXP = streakResult?.streak?.streak_bonus_xp ?? calculateStreakBonus(streak?.current_streak ?? 0)
        const totalXP = baseXP + bonusXP

        // 2. Complete mission
        const updated = await completeMissionService({ userMissionId, xpEarned: totalXP })
        upsertUserMission(updated)

        // 3. Apply XP
        const xpResult = await applyXPGain(character, totalXP)
        setCharacter(xpResult.character)

        // 4. Award item
        let itemResult = null
        if (itemRewardId && character?.id) {
          try {
            itemResult = await awardItem({ characterId: character.id, itemId: itemRewardId })
            const item = itemResult.row?.item ?? (await getItem(itemRewardId))
            if (item && !itemResult.alreadyOwned) {
              toast.success(`🎁 Item obtido: ${item.name}!`, { duration: 4000 })
            }
          } catch (err) {
            console.error('awardItem error:', err)
            toast.error('XP atribuído, mas houve um erro ao entregar o item.')
          }
        }

        // 5. Update ranking
        try {
          const allMissions = await getUserMissions(userId)
          const weeklyXp = allMissions
            .filter((um) => um.status === MISSION_STATUS.COMPLETED)
            .reduce((sum, um) => sum + (um.xp_earned ?? 0), 0)
          const missionsCompleted = allMissions.filter(
            (um) => um.status === MISSION_STATUS.COMPLETED
          ).length
          await upsertRanking({ userId, weeklyXp, missionsCompleted })
        } catch (err) {
          console.error('upsertRanking error:', err)
        }

        // 6. Toast
        if (bonusXP > 0) {
          toast.success(`+${baseXP} XP · 🔥 Bónus de sequência: +${bonusXP} XP`, { duration: 3500 })
        } else {
          toast.success(`+${baseXP} XP — missão completa!`)
        }

        return {
          userMission: updated,
          xpGained: totalXP,
          baseXP,
          bonusXP,
          leveledUp: xpResult.leveledUp,
          levelUps: xpResult.levelUps,
          character: xpResult.character,
          itemAwarded: itemResult?.row ?? null,
          itemAlreadyOwned: itemResult?.alreadyOwned ?? false,
        }
      } catch (error) {
        toast.error('Erro ao completar missão. Tenta novamente.')
        console.error('completeMission error:', error)
        return null
      }
    },
    [userId, userMissions, character, streak, setStreak, upsertUserMission, setCharacter],
  )

  const inProgress = useMemo(
    () => userMissions.filter((um) => um.status === MISSION_STATUS.ASSIGNED || um.status === MISSION_STATUS.IN_PROGRESS),
    [userMissions],
  )

  const completed = useMemo(
    () => userMissions.filter((um) => um.status === MISSION_STATUS.COMPLETED),
    [userMissions],
  )

  const todayCompleted = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    return completed.filter((um) => um.completed_at?.slice(0, 10) === todayStr)
  }, [completed])

  return {
    available, userMissions, inProgress, completed, todayCompleted,
    loading, loaded, fetchAll, acceptMission, completeMission,
  }
}
