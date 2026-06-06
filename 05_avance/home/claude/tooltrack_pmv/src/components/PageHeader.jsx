import React from 'react'
import { useApp } from '../context/AppContext'

export default function PageHeader({ title, sub, backTo }) {
  const { go } = useApp()
  return (
    <div className="mb-6">
      {backTo && (
        <button onClick={() => go(backTo.screen, backTo.data || {})}
          className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-3 transition-colors">
          ← {backTo.label || 'Volver'}
        </button>
      )}
      <h1 className="text-xl font-semibold tracking-tight text-stone-900">{title}</h1>
      {sub && <p className="text-sm text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}
