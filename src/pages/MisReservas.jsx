import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import Navbar from '../components/Navbar'
import './MisReservas.css'

const MisReservas = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reservas, setReservas] = useState([])
  const [idUsuario, setIdUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
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
          platos ( nombre, imagen_url, precio )
        )
      `)
      .eq('id_usuario', id)
      .order('fecha_reserva', { ascending: false })
    if (data) setReservas(data)
  }

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    const init = async () => {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .single()
      if (userData) {
        setIdUsuario(userData.id_usuario)
        await fetchReservas(userData.id_usuario)
      }
      setLoading(false)
    }
    init()
  }, [user])

  const handleCancelar = async (id_reserva) => {
    await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id_reserva', id_reserva)
    fetchReservas(idUsuario)
  }

  const handleReservarDeNuevo = (reserva) => {
    const id_plato = reserva.reserva_platos?.[0]?.platos?.id_plato
    navigate('/reservas', { state: { id_plato } })
  }

  const reservaActiva = reservas.find(r => r.estado === 'pendiente' || r.estado === 'lista')
  const historial = reservas.filter(r => r.estado !== 'pendiente' && r.estado !== 'lista')

  const getBadgeClass = (estado) => {
    if (estado === 'pendiente') return 'mr-badge amarillo'
    if (estado === 'lista') return 'mr-badge verde'
    if (estado === 'entregada') return 'mr-badge gris'
    if (estado === 'cancelada') return 'mr-badge rojo'
    return 'mr-badge'
  }

  if (loading) return (
    <div className="mr-page">
      <Navbar />
      <div className="mr-loading">Cargando tus reservas...</div>
    </div>
  )

  return (
    <div className="mr-page">
      <Navbar />

      <div className="mr-container">
        <h1 className="mr-title">Mis Reservas</h1>

        {/* Reserva activa */}
        {reservaActiva ? (
          <div className={`mr-activa ${reservaActiva.estado === 'lista' ? 'lista' : ''}`}>
            {reservaActiva.estado === 'lista' && (
              <div className="mr-banner-lista">
                🎉 ¡Tu pedido está listo para retirar!
              </div>
            )}
            <div className="mr-activa-content">
              {reservaActiva.reserva_platos?.[0]?.platos?.imagen_url && (
                <img
                  src={reservaActiva.reserva_platos[0].platos.imagen_url}
                  alt={reservaActiva.reserva_platos[0].platos.nombre}
                  className="mr-activa-img"
                />
              )}
              <div className="mr-activa-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="mr-activa-label">Reserva activa</p>
                    <h2 className="mr-activa-plato">
                      {reservaActiva.reserva_platos?.[0]?.platos?.nombre ?? '—'}
                    </h2>
                  </div>
                  <span className={getBadgeClass(reservaActiva.estado)}>{reservaActiva.estado}</span>
                </div>
                <div className="mr-activa-detalles">
                  <span>📅 {new Date(reservaActiva.fecha_reserva).toLocaleDateString('es-CL')}</span>
                  <span>⏰ Retiro: {reservaActiva.hora_retiro}</span>
                  <span>🍽️ x{reservaActiva.reserva_platos?.[0]?.cantidad}</span>
                  <span>💰 ${reservaActiva.reserva_platos?.[0]?.platos?.precio?.toLocaleString('es-CL')}</span>
                </div>
                {reservaActiva.estado === 'pendiente' && (
                  <button className="mr-btn-cancelar" onClick={() => handleCancelar(reservaActiva.id_reserva)}>
                    Cancelar reserva
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mr-sin-activa">
            <p>No tienes reservas activas.</p>
            <button className="mr-btn-reservar" onClick={() => navigate('/reservas')}>
              Hacer una reserva
            </button>
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <div className="mr-historial">
            <h2 className="mr-historial-title">Historial</h2>
            {historial.map((r) => (
              <div key={r.id_reserva} className="mr-card">
                {r.reserva_platos?.[0]?.platos?.imagen_url && (
                  <img
                    src={r.reserva_platos[0].platos.imagen_url}
                    alt={r.reserva_platos[0].platos.nombre}
                    className="mr-card-img"
                  />
                )}
                <div className="mr-card-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="mr-card-plato">{r.reserva_platos?.[0]?.platos?.nombre ?? '—'}</h3>
                    <span className={getBadgeClass(r.estado)}>{r.estado}</span>
                  </div>
                  <div className="mr-card-detalles">
                    <span>📅 {new Date(r.fecha_reserva).toLocaleDateString('es-CL')}</span>
                    <span>⏰ {r.hora_retiro}</span>
                    <span>x{r.reserva_platos?.[0]?.cantidad}</span>
                    <span>${r.reserva_platos?.[0]?.platos?.precio?.toLocaleString('es-CL')}</span>
                  </div>
                </div>
                <button className="mr-btn-repetir" onClick={() => handleReservarDeNuevo(r)}>
                  Reservar de nuevo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MisReservas