-- ============================================================
-- LO LEÍDO DE LA CAMPANA, EN LA CUENTA
--
-- Propuesta 3, tanda 2 (`docs/PROPUESTAS.md`). La campana pasó a ser
-- una bandeja (Hoy, Esta semana, Nuevo, Cambios) y hasta hoy lo leído
-- vivía solo en el teléfono (`bolivar-novedades`). Quien entra desde
-- el celular y la compu veía dos veces lo mismo sin leer.
--
-- Una fila por cuenta, con lo mismo que guarda el teléfono:
--
--   hasta    el momento hasta el que se marcó todo como leído
--   claves   los avisos abiertos sueltos: `pub:12:nueva`,
--            `pub:12:cambio:<ms>`, `pub:12:hoy:2026-10-01`. Es la
--            clave del ESTADO del aviso y no de la publicación: un paro
--            leído ayer vuelve a estar sin leer el día del paro.
--
-- POR QUÉ UNA TABLA Y NO UNA COLUMNA EN `preferencias`. La campana no
-- tiene que crear filas en `preferencias`: Fechas lee esa fila y, si
-- existe, pisa con ella el modo época de parciales del teléfono. Una
-- fila creada por la campana, con los valores por defecto, apagaría el
-- modo que la persona había prendido sin cuenta.
--
-- QUIÉN LA TOCA. Solo la dueña, y solo desde las pantallas que cargan
-- la librería grande (Perfil, Mi año, Info útil, el mapa, cargar, el
-- panel): el cliente chico no tiene sesión, a propósito (ver
-- `lib/datos.js`). El teléfono sigue siendo lo principal; la cuenta es
-- donde se juntan los teléfonos cuando la persona pasa por Perfil.
--
-- Borrar la cuenta la borra sola (`on delete cascade`, igual que
-- `cursada` y `preferencias`, ver `sql/tabla-borrar-cuenta.sql`).
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
--
-- ESTADO: aplicado en producción el 30/9/2026.
-- ============================================================

create table if not exists public.campana_leidas (
  usuario_id     uuid primary key default auth.uid()
                 references auth.users(id) on delete cascade,
  hasta          timestamptz,
  -- El teléfono guarda las últimas 300; más no hace falta y el tope
  -- evita que una fila crezca sin límite.
  claves         text[] not null default '{}'
                 check (cardinality(claves) <= 300),
  actualizado_at timestamptz not null default now()
);


-- ============================================================
-- LOS DOS CANDADOS  ·  grants y RLS
-- ============================================================
alter table public.campana_leidas enable row level security;

revoke all on public.campana_leidas from anon;
grant select, insert, update, delete on public.campana_leidas to authenticated;

drop policy if exists "cada uno ve lo suyo" on public.campana_leidas;
create policy "cada uno ve lo suyo" on public.campana_leidas
  for select to authenticated using (usuario_id = (select auth.uid()));

drop policy if exists "cada uno agrega lo suyo" on public.campana_leidas;
create policy "cada uno agrega lo suyo" on public.campana_leidas
  for insert to authenticated with check (usuario_id = (select auth.uid()));

drop policy if exists "cada uno edita lo suyo" on public.campana_leidas;
create policy "cada uno edita lo suyo" on public.campana_leidas
  for update to authenticated using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy if exists "cada uno borra lo suyo" on public.campana_leidas;
create policy "cada uno borra lo suyo" on public.campana_leidas
  for delete to authenticated using (usuario_id = (select auth.uid()));
