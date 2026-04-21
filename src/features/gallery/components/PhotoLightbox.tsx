import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGalleryStore } from '../../../store/useGalleryStore'
import { supabase } from '../../../lib/supabase'
import type { GalleryMedia } from '../../../types/gallery'

interface Props {
  photos: GalleryMedia[]
  favouriteIds?: Set<string>
  onToggleFavourite?: (mediaId: string) => void
  allowDownloads?: boolean
  allowFavourites?: boolean
}

export function PhotoLightbox({ photos, favouriteIds = new Set(), onToggleFavourite, allowDownloads = true, allowFavourites = true }: Props) {
  const { lightboxIndex, closeLightbox, stepLightbox } = useGalleryStore()

  const isOpen = lightboxIndex !== null
  const photo = lightboxIndex !== null ? photos[lightboxIndex] : null

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') stepLightbox(1, photos.length)
      if (e.key === 'ArrowLeft') stepLightbox(-1, photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, photos.length, closeLightbox, stepLightbox])

  const handleDownload = () => {
    if (!photo) return
    const { data } = supabase.storage.from('gallery-media').getPublicUrl(photo.storage_path)
    const a = document.createElement('a')
    a.href = data.publicUrl
    a.download = photo.file_name
    a.target = '_blank'
    a.click()
  }

  const getUrl = (p: GalleryMedia) =>
    supabase.storage.from('gallery-media').getPublicUrl(p.medium_path || p.storage_path).data.publicUrl

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Controls top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10">
            <span className="text-white/60 text-sm font-body">
              {lightboxIndex! + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-2">
              {allowFavourites && onToggleFavourite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavourite(photo.id) }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    favouriteIds.has(photo.id) ? 'bg-brand text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart size={16} fill={favouriteIds.has(photo.id) ? 'currentColor' : 'none'} />
                </button>
              )}
              {allowDownloads && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload() }}
                  className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Download size={16} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); closeLightbox() }}
                className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Image */}
          <motion.img
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={getUrl(photo)}
            alt={photo.file_name}
            className="max-w-full max-h-full object-contain select-none"
            style={{ maxHeight: 'calc(100vh - 80px)', maxWidth: 'calc(100vw - 120px)' }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); stepLightbox(-1, photos.length) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); stepLightbox(1, photos.length) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
