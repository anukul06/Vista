import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vista-night">
        <span className="font-pixel text-xs text-vista-gold">Loading VISTA...</span>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />

  return children
}
