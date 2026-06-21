# ToolTrack PMV — Prototipo Mínimo Viable (Entrega Final)
**Grupo 5** · Nicolás Martínez Cáceres · Martín Sanhueza Fernández  
Desarrollo de Aplicaciones Empresariales · UCT · 2026

---

## ¿Qué es ToolTrack?

Sistema de Préstamo de Herramientas para la Constructora Edifica-Tec. Gestiona el ciclo completo de préstamo: desde que un operario solicita una herramienta hasta que se cierra el préstamo, se resuelve una incidencia, o se anula automáticamente por abandono.

---

## Tecnologías

- **React 18** + **Vite 5** — Frontend
- **Tailwind CSS 3** — Estilos
- **Supabase** — Base de datos PostgreSQL en la nube (persistencia real)

---

## Dónde se guardan los datos

Los datos se almacenan en **Supabase** (PostgreSQL), un servicio de base de datos en la nube. El proyecto ya está configurado y las tablas ya existen.

Tablas:
- `usuarios` — actores del sistema, incluye PIN de acceso
- `herramientas` — activos físicos del inventario
- `solicitudes` — registro de cada préstamo
- `custodias` — registro de entregas y devoluciones
- `incidencias` — tickets de daños o fallas

---

## Requisitos previos

- **Node.js v18 o superior**

```bash
node -v
npm -v
```

Si no tiene Node.js:
```bash
sudo apt install curl -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Pasos para ejecutar la aplicación

### 1. Descomprimir y entrar a la carpeta
```bash
cd ~/Descargas
unzip 05_final.zip
cd tooltrack_pmv
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Aplicar la migración SQL (IMPORTANTE — entrega final)
Si ya aplicaste `supabase_schema.sql` en el avance anterior, ahora debes aplicar también `migracion_entrega_final.sql`:

1. Ve a Supabase → tu proyecto → **SQL Editor**
2. Abre el archivo `migracion_entrega_final.sql` con un editor de texto
3. Copia todo el contenido, pégalo en el SQL Editor → **Run**

Esto agrega:
- Columna `pin` a la tabla usuarios (autenticación simple)
- Índices para mejorar el rendimiento del módulo de Historial

### 4. Verificar credenciales
El archivo `.env` ya viene configurado. No es necesario modificarlo.

### 5. Correr la aplicación
```bash
npm run dev
```

### 6. Abrir en el navegador
```
http://localhost:5173
```

---

## Usuarios de prueba y PIN de acceso

| Usuario | Rol | PIN |
|---|---|---|
| Nicolás Martínez | Operario (Cuadrilla A) | 1234 |
| Martín Sanhueza | Operario (Cuadrilla B) | 5678 |
| Pedro González | Supervisor | 1111 |
| Roberto Campos | Bodeguero | 2222 |
| Héctor Valdés | Enc. Mantención | 3333 |

---

## Cómo probar el flujo principal

| Paso | Rol | Acción |
|------|-----|--------|
| 1 | **Operario** | Login → PIN 1234 → Nueva solicitud → completar formulario → Enviar |
| 2 | **Supervisor** | Login → PIN 1111 → Ver solicitud pendiente → Aprobar |
| 3 | **Bodeguero** | Login → PIN 2222 → Entregas pendientes → Confirmar entrega |
| 4 | **Operario** | Login → PIN 1234 → Ver solicitud activa → Devolver → Con daños |
| 5 | **Enc. Mantención** | Login → PIN 3333 → Ver incidencia → Emitir veredicto |

### Funcionalidades adicionales (entrega final)

- **Historial y Trazabilidad** (Supervisor): Panel → "📊 Historial y Trazabilidad". Filtros por operario, herramienta y estado. Cada registro es expandible y muestra custodia e incidencias asociadas. Incluye ranking de atrasos por operario.
- **Inventario** (Supervisor): Panel → "📦 Inventario". Vista completa de todas las herramientas con su estado actual y último movimiento.
- **Autenticación con PIN**: cada usuario ahora requiere un PIN de 4 dígitos además de seleccionarse en la lista.
- **Anulación automática por abandono**: si una solicitud aprobada no es retirada en 4 horas, el sistema la anula automáticamente y libera la herramienta (se ejecuta al cargar el Dashboard del Bodeguero).

---

## Estructura del proyecto

```
tooltrack_pmv/
├── .env                              ← Credenciales Supabase
├── supabase_schema.sql               ← Schema inicial (avance)
├── migracion_entrega_final.sql       ← Migración para esta entrega
├── src/
│   ├── App.jsx                       ← Router principal
│   ├── context/AppContext.jsx        ← Estado global
│   ├── lib/
│   │   ├── supabase.js               ← Cliente Supabase
│   │   ├── db.js                     ← Todas las consultas a la BD
│   │   └── utils.js                  ← Helpers y constantes
│   ├── components/                   ← Componentes reutilizables
│   └── pages/
│       ├── auth/Login.jsx            ← Login + PIN
│       ├── operario/
│       ├── supervisor/
│       │   ├── DashboardSupervisor.jsx
│       │   ├── AprobarSolicitud.jsx
│       │   ├── Historial.jsx         ← NUEVO
│       │   └── Inventario.jsx        ← NUEVO
│       ├── bodeguero/
│       └── mantencion/
```

---

## Correspondencia con el MPN (Fase 1)

| Elemento del MPN | Implementación |
|---|---|
| Decisión 1, 2, 3 | Aprobar/Rechazar, Confirmar Entrega, Devolución |
| Excepción E3 — Incidencia | Reporte de Incidencia + Veredicto Técnico |
| Estado Atrasada (Ajuste 2) | Badge automático + alerta |
| Ajuste 1 — Auto-cancelación por abandono | checkYAnularAbandonadas() — NUEVO en esta entrega |
| Ajuste 3 — 3 rutas del veredicto | Reparar / Desgaste / Dado de Baja |
| Trazabilidad de custodia | Módulo de Historial — NUEVO en esta entrega |
