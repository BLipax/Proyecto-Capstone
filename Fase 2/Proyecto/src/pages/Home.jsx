import foodBanner from '../assets/foodBanner.jpg'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const Home = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])

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

  return (
    <div style={styles.page}>
      <section style={styles.banner}>
        <div style={styles.bannerContent}>
          <h1 style={styles.bannerTitle}>Menú del Día </h1>
          <p style={styles.bannerText}>Lomo saltado con ensalada</p>
          <button style={styles.bannerButton}>Reservar</button>
        </div>
      </section>

      <section style={styles.cardSection}>
        {platos.map((plato) => (
          <div key={plato.id_plato} style={styles.card}>
            {plato.imagen_url && (
              <img src={plato.imagen_url} alt={plato.nombre} style={styles.cardImg} />
            )}
            <h2 style={styles.cardTitle}>{plato.nombre}</h2>
            <p style={styles.cardText}>{plato.descripcion}</p>
            <p style={styles.cardPrecio}>${plato.precio}</p>
            <div style={styles.cardButtons}>
              <button style={styles.btnInfo}>Más info</button>
              <button style={styles.btnReservar} onClick={() => navigate('/reservas')}>
                Reservar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f5f7fb',
    color: '#1f2937',
    fontFamily: 'system-ui, sans-serif',
    padding: '0',
    margin: '0',
  },
  banner: {
    width: '100%',
    padding: '80px 24px',
    background: `linear-gradient(135deg, rgba(37,99,235,0.3) 0%, rgba(79,70,229,0.3) 100%), url(${foodBanner}) center/cover no-repeat`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: '#ffffff',
  },
  bannerContent: {
    maxWidth: '960px',
  },
  bannerTitle: {
    fontSize: '3rem',
    margin: '0 0 16px',
    lineHeight: '1.1',
  },
  bannerText: {
    fontSize: '1.1rem',
    margin: '0 0 24px',
    maxWidth: '680px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  bannerButton: {
    padding: '14px 28px',
    fontSize: '1rem',
    color: '#ffffff',
    backgroundColor: '#0ea5e9',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
  },
  cardSection: {
    width: '100%',
    maxWidth: '1200px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    padding: '48px 24px 80px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '1.5rem',
    margin: '0 0 12px',
    color: '#1f2937',
  },
  cardText: {
    fontSize: '1rem',
    lineHeight: '1.7',
    margin: '0',
  },
  cardButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
},

  cardImg: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '12px',
},
  cardPrecio: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: '8px 0',
},

  btnInfo: {
    flex: 1,
    padding: '10px',
    fontSize: '0.9rem',
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: '2px solid #2563eb',
    borderRadius: '9999px',
    cursor: 'pointer',
},
  btnReservar: {
    flex: 1,
    padding: '10px',
    fontSize: '0.9rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
},


};

export default Home;
