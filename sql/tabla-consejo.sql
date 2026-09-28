-- ============================================================
-- LA PANTALLA DEL CONSEJO DIRECTIVO, Y LAS FOTOS
--
-- Se edita desde el panel, solapa «🏛 Consejo». Es UNA SOLA FILA, como
-- el «¿Quiénes somos?»: no es una lista de cosas, es una página.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

-- El titular es lo más grande de la pantalla: lo escribe la agrupación,
-- no queda clavado en el código. La barra | corta el renglón y lo que
-- va entre *asteriscos* sale en el color de acento.
alter table public.pagina_quienes
  add column if not exists titular text not null default 'Esta app es|la parte *chica*';
alter table public.pagina_quienes
  add column if not exists imagenes jsonb not null default '[]'::jsonb;

create table if not exists public.pagina_consejo (
  solo_una      boolean primary key default true check (solo_una),
  titular       text not null default 'El Consejo|*Directivo*',
  bajada        text not null default '',
  bloques       jsonb not null default '[]'::jsonb,
  -- [{ "anio":"2025", "titulo":"...", "detalle":"..." }]  del más viejo
  -- al más nuevo: así se dibuja la línea de tiempo.
  logros        jsonb not null default '[]'::jsonb,
  imagenes      jsonb not null default '[]'::jsonb,
  actualizado_at timestamptz not null default now()
);

alter table public.pagina_consejo enable row level security;
grant select on public.pagina_consejo to anon, authenticated;
grant insert, update on public.pagina_consejo to authenticated;

drop policy if exists "consejo lectura publica" on public.pagina_consejo;
create policy "consejo lectura publica" on public.pagina_consejo for select using (true);

drop policy if exists "consejo el equipo escribe" on public.pagina_consejo;
create policy "consejo el equipo escribe" on public.pagina_consejo for insert to authenticated
  with check (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'equipo'));

drop policy if exists "consejo el equipo edita" on public.pagina_consejo;
create policy "consejo el equipo edita" on public.pagina_consejo for update to authenticated
  using (exists (select 1 from public.perfiles where id = auth.uid() and rol = 'equipo'));

drop trigger if exists al_tocar_consejo on public.pagina_consejo;
create trigger al_tocar_consejo before update on public.pagina_consejo
  for each row execute function public.tocar_quienes();

-- Para comprobar que salió bien:
--   select titular, jsonb_array_length(logros) as logros from public.pagina_consejo;
