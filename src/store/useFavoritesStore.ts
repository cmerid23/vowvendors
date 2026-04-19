import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface FavoritesState {
  vendorIds: string[]
  toggle: (vendorId: string) => void
  isFavorite: (vendorId: string) => boolean
  syncToDb: (userId: string) => Promise<void>
  loadFromDb: (userId: string) => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      vendorIds: [],

      toggle: (vendorId) =>
        set((state) => ({
          vendorIds: state.vendorIds.includes(vendorId)
            ? state.vendorIds.filter((id) => id !== vendorId)
            : [...state.vendorIds, vendorId],
        })),

      isFavorite: (vendorId) => get().vendorIds.includes(vendorId),

      syncToDb: async (userId) => {
        const { vendorIds } = get()
        if (!vendorIds.length) return
        const rows = vendorIds.map((vendor_id) => ({ user_id: userId, vendor_id }))
        await supabase.from('favorites').upsert(rows, { onConflict: 'user_id,vendor_id' })
      },

      loadFromDb: async (userId) => {
        const { data } = await supabase
          .from('favorites')
          .select('vendor_id')
          .eq('user_id', userId)
        if (data) set({ vendorIds: data.map((r) => r.vendor_id) })
      },
    }),
    { name: 'vv-favorites' }
  )
)
