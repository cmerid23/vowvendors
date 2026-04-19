import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, Menu, X, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../ui/Button'

export function Navbar() {
  const navigate = useNavigate()
  const { user, profile, reset } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = () => {
    reset()
    navigate('/')
    setMenuOpen(false)
    supabase.auth.signOut().catch(() => {})
  }

  const dashLink = profile?.role === 'vendor' ? '/vendor/overview' : '/dashboard'

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-ink">Vow<span className="text-brand">Vendors</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <Link to="/search" className="btn-ghost text-sm">Find Vendors</Link>
          <Link to="/about" className="btn-ghost text-sm">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost text-sm flex items-center gap-1.5">
                <Heart size={14} /> Favorites
              </Link>
              <Link to={dashLink} className="btn-ghost text-sm">Dashboard</Link>
              <button onClick={handleSignOut} className="btn-ghost text-sm flex items-center gap-1.5">
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/join"><Button variant="gold" size="sm">Join as Vendor</Button></Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-ink-400 hover:text-ink p-2"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-border px-4 py-3 space-y-1 animate-slide-up">
          <Link to="/search" onClick={() => setMenuOpen(false)} className="sidebar-link">
            <Search size={16} /> Find Vendors
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="sidebar-link">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="sidebar-link">
                <Heart size={16} /> Favorites
              </Link>
              <Link to={dashLink} onClick={() => setMenuOpen(false)} className="sidebar-link">Dashboard</Link>
              <button onClick={handleSignOut} className="sidebar-link w-full text-left">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full justify-center">Sign In</Button>
              </Link>
              <Link to="/join" onClick={() => setMenuOpen(false)} className="flex-1">
                <Button variant="gold" size="sm" className="w-full justify-center">Join as Vendor</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
