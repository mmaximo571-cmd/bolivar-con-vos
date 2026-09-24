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
MATERIAL: la lista de categorías que el CEFTS puede gestionar.
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
MATERIAL: las 4 primeras preguntas.
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

## Fuera del código (para el chat común, no para una sesión de código)

- **El calendario de contenidos de los 15 días:** con el plugin marketing
  (`campaign-plan`), pasándole la sección «Hacia las elecciones» y las metas.
- **Las placas de Instagram del lanzamiento 2.0:** con canva
  (`canva-resize-for-social-media`), en la estética de la serigrafía.
