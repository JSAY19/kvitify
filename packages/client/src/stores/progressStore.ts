import { create } from 'zustand'
import type { DashboardData, CheckinInput, CravingInput } from '@kvitifai/shared'
import { api } from '../services/api'

export interface CheckinResult {
  pointsAwarded: number
  pointsTotal: number
  newAchievements: string[]
  usedTobacco: boolean
}

interface ProgressState {
  dashboard: DashboardData | null
  isLoading: boolean
  fetchDashboard: () => Promise<void>
  submitCheckin: (data: CheckinInput) => Promise<CheckinResult>
  submitCraving: (data: CravingInput) => Promise<void>
}

export const useProgressStore = create<ProgressState>()((set) => ({
  dashboard: null,
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/progress/dashboard')
      set({ dashboard: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  submitCheckin: async (data) => {
    const res = await api.post('/progress/checkin', data)
    return {
      pointsAwarded: res.data.pointsAwarded ?? 0,
      pointsTotal: res.data.pointsTotal ?? 0,
      newAchievements: res.data.newAchievements ?? [],
      usedTobacco: !!res.data.usedTobacco,
    }
  },

  submitCraving: async (data) => {
    await api.post('/progress/craving', data)
  },
}))
