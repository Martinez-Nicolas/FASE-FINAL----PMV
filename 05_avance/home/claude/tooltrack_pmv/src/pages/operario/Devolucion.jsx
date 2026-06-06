import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { registrarDevolucionConforme } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import ErrorAlert from '../../components/ErrorAlert'

export default function Devolucion() {
  const { params, go } = useApp()
  const [resultado, setResultado] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function confirmarConforme() {
    setSaving(true)
    try {
      await registrarDevolucionConforme(params.solicitudId, params.herramientaId)
      go('cierre_exitoso')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Inspección de retorno"
          backTo={{ screen: 'detalle_operario', label: 'Volver', data: { solicitudId: params.solicitudId } }} />

        <ErrorAlert msg={error} />

        <div className="card">
          <p className="section-title">¿En qué condiciones devuelves la herramienta?</p>

          <div className="flex flex-col gap-3 mb-5">
            <label className={`radio-option ${resultado === 'ok' ? 'border-green-300 bg-green-50' : ''}`}
              onClick={() => setResultado('ok')}>
              <input type="radio" checked={resultado === 'ok'} onChange={() => {}} className="mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-green-700">✓ Conforme — sin daños adicionales</div>
                <div className="text-xs text-stone-400 mt-0.5">La herramienta está en las mismas condiciones (salvo desgaste natural)</div>
              </div>
            </label>

            <label className={`radio-option ${resultado === 'bad' ? 'border-red-300 bg-red-50' : ''}`}
              onClick={() => setResultado('bad')}>
              <input type="radio" checked={resultado === 'bad'} onChange={() => {}} className="mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-700">⚠ Con daños o fallas</div>
                <div className="text-xs text-stone-400 mt-0.5">Presenta daños evidentes o fallas funcionales</div>
              </div>
            </label>
          </div>

          {resultado === 'ok' && (
            <button className="btn-success w-full" onClick={confirmarConforme} disabled={saving}>
              {saving ? 'Registrando...' : 'Confirmar devolución conforme'}
            </button>
          )}
          {resultado === 'bad' && (
            <button className="btn-danger w-full"
              onClick={() => go('reporte_incidencia', { solicitudId: params.solicitudId, herramientaId: params.herramientaId })}>
              Reportar incidencia →
            </button>
          )}
          {!resultado && (
            <button className="btn-primary w-full" disabled>Selecciona una opción</button>
          )}
        </div>
      </div>
    </>
  )
}
