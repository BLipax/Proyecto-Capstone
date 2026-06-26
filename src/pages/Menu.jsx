import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import Navbar from '../components/Navbar'
import './Menu.css'

const Menu = () => {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEtiqueta, setFiltroEtiqueta] = useState('')
  const [categorias, setCategorias] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [badgeConfig, setBadgeConfig] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const { data: platosData } = await supabase
        .from('platos')
        .select('*, resenas(calificacion)')
        .eq('disponible', 'S')
        .order('nombre')

      if (platosData) {
        setPlatos(platosData)
        const cats = [...new Set(platosData.map(p => p.categoria).filter(Boolean))]
        setCategorias(cats)
      }

      const { data: etiquetasData } = await supabase.from('etiquetas').select('*')
      if (etiquetasData) {
        setEtiquetas(etiquetasData)
        const config = {}
        etiquetasData.forEach(e => {
          config[e.nombre] = { bg: e.color_bg, color: e.color_text, icon: e.icono }
        })
        setBadgeConfig(config)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const platosFiltrados = platos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === '' || p.categoria === filtroCategoria
    const coincideEtiqueta = filtroEtiqueta === '' ||
      p.etiquetas?.split(',').map(e => e.trim()).includes(filtroEtiqueta)
    return coincideBusqueda && coincideCategoria && coincideEtiqueta
  })

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroCategoria('')
    setFiltroEtiqueta('')
  }

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

        {/* Filtros */}
        <div className="menu-filtros">
          <input
            className="menu-buscador"
            type="text"
            placeholder="Buscar plato..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="menu-select"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="menu-select"
            value={filtroEtiqueta}
            onChange={(e) => setFiltroEtiqueta(e.target.value)}
          >
            <option value="">Todas las etiquetas</option>
            {etiquetas.map(e => (
              <option key={e.nombre} value={e.nombre}>{e.icono} {e.nombre}</option>
            ))}
          </select>
          {(busqueda || filtroCategoria || filtroEtiqueta) && (
            <button className="menu-btn-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>

        <p className="menu-resultados">
          {platosFiltrados.length} plato{platosFiltrados.length !== 1 ? 's' : ''} encontrado{platosFiltrados.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <p className="menu-loading">Cargando menú...</p>
        ) : platosFiltrados.length === 0 ? (
          <p className="menu-empty">No hay platos que coincidan con tu búsqueda.</p>
        ) : (
          <div className="menu-grid">
            {platosFiltrados.map((plato) => (
              <div key={plato.id_plato} className="menu-card">
                <div style={{ position: 'relative' }}>
                  {plato.imagen_url && (
                    <img src={plato.imagen_url} alt={plato.nombre} className="menu-card-img" />
                  )}
                  {plato.etiquetas && (
                    <div className="menu-card-badges">
                      {plato.etiquetas.split(',').map(tag => {
                        const t = tag.trim()
                        const cfg = badgeConfig[t]
                        if (!cfg) return null
                        return (
                          <span key={t} className="menu-card-badge" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.icon} {t}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="menu-card-content">
                  <div>
                    <h2 className="menu-card-title">{plato.nombre}</h2>
                    {plato.categoria && (
                      <p className="menu-card-category">{plato.categoria}</p>
                    )}
                    <p className="menu-card-text">{plato.descripcion}</p>
                  </div>
                  <div className="menu-card-footer">
                    <p className="menu-card-price">${plato.precio?.toLocaleString('es-CL')}</p>
                    <button className="menu-btn" onClick={() => navigate('/reservas', { state: { plato } })}>
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