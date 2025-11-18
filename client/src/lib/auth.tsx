import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

type AuthContextValue = {
  userId: string | null
  ready: boolean
}

const AuthContext = createContext<AuthContextValue>({ userId: null, ready: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState<boolean>(true)

  useEffect(() => {
    if (!supabase) {
      setReady(true)
      return
    }
    setReady(false)
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null)
      setReady(true)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription?.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ userId, ready }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}