import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { HubPhoto } from '../../../types/hub'

export function getSessionId(): string {
  let id = localStorage.getItem('vv_session')
  if (!id) {
    id = `sess_${Math.random().toString(36).slice(2)}`
    localStorage.setItem('vv_session', id)
  }
  return id
}

export function useHubPhotoWall(hubId: string) {
  const [photos, setPhotos] = useState<HubPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase
      .from('hub_photos')
      .select('*')
      .eq('hub_id', hubId)
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(40)
    setPhotos((data as HubPhoto[]) || [])
    setIsLoading(false)
  }, [hubId])

  useEffect(() => {
    loadPhotos()

    const channel = supabase
      .channel(`hub-photos-${hubId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hub_photos', filter: `hub_id=eq.${hubId}` },
        (payload) => {
          const photo = payload.new as HubPhoto
          if (photo.is_approved) {
            setPhotos((prev) => [photo, ...prev])
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'hub_photos', filter: `hub_id=eq.${hubId}` },
        (payload) => {
          const updated = payload.new as HubPhoto
          if (!updated.is_approved) {
            setPhotos((prev) => prev.filter((p) => p.id !== updated.id))
          } else {
            setPhotos((prev) => prev.map((p) => p.id === updated.id ? updated : p))
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [hubId, loadPhotos])

  const likePhoto = useCallback(async (photoId: string) => {
    if (likedIds.has(photoId)) return
    setLikedIds((prev) => new Set([...prev, photoId]))
    setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, like_count: p.like_count + 1 } : p))

    const { error } = await supabase
      .from('hub_photo_likes')
      .insert({ photo_id: photoId, session_id: getSessionId() })

    if (!error) {
      await supabase.rpc('increment_photo_like', { p_photo_id: photoId })
    } else {
      setLikedIds((prev) => { const s = new Set(prev); s.delete(photoId); return s })
      setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, like_count: p.like_count - 1 } : p))
    }
  }, [likedIds])

  return { photos, isLoading, likePhoto, likedIds, reload: loadPhotos }
}
