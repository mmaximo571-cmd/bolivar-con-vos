-- ============================================================
-- CARTOGRAFÍAS SOCIALES  ·  mapas de un grupo, dibujados en conjunto
--
-- Una cátedra, una práctica o una organización del barrio arma su
-- cartografía de La Plata, Berisso o Ensenada: marca lugares (puntos),
-- recorridos (líneas) y territorios (zonas), y les pone qué son y qué
-- se dijo de ellos. La pantalla es `cartografias/`. La propuesta 5 de
-- `docs/PROPUESTAS.md` tiene el porqué de cada decisión.
--
-- LAS DECISIONES DE FONDO (Máximo, 18/11/2026):
--
--   1. GRUPOS CERRADOS. Quien crea una cartografía la coordina y
--      reparte un código; con el código se suma gente. Solo los del
--      grupo la ven y la dibujan. No pasa por moderación del equipo
--      porque no es pública: si algún día un grupo quiere publicarla,
--      eso es otra decisión y otra tanda.
--
--   2. PUNTOS, LÍNEAS Y ZONAS. Se guardan como geometría GeoJSON en
--      `jsonb` (sin PostGIS: no hace falta calcular nada en la base, y
--      el mapa ya habla GeoJSON). La base revisa la forma y que cada
--      vértice caiga en la zona de los tres partidos.
--
--   3. REFERENCIAS: un juego fijo + las propias. Las fijas viven en
--      `cartografias/referencias.js` y la base no las ata a una lista
--      (sumar una no obliga a correr SQL). Las propias de cada grupo
--      van en `cartografia_referencias` y las crea quien coordina.
--
--   4. El `id` de cada elemento lo pone el TELÉFONO, como en el mapa de
--      riesgo: el día que se dibuje sin señal y se mande después, el
--      reintento choca con la clave primaria en vez de duplicar.
--
-- Por qué todo entra por funciones `security definer`: las políticas de
-- una tabla que preguntan por la misma tabla se llaman a sí mismas
-- («infinite recursion detected in policy»). `es_de_la_cartografia` y
-- `coordina_la_cartografia` miran la lista de miembros sin pasar por sus
-- políticas, y todas las demás preguntan por ahí.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================


-- ============================================================
-- LAS TABLAS
-- ============================================================

create table if not exists public.cartografias (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null check (char_length(btrim(nombre)) between 3 and 80),
  descripcion  text not null default '' check (char_length(descripcion) <= 400),

  -- El código para sumarse. Seis letras sin las que se confunden al
  -- dictarlas en voz alta en un taller (ni I/1, ni O/0, ni L).
  codigo       text not null unique check (codigo ~ '^[A-HJKMNP-Z2-9]{6}$'),

  -- Quien la creó. `set null` y no `cascade`: si esa persona borra su
  -- cuenta, el mapa del grupo no se va con ella.
  creada_por   uuid default auth.uid() references auth.users(id) on delete set null,
  creada_at    timestamptz not null default now()
);

create table if not exists public.cartografia_miembros (
  cartografia  uuid not null references public.cartografias(id) on delete cascade,
  usuario      uuid not null references auth.users(id) on delete cascade,
  rol          text not null default 'participa' check (rol in ('coordina','participa')),
  sumado_at    timestamptz not null default now(),
  primary key (cartografia, usuario)
);
create index if not exists cartografia_miembros_usuario_idx
  on public.cartografia_miembros (usuario);

create table if not exists public.cartografia_referencias (
  id           uuid primary key default gen_random_uuid(),
  cartografia  uuid not null references public.cartografias(id) on delete cascade,
  nombre       text not null check (char_length(btrim(nombre)) between 2 and 40),
  -- El color sale de una paleta corta de `referencias.js`; acá solo se
  -- pide que sea un color, para no atar la base a esa lista.
  color        text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  creada_at    timestamptz not null default now()
);
create index if not exists cartografia_referencias_cartografia_idx
  on public.cartografia_referencias (cartografia);

create table if not exists public.cartografia_elementos (
  id           uuid primary key,                 -- lo pone el teléfono (ver 4.)
  cartografia  uuid not null references public.cartografias(id) on delete cascade,

  -- Quién lo dibujó. Lo completa la base sola. Se puede leer adentro del
  -- grupo, para saber qué es de uno (lo propio se edita y se borra), y
  -- no sale de ahí: la pantalla no muestra nombres.
  autor        uuid not null default auth.uid()
               references auth.users(id) on delete cascade,

  -- El id de una referencia fija (`recursos`, `conflictos`...) o el
  -- uuid de una propia del grupo. Texto suelto a propósito (ver 3.).
  referencia   text not null check (char_length(referencia) between 1 and 40),

  tipo         text not null check (tipo in ('punto','linea','zona')),
  geometria    jsonb not null,

  titulo       text not null check (char_length(btrim(titulo)) between 1 and 80),
  relato       text not null default '' check (char_length(relato) <= 1000),

  creado_en_dispositivo timestamptz not null,
  creado_at    timestamptz not null default now(),
  editado_at   timestamptz,
  esquema      smallint not null default 1
);
create index if not exists cartografia_elementos_cartografia_idx
  on public.cartografia_elementos (cartografia, creado_en_dispositivo);
create index if not exists cartografia_elementos_autor_idx
  on public.cartografia_elementos (autor);


-- ============================================================
-- LA GEOMETRÍA  ·  que tenga la forma que dice y caiga en la zona
--
-- La zona es la misma del mapa de riesgo (`sql/tabla-riesgo.sql`):
-- lat entre -35.25 y -34.70, lng entre -58.30 y -57.60. Hasta 500
-- vértices: un recorrido a mano en el teléfono no pasa de cincuenta, y
-- sin tope alguien podría mandar un megabyte de puntos.
-- ============================================================
create or replace function public.cartografia_geometria_valida(p_tipo text, g jsonb)
returns boolean language plpgsql immutable set search_path = public as $$
declare
  anillo jsonb;
  v jsonb;
  n int;
begin
  if g is null or jsonb_typeof(g) <> 'object' then return false; end if;

  if p_tipo = 'punto' then
    if g->>'type' <> 'Point' then return false; end if;
    anillo := jsonb_build_array(g->'coordinates');
  elsif p_tipo = 'linea' then
    if g->>'type' <> 'LineString' or jsonb_typeof(g->'coordinates') <> 'array' then return false; end if;
    anillo := g->'coordinates';
    if jsonb_array_length(anillo) < 2 then return false; end if;
  elsif p_tipo = 'zona' then
    -- Un solo anillo, sin agujeros: lo que se dibuja con el dedo.
    if g->>'type' <> 'Polygon' or jsonb_typeof(g->'coordinates') <> 'array'
       or jsonb_array_length(g->'coordinates') <> 1 then return false; end if;
    anillo := g->'coordinates'->0;
    if jsonb_typeof(anillo) <> 'array' then return false; end if;
    n := jsonb_array_length(anillo);
    -- Cuatro posiciones como mínimo (un triángulo cerrado) y cerrado:
    -- la primera igual a la última, como pide GeoJSON.
    if n < 4 or anillo->0 <> anillo->(n - 1) then return false; end if;
  else
    return false;
  end if;

  if jsonb_typeof(anillo) <> 'array' or jsonb_array_length(anillo) > 500 then return false; end if;

  for v in select * from jsonb_array_elements(anillo) loop
    if jsonb_typeof(v) <> 'array' or jsonb_array_length(v) <> 2
       or jsonb_typeof(v->0) <> 'number' or jsonb_typeof(v->1) <> 'number' then
      return false;
    end if;
    -- GeoJSON va [lng, lat], al revés que Leaflet.
    if (v->>0)::float8 not between -58.30 and -57.60
       or (v->>1)::float8 not between -35.25 and -34.70 then
      return false;
    end if;
  end loop;

  return true;
end $$;

alter table public.cartografia_elementos
  drop constraint if exists cartografia_elementos_geometria_ok;
alter table public.cartografia_elementos
  add constraint cartografia_elementos_geometria_ok
  check (public.cartografia_geometria_valida(tipo, geometria));


-- ============================================================
-- QUIÉN ES DE CADA CARTOGRAFÍA
-- ============================================================
create or replace function public.es_de_la_cartografia(p_cartografia uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cartografia_miembros
                 where cartografia = p_cartografia and usuario = auth.uid());
$$;

create or replace function public.coordina_la_cartografia(p_cartografia uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cartografia_miembros
                 where cartografia = p_cartografia and usuario = auth.uid()
                   and rol = 'coordina');
$$;

revoke execute on function public.es_de_la_cartografia(uuid) from public, anon;
revoke execute on function public.coordina_la_cartografia(uuid) from public, anon;
grant execute on function public.es_de_la_cartografia(uuid) to authenticated;
grant execute on function public.coordina_la_cartografia(uuid) to authenticated;


-- ============================================================
-- LOS PERMISOS
--
-- Primero se saca TODO: Supabase le da a `anon` y `authenticated`
-- permiso completo sobre cada tabla nueva. Sin cuenta no se ve nada.
-- ============================================================
alter table public.cartografias            enable row level security;
alter table public.cartografia_miembros    enable row level security;
alter table public.cartografia_referencias enable row level security;
alter table public.cartografia_elementos   enable row level security;

revoke all on public.cartografias            from anon, authenticated;
revoke all on public.cartografia_miembros    from anon, authenticated;
revoke all on public.cartografia_referencias from anon, authenticated;
revoke all on public.cartografia_elementos   from anon, authenticated;

-- Las cartografías se crean por `crear_cartografia` (que además suma a
-- quien la crea como coordinador, en la misma transacción). Acá solo
-- se lee, se cambia el nombre y se borra.
grant select on public.cartografias to authenticated;
grant update (nombre, descripcion) on public.cartografias to authenticated;
grant delete on public.cartografias to authenticated;

-- A los miembros se entra por `sumarme_a_cartografia`. Se lee para
-- contar cuántos son y saber el rol propio; se borra para irse.
grant select on public.cartografia_miembros to authenticated;
grant delete on public.cartografia_miembros to authenticated;

grant select on public.cartografia_referencias to authenticated;
grant insert (cartografia, nombre, color) on public.cartografia_referencias to authenticated;
grant update (nombre, color) on public.cartografia_referencias to authenticated;
grant delete on public.cartografia_referencias to authenticated;

grant select on public.cartografia_elementos to authenticated;
grant insert (id, cartografia, referencia, tipo, geometria, titulo, relato,
              creado_en_dispositivo, esquema)
  on public.cartografia_elementos to authenticated;
grant update (referencia, geometria, titulo, relato, editado_at)
  on public.cartografia_elementos to authenticated;
grant delete on public.cartografia_elementos to authenticated;


-- ---------- cartografias ----------
drop policy if exists "cartografias las ve el grupo" on public.cartografias;
create policy "cartografias las ve el grupo"
  on public.cartografias for select to authenticated
  using (public.es_de_la_cartografia(id));

drop policy if exists "cartografias las cambia quien coordina" on public.cartografias;
create policy "cartografias las cambia quien coordina"
  on public.cartografias for update to authenticated
  using (public.coordina_la_cartografia(id))
  with check (public.coordina_la_cartografia(id));

drop policy if exists "cartografias las borra quien coordina" on public.cartografias;
create policy "cartografias las borra quien coordina"
  on public.cartografias for delete to authenticated
  using (public.coordina_la_cartografia(id));


-- ---------- cartografia_miembros ----------
drop policy if exists "miembros los ve el grupo" on public.cartografia_miembros;
create policy "miembros los ve el grupo"
  on public.cartografia_miembros for select to authenticated
  using (public.es_de_la_cartografia(cartografia));

-- Irse: cualquiera que participa. Quien coordina no se va así, porque
-- el mapa quedaría sin nadie que lo cuide: lo borra, o (otra tanda) le
-- pasa la coordinación a alguien. Sacar a alguien: quien coordina.
drop policy if exists "miembros irse o sacar" on public.cartografia_miembros;
create policy "miembros irse o sacar"
  on public.cartografia_miembros for delete to authenticated
  using (
    (usuario = auth.uid() and rol = 'participa')
    or (rol = 'participa' and public.coordina_la_cartografia(cartografia))
  );


-- ---------- cartografia_referencias ----------
drop policy if exists "referencias las ve el grupo" on public.cartografia_referencias;
create policy "referencias las ve el grupo"
  on public.cartografia_referencias for select to authenticated
  using (public.es_de_la_cartografia(cartografia));

drop policy if exists "referencias las arma quien coordina" on public.cartografia_referencias;
create policy "referencias las arma quien coordina"
  on public.cartografia_referencias for insert to authenticated
  with check (public.coordina_la_cartografia(cartografia)
              and (select count(*) from public.cartografia_referencias r
                   where r.cartografia = cartografia_referencias.cartografia) < 20);

drop policy if exists "referencias las cambia quien coordina" on public.cartografia_referencias;
create policy "referencias las cambia quien coordina"
  on public.cartografia_referencias for update to authenticated
  using (public.coordina_la_cartografia(cartografia))
  with check (public.coordina_la_cartografia(cartografia));

drop policy if exists "referencias las borra quien coordina" on public.cartografia_referencias;
create policy "referencias las borra quien coordina"
  on public.cartografia_referencias for delete to authenticated
  using (public.coordina_la_cartografia(cartografia));


-- ---------- cartografia_elementos ----------
drop policy if exists "elementos los ve el grupo" on public.cartografia_elementos;
create policy "elementos los ve el grupo"
  on public.cartografia_elementos for select to authenticated
  using (public.es_de_la_cartografia(cartografia));

-- Dibuja cualquiera del grupo, a nombre propio, con una fecha de
-- dispositivo que tenga sentido (hasta 30 días guardado sin señal).
drop policy if exists "elementos dibuja el grupo" on public.cartografia_elementos;
create policy "elementos dibuja el grupo"
  on public.cartografia_elementos for insert to authenticated
  with check (
    autor = auth.uid()
    and public.es_de_la_cartografia(cartografia)
    and creado_en_dispositivo between now() - interval '30 days'
                                  and now() + interval '1 day'
  );

-- Lo propio lo cambia quien lo dibujó, mientras siga en el grupo.
drop policy if exists "elementos cambia quien lo dibujo" on public.cartografia_elementos;
create policy "elementos cambia quien lo dibujo"
  on public.cartografia_elementos for update to authenticated
  using (autor = auth.uid() and public.es_de_la_cartografia(cartografia))
  with check (autor = auth.uid() and public.es_de_la_cartografia(cartografia));

-- Borra quien lo dibujó o quien coordina (para limpiar lo que no va).
drop policy if exists "elementos borra quien lo dibujo o coordina" on public.cartografia_elementos;
create policy "elementos borra quien lo dibujo o coordina"
  on public.cartografia_elementos for delete to authenticated
  using (
    (autor = auth.uid() and public.es_de_la_cartografia(cartografia))
    or public.coordina_la_cartografia(cartografia)
  );


-- ============================================================
-- CREAR UNA CARTOGRAFÍA
--
-- La crea y suma a quien la crea como coordinador, todo junto: si se
-- hiciera en dos pedidos desde el teléfono y el segundo no llegara,
-- quedaría un mapa sin nadie adentro que nadie puede ver ni borrar.
-- ============================================================
create or replace function public.crear_cartografia(p_nombre text, p_descripcion text default '')
returns table (id uuid, codigo text)
language plpgsql security definer set search_path = public as $fn$
declare
  v_yo uuid := auth.uid();
  v_id uuid;
  v_codigo text;
  letras constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i int;
begin
  if v_yo is null then raise exception 'falta sesion'; end if;

  -- Diez por persona: más es un error de la app o alguien jugando.
  if (select count(*) from public.cartografia_miembros m
      where m.usuario = v_yo and m.rol = 'coordina') >= 10 then
    raise exception 'demasiadas cartografias';
  end if;

  loop
    v_codigo := '';
    for i in 1..6 loop
      v_codigo := v_codigo || substr(letras, 1 + floor(random() * length(letras))::int, 1);
    end loop;
    exit when not exists (select 1 from public.cartografias c where c.codigo = v_codigo);
  end loop;

  insert into public.cartografias (nombre, descripcion, codigo, creada_por)
  values (btrim(p_nombre), coalesce(btrim(p_descripcion), ''), v_codigo, v_yo)
  returning cartografias.id into v_id;

  insert into public.cartografia_miembros (cartografia, usuario, rol)
  values (v_id, v_yo, 'coordina');

  return query select v_id, v_codigo;
end $fn$;

revoke execute on function public.crear_cartografia(text, text) from public, anon;
grant execute on function public.crear_cartografia(text, text) to authenticated;


-- ============================================================
-- SUMARSE CON EL CÓDIGO
--
-- Devuelve el id de la cartografía, o nada si el código no existe. No
-- tira error con un código malo a propósito: el intento fallido tiene
-- que quedar anotado, y un error desharía la anotación.
--
-- EL FRENO. El código tiene seis letras de un alfabeto de 31: unos
-- 887 millones de combinaciones. Con veinte intentos fallidos por hora
-- por persona, probarlos todos lleva miles de años.
-- ============================================================
create table if not exists public.cartografia_intentos (
  usuario  uuid not null references auth.users(id) on delete cascade,
  en       timestamptz not null default now()
);
create index if not exists cartografia_intentos_idx
  on public.cartografia_intentos (usuario, en);
alter table public.cartografia_intentos enable row level security;
revoke all on public.cartografia_intentos from anon, authenticated;
-- Sin políticas: solo la toca la función de abajo.

create or replace function public.sumarme_a_cartografia(p_codigo text)
returns uuid
language plpgsql security definer set search_path = public as $fn$
declare
  v_yo uuid := auth.uid();
  v_id uuid;
  v_codigo text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if v_yo is null then raise exception 'falta sesion'; end if;

  if (select count(*) from public.cartografia_intentos
      where usuario = v_yo and en > now() - interval '1 hour') >= 20 then
    raise exception 'demasiados intentos';
  end if;

  select c.id into v_id from public.cartografias c where c.codigo = v_codigo;

  if v_id is null then
    insert into public.cartografia_intentos (usuario) values (v_yo);
    -- De paso se limpia lo viejo: no sirve para nada pasada la hora.
    delete from public.cartografia_intentos where en < now() - interval '1 day';
    return null;
  end if;

  -- Si ya estaba, no cambia nada (ni le baja el rol a quien coordina).
  insert into public.cartografia_miembros (cartografia, usuario, rol)
  values (v_id, v_yo, 'participa')
  on conflict (cartografia, usuario) do nothing;

  return v_id;
end $fn$;

revoke execute on function public.sumarme_a_cartografia(text) from public, anon;
grant execute on function public.sumarme_a_cartografia(text) to authenticated;


-- ============================================================
-- UN FRENO PARA DIBUJAR  ·  ciento veinte por hora por persona
--
-- Un taller de cartografía con un teléfono que pasa de mano en mano
-- puede cargar mucho en una hora, por eso el doble que el mapa de
-- riesgo. El mensaje empieza con «demasiados», como allá.
-- ============================================================
create or replace function public.cartografia_freno()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.cartografia_elementos
      where autor = new.autor and creado_at > now() - interval '1 hour') >= 120 then
    raise exception 'demasiados elementos en una hora';
  end if;
  return new;
end $$;

revoke execute on function public.cartografia_freno() from public, anon, authenticated;

drop trigger if exists cartografia_freno on public.cartografia_elementos;
create trigger cartografia_freno before insert on public.cartografia_elementos
  for each row execute function public.cartografia_freno();
