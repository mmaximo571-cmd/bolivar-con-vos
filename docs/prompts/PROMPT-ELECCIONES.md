# Prompts para las sesiones hacia las elecciones (24/9 al 6/11)

Uno por sesión. Se pega **el bloque común** y, abajo, **la tarea del día**.
El plan completo está en `BITACORA.md`, en «Hacia las elecciones»: estos
prompts existen para que ninguna sesión tenga que leerlo entero.

**Dónde se trabaja (cambiado el 27/9).** Todo va a `main` y se publica
pieza por pieza: la rama `lanzamiento-2` se cierra en la sesión 2, trayendo
`sql/tabla-buzon.sql` (la tabla ya está aplicada en el proyecto real). Lo que
evita que el buzón se vea antes de tiempo no es la rama: es que **no se
enlaza desde Inicio ni desde Avisanos hasta la sesión 3**, cuando existe la
bandeja.

**El orden, después del replanteo del 27/9** (está en `BITACORA.md`, en «El
replanteo del 27/9»; manda sobre las semanas de abajo):

| # | Sesión | Prompt |
|---|---|---|
| — | ✅ Buzón: tabla y permisos | S1, hecho el 24/9 |
| 1 | ✅ El reloj de los avisos | hecho el 27/9. Falta un secreto: ver abajo |
| 2 | ✅ Buzón: la pantalla pública, en `decilo/`, sin enlazar | hecho el 27/9 |
| **3** | **La bandeja de comunicación, y se enlaza el buzón** | **la que sigue**, abajo |
| 4 | Aviso al autor cuando cambia el estado | S4, solo esa parte |
| 5 | ✅ La tarjeta para historias | hecho el 27/9, adelantada |

**La que sigue es la 3, y es la que falta para que el buzón se pueda
mostrar.** Antes de abrirla hacen falta tres cosas que no son código: las
~10 respuestas ya escritas del equipo, quiénes reciben el rol
`comunicacion` (con su cuenta creada en la app y los avisos prendidos), y
el `VAPID_PRIVADA` de verdad en los secretos, sin el cual los avisos del
buzón no salen.
**Cortados:** S6 (la pregunta de la semana pasa a encuesta de Instagram o
formulario), S8 y S10 (no hay lanzamiento en bloque ni merge), S9 (se prueba
en el teléfono al día siguiente de cada push) y el resumen diario de S4. S11
y S12 quedan juntos el 2/11.

**Sesión 3 · La bandeja de comunicación** (reescrita el 27/9 con lo que ya
existe)
```
TAREA: la bandeja del buzón en el panel, para el rol comunicacion y pensada
para el celular. Lo que ya está hecho y no hay que rehacer: la tabla
(`sql/tabla-buzon.sql`, aplicada, con el rol `comunicacion`, `modera_buzon()` y
la vista `buzon_totales`) y la pantalla pública (`decilo/`, publicada y sin
enlazar). Falta:
 1. Una tarjeta por pedido con los tres botones: publicar y responder / en
    gestión / descartar. Las fechas las pone la base, no el panel.
 2. Las respuestas ya escritas, que se editan antes de mandar (MATERIAL).
 3. Que quien tenga rol comunicacion vea SOLO esto y Novedades. El panel ya
    se lee como índice de cuatro grupos: sumala donde corresponda.
 4. Enlazar `decilo/` desde Inicio y desde Avisanos, recién ahora. SIN
    entrar a la fila de secciones. Si el nombre `decilo/` no gusta, este es
    el último momento para cambiarlo.
Ojo con lo que el panel usa: `lib/supabase.js` (la librería grande, porque
tiene sesión). No abras `panel/index.html` entero: `graphify query` primero.
MATERIAL: las ~10 respuestas ya escritas del equipo de comunicación, y
quiénes reciben el rol `comunicacion`.
```

**Hecha · Sesión 1 · El reloj de los avisos** (27/9). Quedó corriendo:
`pg_cron` y `pg_net` instalados, `cron.job` con `avisos-cada-hora`, y una
función nueva y chica, `reloj`, que despierta a `avisos` identificándose con
un pase de un solo uso, así la clave de servicio no queda escrita en
`cron.job`. **Falta un secreto y no lo puede cargar Claude:**
`VAPID_PRIVADA` tiene cargada la clave pública en vez de la privada, y por
eso no salió nunca un aviso. Ver `sql/tabla-avisos.sql`, «6. EL RELOJ».

---

## Bloque común (va siempre)

```
PLAN: sección «Hacia las elecciones» de BITACORA.md, empezando por «El
replanteo del 27/9», que manda sobre el resto (grep -n "Hacia las
elecciones" y "Dónde estamos" para los límites).
RAMA: main. Se publica pieza por pieza. El buzón no se enlaza desde Inicio
ni desde Avisanos hasta que exista la bandeja.

Reglas:
- No leas LEEME.md enteros ni el resto de BITACORA.md: grep -n por lo que necesites.
- Antes de abrir un archivo grande, `graphify query "<pregunta>"` (en la nube:
  `uv tool install 'graphifyy[sql]'`). Abrí solo el tramo que indique.
- No abras enteros app.js, index.html, estilos.css, panel/index.html ni carrera/index.html.
- Reusá lo que existe (clases, esc(), pintarNav(), clientes de datos, avisos). No inventes estilos.
- Hasta 3 preguntas cortas antes de empezar, solo si bloquean.
- Supabase: cambios de tablas con apply_migration y el .sql también en el repo (tabla-*.sql).
- Una tarea, un commit. Probalo (servidor local y 375 px), `graphify update .`,
  una línea en el cronograma de la bitácora, push a main.
- Al cerrar, decile a Máximo qué hay que mirar en el teléfono al día
  siguiente: ya no hay ventana de pruebas aparte.
- Respuesta final: qué quedó, qué probaste, qué falta. Nada más.
```

---

## Semana 1 (28/9 al 4/10): el buzón y la bandeja

**S1 · Buzón: tabla y permisos** ✅ hecho el 24/9
```
TAREA: sql/tabla-buzon.sql. Tabla de pedidos (texto, categoria, carrera, estado
recibido|en_gestion|resuelto|descartado, publicado, respuesta, fechas de cada
estado, suscripcion opcional para avisar al autor). Insert sin cuenta con topes
de largo en TODOS los campos (ver el agujero del 2/9 en sql/tabla-avisanos.sql) y
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

**S4 · Los avisos del buzón** (recortado el 27/9: va solo el (3), y el (1)
si sobra tiempo; el resumen diario lo reemplaza mirar la bandeja una vez por
día)
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

**S6 · La pregunta de la semana** ⏭ **cortada el 27/9**: las cuatro
preguntas se corren como encuesta de Instagram o formulario linkeado desde
Novedades, sin código.
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

**S8 · Congelamiento (mié 14/10)** ⏭ **cortada el 27/9**: no hay
lanzamiento en bloque.
```
TAREA: congelamiento del lanzamiento 2.0. Subí la versión del service worker
(sw.js, VERSION y la nota), `graphify update .`, bitácora al día, y armá la
lista de pruebas en teléfono para el 15 al 18: cada pantalla nueva, en
Android y en iPhone, desde el navegador de Instagram y con la app instalada.
MATERIAL: ninguno.
```

**S9 · Arreglos de las pruebas (15 al 18/10)** ⏭ **cortada el 27/9**: se
prueba en el teléfono al día siguiente de cada push y los arreglos abren la
sesión siguiente.
```
TAREA: arreglar SOLO lo que salió de las pruebas en teléfono. Nada nuevo.
MATERIAL: la lista de fallas, con pantalla y teléfono.
```

**S10 · Lanzamiento 2.0 (lun 19/10)** ⏭ **cortada el 27/9**: ya no hay
rama que unir.
```
TAREA: unir lanzamiento-2 a main (merge, sin reescribir historia), verificar
que Vercel publicó y que el buzón recibe un pedido de prueba, y borrarlo.
MATERIAL: ninguno.
```

## Los 15 días (20/10 al 3/11): sin código

**S11 · Informe de la semana (queda uno solo, el lun 2/11)**
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

**B1 · Datos de la UNLP** ✅ hecho el 30/9: los números, con su fuente y lo
que falta, están en `BITACORA.md`, «B1 hecho». El encargo queda de referencia.
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
| Guías de las materias que más cuestan | B5 y B4 (4) | Noviembre | Fichas con `docs/prompts/PROMPT-FICHAS.md` |
| Kit de primer año | B3 y B4 (3) | Diciembre y enero | Pantalla nueva, para el ingreso 2027 |
| Propuesta de reactivar tutores pares | B2, B3 y B4 | Después de las elecciones | Al Consejo |

---

## Fuera del código (para el chat común, no para una sesión de código)

- **El calendario de contenidos de los 15 días:** con el plugin marketing
  (`campaign-plan`), pasándole la sección «Hacia las elecciones» y las metas.
- **Las placas de Instagram del lanzamiento 2.0:** con canva
  (`canva-resize-for-social-media`), en la estética de la serigrafía.
