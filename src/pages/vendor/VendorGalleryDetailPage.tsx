import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Eye, Upload as UploadIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { AlbumNav } from '../../features/gallery/components/AlbumNav'
import { UploadZone } from '../../features/gallery/components/UploadZone'
import { PhotoGrid } from '../../features/gallery/components/PhotoGrid'
import { PhotoLightbox } from '../../features/gallery/components/PhotoLightbox'
import { GallerySettings } from '../../features/gallery/components/GallerySettings'
import { useGalleryStore } from '../../store/useGalleryStore'
import { galleryShareUrl } from '../../lib/galleryUtils'
import type { Gallery, GalleryAlbum, GalleryMedia } from '../../types/gallery'

type Tab = 'photos' | 'upload' | 'settings'

export function VendorGalleryDetailPage() {
  const { galleryId } = useParams<{ galleryId: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { openLightbox } = useGalleryStore()

  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [photos, setPhotos] = useState<GalleryMedia[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('photos')
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    if (!galleryId) return
    const { data } = await supabase
      .from('gallery_media')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('created_at', { ascending: false })
    setPhotos((data as GalleryMedia[]) || [])
  }, [galleryId])

  useEffect(() => {
    if (!profile || !galleryId) return
    supabase.from('vendors').select('id').eq('user_id', profile.id).single().then(async ({ data: v }) => {
      if (!v) { setLoading(false); return }
      setVendorId(v.id)

      const [{ data: g }, { data: albs }] = await Promise.all([
        supabase.from('galleries').select('*').eq('id', galleryId).eq('vendor_id', v.id).single(),
        supabase.from('gallery_albums').select('*').eq('gallery_id', galleryId).order('display_order'),
      ])

      if (!g) { navigate('/vendor/galleries'); return }
      setGallery(g as Gallery)
      setAlbums((albs as GalleryAlbum[]) || [])
      await fetchPhotos()
      setLoading(false)
    })
  }, [profile, galleryId, navigate, fetchPhotos])

  const handlePhotoDeleted = (mediaId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== mediaId))
  }

  const handleHeroToggle = async (mediaId: string, current: boolean) => {
    await supabase.from('gallery_media').update({ is_hero_shot: !current }).eq('id', mediaId)
    setPhotos((prev) => prev.map((p) => p.id === mediaId ? { ...p, is_hero_shot: !current } : p))
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ink-50 rounded w-1/3" />
        <div className="h-64 bg-ink-50 rounded-card" />
      </div>
    )
  }

  if (!gallery) return null

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'photos', label: `Photos (${photos.length})`, icon: <Eye size={14} /> },
    { id: 'upload', label: 'Upload', icon: <UploadIcon size={14} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/vendor/galleries')}
          className="mt-1 text-ink-300 hover:text-ink transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl text-ink font-semibold truncate">{gallery.title}</h1>
          {gallery.couple_names && <p className="font-body text-ink-400 text-sm">{gallery.couple_names}</p>}
        </div>
        <a
          href={galleryShareUrl(gallery.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 text-sm font-body text-ink-400 hover:text-brand transition-colors border border-border rounded-full px-3 py-1.5"
        >
          <Eye size={13} /> Preview
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-body font-medium transition-colors border-b-2 -mb-px ${
              tab === id
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-400 hover:text-ink'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'photos' && (
        <div className="space-y-5">
          <AlbumNav
            galleryId={gallery.id}
            albums={albums}
            selectedAlbumId={selectedAlbumId}
            onSelect={setSelectedAlbumId}
            onAlbumCreated={(album) => setAlbums((prev) => [...prev, album])}
          />
          <PhotoGrid
            photos={photos}
            selectedAlbumId={selectedAlbumId}
            onOpenLightbox={(idx) => {
              const visiblePhotos = selectedAlbumId ? photos.filter((p) => p.album_id === selectedAlbumId) : photos
              const offset = selectedAlbumId
                ? photos.findIndex((p) => p.id === visiblePhotos[idx]?.id)
                : idx
              openLightbox(offset)
            }}
            isVendor
            onDeleted={handlePhotoDeleted}
            onHeroToggle={handleHeroToggle}
            allowDownloads
            allowFavourites={false}
          />
          <PhotoLightbox photos={photos} allowDownloads allowFavourites={false} />
        </div>
      )}

      {tab === 'upload' && vendorId && (
        <UploadZone
          galleryId={gallery.id}
          vendorId={vendorId}
          albumId={selectedAlbumId}
          onUploaded={fetchPhotos}
        />
      )}

      {tab === 'settings' && (
        <GallerySettings
          gallery={gallery}
          onUpdated={(patch) => setGallery((prev) => prev ? { ...prev, ...patch } : prev)}
          onDelete={() => navigate('/vendor/galleries')}
        />
      )}
    </div>
  )
}
