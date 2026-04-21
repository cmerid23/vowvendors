import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export function AuthGuard() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="skeleton w-8 h-8 rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function VendorGuard() {
  const { user, profile, isLoading } = useAuthStore()
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="skeleton w-8 h-8 rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  // Only redirect if we know they're a customer (profile loaded and role is customer)
  if (profile && profile.role === 'customer') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
