import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import './Admin.css'

const ROLES = {
  1: { label: 'Estudiante', clase: 'admin-pill-verde' },
  2: { label: 'Docente', clase: 'admin-pill-amarillo' },
  3: { label: 'Administrativo', clase: 'admin-pill-amarillo' },
  4: { label: 'Casino', clase: 'admin-pill-rojo' },
}

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])

  const fetchUsuarios = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*, rol ( nombre )')
      .order('id_usuario', { ascending: true })
    if (data) setUsuarios(data)
  }

    useEffect(() => {
    const init = async () => {
        await fetchUsuarios()
    }
    init()
    }, [])
    
  const handleCambiarRol = async (id_usuario, nuevo_rol) => {
    await supabase
      .from('usuarios')
      .update({ id_rol: parseInt(nuevo_rol) })
      .eq('id_usuario', id_usuario)
    fetchUsuarios()
  }

  const handleEliminar = async (id_usuario) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    await supabase.from('usuarios').delete().eq('id_usuario', id_usuario)
    fetchUsuarios()
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Gestión de usuarios</h1>
        </header>
        <main className="admin-content">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Usuarios registrados</div>
              <div className="admin-panel-sub">{usuarios.length} usuarios</div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Último acceso</th>
                  <th>Rol</th>
                  <th>Cambiar rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td className="admin-td">{u.email}</td>
                    <td className="admin-td-normal">
                      {u.ultimo_acceso
                        ? new Date(u.ultimo_acceso).toLocaleDateString('es-CL')
                        : '—'}
                    </td>
                    <td className="admin-td-normal">
                      <span className={`admin-pill ${ROLES[u.id_rol]?.clase ?? ''}`}>
                        {ROLES[u.id_rol]?.label ?? 'Desconocido'}
                      </span>
                    </td>
                    <td className="admin-td-normal">
                      <select
                        className="admin-form-input"
                        value={u.id_rol}
                        onChange={(e) => handleCambiarRol(u.id_usuario, e.target.value)}
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        <option value={1}>Estudiante</option>
                        <option value={2}>Docente</option>
                        <option value={3}>Administrativo</option>
                        <option value={4}>Casino</option>
                      </select>
                    </td>
                    <td className="admin-td-normal">
                      <button
                        className="admin-btn-eliminar"
                        onClick={() => handleEliminar(u.id_usuario)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminUsuarios