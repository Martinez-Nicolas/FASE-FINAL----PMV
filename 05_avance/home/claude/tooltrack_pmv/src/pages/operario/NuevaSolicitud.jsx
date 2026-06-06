import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getHerramientasDisponibles, crearSolicitud } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Spinner from '../../components/Spinner'
import ErrorAlert from '../../components/ErrorAlert'

export default function NuevaSolicitud() {
  const { go, user } = useApp()
  const [herramientas, setHerramientas] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    herramienta_id: '',
    retiro: '',
    devolucion: '',
    justificacion: '',
  })

  useEffect(() => {
    getHerramientasDisponibles()
      .then(setHerramientas)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit() {
    if (!form.herramienta_id) { setError('Selecciona una herramienta.'); return }
    if (!form.retiro)         { setError('Ingresa la fecha de retiro.'); return }
    if (!form.devolucion)     { setError('Ingresa la fecha de devolución.'); return }
    if (form.devolucion <= form.retiro) {
      setError('⚠ La fecha de devolución no puede ser anterior o igual a la de retiro.')
      return
    }
    if (!form.justificacion.trim()) { setError('Escribe una justificación.'); return }

    setSaving(true)
    try {
      await crearSolicitud({
        operarioId:      user.id,
        herramientaId:   form.herramienta_id,
        justificacion:   form.justificacion,
        fechaRetiro:     form.retiro,
        fechaDevolucion: form.devolucion,
      })
      go('solicitud_enviada')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Nueva solicitud" sub="Solicitar una herramienta de bodega"
          backTo={{ screen: 'dashboard_operario', label: 'Mis herramientas' }} />

        {loading ? <Spinner /> : (
          <div className="card">
            <ErrorAlert msg={error} />

            <div className="mb-4">
              <label className="form-label">Herramienta solicitada</label>
              <select name="herramienta_id" value={form.herramienta_id}
                onChange={handleChange} className="form-input">
                <option value="">Seleccionar herramienta disponible...</option>
                {herramientas.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre} ({h.codigo}) — {h.bodega}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">Fecha y hora de retiro</label>
                <input type="datetime-local" name="retiro" value={form.retiro}
                  onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Fecha y hora de devolución</label>
                <input type="datetime-local" name="devolucion" value={form.devolucion}
                  onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="mb-5">
              <label className="form-label">Justificación</label>
              <textarea name="justificacion" value={form.justificacion}
                onChange={handleChange} rows={3}
                placeholder="Describe la tarea para la cual necesitas la herramienta..."
                className="form-input resize-none" />
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Enviando...' : 'Enviar solicitud'}
              </button>
              <button className="btn-secondary" onClick={() => go('dashboard_operario')}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
