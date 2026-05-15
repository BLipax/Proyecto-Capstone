import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

const Admin = () => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    imagen_url: '',
    disponible: 'S',
  })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.precio) {
      setMensaje({ tipo: 'error', texto: 'Nombre y precio son obligatorios.' })
      return
    }
    setLoading(true)
    const { error } = await supabase.from('platos').insert([{
      ...form,
      precio: parseFloat(form.precio),
    }])
    setLoading(false)
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message })
    } else {
      setMensaje({ tipo: 'exito', texto: '¡Plato agregado correctamente!' })
      setForm({ nombre: '', descripcion: '', precio: '', categoria: '', imagen_url: '', disponible: 'S' })
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Panel Admin</h1>
        <h2 style={styles.subtitle}>Agregar nuevo plato</h2>

        <div style={styles.field}>
          <label style={styles.label}>Nombre *</label>
          <input style={styles.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Ensalada mediterránea" />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Descripción</label>
          <textarea style={styles.textarea} name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción breve del plato" />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Precio *</label>
            <input style={styles.input} name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="Ej: 4990" />
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Categoría</label>
            <input style={styles.input} name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ej: Ensaladas" />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>URL de imagen</label>
          <input style={styles.input} name="imagen_url" value={form.imagen_url} onChange={handleChange} placeholder="https://..." />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Disponible</label>
          <select style={styles.input} name="disponible" value={form.disponible} onChange={handleChange}>
            <option value="S">Sí</option>
            <option value="N">No</option>
          </select>
        </div>

        {mensaje && (
          <p style={mensaje.tipo === 'exito' ? styles.exito : styles.error}>
            {mensaje.texto}
          </p>
        )}

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Agregar plato'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '48px 24px',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '36px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
  },
  title: {
    fontSize: '1.8rem',
    margin: '0 0 4px',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#6b7280',
    margin: '0 0 28px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 14px',
    fontSize: '0.95rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  textarea: {
    padding: '10px 14px',
    fontSize: '0.95rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'system-ui, sans-serif',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  exito: {
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '0.9rem',
    marginBottom: '12px',
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '0.9rem',
    marginBottom: '12px',
  },
}
export default Admin