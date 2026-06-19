import './AdminSidebar.css'
import { useNavigate } from 'react-router-dom'

const AdminSidebar = () => {
  const navigate = useNavigate()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div className="admin-logo-icon">🍽️</div>
        <div>
          <div className="admin-logo-title">Casino Duoc UC</div>
          <div className="admin-logo-sub">Panel de gestión</div>
        </div>
      </div>
      <nav className="admin-nav">
        <div className="admin-nav-section">
          <div className="admin-nav-label">Principal</div>
          <div className="admin-nav-item" onClick={() => navigate('/admin')}>📊 Resumen</div>
          <div className="admin-nav-item">🍽️ Menú del día</div>
          <div className="admin-nav-item">📅 Reservas</div>
         <div className="admin-nav-item" onClick={() => navigate('/admin/usuarios')}>
      👥 Usuarios
    </div>
        </div>
        <div className="admin-nav-section">
          <div className="admin-nav-label">Gestión</div>
          <div className="admin-nav-item">➕ Agregar plato</div>
          <div className="admin-nav-item">✏️ Editar menú</div>
          <div className="admin-nav-item" onClick={() => navigate('/admin/reportes')}>📈 Reportes</div>
        </div>
        <div className="admin-nav-section">
          <div className="admin-nav-label">Sistema</div>
          <div className="admin-nav-item">⚙️ Configuración</div>
        </div>
      </nav>
      <div className="admin-sidebar-user">
        <div className="admin-user-avatar">AD</div>
        <div>
          <div className="admin-user-name">Administrador</div>
          <div className="admin-user-role">Super admin</div>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar