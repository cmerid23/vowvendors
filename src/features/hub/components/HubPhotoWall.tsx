import { useState } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHubPhotoWall } from '../hooks/useHubPhotoWall'
import type { WeddingHub } from '../../../types/hub'

interface Props {
  hub: WeddingHub
  onUploadClick: () => void
}

function getPhotoUrl(key: string): string {
  const base = (import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '')
  return base ? `${base}/${key}` : ''
}

export function HubPhotoWall({ hub, onUploadClick }: Props) {
  const { photos, isLoading, likePhoto, likedIds } = useHubPhotoWall(hub.id)
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (isLoading) {
    return (
      <section id="photos" className="px-4 py-10 max-w-2xl mx-auto">
        <div className="h-8 bg-ink-100 rounded w-40 mx-auto mb-6 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-ink-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="photos" className="px-4 py-10 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-2">Share Your Photos 📸</h2>
      <p className="font-body text-sm text-ink-400 text-center mb-6">
        Capture the moments you see — we would love your perspective of our day!
      </p>

      {/* Upload CTA */}
      <button
        onClick={onUploadClick}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed font-body font-semibold text-base transition-all mb-6"
        style={{ borderColor: hub.accent_color, color: hub.accent_color }}
      >
        📷 Upload Your Photos
      </button>

      {/* Photo grid — masonry 2 columns */}
      {photos.length === 0 ? (
        <p className="font-body text-sm text-ink-300 text-center py-8">
          No photos yet. Be the first to share a moment!
        </p>
      ) : (
        <div className="columns-2 gap-2 space-y-2">
          <AnimatePresence>
            {photos.map((photo) => {
              const thumbUrl = getPhotoUrl(photo.r2_thumbnail_key || photo.r2_original_key)
              const fullUrl = getPhotoUrl(photo.r2_medium_key || photo.r2_original_key)
              const liked = likedIds.has(photo.id)

              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="break-inside-avoid mb-2 relative group rounded-xl overflow-hidden bg-ink-100 cursor-pointer"
                  onClick={() => setLightbox(fullUrl)}
                >
                  {thumbUrl && (
                    <img src={thumbUrl} alt="" className="w-full object-cover block" loading="lazy" />
                  )}
                  {/* Footer overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 py-2 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-body text-xs text-white/80 truncate">
                      {photo.uploader_name || 'Guest'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); likePhoto(photo.id) }}
                      className={`flex items-center gap-1 text-xs font-body transition-colors ${liked ? 'text-red-400' : 'text-white/70 hover:text-red-400'}`}
                    >
                      <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
                      {photo.like_count > 0 && <span>{photo.like_count}</span>}
                    </button>
                  </div>
                  {photo.is_featured && (
                    <div className="absolute top-2 left-2 bg-[var(--ac)] text-white text-xs px-1.5 py-0.5 rounded-full font-body"
                      style={{ '--ac': hub.accent_color } as React.CSSProperties}
                    >★</div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
