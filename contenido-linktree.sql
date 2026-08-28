-- ============================================================
-- CARGA DE CONTENIDO · los enlaces del Linktree de la Agrupación
--
-- Qué hace: crea 10 fichas en la tabla "tramites", repartidas en 6
-- categorías que hoy están vacías. Con esto el inicio pasa de mostrar
-- 2 categorías a mostrar 7.
--
-- Cómo se corre:
--   supabase.com -> proyecto "La Bolivar con vos" -> SQL Editor
--   -> New query -> pegar todo esto -> Run
--
-- Se puede correr más de una vez sin duplicar nada: primero borra las
-- fichas que tengan alguno de estos mismos enlaces, y después las crea.
--
-- OJO: de los 15 enlaces del Linktree, 10 andan y 5 están rotos. Acá
-- van solo los 10 que probé y responden bien. Los otros 5 están al
-- final del archivo, apagados y con la explicación de qué les pasa.
--
-- Los textos describen a dónde lleva cada enlace y nada más: no
-- inventan requisitos, plazos ni pasos, porque eso hay que
-- confirmarlo con la facultad.
-- ============================================================

begin;

-- Para poder correrlo de nuevo sin llenar la app de repetidos
delete from public.tramites where link_url in (
  'https://drive.google.com/file/d/1BgiZhL-VsRJ2qKGjgTgn2hbuxUVwNZ_f/view?usp=sharing',
  'https://drive.google.com/file/d/16WPINcgly_eN5GAYF704XFy51j-0U5A8/view?usp=sharing',
  'https://www.guarani-trabajosocial.unlp.edu.ar/acceso',
  'https://drive.google.com/file/d/1COOozazpk3WPtLtSITjNvULmZ5QdfOqe/view?usp=drivesdk',
  'https://drive.google.com/file/d/1DmS8eITZrR2LlZYjm2-v0TkvRysdLn_K/view?usp=drivesdk',
  'https://drive.google.com/drive/folders/1SSUiaGD2rm13k616eIlq3fIgyCufd5a2',
  'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2026/02/PR_192-25_Calendario_Academico_2026-1.pdf',
  'https://drive.google.com/file/d/1C4kn0B_pwvYwh1YBpqxn_chzME6Y4N-u/view?usp=drivesdk',
  'https://drive.google.com/file/d/1daoouaILFlMrXnrwKAM160xrhGwvOeiR/view?usp=drive_link',
  'https://blogs.ead.unlp.edu.ar/secretariaacademicats/contacto/'
);

insert into public.tramites
  (categoria_id, titulo, resumen, link_titulo, link_url, palabras_clave, publicado, orden)
values

-- ---------- PLAN DE ESTUDIOS Y CORRELATIVAS (categoría 5) ----------
(5, 'Plan de estudios: Licenciatura en Trabajo Social',
    'El plan oficial de la carrera, con las materias de cada año y sus correlativas.',
    'Ver el plan', 'https://drive.google.com/file/d/1BgiZhL-VsRJ2qKGjgTgn2hbuxUVwNZ_f/view?usp=sharing',
    'plan, estudios, licenciatura, trabajo social, correlativas, materias, cursada', true, 1),

(5, 'Plan de estudios: Tecnicatura en Gestión Comunitaria del Riesgo',
    'El plan oficial de la tecnicatura, con las materias de cada año y sus correlativas.',
    'Ver el plan', 'https://drive.google.com/file/d/16WPINcgly_eN5GAYF704XFy51j-0U5A8/view?usp=sharing',
    'plan, estudios, tecnicatura, gestion, riesgo, tgcr, correlativas, materias', true, 2),

-- ---------- INSCRIPCIONES Y FINALES (categoría 1) ----------
(1, 'Entrar al SIU Guaraní',
    'El sistema donde te inscribís a las materias y a las mesas de final, y donde mirás tus notas.',
    'Entrar al SIU Guaraní', 'https://www.guarani-trabajosocial.unlp.edu.ar/acceso',
    'siu, guarani, inscripcion, inscribirse, notas, materias, finales, mesas', true, 10),

(1, 'Régimen académico',
    'La norma que ordena cómo se cursa: condiciones, promoción, finales y libres.',
    'Ver el régimen académico', 'https://drive.google.com/file/d/1COOozazpk3WPtLtSITjNvULmZ5QdfOqe/view?usp=drivesdk',
    'regimen, academico, promocion, cursada, final, libre, reglamento, condiciones', true, 11),

(1, 'Materias libres de la Licenciatura en Fonoaudiología',
    'El listado de las materias que se pueden rendir libres en Fonoaudiología.',
    'Ver el listado', 'https://drive.google.com/file/d/1DmS8eITZrR2LlZYjm2-v0TkvRysdLn_K/view?usp=drivesdk',
    'libres, materias, fonoaudiologia, fono, rendir, final', true, 12),

-- ---------- DÓNDE CURSO (categoría 8) ----------
(8, 'Horarios del 2° cuatrimestre 2026',
    'Los horarios de cursada de este cuatrimestre.',
    'Ver los horarios', 'https://drive.google.com/drive/folders/1SSUiaGD2rm13k616eIlq3fIgyCufd5a2',
    'horarios, cursada, cuatrimestre, comisiones, aulas, cuando curso', true, 1),

(8, 'Calendario académico 2026',
    'Las fechas de todo el año: inscripciones, cursada, mesas de final y recesos.',
    'Ver el calendario', 'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2026/02/PR_192-25_Calendario_Academico_2026-1.pdf',
    'calendario, academico, fechas, inscripcion, finales, mesas, receso, cuatrimestre', true, 2),

-- ---------- CÁTEDRAS (categoría 9) ----------
(9, 'Contacto de las cátedras',
    'Los correos de las cátedras, para escribirles directamente.',
    'Ver los contactos', 'https://drive.google.com/file/d/1C4kn0B_pwvYwh1YBpqxn_chzME6Y4N-u/view?usp=drivesdk',
    'catedras, contacto, correo, mail, docentes, profesores, escribir', true, 1),

-- ---------- BECAS Y AYUDAS ECONÓMICAS (categoría 3) ----------
(3, 'Becas y comedor de la UNLP',
    'La información sobre las becas de la universidad y el comedor universitario.',
    'Ver la información', 'https://drive.google.com/file/d/1daoouaILFlMrXnrwKAM160xrhGwvOeiR/view?usp=drive_link',
    'becas, beca, comedor, ayuda, economica, plata, apoyo, unlp, alimentacion', true, 1),

-- ---------- DÓNDE PEDIR AYUDA (categoría 13) ----------
(13, 'Contactos institucionales de la facultad',
    'A quién escribirle en cada área de la facultad según lo que necesites resolver.',
    'Ver los contactos', 'https://blogs.ead.unlp.edu.ar/secretariaacademicats/contacto/',
    'contacto, contactos, telefono, correo, mail, secretaria, academica, ayuda, oficinas', true, 1);

commit;


-- ============================================================
-- LOS 5 ENLACES ROTOS DEL LINKTREE
--
-- Estos cinco NO se cargan porque el enlace no lleva a ningún lado.
-- Los probé uno por uno, también haciéndome pasar por un navegador
-- de verdad, para descartar que fuera un problema de la prueba.
--
--   404  Plan de estudios del Profesorado
--   404  Plan de estudios del CCC
--   404  Inscribirse a las carreras de la facultad
--   404  ¿Qué es el tramo optativo?  (el archivo de Drive no existe
--        o dejó de estar compartido)
--   401  Recursero de emprendedores  (el formulario pide iniciar
--        sesión, así que a la mayoría no le va a abrir)
--
-- Conviene arreglarlos también en el Linktree, porque ahí están
-- rotos igual.
--
-- Tres de estos ya los tenés en archivos, en la carpeta
-- "archivos aplicacion la bolivar" del Escritorio:
--   - plan-de-estudio-Profesorado-en-Trabajo-Social-FTS-UNLP.pdf
--   - acreditacion_tramo_optativo_proveido_resolutivo_022_19.pdf
--   - PR_192-25_Calendario_Academico_2026-1.pdf (este ya anda igual)
--
-- Cuando tengas la dirección buena de cada uno, reemplazá el
-- CAMBIAR-POR-EL-ENLACE-BUENO de abajo, sacá los guiones del
-- principio de cada línea y corré este bloque.
-- ============================================================

-- insert into public.tramites
--   (categoria_id, titulo, resumen, link_titulo, link_url, palabras_clave, publicado, orden)
-- values
-- (5, 'Plan de estudios: Profesorado en Trabajo Social',
--     'El plan oficial del profesorado.',
--     'Ver el plan', 'CAMBIAR-POR-EL-ENLACE-BUENO',
--     'plan, estudios, profesorado, trabajo social, docencia, correlativas', true, 3),
--
-- (5, 'Plan de estudios: Ciclo de Complementación Curricular',
--     'El plan oficial del CCC en Trabajo Social.',
--     'Ver el plan', 'CAMBIAR-POR-EL-ENLACE-BUENO',
--     'plan, estudios, ciclo, complementacion, curricular, ccc, correlativas', true, 4),
--
-- (5, '¿Qué es el tramo optativo?',
--     'La explicación de cómo funciona el tramo optativo de la carrera.',
--     'Leer la explicación', 'CAMBIAR-POR-EL-ENLACE-BUENO',
--     'tramo, optativo, optativas, acreditacion, materias', true, 5),
--
-- (1, 'Inscribirse a las carreras de la facultad',
--     'La información oficial para quienes ingresan: preinscripción y pasos del ingreso.',
--     'Ver la información oficial', 'CAMBIAR-POR-EL-ENLACE-BUENO',
--     'ingreso, ingresantes, preinscripcion, inscripcion, carreras, primer año', true, 13),
--
-- (10, 'Recursero de emprendedores de la facultad',
--     'El formulario para sumarte al recursero de emprendedoras y emprendedores.',
--     'Ir al formulario', 'CAMBIAR-POR-EL-ENLACE-BUENO',
--     'recursero, emprendedores, emprender, oficios, trabajo, red', true, 1);


-- ============================================================
-- Para comprobar que salió bien, corré esto después:
--
--   select c.nombre, count(t.id) as fichas
--   from public.categorias c
--   left join public.tramites t on t.categoria_id = c.id and t.publicado
--   group by c.nombre order by fichas desc;
--
-- Tienen que quedar 7 categorías con al menos una ficha.
-- Siguen vacías: "Extensión e investigación" (su único enlace es el
-- del recursero, que está roto), "Certificados, cartas y notas" y
-- "Alquiler", que todavía no tienen material.
-- ============================================================
