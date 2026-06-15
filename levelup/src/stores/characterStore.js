import { create } from 'zustand'

/** Per-user character cache. */
export const useCharacterStore = create((set) => ({
  character: null,
  loading: false,

  setCharacter: (character) => set({ character, loading: false }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ character: null, loading: false }),
}))
