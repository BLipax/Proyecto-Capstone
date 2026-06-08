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

  // Mock data for charts and tables
  const stats = [
    { label: 'Platos en menú', valor: 124, icon: '🍽️' },
    { label: 'Reservas hoy', valor: 53, icon: '📅' },
    { label: 'Pendientes', valor: 7, icon: '⏰' },
    { label: 'No disponibles', valor: 3, icon: '🚫' },
  ]

  const reservations = [
    { estudiante: 'M. González', plato: 'Cazuela', hora: '12:30', estado: 'Lista' },
    { estudiante: 'F. Rojas', plato: 'Pasta primavera', hora: '13:00', estado: 'Pendiente' },
    { estudiante: 'C. Vargas', plato: 'Ensalada', hora: '12:00', estado: 'Lista' },
    { estudiante: 'A. Muñoz', plato: 'Pollo al ajillo', hora: '13:30', estado: 'Cancelada' },
    { estudiante: 'P. Torres', plato: 'Cazuela', hora: '12:30', estado: 'Pendiente' },
  ]

  const topDishes = [
    { nombre: 'Cazuela de vacuno', porcentaje: 38, color: '#2563eb' },
    { nombre: 'Ensalada mediterránea', porcentaje: 24, color: '#7c3aed' },
    { nombre: 'Pasta primavera', porcentaje: 19, color: '#0891b2' },
    { nombre: 'Pollo al ajillo', porcentaje: 12, color: '#059669' },
    { nombre: 'Otros', porcentaje: 7, color: '#9ca3af' },
  ]

  const activities = [
    { tipo: 'success', titulo: 'Plato agregado:', texto: 'Cazuela de mariscos al menú', tiempo: 'Hace 5 minutos' },
    { tipo: 'warning', titulo: 'Reserva pendiente', texto: 'F. Rojas, almuerzo 13:00', tiempo: 'Hace 18 minutos' },
    { tipo: 'error', titulo: 'Plato sin stock:', texto: 'Lasaña boloñesa desactivada', tiempo: 'Hace 42 minutos' },
    { tipo: 'info', titulo: 'Menú actualizado', texto: 'para mañana miércoles', tiempo: 'Hace 1 hora' },
  ]

  const chartData = [41, 53, 38, 62, 47, 55, 53]
  const maxChartValue = Math.max(...chartData)
  const days = ['L', 'M', 'X', 'J', 'V', 'L', 'M']

  const getEstadoColor = (estado) => {
    const colors = {
      'Lista': '#dcfce7',
      'Pendiente': '#fef9c3',
      'Cancelada': '#fee2e2',
    }
    return colors[estado] || '#e5e7eb'
  }

  const getEstadoTextColor = (estado) => {
    const colors = {
      'Lista': '#166534',
      'Pendiente': '#854d0e',
      'Cancelada': '#991b1b',
    }
    return colors[estado] || '#374151'
  }

  const getActivityColor = (tipo) => {
    const colors = {
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      info: '#2563eb',
    }
    return colors[tipo] || '#6b7280'
  }

  return (
    <div style={s.layout}>
      {/* ════ Sidebar ════ */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>🍽️</div>
          <div>
            <div style={s.logoTitle}>CaféUC Admin</div>
            <div style={s.logoSub}>Panel de gestión</div>
          </div>
        </div>

        <nav style={s.nav}>
          <div style={s.navSection}>
            <div style={s.navLabel}>Principal</div>
            <div style={s.navItemActive}>📊 Resumen</div>
            <div style={s.navItem}>🍽️ Menú del día</div>
            <div style={s.navItem}>📅 Reservas</div>
            <div style={s.navItem}>👥 Usuarios</div>
          </div>
          <div style={s.navSection}>
            <div style={s.navLabel}>Gestión</div>
            <div style={s.navItem}>➕ Agregar plato</div>
            <div style={s.navItem}>✏️ Editar menú</div>
            <div style={s.navItem}>📈 Reportes</div>
          </div>
          <div style={s.navSection}>
            <div style={s.navLabel}>Sistema</div>
            <div style={s.navItem}>⚙️ Configuración</div>
          </div>
        </nav>

        <div style={s.sidebarUser}>
          <div style={s.userAvatar}>AD</div>
          <div>
            <div style={s.userName}>Administrador</div>
            <div style={s.userRole}>Super admin</div>
          </div>
        </div>
      </aside>

      {/* ════ Main ════ */}
      <div style={s.main}>
        <header style={s.topbar}>
          <h1 style={s.topbarTitle}>Resumen general</h1>
          <input type="text" placeholder="Buscar plato, usuario..." style={s.searchInput} />
        </header>

        <main style={s.content}>
          {/* Stats Grid */}
          <div style={s.statsGrid}>
            {stats.map((stat, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}>
                  <div>
                    <div style={s.statValue}>{stat.valor}</div>
                    <div style={s.statLabel}>{stat.label}</div>
                  </div>
                  <div style={s.statIcon}>{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Top Dishes */}
          <div style={s.row2}>
            {/* Chart */}
            <div style={s.panel}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>Reservas por día (últimas 2 semanas)</div>
              </div>
              <div style={s.chartBars}>
                {chartData.map((val, i) => (
                  <div key={i} style={s.barGroup}>
                    <div
                      style={{
                        ...s.bar,
                        height: `${(val / maxChartValue) * 120}px`,
                      }}
                      title={`${days[i]}: ${val} reservas`}
                    />
                  </div>
                ))}
              </div>
              <div style={s.chartLabels}>
                {days.map((d, i) => (
                  <div key={i} style={s.chartLabel}>{d}</div>
                ))}
              </div>
            </div>

            {/* Top Dishes */}
            <div style={s.panel}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>Platos más solicitados</div>
              </div>
              <div style={s.progressList}>
                {topDishes.map((dish, i) => (
                  <div key={i}>
                    <div style={s.progressHead}>
                      <span style={s.progressName}>{dish.nombre}</span>
                      <span style={s.progressPct}>{dish.porcentaje}%</span>
                    </div>
                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${dish.porcentaje}%`, backgroundColor: dish.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reservations Table + Activity */}
          <div style={s.row3}>
            {/* Table */}
            <div style={s.panel}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>Reservas recientes</div>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Plato</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res, i) => (
                    <tr key={i}>
                      <td style={s.tdBold}>{res.estudiante}</td>
                      <td>{res.plato}</td>
                      <td>{res.hora}</td>
                      <td>
                        <span
                          style={{
                            ...s.pill,
                            backgroundColor: getEstadoColor(res.estado),
                            color: getEstadoTextColor(res.estado),
                          }}
                        >
                          {res.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Activity Feed */}
            <div style={s.panel}>
              <div style={s.panelHead}>
                <div style={s.panelTitle}>Actividad reciente</div>
              </div>
              <div style={s.activityList}>
                {activities.map((act, i) => (
                  <div key={i} style={s.activityItem}>
                    <div
                      style={{
                        ...s.actDot,
                        backgroundColor: getActivityColor(act.tipo),
                      }}
                    />
                    <div>
                      <div style={s.actText}>
                        <strong>{act.titulo}</strong> {act.texto}
                      </div>
                      <div style={s.actTime}>{act.tiempo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Dish Form */}
          <div style={s.panel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}>Agregar nuevo plato al menú</div>
              <div style={s.panelSub}>Los campos con * son obligatorios</div>
            </div>

            <div style={s.formGrid}>
              <div style={{ ...s.formField, gridColumn: '1 / -1' }}>
                <label style={s.formLabel}>Nombre del plato *</label>
                <input
                  style={s.formInput}
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Ensalada mediterránea"
                />
              </div>

              <div style={{ ...s.formField, gridColumn: '1 / -1' }}>
                <label style={s.formLabel}>Descripción</label>
                <textarea
                  style={s.formTextarea}
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción breve del plato..."
                />
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>Precio (CLP) *</label>
                <input
                  style={s.formInput}
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="Ej: 4990"
                />
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>Categoría</label>
                <input
                  style={s.formInput}
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  placeholder="Ej: Ensaladas, Pastas..."
                />
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>Disponibilidad</label>
                <select
                  style={s.formInput}
                  name="disponible"
                  value={form.disponible}
                  onChange={handleChange}
                >
                  <option value="S">Disponible</option>
                  <option value="N">No disponible</option>
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>Imagen del plato</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ ...s.formInput, padding: '6px 10px' }}
                />
              </div>

              {mensaje && (
                <div
                  style={{
                    ...s.formField,
                    gridColumn: '1 / -1',
                    ...(mensaje.tipo === 'success' ? s.msgSuccess : s.msgError),
                  }}
                >
                  {mensaje.texto}
                </div>
              )}

              <div style={s.formActions}>
                <button style={s.btnSecondary} type="button">
                  Cancelar
                </button>
                <button
                  style={s.btnPrimary}
                  disabled={loading}
                  onClick={handleSubmit}
                >
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

// ════ Styles ════
const s = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    fontFamily: "system-ui, 'Segoe UI', sans-serif",
    fontSize: '13px',
    color: '#111827',
  },

  sidebar: {
    width: '220px',
    backgroundColor: '#1e3a5f',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: '0.5px solid rgba(255,255,255,0.1)',
  },

  sidebarLogo: {
    padding: '16px 18px 12px',
    borderBottom: '0.5px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  logoIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },

  logoTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
  },

  logoSub: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '1px',
  },

  nav: {
    flex: 1,
    padding: '10px 8px',
    overflowY: 'auto',
  },

  navSection: {
    marginBottom: '18px',
  },

  navLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
    color: 'rgba(255,255,255,0.35)',
    padding: '0 8px',
    marginBottom: '5px',
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '7px 10px',
    borderRadius: '7px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '1px',
    transition: 'background 0.15s',
  },

  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '7px 10px',
    borderRadius: '7px',
    cursor: 'pointer',
    color: '#93c5fd',
    marginBottom: '1px',
    backgroundColor: 'rgba(37,99,235,0.35)',
  },

  sidebarUser: {
    padding: '12px 14px',
    borderTop: '0.5px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },

  userAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },

  userName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
  },

  userRole: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  topbar: {
    backgroundColor: '#1e3a5f',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 18px',
    gap: '12px',
    flexShrink: 0,
  },

  topbarTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    margin: 0,
  },

  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '5px 10px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '12px',
    outline: 'none',
    width: '200px',
  },

  content: {
    flex: 1,
    padding: '18px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },

  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '14px',
    border: '0.5px solid #e5e7eb',
  },

  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
  },

  statLabel: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px',
  },

  statIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '17px',
    backgroundColor: '#dbeafe',
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 290px',
    gap: '12px',
  },

  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },

  panel: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '14px',
    border: '0.5px solid #e5e7eb',
  },

  panelHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },

  panelTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#111827',
  },

  panelSub: {
    fontSize: '11px',
    color: '#6b7280',
  },

  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '5px',
    height: '140px',
  },

  barGroup: {
    display: 'flex',
    gap: '2px',
    alignItems: 'flex-end',
    flex: 1,
  },

  bar: {
    borderRadius: '3px 3px 0 0',
    minWidth: '7px',
    backgroundColor: '#2563eb',
    cursor: 'default',
    transition: 'opacity 0.15s',
  },

  chartLabels: {
    display: 'flex',
    gap: '5px',
    marginTop: '5px',
  },

  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: '10px',
    color: '#9ca3af',
  },

  progressList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
  },

  progressHead: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },

  progressName: {
    fontSize: '11px',
    color: '#4b5563',
  },

  progressPct: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#111827',
  },

  progressTrack: {
    height: '5px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
  },

  progressFill: {
    height: '5px',
    borderRadius: '3px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tdBold: {
    padding: '9px 0',
    borderBottom: '0.5px solid #f9fafb',
    fontSize: '11px',
    color: '#111827',
    fontWeight: '600',
  },

  pill: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: '700',
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
  },

  activityItem: {
    display: 'flex',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '0.5px solid #f9fafb',
    alignItems: 'flex-start',
  },

  actDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '3px',
  },

  actText: {
    fontSize: '11px',
    color: '#6b7280',
    lineHeight: 1.5,
  },

  actTime: {
    fontSize: '10px',
    color: '#9ca3af',
    marginTop: '1px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },

  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  formLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#374151',
  },

  formInput: {
    padding: '8px 10px',
    fontSize: '12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    color: '#111827',
    backgroundColor: '#f9fafb',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },

  formTextarea: {
    padding: '8px 10px',
    fontSize: '12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    color: '#111827',
    backgroundColor: '#f9fafb',
    fontFamily: 'inherit',
    minHeight: '62px',
    resize: 'vertical',
    transition: 'border-color 0.2s',
  },

  formActions: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '4px',
  },

  btnPrimary: {
    padding: '9px 20px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  btnSecondary: {
    padding: '9px 16px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'none',
    color: '#6b7280',
    border: '1.5px solid #e5e7eb',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },

  msgSuccess: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    color: '#4ade80',
    border: '1px solid rgba(34,197,94,0.15)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },

  msgError: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
}