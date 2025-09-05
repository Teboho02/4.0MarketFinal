import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    // Redirect to home if user is not admin
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute