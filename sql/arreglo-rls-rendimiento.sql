-- ============================================================
-- ARREGLO DE RLS: RENDIMIENTO Y DOS DETALLES  ·  10/10/2026
--
-- Sale de la revisión de RLS del 10/10 (con la skill `supabase`).
-- No cambia QUIÉN ve o toca qué: cambia CÓMO se calcula. Las
-- políticas siguen con el mismo nombre, el mismo rol y el mismo
-- comando; solo se reescribe la condición.
--
-- POR QUÉ:
--
--   1. `auth.uid()` suelto en una política se calcula UNA VEZ POR
--      FILA. Escrito `(select auth.uid())`, Postgres lo calcula una
--      sola vez por consulta. Lo mismo con «¿es del equipo?»: el
--      `exists (select 1 from perfiles where id = auth.uid() and rol =
--      'equipo')` repetido en 30 políticas pasa a ser
--      `(select public.es_equipo())`, que ya existía y hace lo mismo.
--      Con 45 cuentas no se notaba; hoy son 522. El revisor de
--      rendimiento de Supabase marcaba 45 políticas así.
--
--      OJO: `es_equipo()` NO la puede llamar `anon` (no tiene permiso).
--      Por eso solo se usa en políticas `to authenticated`. Las de
--      lectura pública (`to public` / `to anon`) no se tocan.
--
--   2. Cinco llaves foráneas sin índice y un índice repetido en
--      `posteos_ig` (`posteos_ig_fecha` es igual a
--      `posteos_ig_publicado_idx`, que es el de tabla-posteos-ig.sql).
--
--   3. `tocar_congreso_mesa()` no tenía el `search_path` fijo.
--
--   4. La política con la que `comunicacion` edita novedades no le
--      impedía cambiar `creado_por`. Una política solo ve la fila
--      NUEVA, no la vieja, así que esto va con un disparador: nadie
--      que no sea del equipo puede cambiar quién creó una publicación.
--      `cargar/` no manda `creado_por` al editar (ver el comentario
--      en cargar/index.html), así que no le cambia nada. La clave de
--      servicio y el reloj (sin `auth.uid()`) quedan afuera.
--
-- QUÉ NO SE TOCA (y por qué):
--   - Las 16 tablas con políticas superpuestas (p. ej. «lectura
--     publica» + «el equipo ve todo»). Juntarlas obliga a partir las
--     políticas `for all` en tres y reescribir 16 tablas; con las
--     condiciones ya calculadas una sola vez, lo que se gana es poco.
--   - Las políticas de Storage: la tabla es de `supabase_storage_admin`
--     y se sube poco.
--   - Los tres índices «sin usar»: son para cosas que todavía no
--     pasaron (la alarma, pendientes, el freno de votos del congreso).
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Lo de cada persona: auth.uid() una sola vez
-- ------------------------------------------------------------

alter policy "perfil_propio_select" on public.perfiles
  using ((id = (select auth.uid())) or (select public.es_equipo()));

-- El rol lo cuida el disparador de arreglo-seguridad-11-10.sql: leer
-- `perfiles` desde esta política daba «infinite recursion».
alter policy "perfiles cada quien edita el suyo, sin tocarse el rol" on public.perfiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy "guardados_propios" on public.guardados
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

alter policy "cada uno ve la suya"    on public.preparaciones using (usuario_id = (select auth.uid()));
alter policy "cada uno crea la suya"  on public.preparaciones with check (usuario_id = (select auth.uid()));
alter policy "cada uno edita la suya" on public.preparaciones
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
alter policy "cada uno borra la suya" on public.preparaciones using (usuario_id = (select auth.uid()));

alter policy "cada uno ve lo suyo" on public.mi_ano using (usuario_id = (select auth.uid()));


-- ------------------------------------------------------------
-- 2. Lo del equipo: (select public.es_equipo())
-- ------------------------------------------------------------

alter policy "catedras las edita el equipo" on public.catedras
  using ((select public.es_equipo())) with check ((select public.es_equipo()));

alter policy "materiales el equipo ve todo" on public.materiales using ((select public.es_equipo()));
alter policy "materiales el equipo escribe" on public.materiales with check ((select public.es_equipo()));
alter policy "materiales el equipo edita"   on public.materiales using ((select public.es_equipo()));
alter policy "materiales el equipo borra"   on public.materiales using ((select public.es_equipo()));

alter policy "programas el equipo ve todo" on public.programas using ((select public.es_equipo()));
alter policy "programas el equipo escribe" on public.programas with check ((select public.es_equipo()));
alter policy "programas el equipo edita"   on public.programas using ((select public.es_equipo()));
alter policy "programas el equipo borra"   on public.programas using ((select public.es_equipo()));

alter policy "quienes el equipo escribe" on public.pagina_quienes with check ((select public.es_equipo()));
alter policy "quienes el equipo edita"   on public.pagina_quienes using ((select public.es_equipo()));

alter policy "consejo el equipo escribe" on public.pagina_consejo with check ((select public.es_equipo()));
alter policy "consejo el equipo edita"   on public.pagina_consejo using ((select public.es_equipo()));

alter policy "guia el equipo ve todo" on public.guia_materia using ((select public.es_equipo()));
alter policy "guia el equipo escribe" on public.guia_materia with check ((select public.es_equipo()));
alter policy "guia el equipo edita"   on public.guia_materia using ((select public.es_equipo()));

alter policy "contactos el equipo ve todo" on public.contactos using ((select public.es_equipo()));
alter policy "contactos el equipo escribe" on public.contactos with check ((select public.es_equipo()));
alter policy "contactos el equipo edita"   on public.contactos using ((select public.es_equipo()));
alter policy "contactos el equipo borra"   on public.contactos using ((select public.es_equipo()));

alter policy "consultas las lee el equipo"  on public.consultas using ((select public.es_equipo()));
alter policy "consultas el equipo las marca" on public.consultas using ((select public.es_equipo()));
alter policy "consultas el equipo borra"    on public.consultas using ((select public.es_equipo()));

alter policy "sucesos los lee el equipo" on public.sucesos using ((select public.es_equipo()));
alter policy "sucesos el equipo borra"   on public.sucesos using ((select public.es_equipo()));

alter policy "posteos el equipo carga"   on public.posteos_ig with check ((select public.es_equipo()));
alter policy "posteos el equipo corrige" on public.posteos_ig
  using ((select public.es_equipo())) with check ((select public.es_equipo()));
alter policy "posteos el equipo saca"    on public.posteos_ig using ((select public.es_equipo()));


-- ------------------------------------------------------------
-- 3. El mapa de riesgo (las dos cosas juntas)
-- ------------------------------------------------------------

alter policy "riesgo cada quien ve lo suyo" on public.reportes_riesgo
  using (autor = (select auth.uid()));

alter policy "riesgo el equipo ve todo" on public.reportes_riesgo
  using ((select public.es_equipo()));

alter policy "riesgo carga con cuenta" on public.reportes_riesgo
  with check (
    autor = (select auth.uid())
    and estado = 'pendiente'
    and creado_en_dispositivo >= now() - interval '30 days'
    and creado_en_dispositivo <= now() + interval '1 day'
  );

alter policy "riesgo el equipo modera" on public.reportes_riesgo
  using ((select public.es_equipo())) with check ((select public.es_equipo()));

alter policy "riesgo borrar" on public.reportes_riesgo
  using ((autor = (select auth.uid()) and estado = 'pendiente') or (select public.es_equipo()));


-- ------------------------------------------------------------
-- 4. Comunicación y las publicaciones
--    `publicacion_de_comunicacion(...)` mira columnas de la fila, así
--    que esa sí se calcula por fila: es lo que tiene que hacer.
-- ------------------------------------------------------------

alter policy "publicaciones comunicacion ve novedades" on public.publicaciones
  using ((select public.es_comunicacion())
         and (tipo = any (array['novedad', 'evento']) or creado_por = (select auth.uid())));

alter policy "publicaciones comunicacion carga novedades" on public.publicaciones
  with check ((select public.es_comunicacion())
              and creado_por = (select auth.uid())
              and public.publicacion_de_comunicacion(tipo, linea, titulo, alarma, avisar, publicado));

alter policy "publicaciones comunicacion borra novedades" on public.publicaciones
  using ((select public.es_comunicacion())
         and (tipo = 'novedad' or (tipo = 'evento' and creado_por = (select auth.uid()))));

alter policy "publicaciones comunicacion edita novedades" on public.publicaciones
  using ((select public.es_comunicacion())
         and (tipo = 'novedad' or creado_por = (select auth.uid()))
         and public.publicacion_de_comunicacion(tipo, linea, titulo, alarma, avisar, publicado))
  with check ((select public.es_comunicacion())
              and (tipo = 'novedad' or creado_por = (select auth.uid()))
              and public.publicacion_de_comunicacion(tipo, linea, titulo, alarma, avisar, publicado));

-- Nadie fuera del equipo cambia quién creó una publicación.
create or replace function public.cuidar_creado_por()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.creado_por is distinct from old.creado_por then
    -- Sin sesión (clave de servicio, el reloj) no se frena.
    if auth.uid() is not null then
      if not public.es_equipo() then
        raise exception 'No se puede cambiar quién creó la publicación.'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists publicaciones_cuidar_creado_por on public.publicaciones;
create trigger publicaciones_cuidar_creado_por
  before update of creado_por on public.publicaciones
  for each row execute function public.cuidar_creado_por();


-- ------------------------------------------------------------
-- 5. Índices
-- ------------------------------------------------------------

create index if not exists buzon_pedidos_categoria_idx      on public.buzon_pedidos (categoria);
create index if not exists buzon_pedidos_moderado_por_idx   on public.buzon_pedidos (moderado_por);
create index if not exists guardados_tramite_idx            on public.guardados (tramite_id);
create index if not exists preparaciones_programa_idx       on public.preparaciones (programa_id);
create index if not exists reportes_riesgo_revisado_por_idx on public.reportes_riesgo (revisado_por);

-- Repetido: `posteos_ig_publicado_idx` (el de tabla-posteos-ig.sql) es igual.
drop index if exists public.posteos_ig_fecha;


-- ------------------------------------------------------------
-- 6. search_path fijo
-- ------------------------------------------------------------

alter function public.tocar_congreso_mesa() set search_path = '';
