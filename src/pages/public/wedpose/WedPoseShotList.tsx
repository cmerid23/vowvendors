import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { WedPoseFavorites } from '../../../features/wedpose/pages/WedPoseFavorites'

export function WedPoseShotList() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    document.title = 'My Shot List — WedPose'
  }, [])

  if (!user) {
    return (
      <div className="wedpose-embedded" style={{ background: 'transparent', padding: 0, minHeight: 'unset' }}>
        <div className="text-center py-16 animate-fade-in">
          <div className="text-5xl mb-4">♡</div>
          <h1 className="font-display text-3xl text-cream font-semibold mb-3">Your Shot List</h1>
          <p className="font-body text-cream-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
            Save poses while browsing and build a custom shot list for each wedding. Create a free account to keep them permanently.
          </p>

          {/* Static mockup preview */}
          <div className="max-w-sm mx-auto bg-charcoal-50 border border-gold/10 rounded-2xl p-5 mb-8 text-left opacity-60 pointer-events-none select-none">
            <p className="text-gold text-xs font-body font-semibold uppercase tracking-wider mb-3">Preview</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-charcoal-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-7 w-20 bg-charcoal-100 rounded-full animate-pulse" />
              <div className="h-7 w-28 bg-charcoal-100 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register?role=vendor"
              className="wp-btn-gold text-sm px-7 py-3 rounded-xl"
            >
              Create Free Account →
            </Link>
            <Link
              to="/login"
              className="font-body text-sm text-cream-400 hover:text-cream transition-colors border border-gold/20 px-7 py-3 rounded-xl"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wedpose-embedded" style={{ background: 'transparent', padding: 0, minHeight: 'unset' }}>
      <WedPoseFavorites />
    </div>
  )
}
