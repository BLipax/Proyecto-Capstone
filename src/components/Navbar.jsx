import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/home')
  }

  return (
    <nav className="navbar">
      <span className="navbar-logo">Casino Duoc UC</span>
      <div className="navbar-links">
        <Link to="/home" className={location.pathname === '/home' ? 'nav-link active' : 'nav-link'}>Inicio</Link>
        <Link to="/menu" className={location.pathname === '/menu' ? 'nav-link active' : 'nav-link'}>Menú</Link>
        <Link to="/reservas" className={location.pathname === '/reservas' ? 'nav-link active' : 'nav-link'}>Reservas</Link>
        <Link to="/resenas" className={location.pathname === '/resenas' ? 'nav-link active' : 'nav-link'}>Reseñas</Link>
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
  )
}

export default Navbar