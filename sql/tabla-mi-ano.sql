-- ============================================================
-- «MI AÑO» EN LA CUENTA
--
-- Hasta el 7/10/2026 Mi año vivía solo en el teléfono (la llave
-- `bolivar-carrera-v2`). Les estudiantes armaban la cuenta en el
-- celular, entraban con la misma cuenta en la tablet, y la tablet
-- aparecía vacía: la cuenta nunca había tenido el año. El código de
-- respaldo (`sql/tabla-respaldos.sql`) lo pasaba una vez, pero no
-- sincronizaba: cada aparato pisaba al otro sin enterarse.
--
-- Una fila por cuenta, con lo mismo que guarda el teléfono:
--
--   datos    el `guardado` entero de Mi año: la carrera elegida y,
--            por carrera, estados, notas, fechas, año de las cursadas.
--   version  sube de a uno con cada guardado. Es lo que deja saber si
--            otro aparato guardó en el medio: el teléfono dice «guardo
--            sobre la 7» y, si arriba ya hay una 8, no pisa nada y
--            primero junta las dos (ver `carrera/index.html`, «MI AÑO
--            EN LA CUENTA»).
--
-- POR QUÉ UNA FUNCIÓN PARA ESCRIBIR Y NO UN `update` DIRECTO. El
-- «guardo solo si sigue siendo la 7» tiene que ser una sola operación
-- en la base; si el teléfono primero pregunta y después escribe, otro
-- aparato puede guardar en el medio y se pierde lo suyo. Además la
-- función pone el mismo tope de tamaño que el respaldo.
--
-- Sin cuenta no cambia nada: Mi año sigue en el teléfono y sigue el
-- código de respaldo para quien lo quiera.
--
-- Borrar la cuenta la borra sola (`on delete cascade`, igual que
-- `cursada`, `preferencias` y `campana_leidas`, ver
-- `sql/tabla-borrar-cuenta.sql`).
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
--
-- ESTADO: aplicado en producción el 7/10/2026.
-- ============================================================

create table if not exists public.mi_ano (
  usuario_id     uuid primary key default auth.uid()
                 references auth.users(id) on delete cascade,
  datos          jsonb not null,
  version        integer not null default 1,
  actualizado_at timestamptz not null default now()
);


-- ============================================================
-- LOS DOS CANDADOS  ·  grants y RLS
--
-- Leer, cada quien lo suyo. Escribir, solo por la función de abajo:
-- nadie tiene `insert` ni `update` sobre la tabla.
-- ============================================================
alter table public.mi_ano enable row level security;

revoke all on public.mi_ano from anon, authenticated;
grant select on public.mi_ano to authenticated;

drop policy if exists "cada uno ve lo suyo" on public.mi_ano;
create policy "cada uno ve lo suyo" on public.mi_ano
  for select to authenticated
  using (usuario_id = auth.uid());


-- ============================================================
-- GUARDAR
--
-- `p_version` es la versión sobre la que guarda el teléfono: la última
-- que vio arriba. 0 (o null) es «todavía no hay nada en la cuenta».
--
-- Devuelve la versión nueva, o null si arriba ya había otra: otro
-- aparato guardó en el medio. Con null el teléfono no reintenta a
-- ciegas; vuelve a leer, junta y recién ahí guarda.
-- ============================================================
create or replace function public.guardar_mi_ano(p_datos jsonb, p_version integer)
returns integer language plpgsql security definer set search_path = public as $$
declare
  yo    uuid := auth.uid();
  nueva integer;
begin
  if yo is null then
    raise exception 'Hace falta entrar con tu cuenta.' using errcode = '42501';
  end if;
  -- El mismo tope que el respaldo: sin él, una cuenta puede engordar su
  -- fila hasta llenar la base.
  if jsonb_typeof(p_datos) is distinct from 'object' then
    raise exception 'Mi año tiene que ser un objeto.' using errcode = '22023';
  end if;
  if pg_column_size(p_datos) > 100000 then
    raise exception 'Mi año es demasiado grande.' using errcode = '54000';
  end if;

  if coalesce(p_version, 0) = 0 then
    -- Si otro aparato la creó en el medio, no se pisa: null.
    insert into public.mi_ano (usuario_id, datos) values (yo, p_datos)
      on conflict (usuario_id) do nothing
      returning version into nueva;
    return nueva;
  end if;

  update public.mi_ano
     set datos = p_datos, version = version + 1, actualizado_at = now()
   where usuario_id = yo and version = p_version
   returning version into nueva;
  return nueva;
end $$;

revoke all on function public.guardar_mi_ano(jsonb, integer) from public, anon;
grant execute on function public.guardar_mi_ano(jsonb, integer) to authenticated;
