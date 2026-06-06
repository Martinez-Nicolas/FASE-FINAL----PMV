import React from 'react'
import { useApp } from '../context/AppContext'

const ROLE_STYLE = {
  operario:   'bg-blue-100 text-blue-800 border-blue-300',
  supervisor: 'bg-amber-100 text-amber-800 border-amber-300',
  bodeguero:  'bg-green-100 text-green-800 border-green-300',
  mantencion: 'bg-stone-100 text-stone-600 border-stone-300',
}

const ROLE_LABEL = {
  operario:   'Operario de Terreno',
  supervisor: 'Supervisor de Cuadrilla',
  bodeguero:  'Bodeguero de Obra',
  mantencion: 'Enc. Mantención',
}

export default function NavBar() {
  const { role, user, logout } = useApp()
  if (!role) return null
  return (
    <nav className="bg-white border-b border-stone-200 px-6 h-12 flex items-center gap-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight">
        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
        ToolTrack
      </div>
      {user && <span className="text-xs text-stone-400 hidden sm:block">· {user.nombre}</span>}
      <div className="ml-auto flex items-center gap-3">
        <span className={`badge border ${ROLE_STYLE[role]} text-xs`}>{ROLE_LABEL[role]}</span>
        <button onClick={logout}
          className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-100 transition-colors">
          Salir →
        </button>
      </div>
    </nav>
  )
}
