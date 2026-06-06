import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getSolicitudesByOperario, checkYMarcarAtrasadas } from '../../lib/db'
import NavBar from '../../components/NavBar'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { fmtDateShort } from '../../lib/utils'

export default function DashboardOperario() {
  const { go, user } = useApp()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        await checkYMarcarAtrasadas()
        const data = await getSolicitudesByOperario(user.id)
        setSolicitudes(data)
      } catch (e) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const activas   = solicitudes.filter(s => s.estado === 'activa').length
  const atrasadas = solicitudes.filter(s => s.estado === 'atrasada').length

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Mis herramientas</h1>
          <p className="text-sm text-stone-400 mt-1">{user.nombre} — {user.cuadrilla}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'En custodia', value: activas,   color: 'text-blue-700' },
            { label: 'Atrasadas',   value: atrasadas, color: 'text-red-700'  },
            { label: 'Total',       value: solicitudes.length, color: 'text-stone-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-400 mb-1">{label}</div>
              <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {atrasadas > 0 && (
          <div className="alert bg-red-50 text-red-700 border-red-200">
            ⚠ Tienes {atrasadas} herramienta(s) con devolución atrasada. El Supervisor fue notificado.
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0">Historial de solicitudes</p>
          <button className="btn-primary text-xs px-3 py-1.5" onClick={() => go('nueva_solicitud')}>
            + Nueva solicitud
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <Spinner /> : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : solicitudes.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-sm">No tienes solicitudes aún</div>
          ) : solicitudes.map(s => (
            <button key={s.id}
              onClick={() => go('detalle_operario', { solicitudId: s.id })}
              className="list-item w-full text-left px-5 hover:bg-stone-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">🔧</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.herramientas?.nombre}</div>
                <div className="text-xs text-stone-400 mt-0.5">Dev: {fmtDateShort(s.fecha_devolucion)}</div>
              </div>
              <Badge estado={s.estado} />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
