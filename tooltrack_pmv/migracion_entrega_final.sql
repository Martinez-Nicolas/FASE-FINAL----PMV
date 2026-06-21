-- 1. Agregar columna PIN para autenticación simple
alter table usuarios add column if not exists pin text;

-- Asignar PIN de 4 dígitos a cada usuario de prueba
update usuarios set pin = '1234' where nombre = 'Nicolás Martínez';
update usuarios set pin = '5678' where nombre = 'Martín Sanhueza';
update usuarios set pin = '1111' where nombre = 'Pedro González';
update usuarios set pin = '2222' where nombre = 'Roberto Campos';
update usuarios set pin = '3333' where nombre = 'Héctor Valdés';

-- 2. Agregar estado 'anulada' como válido (ya estaba en el constraint original,
--    esto es solo por seguridad si el schema se aplicó antes de ese cambio)
alter table solicitudes drop constraint if exists solicitudes_estado_check;
alter table solicitudes add constraint solicitudes_estado_check
  check (estado in (
    'creada','pendiente_entrega','activa',
    'atrasada','en_revision','cerrada','rechazada','anulada'
  ));

-- 3. Índices para mejorar performance del módulo de Historial
create index if not exists idx_solicitudes_created_at on solicitudes(created_at);
create index if not exists idx_solicitudes_operario on solicitudes(operario_id);
create index if not exists idx_solicitudes_herramienta on solicitudes(herramienta_id);
create index if not exists idx_solicitudes_estado on solicitudes(estado);

-- Verificación rápida
select nombre, rol, pin from usuarios order by rol;
