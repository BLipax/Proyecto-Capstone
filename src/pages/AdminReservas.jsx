import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import './Admin.css'

const AdminReservas = () => {
  const [reservas, setReservas] = useState([])
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')

  const fetchReservas = async () => {
    let query = supabase
      .from('reservas')
      .select(`
        id_reserva,
        fecha_reserva,
        hora_retiro,
        estado,
        usuarios ( email ),
        reserva_platos ( cantidad, platos ( nombre ) )
      `)
      .order('fecha_reserva', { ascending: false })
      .order('id_reserva', { ascending: false })

    if (filtroFecha) query = query.eq('fecha_reserva', filtroFecha)
    if (filtroEstado) query = query.eq('estado', filtroEstado)

    const { data } = await query
    if (!data) return

    let resultado = data
    if (filtroUsuario) {
      resultado = data.filter(r =>
        r.usuarios?.email?.toLowerCase().includes(filtroUsuario.toLowerCase())
      )
    }
    setReservas(resultado)
  }

  useEffect(() => {
    const init = async () => await fetchReservas()
    init()
  }, [filtroFecha, filtroEstado, filtroUsuario])

  const handleCambiarEstado = async (id_reserva, estadoActual) => {
    const siguiente = {
      'pendiente': 'lista',
      'lista': 'entregada',
      'entregada': 'entregada',
      'cancelada': 'cancelada',
    }
    const nuevoEstado = siguiente[estadoActual] ?? estadoActual
    await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id_reserva', id_reserva)
    fetchReservas()
  }

  const getEstadoClass = (estado) => {
    if (estado === 'pendiente') return 'admin-pill admin-pill-amarillo'
    if (estado === 'lista') return 'admin-pill admin-pill-verde'
    if (estado === 'entregada') return 'admin-pill admin-pill-gris' 
    if (estado === 'cancelada') return 'admin-pill admin-pill-rojo'
    return 'admin-pill'
  }

  const getBtnLabel = (estado) => {
    if (estado === 'pendiente') return '→ Lista'
    if (estado === 'lista') return '→ Entregada'
    return null
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Reservas</h1>
        </header>

        <main className="admin-content">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Filtros</div>
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">Fecha</label>
                <input
                  className="admin-form-input"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Estado</label>
                <select
                  className="admin-form-input"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="lista">Lista</option>
                  <option value="entregada">Entregada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Usuario</label>
                <input
                  className="admin-form-input"
                  type="text"
                  placeholder="Buscar por email..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                />
              </div>
              <div className="admin-form-field" style={{ justifyContent: 'flex-end' }}>
                <label className="admin-form-label">&nbsp;</label>
                <button
                  className="admin-btn-secondary"
                  onClick={() => { setFiltroFecha(''); setFiltroEstado(''); setFiltroUsuario('') }}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Todas las reservas</div>
              <div className="admin-panel-sub">{reservas.length} reservas</div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Plato</th>
                  <th>Fecha</th>
                  <th>Hora retiro</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td className="admin-td">{r.usuarios?.email?.split('@')[0] ?? '—'}</td>
                    <td className="admin-td-normal">{r.reserva_platos?.[0]?.platos?.nombre ?? '—'}</td>
                    <td className="admin-td-normal">
                      {new Date(r.fecha_reserva).toLocaleDateString('es-CL')}
                    </td>
                    <td className="admin-td-normal">{r.hora_retiro}</td>
                    <td className="admin-td-normal">{r.reserva_platos?.[0]?.cantidad ?? '—'}</td>
                    <td className="admin-td-normal">
                      <span className={getEstadoClass(r.estado)}>{r.estado}</span>
                    </td>
                    <td className="admin-td-normal">
                      {getBtnLabel(r.estado) && (
                        <button
                          className="admin-btn-toggle"
                          onClick={() => handleCambiarEstado(r.id_reserva, r.estado)}
                        >
                          {getBtnLabel(r.estado)}
                        </button>
                      )}
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

export default AdminReservas