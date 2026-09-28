-- ============================================================
-- LO ÚLTIMO DE INSTAGRAM
--
-- La grilla «EN INSTAGRAM» del inicio se alimenta de esta tabla. La
-- pantalla estaba hecha y la tabla también, pero nadie la llenaba: la
-- función `traer-instagram` quedó escrita y sin programador que la
-- llame (`pg_cron` y `pg_net` no están instalados en el proyecto), así
-- que la sección nunca se mostró. No falla a la vista: si no hay
-- filas, el inicio la esconde y sigue como si nada.
--
-- Esto agrega lo que faltaba para cargar los posteos A MANO desde el
-- panel. Es una decisión, no un parche hasta que ande lo otro:
--
--   - La API que servía para esto (Instagram Basic Display) está dada
--     de baja desde diciembre de 2024. La que la reemplaza pide cuenta
--     de empresa, una app de Meta, revisión, y un token que vence cada
--     60 días. Si el token se vence un martes, la sección desaparece
--     sola y nadie se entera hasta que alguien mire el inicio.
--   - Cargando a mano, la agrupación ELIGE qué placa va y cuándo la
--     saca. Para el 21 eso es mejor que «las últimas seis».
--
-- Si algún día la función automática se pone a andar, escribe en esta
-- misma tabla y nada de esto se tira. Ojo con una sola cosa: el `id`
-- que pone la API es el número interno del posteo, y el que pone el
-- panel es el código que se lee en el link (`/p/ESTO/`). El mismo
-- posteo cargado por los dos caminos entraría dos veces.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

create table if not exists public.posteos_ig (
  id           text primary key,
  permalink    text not null,
  tipo         text not null default 'IMAGE',
  epigrafe     text not null default '',
  imagen       text,
  publicado_at timestamptz,
  traido_at    timestamptz not null default now()
);

-- Los carruseles (19/9/2026). `imagen` sigue siendo LA PORTADA y no se
-- toca: es lo que lee el inicio y lo que leería la función automática
-- si algún día arranca. `imagenes` guarda la serie entera, en orden y
-- con la portada primero, así el contador «1/5» sale de contar y no de
-- un número escrito a mano, que puede quedar viejo.
--
-- En el inicio se ve SOLO la portada. Las demás se guardan igual: el
-- día que se muestren adentro de la app no hay que volver a cargar
-- nada, y mientras tanto no cuestan nada más que depósito.
alter table public.posteos_ig
  add column if not exists imagenes text[];

alter table public.posteos_ig enable row level security;

-- Los permisos de tabla, que son otra cosa que las políticas y se
-- olvidan seguido: sin esto PostgREST corta antes de llegar a mirar
-- las políticas y el panel recibe un «permission denied» pelado. La
-- tabla se había creado para que la llenara solamente la función
-- automática, que entra con la llave de servicio, así que
-- `authenticated` tenía nada más que lectura.
--
-- A `anon` no se le da escritura: quien no entró con cuenta no carga
-- posteos, y que no pueda por los DOS lados —permiso y política— es
-- mejor que confiar en uno solo.
grant insert, update, delete on public.posteos_ig to authenticated;

-- Cualquiera mira: la grilla vive en el inicio, que se ve sin cuenta.
drop policy if exists "posteos lectura publica" on public.posteos_ig;
create policy "posteos lectura publica"
  on public.posteos_ig for select
  using (true);

-- Solo el equipo carga. Mismo candado que el resto de las tablas del
-- panel: se pregunta por el rol en `perfiles`, no por tener cuenta.
drop policy if exists "posteos el equipo carga" on public.posteos_ig;
create policy "posteos el equipo carga"
  on public.posteos_ig for insert to authenticated
  with check (exists (select 1 from public.perfiles
                      where id = auth.uid() and rol = 'equipo'));

drop policy if exists "posteos el equipo corrige" on public.posteos_ig;
create policy "posteos el equipo corrige"
  on public.posteos_ig for update to authenticated
  using (exists (select 1 from public.perfiles
                 where id = auth.uid() and rol = 'equipo'))
  with check (exists (select 1 from public.perfiles
                      where id = auth.uid() and rol = 'equipo'));

-- Sacar un posteo tiene que ser un botón y no un pedido: si se
-- publicó una placa con un error, o alguien pide que saquen su cara
-- de la foto, no se puede depender de que quien programa esté
-- despierto.
drop policy if exists "posteos el equipo saca" on public.posteos_ig;
create policy "posteos el equipo saca"
  on public.posteos_ig for delete to authenticated
  using (exists (select 1 from public.perfiles
                 where id = auth.uid() and rol = 'equipo'));

-- El orden de la grilla. Con seis filas no cambia nada; con dos años
-- de posteos encima, sí.
create index if not exists posteos_ig_publicado_idx
  on public.posteos_ig (publicado_at desc);
