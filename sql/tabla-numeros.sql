-- ============================================================
-- LOS NÚMEROS DE CADA SEMANA  ·  para poder comparar con el pasado
--
-- `sucesos` (sql/tabla-registro.sql) se limpia sola: borra lo que
-- tenga más de noventa días. Está bien que sea así, es lo que la
-- mantiene chica. Pero el 2/12/2026 se empieza a ir septiembre, y con
-- él el lanzamiento del 21: sin otra cosa, después no hay contra qué
-- comparar un mes.
--
-- Acá queda UNA FILA POR SEMANA (de lunes a domingo, hora argentina),
-- con los totales ya contados. Ningún renglón de `sucesos` pasa para
-- acá: solo sumas. Lo único con palabras de la gente son las búsquedas
-- más repetidas, que ya se miran igual en el panel.
--
-- La llena la lectura de los domingos (la tarea programada que arma
-- el informe semanal y el mensual), con `guardar_semanas()`. Nadie la
-- tiene que llenar a mano.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
--
-- ESTADO: aplicado en producción el 17/11/2026, y llenado desde la
-- semana del 31/8.
-- ============================================================

create table if not exists public.numeros_semana (
  semana        date primary key,          -- el lunes
  completa      boolean not null default false,
  datos         jsonb   not null,
  actualizado_at timestamptz not null default now()
);

alter table public.numeros_semana enable row level security;

-- La lee el equipo, como el registro. Nadie escribe desde la app: la
-- escribe la función de abajo, que solo corre quien tiene la llave de
-- servicio.
revoke all on public.numeros_semana from anon, authenticated;
grant select on public.numeros_semana to authenticated;

drop policy if exists "numeros los lee el equipo" on public.numeros_semana;
create policy "numeros los lee el equipo"
  on public.numeros_semana for select to authenticated
  using (exists (select 1 from public.perfiles
                 where id = (select auth.uid()) and rol = 'equipo'));


-- ============================================================
-- CONTAR UNA SEMANA
--
-- Hay dos clases de número y se tratan distinto:
--
-- · Lo que PASÓ en la semana (visitas, hitos, cuentas nuevas): se
--   puede volver a contar cuando sea, mientras `sucesos` lo tenga.
--   Por eso la semana se recuenta el domingo siguiente: el domingo a
--   la noche todavía le faltan unas horas.
--
-- · Lo que HAY en un momento (cuentas en total, cuántos usaron Mi año
--   en los últimos siete días): eso es una foto, y si se saca después
--   sale otra cosa. Va en `momento` y solo se escribe mientras la
--   semana está en curso; al recontarla más tarde se conserva la foto
--   que ya había.
--
-- Y una guardia: una semana de hace más de 83 días ya perdió parte de
-- sus sucesos con la limpieza. Si ya está guardada, no se recuenta,
-- porque se pisarían números buenos con números cortos.
-- ============================================================
create or replace function public.guardar_semana(lunes date)
returns void language plpgsql security definer set search_path = public as $$
declare
  zona    constant text := 'America/Argentina/Buenos_Aires';
  desde   timestamptz := (lunes::timestamp) at time zone zona;
  hasta   timestamptz := ((lunes + 7)::timestamp) at time zone zona;
  hoy     date := (now() at time zone zona)::date;
  en_curso boolean := hoy < lunes + 7;
  vieja   jsonb;
  d       jsonb;
begin
  if extract(isodow from lunes) <> 1 then
    raise exception 'La semana empieza en lunes: % no lo es.', lunes;
  end if;

  select datos into vieja from public.numeros_semana where semana = lunes;
  if vieja is not null and lunes < hoy - 83 then
    return;
  end if;

  with s as (
    select tipo, detalle, dispositivo,
           regexp_replace(coalesce(pantalla, '-'), 'index\.html$', '') as pantalla,
           creado_at at time zone zona as t
      from public.sucesos
     where creado_at >= desde and creado_at < hasta
  ),
  v as (select * from s where tipo = 'visita')
  select jsonb_build_object(
    'visitas',       (select count(*) from v),
    'por_aparato',   (select coalesce(jsonb_object_agg(a, n), '{}') from
                        (select coalesce(dispositivo,'otro') a, count(*) n from v group by 1) x),
    'por_dia',       (select jsonb_agg(coalesce(n, 0) order by dia) from generate_series(1,7) dia
                        left join (select extract(isodow from t)::int dd, count(*) n from v group by 1) x
                        on x.dd = dia),
    'por_franja',    (select jsonb_agg(coalesce(n, 0) order by f) from generate_series(0,21,3) f
                        left join (select (extract(hour from t)::int / 3) * 3 ff, count(*) n from v group by 1) x
                        on x.ff = f),
    'pantallas',     (select coalesce(jsonb_object_agg(pantalla, n), '{}') from
                        (select pantalla, count(*) n from v group by 1 order by 2 desc limit 30) x),
    'llegadas',      (select coalesce(jsonb_object_agg(detalle, n), '{}') from
                        (select detalle, count(*) n from v where detalle is not null group by 1) x),
    'hitos',         (select coalesce(jsonb_object_agg(detalle, n), '{}') from
                        (select detalle, count(*) n from s where tipo = 'hito' and detalle is not null group by 1) x),
    'busquedas',     (select count(*) from s where tipo = 'busqueda'),
    'busquedas_top', (select coalesce(jsonb_agg(jsonb_build_object('texto', texto, 'n', n) order by n desc, texto), '[]') from
                        (select lower(detalle) texto, count(*) n from s
                          where tipo = 'busqueda' and detalle is not null
                          group by 1 order by 2 desc, 1 limit 20) x),
    'errores',       (select count(*) from s where tipo = 'error'),
    'errores_top',   (select coalesce(jsonb_agg(jsonb_build_object('texto', texto, 'n', n, 'aparatos', ap) order by n desc), '[]') from
                        (select detalle texto, count(*) n, string_agg(distinct dispositivo, ',') ap
                           from s where tipo = 'error' and detalle is not null
                          group by 1 order by 2 desc limit 10) x),
    'cuentas_nuevas',       (select count(*) from public.perfiles      where creado_at >= desde and creado_at < hasta),
    'avisos_nuevos',        (select count(*) from public.avisos_suscripciones where creado_at >= desde and creado_at < hasta),
    'materias_cargadas',    (select count(*) from public.cursada       where creado_at >= desde and creado_at < hasta),
    'faltas',               (select count(*) from public.falta         where creado_at >= desde and creado_at < hasta),
    'presentes',            (select count(*) from public.presente      where creado_at >= desde and creado_at < hasta),
    'guardados',            (select count(*) from public.guardados     where creado_at >= desde and creado_at < hasta),
    'ingresantes',          (select count(*) from public.ingresantes   where creado_at >= desde and creado_at < hasta),
    'consultas_avisanos',   (select count(*) from public.consultas     where creado_at >= desde and creado_at < hasta),
    'pedidos_buzon',        (select count(*) from public.buzon_pedidos where creado_at >= desde and creado_at < hasta)
  ) into d
  from (select 1) uno;

  d := d || jsonb_build_object('momento',
    case when en_curso or vieja is null or vieja->'momento' is null
           or vieja->'momento' = 'null'::jsonb then
      case when en_curso then jsonb_build_object(
        'cuentas_total',       (select count(*) from public.perfiles),
        'mi_ano_activos_7d',   (select count(*) from public.mi_ano where actualizado_at >= now() - interval '7 days'),
        'mi_ano_total',        (select count(*) from public.mi_ano),
        'avisos_total',        (select count(*) from public.avisos_suscripciones),
        'materias_total',      (select count(*) from public.cursada),
        'sacada_at',           to_char(now() at time zone zona, 'YYYY-MM-DD HH24:MI'))
      else 'null'::jsonb end
    else vieja->'momento' end);

  insert into public.numeros_semana (semana, completa, datos, actualizado_at)
  values (lunes, not en_curso, d, now())
  on conflict (semana) do update
     set completa = excluded.completa, datos = excluded.datos, actualizado_at = now();
end $$;

-- Recuenta de `desde` hasta la semana en curso. La lectura de los
-- domingos la llama con las últimas cuatro semanas: así, si un domingo
-- no corrió, el siguiente completa lo que faltó.
create or replace function public.guardar_semanas(desde date default (now() at time zone 'America/Argentina/Buenos_Aires')::date - 28)
returns int language plpgsql security definer set search_path = public as $$
declare l date; cuantas int := 0;
begin
  for l in select generate_series(date_trunc('week', desde)::date,
                                  date_trunc('week', (now() at time zone 'America/Argentina/Buenos_Aires'))::date,
                                  interval '7 days')::date
  loop
    perform public.guardar_semana(l);
    cuantas := cuantas + 1;
  end loop;
  return cuantas;
end $$;

revoke all on function public.guardar_semana(date)  from public, anon, authenticated;
revoke all on function public.guardar_semanas(date) from public, anon, authenticated;

-- Para mirar a mano:
--   select semana, completa, datos->>'visitas' visitas,
--          datos->'hitos'->>'volvió instalada' volvieron
--     from public.numeros_semana order by semana;
