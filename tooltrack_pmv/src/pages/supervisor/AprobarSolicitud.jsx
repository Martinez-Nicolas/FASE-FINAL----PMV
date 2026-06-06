import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getSolicitudById, aprobarSolicitud, rechazarSolicitud } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import { fmtDate } from '../../lib/utils'

export default function AprobarSolicitud() {
  const { params, go, user } = useApp()
  const [sol, setSol] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [showRechazo, setShowRechazo] = useState(false)

  useEffect(() => {
    getSolicitudById(params.solicitudId).then(setSol).finally(() => setLoading(false))
  }, [params.solicitudId])

  async function handleAprobar() {
    setSaving(true)
    try {
      await aprobarSolicitud(sol.id, user.id)
      go('solicitud_aprobada')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleRechazar() {
    if (!motivo.trim()) { setError('Escribe el motivo del rechazo.'); return }
    setSaving(true)
    try {
      await rechazarSolicitud(sol.id, user.id, motivo)
      go('solicitud_rechazada')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <><NavBar /><div className="max-w-2xl mx-auto px-4 py-7"><Spinner /></div></>

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Revisar solicitud"
          backTo={{ screen: 'dashboard_supervisor', label: 'Panel del Supervisor' }} />

        <ErrorAlert msg={error} />

        <div className="card mb-4">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl">🔧</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{sol?.herramientas?.nombre}</div>
              <div className="font-mono text-xs text-stone-400">{sol?.herramientas?.codigo}</div>
            </div>
          </div>
          {[
            ['Solicitante',      sol?.operario?.nombre],
            ['Cuadrilla',        sol?.operario?.cuadrilla || '—'],
            ['Fecha retiro',     fmtDate(sol?.fecha_retiro)],
            ['Fecha devolución', fmtDate(sol?.fecha_devolucion)],
            ['Justificación',    sol?.justificacion],
          ].map(([l, v]) => (
            <div key={l} className="detail-row">
              <span className="text-xs text-stone-400">{l}</span>
              <span className="text-sm font-medium text-right max-w-xs">{v}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <p className="text-sm text-stone-500 mb-4">
            ¿Esta herramienta es necesaria para el frente de trabajo del operario?
          </p>

          {!showRechazo ? (
            <div className="flex gap-3">
              <button className="btn-success flex-1" onClick={handleAprobar} disabled={saving}>
                {saving ? 'Aprobando...' : '✓ Aprobar solicitud'}
              </button>
              <button className="btn-danger flex-1" onClick={() => setShowRechazo(true)}>
                ✗ Rechazar solicitud
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Motivo del rechazo</label>
                <textarea value={motivo} onChange={e => setMotivo(e.target.value)}
                  rows={2} className="form-input resize-none"
                  placeholder="Ej: Herramienta no requerida para la etapa actual de la obra..." />
              </div>
              <div className="flex gap-3">
                <button className="btn-danger flex-1" onClick={handleRechazar} disabled={saving}>
                  {saving ? 'Rechazando...' : 'Confirmar rechazo'}
                </button>
                <button className="btn-secondary" onClick={() => setShowRechazo(false)}>
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
