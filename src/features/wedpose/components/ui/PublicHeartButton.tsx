import { useWedPoseStore } from '../../store/useWedPoseStore'
import { useAuthStore } from '../../../../store/useAuthStore'
import type { PoseCard } from '../../types'

interface PublicHeartButtonProps {
  pose: PoseCard
  className?: string
}

export function PublicHeartButton({ pose, className = '' }: PublicHeartButtonProps) {
  const user = useAuthStore((s) => s.user)
  const isFavorite = useWedPoseStore((s) => s.isFavorite)
  const addFavorite = useWedPoseStore((s) => s.addFavorite)
  const removeFavorite = useWedPoseStore((s) => s.removeFavorite)
  const setPendingFavoritePose = useWedPoseStore((s) => s.setPendingFavoritePose)

  const saved = isFavorite(pose.id)

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (saved) {
      removeFavorite(pose.id)
    } else {
      addFavorite(pose)
      // Guest: also trigger save prompt (pose is already saved locally)
      if (!user) setPendingFavoritePose(pose)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove from shot list' : 'Save to shot list'}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
        ${saved ? 'bg-gold text-charcoal' : 'bg-black/50 text-white hover:bg-gold/80 hover:text-charcoal'}
        ${className}`}
    >
      <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
