import { createContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)

  const fetchRol = async (authUser) => {
    if (!authUser) { setRol(null); return }
    const { data } = await supabase
      .from('usuarios')
      .select('id_rol')
      .eq('auth_id', authUser.id)
      .single()
    if (data) setRol(data.id_rol)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      fetchRol(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      fetchRol(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, rol }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }