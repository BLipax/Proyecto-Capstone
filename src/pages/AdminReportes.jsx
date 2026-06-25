import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import AdminSidebar from '../components/AdminSidebar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import './Admin.css'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#f59e0b', '#dc2626', '#9ca3af']

const AdminReportes = () => {
  const [platosMasVendidos, setPlatosMasVendidos] = useState([])
  const [reservasPorDia, setReservasPorDia] = useState([])
  const [reservasPorHora, setReservasPorHora] = useState([])
  const [totalReservas, setTotalReservas] = useState(0)
  const [totalPlatos, setTotalPlatos] = useState(0)
  const [platosPorDia, setPlatosPorDia] = useState([])
  const [platosPorHora, setPlatosPorHora] = useState([])
  const [tabActivo, setTabActivo] = useState('platos')
  const [filtroPlato, setFiltroPlato] = useState('')
  const [filtroRango, setFiltroRango] = useState('semana')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  const getRangoFechas = () => {
    const hoy = new Date()
    const hasta = hoy.toISOString().split('T')[0]
    if (filtroRango === 'semana') {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() - 7)
      return { desde: d.toISOString().split('T')[0], hasta }
    } else if (filtroRango === 'mes') {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() - 30)
      return { desde: d.toISOString().split('T')[0], hasta }
    } else {
      return { desde: filtroFechaDesde, hasta: filtroFechaHasta || hasta }
    }
  }

  const fetchReportes = async () => {
    const { data: dataPlatosVendidos } = await supabase
      .from('reserva_platos')
      .select('id_plato, cantidad, platos ( nombre )')

    if (dataPlatosVendidos) {
      const conteo = {}
      dataPlatosVendidos.forEach(({ id_plato, cantidad, platos }) => {
        if (!conteo[id_plato]) conteo[id_plato] = { nombre: platos?.nombre, total: 0 }
        conteo[id_plato].total += cantidad
      })
      const ordenados = Object.values(conteo).sort((a, b) => b.total - a.total).slice(0, 6)
      setPlatosMasVendidos(ordenados)
      setTotalPlatos(dataPlatosVendidos.reduce((acc, r) => acc + r.cantidad, 0))
    }
  }

  const fetchReportesFiltrados = async () => {
    const { desde, hasta } = getRangoFechas()
    if (!desde || !hasta) return

    const { data: dataReservas } = await supabase
      .from('reservas')
      .select('fecha_reserva, estado')
      .neq('estado', 'cancelada')
      .gte('fecha_reserva', desde)
      .lte('fecha_reserva', hasta)

    if (dataReservas) {
      setTotalReservas(dataReservas.length)
      const porDia = Array(7).fill(0)
      dataReservas.forEach(r => {
        const dia = new Date(r.fecha_reserva).getDay()
        porDia[dia]++
      })
      setReservasPorDia(
        DIAS.map((nombre, i) => ({ nombre: nombre.slice(0, 3), reservas: porDia[i] }))
          .filter((_, i) => i >= 1 && i <= 5)
      )
    }

    const { data: dataHoras } = await supabase
      .from('reservas')
      .select('hora_retiro')
      .neq('estado', 'cancelada')
      .gte('fecha_reserva', desde)
      .lte('fecha_reserva', hasta)

    if (dataHoras) {
      const porHora = {}
      dataHoras.forEach(r => {
        const hora = r.hora_retiro?.slice(0, 5)
        if (hora) porHora[hora] = (porHora[hora] || 0) + 1
      })
      setReservasPorHora(
        Object.entries(porHora)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([hora, reservas]) => ({ hora, reservas }))
      )
    }
  }

  const fetchPlatosPorDia = async () => {
    const { data } = await supabase
      .from('reservas')
      .select(`fecha_reserva, reserva_platos ( platos ( nombre ) )`)
      .neq('estado', 'cancelada')

    if (!data) return

    const porDia = {}
    data.forEach(r => {
      const dia = DIAS[new Date(r.fecha_reserva).getDay()]
      const plato = r.reserva_platos?.[0]?.platos?.nombre
      if (!plato || !dia) return
      if (!porDia[dia]) porDia[dia] = {}
      porDia[dia][plato] = (porDia[dia][plato] || 0) + 1
    })

    const resultado = DIAS.slice(1, 6).map(dia => {
      if (!porDia[dia]) return { dia, plato: '—', cantidad: 0 }
      const top = Object.entries(porDia[dia]).sort((a, b) => b[1] - a[1])[0]
      return { dia, plato: top?.[0] ?? '—', cantidad: top?.[1] ?? 0 }
    })

    setPlatosPorDia(resultado)
  }

  const fetchPlatosPorHora = async () => {
    const { data } = await supabase
      .from('reservas')
      .select(`hora_retiro, reserva_platos ( platos ( nombre ) )`)
      .neq('estado', 'cancelada')

    if (!data) return

    const porHora = {}
    data.forEach(r => {
      const hora = r.hora_retiro?.slice(0, 5)
      const plato = r.reserva_platos?.[0]?.platos?.nombre
      if (!hora || !plato) return
      if (!porHora[hora]) porHora[hora] = {}
      porHora[hora][plato] = (porHora[hora][plato] || 0) + 1
    })

    const resultado = Object.entries(porHora)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hora, platos]) => {
        const top = Object.entries(platos).sort((a, b) => b[1] - a[1])[0]
        return { hora, plato: top?.[0] ?? '—', cantidad: top?.[1] ?? 0 }
      })

    setPlatosPorHora(resultado)
  }

  useEffect(() => {
    const init = async () => {
      await fetchReportes()
      await fetchReportesFiltrados()
      await fetchPlatosPorDia()
      await fetchPlatosPorHora()
    }
    init()
  }, [])

  useEffect(() => {
    const cargarReportesFiltrados = async () => {
      await fetchReportesFiltrados()
    }
    cargarReportesFiltrados()
  }, [filtroRango, filtroFechaDesde, filtroFechaHasta])

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Reportes</h1>
        </header>

        <main className="admin-content">

          {/* Stats — siempre visibles */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <div className="admin-stat-value">{totalReservas}</div>
                  <div className="admin-stat-label">Reservas totales</div>
                </div>
                <div className="admin-stat-icon">📅</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <div className="admin-stat-value">{totalPlatos}</div>
                  <div className="admin-stat-label">Platos vendidos</div>
                </div>
                <div className="admin-stat-icon">🍽️</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <div className="admin-stat-value">{platosMasVendidos[0]?.nombre ?? '—'}</div>
                  <div className="admin-stat-label">Plato más popular</div>
                </div>
                <div className="admin-stat-icon">⭐</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-top">
                <div>
                  <div className="admin-stat-value">
                    {reservasPorHora.length > 0
                      ? reservasPorHora.reduce((a, b) => a.reservas > b.reservas ? a : b).hora
                      : '—'}
                  </div>
                  <div className="admin-stat-label">Hora peak</div>
                </div>
                <div className="admin-stat-icon">⏰</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${tabActivo === 'platos' ? 'activo' : ''}`}
              onClick={() => setTabActivo('platos')}
            >
              🍽️ Platos
            </button>
            <button
              className={`admin-tab ${tabActivo === 'reservas' ? 'activo' : ''}`}
              onClick={() => setTabActivo('reservas')}
            >
              📅 Reservas
            </button>
          </div>

          {/* Tab Platos */}
          {tabActivo === 'platos' && (
            <>
              <div className="admin-row2">
                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div className="admin-panel-title">Platos más vendidos</div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={platosMasVendidos} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Vendidos">
                        {platosMasVendidos.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div className="admin-panel-title">Distribución por plato</div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={platosMasVendidos}
                        dataKey="total"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {platosMasVendidos.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Filtro por plato */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <label className="admin-form-label" style={{ margin: 0 }}>Filtrar por plato:</label>
                <select
                  className="admin-form-input"
                  style={{ maxWidth: 260 }}
                  value={filtroPlato}
                  onChange={(e) => setFiltroPlato(e.target.value)}
                >
                  <option value="">Todos los platos</option>
                  {platosMasVendidos.map((p, i) => (
                    <option key={i} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-head">
                  <div className="admin-panel-title">Plato más pedido por día de semana</div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Plato más pedido</th>
                      <th>Veces pedido</th>
                      <th>Popularidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platosPorDia
                      .filter(row => filtroPlato === '' || row.plato === filtroPlato)
                      .map((row, i) => (
                        <tr key={i}>
                          <td className="admin-td">{row.dia}</td>
                          <td className="admin-td-normal">{row.plato}</td>
                          <td className="admin-td-normal">{row.cantidad}</td>
                          <td className="admin-td-normal">
                            <div className="admin-progress-track" style={{ width: 120 }}>
                              <div
                                className="admin-progress-fill"
                                style={{
                                  width: `${Math.min((row.cantidad / 10) * 100, 100)}%`,
                                  backgroundColor: COLORS[i % COLORS.length]
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-head">
                  <div className="admin-panel-title">Plato más pedido por hora</div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Plato más pedido</th>
                      <th>Veces pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platosPorHora
                      .filter(row => filtroPlato === '' || row.plato === filtroPlato)
                      .map((row, i) => (
                        <tr key={i}>
                          <td className="admin-td">{row.hora}</td>
                          <td className="admin-td-normal">{row.plato}</td>
                          <td className="admin-td-normal">{row.cantidad}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tab Reservas */}
          {tabActivo === 'reservas' && (
            <>
              {/* Filtro por rango */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <label className="admin-form-label" style={{ margin: 0 }}>Período:</label>
                <div className="admin-tabs" style={{ margin: 0 }}>
                  {['semana', 'mes', 'personalizado'].map(r => (
                    <button
                      key={r}
                      className={`admin-tab ${filtroRango === r ? 'activo' : ''}`}
                      onClick={() => setFiltroRango(r)}
                      style={{ fontSize: 12, padding: '5px 14px' }}
                    >
                      {r === 'semana' ? 'Última semana' : r === 'mes' ? 'Último mes' : 'Personalizado'}
                    </button>
                  ))}
                </div>
                {filtroRango === 'personalizado' && (
                  <>
                    <input
                      type="date"
                      className="admin-form-input"
                      style={{ maxWidth: 160, padding: '5px 10px' }}
                      value={filtroFechaDesde}
                      onChange={(e) => setFiltroFechaDesde(e.target.value)}
                    />
                    <span style={{ color: '#6b7280', fontSize: 13 }}>hasta</span>
                    <input
                      type="date"
                      className="admin-form-input"
                      style={{ maxWidth: 160, padding: '5px 10px' }}
                      value={filtroFechaHasta}
                      onChange={(e) => setFiltroFechaHasta(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="admin-row2">
                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div className="admin-panel-title">Reservas por día de semana</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reservasPorDia} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="reservas" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Reservas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div className="admin-panel-title">Reservas por hora de retiro</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reservasPorHora} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="reservas" fill="#0891b2" radius={[4, 4, 0, 0]} name="Reservas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}

export default AdminReportes