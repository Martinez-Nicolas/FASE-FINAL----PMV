import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getSolicitudById, confirmarEntrega } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'
import { fmtDate } from '../../lib/utils'

export default function Entregar() {
  const { params, go, user } = useApp()
  const [sol, setSol] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [estadoVisual, setEstadoVisual] = useState('bueno')
  const [obs, setObs] = useState('')

  useEffect(() => {
    getSolicitudById(params.solicitudId).then(setSol).finally(() => setLoading(false))
  }, [params.solicitudId])

  async function handleConfirmar() {
    setSaving(true)
    try {
      await confirmarEntrega(sol.id, user.id, estadoVisual, obs)
      go('entrega_confirmada')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <><NavBar /><div className="max-w-2xl mx-auto px-4 py-7"><Spinner /></div></>

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Confirmar entrega" sub="Inspección pre-entrega y traspaso de custodia"
          backTo={{ screen: 'dashboard_bodeguero', label: 'Panel del Bodeguero' }} />

        <ErrorAlert msg={error} />

        <div className="card">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">🔧</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{sol?.herramientas?.nombre}</div>
              <div className="font-mono text-xs text-stone-400">{sol?.herramientas?.codigo} · {sol?.herramientas?.bodega}</div>
            </div>
            <span className="badge border bg-green-100 text-green-800 border-green-300">Disponible</span>
          </div>

          <p className="section-title">Destinatario</p>
          {[
            ['Operario',          sol?.operario?.nombre],
            ['Cuadrilla',         sol?.operario?.cuadrilla || '—'],
            ['Dev. comprometida', fmtDate(sol?.fecha_devolucion)],
          ].map(([l, v]) => (
            <div key={l} className="detail-row">
              <span className="text-xs text-stone-400">{l}</span>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}

          <div className="border-t border-stone-100 my-4" />
          <p className="section-title">Inspección pre-entrega</p>

          <div className="mb-4">
            <label className="form-label">Estado visual</label>
            <select value={estadoVisual} onChange={e => setEstadoVisual(e.target.value)} className="form-input">
              <option value="bueno">Sin daños visibles — en condiciones óptimas</option>
              <option value="desgaste">Desgaste leve por uso normal</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Observaciones (opcional)</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)}
              rows={2} className="form-input resize-none"
              placeholder="Registrar cualquier condición especial..." />
          </div>

          <div className="alert bg-blue-50 text-blue-700 border-blue-200">
            ℹ Al confirmar, el operario asume custodia del activo. Estado: <strong>Activa / En Custodia</strong>.
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn-success flex-1" onClick={handleConfirmar} disabled={saving}>
              {saving ? 'Confirmando...' : '✓ Confirmar entrega'}
            </button>
            <button className="btn-secondary" onClick={() => go('dashboard_bodeguero')}>Cancelar</button>
          </div>
        </div>
      </div>
    </>
  )
}
