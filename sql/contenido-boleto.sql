-- ============================================================
-- BOLETO UNIVERSITARIO · información real
--
-- Qué hace: reemplaza el contenido de la ficha "Pedir el Boleto
-- Universitario", que hoy está publicada con datos de ejemplo.
--
-- Con esto se van CINCO de las seis marcas REVISAR que quedaban en
-- toda la app: las de requisitos, plazo, dónde y dos de los pasos.
--
-- Cómo se corre:
--   supabase.com -> proyecto "La Bolivar con vos" -> SQL Editor
--   -> New query -> pegar todo esto -> Run
--
-- Se puede correr más de una vez sin problema: pisa siempre lo mismo.
--
-- La ficha vive en la categoría "Boleto universitario", que en el
-- inicio aparece dentro de "Mis derechos", al lado de "Becas y ayudas
-- económicas".
-- ============================================================

update public.tramites set

  resumen = 'El trámite para viajar más barato mientras estudiás. Estos son los pasos para pedirlo por primera vez.',

  requisitos =
    'Ser alumno o alumna regular.' || chr(10) ||
    'Vivir en la provincia de Buenos Aires, a más de 2.000 metros de la facultad.' || chr(10) ||
    'Tener aprobadas al menos 3 materias del año anterior y 1 del semestre anterior. Si estás en primer año, haber terminado el secundario sin materias adeudadas al momento de entregar la documentación.' || chr(10) ||
    'No tener título universitario ni terciario.' || chr(10) ||
    'No estar cobrando otro subsidio del Estado con el mismo fin. Si cobrás otro, tenés que elegir uno de los dos: si no, te rechazan la solicitud.',

  plazo =
    'La precarga se habilita todos los meses: el Ministerio de Transporte le avisa a la Universidad cuando está disponible, y ahí la acreditás vos en la tarjeta.',

  donde =
    'Todo por internet: primero registrás la SUBE en el sitio de Nación, después entrás al portal web de la facultad con tu usuario y clave.',

  pasos = '[
    {"titulo":"Registrá tu tarjeta SUBE",
     "detalle":"En argentina.gob.ar/sube o desde la app SUBE. Ojo: el beneficio anda solamente con las tarjetas SUBE físicas."},
    {"titulo":"Entrá al portal web de la facultad",
     "detalle":"Con tu usuario y tu clave, los mismos de siempre."},
    {"titulo":"Completá el formulario del Ministerio de Transporte",
     "detalle":"Es un formulario web, se completa ahí mismo."},
    {"titulo":"Acreditá la precarga en la tarjeta",
     "detalle":"De cualquiera de estas tres formas: en una Terminal Automática SUBE, apoyando la tarjeta hasta que te avise que la podés retirar; desde la app SUBE si tu celular tiene NFC, con la opción Acreditá o consultá saldo y después Acreditar cargas; o en la validadora de un colectivo que tenga Carga a Bordo."}
  ]'::jsonb,

  palabras_clave =
    'boleto, universitario, bee, sube, colectivo, transporte, gratuito, micro, viajar, pasaje, carga, precarga',

  link_titulo = 'Registrar la SUBE',
  link_url    = 'https://www.argentina.gob.ar/sube',
  publicado   = true

where titulo = 'Pedir el Boleto Universitario';


-- ============================================================
-- Lo que quedó afuera a propósito
--
-- 1. El texto original aclara que estos pasos son para quien NO
--    tramitó antes el Boleto Especial Educativo (BEE) de la Ley
--    14.735. Lo puse en el resumen como "para pedirlo por primera
--    vez". Si hace falta explicar el caso de quien ya lo tramitó,
--    eso es una ficha aparte y hay que conseguir el texto.
--
-- 2. El listado de Centros de Atención SUBE, Puntos SUBE y Terminales
--    Automáticas: en el texto que me pasaste dice "ingresá acá" pero
--    sin la dirección. Cuando la tengas la agregamos.
--
-- 3. Cada cuánto hay que renovarlo: el texto no lo dice, así que no
--    lo puse. Lo que sí dice, y quedó, es que la precarga se habilita
--    mes a mes.
-- ============================================================

-- Para ver cómo quedó:
--   select titulo, requisitos, plazo, donde, jsonb_array_length(pasos) as pasos
--   from public.tramites where titulo = 'Pedir el Boleto Universitario';
