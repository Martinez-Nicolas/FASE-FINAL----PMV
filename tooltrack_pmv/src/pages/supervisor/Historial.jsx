import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getHistorialCompleto, getEstadisticasSupervisor, getAllUsuarios, getHerramientas } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { fmtDate, fmtDateShort } from '../../lib/utils'

export default function Historial() {
  const { go } = useApp()
  const [registros, setRegistros] = useState([])
  const [stats, setStats] = useState(null)
  const [operarios, setOperarios] = useState([])
  const [herramientas, setHerramientas] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState(null)

  const [filtros, setFiltros] = useState({ operarioId: '', herramientaId: '', estado: '' })

  async function cargar() {
    setLoading(true)
    try {
      const [hist, est, usrs, herrs] = await Promise.all([
        getHistorialCompleto({
          operarioId: filtros.operarioId || undefined,
          herramientaId: filtros.herramientaId || undefined,
          estado: filtros.estado || undefined,
        }),
        getEstadisticasSupervisor(),
        getAllUsuarios(),
        getHerramientas(),
      ])
      setRegistros(hist)
      setStats(est)
      setOperarios(usrs.filter(u => u.rol === 'operario'))
      setHerramientas(herrs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtros])

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Historial y Trazabilidad"
          sub="Registro completo de préstamos del sistema"
          backTo={{ screen: 'dashboard_supervisor', label: 'Panel del Supervisor' }} />

        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Total',       value: stats.total,       color: 'text-stone-700' },
              { label: 'Cerradas',    value: stats.cerradas,    color: 'text-green-700' },
              { label: 'Incidencias', value: stats.incidencias, color: 'text-red-700'   },
              { label: 'Atrasos',     value: stats.atrasos,     color: 'text-amber-700' },
            ].map(s => (
              <div key={s.label} className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                <div className="text-[10px] text-stone-400 mb-1">{s.label}</div>
                <div className={`text-lg font-semibold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Ranking de atrasos */}
        {stats && Object.keys(stats.porOperario).length > 0 && (
          <div className="card mb-5">
            <p className="section-title">Trazabilidad por operario</p>
            {Object.entries(stats.porOperario)
              .sort((a, b) => b[1].atrasos - a[1].atrasos)
              .map(([nombre, d]) => (
                <div key={nombre} className="detail-row">
                  <span className="text-sm text-stone-700">{nombre}</span>
                  <span className="text-xs text-stone-400">
                    {d.total} préstamos
                    {d.atrasos > 0 && <span className="text-red-600 font-medium"> · {d.atrasos} atraso(s)</span>}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-5">
          <p className="section-title">Filtros</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="form-label">Operario</label>
              <select value={filtros.operarioId}
                onChange={e => setFiltros(f => ({ ...f, operarioId: e.target.value }))}
                className="form-input text-xs">
                <option value="">Todos</option>
                {operarios.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Herramienta</label>
              <select value={filtros.herramientaId}
                onChange={e => setFiltros(f => ({ ...f, herramientaId: e.target.value }))}
                className="form-input text-xs">
                <option value="">Todas</option>
                {herramientas.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select value={filtros.estado}
              onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
              className="form-input text-xs">
              <option value="">Todos los estados</option>
              <option value="cerrada">Cerrada</option>
              <option value="rechazada">Rechazada</option>
              <option value="atrasada">Atrasada</option>
              <option value="en_revision">En revisión (incidencia)</option>
              <option value="anulada">Anulada por abandono</option>
            </select>
          </div>
        </div>

        {/* Lista de registros */}
        <p className="section-title">Registros ({registros.length})</p>
        <div className="card p-0 overflow-hidden">
          {loading ? <Spinner /> : registros.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-sm">Sin registros para estos filtros</div>
          ) : registros.map(r => (
            <div key={r.id} className="border-b border-stone-100 last:border-0">
              <button
                onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                className="list-item w-full text-left px-5 hover:bg-stone-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-stone-50 flex items-center justify-center flex-shrink-0">🔧</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.herramientas?.nombre}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{r.operario?.nombre} · {fmtDateShort(r.created_at)}</div>
                </div>
                <Badge estado={r.estado} />
              </button>

              {expandido === r.id && (
                <div className="px-5 pb-4 bg-stone-50">
                  {[
                    ['Solicitud creada', fmtDate(r.created_at)],
                    ['Fecha retiro',     fmtDate(r.fecha_retiro)],
                    ['Fecha devolución comprometida', fmtDate(r.fecha_devolucion)],
                    ['Supervisor',       r.supervisor?.nombre || '—'],
                    ['Justificación',    r.justificacion],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between py-1.5 text-xs border-b border-stone-200 last:border-0">
                      <span className="text-stone-400">{l}</span>
                      <span className="text-stone-700 font-medium text-right max-w-[60%]">{v}</span>
                    </div>
                  ))}

                  {r.custodias && r.custodias.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <div className="text-xs font-semibold text-stone-500 mb-1">Custodia</div>
                      {r.custodias.map(c => (
                        <div key={c.id} className="text-xs text-stone-600">
                          Entregado por {c.bodeguero?.nombre} el {fmtDate(c.fecha_entrega)}
                          {c.fecha_devolucion_real && ` · Devuelto el ${fmtDate(c.fecha_devolucion_real)}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {r.incidencias && r.incidencias.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <div className="text-xs font-semibold text-red-600 mb-1">Incidencia</div>
                      {r.incidencias.map(i => (
                        <div key={i.id} className="text-xs text-stone-600">
                          {i.descripcion} {i.veredicto && `· Veredicto: ${i.veredicto}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
