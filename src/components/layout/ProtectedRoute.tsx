import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FullPageSpinner } from '../common/Spinner'

// Signed-out visitors are sent to the login page.
export function ProtectedRoute() {
  const { session, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  return session ? <Outlet /> : <Navigate to="/login" replace />
}

// Signed-in users do not need the login or register pages.
export function PublicOnlyRoute() {
  const { session, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  return session ? <Navigate to="/" replace /> : <Outlet />
}
