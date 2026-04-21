import { create } from 'zustand'
import type { UploadItem } from '../types/gallery'

// Tracks gallery password unlocks for the current session
// key = gallery slug, value = true (unlocked)
const SESSION_KEY = 'vv-gallery-unlocks'

function getUnlocks(): Record<string, boolean> {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}') } catch { return {} }
}
function setUnlock(slug: string) {
  const u = getUnlocks()
  u[slug] = true
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
}

interface GalleryStore {
  // Upload queue
  uploads: UploadItem[]
  addUploads: (items: UploadItem[]) => void
  updateUpload: (id: string, patch: Partial<UploadItem>) => void
  clearUploads: () => void

  // Session unlocks
  isUnlocked: (slug: string) => boolean
  unlock: (slug: string) => void

  // Lightbox
  lightboxIndex: number | null
  openLightbox: (index: number) => void
  closeLightbox: () => void
  stepLightbox: (dir: 1 | -1, total: number) => void
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  uploads: [],

  addUploads: (items) => set((s) => ({ uploads: [...s.uploads, ...items] })),

  updateUpload: (id, patch) =>
    set((s) => ({ uploads: s.uploads.map((u) => u.id === id ? { ...u, ...patch } : u) })),

  clearUploads: () => set({ uploads: [] }),

  isUnlocked: (slug) => getUnlocks()[slug] === true,

  unlock: (slug) => {
    setUnlock(slug)
    set({}) // trigger re-render
  },

  lightboxIndex: null,
  openLightbox: (index) => set({ lightboxIndex: index }),
  closeLightbox: () => set({ lightboxIndex: null }),
  stepLightbox: (dir, total) =>
    set((s) => ({
      lightboxIndex: s.lightboxIndex !== null
        ? (s.lightboxIndex + dir + total) % total
        : null,
    })),
}))
