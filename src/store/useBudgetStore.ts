import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateBudgetPlan } from '../features/budget/lib/calculator'
import type { BudgetPlan } from '../features/budget/lib/calculator'
import { supabase } from '../lib/supabase'

interface BudgetState {
  totalBudget: number | null
  guestCount: number | null
  weddingDate: string
  state: string
  skippedCategories: string[]
  customAllocations: Record<string, number>
  plan: BudgetPlan | null
  isCalculated: boolean
  activeCategory: string | null
  emailCaptured: boolean
  coupleEmail: string | null

  setTotalBudget: (amount: number) => void
  setGuestCount: (count: number) => void
  setWeddingDate: (date: string) => void
  setState: (s: string) => void
  toggleSkipCategory: (id: string) => void
  setCustomAllocation: (id: string, pct: number) => void
  resetAllocations: () => void
  calculate: () => void
  captureEmail: (email: string, vendorId?: string, vendorName?: string) => Promise<void>
  clearPlan: () => void
  setActiveCategory: (id: string | null) => void
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function runCalculate(get: () => BudgetState, set: (s: Partial<BudgetState>) => void) {
  const s = get()
  if (!s.totalBudget || !s.guestCount) return
  const plan = calculateBudgetPlan({
    totalBudget: s.totalBudget,
    guestCount: s.guestCount,
    weddingDate: s.weddingDate,
    state: s.state,
    skippedCategories: s.skippedCategories,
    customAllocations: s.customAllocations,
  })
  set({ plan, isCalculated: true })
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      totalBudget: null,
      guestCount: null,
      weddingDate: '',
      state: '',
      skippedCategories: [],
      customAllocations: {},
      plan: null,
      isCalculated: false,
      activeCategory: null,
      emailCaptured: false,
      coupleEmail: null,

      setTotalBudget: (amount) => set({ totalBudget: amount }),
      setGuestCount: (count) => set({ guestCount: count }),
      setWeddingDate: (date) => set({ weddingDate: date }),
      setState: (s) => set({ state: s }),

      toggleSkipCategory: (id) =>
        set((prev) => ({
          skippedCategories: prev.skippedCategories.includes(id)
            ? prev.skippedCategories.filter((c) => c !== id)
            : [...prev.skippedCategories, id],
        })),

      setCustomAllocation: (id, pct) => {
        set((prev) => ({
          customAllocations: { ...prev.customAllocations, [id]: pct },
        }))
        // Debounced recalculate on slider drag
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => runCalculate(get, set), 250)
      },

      resetAllocations: () => set({ customAllocations: {} }),

      calculate: () => runCalculate(get, set),

      captureEmail: async (email, vendorId, vendorName) => {
        set({ emailCaptured: true, coupleEmail: email })
        const s = get()
        try {
          await supabase.from('leads').insert({
            name: 'Budget Tool Lead',
            email,
            state: s.state || null,
            event_date: s.weddingDate || null,
            service_interest: s.plan?.categories
              .filter((c) => c.tier !== 'skip')
              .map((c) => c.categoryId) ?? [],
            message: `Budget: $${s.totalBudget?.toLocaleString()}, Guests: ${s.guestCount}${vendorName ? `, Interested in: ${vendorName}` : ''}`,
            source: 'budget-matcher',
            vendor_id: vendorId ?? null,
            status: 'new',
          })
        } catch {
          // Fail silently — email already captured in store
        }
      },

      clearPlan: () =>
        set({
          plan: null,
          isCalculated: false,
          customAllocations: {},
          skippedCategories: [],
          activeCategory: null,
        }),

      setActiveCategory: (id) => set({ activeCategory: id }),
    }),
    {
      name: 'vowvendors-budget',
      partialize: (s) => ({
        totalBudget: s.totalBudget,
        guestCount: s.guestCount,
        weddingDate: s.weddingDate,
        state: s.state,
        skippedCategories: s.skippedCategories,
        customAllocations: s.customAllocations,
        emailCaptured: s.emailCaptured,
        coupleEmail: s.coupleEmail,
      }),
    }
  )
)
