import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import './Admin.css'
import AdminSidebar from '../components/AdminSidebar'

export default function Admin() {
  const [statsReales, setStatsReales] = useState({
    platosMenu: 0,
    reservasHoy: 0,
    pendientes: 0,
    noDisponibles: 0,
  })
  const [reservasRecientes, setReservasRecientes] = useState([])
  const [topPlatos, setTopPlatos] = useState([])

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

  const fetchStats = async () => {
    const hoy = new Date().toISOString().split('T')[0]
    const [{ count: platosMenu }, { count: reservasHoy }, { count: pendientes }, { count: noDisponibles }] =
      await Promise.all([
        supabase.from('platos').select('*', { count: 'exact', head: true }).eq('disponible', 'S'),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).gte('fecha_reserva', hoy),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('platos').select('*', { count: 'exact', head: true }).eq('disponible', 'N'),
      ])
    setStatsReales({
      platosMenu: platosMenu ?? 0,
      reservasHoy: reservasHoy ?? 0,
      pendientes: pendientes ?? 0,
      noDisponibles: noDisponibles ?? 0,
    })
  }

  const fetchReservasRecientes = async () => {
    const { data } = await supabase
      .from('reservas')
      .select(`
        id_reserva,
        hora_retiro,
        estado,
        usuarios ( email ),
        reserva_platos ( platos ( nombre ) )
      `)
      .order('fecha_reserva', { ascending: false })
      .limit(5)
    if (data) setReservasRecientes(data)
  }

  const fetchTopPlatos = async () => {
    const { data } = await supabase.from('reserva_platos').select('id_plato, platos ( nombre )')
    if (!data) return
    const conteo = {}
    data.forEach(({ id_plato, platos }) => {
      if (!conteo[id_plato]) conteo[id_plato] = { nombre: platos?.nombre, count: 0 }
      conteo[id_plato].count++
    })
    const total = data.length || 1
    const ordenados = Object.values(conteo)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((p, i) => ({
        nombre: p.nombre,
        porcentaje: Math.round((p.count / total) * 100),
        color: ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#9ca3af'][i],
      }))
    setTopPlatos(ordenados)
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchStats()
      await fetchReservasRecientes()
      await fetchTopPlatos()
    }
    loadData()
  }, [])

  const stats = [
    { label: 'Platos en menú', valor: statsReales.platosMenu, icon: '🍽️' },
    { label: 'Reservas hoy', valor: statsReales.reservasHoy, icon: '📅' },
    { label: 'Pendientes', valor: statsReales.pendientes, icon: '⏰' },
    { label: 'No disponibles', valor: statsReales.noDisponibles, icon: '🚫' },
  ]

  const getEstadoColor = (estado) => {
    if (estado === 'Lista') return 'admin-pill admin-pill-verde'
    if (estado === 'Pendiente') return 'admin-pill admin-pill-amarillo'
    if (estado === 'Cancelada') return 'admin-pill admin-pill-rojo'
    return 'admin-pill'
  }

  const getActivityColor = (tipo) => {
    const colors = { success: '#16a34a', warning: '#ca8a04', error: '#dc2626', info: '#2563eb' }
    return colors[tipo] || '#6b7280'
  }

  const platosParaMostrar = topPlatos.length > 0 ? topPlatos : topDishes

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Resumen general</h1>
          <input type="text" placeholder="Buscar plato, usuario..." className="admin-search-input" />
        </header>

        <main className="admin-content">

          <div className="admin-stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="admin-stat-card">
                <div className="admin-stat-top">
                  <div>
                    <div className="admin-stat-value">{stat.valor}</div>
                    <div className="admin-stat-label">{stat.label}</div>
                  </div>
                  <div className="admin-stat-icon">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-row2">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div className="admin-panel-title">Reservas por día (últimas 2 semanas)</div>
              </div>
              <div className="admin-chart-bars">
                {chartData.map((val, i) => (
                  <div key={i} className="admin-bar-group">
                    <div className="admin-bar" style={{ height: `${(val / maxChartValue) * 120}px` }} title={`${days[i]}: ${val} reservas`} />
                  </div>
                ))}
              </div>
              <div className="admin-chart-labels">
                {days.map((d, i) => <div key={i} className="admin-chart-label">{d}</div>)}
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-head">
                <div className="admin-panel-title">Platos más solicitados</div>
              </div>
              <div className="admin-progress-list">
                {platosParaMostrar.map((dish, i) => (
                  <div key={i}>
                    <div className="admin-progress-head">
                      <span className="admin-progress-name">{dish.nombre}</span>
                      <span className="admin-progress-pct">{dish.porcentaje}%</span>
                    </div>
                    <div className="admin-progress-track">
                      <div className="admin-progress-fill" style={{ width: `${dish.porcentaje}%`, backgroundColor: dish.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-row3">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div className="admin-panel-title">Reservas recientes</div>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Plato</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasRecientes.map((res, i) => (
                    <tr key={i}>
                      <td className="admin-td">{res.usuarios?.email?.split('@')[0] ?? 'Usuario'}</td>
                      <td className="admin-td-normal">{res.reserva_platos?.[0]?.platos?.nombre ?? '—'}</td>
                      <td className="admin-td-normal">{res.hora_retiro}</td>
                      <td className="admin-td-normal">
                        <span className={getEstadoColor(res.estado)}>{res.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-head">
                <div className="admin-panel-title">Actividad reciente</div>
              </div>
              <div className="admin-activity-list">
                {activities.map((act, i) => (
                  <div key={i} className="admin-activity-item">
                    <div className="admin-act-dot" style={{ backgroundColor: getActivityColor(act.tipo) }} />
                    <div>
                      <div className="admin-act-text"><strong>{act.titulo}</strong> {act.texto}</div>
                      <div className="admin-act-time">{act.tiempo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}