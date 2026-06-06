import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getSolicitudById } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { fmtDate } from '../../lib/utils'

export default function DetalleOperario() {
  const { params, go } = useApp()
  const [sol, setSol] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSolicitudById(params.solicitudId)
      .then(setSol).finally(() => setLoading(false))
  }, [params.solicitudId])

  if (loading) return <><NavBar /><div className="max-w-2xl mx-auto px-4 py-7"><Spinner /></div></>
  if (!sol)    return <><NavBar /><div className="max-w-2xl mx-auto px-4 py-7"><p>No encontrada.</p></div></>

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title={sol.herramientas?.nombre}
          backTo={{ screen: 'dashboard_operario', label: 'Mis herramientas' }} />

        {sol.estado === 'atrasada' && (
          <div className="alert bg-red-50 text-red-700 border-red-200">
            ⚠ Devolución atrasada. El Supervisor fue notificado automáticamente.
          </div>
        )}

        <div className="card">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">🔧</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{sol.herramientas?.nombre}</div>
              <div className="font-mono text-xs text-stone-400 mt-0.5">{sol.herramientas?.codigo}</div>
            </div>
            <Badge estado={sol.estado} />
          </div>

          {[
            ['Fecha solicitud',   fmtDate(sol.created_at)],
            ['Fecha de retiro',   fmtDate(sol.fecha_retiro)],
            ['Fecha devolución',  fmtDate(sol.fecha_devolucion)],
            ['Supervisor',        sol.supervisor?.nombre || '—'],
            ['Justificación',     sol.justificacion],
            ['Motivo rechazo',    sol.motivo_rechazo || '—'],
          ].map(([l, v]) => (
            <div key={l} className="detail-row">
              <span className="text-xs text-stone-400">{l}</span>
              <span className="text-sm font-medium text-stone-800 max-w-xs text-right">{v}</span>
            </div>
          ))}
        </div>

        {(sol.estado === 'activa' || sol.estado === 'atrasada') && (
          <button className="btn-success w-full mt-4"
            onClick={() => go('devolucion', { solicitudId: sol.id, herramientaId: sol.herramienta_id })}>
            Devolver herramienta
          </button>
        )}
      </div>
    </>
  )
}
