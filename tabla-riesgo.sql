-- ============================================================
-- EL MAPA DE RIESGO  ·  mapeo participativo en las prácticas
--
-- Les estudiantes marcan, en La Plata, Berisso y Ensenada, lo que
-- ven en el barrio: dónde se inunda, dónde huele a petroquímica,
-- dónde hay un comedor. La pantalla es `mapa/`.
--
-- TRES DECISIONES DE FONDO (Máximo, 17/9/2026):
--
--   1. Carga quien tiene cuenta; ve todo el mundo, PERO solo lo que
--      el equipo aprobó. Un punto en un mapa público dice «acá vive
--      gente en riesgo» o «acá hay un comedor»: eso no se publica sin
--      que alguien lo mire antes. Se modera en el panel, pestaña 🗺.
--
--   2. El `id` lo inventa el TELÉFONO, no la base. En un barrio sin
--      señal el reporte se guarda en el teléfono y se manda después,
--      y a veces se manda dos veces: el pedido llegó pero la respuesta
--      se perdió en el camino. Con el id puesto de antemano, el segundo
--      intento choca contra la clave primaria (error 23505) y la app lo
--      toma como «ya estaba». Sin esto, cada reintento duplica el punto.
--
--   3. Nadie ve quién cargó qué. La columna `autor` existe para las
--      políticas y para borrar la cuenta, pero NO se le da permiso de
--      lectura a nadie (ver los `grant` por columna más abajo). Si se
--      pudiera leer, con dos puntos alcanza para seguirle el recorrido
--      a una persona por el barrio.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

create table if not exists public.reportes_riesgo (
  id           uuid primary key,              -- lo pone el teléfono (ver 2.)

  -- Quién lo cargó. Lo completa la base sola con la sesión: la app ni
  -- lo manda. Al borrar la cuenta se van sus reportes.
  autor        uuid not null default auth.uid()
               references auth.users(id) on delete cascade,

  -- La capa es fija (son los tres interruptores de la pantalla). La
  -- categoría NO se ata acá a una lista: vive en `mapa/capas.js`, y
  -- sumar una no tiene que obligar a correr SQL.
  capa         text not null check (capa in ('hidrico','industrial','redes')),
  categoria    text not null check (char_length(categoria) between 1 and 40),

  -- La zona con un poco de margen alrededor de los tres partidos. La
  -- app ya frena antes lo que cae afuera; esto es para que nadie cargue
  -- un punto en Córdoba salteándose la app.
  lat          double precision not null check (lat between -35.25 and -34.70),
  lng          double precision not null check (lng between -58.30 and -57.60),
  precision_m  real check (precision_m is null or precision_m >= 0),
  origen_ubicacion text not null default 'gps'
               check (origen_ubicacion in ('gps','mapa')),

  descripcion  text not null default '' check (char_length(descripcion) <= 280),

  estado       text not null default 'pendiente'
               check (estado in ('pendiente','aprobado','rechazado')),

  -- Dos fechas y no una: cuándo lo vio la persona (puede ser ayer, sin
  -- señal) y cuándo llegó. El mapa muestra la primera.
  creado_en_dispositivo timestamptz not null,
  creado_at    timestamptz not null default now(),

  revisado_por uuid references auth.users(id) on delete set null,
  revisado_at  timestamptz,

  -- Para cuando el reporte crezca (fotos, gravedad, barrio): la app
  -- sabe qué forma tiene cada fila sin adivinar por las columnas.
  esquema      smallint not null default 1
);

create index if not exists reportes_riesgo_estado_idx
  on public.reportes_riesgo (estado, capa, creado_en_dispositivo desc);
create index if not exists reportes_riesgo_autor_idx
  on public.reportes_riesgo (autor);

alter table public.reportes_riesgo enable row level security;


-- ============================================================
-- PERMISOS POR COLUMNA  ·  `autor` y `revisado_por` no se leen
-- ============================================================
-- Primero se saca TODO: Supabase le da a `anon` y `authenticated`
-- permiso completo sobre cada tabla nueva, y un permiso de tabla entera
-- pasa por encima de los permisos por columna de abajo.
revoke all on public.reportes_riesgo from anon, authenticated;
grant select (id, capa, categoria, lat, lng, precision_m, origen_ubicacion,
              descripcion, estado, creado_en_dispositivo, creado_at, revisado_at, esquema)
  on public.reportes_riesgo to anon, authenticated;
grant insert (id, capa, categoria, lat, lng, precision_m, origen_ubicacion,
              descripcion, creado_en_dispositivo, esquema)
  on public.reportes_riesgo to authenticated;
grant update (estado, revisado_por, revisado_at) on public.reportes_riesgo to authenticated;
grant delete on public.reportes_riesgo to authenticated;


-- ============================================================
-- LAS POLÍTICAS
-- ============================================================

-- Cualquiera, con o sin cuenta, ve lo aprobado.
drop policy if exists "riesgo lectura publica" on public.reportes_riesgo;
create policy "riesgo lectura publica"
  on public.reportes_riesgo for select
  using (estado = 'aprobado');

-- Quien lo cargó ve el suyo mientras espera: así el punto no
-- «desaparece» del mapa entre que lo manda y que lo aprueban.
drop policy if exists "riesgo cada quien ve lo suyo" on public.reportes_riesgo;
create policy "riesgo cada quien ve lo suyo"
  on public.reportes_riesgo for select to authenticated
  using (autor = auth.uid());

drop policy if exists "riesgo el equipo ve todo" on public.reportes_riesgo;
create policy "riesgo el equipo ve todo"
  on public.reportes_riesgo for select to authenticated
  using (exists (select 1 from public.perfiles
                 where id = auth.uid() and rol = 'equipo'));

-- Carga: solo a nombre propio, solo como pendiente, y con una fecha
-- de dispositivo que tenga sentido (hasta 30 días guardado sin señal).
drop policy if exists "riesgo carga con cuenta" on public.reportes_riesgo;
create policy "riesgo carga con cuenta"
  on public.reportes_riesgo for insert to authenticated
  with check (
    autor = auth.uid()
    and estado = 'pendiente'
    and creado_en_dispositivo between now() - interval '30 days'
                                  and now() + interval '1 day'
  );

drop policy if exists "riesgo el equipo modera" on public.reportes_riesgo;
create policy "riesgo el equipo modera"
  on public.reportes_riesgo for update to authenticated
  using (exists (select 1 from public.perfiles
                 where id = auth.uid() and rol = 'equipo'))
  with check (exists (select 1 from public.perfiles
                      where id = auth.uid() and rol = 'equipo'));

-- Borrar: el equipo cualquiera; cada quien el suyo mientras no se revisó.
drop policy if exists "riesgo borrar" on public.reportes_riesgo;
create policy "riesgo borrar"
  on public.reportes_riesgo for delete to authenticated
  using (
    (autor = auth.uid() and estado = 'pendiente')
    or exists (select 1 from public.perfiles
               where id = auth.uid() and rol = 'equipo')
  );


-- ============================================================
-- UN FRENO  ·  sesenta por hora por persona
--
-- Una práctica territorial carga, con suerte, veinte puntos en una
-- tarde. Sesenta en una hora es un error de la app o alguien jugando.
-- El mensaje empieza con «demasiados»: la app lo busca con esa palabra
-- y lo toma como «esperá y reintentá», no como un reporte roto.
-- ============================================================
create or replace function public.riesgo_freno()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reportes_riesgo
      where autor = new.autor and creado_at > now() - interval '1 hour') >= 60 then
    raise exception 'demasiados reportes en una hora';
  end if;
  return new;
end $$;

drop trigger if exists riesgo_freno on public.reportes_riesgo;
create trigger riesgo_freno before insert on public.reportes_riesgo
  for each row execute function public.riesgo_freno();
