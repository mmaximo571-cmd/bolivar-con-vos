-- ============================================================
-- CALENDARIO ACADÉMICO 2027  ·  lo que le sirve a quien estudia
--
-- Sale de la «Propuesta Calendario Académico 2027» que vota el Consejo
-- Directivo el viernes 20/11/2026. Va a `publicaciones` como el 2026:
-- `tipo = 'fecha'`, y de ahí lo toman solos Fechas, el calendario del
-- mes y «lo próximo» del inicio.
--
-- QUÉ NO ENTRA, a propósito. El calendario es de la Facultad y trae
-- mucho que es de las cátedras y de la gestión, no de quien cursa:
--   - entregas de propuestas (pedagógicas, de seminarios, de tramo
--     optativo, de cursadas y seminarios de verano),
--   - desarrollo de cursadas y de seminarios (verano, 1.º y 2.º):
--     períodos de meses que en el calendario tapan lo que importa,
--   - entregas de actas.
-- Lo que todavía no tiene día (segundas inscripciones a seminarios,
-- cierre de padrones del claustro, jornadas institucionales de
-- prácticas, capacitación por la identidad) tampoco: una fecha
-- inventada es peor que ninguna. Se suma cuando la Facultad la fije.
--
-- SE CORRE EN DOS PASOS, para que se pueda verificar desde el viernes
-- y no antes:
--
--   PASO 1  (cuando quieras, antes de la sesión)
--           Carga todo SIN PUBLICAR. Nadie lo ve en la app: la RLS de
--           lectura pide `publicado`. Se puede correr más de una vez.
--
--   PASO 2  (el viernes, después de la votación)
--           Si el Consejo cambió algo, se corrige antes con un `update`
--           (hay ejemplos abajo). Después se publica todo junto, con un
--           solo comunicado que avisa que ya está.
--
-- POR QUÉ EL PASO 2 CORRE `publicado_at` HACIA ATRÁS. El disparador
-- `marcas_de_publicacion` la pone en `now()` al publicar, y la campana
-- muestra en «Nuevo» todo lo publicado en los últimos 14 días: serían
-- cincuenta y pico renglones de golpe, dos semanas. El disparador solo
-- la toca al PASAR a publicado, así que un segundo `update` la puede
-- correr y queda. Lo nuevo lo dice el comunicado, una vez.
--
-- Esto no hace sonar ningún teléfono: la función `avisos` solo manda
-- por paros, grupos y actividades (`CANAL_DE`), no por fechas. Lo que
-- sí se prende es la alarma de las mesas, que es justamente la idea:
-- la primera es la inscripción de febrero (abre el 8/2/2027).
--
-- Cómo se corre:
--   supabase.com -> proyecto "La Bolivar con vos" -> SQL Editor
--   -> New query -> pegar UN paso -> Run
-- ============================================================


-- ============================================================
-- PASO 1  ·  cargar sin publicar
--
-- Los títulos siguen los del 2026, y los de las mesas tienen que
-- quedar así: la alarma lee el mes del final del título si `periodo`
-- falta, y las publicaciones de `comunicacion` que empiezan con
-- «Inscripción a la mesa» o «Mesa de examen» están prohibidas
-- justamente porque hacen sonar la alarma.
--
-- `carreras`: tres fechas son de una sola carrera y se le muestran
-- solo a esa (y a quien no eligió ninguna). Ver la sección 10 de
-- `sql/tabla-publicaciones.sql`.
-- ============================================================

with calendario (titulo, cuerpo, fecha_desde, fecha_hasta, alarma, periodo, carreras) as (
  values
  -- Verano y comienzo del año
  ('Inscripción a cursadas de verano', null,
     date '2027-02-01', date '2027-02-02', 'ninguna', null, null::text[]),
  ('Inscripción a la Facultad (fecha adicional)', 'Para ingresantes.',
     date '2027-02-01', date '2027-02-05', 'ninguna', null, null),
  ('Inscripción a seminarios de verano',
     'Si hay demanda se abre una segunda inscripción. La sumamos cuando tenga fecha.',
     date '2027-02-03', date '2027-02-04', 'ninguna', null, null),
  ('Inscripción a la mesa de febrero',
     'El lunes 8 y el martes 9 son feriados de Carnaval.',
     date '2027-02-08', date '2027-02-11', 'inscripcion', 'febrero', null),
  ('Mesa de examen de febrero', null,
     date '2027-02-15', date '2027-02-19', 'mesa', 'febrero', null),
  ('Curso Introductorio', 'Para ingresantes 2027.',
     date '2027-02-15', date '2027-03-05', 'ninguna', null, null),
  ('Solicitudes de adscripción', null,
     date '2027-02-15', date '2027-03-15', 'ninguna', null, null),
  ('Inscripción a la mesa de marzo', null,
     date '2027-03-01', date '2027-03-04', 'inscripcion', 'marzo', null),
  ('Mesa de examen de marzo', null,
     date '2027-03-08', date '2027-03-12', 'mesa', 'marzo', null),
  ('Inscripción a cursadas anuales y de 1.º cuatrimestre', null,
     date '2027-03-08', date '2027-03-15', 'ninguna', null, null),
  ('Inicio de clases', null,
     date '2027-03-15', null, 'ninguna', null, null),

  -- Primer cuatrimestre
  -- La Semana de la Memoria no son días seguidos: el calendario dice
  -- 22, 23 y 31 de marzo y 1 de abril. En una sola fila el calendario
  -- del mes pintaría los once días, feriados incluidos.
  ('Semana de la Memoria', 'No se suspenden las clases.',
     date '2027-03-22', date '2027-03-23', 'ninguna', null, null),
  ('Semana de la Memoria', 'No se suspenden las clases.',
     date '2027-03-31', date '2027-04-01', 'ninguna', null, null),
  ('Inscripción a seminarios de 1.º cuatrimestre',
     'Si hay demanda se abre una segunda inscripción. La sumamos cuando tenga fecha.',
     date '2027-03-29', date '2027-03-31', 'ninguna', null, null),
  ('Inscripción a la mesa de abril', null,
     date '2027-04-05', date '2027-04-08', 'inscripcion', 'abril', null),
  ('Mesa de examen de abril', null,
     date '2027-04-12', date '2027-04-16', 'mesa', 'abril', null),
  ('Inscripción a la mesa de mayo', null,
     date '2027-05-03', date '2027-05-06', 'inscripcion', 'mayo', null),
  ('Mesa de examen de mayo', null,
     date '2027-05-10', date '2027-05-14', 'mesa', 'mayo', null),
  ('Jornadas territoriales de Prácticas de Formación Profesional', null,
     date '2027-06-28', null, 'ninguna', null, null),
  ('Último plazo: certificado de secundario completo', 'Para ingresantes.',
     date '2027-06-30', null, 'ninguna', null, null),
  ('Fin de clases de las materias cuatrimestrales', null,
     date '2027-07-03', null, 'ninguna', null, null),

  -- Invierno
  ('Inscripción a la mesa de julio', null,
     date '2027-07-05', date '2027-07-08', 'inscripcion', 'julio', null),
  ('Inscripción a la Facultad (fecha adicional)', 'Para ingresantes.',
     date '2027-07-05', date '2027-07-08', 'ninguna', null, null),
  ('Segunda presentación de solicitudes de adscripción', null,
     date '2027-07-05', date '2027-08-09', 'ninguna', null, null),
  ('Mesa de examen de julio', null,
     date '2027-07-12', date '2027-07-16', 'mesa', 'julio', null),
  ('Receso de invierno',
     'Ojo: la fecha del receso es tentativa, se ajusta a lo que indique la UNLP.',
     date '2027-07-19', date '2027-07-30', 'ninguna', null, null),

  -- Segundo cuatrimestre
  ('Inscripción a cursadas de 2.º cuatrimestre', null,
     date '2027-08-02', date '2027-08-05', 'ninguna', null, null),
  ('Inicio de cursadas de 2.º cuatrimestre', null,
     date '2027-08-09', null, 'ninguna', null, null),
  ('Inscripción a seminarios de 2.º cuatrimestre',
     'Si hay demanda se abre una segunda inscripción. La sumamos cuando tenga fecha.',
     date '2027-08-09', date '2027-08-11', 'ninguna', null, null),
  ('Inscripción a la mesa de agosto', null,
     date '2027-08-09', date '2027-08-12', 'inscripcion', 'agosto', null),
  ('Día de la Universidad', null,
     date '2027-08-12', null, 'ninguna', null, null),
  ('Mesa de examen de agosto', null,
     date '2027-08-17', date '2027-08-23', 'mesa', 'agosto', null),
  ('Inscripción a la mesa de septiembre', null,
     date '2027-09-06', date '2027-09-09', 'inscripcion', 'septiembre', null),
  ('Día del trabajador docente', null,
     date '2027-09-11', null, 'ninguna', null, null),
  ('Mesa de examen de septiembre', null,
     date '2027-09-13', date '2027-09-17', 'mesa', 'septiembre', null),
  ('Día del estudiante', null,
     date '2027-09-21', null, 'ninguna', null, null),
  ('2.º Jornadas del Profesorado en Trabajo Social', null,
     date '2027-09-27', date '2027-11-01', 'ninguna', null, array['ts']),
  ('Semana de la gestión del riesgo', null,
     date '2027-10-11', date '2027-10-15', 'ninguna', null, array['tgcr']),
  ('Semana de la Fonoaudiología', null,
     date '2027-11-01', date '2027-11-02', 'ninguna', null, array['fono']),
  ('Inscripción a la mesa de noviembre', null,
     date '2027-11-15', date '2027-11-18', 'inscripcion', 'noviembre', null),
  ('Cierre de clases de las materias anuales', null,
     date '2027-11-20', null, 'ninguna', null, null),
  ('Cierre de clases de 2.º cuatrimestre', null,
     date '2027-11-20', null, 'ninguna', null, null),
  ('Mesa de examen de noviembre', null,
     date '2027-11-22', date '2027-11-29', 'mesa', 'noviembre', null),
  ('Día del Trabajador No docente',
     'Asueto administrativo: no hay atención en las oficinas. La fecha es tentativa, se ajusta a lo que indique la UNLP.',
     date '2027-11-26', null, 'ninguna', null, null),
  ('Inscripción a la mesa de diciembre', null,
     date '2027-12-06', date '2027-12-09', 'inscripcion', 'diciembre', null),
  ('Mesa de examen de diciembre', null,
     date '2027-12-13', date '2027-12-17', 'mesa', 'diciembre', null),

  -- Los turnos de febrero y marzo de 2028 son todavía del ciclo 2027:
  -- el calendario los llama «Febrero 2027» y «Marzo 2027». En la app
  -- van con el nombre del mes, como todas; la fecha ya dice el año.
  ('Inscripción a la mesa de febrero', 'Turno del ciclo lectivo 2027.',
     date '2028-02-07', date '2028-02-10', 'inscripcion', 'febrero', null),
  ('Mesa de examen de febrero', 'Turno del ciclo lectivo 2027.',
     date '2028-02-14', date '2028-02-18', 'mesa', 'febrero', null),
  ('Último plazo: título secundario legalizado', 'Para ingresantes 2027.',
     date '2028-03-03', null, 'ninguna', null, null),
  ('Inscripción a la mesa de marzo', 'Turno del ciclo lectivo 2027.',
     date '2028-03-06', date '2028-03-09', 'inscripcion', 'marzo', null),
  ('Mesa de examen de marzo', 'Turno del ciclo lectivo 2027.',
     date '2028-03-13', date '2028-03-17', 'mesa', 'marzo', null)
)
insert into public.publicaciones
  (tipo, linea, categoria, titulo, cuerpo, fecha_desde, fecha_hasta,
   alarma, periodo, carreras, publicado)
select 'fecha', 'info', 'fecha', c.titulo, c.cuerpo, c.fecha_desde, c.fecha_hasta,
       c.alarma, c.periodo, c.carreras, false
  from calendario c
 where not exists (
         select 1 from public.publicaciones p
          where p.tipo = 'fecha'
            and p.titulo = c.titulo
            and p.fecha_desde = c.fecha_desde);

-- Para revisar lo cargado (tienen que ser 51, todas sin publicar):
--   select id, titulo, fecha_desde, fecha_hasta, alarma, periodo, carreras, publicado
--     from public.publicaciones
--    where tipo = 'fecha' and fecha_desde >= '2027-01-01'
--    order by fecha_desde, id;


-- ============================================================
-- PASO 2  ·  el viernes, después de la votación
--
-- Antes de publicar, si el Consejo movió algo, se corrige acá. Así,
-- por ejemplo, si la inscripción a la mesa de febrero se corre:
--
--   update public.publicaciones
--      set fecha_desde = '2027-02-01', fecha_hasta = '2027-02-04', cuerpo = null
--    where tipo = 'fecha' and not publicado
--      and titulo = 'Inscripción a la mesa de febrero'
--      and fecha_desde = '2027-02-08';
--
-- Y si una fecha se cae, se borra:
--
--   delete from public.publicaciones
--    where tipo = 'fecha' and not publicado and id = <el id>;
--
-- Después, todo esto de una vez (descomentar y correr). Va en una
-- transacción para que no quede publicado a medias.
-- ============================================================

-- begin;
--
-- update public.publicaciones
--    set publicado = true
--  where tipo = 'fecha' and not publicado
--    and fecha_desde >= '2027-01-01';
--
-- -- Fuera de «Nuevo» en la campana (ver el encabezado).
-- update public.publicaciones
--    set publicado_at = now() - interval '15 days'
--  where tipo = 'fecha' and publicado
--    and fecha_desde >= '2027-01-01'
--    and publicado_at > now() - interval '1 hour';
--
-- -- El único aviso de que está. `avisar = true` lo manda también al
-- -- celular de quien prendió las novedades; se deja apagado salvo
-- -- que se decida lo contrario.
-- insert into public.publicaciones
--   (tipo, linea, categoria, titulo, cuerpo, link_url, alarma, avisar, publicado)
-- values
--   ('novedad', 'info', 'comunicado',
--    'Ya está el calendario académico 2027',
--    'Lo aprobó el Consejo Directivo el viernes 20 de noviembre. Están las inscripciones, las mesas, el inicio de clases y los recesos, y la alarma de mesas ya lo sigue. Lo que la Facultad todavía no fijó (segundas inscripciones a seminarios, cierre de padrones) lo sumamos cuando tenga fecha.',
--    'https://labolivarconvos.ar/agenda/',
--    'ninguna', false, true);
--
-- commit;
