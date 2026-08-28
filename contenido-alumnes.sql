-- ============================================================
-- CARGA DE CONTENIDO · la página "Alumnes" de la facultad
-- https://trabajosocial.unlp.edu.ar/alumnes/
--
-- Qué hace: crea 17 fichas con la información de cada apartado de esa
-- página, y arregla una que ya estaba. No son enlaces sueltos: cada
-- ficha lleva los requisitos, los pasos, los plazos y a quién
-- escribirle, que es lo que hoy está enterrado en el sitio.
--
-- Llena "Certificados, cartas y notas", que estaba vacía, y suma
-- fichas a otras cuatro categorías. Después de correr esto quedan
-- 8 categorías con contenido y solo 2 vacías.
--
-- Cómo se corre:
--   supabase.com -> proyecto "La Bolivar con vos" -> SQL Editor
--   -> New query -> pegar todo -> Run
--
-- Se puede correr más de una vez sin duplicar nada.
--
-- OJO: la columna "pasos" no admite nulo. Las fichas que no tienen
-- paso a paso llevan '[]'::jsonb, que es una lista vacía. Si escribís
-- null ahí, la carga entera falla.
--
-- Los 21 enlaces de la página los probé uno por uno: 20 andan. El
-- único roto es el de la Resolución 6646/21, así que ese dato quedó
-- escrito en la ficha del diploma pero sin botón.
-- ============================================================

begin;

delete from public.tramites where titulo in (
  'Pedir constancias y certificados', 'Legalizar programas y documentación',
  'Pedir equivalencias', 'Tramitar el diploma', 'Pedir una mesa especial',
  'Pedir la extensión de una cursada', 'Aprender a usar el SIU Guaraní',
  'Reglamento de seminarios', 'Acreditar el tramo optativo', 'Acreditar el idioma',
  'Plan de estudios: Licenciatura en Fonoaudiología',
  'Plan de estudios: CCC en Fonoaudiología', 'Becas de la UNLP',
  'Beca PROGRESAR', 'Becas de la Facultad', 'Ventanilla de alumnos: horarios y correos',
  'DAE y DIVE: apoyo estudiantil', 'Servicios de la facultad'
);

insert into public.tramites
  (categoria_id, titulo, resumen, requisitos, plazo, donde, pasos,
   link_titulo, link_url, palabras_clave, publicado, orden)
values

-- ========== CERTIFICADOS, CARTAS Y NOTAS (categoría 4) ==========
(4, 'Pedir constancias y certificados',
 'Tres constancias que te bajás vos del SIU Guaraní, sin ir a la facultad.',
 null, null,
 'Todo desde el SIU Guaraní, con tu usuario y clave.',
 '[{"titulo":"Constancia de alumno regular","detalle":"La que te piden para el boleto, para trabajar y para casi cualquier trámite."},
   {"titulo":"Constancia de Actividades Aprobadas","detalle":"Es el analítico: todo lo que aprobaste hasta hoy."},
   {"titulo":"Constancia de asistencia a mesa de examen","detalle":"Para justificar en el trabajo o donde te la pidan que fuiste a rendir."}]'::jsonb,
 'Instructivo para descargarlas',
 'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2026/03/Instructivo-para-descargar-Certificado-de-Examen-2.pdf',
 'constancia, certificado, alumno regular, analitico, actividades aprobadas, examen, siu, papeles', true, 1),

(4, 'Legalizar programas y documentación',
 'Cuando necesitás que la facultad certifique que un papel es auténtico.',
 null,
 'Tarda entre 20 y 25 días hábiles. Calculá ese tiempo antes de comprometerte con una fecha.',
 'Se presenta en la facultad.',
 '[{"titulo":"Si querés legalizar programas de materias","detalle":"Usá el formulario A."},
   {"titulo":"Si querés legalizar cualquier otra documentación","detalle":"Usá el formulario B."}]'::jsonb,
 'Bajar el formulario A (programas)',
 'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/12/formulario_A_solicitud_de_legalizacion_de_programas.docx',
 'legalizacion, legalizar, programas, documentacion, formulario, tramite, papeles', true, 2),

(4, 'Pedir equivalencias',
 'Para que te reconozcan materias que ya cursaste en otra carrera o en otra facultad.',
 null, null,
 'Se envía a mesaentradas@trabajosocial.unlp.edu.ar',
 '[{"titulo":"Bajá el formulario que te corresponda","detalle":"Hay uno general, y otro específico para pasar de Trabajo Social a Fonoaudiología."},
   {"titulo":"Mandalo a Mesa de Entradas","detalle":"Al correo mesaentradas@trabajosocial.unlp.edu.ar"}]'::jsonb,
 'Bajar el formulario de equivalencias',
 'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/12/FORMULARIO-SOLICITUD-EQUIVALENCIAS-1.docx',
 'equivalencia, equivalencias, reconocimiento, materias, pase, otra carrera, formulario', true, 3),

(4, 'Tramitar el diploma',
 'Cuando terminaste la carrera. Desde 2020 todos los títulos de la UNLP son digitales.',
 'Tener la carrera terminada. Según la Resolución 6646/21, el título de grado no paga tasa administrativa.',
 null,
 'Empieza en el SIU Guaraní y sigue por correo, a egreso@trabajosocial.unlp.edu.ar',
 '[{"titulo":"Paso 1: pedilo en el SIU Guaraní","detalle":"Entrá a TRÁMITES y después a SOLICITAR CERTIFICACIÓN."},
   {"titulo":"Paso 2: mandá la documentación por correo","detalle":"A egreso@trabajosocial.unlp.edu.ar con: el formulario de inicio completo, el DNI de los dos lados, el libre deuda de la biblioteca de la facultad y el de la biblioteca pública de la UNLP, la partida de nacimiento en PDF o foto, y una foto tipo carnet."}]'::jsonb,
 'Entrar al SIU Guaraní', 'https://autogestion.guarani.unlp.edu.ar/',
 'diploma, titulo, egreso, egresar, recibirme, terminar, certificacion, libre deuda', true, 4),

-- ========== INSCRIPCIONES Y FINALES (categoría 1) ==========
(1, 'Pedir una mesa especial',
 'Una mesa de final fuera de las fechas habituales, para poder terminar la carrera.',
 'Adeudar 2 materias de examen final y tener el idioma ya acreditado.',
 null, 'Se presenta con el formulario descargable.', '[]'::jsonb,
 'Bajar el formulario',
 'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/09/formulario_solicitud_mesa_especial-1.docx',
 'mesa, especial, final, examen, terminar, ultimas materias, adeudar', true, 20),

(1, 'Pedir la extensión de una cursada',
 'Para estirar la validez de una cursada que se te está por vencer.',
 'Hacer una clase de consulta con la cátedra y una entrevista con la Dirección de la carrera.',
 'Se abre una vez al año. En 2026 fue del 9 al 21 de junio: mirá el calendario académico para saber cuándo abre el próximo.',
 'Se pide completando un formulario web.', '[]'::jsonb,
 'Ir al formulario',
 'https://docs.google.com/forms/d/e/1FAIpQLSeyeeL57mpFehne_DYbgiIps2kz4oDN7LYUtFRTy4GsdCyxjA/viewform',
 'extension, cursada, vencimiento, vencida, prorroga, regularidad', true, 21),

(1, 'Aprender a usar el SIU Guaraní',
 'Tres videos cortos para lo que más se traba: la clave y las dos inscripciones.',
 null, null, null,
 '[{"titulo":"Recuperar la clave","detalle":"youtube.com/watch?v=TOyqmpwoEiI"},
   {"titulo":"Inscribirse a cursadas","detalle":"youtube.com/watch?v=IVNrpdMMnqc"},
   {"titulo":"Inscribirse a exámenes","detalle":"youtube.com/watch?v=s7CbeO0zVKA"}]'::jsonb,
 'Entrar al SIU Guaraní', 'https://autogestion.guarani.unlp.edu.ar/',
 'siu, guarani, tutorial, video, clave, contraseña, olvide, inscripcion, cursada, examen, ayuda', true, 22),

(1, 'Reglamento de seminarios',
 'Cómo funcionan los seminarios de grado: condiciones, cursada y aprobación.',
 null, null, null, '[]'::jsonb,
 'Ver el reglamento',
 'http://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/09/reglamentacion_de_seminarios_de_grado-1.pdf',
 'seminario, seminarios, grado, reglamento, reglamentacion, cursada', true, 23),

-- ========== PLAN DE ESTUDIOS Y CORRELATIVAS (categoría 5) ==========
(5, 'Acreditar el tramo optativo',
 'El trámite para que te cuenten las materias del tramo optativo.',
 'Tener aprobado el final de 211 A - Trabajo Social I.',
 null,
 'Se pide escribiendo a alumnos@trabajosocial.unlp.edu.ar', '[]'::jsonb,
 'Ver la resolución',
 'http://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/12/acreditacion_tramo_optativo_proveido_resolutivo_022_19.pdf',
 'tramo, optativo, optativas, acreditar, acreditacion, creditos, materias', true, 10),

(5, 'Acreditar el idioma',
 'La certificación de idioma que te piden para recibirte.',
 'En Trabajo Social, tener aprobado el final de 211 A - Trabajo Social I. En Fonoaudiología, el de 821 - Procesos Lingüísticos y Comunicación.',
 null,
 'Se pide por correo a alumnos@trabajosocial.unlp.edu.ar, poniendo Acreditación Idioma en el asunto.',
 '[{"titulo":"Qué sirve para acreditar","detalle":"Cursos de instituciones, exámenes internacionales, y los cursos de idioma que dicta la propia facultad."},
   {"titulo":"Mandá el correo","detalle":"A alumnos@trabajosocial.unlp.edu.ar con el asunto Acreditación Idioma."}]'::jsonb,
 null, null,
 'idioma, ingles, portugues, acreditacion, acreditar, certificado, recibirme, requisito', true, 11),

(5, 'Plan de estudios: Licenciatura en Fonoaudiología',
 'El plan oficial de la carrera, con las materias de cada año y sus correlativas.',
 null, null, null, '[]'::jsonb,
 'Ver el plan',
 'http://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/04/plan_de_estudio_lic__en_fono__version_corregida_2022_.-en-Fono-version-corregida-2022.pdf',
 'plan, estudios, licenciatura, fonoaudiologia, fono, correlativas, materias', true, 3),

(5, 'Plan de estudios: CCC en Fonoaudiología',
 'El plan oficial del Ciclo de Complementación Curricular en Fonoaudiología.',
 null, null, null, '[]'::jsonb,
 'Ver el plan',
 'https://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/05/plan_de_estudio_de_ccc_de_licenciatura_en_fonoaudiologia_fts_unlp.pdf',
 'plan, estudios, ciclo, complementacion, curricular, ccc, fonoaudiologia, fono', true, 4),

-- ========== BECAS Y AYUDAS ECONÓMICAS (categoría 3) ==========
(3, 'Becas de la UNLP',
 'Seis becas de la universidad. La inscripción se abre una vez al año.',
 null,
 'La inscripción va de noviembre a marzo.',
 'Consultas a asuntosestudiantiles.fts@gmail.com',
 '[{"titulo":"Beca de ayuda económica","detalle":"Un monto mensual mientras estudiás."},
   {"titulo":"Beca de bicicleta universitaria","detalle":"Para moverte hasta la facultad."},
   {"titulo":"Beca para estudiantes con discapacidad","detalle":""},
   {"titulo":"Beca para estudiantes inquilinas e inquilinos","detalle":"Si alquilás para poder estudiar."},
   {"titulo":"Beca para estudiantes con hijas e hijos","detalle":""},
   {"titulo":"Beca Tu PC para Estudiar","detalle":"Para conseguir una computadora."}]'::jsonb,
 null, null,
 'becas, beca, unlp, ayuda, economica, plata, bicicleta, discapacidad, inquilino, alquiler, hijos, computadora, pc', true, 10),

(3, 'Beca PROGRESAR',
 'La beca nacional para estudiantes. Se pide directo al Ministerio, no por la facultad.',
 null, null,
 'Consultas a asuntosestudiantiles.fts@gmail.com', '[]'::jsonb,
 'Ir a PROGRESAR', 'https://becasprogresar.educacion.gob.ar/',
 'progresar, beca, nacional, ministerio, ayuda, economica, plata', true, 11),

(3, 'Becas de la Facultad',
 'Dos becas propias de la facultad: la de apuntes y la de trabajo.',
 null, null,
 'La inscripción se hace por el Centro de Estudiantes.', '[]'::jsonb,
 null, null,
 'becas, beca, apuntes, trabajo, facultad, fts, centro de estudiantes, cefts', true, 12),

-- ========== DÓNDE PEDIR AYUDA (categoría 13) ==========
(13, 'Ventanilla de alumnos: horarios y correos',
 'Dónde y cuándo preguntar cuando el trámite se complica.',
 null,
 'La ventanilla atiende de lunes a viernes, de 9 a 12 y de 14 a 18.',
 'ingreso@trabajosocial.unlp.edu.ar si estás ingresando. alumnos@trabajosocial.unlp.edu.ar para todo el resto.',
 '[]'::jsonb,
 'Más información',
 'https://trabajosocial.unlp.edu.ar/2025/04/04/tramites-y-consultas/',
 'ventanilla, horario, atencion, alumnos, ingreso, consulta, correo, mail, contacto, preguntar', true, 10),

(13, 'DAE y DIVE: apoyo estudiantil',
 'Dos oficinas de la facultad para cuando lo que necesitás no es un trámite.',
 null, null, null,
 '[{"titulo":"DAE, Asuntos Estudiantiles","detalle":"asuntosestudiantiles.fts@gmail.com"},
   {"titulo":"DIVE, Inclusión Educativa","detalle":"inclusioneducativafts@gmail.com"}]'::jsonb,
 null, null,
 'dae, dive, asuntos estudiantiles, inclusion, educativa, apoyo, acompañamiento, ayuda, discapacidad', true, 11),

-- ========== DÓNDE CURSO (categoría 8) ==========
(8, 'Servicios de la facultad',
 'Lo que hay adentro del edificio y podés usar.',
 null, null, null,
 '[{"titulo":"Sala de informática","detalle":"De lunes a viernes de 10 a 18. Computadoras y también impresión."},
   {"titulo":"Biblioteca","detalle":"Para estudiar y para conseguir material."},
   {"titulo":"Buffet y fotocopiadora","detalle":"Apuntes y comida a precios accesibles."}]'::jsonb,
 null, null,
 'sala, informatica, computadoras, imprimir, impresion, biblioteca, buffet, fotocopiadora, apuntes, comer', true, 10);

-- El régimen académico ya estaba cargado apuntando a una copia en Drive.
-- Lo pasamos al PDF oficial de la facultad, que es el que se mantiene al día.
update public.tramites
   set link_url = 'http://trabajosocial.unlp.edu.ar/wp-content/uploads/2025/09/regimen_academico_2024.pdf'
 where titulo = 'Régimen académico';

commit;

-- ============================================================
-- Lo único que no pude cargar
--
-- La Resolución 6646/21, que suprime la tasa administrativa del
-- título de grado, está enlazada en la página de la facultad pero
-- el archivo da 404. El dato quedó escrito en la ficha del diploma;
-- si conseguís el PDF le agregamos el botón.
--
-- Para ver cómo quedó todo:
--   select c.nombre, count(t.id) as fichas
--   from public.categorias c
--   left join public.tramites t on t.categoria_id = c.id and t.publicado
--   group by c.nombre order by fichas desc;
--
-- Tienen que quedar 8 categorías con fichas. Siguen vacías solo
-- "Extensión e investigación" y "Alquiler".
-- ============================================================
