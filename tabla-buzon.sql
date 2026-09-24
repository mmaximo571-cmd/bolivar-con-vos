-- ============================================================
-- EL BUZÓN «DECILO»  ·  pedidos, reclamos y propuestas
--
-- Cualquier estudiante, sin cuenta, deja un pedido. Se le pide solo la
-- carrera: el anonimato es a propósito. El equipo de comunicación lo
-- modera y, si se publica, queda en un tablero público con su estado
-- (recibido · en gestión · resuelto) y la fecha de cada cambio, más los
-- totales de `buzon_totales`. Plan completo: «Hacia las elecciones» en
-- BITACORA.md.
--
-- Tres tablas y una vista:
--
--   buzon_categorias  -> de qué se puede pedir. Solo se abren las que
--                        tienen a alguien del CEFTS que las resuelva.
--   buzon_pedidos     -> los pedidos. Escribe cualquiera; se lee sin
--                        cuenta SOLO lo publicado.
--   buzon_totales     -> la vista con los números del tablero.
--
-- Y un rol nuevo en `perfiles`, `comunicacion`: modera el buzón y carga
-- novedades, nada más. El alta es a mano, como la del equipo (ver al
-- final de este archivo).
--
-- LO QUE HACE SEGURO ESCRIBIR SIN CUENTA (lección del 2/9, ver
-- tabla-avisanos.sql): quien no tiene cuenta puede mandar SOLO cuatro
-- columnas (texto, categoria, carrera, aviso_endpoint) y las cuatro
-- tienen tope de largo. El resto (estado, publicado, respuesta, fechas)
-- ni se le deja tocar, y además el disparador de entrada lo pisa.
-- El caudal tiene freno: un tope de pedidos por hora para todo el buzón.
--
-- EL AVISO AL AUTOR. Si quien deja el pedido prende «avisame cuando
-- cambie», la app manda el endpoint de SU teléfono (el mismo que ya
-- guardó `guardar_aviso`). La base lo busca en `avisos_suscripciones`,
-- se queda con el número de fila y BORRA el endpoint: el timbre no se
-- guarda dos veces ni queda en una tabla que el equipo lee. Si el
-- endpoint no existe, el pedido entra igual, sin aviso. Se ata al
-- teléfono, no a la persona.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
--
-- ESTADO: aplicado en producción el 24/9/2026 (migraciones `tabla_buzon` y
-- `tabla_buzon_alarma_explicita`).
-- Las categorías quedan CERRADAS hasta que llegue la lista del CEFTS.
-- ============================================================


-- ============================================================
-- 1. EL ROL `comunicacion`
--
-- Hoy el único rol con permisos es `equipo`, que edita todo. Este es
-- más chico a propósito: la bandeja del buzón y Novedades. No toca
-- fechas, mesas, trámites ni nada más.
-- ============================================================
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check
  check (rol in ('estudiante', 'equipo', 'comunicacion'));

create or replace function public.es_comunicacion()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles p
                  where p.id = auth.uid() and p.rol = 'comunicacion');
$$;

-- Quién modera el buzón: el equipo entero y comunicación.
create or replace function public.modera_buzon()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles p
                  where p.id = auth.uid() and p.rol in ('equipo', 'comunicacion'));
$$;

revoke all on function public.es_comunicacion() from public, anon;
revoke all on function public.modera_buzon()    from public, anon;
grant execute on function public.es_comunicacion() to authenticated;
grant execute on function public.modera_buzon()    to authenticated;

-- NOVEDADES. Comunicación carga, edita y borra publicaciones de tipo
-- 'novedad', y ninguna otra: los eventos y las fechas alimentan las
-- alarmas de inscripción, y eso sigue siendo del equipo. Tampoco puede
-- ponerle alarma a una novedad. Sí puede marcar `avisar`: para eso
-- está la novedad.
--
-- OJO: `alarma` tiene que venir en 'ninguna', NO en null. Con null, la
-- app y la función de avisos miran el título, y una novedad que se
-- llame «Inscripción a la mesa…» haría sonar la alarma de mesas en
-- todos los teléfonos (lo encontró el /security-review del 24/9). La
-- bandeja del panel tiene que mandar alarma = 'ninguna'.
drop policy if exists "publicaciones comunicacion ve novedades" on public.publicaciones;
create policy "publicaciones comunicacion ve novedades"
  on public.publicaciones for select to authenticated
  using (public.es_comunicacion() and tipo = 'novedad');

drop policy if exists "publicaciones comunicacion carga novedades" on public.publicaciones;
create policy "publicaciones comunicacion carga novedades"
  on public.publicaciones for insert to authenticated
  with check (public.es_comunicacion() and tipo = 'novedad'
              and alarma = 'ninguna');

drop policy if exists "publicaciones comunicacion edita novedades" on public.publicaciones;
create policy "publicaciones comunicacion edita novedades"
  on public.publicaciones for update to authenticated
  using (public.es_comunicacion() and tipo = 'novedad')
  with check (public.es_comunicacion() and tipo = 'novedad'
              and alarma = 'ninguna');

drop policy if exists "publicaciones comunicacion borra novedades" on public.publicaciones;
create policy "publicaciones comunicacion borra novedades"
  on public.publicaciones for delete to authenticated
  using (public.es_comunicacion() and tipo = 'novedad');


-- ============================================================
-- 2. LAS CATEGORÍAS
--
-- La lista la arma el CEFTS: solo se abre una categoría si hay alguien
-- que la resuelva. Un buzón que recibe pedidos que nadie puede gestionar
-- es peor que no tener buzón. Abrir o cerrar una es cambiar `abierta`,
-- sin tocar código; cerrarla no borra los pedidos que ya tiene.
-- ============================================================
create table if not exists public.buzon_categorias (
  clave       text primary key check (clave ~ '^[a-z0-9-]{2,30}$'),
  nombre      text not null check (char_length(nombre) between 2 and 60),
  descripcion text check (char_length(descripcion) <= 200),
  abierta     boolean not null default false,
  orden       int not null default 0
);

alter table public.buzon_categorias enable row level security;

revoke all on public.buzon_categorias from anon, authenticated;
grant select on public.buzon_categorias to anon, authenticated;
grant insert, update, delete on public.buzon_categorias to authenticated;

drop policy if exists "buzon categorias abiertas" on public.buzon_categorias;
create policy "buzon categorias abiertas"
  on public.buzon_categorias for select
  using (abierta);

-- Moderar incluye ver las cerradas: el tablero muestra pedidos viejos
-- de una categoría que ya se cerró.
drop policy if exists "buzon categorias las ve quien modera" on public.buzon_categorias;
create policy "buzon categorias las ve quien modera"
  on public.buzon_categorias for select to authenticated
  using (public.modera_buzon());

drop policy if exists "buzon categorias las edita el equipo" on public.buzon_categorias;
create policy "buzon categorias las edita el equipo"
  on public.buzon_categorias for all to authenticated
  using (public.es_equipo())
  with check (public.es_equipo());


-- ============================================================
-- 3. LOS PEDIDOS
-- ============================================================
create table if not exists public.buzon_pedidos (
  id          bigint generated by default as identity primary key,

  -- Lo que escribe el estudiante. Los topes van en la tabla y no solo en
  -- la política, así valen para todo el mundo, incluido el panel.
  texto       text not null check (char_length(texto) between 10 and 800),
  categoria   text not null references public.buzon_categorias(clave)
              on update cascade,
  carrera     text check (carrera in ('ts', 'tgcr', 'fono')),

  estado      text not null default 'recibido'
              check (estado in ('recibido', 'en_gestion', 'resuelto', 'descartado')),
  publicado   boolean not null default false,
  respuesta   text check (char_length(respuesta) <= 1000),

  -- Una fecha por cambio. Las pone el disparador de moderación, nunca
  -- la app: así el tablero no puede mostrar una fecha acomodada.
  creado_at            timestamptz not null default now(),
  primera_respuesta_at timestamptz,   -- el primer movimiento del equipo (meta: < 48 h)
  en_gestion_at        timestamptz,
  resuelto_at          timestamptz,
  descartado_at        timestamptz,
  publicado_at         timestamptz,
  respondido_at        timestamptz,   -- la última vez que cambió `respuesta`

  -- El aviso al autor (ver arriba). `aviso_endpoint` entra y se borra
  -- en el mismo instante: siempre queda en null.
  suscripcion_id  bigint references public.avisos_suscripciones(id) on delete set null,
  aviso_endpoint  text check (aviso_endpoint is null),
  pidio_aviso     boolean generated always as (suscripcion_id is not null) stored,

  moderado_por uuid references auth.users(id) on delete set null,

  -- Un pedido descartado no se publica.
  constraint buzon_descartado_no_se_publica check (not (publicado and estado = 'descartado'))
);

create index if not exists buzon_pedidos_tablero_idx
  on public.buzon_pedidos (publicado, creado_at desc);
create index if not exists buzon_pedidos_bandeja_idx
  on public.buzon_pedidos (estado, creado_at);
create index if not exists buzon_pedidos_creado_idx
  on public.buzon_pedidos (creado_at);
create index if not exists buzon_pedidos_suscripcion_idx
  on public.buzon_pedidos (suscripcion_id) where suscripcion_id is not null;

alter table public.buzon_pedidos enable row level security;


-- ------------------------------------------------------------
-- PERMISOS POR COLUMNA
--
-- Primero se saca TODO: Supabase le da a `anon` y `authenticated`
-- permiso completo sobre cada tabla nueva, y un permiso de tabla entera
-- pasa por encima de los permisos por columna.
--
-- `suscripcion_id` y `moderado_por` no los lee nadie desde la app. El
-- número de suscripción es la puerta al timbre de un teléfono; quien
-- manda los avisos entra con la clave de servicio.
-- ------------------------------------------------------------
revoke all on public.buzon_pedidos from anon, authenticated;

grant insert (texto, categoria, carrera, aviso_endpoint)
  on public.buzon_pedidos to anon, authenticated;

grant select (id, texto, categoria, carrera, estado, publicado, respuesta,
              creado_at, primera_respuesta_at, en_gestion_at, resuelto_at,
              descartado_at, publicado_at, respondido_at)
  on public.buzon_pedidos to anon;
grant select (id, texto, categoria, carrera, estado, publicado, respuesta,
              creado_at, primera_respuesta_at, en_gestion_at, resuelto_at,
              descartado_at, publicado_at, respondido_at, pidio_aviso)
  on public.buzon_pedidos to authenticated;

-- Moderar es mover el estado, publicar y responder. El texto del
-- estudiante no se edita: si trae algo que no puede salir, se descarta.
grant update (estado, publicado, respuesta) on public.buzon_pedidos to authenticated;
grant delete on public.buzon_pedidos to authenticated;


-- ------------------------------------------------------------
-- LAS POLÍTICAS
-- ------------------------------------------------------------

-- Cualquiera, con o sin cuenta, ve lo publicado.
drop policy if exists "buzon lectura publica" on public.buzon_pedidos;
create policy "buzon lectura publica"
  on public.buzon_pedidos for select
  using (publicado);

drop policy if exists "buzon quien modera ve todo" on public.buzon_pedidos;
create policy "buzon quien modera ve todo"
  on public.buzon_pedidos for select to authenticated
  using (public.modera_buzon());

-- OJO CON ESTE PERMISO: escribe CUALQUIERA, sin cuenta. Los topes de
-- largo de las cuatro columnas están en la tabla (texto, carrera) y en
-- el disparador de entrada (aviso_endpoint, que se borra antes de que
-- miren la tabla y esta política). Acá va lo que no es de largo: que la
-- categoría exista y esté abierta, y que entre sin moderar.
drop policy if exists "buzon cualquiera deja un pedido" on public.buzon_pedidos;
create policy "buzon cualquiera deja un pedido"
  on public.buzon_pedidos for insert to anon, authenticated
  with check (
        char_length(texto) between 10 and 800
    and exists (select 1 from public.buzon_categorias c
                 where c.clave = categoria and c.abierta)
    and estado = 'recibido'
    and publicado = false
    and respuesta is null
  );

drop policy if exists "buzon quien modera edita" on public.buzon_pedidos;
create policy "buzon quien modera edita"
  on public.buzon_pedidos for update to authenticated
  using (public.modera_buzon())
  with check (public.modera_buzon());

-- Borrar es para limpiar spam, y lo hace solo el equipo. Comunicación
-- descarta, que deja rastro en los totales.
drop policy if exists "buzon el equipo borra" on public.buzon_pedidos;
create policy "buzon el equipo borra"
  on public.buzon_pedidos for delete to authenticated
  using (public.es_equipo());


-- ------------------------------------------------------------
-- EL DISPARADOR DE ENTRADA  ·  freno de caudal y aviso
--
-- Va como `security definer` porque sin cuenta no se puede leer la tabla
-- ni `avisos_suscripciones`, y para contar y para buscar el timbre hay
-- que leerlas.
--
-- El tope es para todo el buzón y no por teléfono: sin cuenta no hay
-- forma honesta de saber quién es quién, y guardar la IP rompería el
-- anonimato que se promete. Treinta por hora es veinte veces lo que se
-- espera en el mejor día (la meta es 150 en un mes). Si alguien
-- automatiza, el buzón se traba una hora, pero la base no se llena.
-- ------------------------------------------------------------
create or replace function public.buzon_al_entrar()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ultimos int;
begin
  -- El endpoint no tiene columna con tope porque no se guarda: el tope
  -- va acá, antes de usarlo para buscar.
  if new.aviso_endpoint is not null
     and (char_length(new.aviso_endpoint) > 1000 or new.aviso_endpoint !~ '^https://') then
    raise exception 'El aviso no es válido.' using errcode = '22023';
  end if;

  select count(*) into ultimos
    from public.buzon_pedidos where creado_at > now() - interval '1 hour';
  if ultimos >= 30 then
    raise exception 'Llegaron demasiados pedidos juntos. Probá en un rato.' using errcode = '54000';
  end if;

  -- El mismo pedido repetido, que es lo que hace un botón trabado.
  if exists (select 1 from public.buzon_pedidos
              where texto = new.texto
                and creado_at > now() - interval '1 day') then
    raise exception 'Ese pedido ya llegó.' using errcode = '54000';
  end if;

  -- Entra como pedido nuevo, diga lo que diga quien lo manda.
  new.estado               := 'recibido';
  new.publicado            := false;
  new.respuesta            := null;
  new.creado_at            := now();
  new.primera_respuesta_at := null;
  new.en_gestion_at        := null;
  new.resuelto_at          := null;
  new.descartado_at        := null;
  new.publicado_at         := null;
  new.respondido_at        := null;
  new.moderado_por         := null;

  new.suscripcion_id := null;
  if new.aviso_endpoint is not null then
    select s.id into new.suscripcion_id
      from public.avisos_suscripciones s where s.endpoint = new.aviso_endpoint;
  end if;
  new.aviso_endpoint := null;

  return new;
end $$;

revoke all on function public.buzon_al_entrar() from public, anon, authenticated;

drop trigger if exists buzon_al_entrar on public.buzon_pedidos;
create trigger buzon_al_entrar
  before insert on public.buzon_pedidos
  for each row execute function public.buzon_al_entrar();


-- ------------------------------------------------------------
-- EL DISPARADOR DE MODERACIÓN  ·  las fechas de cada cambio
--
-- Un pedido no vuelve a «recibido»: una vez que el equipo lo movió, ya
-- tuvo respuesta, y el tablero no puede desdecirse.
-- ------------------------------------------------------------
create or replace function public.buzon_al_moderar()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.estado is distinct from old.estado then
    if new.estado = 'recibido' then
      raise exception 'Un pedido no vuelve a «recibido».' using errcode = '22023';
    end if;
    case new.estado
      when 'en_gestion' then new.en_gestion_at := now();
      when 'resuelto'   then new.resuelto_at   := now();
      when 'descartado' then new.descartado_at := now();
    end case;
    new.primera_respuesta_at := coalesce(old.primera_respuesta_at, now());
  end if;

  if new.respuesta is distinct from old.respuesta then
    new.respondido_at := now();
    if new.respuesta is not null then
      new.primera_respuesta_at := coalesce(new.primera_respuesta_at, now());
    end if;
  end if;

  if new.publicado and not old.publicado then
    new.publicado_at := coalesce(old.publicado_at, now());
  end if;

  if auth.uid() is not null then
    new.moderado_por := auth.uid();
  end if;

  return new;
end $$;

revoke all on function public.buzon_al_moderar() from public, anon, authenticated;

drop trigger if exists buzon_al_moderar on public.buzon_pedidos;
create trigger buzon_al_moderar
  before update on public.buzon_pedidos
  for each row execute function public.buzon_al_moderar();


-- ============================================================
-- 4. LOS TOTALES DEL TABLERO
--
-- Cuentan TODOS los pedidos, publicados o no: «llegaron 150» tiene que
-- ser verdad aunque se hayan publicado 40. Por eso la cuenta la hace
-- una función `security definer` que devuelve solo números; la vista
-- corre con los permisos de quien la mira (`security_invoker`) y no
-- abre nada más.
--
-- Los descartados no suman a «llegaron» (casi siempre son spam o
-- repetidos), pero se muestran aparte para que no parezca que se
-- esconden.
-- ============================================================
create or replace function public.buzon_totales_calc()
returns table (
  llegaron                 bigint,
  sin_respuesta            bigint,
  en_gestion               bigint,
  resueltos                bigint,
  descartados              bigint,
  publicados               bigint,
  respondidos_en_48h       bigint,
  horas_primera_respuesta  numeric,   -- mediana
  dias_hasta_resolver      numeric    -- mediana, solo de los resueltos
)
language sql stable security definer set search_path = public as $$
  select
    count(*) filter (where estado <> 'descartado'),
    count(*) filter (where estado = 'recibido' and primera_respuesta_at is null),
    count(*) filter (where estado = 'en_gestion'),
    count(*) filter (where estado = 'resuelto'),
    count(*) filter (where estado = 'descartado'),
    count(*) filter (where publicado),
    count(*) filter (where estado <> 'descartado'
                       and primera_respuesta_at <= creado_at + interval '48 hours'),
    round((percentile_cont(0.5) within group (
             order by extract(epoch from primera_respuesta_at - creado_at) / 3600)
           filter (where estado <> 'descartado' and primera_respuesta_at is not null)
          )::numeric, 1),
    round((percentile_cont(0.5) within group (
             order by extract(epoch from resuelto_at - creado_at) / 86400)
           filter (where estado = 'resuelto')
          )::numeric, 1)
  from public.buzon_pedidos;
$$;

revoke all on function public.buzon_totales_calc() from public;
grant execute on function public.buzon_totales_calc() to anon, authenticated;

create or replace view public.buzon_totales
  with (security_invoker = on) as
  select * from public.buzon_totales_calc();

revoke all on public.buzon_totales from anon, authenticated;
grant select on public.buzon_totales to anon, authenticated;


-- ============================================================
-- 5. DAR DE ALTA A ALGUIEN DE COMUNICACIÓN
--
-- Igual que al equipo (LEEME.md, «Dar de alta a alguien del equipo»),
-- pero con otro rol. La persona crea su cuenta desde la app y prende
-- los avisos; después, en el SQL Editor:
--
--   update public.perfiles set rol = 'comunicacion'
--   where id = (select id from auth.users where email = 'elcorreo@ejemplo.com');
--
-- Para abrir una categoría (cuando llegue la lista del CEFTS):
--
--   insert into public.buzon_categorias (clave, nombre, descripcion, abierta, orden)
--   values ('becas', 'Becas y comedor', 'Becas, comedor, boleto', true, 1);
--
-- Para comprobar que salió bien:
--   select * from public.buzon_totales;
--   select clave, abierta from public.buzon_categorias order by orden;
-- ============================================================
