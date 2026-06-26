import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
  const [reservasSemana, setReservasSemana] = useState([])
  const [actividad, setActividad] = useState([])

  const topDishes = [
    { nombre: 'Cazuela de vacuno', porcentaje: 38, color: '#2563eb' },
    { nombre: 'Ensalada mediterránea', porcentaje: 24, color: '#7c3aed' },
    { nombre: 'Pasta primavera', porcentaje: 19, color: '#0891b2' },
    { nombre: 'Pollo al ajillo', porcentaje: 12, color: '#059669' },
    { nombre: 'Otros', porcentaje: 7, color: '#9ca3af' },
  ]

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
        fecha_reserva,
        usuarios ( email ),
        reserva_platos ( platos ( nombre ) )
      `)
      .order('fecha_reserva', { ascending: false })
      .limit(5)
    if (data) setReservasRecientes(data)
  }

  const fetchTopPlatos = async () => {
    const { data } = await supabase
      .from('reserva_platos')
      .select('id_plato, platos ( nombre )')
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

const fetchReservasSemana = async () => {
  const hoy = new Date()
  const hace7 = new Date(hoy)
  const en7 = new Date(hoy)
  hace7.setDate(hoy.getDate() - 7)
  en7.setDate(hoy.getDate() + 7)
  const desde = hace7.toISOString().split('T')[0]
  const hasta = en7.toISOString().split('T')[0]

  const { data } = await supabase
    .from('reservas')
    .select('fecha_reserva')
    .neq('estado', 'cancelada')
    .gte('fecha_reserva', desde)
    .lte('fecha_reserva', hasta)

  if (!data) return

  const conteo = {}
  data.forEach(r => {
    conteo[r.fecha_reserva] = (conteo[r.fecha_reserva] || 0) + 1
  })

  const resultado = []
  for (let i = -7; i <= 7; i++) {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    const diaSemana = d.getDay()
    if (diaSemana === 0 || diaSemana === 6) continue
    const fecha = d.toISOString().split('T')[0]
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
    resultado.push({ dia: `${dias[diaSemana]} ${d.getDate()}`, reservas: conteo[fecha] || 0 })
  }

  setReservasSemana(resultado)
  }

  const fetchActividad = async () => {
    const eventos = []

    const { data: reservas } = await supabase
      .from('reservas')
      .select(`
        id_reserva,
        estado,
        fecha_reserva,
        hora_retiro,
        usuarios ( email ),
        reserva_platos ( platos ( nombre ) )
      `)
      .order('fecha_reserva', { ascending: false })
      .limit(5)

    if (reservas) {
      reservas.forEach(r => {
        const usuario = r.usuarios?.email?.split('@')[0] ?? 'Usuario'
        const plato = r.reserva_platos?.[0]?.platos?.nombre ?? 'un plato'
        if (r.estado === 'cancelada') {
          eventos.push({ tipo: 'error', titulo: 'Reserva cancelada:', texto: `${usuario} canceló ${plato}`, tiempo: r.fecha_reserva })
        } else {
          eventos.push({ tipo: 'info', titulo: 'Nueva reserva:', texto: `${usuario} reservó ${plato}`, tiempo: r.fecha_reserva })
        }
      })
    }

    const { data: platos } = await supabase
      .from('platos')
      .select('nombre, created_at, disponible')
      .order('created_at', { ascending: false })
      .limit(3)

    if (platos) {
      platos.forEach(p => {
        if (p.disponible === 'S') {
          eventos.push({ tipo: 'success', titulo: 'Plato agregado:', texto: `${p.nombre} al menú`, tiempo: p.created_at })
        } else {
          eventos.push({ tipo: 'warning', titulo: 'Plato desactivado:', texto: p.nombre, tiempo: p.created_at })
        }
      })
    }

    setActividad(eventos.slice(0, 6))
  }

  const formatTiempo = (timestamp) => {
    if (!timestamp) return ''
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (diff < 60) return 'Hace un momento'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchStats()
      await fetchReservasRecientes()
      await fetchTopPlatos()
      await fetchReservasSemana()
      await fetchActividad()
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
    if (estado === 'lista') return 'admin-pill admin-pill-verde'
    if (estado === 'pendiente') return 'admin-pill admin-pill-amarillo'
    if (estado === 'cancelada') return 'admin-pill admin-pill-rojo'
    if (estado === 'entregada') return 'admin-pill'
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
                  <div className="admin-panel-title">Reservas por día (±7 días)</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={reservasSemana} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="reservas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="admin-chart-labels">
                {reservasSemana.map((item, i) => (
                  <div key={i} className="admin-chart-label">{item.dia}</div>
                ))}
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
                {actividad.length > 0 ? actividad.map((act, i) => (
                  <div key={i} className="admin-activity-item">
                    <div className="admin-act-dot" style={{ backgroundColor: getActivityColor(act.tipo) }} />
                    <div>
                      <div className="admin-act-text"><strong>{act.titulo}</strong> {act.texto}</div>
                      <div className="admin-act-time">{formatTiempo(act.tiempo)}</div>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin actividad reciente.</p>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}