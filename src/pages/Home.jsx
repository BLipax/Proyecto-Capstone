import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import './Home.css'
import Navbar from '../components/Navbar'

const Home = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])
  const carouselRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchPlatos() {
      const { data, error } = await supabase
        .from('platos')
        .select(`*,
      resenas ( calificacion )
    `)
        .eq('disponible', 'S')
      if (!error) setPlatos(data)
    }
    fetchPlatos()
  }, [])

const handleResena = (plato) => {
  if (!user) {
    navigate('/')
  } else {
    navigate('/resenas', { state: { id_plato: plato.id_plato, nombre: plato.nombre } })
  }
}
const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' })
  }
    
const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' })
  }

const badgeConfig = {
  'vegano':       { bg: '#EAF3DE', color: '#27500A', icon: '🌱' },
  'vegetariano':  { bg: '#E1F5EE', color: '#085041', icon: '🥦' },
  'sin gluten':   { bg: '#E6F1FB', color: '#0C447C', icon: '🌾' },
  'picante':      { bg: '#FAEEDA', color: '#633806', icon: '🌶️' },
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


 return (
    <div className="page">
      <Navbar />
      <section className="banner">
        <div className="banner-content">
          <h1 className="banner-title">Bienvenido al Casino DUCO</h1>
          <p className="banner-text">Reserva tu almuerzo de forma rápida y sin filas.</p>
          <button className="banner-button">Ver menú</button>
        </div>
      </section>

      <div className="carousel-wrapper">
        <button className="carousel-btn left" onClick={scrollLeft}>&#8592;</button>
        <div className="carousel" ref={carouselRef}>
          {platos.map((plato) => (
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
                          {t}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <h2 className="card-title">{plato.nombre}</h2>
              <p className="card-text">{plato.descripcion}</p>
              <p className="card-precio">${plato.precio}</p>
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
          ))}
        </div>
        <button className="carousel-btn right" onClick={scrollRight}>&#8594;</button>
      </div>
    </div>
  )
}

export default Home