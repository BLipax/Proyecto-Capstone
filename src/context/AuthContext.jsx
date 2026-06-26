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
    console.log('fetchRol start')
    const { data, error } = await Promise.race([
      supabase
        .from('usuarios')
        .select('id_rol')
        .eq('auth_id', authUser.id)
        .single(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      )
    ])
    console.log('fetchRol data:', data)
    if (data) setRol(data.id_rol)
  } catch (e) {
    console.error('fetchRol error:', e)
  } finally {
    setCargando(false)
  }
}

  useEffect(() => {
    // Timeout de seguridad — si no responde en 3s, desbloquea
  
  console.log('AuthContext montado')
  const timeout = setTimeout(() => {
    console.log('timeout disparado')
    setCargando(false)
  }, 8000)

    const { data: listener } = supabase.auth.onAuthStateChange(async (_e, session) => {
       console.log('onAuthStateChange:', _e, session?.user?.email)
      clearTimeout(timeout)

        if (_e === 'SIGNED_OUT') {
          setUser(null)
          setRol(null)
          setCargando(false)
          window.location.href = '/'
          return
        }
      try {
        if (_e === 'SIGNED_OUT' || _e === 'TOKEN_REFRESHED') {
      if (!session) {
        setUser(null)
        setRol(null)
        setCargando(false)
        return
      }
    }
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