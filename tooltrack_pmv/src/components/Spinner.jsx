import React from 'react'

export default function Spinner({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400">
      <div className="w-8 h-8 border-2 border-stone-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
