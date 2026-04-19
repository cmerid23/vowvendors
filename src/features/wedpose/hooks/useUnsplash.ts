import { useState, useEffect, useCallback } from 'react'
import type { UnsplashPhoto } from '../types'
import { fetchUnsplashPhotos, getUnsplashErrorMessage } from '../utils/unsplash'
import { useWedPoseStore } from '../store/useWedPoseStore'

interface UseUnsplashResult {
  photos: UnsplashPhoto[]
  loading: boolean
  error: string | null
  page: number
  loadMore: () => void
  hasMore: boolean
}

export function useUnsplash(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'portrait'
): UseUnsplashResult {
  const apiKey = useWedPoseStore((s) => s.unsplashApiKey)
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const load = useCallback(
    async (pageNum: number, replace: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const results = await fetchUnsplashPhotos(query, apiKey, orientation, pageNum, 12)
        setPhotos((prev) => (replace ? results : [...prev, ...results]))
        setHasMore(results.length === 12)
      } catch (err) {
        setError(getUnsplashErrorMessage(err))
      } finally {
        setLoading(false)
      }
    },
    [query, apiKey, orientation]
  )

  useEffect(() => {
    setPhotos([])
    setPage(1)
    setHasMore(true)
    load(1, true)
  }, [query, apiKey, orientation, load])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const next = page + 1
      setPage(next)
      load(next, false)
    }
  }, [loading, hasMore, page, load])

  return { photos, loading, error, page, loadMore, hasMore }
}
