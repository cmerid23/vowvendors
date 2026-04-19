import { useEffect, useState } from 'react'
import type { PoseCard } from '../../types'
import { HeartButton } from '../ui/HeartButton'
import { useWedPoseStore } from '../../store/useWedPoseStore'
import { getSubcategoryById } from '../../data/categories'

interface PoseModalProps {
  pose: PoseCard | null
  relatedPoses: PoseCard[]
  onClose: () => void
  onSelectRelated: (pose: PoseCard) => void
}

export function PoseModal({ pose, relatedPoses, onClose, onSelectRelated }: PoseModalProps) {
  const addRecentlyViewed = useWedPoseStore((s) => s.addRecentlyViewed)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (pose) {
      addRecentlyViewed(pose)
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

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-zoom-out"
        onClick={() => setFullscreen(false)}
      >
        <img
          src={pose.photo.urls.full}
          alt={pose.poseName}
          className="max-h-screen max-w-full object-contain"
        />
        <button
          className="absolute top-4 right-4 text-white bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >✕</button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-charcoal-100 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={pose.photo.urls.regular}
            alt={pose.poseName}
            className="w-full max-h-72 sm:max-h-96 object-cover rounded-t-2xl sm:rounded-t-2xl cursor-zoom-in"
            onClick={() => setFullscreen(true)}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
          >✕</button>
          <div className="absolute bottom-3 right-3">
            <HeartButton pose={pose} />
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 text-cream text-xs px-2 py-1 rounded-full font-body">
            Tap image to fullscreen
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
              <span>🔗</span> Copy Link
            </button>
            <a
              href={pose.photo.links.html}
              target="_blank"
              rel="noopener noreferrer"
              className="wp-btn-outline flex-1 flex items-center justify-center gap-2 text-center"
            >
              <span>↗</span> View on Unsplash
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
                  <div
                    key={related.id}
                    className="rounded-lg overflow-hidden cursor-pointer hover:ring-1 hover:ring-gold transition-all"
                    onClick={() => onSelectRelated(related)}
                  >
                    <img
                      src={related.photo.urls.small}
                      alt={related.poseName}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
