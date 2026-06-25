import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const AdminAgregarPlato = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    disponible: 'S',
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [etiquetas, setEtiquetas] = useState([])
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([])

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('etiquetas').select('*').order('nombre')
      if (data) setEtiquetas(data)
    }
    init()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleEtiqueta = (nombre) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(nombre) ? prev.filter(e => e !== nombre) : [...prev, nombre]
    )
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.precio) {
      setMensaje({ tipo: 'error', texto: 'Nombre y precio son obligatorios.' })
      return
    }
    setLoading(true)
    setMensaje(null)
    let imageUrl = ''
    if (file) {
      const fileName = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('platos').upload(fileName, file)
      if (uploadError) {
        setMensaje({ tipo: 'error', texto: uploadError.message })
        setLoading(false)
        return
      }
      const { data } = supabase.storage.from('platos').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }
    const { error } = await supabase.from('platos').insert([{
      ...form,
      precio: parseFloat(form.precio),
      imagen_url: imageUrl,
      etiquetas: etiquetasSeleccionadas.join(','),
    }])
    setLoading(false)
    if (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } else {
      setMensaje({ tipo: 'success', texto: '¡Plato agregado correctamente!' })
      setForm({ nombre: '', descripcion: '', precio: '', categoria: '', disponible: 'S' })
      setFile(null)
      setEtiquetasSeleccionadas([])
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Agregar plato</h1>
        </header>

        <main className="admin-content">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div className="admin-panel-title">Nuevo plato al menú</div>
              <div className="admin-panel-sub">Los campos con * son obligatorios</div>
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-field-full">
                <label className="admin-form-label">Nombre del plato *</label>
                <input className="admin-form-input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Ensalada mediterránea" />
              </div>
              <div className="admin-form-field-full">
                <label className="admin-form-label">Descripción</label>
                <textarea className="admin-form-textarea" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción breve del plato..." />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Precio (CLP) *</label>
                <input className="admin-form-input" type="number" name="precio" value={form.precio} onChange={handleChange} placeholder="Ej: 4990" />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Categoría</label>
                <select className="admin-form-input" name="categoria" value={form.categoria} onChange={handleChange}>
                  <option value="">Seleccionar categoría...</option>
                  <option value="Plato de fondo">Plato de fondo</option>
                  <option value="Ensalada">Ensalada</option>
                  <option value="Sopa / Cazuela">Sopa / Cazuela</option>
                  <option value="Sandwich">Sandwich</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Postre">Postre</option>
                  <option value="Bebida">Bebida</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Disponibilidad</label>
                <select className="admin-form-input" name="disponible" value={form.disponible} onChange={handleChange}>
                  <option value="S">Disponible</option>
                  <option value="N">No disponible</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Imagen del plato</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="admin-form-input" style={{ padding: '6px 10px' }} />
              </div>
              <div className="admin-form-field-full">
                <label className="admin-form-label">Etiquetas</label>
                <div className="admin-etiquetas">
                  {etiquetas.map(({ nombre, icono }) => (
                    <button
                      key={nombre}
                      type="button"
                      onClick={() => handleEtiqueta(nombre)}
                      className={`admin-etiqueta-btn ${etiquetasSeleccionadas.includes(nombre) ? 'activa' : ''}`}
                    >
                      {icono} {nombre}
                    </button>
                  ))}
                </div>
              </div>
              {mensaje && (
                <div className={mensaje.tipo === 'success' ? 'admin-msg-success' : 'admin-msg-error'}>
                  {mensaje.texto}
                </div>
              )}
              <div className="admin-form-actions">
                <button className="admin-btn-secondary" type="button" onClick={() => navigate('/admin')}>
                  Cancelar
                </button>
                <button className="admin-btn-primary" disabled={loading} onClick={handleSubmit}>
                  {loading ? 'Guardando...' : '➕ Agregar plato'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminAgregarPlato