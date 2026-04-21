import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useGalleryStore } from '../../store/useGalleryStore'
import { GalleryUnlock } from '../../features/gallery/components/GalleryUnlock'
import { GalleryViewer } from '../../features/gallery/components/GalleryViewer'
import type { Gallery, GalleryAlbum, GalleryMedia } from '../../types/gallery'

export function GalleryViewPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isUnlocked } = useGalleryStore()

  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [photos, setPhotos] = useState<GalleryMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('galleries')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
      .then(async ({ data: g }) => {
        if (!g) { setNotFound(true); setLoading(false); return }
        setGallery(g as Gallery)

        // Check session unlock
        const alreadyUnlocked = !g.password_hash || isUnlocked(slug)
        setUnlocked(alreadyUnlocked)

        if (alreadyUnlocked) {
          await loadContent(g.id)
        }
        setLoading(false)

        // Log access
        supabase.from('gallery_access').insert({ gallery_id: g.id, user_agent: navigator.userAgent }).then(() => {})
        supabase.from('galleries').update({ view_count: g.view_count + 1 }).eq('id', g.id).then(() => {})
      })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadContent = async (galleryId: string) => {
    const [{ data: albs }, { data: media }] = await Promise.all([
      supabase.from('gallery_albums').select('*').eq('gallery_id', galleryId).order('display_order'),
      supabase
        .from('gallery_media')
        .select('*')
        .eq('gallery_id', galleryId)
        .eq('guest_approved', true)
        .order('display_order')
        .order('created_at'),
    ])
    setAlbums((albs as GalleryAlbum[]) || [])
    setPhotos((media as GalleryMedia[]) || [])
  }

  const handleUnlocked = async () => {
    setUnlocked(true)
    if (gallery) await loadContent(gallery.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-body text-ink-400 text-sm">Loading gallery…</p>
        </div>
      </div>
    )
  }

  if (notFound || !gallery) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl text-ink font-semibold mb-2">Gallery not found</h1>
          <p className="font-body text-ink-400">This gallery may have been removed or the link is incorrect.</p>
        </div>
      </div>
    )
  }

  if (gallery.password_hash && !unlocked) {
    return (
      <GalleryUnlock
        slug={slug!}
        passwordHash={gallery.password_hash}
        galleryTitle={gallery.title}
        coupleNames={gallery.couple_names}
        onUnlocked={handleUnlocked}
      />
    )
  }

  return <GalleryViewer gallery={gallery} albums={albums} photos={photos} />
}
