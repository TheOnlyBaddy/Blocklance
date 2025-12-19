import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, redirectTo = '/login' }){
  const { token, loading, user } = useAuth()
  const location = useLocation()
  if (loading) return null
  // Fallback to localStorage token to handle immediate navigation after login
  let hasToken = !!token
  try {
    if (!hasToken) {
      const stored = window.localStorage.getItem('token')
      hasToken = !!stored
    }
  } catch {}
  if (!hasToken) return <Navigate to={redirectTo} replace />

  const path = location.pathname || ''
  if (user?.role === 'client' && path.includes('freelancer')) return <Navigate to="/dashboard/client" replace />
  if (user?.role === 'freelancer' && path.includes('client')) return <Navigate to="/dashboard/freelancer" replace />
  return children
}
