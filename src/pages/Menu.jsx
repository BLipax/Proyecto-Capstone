import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import Navbar from '../components/Navbar'
import './Menu.css'

const Menu = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatos = async () => {
      const { data, error } = await supabase
        .from('platos')
        .select('*')
        .eq('disponible', 'S')
        .order('nombre')

      console.log(data)
      console.log(error)

      if (data) {
        setPlatos(data)
      }

      setLoading(false)
    }

    fetchPlatos()
  }, [])

  return (
    <div className="menu-page">
      <Navbar />

      <section className="menu-banner">
        <div className="menu-banner-content">
          <h1 className="menu-title">Nuestro Menú</h1>
          <p className="menu-subtitle">
            Explora los platos disponibles y reserva tu almuerzo fácilmente.
          </p>
        </div>
      </section>

      <div className="menu-container">
        {loading ? (
          <p className="menu-loading">Cargando menú...</p>
        ) : platos.length === 0 ? (
          <p className="menu-empty">No hay platos disponibles.</p>
        ) : (
          <div className="menu-grid">
            {platos.map((plato) => (
              <div key={plato.id_plato} className="menu-card">
                {plato.imagen_url && (
                  <img
                    src={plato.imagen_url}
                    alt={plato.nombre}
                    className="menu-card-img"
                  />
                )}

                <div className="menu-card-content">
                  <div>
                    <h2 className="menu-card-title">{plato.nombre}</h2>

                    {plato.categoria && (
                      <p className="menu-card-category">
                        {plato.categoria}
                      </p>
                    )}

                    <p className="menu-card-text">
                      {plato.descripcion}
                    </p>
                  </div>

                  <div className="menu-card-footer">
                    <p className="menu-card-price">
                      ${plato.precio}
                    </p>

                    <button
                      className="menu-btn"
                      onClick={() => navigate('/reservas')}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu

