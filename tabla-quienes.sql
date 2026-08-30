-- ============================================================
-- EL «¿QUIÉNES SOMOS?», EDITABLE DESDE EL PANEL
--
-- Era la única pantalla que había que editar tocando el archivo, y no
-- tiene sentido: el texto lo escribe la agrupación, no quien programa.
--
-- Es UNA SOLA FILA. No es una lista de cosas como los trámites: es una
-- página. Por eso la tabla tiene un candado (solo_una) que impide que
-- se cargue una segunda por error.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

create table if not exists public.pagina_quienes (
  solo_una      boolean primary key default true check (solo_una),

  -- La frase que va debajo del título
  bajada        text not null default '',

  -- Los bloques de texto:
  -- [ { "titulo": "Por qué hicimos esta app",
  --     "parrafos": ["...", "..."] } ]
  bloques       jsonb not null default '[]'::jsonb,

  -- Dónde encontrarlos: [ { "nombre": "Instagram", "url": "https://..." } ]
  redes         jsonb not null default '[]'::jsonb,

  -- El llamado del final. null si no lo quieren.
  -- { "titulo": "Sumate", "texto": "...", "boton": "...", "url": "https://..." }
  sumate        jsonb,

  actualizado_at timestamptz not null default now()
);

alter table public.pagina_quienes enable row level security;

grant select on public.pagina_quienes to anon, authenticated;
grant insert, update on public.pagina_quienes to authenticated;

-- Cualquiera lee: es una página pública.
drop policy if exists "quienes lectura publica" on public.pagina_quienes;
create policy "quienes lectura publica"
  on public.pagina_quienes for select using (true);

drop policy if exists "quienes el equipo escribe" on public.pagina_quienes;
create policy "quienes el equipo escribe"
  on public.pagina_quienes for insert to authenticated
  with check (exists (select 1 from public.perfiles
                      where id = auth.uid() and rol = 'equipo'));

drop policy if exists "quienes el equipo edita" on public.pagina_quienes;
create policy "quienes el equipo edita"
  on public.pagina_quienes for update to authenticated
  using (exists (select 1 from public.perfiles
                 where id = auth.uid() and rol = 'equipo'));

-- La fecha de modificación se pone sola
create or replace function public.tocar_quienes()
returns trigger language plpgsql as $$
begin
  new.actualizado_at = now();
  return new;
end $$;

drop trigger if exists al_tocar_quienes on public.pagina_quienes;
create trigger al_tocar_quienes before update on public.pagina_quienes
  for each row execute function public.tocar_quienes();

-- ============================================================
-- Se carga con lo que HOY dice la pantalla, para no empezar en blanco
-- y para que el cambio no se note hasta que ustedes lo editen.
-- ============================================================
insert into public.pagina_quienes (solo_una, bajada, bloques, redes, sumate)
select true,
  'Somos la Agrupación Simón Bolívar. Conducimos el Centro de Estudiantes de la Facultad de Trabajo Social de la UNLP, y esta app la hacemos nosotras y nosotros.',
  '[
    {"titulo":"Por qué hicimos esta app",
     "parrafos":[
       "La información de la facultad existe, pero está desparramada: un poco en la página, un poco en un PDF, un poco en un grupo de WhatsApp que alguien te tiene que pasar. Perderse una fecha por no haberla visto a tiempo te puede costar un cuatrimestre.",
       "Así que juntamos todo en un solo lugar y lo escribimos como se lo contaríamos a una compañera. Sin registrarte y sin dar datos."]},
    {"titulo":"Esta parte todavía la estamos escribiendo",
     "parrafos":[
       "Nos falta contar quiénes somos, desde cuándo existe la agrupación y qué hacemos desde el Centro de Estudiantes. Preferimos dejarlo en blanco antes que llenarlo con cualquier cosa.",
       "Mientras tanto, si querés saber más o darnos una mano, escribinos por Instagram: ahí contestamos."]}
  ]'::jsonb,
  '[
    {"nombre":"Instagram","url":"https://www.instagram.com/SimonBolivarfts"},
    {"nombre":"Facebook","url":"https://www.facebook.com/SimonBolivarfts"},
    {"nombre":"Todos nuestros links","url":"https://linktr.ee/SimonBolivarfts"}
  ]'::jsonb,
  '{"titulo":"Sumate",
    "texto":"Si algo de acá adentro está mal, falta o se puede explicar mejor, decinos. Y si querés participar de la agrupación, escribinos y te contamos cuándo nos juntamos.",
    "boton":"Escribinos por Instagram",
    "url":"https://www.instagram.com/SimonBolivarfts"}'::jsonb
where not exists (select 1 from public.pagina_quienes);
