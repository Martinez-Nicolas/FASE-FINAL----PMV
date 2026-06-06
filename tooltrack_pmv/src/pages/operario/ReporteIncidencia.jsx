import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { registrarIncidencia } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import ErrorAlert from '../../components/ErrorAlert'

export default function ReporteIncidencia() {
  const { params, go } = useApp()
  const [form, setForm] = useState({ descripcion: '', tipo_dano: 'Daño mecánico evidente' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!form.descripcion.trim()) { setError('Describe el daño detectado.'); return }
    setSaving(true)
    try {
      await registrarIncidencia({
        solicitudId:   params.solicitudId,
        herramientaId: params.herramientaId,
        descripcion:   form.descripcion,
        tipoDano:      form.tipo_dano,
      })
      go('incidencia_creada')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Reporte de incidencia"
          backTo={{ screen: 'devolucion', label: 'Volver', data: { solicitudId: params.solicitudId, herramientaId: params.herramientaId } }} />

        <div className="alert bg-red-50 text-red-700 border-red-200">
          ⚠ El préstamo <strong>NO se cerrará</strong>. La custodia permanece activa hasta el veredicto del Encargado de Mantención.
        </div>

        <div className="card">
          <ErrorAlert msg={error} />

          <div className="mb-4">
            <label className="form-label">Descripción del daño</label>
            <textarea value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3} className="form-input resize-none"
              placeholder="Describe detalladamente el daño o falla encontrada..." />
          </div>

          <div className="mb-4">
            <label className="form-label">Tipo de daño</label>
            <select value={form.tipo_dano}
              onChange={e => setForm(f => ({ ...f, tipo_dano: e.target.value }))}
              className="form-input">
              <option>Daño mecánico evidente</option>
              <option>Falla eléctrica</option>
              <option>Pérdida de componente</option>
              <option>Otro</option>
            </select>
          </div>

          <div className="alert bg-amber-50 text-amber-700 border-amber-200">
            ℹ La herramienta pasará a estado <strong>En Inspección Técnica</strong>.
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn-danger flex-1" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Enviando...' : 'Confirmar y crear ticket'}
            </button>
            <button className="btn-secondary" onClick={() => go('devolucion', { solicitudId: params.solicitudId, herramientaId: params.herramientaId })}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
