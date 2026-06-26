import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [notificacion, setNotificacion] = useState(null)
  const [idUsuario, setIdUsuario] = useState(null)

  // Obtener id_usuario cuando hay user
  useEffect(() => {
    if (!user) return
    const fetchIdUsuario = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .single()
      if (data) setIdUsuario(data.id_usuario)
    }
    fetchIdUsuario()
  }, [user])

  // Suscripción en tiempo real
  useEffect(() => {
    if (!idUsuario) return

    const channel = supabase
      .channel('navbar-reservas')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'reservas',
        filter: `id_usuario=eq.${idUsuario}`
      }, (payload) => {
        if (payload.new?.estado === 'lista') {
          const hora = payload.new?.hora_retiro?.slice(0, 5)
          setNotificacion(`🍽️ ¡Tu pedido está listo! Retira a las ${hora}`)
          // Auto-ocultar después de 8 segundos
          setTimeout(() => setNotificacion(null), 8000)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [idUsuario])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      {/* Toast de notificación */}
      {notificacion && (
        <div className="navbar-toast" onClick={() => setNotificacion(null)}>
          {notificacion}
          <span className="navbar-toast-close">✕</span>
        </div>
      )}

      <nav className="navbar">
        <span className="navbar-logo">Casino Duoc UC</span>
        <div className="navbar-links">
          <Link to="/home" className={location.pathname === '/home' ? 'nav-link active' : 'nav-link'}>Inicio</Link>
          <Link to="/menu" className={location.pathname === '/menu' ? 'nav-link active' : 'nav-link'}>Menú</Link>
          <Link to="/reservas" className={location.pathname === '/reservas' ? 'nav-link active' : 'nav-link'}>Reservas</Link>
          <Link to="/resenas" className={location.pathname === '/resenas' ? 'nav-link active' : 'nav-link'}>Ver todas las Reseñas</Link>
        </div>
        <div className="navbar-user">
          {user ? (
            <div className="nav-user-wrapper">
              <button className="nav-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
                {user.email.split('@')[0]} ▾
              </button>
              {menuAbierto && (
                <div className="nav-dropdown">
                  <span className="nav-dropdown-email">{user.email}</span>
                  <hr className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item" onClick={() => { navigate('/perfil'); setMenuAbierto(false) }}>
                    Mi perfil
                  </button>
                  {user && user.email?.endsWith('@duocuc.cl') && (
                    <button className="nav-dropdown-item" onClick={() => { navigate('/mis-reservas'); setMenuAbierto(false) }}>
                      📋 Mis reservas
                    </button>
                  )}
                  {user && !user.email?.endsWith('@duocuc.cl') && (
                    <button className="nav-dropdown-item" onClick={() => { navigate('/admin'); setMenuAbierto(false) }}>
                      ⚙️ Panel admin
                    </button>
                  )}
                  <hr className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item danger" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-btn">Iniciar sesión</Link>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar