import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface HubAnalyticsData {
  totalScans: number
  totalGuestAccounts: number
  totalPhotos: number
  totalLikes: number
  totalSongRequests: number
}

export function useHubAnalytics(hubId: string | undefined) {
  const [analytics, setAnalytics] = useState<HubAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!hubId) return
    setIsLoading(true)

    const load = async () => {
      const { data: hub } = await supabase
        .from('wedding_hubs')
        .select('total_scans, total_guest_accounts, total_photos_uploaded')
        .eq('id', hubId)
        .single()

      const { count: likesCount } = await supabase
        .from('hub_photo_likes')
        .select('id', { count: 'exact', head: true })
        .in(
          'photo_id',
          (await supabase.from('hub_photos').select('id').eq('hub_id', hubId)).data?.map((p) => p.id) ?? [],
        )

      const { count: songCount } = await supabase
        .from('hub_song_requests')
        .select('id', { count: 'exact', head: true })
        .eq('hub_id', hubId)

      setAnalytics({
        totalScans: hub?.total_scans ?? 0,
        totalGuestAccounts: hub?.total_guest_accounts ?? 0,
        totalPhotos: hub?.total_photos_uploaded ?? 0,
        totalLikes: likesCount ?? 0,
        totalSongRequests: songCount ?? 0,
      })
      setIsLoading(false)
    }

    load()

    // Refresh every 30s when dashboard is open
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [hubId])

  return { analytics, isLoading }
}
