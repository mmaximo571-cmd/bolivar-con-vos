# Cómo está hecha por dentro

Lo que sigue es la forma a la que llegó La Bolívar después de diez
semanas. La app nueva **arranca así**, no llega a esto de a poco.

---

## La decisión de fondo: HTML a mano, sin compilar

- Archivos `.html`, `.css` y `.js` sueltos. **Lo que está en el
  repositorio es lo que corre.** Sin npm, sin React, sin Tailwind, sin
  empaquetador.
- **Por qué:** quien la mantiene trabaja solo, en sesiones cortas, a
  veces desde el celular. Un paso de compilación es una cosa más que se
  rompe, y una IA que no sabe que no hay compilación propone React por
  defecto (ver `prompts/ia-diseno.md`).
- **El costo:** un `<script>` nuevo se agrega a mano en cada pantalla que
  lo usa. Se paga con disciplina (la lista de abajo) y con un chequeo
  automático (`refs.py`, más abajo).
- **Datos:** Supabase (Postgres + autenticación + archivos).
- **Publicación:** Vercel, conectado al repositorio. Cada `git push` a
  `main` se publica solo en un minuto.

---

## Las carpetas

Cada pantalla es una carpeta con su `index.html`. **La carpeta es la
dirección** (`/agenda/`), y una vez que circula en Instagram no se
renombra nunca, aunque la sección cambie de nombre: es lo que la gente
tiene guardado.

```
index.html               el inicio
agenda/ tramites/ mi/ …  una carpeta por pantalla
panel/                   donde el equipo carga todo
css/
  tokens.css             colores, letra, espacios, radios, sombras, modo oscuro
  base/01..12-*.css      lo compartido, partido en doce componentes
  pantallas/*.css        lo de una sola pantalla
app.js                   lo compartido por todas las pantallas
config.js                URL y clave pública de Supabase
iconos.js                los íconos SVG (cambia <span data-ico> por el dibujo)
lib/
  datos.js               el cliente chico de Supabase (6 KB)
  supabase.js            la librería oficial, congelada en una versión (212 KB)
sql/
  tabla-*.sql            una tabla con sus permisos por archivo
  contenido-*.sql        contenido para cargar
sw.js                    el service worker
manifest.json            para instalar la app en el teléfono
sin-conexion.html        lo que se ve sin señal y sin copia guardada
docs/                    la historia: HISTORIAL-SW.md, PROPUESTAS.md, prompts/
BITACORA.md LEEME.md     largos; se buscan con grep, no se leen
CLAUDE.md                lo que Claude lee al empezar cada sesión
```

**Lección de la Bolívar:** el CSS empezó en un solo archivo y llegó a
162 KB antes de partirse. Partirlo después costó una sesión entera y
apareció un error de orden entre reglas. Acá se arranca partido.

---

## Los estilos

### El orden de carga

En **todas** las pantallas, siempre igual:

```
tokens.css → base/01 … base/12 → (la hoja de esa pantalla, si tiene)
```

La Bolívar tiene además `estilos-rediseno.css` al final, que pisa las
tarjetas: es un resto de un rediseño a medias y **no hay que repetirlo**.
Un rediseño se hace en las hojas que corresponden, no en una hoja que
manda sobre las demás.

### Los doce componentes de la base

Ningún archivo pasa de 420 líneas y el nombre dice qué hay adentro.
Conviene usar la misma partición desde el día uno:

| | |
|---|---|
| `01-cimientos` | reset, cuerpo, «saltar al contenido», el foco, el estado apretado, los títulos |
| `02-encabezado` | la marca, el menú lateral, el buscador, el índice del pie |
| `03-controles` | botones, campos, interruptores, chips |
| `04-tarjetas` | tarjetas y cómo se agrupan: listas, filas, grupos |
| `05-secciones` | secciones, pasos de un trámite, pestañas |
| `06-hoja` | la hoja que sube desde abajo |
| `07-avisos` | avisos, alertas, pantallas vacías, errores, esqueletos de carga |
| `08-calendario` | el calendario mensual |
| `09-avisanos` | el botón flotante de consultas y su chat |
| `10-lectura` | lo que comparten las pantallas de lectura: glosario, fichas, material |
| `11-navegacion` | la barra de secciones, el pie, los enlaces entre pantallas |
| `12-movimiento` | `@keyframes`, transiciones, «menos movimiento» |

**La regla del reparto:** una clase que usa más de una pantalla, o que
escribe `app.js`, va en la base. Baja a la hoja de una pantalla solo la
regla cuyas clases son **todas** de esa pantalla. Ninguna regla está en
dos hojas.

### El modo oscuro va por atributo, no por `@media`

Un script de cinco renglones en el `<head>` de cada pantalla pone
`data-tema="oscuro"` o `"claro"` en el `<html>`, leyendo la preferencia
guardada (`auto`, `claro`, `oscuro`) y, si es `auto`, la del teléfono.
`tokens.css` redefine los colores bajo `[data-tema="oscuro"]`.

- **Por qué atributo:** con `@media (prefers-color-scheme)` harían falta
  dos copias de los valores oscuros (una para el teléfono, otra para el
  botón) y a la primera que se toque una sola, dejan de coincidir.
- **Por qué en el `<head>`:** `app.js` carga al final del cuerpo; si el
  tema se resolviera ahí, la pantalla arrancaría clara y saltaría a
  oscura.
- **Tres opciones, no un interruptor:** con dos, apenas tocás una vez
  perdés para siempre «seguir al teléfono». El selector va en el menú,
  no en la cabecera.

Referencia: el bloque `EL TEMA, ANTES DE DIBUJAR NADA` en
`glosario/index.html` y `aplicarTema()` en `app.js`.

---

## El JavaScript

### `app.js`: lo compartido

Carga al final del `<body>` en todas las pantallas. Tiene, en este
orden aproximado (los nombres son los de la Bolívar, para buscarlos):

| Qué | Función o constante |
|---|---|
| La raíz relativa de cada pantalla | `RAIZ` (cada pantalla pone `window.RAIZ = '../'`) |
| «Menos movimiento» | `menosMovimiento()` |
| Cuando no arranca, decirlo | `avisarQueNoArranca(motivo)` |
| El registro (visitas, búsquedas, errores, hitos) | `anotar()`, `anotarHito()`, `deDondeVino()` |
| Escapar texto antes de meterlo en HTML | `esc()`, `urlSegura()` |
| Fechas en castellano | `MESES`, `fechaLinda()`, `rangoLindo()`, `hoyISO()` |
| Buscar sin tildes ni mayúsculas | `normalizar()` |
| La sesión y el rol | `sesionActual()`, `esDelEquipo()` |
| La carrera elegida, para toda la app | `CARRERAS_APP`, `carreraActual()` |
| Las secciones y la cabecera | `SECCIONES`, `htmlCabecera()`, `pintarNav()` |
| El índice del pie | `INDICE_PIE` |
| El tema | `TEMAS`, `aplicarTema()` |
| Errores que se entienden | `explicarError()` |
| Ninguna consulta espera para siempre | `conPaciencia(promesa, segundos)` (corta a los 12 s) |
| Lo guardado entre visitas | `memoriaDe(pantalla)`, `GUARDADO_VIDA` |
| Registrar el service worker | al final, `navigator.serviceWorker.register` |

**El nombre de cada sección se cambia en cuatro lugares a la vez:**
`SECCIONES` en `app.js`, el `<title>`, el `og:title` y el `<h1>` de la
pantalla. Si tocás «FECHAS» no podés aterrizar en una pantalla que se
llama «Agenda».

**Cuando crezca, se parte en `lib/`.** En la Bolívar `app.js` llegó a
114 KB y se sacaron a `lib/` las piezas que usan una o dos pantallas
(`fecha-al-calendario.js`, `tarjeta-avisos.js`, `voy.js`). La regla:
lo que usan todas va en `app.js`; lo que usan algunas, en `lib/`, y se
carga solo donde hace falta.

### Dos clientes de datos

| Archivo | Peso | Qué sabe | Quién lo carga |
|---|---|---|---|
| `lib/datos.js` | ~6 KB | `select`, `eq`, `or`, `order`, `limit`, `maybeSingle`, `insert`, `rpc` | Las pantallas que **solo leen** lo publicado |
| `lib/supabase.js` | ~212 KB | todo: sesión, renovar el token, subir archivos | Las que tienen cuenta: perfil, panel, y las que guardan cosas de quien entró |

- Del otro lado no hay nada raro: Supabase es PostgREST, una API HTTP.
  Leer una tabla es pedir una URL con `fetch`. El cliente chico hace eso,
  **con la misma forma de llamarlo** (`db.from('t').select('*')`), así
  que cambiar de uno a otro es cambiar el `<script>` y nada más.
- **El chico no renueva la sesión.** El token dura una hora; una sesión
  que no se renueva falla en silencio. Por eso todo lo que necesita
  cuenta usa la grande.
- **Cualquier método que el chico no sepa tira un error con nombre**, en
  vez de devolver `undefined` y romper tres pasos después.
- **La librería grande va en el repositorio, con la versión congelada.**
  En la Bolívar se bajaba de un CDN con `@2` (versión flotante): si el
  CDN fallaba (red de la facultad, bloqueador) la app quedaba en
  «Cargando…» para siempre, y una actualización de Supabase podía
  romperla sin que nadie tocara nada.

**Se trae casi entero** de `lib/datos.js` de la Bolívar.

### Las piezas chicas

`config.js` (URL y clave **publicable** de Supabase, que es pública a
propósito y va en el repositorio; la secreta no va en ningún archivo),
`iconos.js` (`<span data-ico="nombre">emoji</span>` se cambia por el
SVG; si no existe, queda el emoji), `movimiento.js`, `lectura.js`. Cada
una hace una sola cosa.

---

## El service worker

`sw.js` hace dos cosas: que la segunda visita abra al instante sin
gastar datos, y que Chrome ofrezca instalar la app.

**Tres reglas, cada una con su error detrás:**

1. **Los datos de Supabase nunca se guardan.** Una fecha vieja servida
   como si fuera de hoy hace que alguien se pierda una mesa.
2. **El armazón (CSS de la base, `app.js`, piezas chicas, íconos) se
   sirve de lo guardado primero.** Por eso **cada vez que cambia el
   contenido de algo del armazón hay que subir `VERSION`** y anotarlo en
   `docs/HISTORIAL-SW.md` (número, fecha, porqué). Si no, el teléfono que
   ya tiene la app recibe el HTML nuevo con el CSS viejo. En la Bolívar
   esto rompió una pantalla en producción («`memoriaDe` is not defined»:
   HTML nuevo, `app.js` viejo) y desde entonces la app recarga una vez
   cuando entra una versión nueva.
3. **Las pantallas van primero por la red**, con un tope de 6 segundos
   (con señal débil el `fetch` se cuelga minutos sin fallar). Si no
   llega, la última copia; si no hay copia, `sin-conexion.html`. **Solo
   se guarda una respuesta `ok`**: un 404 guardado pisa la buena.

En el armazón va solo lo que usa **cualquier** pantalla. La hoja o el
guion de una sola pantalla lo baja quien entre ahí y queda guardado por
la regla general.

Referencia: `sw.js` de la Bolívar, eventos `install`, `activate` y el
bloque `navigate` de `fetch`. Lo de compartir, videos, Leaflet y el
Arsenal es propio de la Bolívar y no se trae.

---

## Lo guardado entre visitas

Aparte del service worker, cada pantalla guarda en `localStorage` lo
último que trajo de Supabase y lo pinta mientras pide lo nuevo.

- **Va en la página, no en `sw.js`.** El service worker entrega la
  respuesta y la página no sabe si vino de la red o de la caja.
- **Nunca se pinta de memoria lo que lleva fecha** (alarmas, el
  calendario, «lo próximo»). Eso espera a la red.
- **Una semana de vida.** Más viejo se tira.
- **Nada que dependa de una sesión se guarda.** En una computadora de la
  facultad se lo lleva quien entra después.

---

## El registro: qué le pasa a la app

Una tabla `sucesos` con cuatro tipos: `visita`, `busqueda`, `error`,
`hito`. Se mira desde el panel.

- **No hay columna de usuario ni de IP.** Del aparato queda un balde
  grueso (`iphone`, `android`, `escritorio`). Se borra solo a los 90
  días. No se puede reconstruir el recorrido de nadie, a propósito.
- **Lo que la gente busca** es la lista de lo que falta cargar, escrita
  por los estudiantes con sus palabras.
- **Hitos** (eligió carrera, marcó materia, instaló, volvió instalada):
  uno por visita y por nombre. Se cuenta cada uno por separado y se
  divide: la proporción es la métrica.
- **De dónde vino:** los links de Instagram llevan `?de=historia-x`, y
  eso viaja en el detalle de la visita.
- **`anotar()` no usa `db`**: va con `fetch` pelado, para poder anotar
  justamente el error de que el cliente de datos no cargó. Todo adentro
  de `try/catch`, sin esperar respuesta. Como es una puerta que escribe
  sin cuenta, la tabla tiene freno de caudal (ver `02-datos-y-permisos.md`).
- **Las pruebas no cuentan:** `esPrueba()` descarta localhost y archivos
  abiertos a mano. Es una lista de lo que NO cuenta, no de lo que sí: al
  revés, el día que la app se mude de dominio el registro se apaga solo.

---

## Errores que dicen algo

- Si el JavaScript no corre, la pantalla dice «No se pudo abrir la app»,
  el motivo y un botón para reintentar. Nunca «Cargando…» para siempre.
- `explicarError()` distingue sin señal, sesión vencida, servidor caído
  y lo demás, y dice qué hacer. El detalle técnico va en chiquito solo
  cuando no lo reconoce: dentro del navegador de Instagram no hay
  consola, y la captura es lo único que llega.
- Los errores de Supabase vienen en inglés y se traducen. Si aparece uno
  en inglés en pantalla, es nuevo y se agrega.

---

## Los chequeos automáticos

En la Bolívar viven en `pruebas-avisos/`, que **no está en el
repositorio** (quedó en la computadora de quien la hace). O se copian a
mano al proyecto nuevo, o Claude los escribe de cero con esta
descripción, que alcanza:

- **`refs.py`**: revisa que todo lo que nombra el armazón de `sw.js`
  exista. Después de tocar la lista.
- **`orden-css.py`**: busca dos reglas que pesan igual, le pegan al mismo
  elemento y están en hojas distintas. Entre iguales decide el orden de
  carga. Así se encontró el único error real al partir el CSS.
- **Una variable de CSS está bien si el navegador la resuelve, no si
  está escrita.** Un comentario mal cerrado dejó `--letra-mini` sin
  existir un día entero. Se detecta midiendo:
  `getComputedStyle` sobre un elemento con `font-size: var(--letra-mini)`.
