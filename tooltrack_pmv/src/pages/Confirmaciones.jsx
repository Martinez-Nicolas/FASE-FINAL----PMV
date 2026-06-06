import React from 'react'
import NavBar from '../components/NavBar'
import SuccessScreen from '../components/SuccessScreen'
import { useApp } from '../context/AppContext'

export function SolicitudEnviada() {
  return <><NavBar /><SuccessScreen icon="📋" title="Solicitud enviada"
    sub="Tu solicitud fue enviada al Supervisor de Cuadrilla. Recibirás respuesta pronto."
    backLabel="Volver al inicio" backScreen="dashboard_operario" /></>
}

export function SolicitudAprobada() {
  return <><NavBar /><SuccessScreen icon="✓" title="Solicitud aprobada"
    sub="La solicitud fue aprobada. El Bodeguero fue notificado para preparar la entrega."
    backLabel="Volver al panel" backScreen="dashboard_supervisor"
    bg="bg-green-50" border="border-green-200" /></>
}

export function SolicitudRechazada() {
  return <><NavBar /><SuccessScreen icon="✗" title="Solicitud rechazada"
    sub="La solicitud fue rechazada. El operario fue notificado. El flujo termina aquí."
    backLabel="Volver al panel" backScreen="dashboard_supervisor"
    bg="bg-red-50" border="border-red-200" /></>
}

export function EntregaConfirmada() {
  return <><NavBar /><SuccessScreen icon="📦" title="Entrega confirmada"
    sub="La herramienta fue entregada. Activo en estado Activa / En Custodia. Timer iniciado."
    backLabel="Volver al panel" backScreen="dashboard_bodeguero"
    bg="bg-blue-50" border="border-blue-200" /></>
}

export function IncidenciaCreada() {
  return <><NavBar /><SuccessScreen icon="⚠" title="Incidencia registrada"
    sub="El ticket fue creado. La herramienta está En Inspección Técnica. El préstamo permanece abierto hasta el veredicto."
    backLabel="Volver al inicio" backScreen="dashboard_operario"
    bg="bg-red-50" border="border-red-200" /></>
}

export function CierreExitoso() {
  return <><NavBar /><SuccessScreen icon="✓" title="Préstamo cerrado"
    sub="La herramienta fue devuelta en condiciones conformes. Custodia liberada. Activo vuelve a Disponible."
    backLabel="Volver al inicio" backScreen="dashboard_operario"
    bg="bg-green-50" border="border-green-200" /></>
}

const MSGS_VEREDICTO = {
  reparar:  { icon: '🔧', title: 'Veredicto — Reparación',       sub: 'Herramienta en En Mantención/Reparación. Préstamo cerrado.',              bg: 'bg-amber-50', border: 'border-amber-200' },
  desgaste: { icon: '✓',  title: 'Veredicto — Desgaste natural', sub: 'Herramienta vuelve a Disponible. Préstamo cerrado sin costo al operario.', bg: 'bg-green-50', border: 'border-green-200' },
  baja:     { icon: '💀', title: 'Veredicto — Dado de Baja',      sub: 'Herramienta retirada del inventario. Costo imputado al responsable.',      bg: 'bg-red-50',   border: 'border-red-200'   },
}

export function VeredictoEmitido() {
  const { params } = useApp()
  const m = MSGS_VEREDICTO[params.veredicto] || MSGS_VEREDICTO.reparar
  return <><NavBar /><SuccessScreen icon={m.icon} title={m.title} sub={m.sub}
    backLabel="Volver al panel" backScreen="dashboard_mantencion"
    bg={m.bg} border={m.border} /></>
}
