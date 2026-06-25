import { createContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [cargando, setCargando] = useState(true)

  const fetchRol = async (authUser) => {
    if (!authUser) { setRol(null); return }
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('id_rol')
        .eq('auth_id', authUser.id)
        .single()
      if (data) setRol(data.id_rol)
    } catch (e) {
      console.error('fetchRol error:', e)
    }
  }

  useEffect(() => {
    // Timeout de seguridad — si no responde en 3s, desbloquea
    const timeout = setTimeout(() => setCargando(false), 3000)

    const { data: listener } = supabase.auth.onAuthStateChange(async (_e, session) => {
      clearTimeout(timeout)
      try {
        setUser(session?.user ?? null)
        await fetchRol(session?.user ?? null)
      } catch (e) {
        console.error('onAuthStateChange error:', e)
      } finally {
        setCargando(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, rol, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }