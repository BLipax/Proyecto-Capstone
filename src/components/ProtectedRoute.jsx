import { useAuth } from '../context/useAuth'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, soloAdmin = false }) => {
  const { user, rol, cargando } = useAuth()

  if (cargando) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f7fb',
      fontFamily: 'system-ui, sans-serif',
      color: '#6b7280',
      fontSize: '0.95rem'
    }}>
      Cargando...
    </div>
  )

  if (!user) return <Navigate to="/" replace />
  if (soloAdmin && rol !== 4) return <Navigate to="/home" replace />

  return children
}

export default ProtectedRoute