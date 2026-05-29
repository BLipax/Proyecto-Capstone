import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import Navbar from '../components/Navbar'
import './Reservas.css'

const HORAS = ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00']

const Reservas = () => {
  const { user } = useAuth()
  const [platos, setPlatos] = useState([])
  const [reservas, setReservas] = useState([])
  const [idUsuario, setIdUsuario] = useState(null)
  const [form, setForm] = useState({ id_plato: '', fecha: '', hora: '', cantidad: 1 })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const fetchPlatos = async () => {
  const { data } = await supabase.from('platos').select('*').eq('disponible', 'S')
  if (data) setPlatos(data)
}

const fetchReservas = async (id) => {
  const { data } = await supabase
    .from('reservas')
    .select(`
      id_reserva,
      fecha_reserva,
      hora_retiro,
      estado,
      reserva_platos (
        cantidad,
        platos ( nombre, precio )
      )
    `)
    .eq('id_usuario', id)
    .order('fecha_reserva', { ascending: false })
  if (data) setReservas(data)
}

useEffect(() => {
  const init = async () => {
    await fetchPlatos()

    if (!user) return

    const { data } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_id', user.id)
      .single()

    if (data) {
      setIdUsuario(data.id_usuario)
      await fetchReservas(data.id_usuario)
    }
  }

  init()
}, [user])


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleReservar = async () => {
    if (!form.id_plato || !form.fecha || !form.hora) {
      setMensaje({ tipo: 'error', texto: 'Completa todos los campos.' })
      return
    }
    if (!idUsuario) {
      setMensaje({ tipo: 'error', texto: 'No se pudo identificar tu usuario.' })
      return
    }
    setLoading(true)
    setMensaje(null)

    const { data: reserva, error: errReserva } = await supabase
      .from('reservas')
      .insert([{
        fecha_reserva: form.fecha,
        hora_retiro: form.hora,
        estado: 'pendiente',
        id_usuario: idUsuario,
      }])
      .select()
      .single()

    if (errReserva) {
      setMensaje({ tipo: 'error', texto: 'Error al crear la reserva.' })
      setLoading(false)
      return
    }

    const { error: errPlato } = await supabase
      .from('reserva_platos')
      .insert([{
        id_reserva: reserva.id_reserva,
        id_plato: parseInt(form.id_plato),
        cantidad: parseInt(form.cantidad),
      }])

    setLoading(false)
    if (errPlato) {
      setMensaje({ tipo: 'error', texto: 'Error al agregar el plato.' })
    } else {
      setMensaje({ tipo: 'exito', texto: '¡Reserva creada correctamente!' })
      setForm({ id_plato: '', fecha: '', hora: '', cantidad: 1 })
      fetchReservas(idUsuario)
    }
  }

  const handleCancelar = async (id_reserva) => {
    await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id_reserva', id_reserva)
    fetchReservas(idUsuario)
  }

  const estadoStyle = (estado) => {
    if (estado === 'pendiente') return 'badge pendiente'
    if (estado === 'cancelada') return 'badge cancelada'
    if (estado === 'lista') return 'badge lista'
    return 'badge'
  }

  return (
    <div className="reservas-page">
      <Navbar />
      <div className="reservas-container">

        <div className="reservas-form-card">
          <h2 className="reservas-title">Nueva reserva</h2>

          <div className="reservas-field">
            <label className="reservas-label">Plato</label>
            <select className="reservas-input" name="id_plato" value={form.id_plato} onChange={handleChange}>
              <option value="">Selecciona un plato</option>
              {platos.map(p => (
                <option key={p.id_plato} value={p.id_plato}>
                  {p.nombre} — ${p.precio}
                </option>
              ))}
            </select>
          </div>

          <div className="reservas-row">
            <div className="reservas-field">
              <label className="reservas-label">Fecha</label>
              <input
                className="reservas-input"
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            <div className="reservas-field">
              <label className="reservas-label">Hora de retiro</label>
              <select className="reservas-input" name="hora" value={form.hora} onChange={handleChange}>
                <option value="">Selecciona hora</option>
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="reservas-field">
              <label className="reservas-label">Cantidad</label>
              <input
                className="reservas-input"
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>
          </div>

          {mensaje && (
            <p className={mensaje.tipo === 'exito' ? 'reservas-exito' : 'reservas-error'}>
              {mensaje.texto}
            </p>
          )}

          <button className="reservas-btn" onClick={handleReservar} disabled={loading}>
            {loading ? 'Reservando...' : 'Confirmar reserva'}
          </button>
        </div>

        <div className="reservas-historial">
          <h2 className="reservas-title">Mis reservas</h2>
          {reservas.length === 0 ? (
            <p className="reservas-empty">No tienes reservas aún.</p>
          ) : (
            reservas.map(r => (
              <div key={r.id_reserva} className="reserva-card">
                <div className="reserva-card-header">
                  <div>
                    <p className="reserva-plato">
                      {r.reserva_platos?.[0]?.platos?.nombre ?? 'Plato no encontrado'}
                    </p>
                    <p className="reserva-info">
                      {new Date(r.fecha_reserva).toLocaleDateString('es-CL')} · {r.hora_retiro} · x{r.reserva_platos?.[0]?.cantidad}
                    </p>
                  </div>
                  <span className={estadoStyle(r.estado)}>{r.estado}</span>
                </div>
                {r.estado === 'pendiente' && (
                  <button className="reserva-cancelar" onClick={() => handleCancelar(r.id_reserva)}>
                    Cancelar
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Reservas