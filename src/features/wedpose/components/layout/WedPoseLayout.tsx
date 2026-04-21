import { useState } from 'react'
import { Link, useNavigate, Outlet } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, X } from 'lucide-react'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useWedPoseStore } from '../../store/useWedPoseStore'
import { supabase } from '../../../../lib/supabase'
import { WedPoseSavePrompt } from '../WedPoseSavePrompt'

export function WedPoseLayout() {
  const navigate = useNavigate()
  const { user, profile, reset } = useAuthStore()
  const favorites = useWedPoseStore((s) => s.favorites)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const isNewVendor = !bannerDismissed && sessionStorage.getItem('vv-wedpose-new-vendor') === '1'

  const handleSignOut = () => {
    reset()
    navigate('/wedpose')
    setMenuOpen(false)
    supabase.auth.signOut().catch(() => {})
  }

  const handleDismissBanner = () => {
    sessionStorage.removeItem('vv-wedpose-new-vendor')
    setBannerDismissed(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Welcome banner — shown once after WedPose signup */}
      {isNewVendor && (
        <div className="bg-gold text-charcoal px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="font-body text-sm font-medium flex-1">
            Welcome! Your vendor profile on VowVendors is ready.{' '}
            <Link to="/vendor/profile" className="underline font-semibold">Add your portfolio →</Link>
          </p>
          <button onClick={handleDismissBanner} className="shrink-0 hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-charcoal-100/95 backdrop-blur border-b border-gold/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/wedpose" className="flex items-center gap-2 group">
            <span className="text-lg">📷</span>
            <span className="font-display text-lg text-cream font-semibold group-hover:text-gold transition-colors">
              WedPose
            </span>
            <span className="font-body text-cream-400 text-xs hidden sm:inline">by VowVendors</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/wedpose/shot-list"
                  className="flex items-center gap-1.5 text-cream-300 hover:text-gold transition-colors font-body text-sm"
                >
                  <Heart size={14} />
                  <span className="hidden sm:inline">My Shot List</span>
                  {favorites.length > 0 && (
                    <span className="bg-gold text-charcoal text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-body font-semibold hover:bg-gold/30 transition-colors"
                  >
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-10 bg-charcoal-50 border border-gold/20 rounded-xl shadow-2xl min-w-[160px] py-1 z-50">
                      <Link
                        to="/wedpose/shot-list"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-cream-300 hover:text-cream hover:bg-charcoal-100 transition-colors font-body text-sm"
                      >
                        <Heart size={14} /> My Shot List
                      </Link>
                      <Link
                        to="/vendor/overview"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-cream-300 hover:text-cream hover:bg-charcoal-100 transition-colors font-body text-sm"
                      >
                        <LayoutDashboard size={14} /> My VowVendors
                      </Link>
                      <hr className="border-gold/10 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-charcoal-100 transition-colors font-body text-sm w-full text-left"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/wedpose/shot-list"
                  className="flex items-center gap-1.5 text-cream-300 hover:text-gold transition-colors font-body text-sm"
                >
                  <Heart size={14} />
                  {favorites.length > 0 && (
                    <span className="bg-gold text-charcoal text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {favorites.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/login"
                  className="font-body text-sm text-cream-300 hover:text-cream transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register?role=vendor"
                  className="wp-btn-gold text-xs px-3 py-1.5"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Global save prompt (shown when guest tries to heart a pose) */}
      <WedPoseSavePrompt />
    </div>
  )
}
