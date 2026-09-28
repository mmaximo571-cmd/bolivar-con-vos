-- ============================================================
-- LOS CANDADOS QUE NO SON DE NINGUNA TABLA EN PARTICULAR
--
-- Revisión del 2 de septiembre de 2026, antes de difundir la app.
-- Acá van los arreglos que no entran en ningún `tabla-*.sql` porque
-- son de perfiles y de permisos generales.
--
-- Lo que se revisó y estaba BIEN, para no volver a auditarlo:
--   · Las quince tablas tienen RLS activo.
--   · Los buckets `fotos` y `programas` son de lectura pública y de
--     escritura solo para el equipo. Nadie de afuera sube archivos.
--   · `respaldos` con RLS y sin políticas es a propósito: se entra
--     únicamente por las tres funciones, con el código en la mano.
--   · Los permisos anchos que Supabase le da a `anon` sobre todas las
--     tablas no abren nada: RLS los anula. La excepción es TRUNCATE,
--     que RLS no cubre, y se revoca abajo.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================


-- ============================================================
-- 1. PERFILES  ·  la regla decía una cosa y hacía otra
--
-- La política vieja pedía, para poder editar tu perfil, que tu rol
-- fuera 'estudiante'. Lo que se quería decir era «no te podés cambiar
-- el rol a vos mismo». El efecto real era otro: nadie del equipo podía
-- editar su propio perfil, porque su rol no es 'estudiante' y el
-- chequeo fallaba siempre.
--
-- La regla nueva dice lo que se quería decir: podés editar tu fila, y
-- el rol tiene que quedar como estaba. Ascender a alguien al equipo se
-- sigue haciendo desde supabase.com, que no pasa por RLS.
-- ============================================================
do $$
declare p record;
begin
  for p in select policyname from pg_policies
            where schemaname = 'public' and tablename = 'perfiles' and cmd = 'UPDATE'
  loop
    execute format('drop policy %I on public.perfiles', p.policyname);
  end loop;
end $$;

create policy "perfiles cada quien edita el suyo, sin tocarse el rol"
  on public.perfiles for update to authenticated
  using (id = auth.uid())
  with check (
        id = auth.uid()
    and rol is not distinct from (select p.rol from public.perfiles p where p.id = auth.uid())
  );


-- ============================================================
-- 2. EL search_path DE LAS FUNCIONES SUELTAS
--
-- Una función sin `search_path` fijo resuelve los nombres de tabla
-- según quien la llama. Es la puerta clásica para que alguien la haga
-- trabajar sobre una tabla suya en vez de la nuestra.
-- ============================================================
alter function public.tocar_preparacion() set search_path = public;
alter function public.tocar_quienes()     set search_path = public;


-- ============================================================
-- 3. TRUNCATE  ·  el único permiso que RLS no mira
--
-- RLS filtra fila por fila, y TRUNCATE no borra filas: vacía la tabla
-- entera de un saque. Por eso RLS no lo detiene. Hoy no se llega desde
-- la app (la API no expone TRUNCATE), pero el permiso no tiene por qué
-- estar concedido. Lo mismo con TRIGGER y REFERENCES, que nadie usa.
-- ============================================================
revoke truncate, trigger, references on all tables in schema public
  from anon, authenticated;


-- ============================================================
-- 4. LO QUE FALTA, Y NO SE ARREGLA CON SQL
--
-- En supabase.com -> Authentication -> Policies (o Providers):
--   · «Leaked password protection» está APAGADA. Con estudiantes
--     creándose cuentas, conviene prenderla: compara la contraseña
--     contra las listas de contraseñas filtradas y no deja usar una
--     que ya se sabe pública. Es un interruptor, no cuesta nada.
--
-- Y una decisión, no un error: `contactos` se lee sin cuenta, así que
-- el Instagram, el WhatsApp o el mail que carguen ahí quedan a la
-- vista de cualquiera en internet. Es lo que se busca —son los
-- contactos que atienden—, pero que nadie ponga su número personal
-- creyendo que solo lo ven los estudiantes.
-- ============================================================
