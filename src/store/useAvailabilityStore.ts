import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import {
  getDatesInMonth, getWeekendDatesInMonth, getWorkingDaysInMonth
} from '../lib/dateUtils'
import type { DateEntry, DateStatus, AvailabilitySettings } from '../types/availability'

interface AvailabilityStore {
  entries: Record<string, DateEntry>
  settings: AvailabilitySettings
  vendorId: string | null
  syncing: boolean

  setVendorId: (id: string | null) => void
  setEntry: (date: string, entry: DateEntry | null) => void
  setEntries: (updates: Record<string, DateEntry | null>) => void
  cycleStatus: (date: string) => void
  setSetting: <K extends keyof AvailabilitySettings>(key: K, value: AvailabilitySettings[K]) => void
  blockWeekendsInMonth: (year: number, month: number) => void
  markWorkingDaysAvailable: (year: number, month: number) => void
  clearMonth: (year: number, month: number) => void
  syncToSupabase: () => Promise<void>
  loadFromSupabase: (vendorId: string) => Promise<void>
}

const CYCLE: DateStatus[] = ['available', 'booked', 'tentative']

export const useAvailabilityStore = create<AvailabilityStore>()(
  persist(
    (set, get) => ({
      entries: {},
      settings: { workingDays: [1, 2, 3, 4, 5], defaultStatus: 'available' },
      vendorId: null,
      syncing: false,

      setVendorId: (id) => set({ vendorId: id }),

      setEntry: (date, entry) => set((s) => {
        const next = { ...s.entries }
        if (entry === null) delete next[date]
        else next[date] = entry
        return { entries: next }
      }),

      setEntries: (updates) => set((s) => {
        const next = { ...s.entries }
        for (const [date, entry] of Object.entries(updates)) {
          if (entry === null) delete next[date]
          else next[date] = entry
        }
        return { entries: next }
      }),

      cycleStatus: (date) => set((s) => {
        const current = s.entries[date]
        const currentIdx = current ? CYCLE.indexOf(current.status) : -1
        const nextStatus = CYCLE[(currentIdx + 1) % CYCLE.length]
        const next = { ...s.entries }
        if (nextStatus === CYCLE[0] && currentIdx === CYCLE.length - 1) {
          delete next[date]
        } else {
          next[date] = { ...(current || {}), status: nextStatus }
        }
        return { entries: next }
      }),

      setSetting: (key, value) => set((s) => ({
        settings: { ...s.settings, [key]: value },
      })),

      blockWeekendsInMonth: (year, month) => set((s) => {
        const dates = getWeekendDatesInMonth(year, month)
        const next = { ...s.entries }
        dates.forEach((d) => { next[d] = { ...(next[d] || {}), status: 'booked' } })
        return { entries: next }
      }),

      markWorkingDaysAvailable: (year, month) => set((s) => {
        const dates = getWorkingDaysInMonth(year, month, s.settings.workingDays)
        const next = { ...s.entries }
        dates.forEach((d) => { next[d] = { ...(next[d] || {}), status: 'available' } })
        return { entries: next }
      }),

      clearMonth: (year, month) => set((s) => {
        const dates = new Set(getDatesInMonth(year, month))
        const next = Object.fromEntries(
          Object.entries(s.entries).filter(([k]) => !dates.has(k))
        )
        return { entries: next }
      }),

      syncToSupabase: async () => {
        const { entries, vendorId } = get()
        if (!vendorId) return
        set({ syncing: true })
        try {
          const rows = Object.entries(entries).map(([date, entry]) => ({
            vendor_id: vendorId,
            date,
            status: entry.status,
          }))
          // Delete all existing for this vendor, then upsert
          await supabase.from('vendor_availability').delete().eq('vendor_id', vendorId)
          if (rows.length > 0) {
            await supabase.from('vendor_availability').insert(rows)
          }
        } finally {
          set({ syncing: false })
        }
      },

      loadFromSupabase: async (vendorId) => {
        set({ syncing: true })
        try {
          const { data } = await supabase
            .from('vendor_availability')
            .select('date, status')
            .eq('vendor_id', vendorId)
          if (data) {
            const entries: Record<string, DateEntry> = {}
            data.forEach((row: { date: string; status: DateStatus }) => {
              entries[row.date] = { status: row.status }
            })
            set({ entries, vendorId })
          }
        } finally {
          set({ syncing: false })
        }
      },
    }),
    {
      name: 'vowvendors-availability',
      partialize: (s) => ({ entries: s.entries, settings: s.settings, vendorId: s.vendorId }),
    }
  )
)
