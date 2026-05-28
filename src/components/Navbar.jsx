import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="navbar">
      <span className="navbar-logo">Casino Duoc UC</span>
      <div className="navbar-links">
        <Link to="/home" className={location.pathname === '/home' ? 'nav-link active' : 'nav-link'}>Inicio</Link>
        <Link to="/menu" className={location.pathname === '/menu' ? 'nav-link active' : 'nav-link'}>Menú</Link>
        <Link to="/reservas" className={location.pathname === '/reservas' ? 'nav-link active' : 'nav-link'}>Reservas</Link>
        <Link to="/perfil" className="nav-btn">Mi cuenta</Link>
      </div>
    </nav>
  )
}

export default Navbar