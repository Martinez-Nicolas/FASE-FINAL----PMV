import React from 'react'
import { useApp } from '../context/AppContext'

export default function SuccessScreen({ icon, title, sub, backLabel = 'Volver', backScreen, backData = {}, bg = 'bg-green-50', border = 'border-green-200' }) {
  const { go } = useApp()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className={`w-16 h-16 rounded-full ${bg} border-2 ${border} flex items-center justify-center text-3xl mb-5`}>
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-stone-900 mb-2">{title}</h2>
      <p className="text-sm text-stone-400 max-w-xs leading-relaxed">{sub}</p>
      {backScreen && (
        <button className="btn-primary mt-6" onClick={() => go(backScreen, backData)}>
          {backLabel}
        </button>
      )}
    </div>
  )
}
