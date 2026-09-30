# La Bolívar con vos

La app es HTML, CSS y JavaScript a mano, sin compilar nada: lo que está
en el repositorio es lo que corre. Los datos salen de Supabase. Se
publica en Vercel, en labolivarconvos.ar.

## Lo primero: preguntarle al grafo, no abrir archivos

En `graphify-out/` hay un grafo de la app (código propio, pantallas y
documentos; sin librerías de terceros ni material de estudio, ver
`.graphifyignore`). Existe para **economizar tokens**.

- Para preguntas sobre la app («dónde está…», «qué usa…», «qué pantalla
  lee tal tabla»), lo primero es `graphify query "<pregunta>"`. Para
  relaciones, `graphify path "<A>" "<B>"`; para un concepto,
  `graphify explain "<nombre>"`. Devuelven un recorte chico.
- `graphify-out/GRAPH_REPORT.md` solo para una mirada general de la
  arquitectura, no en cada sesión.
- Abrir el archivo fuente recién cuando haya que modificarlo o
  depurarlo, y solo la parte que indica `source_location`.
- Después de cambiar código, `graphify update .` (solo AST, no gasta
  tokens). Si cambian documentos o pantallas a fondo, `/graphify
  --update`. Ojo: `update` rebautiza los grupos con el nombre de su nodo
  central; a las consultas no les afecta, así que no hace falta
  re-etiquetarlos.
- El grafo sabe poco de lo que está al final de `BITACORA.md` y
  `LEEME.md`: si la pregunta es sobre una decisión vieja y el grafo no
  la trae, buscar con Grep en esos archivos, **nunca leerlos enteros**.
- **El grafo no indexa CSS.** Tiene nodos de `.js`, `.html`, `.md` y
  `.sql`, y cero de `.css` (se comprobó el 27/9/2026: `graphify update`
  los saltea por extensión). Para los estilos no sirve preguntarle: se
  usa la tabla de abajo para saber en qué hoja mirar, y Grep adentro de
  esa hoja.

Si `graphify` no está en el PATH, el ejecutable está en
`C:\Users\Acer\.uv\tools\graphifyy\Scripts\graphify.exe`. En una sesión
en la nube se instala con `uv tool install 'graphifyy[sql]'`: sin el
`[sql]` los `sql/tabla-*.sql` no aportan nodos y `update` se niega a
pisar el grafo (no usar `--force` en ese caso, borraría las tablas).

## Dónde está cada cosa

Los estilos y `app.js` están partidos a propósito (27/9/2026), para no
tener que abrir 5000 líneas cuando el cambio es de veinte.

### Estilos

| Archivo | Qué tiene | Cuándo se abre |
|---|---|---|
| `css/tokens.css` (310 líneas) | colores, tipografías, redondeos, sombras, modo oscuro | **cualquier cambio de aspecto de toda la app empieza y termina acá** |
| `css/base/01..12-*.css` | lo que usan todas, partido en doce componentes (ver abajo) | cuando la regla es de un componente compartido |
| `css/pantallas/*.css` | lo que usa **una sola** pantalla: `carrera`, `inicio`, `estudiemos`, `consejo`, `trayecto`, `anatomo`, `tramites` | cuando el cambio es de esa pantalla |
| `estilos-rediseno.css` | el rediseño de las tarjetas; **carga último, así que en las tarjetas manda este** | ojo: si una regla de tarjeta no hace efecto, está pisada desde acá |

La regla del reparto: una clase que usa más de una pantalla, o que
escribe un guion compartido (`app.js` y compañía), vive en `base.css`.
Solo baja a la hoja de una pantalla la regla cuyas clases son **todas**
de esa pantalla. **Ninguna regla está repetida en dos hojas**: si está
en una, no está en la otra.

### Los doce componentes de la base

Ninguno pasa de 420 líneas, y el nombre dice qué hay adentro:

| | |
|---|---|
| `01-cimientos` | el reset, el cuerpo, saltar al contenido, el foco, el estado apretado, los títulos |
| `02-encabezado` | la marca, el menú lateral, la campana, el buscador, el índice del pie |
| `03-controles` | botones, campos, interruptores, chips |
| `04-tarjetas` | tarjetas y cómo se agrupan: listas, filas, grupos, módulos, bloques |
| `05-secciones` | las secciones, los espacios, los pasos de un trámite, las pestañas |
| `06-hoja` | la hoja que sube desde abajo. **Acá vive `--t-hoja`** |
| `07-avisos` | avisos, alertas, la alarma de inscripción, pantallas vacías, errores, esqueletos |
| `08-calendario` | el calendario mensual y «pasalo a tu calendario» |
| `09-avisanos` | el botón flotante y su chat |
| `10-lectura` | lo que comparten las pantallas que se leen: glosario, fichas, temas, materiales |
| `11-navegacion` | la barra de abajo, la de secciones, el pie, los nexos, la banda de cierre |
| `12-movimiento` | los `@keyframes`, el paso de una pantalla a otra, la apertura, «menos movimiento» |

**El orden importa y es el numerado.** Al agregar una hoja nueva a la
base hay que agregarla a las 23 pantallas, en su lugar, y al armazón de
`sw.js`. Por eso conviene no agregar hojas: casi todo entra en una de
las doce.

El orden de carga en cada pantalla es siempre
`tokens → base/01..12 → (su hoja) → estilos-rediseno`, y no se cambia.

Al agregar una regla: si su clase la va a usar otra pantalla, va a
`base.css`. Si es de una sola, a su hoja. Si esa pantalla todavía no
tiene hoja (agenda, mapa, panel, mi, catedras, decilo, donde-curso,
espacios, glosario, quienes, fichas), va al final de
`css/base/01-cimientos.css`, que es donde quedó lo suyo.

### JavaScript

- `app.js` (2330 líneas) — lo compartido por las 22 pantallas: sesión,
  registro, hitos, utilidades, cabecera, secciones, la campana (la
  bandeja de Hoy, Esta semana, Cambios y Nuevo), la alerta de la mesa,
  los errores, lo guardado entre visitas, el service worker y los
  avisos.
- `lib/mudanza.js` — la mudanza desde la dirección vieja de Vercel.
  Carga **antes** de `app.js` y no depende de nada.
- `lib/fecha-al-calendario.js` — pasar una fecha al calendario del
  celular (ICS y Google). Carga **después** de `app.js` y solo en
  `agenda/`.
- `lib/tarjeta-avisos.js` — `pintarAvisos()`. Después de `app.js`, solo
  en `mi/`.
- `config.js`, `iconos.js`, `lectura.js`, `movimiento.js`,
  `fondo-red.js` — piezas chicas, cada una de una cosa.
- `lib/datos.js` es el cliente chico de Supabase, el que usa la
  mayoría; `lib/supabase.js` es la librería grande (213 KB) y la
  cargan solo las pantallas que la necesitan. El chico sabe `select`,
  `eq`, `or`, `order`, `limit`, `maybeSingle`, `insert` y `rpc`, y **no
  tiene sesión**: lo que necesita cuenta (como juntar lo leído de la
  campana) pasa solo en las pantallas con la grande. Preguntar
  `'auth' in db` antes de `db.auth`: la guardia del chico tira un error
  con cualquier cosa que no sepa.

### Lo demás

- `sql/` — `tabla-*.sql` (una tabla con sus permisos cada uno) y
  `contenido-*` (contenido para cargar). Las pantallas avisan «falta
  correr `sql/tabla-x.sql`» cuando la tabla no está.
- `docs/` — `HISTORIAL-SW.md` (por qué subió cada versión del service
  worker), `PROPUESTAS.md` (las ideas antes de ser tarea: se anota ahí y
  recién decidida pasa al cronograma de `BITACORA.md`) y `docs/prompts/`
  (los encargos de cada tanda de trabajo).
- `BITACORA.md` y `LEEME.md` en la raíz: son largos y **se buscan con
  Grep, no se leen**.

## El service worker

`sw.js` sirve lo guardado antes que la red. **Cada vez que cambia qué se
guarda, o el contenido de algo que ya está en la lista, hay que subir
`VERSION`** y anotar el número, la fecha y el porqué en
`docs/HISTORIAL-SW.md`. Sin eso, los teléfonos que ya tienen la app
siguen con lo viejo.

En el armazón van solo `css/tokens.css`, los doce de `css/base/`,
`estilos-rediseno.css`, `app.js`, `lib/mudanza.js` y las piezas chicas:
lo que usa cualquier pantalla. Una hoja o un guion de **una** pantalla no
va en la lista; lo baja quien entre ahí y queda guardado solo por la
regla del final de `sw.js`.

`python pruebas-avisos/refs.py` revisa que todo lo que nombra el
armazón exista de verdad. Conviene correrlo después de tocar la lista.
Los 79 «ROTA» que informa son plantillas `${...}` y el script de
estadísticas de Vercel: ruido conocido, no hace falta arreglarlo.

## Cómo comprobar un cambio de estilos sin mirar a ojo

Sirvió para partir `estilos.css` y sirve para cualquier reordenamiento:
en cada pantalla se fotografía el estilo calculado de todos los
elementos (unas 60 propiedades), se cambia a la versión anterior de la
hoja en vivo, se vuelve a fotografiar, y se vuelve a la nueva para una
**tercera** foto. Lo que cambia entre la primera y la tercera es
contenido que llegó de Supabase mientras se medía, y no cuenta; lo que
queda es diferencia real. Las pantallas se recorren en un `iframe` desde
una sola pestaña, así no hay que navegar 23 veces.

### El chequeo del orden entre hojas

`python pruebas-avisos/orden-css.py` busca el peligro que aparece al
tener el CSS en varios archivos: **dos reglas que pesan igual y le pegan
al mismo elemento**. Entre iguales decide el orden, y el orden ahora
depende de en qué hoja quedó cada una.

No dice «esto está roto»: dice «acá hay dos reglas que se pelean y gana
la de la hoja que cargue después». Hoy informa 4 pares, y los 4
conservan el orden que tenían en el archivo original. Si después de
mover algo aparece un par nuevo, hay que mirarlo.

Sabe qué combinaciones de clases existen de verdad (las saca de los
`class="…"` del HTML y del JS), así que no marca imposibles como
`.menu-fondo.cerrando` contra `.hoja-fondo.cerrando`. Sin eso informaba
113 pares y no servía para nada.

Así se encontró el único error real de la partición: `#olvide` es
`class="boton texto ancho"`, y al mandar `.texto` a cimientos —antes que
`.boton`, cuando en el original venía después— el botón pasaba de
`display:flex` a `inline-flex`.

Dos avisos de esa prueba:
- La ventana de la vista previa **minimizada no dibuja**:
  `requestAnimationFrame` no corre y hay que esperar con `setTimeout`.
  El contraste, el `lazy` y el scroll dan falsos positivos.
- El panel y `mi/` piden cuenta, así que sin entrar solo se mide la
  parte que se ve (77 y 237 elementos). Ahí la prueba tapa poco.

## Al escribir código

- Todo en castellano: nombres de funciones, de clases, de variables, y
  los comentarios. Se sigue el estilo que ya está: comentarios que
  explican **por qué**, no qué.
- No hay compilación ni empaquetador. Un `<script>` nuevo se agrega a
  mano en cada pantalla que lo necesite, y al armazón de `sw.js` si lo
  usan todas.
- La clave de `config.js` (`sb_publishable_…`) es pública a propósito y
  tiene que subirse. La secreta (`sb_secret_…`) no va en ningún archivo.
