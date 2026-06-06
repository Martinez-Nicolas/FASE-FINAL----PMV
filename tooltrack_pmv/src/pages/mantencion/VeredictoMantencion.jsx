import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getIncidenciasPendientes, emitirVeredicto } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

const OPCIONES = [
  { value: 'reparar',  icon: '🔧', label: 'Reparable',                sub: 'La herramienta puede repararse → En Mantención',         color: 'text-green-700',  border: 'border-green-300 bg-green-50'  },
  { value: 'desgaste', icon: '✓',  label: 'Desgaste natural',         sub: 'Sin responsabilidad del operario → vuelve a Disponible', color: 'text-blue-700',   border: 'border-blue-300 bg-blue-50'    },
  { value: 'baja',     icon: '💀', label: 'Pérdida total — Dado de Baja', sub: 'Daño irreparable → Dado de Baja, costo imputado',    color: 'text-red-700',    border: 'border-red-300 bg-red-50'      },
]

export default function VeredictoMantencion() {
  const { params, go } = useApp()
  const [inc, setInc]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [veredicto, setVeredicto] = useState(null)
  const [diagnostico, setDiagnostico] = useState('')
  const [error, setError]       = useState(null)

  useEffect(() => {
    getIncidenciasPendientes()
      .then(data => setInc(data.find(i => i.id === params.incidenciaId) || data[0]))
      .finally(() => setLoading(false))
  }, [params.incidenciaId])

  async function handleConfirmar() {
    if (!veredicto) { setError('Selecciona un veredicto.'); return }
    setSaving(true)
    try {
      await emitirVeredicto(
        inc.id,
        inc.herramienta_id,
        inc.solicitud_id,
        veredicto,
        diagnostico,
      )
      go('veredicto_emitido', { veredicto })
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <><NavBar /><div className="max-w-2xl mx-auto px-4 py-7"><Spinner /></div></>

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Emitir veredicto técnico"
          backTo={{ screen: 'dashboard_mantencion', label: 'Panel de Mantención' }} />

        <ErrorAlert msg={error} />

        <div className="card">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-xl">🔧</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{inc?.herramientas?.nombre}</div>
              <div className="font-mono text-xs text-stone-400">{inc?.herramientas?.codigo}</div>
            </div>
          </div>

          {[
            ['Daño reportado',     inc?.descripcion],
            ['Tipo de daño',       inc?.tipo_dano],
            ['Operario vinculado', inc?.solicitudes?.operario?.nombre || '—'],
          ].map(([l, v]) => (
            <div key={l} className="detail-row">
              <span className="text-xs text-stone-400">{l}</span>
              <span className="text-sm font-medium text-right max-w-xs">{v}</span>
            </div>
          ))}

          <div className="border-t border-stone-100 my-4" />

          <div className="mb-4">
            <label className="form-label">Diagnóstico técnico</label>
            <textarea value={diagnostico} onChange={e => setDiagnostico(e.target.value)}
              rows={2} className="form-input resize-none"
              placeholder="Describe el diagnóstico técnico del daño..." />
          </div>

          <p className="section-title">Veredicto</p>
          <div className="flex flex-col gap-3 mb-5">
            {OPCIONES.map(op => (
              <label key={op.value}
                className={`radio-option ${veredicto === op.value ? op.border : ''}`}
                onClick={() => setVeredicto(op.value)}>
                <input type="radio" checked={veredicto === op.value} onChange={() => {}} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className={`text-sm font-medium ${op.color}`}>{op.icon} {op.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{op.sub}</div>
                </div>
              </label>
            ))}
          </div>

          <button className="btn-primary w-full" onClick={handleConfirmar} disabled={!veredicto || saving}>
            {saving ? 'Guardando...' : 'Confirmar veredicto'}
          </button>
        </div>
      </div>
    </>
  )
}
