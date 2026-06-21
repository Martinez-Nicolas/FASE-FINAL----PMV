import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Login                from './pages/auth/Login'
import DashboardOperario    from './pages/operario/DashboardOperario'
import DetalleOperario      from './pages/operario/DetalleOperario'
import NuevaSolicitud       from './pages/operario/NuevaSolicitud'
import Devolucion           from './pages/operario/Devolucion'
import ReporteIncidencia    from './pages/operario/ReporteIncidencia'
import DashboardSupervisor  from './pages/supervisor/DashboardSupervisor'
import AprobarSolicitud     from './pages/supervisor/AprobarSolicitud'
import Historial            from './pages/supervisor/Historial'
import Inventario           from './pages/supervisor/Inventario'
import DashboardBodeguero   from './pages/bodeguero/DashboardBodeguero'
import Entregar             from './pages/bodeguero/Entregar'
import DashboardMantencion  from './pages/mantencion/DashboardMantencion'
import VeredictoMantencion  from './pages/mantencion/VeredictoMantencion'
import {
  SolicitudEnviada, SolicitudAprobada, SolicitudRechazada,
  EntregaConfirmada, IncidenciaCreada, CierreExitoso, VeredictoEmitido,
} from './pages/Confirmaciones'

const SCREENS = {
  login:                 Login,
  dashboard_operario:    DashboardOperario,
  detalle_operario:      DetalleOperario,
  nueva_solicitud:       NuevaSolicitud,
  solicitud_enviada:     SolicitudEnviada,
  devolucion:            Devolucion,
  reporte_incidencia:    ReporteIncidencia,
  cierre_exitoso:        CierreExitoso,
  incidencia_creada:     IncidenciaCreada,
  dashboard_supervisor:  DashboardSupervisor,
  aprobar_solicitud:     AprobarSolicitud,
  historial:             Historial,
  inventario:            Inventario,
  solicitud_aprobada:    SolicitudAprobada,
  solicitud_rechazada:   SolicitudRechazada,
  dashboard_bodeguero:   DashboardBodeguero,
  entregar:              Entregar,
  entrega_confirmada:    EntregaConfirmada,
  dashboard_mantencion:  DashboardMantencion,
  veredicto_mantencion:  VeredictoMantencion,
  veredicto_emitido:     VeredictoEmitido,
}

function Router() {
  const { screen } = useApp()
  const Screen = SCREENS[screen] || Login
  return <Screen />
}

export default function App() {
  return <AppProvider><Router /></AppProvider>
}
