import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, User, Image, MessageSquare, Camera, Settings, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { useAuthListener } from '../../hooks/useAuth'

const NAV = [
  { to: '/vendor/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/vendor/profile', icon: User, label: 'My Profile' },
  { to: '/vendor/portfolio', icon: Image, label: 'Portfolio' },
  { to: '/vendor/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/vendor/wedpose', icon: Camera, label: 'WedPose' },
  { to: '/vendor/settings', icon: Settings, label: 'Settings' },
]

export function VendorLayout() {
  useAuthListener()
  const navigate = useNavigate()
  const reset = useAuthStore((s) => s.reset)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    reset()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface flex font-body">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-border shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border">
          <NavLink to="/" className="font-display text-xl font-semibold text-ink">
            Vow<span className="text-brand">Vendors</span>
          </NavLink>
          <p className="text-xs text-ink-300 font-body mt-0.5">Vendor Dashboard</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <button onClick={handleSignOut} className="sidebar-link w-full text-left text-red-400 hover:text-red-600 hover:bg-red-50">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom tabs */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 z-20">
          {NAV.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-body transition-colors ${isActive ? 'text-brand' : 'text-ink-300'}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
