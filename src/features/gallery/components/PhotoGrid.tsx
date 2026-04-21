import { useState } from 'react'
import { Heart, Download, Trash2, Star } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { GalleryMedia } from '../../../types/gallery'

interface Props {
  photos: GalleryMedia[]
  selectedAlbumId: string | null
  onOpenLightbox: (index: number) => void
  favouriteIds?: Set<string>
  onToggleFavourite?: (mediaId: string) => void
  allowDownloads?: boolean
  allowFavourites?: boolean
  isVendor?: boolean
  onDeleted?: (mediaId: string) => void
  onHeroToggle?: (mediaId: string, current: boolean) => void
}

export function PhotoGrid({
  photos,
  selectedAlbumId,
  onOpenLightbox,
  favouriteIds = new Set(),
  onToggleFavourite,
  allowDownloads = true,
  allowFavourites = true,
  isVendor = false,
  onDeleted,
  onHeroToggle,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const visible = selectedAlbumId
    ? photos.filter((p) => p.album_id === selectedAlbumId)
    : photos

  const handleDelete = async (photo: GalleryMedia) => {
    if (!window.confirm('Delete this photo permanently?')) return
    setDeletingId(photo.id)
    await supabase.from('gallery_media').delete().eq('id', photo.id)
    onDeleted?.(photo.id)
    setDeletingId(null)
  }

  const handleDownload = async (photo: GalleryMedia) => {
    const { data } = supabase.storage.from('gallery-media').getPublicUrl(photo.storage_path)
    const a = document.createElement('a')
    a.href = data.publicUrl
    a.download = photo.file_name
    a.target = '_blank'
    a.click()
    await supabase.from('galleries').update({ download_count: undefined }).eq('id', photo.gallery_id)
  }

  if (visible.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-xl text-ink mb-1">No photos yet</p>
        <p className="font-body text-ink-400 text-sm">
          {isVendor ? 'Upload photos using the drop zone above.' : 'No photos in this album.'}
        </p>
      </div>
    )
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 space-y-2">
      {visible.map((photo, idx) => {
        const thumbUrl = photo.thumb_path
          ? supabase.storage.from('gallery-media').getPublicUrl(photo.thumb_path).data.publicUrl
          : supabase.storage.from('gallery-media').getPublicUrl(photo.storage_path).data.publicUrl
        const isFav = favouriteIds.has(photo.id)
        const isDeleting = deletingId === photo.id

        return (
          <div
            key={photo.id}
            className="relative group break-inside-avoid rounded-lg overflow-hidden cursor-pointer"
            style={{ opacity: isDeleting ? 0.4 : 1 }}
          >
            <img
              src={thumbUrl}
              alt={photo.file_name}
              loading="lazy"
              className="w-full block object-cover group-hover:brightness-90 transition-all duration-200"
              onClick={() => onOpenLightbox(idx)}
            />

            {photo.is_hero_shot && (
              <span className="absolute top-1.5 left-1.5 bg-amber-400 text-white rounded-full p-0.5">
                <Star size={10} fill="white" />
              </span>
            )}

            {/* Action overlay */}
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {allowFavourites && onToggleFavourite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavourite(photo.id) }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-colors ${
                    isFav ? 'bg-brand text-white' : 'bg-white/90 text-ink-400 hover:text-brand'
                  }`}
                >
                  <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              )}
              {allowDownloads && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(photo) }}
                  className="w-7 h-7 rounded-full bg-white/90 text-ink-400 hover:text-brand flex items-center justify-center shadow-md transition-colors"
                >
                  <Download size={13} />
                </button>
              )}
              {isVendor && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onHeroToggle?.(photo.id, photo.is_hero_shot) }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-colors ${
                      photo.is_hero_shot ? 'bg-amber-400 text-white' : 'bg-white/90 text-ink-400 hover:text-amber-500'
                    }`}
                    title="Toggle hero shot"
                  >
                    <Star size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo) }}
                    className="w-7 h-7 rounded-full bg-white/90 text-ink-400 hover:text-red-500 flex items-center justify-center shadow-md transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
