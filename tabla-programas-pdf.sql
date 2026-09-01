-- ============================================================
-- EL DEPÓSITO DE PROGRAMAS EN PDF
--
-- Hasta ahora un programa se cargaba pegando el texto a mano en el
-- panel: una hora por materia y cincuenta y tres materias. Con esto se
-- arrastran los PDFs, la app los lee sola y guarda las unidades.
--
-- Y guarda TAMBIÉN el PDF original, que es lo que va acá. Las dos
-- cosas hacen falta y no son la misma:
--
--   `unidades`  -> el programa desarmado en unidades y textos. Es lo
--                  que se puede tildar al preparar un final.
--   el PDF      -> el papel oficial de la cátedra, tal cual. Es lo
--                  que se muestra si alguien duda de si la app leyó
--                  bien, y lo que se lleva a Alumnado para legalizar.
--
-- Mismo candado doble que el resto: cualquiera MIRA (el programa es
-- público, cuelga de la página de la facultad), solo el equipo SUBE.
--
-- El límite de 15 MB es holgado a propósito: algunos programas vienen
-- escaneados y pesan. No se achican como las fotos porque un programa
-- comprimido se vuelve ilegible.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================


-- ---------- 1. Dónde vive el archivo ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('programas', 'programas', true, 15728640, array['application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = 15728640,
      allowed_mime_types = array['application/pdf'];

drop policy if exists "programas lectura publica" on storage.objects;
create policy "programas lectura publica"
  on storage.objects for select
  using (bucket_id = 'programas');

drop policy if exists "programas el equipo sube" on storage.objects;
create policy "programas el equipo sube"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'programas' and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'equipo'));

drop policy if exists "programas el equipo reemplaza" on storage.objects;
create policy "programas el equipo reemplaza"
  on storage.objects for update to authenticated
  using (bucket_id = 'programas' and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'equipo'));

drop policy if exists "programas el equipo borra" on storage.objects;
create policy "programas el equipo borra"
  on storage.objects for delete to authenticated
  using (bucket_id = 'programas' and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'equipo'));


-- ---------- 2. Dónde se anota que existe ----------
-- Dos columnas en la tabla que ya está. `pdf_nombre` guarda el nombre
-- dentro del depósito, no el del archivo original: sin eso, borrar el
-- programa deja el PDF huérfano ocupando lugar para siempre.
alter table public.programas add column if not exists pdf_url    text;
alter table public.programas add column if not exists pdf_nombre text;

-- De qué archivo salió esta lectura y qué tan bien salió. No es
-- decorado: cuando dentro de un año alguien se pregunte por qué a una
-- materia le faltan textos, la respuesta está acá y no hay que
-- adivinarla abriendo los cincuenta y tres PDFs de nuevo.
alter table public.programas add column if not exists origen     text;
alter table public.programas add column if not exists revisado   boolean not null default false;

comment on column public.programas.pdf_url    is 'El PDF oficial de la cátedra, tal como lo publicó.';
comment on column public.programas.pdf_nombre is 'Nombre dentro del depósito, para poder borrarlo.';
comment on column public.programas.origen     is 'De qué archivo se leyó, y con qué avisos.';
comment on column public.programas.revisado   is 'Si alguien del equipo ya lo miró contra el PDF.';

-- Para comprobar que salió bien:
--   select materia, pdf_url is not null as tiene_pdf, revisado
--     from public.programas order by carrera, materia;
