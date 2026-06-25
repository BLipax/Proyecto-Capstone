import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/useAuth'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { user, cargando } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [intentoLogin, setIntentoLogin] = useState(false)

  // Cuando el contexto termina de cargar después del login, navega
  useEffect(() => {
    if (intentoLogin && !cargando && user) {
      navigate('/home')
    }
  }, [intentoLogin, cargando, user])

  // Si ya hay sesión activa, redirige directo
  useEffect(() => {
    if (!cargando && user) {
      navigate('/home')
    }
  }, [cargando, user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Completa todos los campos.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      setIntentoLogin(true)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Casino Duoc UC</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>

        <div className="auth-field">
          <label className="auth-label">Correo institucional</label>
          <input
            className="auth-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@duocuc.cl"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Contraseña</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p className="auth-link">
          ¿No tienes cuenta?{' '}
          <span onClick={() => navigate('/registro')} className="auth-link-btn">
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login