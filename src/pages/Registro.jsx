import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import './Login.css'

const Registro = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegistro = async () => {
    if (!form.email || !form.password || !form.confirmar) {
      setError('Completa todos los campos.')
      return
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!form.email.endsWith('@duocuc.cl')) {
      setError('El correo debe ser institucional (@duocuc.cl).')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (error) {
      setError('Error al registrarse: ' + error.message)
    } else {
      setExito(true)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Casino Duoc UC</h1>
        <p className="auth-subtitle">Crea tu cuenta institucional</p>

        {exito ? (
          <div>
            <p className="auth-exito">¡Cuenta creada! Revisa tu correo para confirmar.</p>
            <button className="auth-btn" onClick={() => navigate('/login')}>
              Ir al login
            </button>
          </div>
        ) : (
          <>
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

            <div className="auth-field">
              <label className="auth-label">Confirmar contraseña</label>
              <input
                className="auth-input"
                type="password"
                name="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-btn" onClick={handleRegistro} disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <p className="auth-link">
              ¿Ya tienes cuenta?{' '}
              <span onClick={() => navigate('/')} className="auth-link-btn">
                Inicia sesión
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Registro