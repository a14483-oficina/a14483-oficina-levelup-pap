import { create } from 'zustand'

/**
 * Mission store.
 *
 * Holds two collections:
 *  - `available`: catalog of missions the user has NOT yet accepted.
 *  - `userMissions`: rows from `user_missions` for the current user
 *    (each augmented with the joined mission row at `.mission`).
 *
 * Components subscribe to slices using selectors to avoid extra renders.
 */
export const useMissionStore = create((set, get) => ({
  available: [],
  userMissions: [],
  loading: false,
  loaded: false,

  setAvailable: (available) => set({ available }),
  setUserMissions: (userMissions) => set({ userMissions }),
  setLoading: (loading) => set({ loading }),
  setLoaded: (loaded) => set({ loaded }),

  /** Replace or insert a single user_mission row. */
  upsertUserMission: (row) =>
    set((state) => {
      if (!row) return state
      const idx = state.userMissions.findIndex((um) => um.id === row.id)
      const next = [...state.userMissions]
      if (idx === -1) next.unshift(row)
      else next[idx] = { ...next[idx], ...row }
      return { userMissions: next }
    }),

  /** Remove a mission from the available catalog (e.g. once accepted). */
  removeAvailable: (missionId) =>
    set((state) => ({
      available: state.available.filter((m) => m.id !== missionId),
    })),

  /** Selector helper — derive in-progress missions on the fly. */
  getInProgress: () =>
    get().userMissions.filter(
      (um) => um.status === 'assigned' || um.status === 'in_progress',
    ),

  clear: () =>
    set({ available: [], userMissions: [], loading: false, loaded: false }),
}))
