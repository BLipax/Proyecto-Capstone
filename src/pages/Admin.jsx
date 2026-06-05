import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function Admin() {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.precio) {
      setMensaje({
        tipo: 'error',
        texto: 'Nombre y precio son obligatorios.',
      })
      return
    }

    setLoading(true)
    setMensaje(null)

    let imageUrl = ''

    if (file) {
      const fileName = `${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('platos')
        .upload(fileName, file)

      if (uploadError) {
        setMensaje({
          tipo: 'error',
          texto: uploadError.message,
        })
        setLoading(false)
        return
      }

      const { data } = supabase.storage
        .from('platos')
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('platos').insert([
      {
        ...form,
        precio: parseFloat(form.precio),
        imagen_url: imageUrl,
      },
    ])

    setLoading(false)

    if (error) {
      setMensaje({
        tipo: 'error',
        texto: error.message,
      })
    } else {
      setMensaje({
        tipo: 'success',
        texto: '¡Plato agregado correctamente!',
      })

      setForm({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        disponible: 'S',
      })

      setFile(null)
    }
  }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🍽️</div>

          <div>
            <div style={styles.logoTitle}>Restaurant Admin</div>
            <div style={styles.logoSub}>v1.0</div>
          </div>
        </div>

        <nav>
          <div style={styles.navItemActive}>Dashboard</div>
          <div style={styles.navItem}>Platos</div>
          <div style={styles.navItem}>Categorías</div>
          <div style={styles.navItem}>Pedidos</div>
          <div style={styles.navItem}>Clientes</div>
        </nav>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        <header style={styles.topbar}>
          <h1 style={{ margin: 0 }}>Agregar Plato</h1>
        </header>

        <main style={styles.content}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>124</div>
              <div style={styles.statLabel}>Platos</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>15</div>
              <div style={styles.statLabel}>Categorías</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>93</div>
              <div style={styles.statLabel}>Disponibles</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>31</div>
              <div style={styles.statLabel}>Ocultos</div>
            </div>
          </div>

          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Nuevo Plato</h2>

            <div style={styles.field}>
              <label>Nombre *</label>

              <input
                style={styles.input}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label>Descripción</label>

              <textarea
                style={styles.textarea}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label>Precio *</label>

                <input
                  style={styles.input}
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label>Categoría</label>

                <input
                  style={styles.input}
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label>Imagen</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div style={styles.field}>
              <label>Disponible</label>

              <select
                style={styles.input}
                name="disponible"
                value={form.disponible}
                onChange={handleChange}
              >
                <option value="S">Sí</option>
                <option value="N">No</option>
              </select>
            </div>

            {mensaje && (
              <div
                style={
                  mensaje.tipo === 'success'
                    ? styles.success
                    : styles.error
                }
              >
                {mensaje.texto}
              </div>
            )}

            <button
              style={styles.button}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Guardando...' : 'Agregar Plato'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#1a1d23',
    color: '#e2e8f0',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  sidebar: {
    width: 220,
    background: '#1e2128',
    borderRight: '0.5px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
  },

  main: {
    flex: 1,
    background: '#1a1d23',
  },

  topbar: {
    height: 52,
    background: '#1e2128',
    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
  },

  content: {
    padding: 20,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    background: '#1e2128',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 16,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 600,
    color: '#e2e8f0',
  },

  statLabel: {
    color: '#475569',
    fontSize: 12,
  },

  panel: {
    background: '#1e2128',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 24,
  },

  panelTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 20,
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 16,
  },

  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#e2e8f0',
    outline: 'none',
    fontSize: 13,
  },

  textarea: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#e2e8f0',
    minHeight: 100,
    resize: 'vertical',
    outline: 'none',
    fontSize: 13,
  },

  button: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 16px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  navItem: {
    color: '#94a3b8',
    padding: '8px 10px',
    margin: '2px 10px',
    borderRadius: 7,
  },

  navItemActive: {
    color: '#60a5fa',
    background: 'rgba(59,130,246,0.15)',
    padding: '8px 10px',
    margin: '2px 10px',
    borderRadius: 7,
  },

  success: {
    background: 'rgba(34,197,94,0.12)',
    color: '#4ade80',
    border: '1px solid rgba(34,197,94,0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  error: {
    background: 'rgba(239,68,68,0.10)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
}