# Prompts para las sesiones hacia las elecciones (24/9 al 6/11)

Uno por sesión. Se pega **el bloque común** y, abajo, **la tarea del día**.
El plan completo está en `BITACORA.md`, en «Hacia las elecciones»: estos
prompts existen para que ninguna sesión tenga que leerlo entero.

**Dónde se trabaja.** Hasta el lanzamiento 2.0 (lun 19/10) todo va a la
rama `lanzamiento-2`, no a `main`: Vercel publica cada push a `main`, y el
buzón no se muestra antes de tiempo. Las tablas de Supabase sí se crean en
el proyecto real, porque sin pantallas que las usen nadie las ve. Los
arreglos urgentes de la app de hoy van a `main`, como siempre.

---

## Bloque común (va siempre)

```
PLAN: sección «Hacia las elecciones» de BITACORA.md. Leé SOLO esa sección
(grep -n "Hacia las elecciones" y "Dónde estamos" para los límites).
RAMA: lanzamiento-2 (creala desde main si no existe). No pushees a main.

Reglas:
- No leas LEEME.md enteros ni el resto de BITACORA.md: grep -n por lo que necesites.
- Antes de abrir un archivo grande, `graphify query "<pregunta>"` (en la nube:
  `uv tool install 'graphifyy[sql]'`). Abrí solo el tramo que indique.
- No abras enteros app.js, index.html, estilos.css, panel/index.html ni carrera/index.html.
- Reusá lo que existe (clases, esc(), pintarNav(), clientes de datos, avisos). No inventes estilos.
- Hasta 3 preguntas cortas antes de empezar, solo si bloquean.
- Supabase: cambios de tablas con apply_migration y el .sql también en el repo (tabla-*.sql).
- Una tarea, un commit. Probalo (servidor local y 375 px), `graphify update .`,
  una línea en el cronograma de la bitácora, push a lanzamiento-2.
- Respuesta final: qué quedó, qué probaste, qué falta. Nada más.
```

---

## Semana 1 (28/9 al 4/10): el buzón y la bandeja

**S1 · Buzón: tabla y permisos**
```
TAREA: tabla-buzon.sql. Tabla de pedidos (texto, categoria, carrera, estado
recibido|en_gestion|resuelto|descartado, publicado, respuesta, fechas de cada
estado, suscripcion opcional para avisar al autor). Insert sin cuenta con topes
de largo en TODOS los campos (ver el agujero del 2/9 en tabla-avisanos.sql) y
un tope de pedidos por hora. Lectura pública solo de lo publicado, sin la
suscripción. Rol nuevo `comunicacion` en perfiles: modera el buzón y carga
novedades, nada más. Vista con los totales del tablero. Cerrá con /security-review.
MATERIAL: la lista de categorías que el CEFTS puede gestionar. Una fija:
«Cursada y estudio» (el eje de permanencia).
```

**S2 · Buzón: la pantalla pública**
```
TAREA: pantalla del buzón «Decilo»: formulario (texto, categoría, carrera
precargada de la app, «avisame cuando cambie» que usa los avisos existentes)
y tablero de lo publicado con estado, fechas y totales. Sin cuenta. Enlazada
desde Inicio y desde Avisanos, pero SIN entrar a la fila de secciones.
Preguntame el nombre de la carpeta antes de crearla (las direcciones no se
cambian después).
MATERIAL: ninguno.
```

**S3 · La bandeja de comunicación**
```
TAREA: sección del panel para el rol comunicacion, pensada para el celular:
una tarjeta por pedido, botones publicar y responder / en gestión / descartar,
respuestas ya escritas que se editan antes de mandar. El panel ya se lee como
índice de cuatro grupos: sumala donde corresponda y que quien tenga rol
comunicacion vea solo esto y Novedades.
MATERIAL: las ~10 respuestas ya escritas del equipo de comunicación.
```

**S4 · Los avisos del buzón**
```
TAREA: en supabase/functions/avisos: (1) aviso al equipo (suscripciones cuyo
usuario tiene rol equipo o comunicacion) cuando entra un pedido; (2) resumen
diario de lo que lleva más de 24 h sin respuesta; (3) aviso al autor cuando su
pedido cambia de estado. Respetá el horario 9 a 21 y «una vez por teléfono»
(avisos_enviados). Leé solo «Los avisos al celular» en LEEME.md.
MATERIAL: ninguno.
```

## Semana 2 (5/10 al 11/10): llegar a más

**S5 · La tarjeta para historias**
```
TAREA: en Mi año, botón «Compartir mi avance» que arma una imagen 1080x1920
con la estética de la serigrafía (amarillo, Archivo Black, tinta) y «voy X de
Y materias», con el link `?de=historia-avance`. Usar navigator.share con el
archivo; si no hay, descargarla. Sin librerías nuevas (canvas).
MATERIAL: ninguno.
```

**S6 · La pregunta de la semana**
```
TAREA: tabla de preguntas y votos (un voto por teléfono, sin cuenta, con
tope), tarjeta en Inicio con los resultados a la vista después de votar, y
carga de la pregunta desde la bandeja de comunicación. Cierra sola al
terminar la semana.
MATERIAL: las 4 preguntas de B4, más abajo en este archivo.
```

**S7 · Colchón**
```
TAREA: lo que haya quedado de S1 a S6, o el error que muestre el registro.
MATERIAL: ninguno.
```

## Semana 3 (12/10 al 18/10): cerrar y probar

**S8 · Congelamiento (mié 14/10)**
```
TAREA: congelamiento del lanzamiento 2.0. Subí la versión del service worker
(sw.js, VERSION y la nota), `graphify update .`, bitácora al día, y armá la
lista de pruebas en teléfono para el 15 al 18: cada pantalla nueva, en
Android y en iPhone, desde el navegador de Instagram y con la app instalada.
MATERIAL: ninguno.
```

**S9 · Arreglos de las pruebas (15 al 18/10)**
```
TAREA: arreglar SOLO lo que salió de las pruebas en teléfono. Nada nuevo.
MATERIAL: la lista de fallas, con pantalla y teléfono.
```

**S10 · Lanzamiento 2.0 (lun 19/10)**
```
TAREA: unir lanzamiento-2 a main (merge, sin reescribir historia), verificar
que Vercel publicó y que el buzón recibe un pedido de prueba, y borrarlo.
MATERIAL: ninguno.
```

## Los 15 días (20/10 al 3/11): sin código

**S11 · Informe de la semana (mar 27/10 y lun 2/11)**
```
TAREA: informe corto con el registro de Supabase (tabla sucesos, hitos,
avisos_suscripciones y el buzón) contra las metas de la bitácora: eligió
carrera 1.200, avisos 300, 150 pedidos contestados en menos de 48 h. Qué
subió, qué no, y una sola recomendación. No toques código.
MATERIAL: ninguno.
```

**S12 · Ficha «Cómo se vota» (lun 2/11, hay recordatorio)**
```
TAREA: ficha neutral en Info útil: dónde, días y horarios, qué llevar, cómo
consultar el padrón. Se saca después del 6/11. Esta sí va directo a main.
MATERIAL: los datos oficiales de la junta electoral.
```

---

## Búsqueda: permanencia y estudio

El eje está explicado en `BITACORA.md`, en «El eje: permanencia y estudio».
Los dos momentos prioritarios son **los finales acumulados** y **el primer
año**, en las tres carreras: Trabajo Social, Fonoaudiología y la Tecnicatura
en Gestión Comunitaria del Riesgo.

**B1 · Datos de la UNLP (sesión de Claude, con la red habilitada)**
```
TAREA: diagnóstico de permanencia de la FTS. Del Anuario Estadístico de la
UNLP (el último y el anterior, en unlp.edu.ar, sección de estadísticas),
sacá por carrera de la FTS: ingresantes, reinscriptos, egresados y todo lo
que haya sobre retención de primer año o sobre estudiantes sin materias
aprobadas en el año. Buscá en sedici.unlp.edu.ar trabajos sobre abandono o
permanencia en la FTS. Resultado: una tabla con cada número y su fuente,
en la sección del eje de BITACORA.md. Que la tabla diga qué no se encontró.
No toques código.
MATERIAL: ninguno (necesita unlp.edu.ar, trabajosocial.unlp.edu.ar y
sedici.unlp.edu.ar habilitados en la red del entorno).
```

**B2 · Lo que ya existe (para un colaborador, sin Claude)**

Por cada cosa: qué es, quién puede pedirla, cómo se pide, dónde se atiende,
en qué horario, un contacto, y si hoy funciona o no. Se pregunta en persona
cuando la web no lo dice.

- Becas de la UNLP y de la FTS (ayuda económica, materiales, conectividad)
- Comedor universitario y boleto
- Programa de Promoción del Egreso de la FTS
- Dirección de Vinculación e Inclusión Educativa
- Tutores pares: por qué está inactivo, desde cuándo, y si hay intención de
  reactivarlo
- Salud mental o consejería estudiantil
- Cursada en otro turno y cambio de comisión
- Cómo se pide el certificado de materias cuando el SIU no lo ofrece (lo
  preguntaron en Avisanos)

Se entrega en una planilla. De ahí salen las fichas de «Si te está costando».

**B3 · Bibliografía (NotebookLM)**

Cargar en NotebookLM: Ezcurra, *Igualdad en educación superior* (2011);
Tinto sobre retención; Coulon, *El oficio de estudiante* (la afiliación);
Carli, *El estudiante universitario*; y lo que traiga B1 de SEDICI. Pegar:
```
Con estas fuentes, armá un marco de no más de dos páginas para una
agrupación estudiantil de la Facultad de Trabajo Social (UNLP). Tres
partes: (1) por qué se abandona, con énfasis en primer año y en los finales
que se acumulan sin rendir; (2) qué intervenciones mostraron resultados
(tutorías entre pares, grupos de estudio, orientación temprana,
acompañamiento en finales), con la fuente de cada una; (3) qué puede hacer
una organización estudiantil, distinto de lo que hace la institución. Citá
autor y página. No inventes datos: si una fuente no lo dice, no lo pongas.
```

**B4 · Las 4 preguntas de la semana (la encuesta de permanencia)**

Van en S6. Una por semana, opciones cerradas, anónimas:

1. **¿Cuántos finales tenés pendientes?** Ninguno · 1 o 2 · 3 a 5 · Más de 5
2. **¿Qué es lo que más te frena para rendir un final?** El tiempo (trabajo
   o cuidados) · No sé cómo prepararlo · Los nervios · Se me pasan las
   fechas · Otra cosa
3. **En tu primer año, ¿qué fue lo más difícil?** Entender cómo funciona la
   facultad · El ritmo de lectura · Los horarios con el trabajo · Sentirme
   parte · Nada en especial
4. **¿Qué te ayudaría más a avanzar?** Grupos de estudio · Alguien que me
   oriente (tutor par) · Material resumido · Avisos de fechas · Horarios
   más flexibles

La 1 y la 2 miden los finales acumulados, la 3 el primer año, y la 4
decide qué material se hace primero. Si los resultados justifican
reactivar tutores pares, van al Consejo.

**B5 · Datos de la app (sesión de Claude)**
```
TAREA: consulta de solo lectura en Supabase, sin mirar a nadie en
particular: por carrera, qué materias cargan más en cursada, y (si la
tabla de respaldos lo permite sin exponer personas) qué materias aparecen
más como regularizadas y no aprobadas. Solo agregados con 5 o más
personas. Resultado: la lista de materias donde conviene hacer guía o
grupo de estudio antes de las mesas de diciembre, en la sección del eje de
BITACORA.md. No toques código.
MATERIAL: ninguno.
```

**Los materiales que salen de la búsqueda**

| Material | De dónde sale | Cuándo | Cómo entra |
|---|---|---|---|
| «Si te está costando» | B2 | 20/10 al 3/11 | Contenido en Info útil, desde el panel |
| «Rendí lo que debés» (finales de diciembre) | B4 (1, 2) y B5 | Del 20/10 a las mesas | Novedades con aviso al celular, más grupos de estudio en Estudiemos |
| Guías de las materias que más cuestan | B5 y B4 (4) | Noviembre | Fichas con `PROMPT-FICHAS.md` |
| Kit de primer año | B3 y B4 (3) | Diciembre y enero | Pantalla nueva, para el ingreso 2027 |
| Propuesta de reactivar tutores pares | B2, B3 y B4 | Después de las elecciones | Al Consejo |

---

## Fuera del código (para el chat común, no para una sesión de código)

- **El calendario de contenidos de los 15 días:** con el plugin marketing
  (`campaign-plan`), pasándole la sección «Hacia las elecciones» y las metas.
- **Las placas de Instagram del lanzamiento 2.0:** con canva
  (`canva-resize-for-social-media`), en la estética de la serigrafía.
