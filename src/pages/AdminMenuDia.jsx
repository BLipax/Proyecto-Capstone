import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const AdminMenuDia = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])
  const [menuDia, setMenuDia] = useState([])
  const [fechaMenu, setFechaMenu] = useState(new Date().toISOString().split('T')[0])

  const fetchPlatos = async () => {
    const { data } = await supabase.from('platos').select('*').eq('disponible', 'S').order('nombre')
    if (data) setPlatos(data)
  }

  const fetchMenuDia = async () => {
    const { data } = await supabase
      .from('menu_dia')
      .select('*, platos ( nombre, imagen_url, precio )')
      .eq('fecha', fechaMenu)
      .order('orden')
    if (data) setMenuDia(data)
  }

  useEffect(() => {
    const init = async () => await fetchPlatos()
    init()
  }, [])

  useEffect(() => {
    const init = async () => await fetchMenuDia()
    init()
  }, [fechaMenu])

  const handleAgregarAlMenu = async (id_plato) => {
    const yaEsta = menuDia.some(m => m.id_plato === id_plato)
    if (yaEsta) return
    await supabase.from('menu_dia').insert([{
      id_plato,
      fecha: fechaMenu,
      orden: menuDia.length + 1,
    }])
    fetchMenuDia()
  }

  const handleQuitarDelMenu = async (id) => {
    await supabase.from('menu_dia').delete().eq('id', id)
    fetchMenuDia()
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Menú del día</h1>
        </header>

        <main className="admin-content">

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Seleccionar fecha</div>
            </div>
            <input
              type="date"
              className="admin-form-input"
              value={fechaMenu}
              onChange={(e) => setFechaMenu(e.target.value)}
              style={{ maxWidth: 200 }}
            />
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">
                Platos en el menú — {new Date(fechaMenu + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="admin-panel-sub">{menuDia.length} platos</div>
            </div>

            {menuDia.length === 0 ? (
              <p className="admin-panel-sub">No hay platos para esta fecha.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {menuDia.map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    {m.platos?.imagen_url && (
                      <img src={m.platos.imagen_url} alt={m.platos.nombre} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.platos?.nombre}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>${m.platos?.precio?.toLocaleString('es-CL')}</span>
                    <button className="admin-btn-eliminar" onClick={() => handleQuitarDelMenu(m.id)}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Agregar plato al menú</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {platos
                .filter(p => !menuDia.some(m => m.id_plato === p.id_plato))
                .map(p => (
                  <div key={p.id_plato} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    {p.imagen_url && (
                      <img src={p.imagen_url} alt={p.nombre} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{p.nombre}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>${p.precio?.toLocaleString('es-CL')}</span>
                    <button className="admin-btn-toggle" onClick={() => handleAgregarAlMenu(p.id_plato)}>
                      + Agregar
                    </button>
                  </div>
                ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default AdminMenuDia