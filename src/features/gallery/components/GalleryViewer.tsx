import { useState, useEffect } from 'react'
import { Heart, Download, ArrowRight, Share2, Check } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/useAuthStore'
import { useGalleryStore } from '../../../store/useGalleryStore'
import { AlbumNav } from './AlbumNav'
import { PhotoGrid } from './PhotoGrid'
import { PhotoLightbox } from './PhotoLightbox'
import { downloadAsZip, galleryShareUrl } from '../../../lib/galleryUtils'
import type { Gallery, GalleryAlbum, GalleryMedia, GalleryFavourite } from '../../../types/gallery'

interface Props {
  gallery: Gallery
  albums: GalleryAlbum[]
  photos: GalleryMedia[]
}

export function GalleryViewer({ gallery, albums: initialAlbums, photos: initialPhotos }: Props) {
  const user = useAuthStore((s) => s.user)
  const { openLightbox } = useGalleryStore()
  const [albums] = useState(initialAlbums)
  const [photos] = useState(initialPhotos)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!user || !gallery.allow_favourites) return
    supabase
      .from('gallery_favourites')
      .select('media_id')
      .eq('gallery_id', gallery.id)
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setFavouriteIds(new Set(data.map((f: Pick<GalleryFavourite, 'media_id'>) => f.media_id)))
      })
  }, [user, gallery.id, gallery.allow_favourites])

  const handleToggleFavourite = async (mediaId: string) => {
    if (!user) return
    const isFav = favouriteIds.has(mediaId)
    if (isFav) {
      await supabase.from('gallery_favourites').delete()
        .eq('gallery_id', gallery.id).eq('media_id', mediaId).eq('user_id', user.id)
      setFavouriteIds((prev) => { const s = new Set(prev); s.delete(mediaId); return s })
    } else {
      await supabase.from('gallery_favourites').insert({ gallery_id: gallery.id, media_id: mediaId, user_id: user.id })
      setFavouriteIds((prev) => new Set([...prev, mediaId]))
    }
  }

  const handleShare = async () => {
    const url = galleryShareUrl(gallery.slug)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownloadAll = async () => {
    const visible = selectedAlbumId ? photos.filter((p) => p.album_id === selectedAlbumId) : photos
    setDownloading(true)
    const items = visible.map((p) => ({
      url: supabase.storage.from('gallery-media').getPublicUrl(p.storage_path).data.publicUrl,
      name: p.file_name,
    }))
    await downloadAsZip(items, gallery.title)
    setDownloading(false)
  }

  const visiblePhotos = selectedAlbumId ? photos.filter((p) => p.album_id === selectedAlbumId) : photos
  const favCount = favouriteIds.size

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="relative h-52 sm:h-72 overflow-hidden bg-ink">
        {gallery.cover_photo_url && (
          <img src={gallery.cover_photo_url} alt={gallery.title} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-display text-3xl sm:text-4xl text-white font-semibold">{gallery.title}</h1>
          {gallery.couple_names && <p className="font-body text-white/80 text-lg mt-1">{gallery.couple_names}</p>}
          {gallery.wedding_date && (
            <p className="font-body text-white/50 text-sm mt-0.5">
              {new Date(gallery.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats + actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-4 font-body text-sm text-ink-400">
            <span>{photos.length} photos</span>
            {gallery.allow_favourites && favCount > 0 && (
              <span className="flex items-center gap-1 text-brand"><Heart size={13} fill="currentColor" /> {favCount} favourites</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm font-body text-ink-400 hover:text-brand hover:border-brand transition-colors"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            {gallery.allow_downloads && (
              <button
                onClick={handleDownloadAll}
                disabled={downloading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-white text-sm font-body hover:bg-brand/90 transition-colors disabled:opacity-60"
              >
                <Download size={13} /> {downloading ? 'Zipping…' : 'Download All'}
              </button>
            )}
          </div>
        </div>

        {/* Album nav */}
        {albums.length > 0 && (
          <div className="mb-5">
            <AlbumNav
              galleryId={gallery.id}
              albums={albums}
              selectedAlbumId={selectedAlbumId}
              onSelect={setSelectedAlbumId}
              onAlbumCreated={() => {}}
              readOnly
            />
          </div>
        )}

        {/* Photo grid */}
        <PhotoGrid
          photos={photos}
          selectedAlbumId={selectedAlbumId}
          onOpenLightbox={(idx) => {
            const offset = selectedAlbumId
              ? photos.findIndex((p) => p.id === visiblePhotos[idx]?.id)
              : idx
            openLightbox(offset)
          }}
          favouriteIds={gallery.allow_favourites ? favouriteIds : undefined}
          onToggleFavourite={gallery.allow_favourites && user ? handleToggleFavourite : undefined}
          allowDownloads={gallery.allow_downloads}
          allowFavourites={gallery.allow_favourites}
        />

        <PhotoLightbox
          photos={photos}
          favouriteIds={favouriteIds}
          onToggleFavourite={gallery.allow_favourites && user ? handleToggleFavourite : undefined}
          allowDownloads={gallery.allow_downloads}
          allowFavourites={gallery.allow_favourites}
        />

        {/* Get your own gallery CTA */}
        <div className="mt-16 bg-ink text-white rounded-2xl p-6 sm:p-8 text-center">
          <p className="font-body text-white/60 text-xs uppercase tracking-widest mb-2">Powered by VowVendors</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">Love how this gallery looks?</h2>
          <p className="font-body text-white/70 text-sm mb-5">
            Photographers get unlimited client galleries free — no watermarks, no subscriptions.
          </p>
          <a
            href="/join"
            className="inline-flex items-center gap-2 bg-brand text-white font-body font-semibold text-sm px-6 py-3 rounded-xl hover:bg-brand/90 transition-colors"
          >
            Get Your Free Gallery <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
