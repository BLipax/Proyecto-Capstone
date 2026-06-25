import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import './Home.css'
import Navbar from '../components/Navbar'

const badgeConfig = {
  'vegano':       { bg: '#EAF3DE', color: '#27500A', icon: '🌱' },
  'vegetariano':  { bg: '#E1F5EE', color: '#085041', icon: '🥦' },
  'sin gluten':   { bg: '#E6F1FB', color: '#0C447C', icon: '🌾' },
  'picante':      { bg: '#FAEEDA', color: '#633806', icon: '🌶️' },
}

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [platos, setPlatos] = useState([])
  const [menuDia, setMenuDia] = useState([])
  const carouselRef = useRef(null)
  const [mostrarVerTodos, setMostrarVerTodos] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase
        .from('platos')
        .select(`*, resenas ( calificacion )`)
        .eq('disponible', 'S')
      if (!error) setPlatos(data)

      const hoy = new Date().toISOString().split('T')[0]
      const { data: menuData } = await supabase
        .from('menu_dia')
        .select('*, platos ( *, resenas ( calificacion ) )')
        .eq('fecha', hoy)
        .order('orden')
      if (menuData) setMenuDia(menuData.map(m => m.platos))
    }
    init()
  }, [])

useEffect(() => {
  const el = carouselRef.current
  if (!el) return

  const handleScroll = () => {
    const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
    setMostrarVerTodos(alFinal)
  }

  el.addEventListener('scroll', handleScroll)
  return () => el.removeEventListener('scroll', handleScroll)
}, [platos])

  const handleResena = (plato) => {
    if (!user) navigate('/')
    else navigate('/resenas', { state: { id_plato: plato.id_plato, nombre: plato.nombre } })
  }

  const handleVerMenu = () => {
    if (!user) navigate('/login')
    else navigate('/menu')
  }

const scrollRight = () => {
  const el = carouselRef.current
  el.scrollBy({ left: 320, behavior: 'smooth' })
  setTimeout(() => {
    const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 50
    if (alFinal) setMostrarVerTodos(true)
  }, 400)
}

const scrollLeft = () => {
  carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' })
  setMostrarVerTodos(false)
}

  const getPromedio = (resenas) => {
    if (!resenas || resenas.length === 0) return null
    const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0)
    return (suma / resenas.length).toFixed(1)
  }

  const getEstrellas = (promedio) => {
    if (!promedio) return null
    const llenas = Math.floor(promedio)
    const media = promedio % 1 >= 0.5 ? 1 : 0
    const vacias = 5 - llenas - media
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias)
  }

  const renderCard = (plato) => (
    <div key={plato.id_plato} className="card">
      <div style={{ position: 'relative' }}>
        {plato.imagen_url && (
          <img src={plato.imagen_url} alt={plato.nombre} className="card-img" />
        )}
        {plato.etiquetas && (
          <div className="card-badges">
            {plato.etiquetas.split(',').map(tag => {
              const t = tag.trim()
              const cfg = badgeConfig[t]
              if (!cfg) return null
              return (
                <span key={t} className="card-badge" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon} {t}
                </span>
              )
            })}
          </div>
        )}
      </div>
      <h2 className="card-title">{plato.nombre}</h2>
      <p className="card-text">{plato.descripcion}</p>
      <p className="card-precio">${plato.precio?.toLocaleString('es-CL')}</p>
      {(() => {
        const promedio = getPromedio(plato.resenas)
        return promedio ? (
          <div className="card-rating">
            <span className="card-estrellas">{getEstrellas(promedio)}</span>
            <span className="card-promedio">{promedio} ({plato.resenas.length} reseña{plato.resenas.length !== 1 ? 's' : ''})</span>
          </div>
        ) : (
          <p className="card-sin-resenas">Sin reseñas aún</p>
        )
      })()}
      <div className="card-buttons">
        <button className="btn-reservar" onClick={() => navigate('/reservas')}>Reservar</button>
        <button className="btn-info" onClick={() => handleResena(plato)}>Deja tu reseña</button>
      </div>
    </div>
  )

return (
  <div className="page">
    <Navbar />

    <section className="banner">
      <div className="banner-content">
        <h1 className="banner-title">Bienvenido al Casino DUCO</h1>
        <p className="banner-text">Reserva tu almuerzo de forma rápida y sin filas.</p>
        <button className="banner-button" onClick={handleVerMenu}>Ver menú</button>
      </div>
    </section>

    {menuDia.length > 0 && (
      <div className="page-content">
        <div className="menu-dia-section">
          <div className="menu-dia-header">
            <h2 className="menu-dia-title">🍽️ Menú de hoy</h2>
            <p className="menu-dia-fecha">
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="menu-dia-grid">
            {menuDia.map(plato => (
              <div key={plato.id_plato} className="menu-dia-card">
                <div style={{ position: 'relative' }}>
                  {plato.imagen_url && (
                    <img src={plato.imagen_url} alt={plato.nombre} className="menu-dia-img" />
                  )}
                  <span className="menu-dia-badge-hoy">HOY</span>
                  {plato.etiquetas && (
                    <div className="card-badges">
                      {plato.etiquetas.split(',').map(tag => {
                        const t = tag.trim()
                        const cfg = badgeConfig[t]
                        if (!cfg) return null
                        return (
                          <span key={t} className="card-badge" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.icon} {t}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="menu-dia-info">
                  <h3 className="menu-dia-nombre">{plato.nombre}</h3>
                  <p className="menu-dia-desc">{plato.descripcion}</p>
                  {(() => {
                    const promedio = getPromedio(plato.resenas)
                    return promedio ? (
                      <div className="card-rating">
                        <span className="card-estrellas">{getEstrellas(promedio)}</span>
                        <span className="card-promedio">{promedio}</span>
                      </div>
                    ) : null
                  })()}
                  <div className="menu-dia-footer">
                    <p className="menu-dia-precio">${plato.precio?.toLocaleString('es-CL')}</p>
                    <button className="btn-reservar" onClick={() => navigate('/reservas')}>
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

<div className="carousel-wrapper">
  <button className="carousel-btn left" onClick={scrollLeft}>&#8592;</button>
  <div className="carousel" ref={carouselRef}>
    {platos.map(plato => renderCard(plato))}
  </div>
  <button className="carousel-btn right" onClick={scrollRight}>&#8594;</button>
  {mostrarVerTodos && (
    <div className="ver-todos-wrapper">
      <button className="ver-todos-btn" onClick={() => navigate('/menu')}>
        Ver todos los platos →
      </button>
    </div>
  )}
</div>

  </div>
)
}


export default Home