import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  getCharacter,
  createCharacter as createCharacterService,
} from '../services/characterService'
import { useCharacterStore } from '../stores/characterStore'
import { useAuthStore } from '../stores/authStore'

/**
 * Loads the current user's character (if any) and exposes helpers
 * to create/refresh it.
 */
export function useCharacter({ autoLoad = true } = {}) {
  const userId = useAuthStore((s) => s.user?.id)
  const character = useCharacterStore((s) => s.character)
  const loading = useCharacterStore((s) => s.loading)
  const setCharacter = useCharacterStore((s) => s.setCharacter)
  const setLoading = useCharacterStore((s) => s.setLoading)

  const fetchCharacter = useCallback(async () => {
    if (!userId) {
      setCharacter(null)
      return null
    }
    try {
      setLoading(true)
      const data = await getCharacter(userId)
      setCharacter(data)
      return data
    } catch (error) {
      toast.error('Erro ao carregar o teu personagem.')

      console.error('getCharacter error:', error)
      setLoading(false)
      return null
    }
  }, [userId, setCharacter, setLoading])

  useEffect(() => {
    if (autoLoad && userId) {
      fetchCharacter()
    }
  }, [autoLoad, userId, fetchCharacter])

  const createCharacter = useCallback(
    async ({ name, classType }) => {
      if (!userId) throw new Error('Not authenticated')
      try {
        const newChar = await createCharacterService({
          userId,
          name,
          classType,
        })
        setCharacter(newChar)
        toast.success('Personagem criado!')
        return newChar
      } catch (error) {
        toast.error('Erro ao criar personagem. Tenta novamente.')

        console.error('createCharacter error:', error)
        throw error
      }
    },
    [userId, setCharacter],
  )

  return {
    character,
    loading,
    fetchCharacter,
    createCharacter,
    hasCharacter: Boolean(character),
  }
}
