import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, MessageSquare, User, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'

const NAV = [
  { to: '/dashboard', icon: Heart, label: 'Favorites' },
  { to: '/dashboard/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function CustomerLayout() {
  const navigate = useNavigate()
  const reset = useAuthStore((s) => s.reset)

  const handleSignOut = async () => {
    try { await supabase.auth.signOut() } catch (_) { /* ignore network errors */ }
    reset()
    navigate('/')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden sm:block w-48 shrink-0">
          <nav className="space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            <button onClick={handleSignOut} className="sidebar-link w-full text-left text-red-400 hover:text-red-600">
              <LogOut size={16} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile tabs */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 z-20">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-body ${isActive ? 'text-brand' : 'text-ink-300'}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
