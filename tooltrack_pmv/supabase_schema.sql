-- ══════════════════════════════════════════════════════════════
-- ToolTrack PMV — Schema SQL
-- Pegar en Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════

-- 1. USUARIOS (actores del sistema)
create table if not exists usuarios (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  rol        text not null check (rol in ('operario','supervisor','bodeguero','mantencion')),
  cuadrilla  text,
  created_at timestamptz default now()
);

-- 2. HERRAMIENTAS (activos físicos)
create table if not exists herramientas (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  nombre     text not null,
  estado     text not null default 'disponible'
             check (estado in ('disponible','en_uso','en_inspeccion','en_mantencion','baja')),
  bodega     text not null default 'Bodega Principal',
  created_at timestamptz default now()
);

-- 3. SOLICITUDES DE PRÉSTAMO
create table if not exists solicitudes (
  id               uuid primary key default gen_random_uuid(),
  operario_id      uuid references usuarios(id),
  herramienta_id   uuid references herramientas(id),
  supervisor_id    uuid references usuarios(id),
  justificacion    text not null,
  fecha_retiro     timestamptz not null,
  fecha_devolucion timestamptz not null,
  estado           text not null default 'creada'
                   check (estado in (
                     'creada','pendiente_entrega','activa',
                     'atrasada','en_revision','cerrada','rechazada','anulada'
                   )),
  motivo_rechazo   text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 4. REGISTROS DE CUSTODIA
create table if not exists custodias (
  id              uuid primary key default gen_random_uuid(),
  solicitud_id    uuid references solicitudes(id),
  bodeguero_id    uuid references usuarios(id),
  estado_entrega  text not null default 'bueno',
  obs_entrega     text,
  fecha_entrega   timestamptz default now(),
  fecha_devolucion_real timestamptz,
  estado_devolucion text,
  obs_devolucion  text,
  created_at      timestamptz default now()
);

-- 5. INCIDENCIAS
create table if not exists incidencias (
  id             uuid primary key default gen_random_uuid(),
  solicitud_id   uuid references solicitudes(id),
  herramienta_id uuid references herramientas(id),
  descripcion    text not null,
  tipo_dano      text not null,
  veredicto      text check (veredicto in ('reparar','desgaste','baja')),
  diagnostico    text,
  costo_estimado numeric(10,2),
  estado         text not null default 'pendiente'
                 check (estado in ('pendiente','resuelto')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── DATOS DE PRUEBA ────────────────────────────────────────────

insert into usuarios (nombre, rol, cuadrilla) values
  ('Nicolás Martínez',  'operario',   'Cuadrilla A'),
  ('Martín Sanhueza',   'operario',   'Cuadrilla B'),
  ('Pedro González',    'supervisor', null),
  ('Roberto Campos',    'bodeguero',  null),
  ('Héctor Valdés',     'mantencion', null)
on conflict do nothing;

insert into herramientas (codigo, nombre, estado, bodega) values
  ('HRR-0042', 'Esmeril angular 4.5"',  'disponible', 'Bodega Principal'),
  ('HRR-0018', 'Rotomartillo 800W',      'disponible', 'Bodega Principal'),
  ('HRR-0031', 'Taladro percutor',       'disponible', 'Bodega Norte'),
  ('HRR-0009', 'Estación total láser',   'disponible', 'Bodega Principal'),
  ('HRR-0055', 'Nivel láser',            'disponible', 'Bodega Principal')
on conflict do nothing;

-- ── ROW LEVEL SECURITY (básico para PMV) ──────────────────────
alter table usuarios    enable row level security;
alter table herramientas enable row level security;
alter table solicitudes  enable row level security;
alter table custodias    enable row level security;
alter table incidencias  enable row level security;

-- Política abierta (PMV — en producción se restringe por rol)
create policy "allow_all_usuarios"     on usuarios     for all using (true) with check (true);
create policy "allow_all_herramientas" on herramientas for all using (true) with check (true);
create policy "allow_all_solicitudes"  on solicitudes  for all using (true) with check (true);
create policy "allow_all_custodias"    on custodias    for all using (true) with check (true);
create policy "allow_all_incidencias"  on incidencias  for all using (true) with check (true);
