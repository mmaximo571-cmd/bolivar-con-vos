-- ============================================================
-- EL DEPÓSITO DE FOTOS
--
-- Hasta ahora, poner una foto en la app significaba dejar el archivo en
-- la carpeta del proyecto y publicar de nuevo. O sea: pasaba por quien
-- programa, y una foto de una jornada llegaba a la app una semana
-- después. Con esto la agrupación sube la foto desde el panel, con el
-- celular, y aparece sola.
--
-- Mismo candado doble que el resto de la app: cualquiera MIRA, porque
-- «¿Quiénes somos?» y el Consejo son pantallas públicas, pero solo el
-- equipo SUBE Y BORRA.
--
-- El límite de 3 MB no es tacañería: las fotos se achican en el
-- teléfono ANTES de subir (a 1600px de lado, unos 250 KB). El límite
-- está para que nada raro se cuele si eso falla.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 3145728,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 3145728,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Cualquiera mira: las fotos se ven en pantallas abiertas.
drop policy if exists "fotos lectura publica" on storage.objects;
create policy "fotos lectura publica"
  on storage.objects for select
  using (bucket_id = 'fotos');

-- Solo el equipo sube.
drop policy if exists "fotos el equipo sube" on storage.objects;
create policy "fotos el equipo sube"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'equipo'));

-- Solo el equipo reemplaza.
drop policy if exists "fotos el equipo reemplaza" on storage.objects;
create policy "fotos el equipo reemplaza"
  on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'equipo'));

-- Solo el equipo borra. Esto importa más de lo que parece: si una
-- compañera pide que saquen su foto, tiene que poder desaparecer
-- rápido y de verdad, no solo dejar de mostrarse.
drop policy if exists "fotos el equipo borra" on storage.objects;
create policy "fotos el equipo borra"
  on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'equipo'));
