import { useEffect, useState } from 'react'
import type { PoseCard } from '../../types'
import { HeartButton } from '../ui/HeartButton'
import { useWedPoseStore } from '../../store/useWedPoseStore'
import { getSubcategoryById } from '../../data/categories'
import { X, Maximize2, ExternalLink, Link2 } from 'lucide-react'

interface PoseModalProps {
  pose: PoseCard | null
  relatedPoses: PoseCard[]
  onClose: () => void
  onSelectRelated: (pose: PoseCard) => void
}

export function PoseModal({ pose, relatedPoses, onClose, onSelectRelated }: PoseModalProps) {
  const addRecentlyViewed = useWedPoseStore((s) => s.addRecentlyViewed)
  const [fullscreen, setFullscreen] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (pose) {
      addRecentlyViewed(pose)
      setImgLoaded(false)
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [pose, addRecentlyViewed])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fullscreen ? setFullscreen(false) : onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, fullscreen])

  if (!pose) return null

  const sub = getSubcategoryById(pose.categoryId, pose.subcategoryId)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/vendor/wedpose/category/${pose.categoryId}?sub=${pose.subcategoryId}`
    )
  }

  // Fullscreen viewer — uses regular (not full) for mobile performance
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onClick={() => setFullscreen(false)}
      >
        <img
          src={pose.photo.urls.regular}
          alt={pose.poseName}
          className="max-h-screen max-w-full object-contain select-none"
          style={{ touchAction: 'pinch-zoom' }}
        />
        <button
          className="absolute top-4 right-4 text-white bg-black/70 rounded-full w-11 h-11 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setFullscreen(false) }}
          aria-label="Close fullscreen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-charcoal-100 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image — object-contain so full photo is visible, no cropping */}
        <div
          className="relative bg-black rounded-t-2xl flex items-center justify-center"
          style={{ minHeight: '40vw', maxHeight: '60vh' }}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 bg-charcoal-50 animate-pulse rounded-t-2xl" />
          )}
          <img
            src={pose.photo.urls.regular}
            alt={pose.poseName}
            className={`w-full max-h-[60vh] object-contain rounded-t-2xl transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />

          {/* Top controls */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 left-3 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 touch-manipulation"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Heart — bottom right */}
          <div className="absolute bottom-3 right-3 z-10">
            <HeartButton pose={pose} />
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h2 className="font-display text-xl text-cream font-semibold">{pose.poseName}</h2>
            <p className="text-gold text-xs font-body mt-1 uppercase tracking-wider">{pose.subcategoryId.replace(/-/g, ' ')}</p>
          </div>

          {sub?.cameraSettings && (
            <div className="bg-charcoal-50 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-gold text-lg">📷</span>
              <div>
                <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-0.5">Suggested Settings</p>
                <p className="text-cream font-body text-sm font-medium">{sub.cameraSettings}</p>
              </div>
            </div>
          )}

          {sub?.tips && sub.tips.length > 0 && (
            <div>
              <h3 className="font-display text-gold text-sm uppercase tracking-wider mb-3">Photographer Tips</h3>
              <ul className="space-y-2">
                {sub.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-cream-300 font-body text-sm">
                    <span className="text-gold mt-0.5 shrink-0">◆</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sub?.tags && (
            <div className="flex flex-wrap gap-2">
              {sub.tags.map((tag) => (
                <span key={tag} className="bg-charcoal-50 text-cream-400 text-xs font-body px-2.5 py-1 rounded-full border border-gold/20">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={handleCopyLink} className="wp-btn-outline flex-1 flex items-center justify-center gap-2">
              <Link2 className="w-3.5 h-3.5" /> Copy Link
            </button>
            <a
              href={pose.photo.links.html}
              target="_blank"
              rel="noopener noreferrer"
              className="wp-btn-outline flex-1 flex items-center justify-center gap-2 text-center"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Unsplash
            </a>
          </div>

          <p className="text-cream-400 text-xs font-body text-center">
            Photo by{' '}
            <a href={pose.photo.user.links.html} target="_blank" rel="noopener noreferrer" className="text-gold underline">
              {pose.photo.user.name}
            </a>{' '}
            on Unsplash
          </p>

          {relatedPoses.length > 0 && (
            <div>
              <h3 className="font-display text-gold text-sm uppercase tracking-wider mb-3">Related Poses</h3>
              <div className="grid grid-cols-3 gap-2">
                {relatedPoses.slice(0, 3).map((related) => (
                  <button
                    key={related.id}
                    className="rounded-lg overflow-hidden hover:ring-1 hover:ring-gold transition-all touch-manipulation"
                    onClick={() => onSelectRelated(related)}
                  >
                    <img
                      src={related.photo.urls.small}
                      alt={related.poseName}
                      className="w-full aspect-square object-cover"
                    />
                    <p className="text-cream-400 text-[10px] font-body px-1 py-1 text-center truncate bg-charcoal-50">
                      {related.poseName}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom safe-area padding for mobile */}
          <div className="h-safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  )
}
