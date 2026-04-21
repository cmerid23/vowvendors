import { create } from 'zustand'
import { getUserStorageStatus } from '../lib/storageQuota'
import type { StorageQuotaStatus } from '../types/storage'

interface StorageState {
  quota: StorageQuotaStatus | null
  loadingQuota: boolean
  showUpgradeModal: boolean

  loadQuota: (userId: string) => Promise<void>
  setShowUpgradeModal: (show: boolean) => void
  checkCanDownload: () => boolean
}

const DEFAULT_QUOTA: StorageQuotaStatus = {
  usedBytes: 0,
  limitBytes: 5 * 1024 * 1024 * 1024,
  usedPercent: 0,
  downloadsThisMonth: 0,
  downloadLimitMonthly: 50,
  planName: 'free',
  canDownload: true,
  canUpload: true,
  warningLevel: 'none',
}

export const useStorageStore = create<StorageState>((set, get) => ({
  quota: null,
  loadingQuota: false,
  showUpgradeModal: false,

  loadQuota: async (userId) => {
    set({ loadingQuota: true })
    try {
      const quota = await getUserStorageStatus(userId)
      set({ quota })
    } catch {
      set({ quota: DEFAULT_QUOTA })
    } finally {
      set({ loadingQuota: false })
    }
  },

  setShowUpgradeModal: (show) => set({ showUpgradeModal: show }),

  checkCanDownload: () => {
    const q = get().quota
    if (!q) return true
    if (!q.canDownload) {
      set({ showUpgradeModal: true })
      return false
    }
    return true
  },
}))
