import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PoseCard, FavoriteCollection } from '../types'

interface WedPoseState {
  unsplashApiKey: string
  darkMode: boolean
  setUnsplashApiKey: (key: string) => void
  setDarkMode: (dark: boolean) => void

  favorites: PoseCard[]
  collections: FavoriteCollection[]
  addFavorite: (pose: PoseCard) => void
  removeFavorite: (poseId: string) => void
  isFavorite: (poseId: string) => boolean
  addCollection: (name: string) => void
  removeCollection: (id: string) => void
  addPoseToCollection: (collectionId: string, poseId: string) => void
  removePoseFromCollection: (collectionId: string, poseId: string) => void

  recentlyViewed: PoseCard[]
  addRecentlyViewed: (pose: PoseCard) => void
  clearRecentlyViewed: () => void

  // Tracks the pose a guest tried to heart — triggers the save prompt
  pendingFavoritePose: PoseCard | null
  setPendingFavoritePose: (pose: PoseCard | null) => void
}

export const useWedPoseStore = create<WedPoseState>()(
  persist(
    (set, get) => ({
      unsplashApiKey: '',
      darkMode: true,
      setUnsplashApiKey: (key) => set({ unsplashApiKey: key }),
      setDarkMode: (dark) => set({ darkMode: dark }),

      favorites: [],
      collections: [],

      addFavorite: (pose) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === pose.id)
            ? state.favorites
            : [pose, ...state.favorites],
        })),

      removeFavorite: (poseId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== poseId),
          collections: state.collections.map((col) => ({
            ...col,
            poseIds: col.poseIds.filter((id) => id !== poseId),
          })),
        })),

      isFavorite: (poseId) => get().favorites.some((f) => f.id === poseId),

      addCollection: (name) =>
        set((state) => ({
          collections: [
            ...state.collections,
            { id: `col-${Date.now()}`, name, poseIds: [], createdAt: Date.now() },
          ],
        })),

      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),

      addPoseToCollection: (collectionId, poseId) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId && !col.poseIds.includes(poseId)
              ? { ...col, poseIds: [...col.poseIds, poseId] }
              : col
          ),
        })),

      removePoseFromCollection: (collectionId, poseId) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? { ...col, poseIds: col.poseIds.filter((id) => id !== poseId) }
              : col
          ),
        })),

      recentlyViewed: [],

      pendingFavoritePose: null,
      setPendingFavoritePose: (pose) => set({ pendingFavoritePose: pose }),

      addRecentlyViewed: (pose) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((p) => p.id !== pose.id)
          return { recentlyViewed: [pose, ...filtered].slice(0, 20) }
        }),

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'wedpose-storage',
      partialize: (state) => ({
        unsplashApiKey: state.unsplashApiKey,
        darkMode: state.darkMode,
        favorites: state.favorites,
        collections: state.collections,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
)
