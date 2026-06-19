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

  const fetchReportes = async () => {
    // Platos más vendidos
    const { data: dataPlatosVendidos } = await supabase
      .from('reserva_platos')
      .select('id_plato, cantidad, platos ( nombre )')

    if (dataPlatosVendidos) {
      const conteo = {}
      dataPlatosVendidos.forEach(({ id_plato, cantidad, platos }) => {
        if (!conteo[id_plato]) conteo[id_plato] = { nombre: platos?.nombre, total: 0 }
        conteo[id_plato].total += cantidad
      })
      const ordenados = Object.values(conteo)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
      setPlatosMasVendidos(ordenados)
      setTotalPlatos(dataPlatosVendidos.reduce((acc, r) => acc + r.cantidad, 0))
    }

    // Reservas por día de semana
    const { data: dataReservas } = await supabase
      .from('reservas')
      .select('fecha_reserva, estado')
      .neq('estado', 'cancelada')

    if (dataReservas) {
      setTotalReservas(dataReservas.length)

      const porDia = Array(7).fill(0)
      dataReservas.forEach(r => {
        const dia = new Date(r.fecha_reserva).getDay()
        porDia[dia]++
      })
      setReservasPorDia(
        DIAS.map((nombre, i) => ({ nombre: nombre.slice(0, 3), reservas: porDia[i] }))
          .filter((_, i) => i >= 1 && i <= 5) // solo lunes a viernes
      )

      // Reservas por hora
      const { data: dataHoras } = await supabase
        .from('reservas')
        .select('hora_retiro')
        .neq('estado', 'cancelada')

      if (dataHoras) {
        const porHora = {}
        dataHoras.forEach(r => {
          const hora = r.hora_retiro?.slice(0, 5)
          if (hora) porHora[hora] = (porHora[hora] || 0) + 1
        })
        const horasOrdenadas = Object.entries(porHora)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([hora, reservas]) => ({ hora, reservas }))
        setReservasPorHora(horasOrdenadas)
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchReportes()
    }
    init()
  }, [])

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Reportes</h1>
        </header>

        <main className="admin-content">

          {/* Stats rápidas */}
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

          {/* Platos más vendidos + Pie */}
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
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} name="Vendidos" />
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

          {/* Reservas por día + por hora */}
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

        </main>
      </div>
    </div>
  )
}

export default AdminReportes