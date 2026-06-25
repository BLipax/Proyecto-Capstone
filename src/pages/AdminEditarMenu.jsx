import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const AdminEditarMenu = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [editando, setEditando] = useState(null)
  const [etiquetasEdit, setEtiquetasEdit] = useState([])
  const [formEtiqueta, setFormEtiqueta] = useState({ nombre: '', icono: '', color_bg: '', color_text: '' })

  const fetchPlatos = async () => {
    const { data } = await supabase.from('platos').select('*').order('id_plato', { ascending: false })
    if (data) setPlatos(data)
  }

  const fetchEtiquetas = async () => {
    const { data } = await supabase.from('etiquetas').select('*').order('nombre')
    if (data) setEtiquetas(data)
  }

  useEffect(() => {
    const init = async () => {
      await fetchPlatos()
      await fetchEtiquetas()
    }
    init()
  }, [])

  const handleToggleDisponible = async (id_plato, estadoActual) => {
    await supabase
      .from('platos')
      .update({ disponible: estadoActual === 'S' ? 'N' : 'S' })
      .eq('id_plato', id_plato)
    fetchPlatos()
  }

  const handleEliminar = async (id_plato) => {
    if (!confirm('¿Estás seguro de eliminar este plato?')) return
    await supabase.from('reserva_platos').delete().eq('id_plato', id_plato)
    await supabase.from('platos').delete().eq('id_plato', id_plato)
    fetchPlatos()
  }

  const handleEtiquetaEdit = (etiqueta) => {
    setEtiquetasEdit(prev =>
      prev.includes(etiqueta) ? prev.filter(e => e !== etiqueta) : [...prev, etiqueta]
    )
  }

  const handleGuardarEtiquetas = async () => {
    await supabase
      .from('platos')
      .update({ etiquetas: etiquetasEdit.join(',') })
      .eq('id_plato', editando)
    setEditando(null)
    setEtiquetasEdit([])
    fetchPlatos()
  }

  const handleEtiquetaFormChange = (e) => {
    setFormEtiqueta({ ...formEtiqueta, [e.target.name]: e.target.value })
  }

  const handleAgregarEtiqueta = async () => {
    if (!formEtiqueta.nombre || !formEtiqueta.icono || !formEtiqueta.color_bg || !formEtiqueta.color_text) return
    await supabase.from('etiquetas').insert([formEtiqueta])
    setFormEtiqueta({ nombre: '', icono: '', color_bg: '', color_text: '' })
    fetchEtiquetas()
  }

  const handleEliminarEtiqueta = async (id_etiqueta) => {
    if (!confirm('¿Eliminar esta etiqueta?')) return
    await supabase.from('etiquetas').delete().eq('id_etiqueta', id_etiqueta)
    fetchEtiquetas()
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Editar menú</h1>
        </header>

        <main className="admin-content">

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Gestión de platos</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="admin-panel-sub">{platos.length} platos registrados</div>
                <button className="admin-btn-primary" style={{ padding: '5px 14px', fontSize: 11 }} onClick={() => navigate('/admin/agregar-plato')}>
                  ➕ Agregar plato
                </button>
              </div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {platos.map((plato) => (
                  <tr key={plato.id_plato}>
                    <td className="admin-td">{plato.nombre}</td>
                    <td className="admin-td-normal">{plato.categoria || '—'}</td>
                    <td className="admin-td-normal">${plato.precio?.toLocaleString('es-CL')}</td>
                    <td className="admin-td-normal">
                      <span className={`admin-pill ${plato.disponible === 'S' ? 'admin-pill-verde' : 'admin-pill-rojo'}`}>
                        {plato.disponible === 'S' ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="admin-td-normal">
                      <div className="admin-btn-actions">
                        <button className="admin-btn-toggle" onClick={() => handleToggleDisponible(plato.id_plato, plato.disponible)}>
                          {plato.disponible === 'S' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="admin-btn-toggle"
                          onClick={() => {
                            setEditando(plato.id_plato)
                            setEtiquetasEdit(plato.etiquetas ? plato.etiquetas.split(',').map(e => e.trim()) : [])
                          }}
                        >
                          Etiquetas
                        </button>
                        <button className="admin-btn-eliminar" onClick={() => handleEliminar(plato.id_plato)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editando && (
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div className="admin-panel-title">
                  Editar etiquetas — {platos.find(p => p.id_plato === editando)?.nombre}
                </div>
                <button className="admin-btn-secondary" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
              </div>
              <div className="admin-etiquetas" style={{ marginBottom: 16 }}>
                {etiquetas.map(({ nombre, icono }) => (
                  <button
                    key={nombre}
                    type="button"
                    onClick={() => handleEtiquetaEdit(nombre)}
                    className={`admin-etiqueta-btn ${etiquetasEdit.includes(nombre) ? 'activa' : ''}`}
                  >
                    {icono} {nombre}
                  </button>
                ))}
              </div>
              <button className="admin-btn-primary" onClick={handleGuardarEtiquetas}>
                Guardar etiquetas
              </button>
            </div>
          )}

          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Gestión de etiquetas</div>
              <div className="admin-panel-sub">{etiquetas.length} etiquetas</div>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icono</th>
                  <th>Nombre</th>
                  <th>Vista previa</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {etiquetas.map((e) => (
                  <tr key={e.id_etiqueta}>
                    <td className="admin-td">{e.icono}</td>
                    <td className="admin-td">{e.nombre}</td>
                    <td className="admin-td-normal">
                      <span style={{ background: e.color_bg, color: e.color_text, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
                        {e.icono} {e.nombre}
                      </span>
                    </td>
                    <td className="admin-td-normal">
                      <button className="admin-btn-eliminar" onClick={() => handleEliminarEtiqueta(e.id_etiqueta)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16 }}>
              <div className="admin-panel-title" style={{ marginBottom: 10 }}>Agregar etiqueta</div>
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label className="admin-form-label">Nombre</label>
                  <input className="admin-form-input" name="nombre" value={formEtiqueta.nombre} onChange={handleEtiquetaFormChange} placeholder="Ej: sin azúcar" />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Icono (emoji)</label>
                  <input className="admin-form-input" name="icono" value={formEtiqueta.icono} onChange={handleEtiquetaFormChange} placeholder="Ej: 🍬" />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Color fondo (hex)</label>
                  <input className="admin-form-input" name="color_bg" value={formEtiqueta.color_bg} onChange={handleEtiquetaFormChange} placeholder="Ej: #EAF3DE" />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Color texto (hex)</label>
                  <input className="admin-form-input" name="color_text" value={formEtiqueta.color_text} onChange={handleEtiquetaFormChange} placeholder="Ej: #27500A" />
                </div>
                <div className="admin-form-actions">
                  <button className="admin-btn-primary" onClick={handleAgregarEtiqueta}>
                    Agregar etiqueta
                  </button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default AdminEditarMenu