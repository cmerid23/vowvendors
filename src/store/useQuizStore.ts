import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizOption } from '../features/quiz/data/questions'
import type { StyleDimensions } from '../features/quiz/data/dimensions'
import type { ProfileMatch } from '../features/quiz/lib/profileMatcher'
import { calculateDimensions, matchProfiles } from '../features/quiz/lib/profileMatcher'

type QuizPhase = 'start' | 'quiz' | 'result'

interface QuizState {
  phase: QuizPhase
  currentQuestion: number
  selectedOptions: QuizOption[]
  dimensions: StyleDimensions | null
  topMatches: ProfileMatch[]

  startQuiz: () => void
  answerQuestion: (option: QuizOption, totalQuestions: number) => void
  retakeQuiz: () => void
  reset: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      phase: 'start',
      currentQuestion: 0,
      selectedOptions: [],
      dimensions: null,
      topMatches: [],

      startQuiz: () => set({ phase: 'quiz', currentQuestion: 0, selectedOptions: [], dimensions: null, topMatches: [] }),

      answerQuestion: (option, totalQuestions) => {
        const prev = get().selectedOptions
        const updated = [...prev, option]
        const isLast = updated.length >= totalQuestions
        if (isLast) {
          const dims = calculateDimensions(updated)
          const matches = matchProfiles(dims)
          set({ selectedOptions: updated, dimensions: dims, topMatches: matches, phase: 'result' })
        } else {
          set({ selectedOptions: updated, currentQuestion: get().currentQuestion + 1 })
        }
      },

      retakeQuiz: () => set({ phase: 'quiz', currentQuestion: 0, selectedOptions: [], dimensions: null, topMatches: [] }),

      reset: () => set({ phase: 'start', currentQuestion: 0, selectedOptions: [], dimensions: null, topMatches: [] }),
    }),
    { name: 'vowvendors-quiz' }
  )
)
