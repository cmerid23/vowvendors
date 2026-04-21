import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Contract, ContractStatus } from '../types/contracts'

interface ContractsState {
  contracts: Contract[]
  isLoading: boolean
  filter: 'all' | ContractStatus

  loadContracts: (vendorId: string) => Promise<void>
  upsertContract: (contract: Contract) => void
  removeContract: (id: string) => void
  setFilter: (filter: ContractsState['filter']) => void
  getByStatus: (status: ContractStatus) => Contract[]
  getPendingCount: () => number
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  contracts: [],
  isLoading: false,
  filter: 'all',

  loadContracts: async (vendorId) => {
    set({ isLoading: true })
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
    set({ contracts: (data as Contract[]) || [], isLoading: false })
  },

  upsertContract: (contract) =>
    set((s) => {
      const exists = s.contracts.find((c) => c.id === contract.id)
      if (exists) {
        return { contracts: s.contracts.map((c) => c.id === contract.id ? contract : c) }
      }
      return { contracts: [contract, ...s.contracts] }
    }),

  removeContract: (id) =>
    set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),

  setFilter: (filter) => set({ filter }),

  getByStatus: (status) => get().contracts.filter((c) => c.status === status),

  getPendingCount: () =>
    get().contracts.filter((c) => c.status === 'sent' || c.status === 'viewed').length,
}))
