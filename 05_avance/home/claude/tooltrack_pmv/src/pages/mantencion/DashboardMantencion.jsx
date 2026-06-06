import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getIncidenciasPendientes } from '../../lib/db'
import NavBar from '../../components/NavBar'
import Spinner from '../../components/Spinner'
import { fmtDateShort } from '../../lib/utils'

export default function DashboardMantencion() {
  const { go, user } = useApp()
  const [incidencias, setIncidencias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getIncidenciasPendientes().then(setIncidencias).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Panel de Mantención</h1>
          <p className="text-sm text-stone-400 mt-1">{user.nombre}</p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5">
          <div className="text-xs text-stone-400 mb-1">En inspección técnica</div>
          <div className="text-2xl font-semibold text-amber-700">{incidencias.length}</div>
        </div>

        {incidencias.length > 0 && (
          <div className="alert bg-amber-50 text-amber-700 border-amber-200">
            ⚠ Hay {incidencias.length} herramienta(s) esperando veredicto técnico.
          </div>
        )}

        <p className="section-title">Herramientas en inspección técnica</p>
        <div className="card p-0 overflow-hidden">
          {loading ? <Spinner /> : incidencias.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-sm">No hay incidencias pendientes ✅</div>
          ) : incidencias.map((inc, i) => (
            <button key={inc.id}
              onClick={() => go('veredicto_mantencion', { incidenciaId: inc.id })}
              className="list-item w-full text-left px-5 hover:bg-stone-50 transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${i % 2 === 0 ? 'bg-red-50' : 'bg-amber-50'}`}>
                🔧
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{inc.herramientas?.nombre}</div>
                <div className="text-xs text-stone-400 mt-0.5">
                  {inc.herramientas?.codigo} · {inc.solicitudes?.operario?.nombre || 'Sin operario'} · {fmtDateShort(inc.created_at)}
                </div>
              </div>
              <span className="badge border bg-amber-100 text-amber-800 border-amber-300">En inspección</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
