import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getSolicitudesPendientesAprobacion, getSolicitudesActivasParaSupervisor } from '../../lib/db'
import NavBar from '../../components/NavBar'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { fmtDateShort } from '../../lib/utils'

export default function DashboardSupervisor() {
  const { go, user } = useApp()
  const [pendientes, setPendientes] = useState([])
  const [activas, setActivas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getSolicitudesPendientesAprobacion(),
      getSolicitudesActivasParaSupervisor(),
    ]).then(([p, a]) => { setPendientes(p); setActivas(a) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Panel del Supervisor</h1>
          <p className="text-sm text-stone-400 mt-1">{user.nombre}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Pendientes de aprobación', value: pendientes.length, color: 'text-amber-700' },
            { label: 'Herramientas activas',     value: activas.length,    color: 'text-blue-700'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-400 mb-1">{label}</div>
              <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {pendientes.length > 0 && (
          <div className="alert bg-amber-50 text-amber-700 border-amber-200">
            ⚠ Tienes {pendientes.length} solicitud(es) esperando tu revisión.
          </div>
        )}

        <p className="section-title">Solicitudes pendientes de aprobación</p>
        <div className="card p-0 overflow-hidden mb-5">
          {loading ? <Spinner /> : pendientes.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-sm">No hay solicitudes pendientes ✅</div>
          ) : pendientes.map(s => (
            <button key={s.id}
              onClick={() => go('aprobar_solicitud', { solicitudId: s.id })}
              className="list-item w-full text-left px-5 hover:bg-stone-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">🔧</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.herramientas?.nombre}</div>
                <div className="text-xs text-stone-400 mt-0.5">{s.operario?.nombre} · Dev: {fmtDateShort(s.fecha_devolucion)}</div>
              </div>
              <span className="text-stone-300">›</span>
            </button>
          ))}
        </div>

        <p className="section-title">Herramientas en faena</p>
        <div className="card p-0 overflow-hidden">
          {activas.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">No hay herramientas activas</div>
          ) : activas.map(s => (
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
      </div>
    </>
  )
}
