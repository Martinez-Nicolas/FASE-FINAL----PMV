export const BADGE_CLASS = {
  creada:           'bg-stone-100 text-stone-600 border-stone-300',
  pendiente_entrega:'bg-amber-100 text-amber-800 border-amber-300',
  activa:           'bg-blue-100  text-blue-800  border-blue-300',
  atrasada:         'bg-red-100   text-red-800   border-red-300',
  cerrada:          'bg-green-100 text-green-800 border-green-300',
  rechazada:        'bg-red-100   text-red-800   border-red-300',
  en_revision:      'bg-red-100   text-red-800   border-red-300',
  anulada:          'bg-stone-100 text-stone-600 border-stone-300',
  en_inspeccion:    'bg-amber-100 text-amber-800 border-amber-300',
  en_uso:           'bg-blue-100  text-blue-800  border-blue-300',
  disponible:       'bg-green-100 text-green-800 border-green-300',
  baja:             'bg-stone-100 text-stone-600 border-stone-300',
  en_mantencion:    'bg-amber-100 text-amber-800 border-amber-300',
}

export const BADGE_LABEL = {
  creada:            'Creada',
  pendiente_entrega: 'Pendiente de entrega',
  activa:            'Activa',
  atrasada:          'Atrasada ⚠',
  cerrada:           'Cerrada',
  rechazada:         'Rechazada',
  en_revision:       'En revisión',
  anulada:           'Anulada',
  en_inspeccion:     'En inspección',
  en_uso:            'En uso',
  disponible:        'Disponible',
  baja:              'Dado de baja',
  en_mantencion:     'En mantención',
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function fmtDateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL')
}
