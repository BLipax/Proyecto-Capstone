import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import Navbar from '../components/Navbar'
import './Resenas.css'

const Estrellas = ({ valor, onChange }) => {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((estrella) => (
        <span
          key={estrella}
          onClick={() => onChange(estrella)}
          onMouseEnter={() => setHover(estrella)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: 32,
            cursor: 'pointer',
            color: estrella <= (hover || valor) ? '#f59e0b' : '#e5e7eb',
            transition: 'color 0.15s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

const Resenas = () => {
  const { user } = useAuth()
  const [platos, setPlatos] = useState([])
  const [resenas, setResenas] = useState([])
  const [idUsuario, setIdUsuario] = useState(null)
  const [form, setForm] = useState({ id_plato: '', calificacion: 5, comentario: '' })
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const location = useLocation()


  const fetchPlatos = async () => {
    const { data } = await supabase.from('platos').select('id_plato, nombre')
    if (data) setPlatos(data)
  }

  const fetchResenas = async () => {
    const { data } = await supabase
      .from('resenas')
      .select(`
        id_resena,
        comentario,
        calificacion,
        fecha,
        platos ( nombre ),
        usuarios ( email )
      `)
      .order('fecha', { ascending: false })
    if (data) setResenas(data)
  }


  useEffect(() => {
    const init = async () => {
      await fetchPlatos()
      await fetchResenas()
      if (!user) return
      const { data } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .single()
      if (data) setIdUsuario(data.id_usuario)
              if (location.state?.id_plato) {
        setForm(prev => ({ ...prev, id_plato: String(location.state.id_plato) }))
      }
    }
    init()
  }, [user, location.state])



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.id_plato || !form.comentario.trim()) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un plato y escribe un comentario.' })
      return
    }
    if (!idUsuario) {
      setMensaje({ tipo: 'error', texto: 'Debes iniciar sesión para dejar una reseña.' })
      return
    }
    setLoading(true)
    setMensaje(null)

    const { error } = await supabase.from('resenas').insert([{
      id_usuario: idUsuario,
      id_plato: parseInt(form.id_plato),
      calificacion: parseInt(form.calificacion),
      comentario: form.comentario.trim(),
      fecha: new Date().toISOString(),
    }])

    setLoading(false)
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al enviar la reseña.' })
    } else {
      setMensaje({ tipo: 'exito', texto: '¡Reseña enviada correctamente!' })
      setForm({ id_plato: '', calificacion: 5, comentario: '' })
      fetchResenas()
    }
  }

  const estrellas = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div className="resenas-page">
      <Navbar />
      <div className="resenas-container">

        <div className="resenas-form-card">
          <h2 className="resenas-title">Dejar una reseña</h2>

          <div className="resenas-field">
            <label className="resenas-label">Plato</label>
            <select className="resenas-input" name="id_plato" value={form.id_plato} onChange={handleChange}>
              <option value="">Selecciona un plato</option>
              {platos.map(p => (
                <option key={p.id_plato} value={p.id_plato}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="resenas-field">
            <label className="resenas-label">Calificación</label>
            <Estrellas
              valor={form.calificacion}
              onChange={(val) => setForm({ ...form, calificacion: val })}
            />
          </div>

          <div className="resenas-field">
            <label className="resenas-label">Comentario</label>
            <textarea
              className="resenas-textarea"
              name="comentario"
              value={form.comentario}
              onChange={handleChange}
              placeholder="Escribe tu opinión aquí..."
              rows={4}
            />
          </div>

          {mensaje && (
            <p className={mensaje.tipo === 'exito' ? 'resenas-exito' : 'resenas-error'}>
              {mensaje.texto}
            </p>
          )}

          <button className="resenas-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar reseña'}
          </button>
        </div>

        <div className="resenas-lista">
          <h2 className="resenas-title">Reseñas de la comunidad</h2>
          {resenas.length === 0 ? (
            <p className="resenas-empty">No hay reseñas aún. ¡Sé el primero!</p>
          ) : (
            resenas.map(r => (
              <div key={r.id_resena} className="resena-card">
                <div className="resena-header">
                  <div>
                    <p className="resena-plato">{r.platos?.nombre}</p>
                    <p className="resena-usuario">{r.usuarios?.email?.split('@')[0]}</p>
                  </div>
                  <span className="resena-estrellas">{estrellas(r.calificacion)}</span>
                </div>
                <p className="resena-comentario">{r.comentario}</p>
                <p className="resena-fecha">{new Date(r.fecha).toLocaleDateString('es-CL')}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default Resenas