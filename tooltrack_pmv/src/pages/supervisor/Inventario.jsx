import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { getInventarioConUltimoMovimiento } from '../../lib/db'
import NavBar from '../../components/NavBar'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { fmtDateShort } from '../../lib/utils'

export default function Inventario() {
  const { go } = useApp()
  const [herramientas, setHerramientas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    getInventarioConUltimoMovimiento().then(setHerramientas).finally(() => setLoading(false))
  }, [])

  const filtradas = filtroEstado
    ? herramientas.filter(h => h.estado === filtroEstado)
    : herramientas

  const conteo = herramientas.reduce((acc, h) => {
    acc[h.estado] = (acc[h.estado] || 0) + 1
    return acc
  }, {})

  const ESTADOS = [
    { value: '',              label: 'Todas',          color: 'text-stone-700' },
    { value: 'disponible',    label: 'Disponibles',    color: 'text-green-700' },
    { value: 'en_uso',        label: 'En uso',         color: 'text-blue-700'  },
    { value: 'en_inspeccion', label: 'En inspección',  color: 'text-amber-700' },
    { value: 'en_mantencion', label: 'En mantención',  color: 'text-amber-700' },
    { value: 'baja',          label: 'Dadas de baja',  color: 'text-stone-500' },
  ]

  return (
    <>
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-7">
        <PageHeader title="Inventario de Herramientas"
          sub="Vista completa del estado de todos los activos"
          backTo={{ screen: 'dashboard_supervisor', label: 'Panel del Supervisor' }} />

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="text-xs text-stone-400 mb-1">Total activos</div>
            <div className="text-2xl font-semibold text-stone-700">{herramientas.length}</div>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="text-xs text-stone-400 mb-1">Disponibles</div>
            <div className="text-2xl font-semibold text-green-700">{conteo.disponible || 0}</div>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="text-xs text-stone-400 mb-1">En faena</div>
            <div className="text-2xl font-semibold text-blue-700">{conteo.en_uso || 0}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {ESTADOS.map(e => (
            <button key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                ${filtroEstado === e.value
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}>
              {e.label}
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <Spinner /> : filtradas.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-sm">No hay herramientas con ese estado</div>
          ) : filtradas.map(h => (
            <div key={h.id} className="list-item px-5">
              <div className="w-9 h-9 rounded-lg bg-stone-50 flex items-center justify-center flex-shrink-0">🔧</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{h.nombre}</div>
                <div className="text-xs text-stone-400 mt-0.5 font-mono">{h.codigo} · {h.bodega}</div>
                {h.ultimaSolicitud && (
                  <div className="text-xs text-stone-400 mt-0.5">
                    Último uso: {h.ultimaSolicitud.operario?.nombre} · {fmtDateShort(h.ultimaSolicitud.fecha_devolucion)}
                  </div>
                )}
              </div>
              <Badge estado={h.estado} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
