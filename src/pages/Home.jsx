import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import '../assets/foodBanner.jpg'
import './Home.css'
import Navbar from '../components/Navbar'

const Home = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])
  const carouselRef = useRef(null)

  useEffect(() => {
    async function fetchPlatos() {
      const { data, error } = await supabase
        .from('platos')
        .select('*')
        .eq('disponible', 'S')
      if (!error) setPlatos(data)
    }
    fetchPlatos()
  }, [])

   const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' })
  }
    
  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' })
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
              {plato.imagen_url && (
                <img src={plato.imagen_url} alt={plato.nombre} className="card-img" />
              )}
              <h2 className="card-title">{plato.nombre}</h2>
              <p className="card-text">{plato.descripcion}</p>
              <p className="card-precio">${plato.precio}</p>
              <div className="card-buttons">
                <button className="btn-info">Más info</button>
                <button className="btn-reservar" onClick={() => navigate('/reservas')}>Reservar</button>
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