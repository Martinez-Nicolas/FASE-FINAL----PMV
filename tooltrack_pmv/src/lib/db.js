import { supabase } from './supabase'

// ── USUARIOS ──────────────────────────────────────────────────
export async function getUsuariosByRol(rol) {
  const { data, error } = await supabase
    .from('usuarios').select('*').eq('rol', rol).order('nombre')
  if (error) throw error
  return data
}

export async function getAllUsuarios() {
  const { data, error } = await supabase
    .from('usuarios').select('*').order('nombre')
  if (error) throw error
  return data
}

// ── HERRAMIENTAS ──────────────────────────────────────────────
export async function getHerramientas() {
  const { data, error } = await supabase
    .from('herramientas').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function getHerramientasDisponibles() {
  const { data, error } = await supabase
    .from('herramientas').select('*').eq('estado', 'disponible').order('nombre')
  if (error) throw error
  return data
}

export async function updateHerramientaEstado(id, estado) {
  const { error } = await supabase
    .from('herramientas').update({ estado }).eq('id', id)
  if (error) throw error
}

// ── SOLICITUDES ───────────────────────────────────────────────
export async function getSolicitudesByOperario(operarioId) {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`*, herramientas(*), supervisor:supervisor_id(nombre)`)
    .eq('operario_id', operarioId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSolicitudesPendientesAprobacion() {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`*, herramientas(*), operario:operario_id(nombre, cuadrilla)`)
    .eq('estado', 'creada')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSolicitudesActivasParaSupervisor() {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`*, herramientas(*), operario:operario_id(nombre)`)
    .in('estado', ['activa', 'atrasada', 'pendiente_entrega'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSolicitudesPendientesEntrega() {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`*, herramientas(*), operario:operario_id(nombre, cuadrilla)`)
    .eq('estado', 'pendiente_entrega')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSolicitudesActivasParaBodeguero() {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`*, herramientas(*), operario:operario_id(nombre)`)
    .in('estado', ['activa', 'atrasada'])
    .order('fecha_devolucion', { ascending: true })
  if (error) throw error
  return data
}

export async function getSolicitudById(id) {
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`*, herramientas(*), operario:operario_id(nombre, cuadrilla), supervisor:supervisor_id(nombre)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function crearSolicitud({ operarioId, herramientaId, justificacion, fechaRetiro, fechaDevolucion }) {
  const { data, error } = await supabase
    .from('solicitudes')
    .insert({
      operario_id:      operarioId,
      herramienta_id:   herramientaId,
      justificacion,
      fecha_retiro:     fechaRetiro,
      fecha_devolucion: fechaDevolucion,
      estado:           'creada',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function aprobarSolicitud(id, supervisorId) {
  const { error } = await supabase
    .from('solicitudes')
    .update({ estado: 'pendiente_entrega', supervisor_id: supervisorId, updated_at: new Date() })
    .eq('id', id)
  if (error) throw error
}

export async function rechazarSolicitud(id, supervisorId, motivo) {
  const { error } = await supabase
    .from('solicitudes')
    .update({ estado: 'rechazada', supervisor_id: supervisorId, motivo_rechazo: motivo, updated_at: new Date() })
    .eq('id', id)
  if (error) throw error
}

export async function confirmarEntrega(solicitudId, bodegueroId, estadoVisual, obs) {
  // 1. Crear registro de custodia
  const { error: e1 } = await supabase.from('custodias').insert({
    solicitud_id:   solicitudId,
    bodeguero_id:   bodegueroId,
    estado_entrega: estadoVisual,
    obs_entrega:    obs,
    fecha_entrega:  new Date(),
  })
  if (e1) throw e1

  // 2. Actualizar solicitud
  const { data: sol, error: e2 } = await supabase
    .from('solicitudes').select('herramienta_id').eq('id', solicitudId).single()
  if (e2) throw e2

  const { error: e3 } = await supabase
    .from('solicitudes').update({ estado: 'activa', updated_at: new Date() }).eq('id', solicitudId)
  if (e3) throw e3

  // 3. Actualizar herramienta
  await updateHerramientaEstado(sol.herramienta_id, 'en_uso')
}

export async function registrarDevolucionConforme(solicitudId, herramientaId) {
  // Cerrar solicitud
  const { error: e1 } = await supabase
    .from('solicitudes')
    .update({ estado: 'cerrada', updated_at: new Date() })
    .eq('id', solicitudId)
  if (e1) throw e1

  // Herramienta vuelve a disponible
  await updateHerramientaEstado(herramientaId, 'disponible')

  // Actualizar custodia
  await supabase.from('custodias')
    .update({ fecha_devolucion_real: new Date(), estado_devolucion: 'conforme' })
    .eq('solicitud_id', solicitudId)
}

export async function registrarIncidencia({ solicitudId, herramientaId, descripcion, tipoDano }) {
  // Crear incidencia
  const { error: e1 } = await supabase.from('incidencias').insert({
    solicitud_id:   solicitudId,
    herramienta_id: herramientaId,
    descripcion,
    tipo_dano:      tipoDano,
    estado:         'pendiente',
  })
  if (e1) throw e1

  // Solicitud → en revisión
  await supabase.from('solicitudes')
    .update({ estado: 'en_revision', updated_at: new Date() }).eq('id', solicitudId)

  // Herramienta → en inspección
  await updateHerramientaEstado(herramientaId, 'en_inspeccion')
}

// ── INCIDENCIAS ───────────────────────────────────────────────
export async function getIncidenciasPendientes() {
  const { data, error } = await supabase
    .from('incidencias')
    .select(`*, herramientas(*), solicitudes(*, operario:operario_id(nombre))`)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function emitirVeredicto(incidenciaId, herramientaId, solicitudId, veredicto, diagnostico) {
  // Actualizar incidencia
  await supabase.from('incidencias')
    .update({ veredicto, diagnostico, estado: 'resuelto', updated_at: new Date() })
    .eq('id', incidenciaId)

  // Estado herramienta según veredicto
  const estadoHerramienta = {
    reparar:  'en_mantencion',
    desgaste: 'disponible',
    baja:     'baja',
  }[veredicto]
  await updateHerramientaEstado(herramientaId, estadoHerramienta)

  // Cerrar solicitud
  await supabase.from('solicitudes')
    .update({ estado: 'cerrada', updated_at: new Date() }).eq('id', solicitudId)
}

// ── HISTORIAL / TRAZABILIDAD (Supervisor) ─────────────────────
export async function getHistorialCompleto({ desde, hasta, operarioId, herramientaId, estado } = {}) {
  let query = supabase
    .from('solicitudes')
    .select(`*, herramientas(*), operario:operario_id(nombre, cuadrilla), supervisor:supervisor_id(nombre),
              custodias(*, bodeguero:bodeguero_id(nombre)),
              incidencias(*)`)
    .order('created_at', { ascending: false })

  if (desde)         query = query.gte('created_at', desde)
  if (hasta)          query = query.lte('created_at', hasta)
  if (operarioId)     query = query.eq('operario_id', operarioId)
  if (herramientaId)  query = query.eq('herramienta_id', herramientaId)
  if (estado)         query = query.eq('estado', estado)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getEstadisticasSupervisor() {
  const { data: solicitudes, error } = await supabase
    .from('solicitudes')
    .select('estado, operario_id, operario:operario_id(nombre)')
  if (error) throw error

  const total       = solicitudes.length
  const cerradas    = solicitudes.filter(s => s.estado === 'cerrada').length
  const rechazadas  = solicitudes.filter(s => s.estado === 'rechazada').length
  const incidencias = solicitudes.filter(s => s.estado === 'en_revision').length
  const atrasos     = solicitudes.filter(s => s.estado === 'atrasada').length

  // Ranking de atrasos por operario
  const porOperario = {}
  solicitudes.forEach(s => {
    const nombre = s.operario?.nombre || 'Desconocido'
    if (!porOperario[nombre]) porOperario[nombre] = { total: 0, atrasos: 0 }
    porOperario[nombre].total++
    if (s.estado === 'atrasada') porOperario[nombre].atrasos++
  })

  return { total, cerradas, rechazadas, incidencias, atrasos, porOperario }
}

// ── INVENTARIO (Supervisor + Bodeguero) ───────────────────────
export async function getInventarioCompleto() {
  const { data, error } = await supabase
    .from('herramientas')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data
}

export async function getInventarioConUltimoMovimiento() {
  const herramientas = await getInventarioCompleto()
  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select('herramienta_id, estado, fecha_devolucion, operario:operario_id(nombre)')
    .order('created_at', { ascending: false })

  return herramientas.map(h => {
    const ultima = solicitudes?.find(s => s.herramienta_id === h.id)
    return { ...h, ultimaSolicitud: ultima || null }
  })
}

// ── AUTENTICACIÓN SIMPLE POR PIN ───────────────────────────────
export async function verificarPin(usuarioId, pin) {
  const { data, error } = await supabase
    .from('usuarios').select('pin').eq('id', usuarioId).single()
  if (error) throw error
  return data.pin === pin
}

// ── HELPERS ───────────────────────────────────────────────────
export function isAtrasada(sol) {
  if (sol.estado !== 'activa') return false
  return new Date() > new Date(sol.fecha_devolucion)
}

export async function checkYMarcarAtrasadas() {
  const { data } = await supabase
    .from('solicitudes').select('id, fecha_devolucion').eq('estado', 'activa')
  if (!data) return
  const ahora = new Date()
  const atrasadas = data.filter(s => new Date(s.fecha_devolucion) < ahora).map(s => s.id)
  if (atrasadas.length > 0) {
    await supabase.from('solicitudes')
      .update({ estado: 'atrasada', updated_at: new Date() })
      .in('id', atrasadas)
  }
}

// ── ANULACIÓN AUTOMÁTICA POR ABANDONO (Ajuste 1, Avance 3) ────
export async function checkYAnularAbandonadas(horasLimite = 4) {
  const limite = new Date(Date.now() - horasLimite * 60 * 60 * 1000)
  const { data } = await supabase
    .from('solicitudes')
    .select('id, created_at, herramienta_id')
    .eq('estado', 'pendiente_entrega')
    .lt('created_at', limite.toISOString())
  if (!data || data.length === 0) return

  const ids = data.map(s => s.id)
  await supabase.from('solicitudes')
    .update({ estado: 'anulada', updated_at: new Date() })
    .in('id', ids)

  // Liberar las herramientas reservadas
  for (const sol of data) {
    await updateHerramientaEstado(sol.herramienta_id, 'disponible')
  }
}
