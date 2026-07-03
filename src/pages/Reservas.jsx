import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Reservas.css'

const HORAS = ['12:30', '13:00', '13:30', '14:00', '14:30', '15:00']

const Reservas = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [platos, setPlatos] = useState([])
  const [sinMenu, setSinMenu] = useState(false)
  const [idUsuario, setIdUsuario] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [badgeConfig, setBadgeConfig] = useState({})

  useEffect(() => {
    if (!user) { navigate('/'); return }

    const init = async () => {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .single()
      if (userData) setIdUsuario(userData.id_usuario)

      const { data: etiquetasData } = await supabase.from('etiquetas').select('*')
      if (etiquetasData) {
        const config = {}
        etiquetasData.forEach(e => {
          config[e.nombre] = { bg: e.color_bg, color: e.color_text, icon: e.icono }
        })
        setBadgeConfig(config)
      }

      if (location.state?.plato) {
        const platoNav = location.state.plato
        setPlatoSeleccionado(platoNav)
        const hoy = new Date().toISOString().split('T')[0]
        const { data: menuData } = await supabase
          .from('menu_dia')
          .select('fecha, platos(*, resenas(calificacion))')
          .eq('id_plato', platoNav.id_plato)
          .gte('fecha', hoy)
          .order('fecha', { ascending: true })
          .limit(1)
        if (menuData && menuData.length > 0) {
          const fechaDisponible = menuData[0].fecha
          setFecha(fechaDisponible)
          const { data: platosDelDia } = await supabase
            .from('menu_dia')
            .select('*, platos(*, resenas(calificacion))')
            .eq('fecha', fechaDisponible)
          if (platosDelDia && platosDelDia.length > 0) {
            setPlatos(platosDelDia.map(m => m.platos))
          }
        }
      }
    }

    init()
  }, [user])

  const fetchPlatosDelDia = async (fechaSeleccionada) => {
    setSinMenu(false)
    setPlatos([])
    const { data } = await supabase
      .from('menu_dia')
      .select('*, platos(*, resenas(calificacion))')
      .eq('fecha', fechaSeleccionada)
    if (data && data.length > 0) {
      setPlatos(data.map(m => m.platos))
    } else {
      setSinMenu(true)
    }
  }

  const handleFecha = (f) => {
    setFecha(f)
    fetchPlatosDelDia(f)
    setPlatoSeleccionado(null)
  }

  const platosFiltrados = platos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getDiasDisponibles = () => {
    const dias = []
    const hoy = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() + i)
      const diaSemana = d.getDay()
      if (diaSemana !== 0) dias.push(d)
    }
    return dias
  }

  const formatFecha = (date) => date.toISOString().split('T')[0]

  const formatDia = (date) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return dias[date.getDay()]
  }

  const handleReservar = async () => {
    if (!platoSeleccionado || !fecha || !hora) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un plato, fecha y hora.' })
      return
    }
    if (!idUsuario) {
      setMensaje({ tipo: 'error', texto: 'No se pudo identificar tu usuario.' })
      return
    }

    const { data: reservaExistente } = await supabase
      .from('reservas')
      .select('id_reserva')
      .eq('id_usuario', idUsuario)
      .eq('fecha_reserva', fecha)
      .neq('estado', 'cancelada')
      .maybeSingle()

    if (reservaExistente) {
      setMensaje({ tipo: 'error', texto: 'Ya tienes una reserva para ese día.' })
      return
    }

    setLoading(true)
    setMensaje(null)

    const { data: reserva, error: errReserva } = await supabase
      .from('reservas')
      .insert([{
        fecha_reserva: fecha,
        hora_retiro: hora,
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
        id_plato: platoSeleccionado.id_plato,
        cantidad,
      }])

    setLoading(false)
    if (errPlato) {
      setMensaje({ tipo: 'error', texto: 'Error al agregar el plato.' })
    } else {
      setMensaje({ tipo: 'exito', texto: '¡Reserva creada correctamente!' })
      setPlatoSeleccionado(null)
      setFecha('')
      setHora('')
      setCantidad(1)
      setPlatos([])
    }
  }

  const diasDisponibles = getDiasDisponibles()

  return (
    <div className="res-page">
      <Navbar />
      <div className="res-container">
        <h1 className="res-title">Nueva reserva</h1>

        <div className="res-section">
          <div className="res-section-head">
            <span className="res-step">1</span>
            <h2 className="res-section-title">Elige la fecha</h2>
          </div>
          <div className="res-fechas">
            {diasDisponibles.map((d, i) => {
              const f = formatFecha(d)
              const esHoy = i === 0
              return (
                <button
                  key={f}
                  className={`res-fecha-btn ${fecha === f ? 'activo' : ''}`}
                  onClick={() => handleFecha(f)}
                >
                  <span className="res-fecha-dia">{formatDia(d)}</span>
                  <span className="res-fecha-num">{d.getDate()}</span>
                  {esHoy && <span className="res-fecha-hoy">Hoy</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="res-section">
          <div className="res-section-head">
            <span className="res-step">2</span>
            <h2 className="res-section-title">Elige tu plato</h2>
          </div>
          {fecha && (
            <input
              className="res-buscador"
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          )}
          <div className="res-platos-lista">
            {!fecha ? (
              <p className="res-sin-menu">Selecciona una fecha para ver el menú disponible.</p>
            ) : sinMenu ? (
              <p className="res-sin-menu">No hay menú disponible para este día.</p>
            ) : platos.length === 0 ? (
              <p className="res-sin-menu">Cargando platos...</p>
            ) : (
              platosFiltrados.map(plato => (
                <div
                  key={plato.id_plato}
                  className={`res-plato-item ${platoSeleccionado?.id_plato === plato.id_plato ? 'seleccionado' : ''}`}
                  onClick={() => setPlatoSeleccionado(plato)}
                >
                  {plato.imagen_url ? (
                    <img src={plato.imagen_url} alt={plato.nombre} className="res-plato-img" />
                  ) : (
                    <div className="res-plato-img-placeholder">🍽️</div>
                  )}
                  <div className="res-plato-info">
                    <p className="res-plato-nombre">{plato.nombre}</p>
                    {plato.categoria && <p className="res-plato-cat">{plato.categoria}</p>}
                    <p className="res-plato-desc">{plato.descripcion}</p>
                    {plato.etiquetas && (
                      <div className="res-plato-etiquetas">
                        {plato.etiquetas.split(',').map(tag => {
                          const t = tag.trim()
                          const cfg = badgeConfig[t]
                          if (!cfg) return null
                          return (
                            <span key={t} className="res-plato-etiqueta" style={{ background: cfg.bg, color: cfg.color }}>
                              {cfg.icon} {t}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className="res-plato-precio">${plato.precio?.toLocaleString('es-CL')}</div>
                  {platoSeleccionado?.id_plato === plato.id_plato && (
                    <div className="res-plato-check">✓</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="res-section">
          <div className="res-section-head">
            <span className="res-step">3</span>
            <h2 className="res-section-title">Elige la hora de retiro</h2>
          </div>
          <div className="res-horas">
            {HORAS.map(h => (
              <button
                key={h}
                className={`res-hora-btn ${hora === h ? 'activo' : ''}`}
                onClick={() => setHora(h)}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="res-section">
          <div className="res-section-head">
            <span className="res-step">4</span>
            <h2 className="res-section-title">Cantidad</h2>
          </div>
          <div className="res-cantidad">
            <button className="res-cantidad-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
            <span className="res-cantidad-num">{cantidad}</span>
            <button className="res-cantidad-btn" onClick={() => setCantidad(c => Math.min(3, c + 1))}>+</button>
          </div>
        </div>

        {platoSeleccionado && fecha && hora && (
          <div className="res-resumen">
            <h3 className="res-resumen-title">Resumen de tu reserva</h3>
            <div className="res-resumen-content">
              {platoSeleccionado.imagen_url && (
                <img src={platoSeleccionado.imagen_url} alt={platoSeleccionado.nombre} className="res-resumen-img" />
              )}
              <div>
                <p className="res-resumen-plato">{platoSeleccionado.nombre}</p>
                <p className="res-resumen-detalle">📅 {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="res-resumen-detalle">⏰ Retiro a las {hora}</p>
                <p className="res-resumen-detalle">🍽️ {cantidad} unidad{cantidad > 1 ? 'es' : ''}</p>
                <p className="res-resumen-precio">${(platoSeleccionado.precio * cantidad).toLocaleString('es-CL')}</p>
              </div>
            </div>
          </div>
        )}

        {mensaje && (
          <p className={mensaje.tipo === 'exito' ? 'res-exito' : 'res-error'}>
            {mensaje.texto}
          </p>
        )}

        <button className="res-btn" onClick={handleReservar} disabled={loading}>
          {loading ? 'Reservando...' : 'Confirmar reserva'}
        </button>
      </div>
    </div>
  )
}

export default Reservas