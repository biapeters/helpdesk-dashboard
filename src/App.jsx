import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import MainPanel from './components/MainPanel'

export default function App() {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchPerfil(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) fetchPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchPerfil(uid) {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', uid)
        .single()

      if (error) throw error
      
      if (data) setPerfil(data)
    } catch (erro) {
      console.error("Erro ao buscar perfil:", erro)
      setPerfil(null) 
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (!session || !perfil) return <LoginScreen />
  return <MainPanel session={session} perfil={perfil} isAdmin={perfil.funcao === 'admin'} />
}