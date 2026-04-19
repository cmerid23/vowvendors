import type { UnsplashPhoto } from '../types'

const CACHE_PREFIX = 'wedpose_img_'

export async function fetchUnsplashPhotos(
  query: string,
  apiKey: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'portrait',
  page = 1,
  perPage = 12
): Promise<UnsplashPhoto[]> {
  const cacheKey = `${CACHE_PREFIX}${query}_${orientation}_${page}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) return JSON.parse(cached)

  if (!apiKey) throw new Error('NO_API_KEY')

  const params = new URLSearchParams({
    query,
    orientation,
    page: String(page),
    per_page: String(perPage),
    content_filter: 'high',
  })

  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${apiKey}` },
  })

  if (res.status === 401) throw new Error('INVALID_API_KEY')
  if (res.status === 403) throw new Error('RATE_LIMITED')
  if (!res.ok) throw new Error(`HTTP_${res.status}`)

  const data = await res.json()
  const photos: UnsplashPhoto[] = data.results || []
  sessionStorage.setItem(cacheKey, JSON.stringify(photos))
  return photos
}

export function getUnsplashErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'NO_API_KEY':
        return 'Add your Unsplash API key in Settings to load pose images.'
      case 'INVALID_API_KEY':
        return 'Invalid API key. Check your Unsplash Access Key in Settings.'
      case 'RATE_LIMITED':
        return 'Rate limit reached. Please wait a moment and try again.'
      default:
        return 'Failed to load images. Check your connection and API key.'
    }
  }
  return 'An unexpected error occurred.'
}
