import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [screen, setScreen]   = useState('login')
  const [role,   setRole]     = useState(null)
  const [user,   setUser]     = useState(null)   // usuario seleccionado
  const [params, setParams]   = useState({})
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  function go(newScreen, newParams = {}) {
    setParams(newParams)
    setScreen(newScreen)
    setError(null)
  }

  function login(usuario) {
    setUser(usuario)
    setRole(usuario.rol)
    const dashMap = {
      operario:   'dashboard_operario',
      supervisor: 'dashboard_supervisor',
      bodeguero:  'dashboard_bodeguero',
      mantencion: 'dashboard_mantencion',
    }
    go(dashMap[usuario.rol] || 'login')
  }

  function logout() {
    setUser(null)
    setRole(null)
    setParams({})
    setScreen('login')
  }

  return (
    <AppContext.Provider value={{ screen, role, user, params, loading, error,
                                  go, login, logout, setLoading, setError }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
