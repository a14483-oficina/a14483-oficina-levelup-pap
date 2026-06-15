import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/useAuthContext'
import Spinner from '../ui/Spinner/Spinner'

/**
 * Redirects unauthenticated users to /login, preserving where they came from.
 * Shows a full-screen spinner while session is being restored.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) return <Spinner fullScreen label="A carregar..." />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
