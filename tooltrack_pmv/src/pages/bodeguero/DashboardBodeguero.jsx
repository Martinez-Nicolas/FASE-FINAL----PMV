import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getSolicitudesPendientesEntrega, getSolicitudesActivasParaBodeguero, checkYAnularAbandonadas } from '../../lib/db'
import NavBar from '../../components/NavBar'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { fmtDateShort } from '../../lib/utils'

export default function DashboardBodeguero() {
  const { go, user } = useApp()
  const [tab, setTab] = useState(0)
  const [entregas, setEntregas] = useState([])
  const [recepciones, setRecepciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkYAnularAbandonadas(4).then(() => {
      Promise.all([
        getSolicitudesPendientesEntrega(),
        getSolicitudesActivasParaBodeguero(),
      ]).then(([e, r]) => { setEntregas(e); setRecepciones(r) })
        .finally(() => setLoading(false))
    })
  }, [])

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Panel del Bodeguero</h1>
          <p className="text-sm text-stone-400 mt-1">{user.nombre}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Entregas pendientes',    value: entregas.length,    color: 'text-amber-700' },
            { label: 'Recepciones pendientes', value: recepciones.length, color: 'text-blue-700'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-400 mb-1">{label}</div>
              <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="flex border-b border-stone-200 mb-5">
          {[`Entregas (${entregas.length})`, `Recepciones (${recepciones.length})`].map((t, i) => (
            <button key={i} onClick={() => setTab(i)} className={`tab ${tab === i ? 'tab-active' : ''}`}>{t}</button>
          ))}
        </div>

        {loading ? <Spinner /> : tab === 0 ? (
          <div className="card p-0 overflow-hidden">
            {entregas.length === 0 ? (
              <div className="py-10 text-center text-stone-400 text-sm">No hay entregas pendientes 📦</div>
            ) : entregas.map(s => (
              <button key={s.id}
                onClick={() => go('entregar', { solicitudId: s.id })}
                className="list-item w-full text-left px-5 hover:bg-stone-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">📦</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.herramientas?.nombre}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{s.operario?.nombre} · Dev: {fmtDateShort(s.fecha_devolucion)}</div>
                </div>
                <span className="badge border bg-amber-100 text-amber-800 border-amber-300 text-xs">Entregar</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            {recepciones.length === 0 ? (
              <div className="py-10 text-center text-stone-400 text-sm">No hay herramientas en faena</div>
            ) : recepciones.map(s => (
              <div key={s.id} className="list-item px-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">🔧</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.herramientas?.nombre}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{s.operario?.nombre} · Dev: {fmtDateShort(s.fecha_devolucion)}</div>
                </div>
                <Badge estado={s.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
