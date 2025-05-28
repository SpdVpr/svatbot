import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Wedding, WeddingProgress } from '@/types'

interface WeddingState {
  currentWedding: Wedding | null
  isLoading: boolean

  // Actions
  setCurrentWedding: (wedding: Wedding | null) => void
  updateWeddingProgress: (progress: Partial<WeddingProgress>) => void
  setLoading: (loading: boolean) => void
  clearWedding: () => void
}

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set, get) => ({
      currentWedding: null,
      isLoading: false,

      setCurrentWedding: (wedding) => set({
        currentWedding: wedding,
        isLoading: false
      }),

      updateWeddingProgress: (progressUpdate) => {
        const { currentWedding } = get()
        if (!currentWedding) return

        const updatedProgress = {
          ...currentWedding.progress,
          ...progressUpdate
        }

        // Calculate overall progress
        const phases = [
          updatedProgress.foundation,
          updatedProgress.venue,
          updatedProgress.guests,
          updatedProgress.budget,
          updatedProgress.design,
          updatedProgress.organization,
          updatedProgress.final
        ]

        const overall = Math.round(
          phases.reduce((sum, phase) => sum + phase, 0) / phases.length
        )

        const updatedWedding = {
          ...currentWedding,
          progress: {
            ...updatedProgress,
            overall
          }
        }

        set({ currentWedding: updatedWedding })
      },

      setLoading: (isLoading) => set({ isLoading }),

      clearWedding: () => set({
        currentWedding: null,
        isLoading: false
      }),
    }),
    {
      name: 'svatbot-wedding',
      partialize: (state) => ({
        currentWedding: state.currentWedding
      }),
    }
  )
)
