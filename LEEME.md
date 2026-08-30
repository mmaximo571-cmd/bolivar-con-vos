# La Bolívar con vos

App de la Agrupación Simón Bolívar (Conducción del CEFTS) para estudiantes de la
Facultad de Trabajo Social, UNLP.

---

## Qué hace

| Pantalla | Archivo | Para qué |
|---|---|---|
| Inicio | `index.html` | Apertura, bienvenida, tarjeta de carrera, recuadros, buscador |
| Info útil | `tramites/index.html` | Guía paso a paso + preguntas frecuentes |
| Mi año | `carrera/index.html` | Organizador de cursadas según el plan de estudios |
| Estudiemos | `estudiemos/index.html` | Material de los grupos de estudio, agrupado por materia |
| Fechas | `agenda/index.html` | Fechas, comunicados y actividades. Se actualiza sola |
| Perfil | `mi/index.html` | Cuenta **opcional** del estudiante, para guardar trámites |
| ¿Quiénes somos? | `quienes/index.html` | La agrupación y quién impulsa la app |
| Panel | `panel/index.html` | Donde el equipo carga y edita todo |

Las siete primeras son las **secciones** que se ven en la fila de arriba, en ese
orden. El nombre de la sección, el título de la pantalla y el título de la
pestaña dicen lo mismo a propósito: si tocás «FECHAS» no podés aterrizar en una
pantalla que se llama «Agenda». Si alguna vez se le cambia el nombre a una
sección, hay que cambiarlo en cuatro lugares: `SECCIONES` en `app.js`, el
`<title>`, el `og:title` y el `<h1>` de esa pantalla.

Las carpetas siguen llamándose `tramites/`, `carrera/`, `agenda/` y `mi/` aunque
las secciones se llamen distinto. **No se renombran**: son las direcciones que la
gente ya tiene guardadas y las que están pegadas en Instagram.

**La app se usa entera sin registrarse.** La cuenta solo sirve para guardar trámites.

---

## La estética: serigrafía

La app tiene que parecerse a las placas del Instagram de la agrupación
([@simonbolivarfts](https://www.instagram.com/SimonBolivarfts), 4.213
seguidores), que es por donde la mayoría de la gente los conoce. Ese lenguaje
es: **fondo amarillo, tipografía de afiche enorme, borde de tinta a la vista,
fotos tratadas a dos tintas, y el rojo como acento chico**.

Cuatro decisiones salen de ahí, y las cuatro viven en el panel de control
estético de `estilos.css`:

| Qué | Variable | Por qué |
|---|---|---|
| Papel, no plástico | `--superficie: #FDFCF7` | Un blanco puro sobre amarillo cálido no son el mismo material: la tarjeta parecía pegada encima |
| La segunda tinta corrida | `--sombra: 2px 2px 0 #1A1A1A` | Una sombra difusa dice «esto flota». Las placas no flotan: están impresas |
| Borde de tinta | `--tinta-borde` | Una sola regla, la de «LOS OBJETOS IMPRESOS». **No** se cambia `--borde`: esa variable también pinta el riel de la barra de progreso y el fondo de las pastillas |
| Tipografía de afiche | `--fuente-titulo: Archivo Black` | De Omnibus-Type, taller de Buenos Aires. Pesa como los títulos de las placas |

**El desplazamiento va en negro, no en celeste.** En las placas el celeste no
aparece nunca: el par es amarillo y negro. Adentro de la app el celeste se
queda como el color de lo que se toca, que es otro trabajo.

**Archivo Black tiene un solo grosor.** Donde se use `--fuente-titulo` va
`font-weight:400`, nunca 700 ni 800: si se le pide más, el navegador lo engorda
a la fuerza y queda sucio. Por eso los subtítulos y los botones siguen en
Montserrat, que sí tiene varios grosores.

**`--fuente-datos` (Roboto Mono) es para datos, no para prosa**: números del
calendario, códigos de materia, cantidades. Lo que se lee de un vistazo y se
compara entre sí.

### Una casilla por materia

En la portada, «Mi cursada» dibuja **una casilla por materia** en vez de una
barra de progreso. Una barra continua dice que el progreso fluye; no fluye, se
mueve de a saltos, y cada salto costó un cuatrimestre.

Las casillas muestran **cuántas, no cuáles**: van agrupadas por estado, no en
el orden del plan. Los tres estados se separan por relleno —lleno, mitad,
rayado— y **todas van en tinta sobre el amarillo**: sobre el amarillo pleno el
celeste cae a 2,8 y una casilla celeste no se distinguiría de una vacía.

El organizador guarda en `bolivar-carrera-resumen` las cuentas de aprobadas,
cursadas y cursando. Si alguna vez se agrega un plan con muchas materias, la
grilla se estira a más columnas en vez de achicar las casillas.

---

## Reglas de diseño que ya están resueltas

No hace falta volver a discutirlas, pero sí respetarlas al agregar cosas nuevas.

**Nada de «REVISAR» ni «EJEMPLO» publicado.** Lo lee un estudiante, no el equipo.
Si un texto no está listo, se despublica la fila o se saca el bloque: es mejor
una pantalla que dice «esto todavía lo estamos escribiendo» que una llena de
notas nuestras. Para encontrar los que se hayan colado:

```sql
select 'tramites' t, id, titulo from public.tramites
 where publicado and (resumen ilike '%REVISAR%' or pasos::text ilike '%REVISAR%')
union all select 'faq', id, pregunta from public.faq
 where publicado and respuesta ilike '%REVISAR%'
union all select 'publicaciones', id, titulo from public.publicaciones
 where publicado and cuerpo ilike '%REVISAR%';
```

**No inventamos plazos ni reglas de la facultad.** Los campos «Cuándo» y «Dónde»
de un trámite están vacíos si nadie los confirmó, y la pantalla directamente no
los muestra. Un dato inventado es peor que un dato ausente: la persona se lo
cree y se pierde la inscripción.

**Todo lo que se toca mide 24 px como mínimo.** Los puntos del carrusel se ven de
8 px pero se tocan en 24, con un `::before`. Vale la pena copiar ese truco.

**Nada tapa el contenido.** El botón «Avisanos» es un círculo de 56 que se aparta
mientras se baja; el pie tiene 84 px de aire abajo para que nunca quede debajo.
El globo con la pregunta ya no sale solo: tapaba el calendario.

**Cada pantalla tiene un `h1` y sus títulos son títulos.** Los `.titulo-seccion`
se marcan solos desde `app.js`. Y el enlace «Saltar al contenido» es el primer
elemento de todas: sin él hay que pasar por diez cosas antes de llegar al
contenido, en cada pantalla.

**El contraste se mide, no se estima.** Las ocho pantallas están verificadas en
claro y en oscuro sobre el texto ya dibujado, no sobre el CSS.

---

## Cómo se sube a la web

**Antes se arrastraban las carpetas a la web de GitHub, a mano. Ya no.** La
carpeta es un repositorio de git conectado a
[mmaximo571-cmd/bolivar-con-vos](https://github.com/mmaximo571-cmd/bolivar-con-vos),
y Vercel publica solo cada vez que llega algo a la rama `main`.

Desde esta computadora, después de cambiar lo que sea:

```bash
git add -A && git commit -m "Que cambiaste, en una linea" && git push
```

Eso es todo: en un minuto está en `bolivar-con-vos.vercel.app`.

**Desde otro lado** —una tablet, otra computadora, Claude en la web— se trabaja
sobre el mismo repositorio de GitHub. Antes de ponerte a tocar acá, traé lo que
haya hecho el otro lado:

```bash
git pull
```

Si te olvidás del `git pull` y los dos tocan el mismo archivo, git avisa y no
pisa nada; hay que resolverlo a mano. Por eso conviene que no trabajen los dos
lados al mismo tiempo sobre lo mismo.

**Lo que git no sube, porque no vive en los archivos:** las tablas y el
contenido de Supabase, y la configuración de Authentication. Eso se toca en
supabase.com y no tiene nada que ver con esto.

---

## Lo primero que ve el estudiante

Al abrir `index.html` pasan tres cosas, en este orden:

1. **La apertura: el logo animado de la Agrupación.** Sobre el amarillo de la
   marca se dibuja el contorno de Sudamérica de norte a sur, después entran
   SIMÓN y BOLÍVAR barriendo de izquierda a derecha, un destello cruza el logo
   y todo se disuelve. Se ve **una vez por visita**: si entrás a Info útil y
   volvés, no se repite. Se puede saltear tocando la pantalla, y quien tenga
   activado «reducir movimiento» en su teléfono ve el logo ya armado, sin
   animación.
2. **La bienvenida.** Solo la **primerísima vez**, nunca más. Dos botones:
   **Entrar** (pasa directo, sin registrarse) y **Ya tengo cuenta** (va al login).
   Los dos marcan la bienvenida como vista.
3. **El inicio.** En este orden:
   - **La cabecera**, en tres partes: el botón de menú a la izquierda, la marca
     centrada, y el perfil a la derecha.
   - **Las secciones**, en una fila debajo de la cabecera.
   - **El buscador.**
   - **La portada**: las ilustraciones de la facultad, que se van deslizando
     solas cada 5 segundos.
   - **El calendario cuadrado** de lo que se viene. Cada día marcado lleva una
     **barrita de color** abajo del número, y cuando varios días seguidos son de
     lo mismo la barra se estira y se lee como una franja. Debajo hay una
     **leyenda** que dice con todas las letras qué cae ese mes y en qué fechas.
     Tocás un día y aparece la publicación completa. Se cambia de mes con las
     flechas.

   **En el calendario del inicio no va todo lo de la agenda.** Van solo las
   **mesas de examen** (en rojo) y los **asuetos y recesos** (en celeste). El
   resto —desarrollo de seminarios, últimos plazos, inscripciones— sigue estando
   en Fechas, pero acá tapaba lo importante. De 46 fechas cargadas, al
   calendario entran 14.

   Para sumar o sacar una familia de fechas se toca **una sola lista**,
   `QUE_VA_AL_CALENDARIO`, arriba del calendario en `index.html`.
   - **Los nueve accesos**, en una grilla de 3x3: **Mi año** primero, en
     amarillo, **Estudiemos** segundo, y después las siete categorías que
     tengan contenido. Son nueve fijos para que la grilla cierre en 3x3: si
     alguna vez se suma otro acceso fijo, hay que bajar el `slice(0, 7)` de
     las categorías en la misma cuenta.
   - **Novedades.**

   Desde **«A dónde ir» hasta el piso**, la ilustración del patio va **por
   detrás** del contenido, apoyada abajo, como si la app estuviera parada sobre
   la facultad. Está al 28% para que el texto siga leyéndose encima.

### La navegación se mudó arriba

Antes había una barra fija abajo de la pantalla. Ahora las secciones están arriba,
debajo de la cabecera, y **el botón ☰ abre un menú lateral** con lo mismo.

El cambio se hizo en un solo lugar: `pintarNav()` en `app.js`. Todas las pantallas
lo heredan sin tocarles nada. De paso se recuperaron los 64 px que la barra de
abajo comía en cada vista.

### El logo de la agrupación

Está armado con **las mismas tres capas de la animación de apertura** —el mapa,
SIMÓN y BOLÍVAR— recortadas y pintadas. No hay un archivo de logo aparte: si
alguna vez cambia, se cambian esas tres capas de `marca/` y se vuelven a generar
las piezas.

Va en **tres versiones, según el fondo**:

| Dónde | Color | Contraste |
|---|---|---|
| Ícono de la app | Rojo sobre blanco | 6,4 |
| Cabecera | Amarillo, sobre el negro | 13,8 |
| Imagen de compartir | Amarillo, sobre el negro | 13,8 |

El amarillo **nunca** va sobre fondo claro: ahí da 1,3 y no se ve.

Las piezas están en `imagenes/`:

- `icono-96.png` — la pestaña del navegador y los resultados de Google
- `icono-192.png` y `icono-512.png` — la pantalla de inicio en Android
- `icono-apple.png` — la pantalla de inicio en iPhone
- `compartir.png` — lo que se ve al compartir el link por WhatsApp o Instagram
- `marca-roja.webp` — el logo de la portada

**`manifest.json`**, en la raíz, es lo que hace que la app se pueda agregar a la
pantalla de inicio del celular con su ícono propio. Sin ese archivo, Android le
pone uno genérico.

### Los íconos

Están en **`iconos.js`**, y son de [Phosphor Icons](https://phosphoricons.com),
peso **Bold**, licencia MIT. **Están los 19: no quedan emoji sueltos.** Si alguna
vez se agrega una categoría nueva en Supabase, hasta que se le cargue el ícono va
a mostrar su emoji, que es la red de seguridad de siempre.

Cuidado con dos cosas al agregar uno:

- **Fijate que no esté repetido.** «Estudiemos» arrancó con el mismo dibujo que
  «Mi año» porque los dos son *books*.
- **El ícono se pone en un solo lugar.** La lupa del buscador y los íconos de las
  categorías se dibujan cuando llega el contenido de Supabase, o sea después de
  que la pantalla ya existe. Por eso `app.js` los repasa con un observador y no
  una sola vez al arrancar.

**Los íconos no traen color propio.** Phosphor los copia con un color fijo
(`fill="#b52625"`); acá ese color se saca y se reemplaza por `currentColor`, así
el mismo dibujo sale **blanco sobre la cabecera negra** y **celeste sobre las
tarjetas blancas**. Si dejás el color fijo, el ícono se ve rojo en todos lados.

Para sumar uno: buscalo en phosphoricons.com en peso Bold, tocá **Copy SVG**, y
de todo lo que copiaste pegá en `iconos.js` **solo la parte que empieza con
`<path`**, sin el `<svg>` de afuera.

Mientras un ícono no esté cargado, **la app sigue mostrando el emoji de antes**.
Por eso se pueden ir reemplazando de a uno sin romper nada.

Los de las categorías se asignan por el **id de la categoría** en
`ICONO_DE_CATEGORIA`, no por el emoji, así que cambiar el emoji en la base no
afecta al ícono.

### Las ilustraciones

Están en `imagenes/`, en formato **WebP con transparencia**. Salieron de dos
diseños de Canva: cada uno traía la foto y su máscara por separado, así que hubo
que combinarlas para que el cielo quedara transparente.

Pesan 308 KB las dos. En PNG pesaban 2,4 MB: por eso van en WebP.

Lo que se guarda para todo esto:

| Llave | Dónde | Para qué |
|---|---|---|
| `bolivar-apertura-vista` | sesión | Que la animación no se repita al navegar |
| `bolivar-bienvenida-vista` | teléfono | Que la bienvenida se vea una sola vez |
| `bolivar-carrera-resumen` | teléfono | La tarjeta grande del inicio |

### Cómo tocar el logo animado

El dibujo son **tres PNG apilados** en `marca/`: `map.png` (el contorno),
`simon.png` y `bolivar.png`. Vienen del proyecto de Claude Design «Animación
logo Simón Bolívar». Las tres miden 1080×1350 y la tinta ocupa 805×664 en el
centro; por eso el tamaño en pantalla se calcula contra esas medidas y no
contra el lienzo entero.

**Para cambiar cuánto dura, tocá una sola línea** en `index.html`:

```js
const DURACION_APERTURA = 2.6;   // segundos que dura en la app
```

En el diseño original la animación dura 8,8 segundos y va en loop, porque está
pensada como pieza de video. Acá se reproduce una sola vez y comprimida. El
reloj interno igual cuenta en los 8,8 segundos originales y lo único que cambia
es a qué velocidad avanza, así que la coreografía queda idéntica: subir o bajar
ese número estira o encoge todo por igual, sin desacomodar nada.

El amarillo de la apertura (`--amarillo-marca`, `#F9E830`) es el del dibujo y
**no es el mismo** que el amarillo de la app (`--amarillo`, `#FFD600`). Están
separados a propósito: el del logo viene dado por el arte.

---

## Los archivos

```
config.js            ← dirección y clave pública de Supabase
estilos.css          ← PANEL DE CONTROL ESTETICO: colores y tipografías, todo arriba
app.js               ← funciones compartidas (cabecera, barra de abajo, fechas)
favicon.svg          ← ícono de la pestaña
index.html
tramites/index.html
carrera/index.html   ← organizador de cursadas
carrera/plan.js      ← PLAN: Licenciatura en Trabajo Social
carrera/plan-tgcr.js ← PLAN: Tecnicatura en Gestión Comunitaria del Riesgo
carrera/plan-fono.js ← PLAN: Licenciatura en Fonoaudiología
agenda/index.html
mi/index.html
panel/index.html
LEEME.md             ← este archivo
```

**Para cambiar un color de toda la app:** abrí `estilos.css` y tocá una sola línea
en el bloque `PANEL DE CONTROL ESTETICO` de arriba de todo.

### La pantalla de Info útil (`tramites/`)

Las fichas van **agrupadas por categoría y en cuadrados**: 3 por fila en el
celular, 4 desde 560 píxeles. Al tocar uno se abre la ficha en una ventanita,
sin salir de la pantalla ni perder dónde estabas.

Cada cuadrado dice abajo si adentro hay **«Paso a paso»** o si te manda a un
**«Sitio oficial»**. Eso importa: de 31 fichas, 12 explican el trámite y 19 son
un enlace afuera, y antes no había forma de saberlo sin entrar.

Antes esto era una tira de 34 tarjetas sin un solo encabezado. Ahora tiene ocho
grupos con su cuenta al lado.

En el celular los cuadrados son un poco más altos que anchos, a propósito: con
109 píxeles de lado, títulos como «Plan de estudios: Licenciatura en Trabajo
Social» se cortaban en el mismo punto y tres fichas distintas quedaban
idénticas.

### La alarma de inscripción

Es lo más útil que hace la app, y sale de un dato que ya estaba cargado: **la
ventana para anotarse a una mesa dura exactamente 4 días**, nueve veces al año,
y la mesa es 4 a 6 días después. Perderse esos 4 días es perder la mesa y
esperar un mes.

Por eso aparece **arriba de todo, sola**, desde 5 días antes de que abra hasta
que cierra. El resto del año no ocupa lugar. Los últimos dos días se pone roja.

No hay nada que cargar: sale de las publicaciones que dicen «Inscripción a la
mesa de…» en la agenda.

### El modo oscuro

Se activa **solo**, según cómo tenga configurado el teléfono cada persona. No
hay botón: si el celular está en oscuro, la app también.

Para que funcione, en el CSS hay que usar **siempre las variables de superficie**
(`--fondo`, `--superficie`, `--texto`, `--texto-suave`, `--linea`) y nunca
`--blanco` o `--negro` para texto. Las que no se dan vuelta son a propósito:

- `--sobre-color` — texto oscuro cuando el fondo es amarillo o celeste
- `--sobre-negro` — texto claro cuando el fondo es la banda negra
- `--rojo-solido` — el rojo como **fondo**. El `--rojo` normal se aclara de
  noche para leerse como texto, pero aclarado no sirve de fondo: el blanco
  encima cae a 3,2.

Medido en las siete pantallas, **en los dos modos: cero fallos de contraste**.

### Los esqueletos de carga

Donde antes decía «Cargando…» ahora hay bloques grises con la forma de lo que va
a aparecer. No es sólo estético: un cartel obliga a esperar sin saber qué viene,
y ver la forma hace sentir la espera más corta aunque dure lo mismo.

**La regla al agregar uno: tiene que tener la misma forma que el contenido
real.** Si no, cuando llega el contenido la pantalla salta.

### El botón «Avisanos»

Fijo abajo a la derecha, en todas las pantallas. Al pasar por encima muestra
«¿Problemas con una materia o docente?». En el celular, donde no existe el pasar
por encima, el globo sale solo a los 2,5 segundos, una vez por visita.

**A dónde lleva se cambia en una línea**, `AVISANOS_URL` en `app.js`. Hoy va a
«Quiénes somos», donde están los contactos. Cuando tengan un formulario o un
Instagram definido, se apunta ahí.

### Los colores y las dos tipografías

Lo que hace que la paleta funcione no son los colores sueltos, sino **en qué
proporción se reparten**:

| | | Para qué | Cuánta pantalla |
|---|---|---|---|
| Amarillo suave | `#FDF9C5` | El fondo de toda la app | ~55% |
| Blanco | `#FFFFFF` | Las tarjetas | ~31% |
| Negro | `#1A1A1A` | El texto y la banda de arriba | ~10% |
| **Amarillo pleno** | `#F9E830` | **Acento**: logo, chip elegido, tarjeta de marca | **~4%** |
| Celeste | `#0195B1` | **La estructura**: bordes, barras, íconos, foco | detalles |
| Rojo | `#B52625` | **Las palabras resaltadas** | detalles |

Tipografía: **Montserrat** para títulos y botones, **Roboto** para el cuerpo.

**El amarillo suave es el mismo amarillo de marca rebajado al 28% sobre blanco.**
Sigue leyéndose amarillo pero no cansa. El amarillo pleno aparece poco y por eso
pega fuerte cuando aparece.

**La banda negra de arriba es el ancla.** Le da un techo a la página y es donde el
amarillo trabaja mejor: sobre negro llega a 13,8 de contraste. Sin ella, todo
flota en la misma luminosidad y la página se siente sin arriba ni abajo.

**El celeste sostiene la estructura.** Es el único tono medio de la paleta, así que
es el que une lo muy claro con lo muy oscuro. Si lo sacás, los otros colores se
pelean.

Dos reglas que no se pueden romper:

- **El celeste no va sobre el amarillo pleno**: ahí cae a 2,8 y no se ve. Sobre el
  fondo suave llega a 3,3 y sobre blanco a 3,5.
- **Blanco sobre amarillo nunca**: da 1,3, es ilegible.

Medido pantalla por pantalla: las seis dan **cero textos por debajo del mínimo**.

---

## El organizador de cursadas

Es la única pantalla que **no usa Supabase**: el plan de estudios está escrito en
`carrera/plan.js` y viaja con la app, así que funciona sin internet y sin cuenta.
Lo que marca cada estudiante se guarda **solo en su teléfono** (`localStorage`),
no se sube a ningún lado y nadie del equipo lo ve.

**Para corregir el plan** (una correlativa, un nombre, una carga horaria) se toca
`carrera/plan.js` y nada más. Cada materia tiene:

| Campo | Qué es |
|---|---|
| `cod` | El código tal cual figura en el plan (`211 A`, `242`…) |
| `dictado` | `anual`, `1c`, `2c` o `libre` |
| `correl` | Los códigos de sus correlativas |
| `marcada` | `true` si en el plan aparece con asterisco (*) |

### Las tres pestañas

**Mi cursada** arranca con **«Cursando este año»**: las materias que marcaste como
«la estoy cursando ahora». Debajo sigue **«El año que viene»**, con lo que podés
promocionar, lo que podés cursar y lo que todavía está trabado.

**Mapa** es el plan de correlatividades de izquierda a derecha. **Plan completo**
es el listado año por año.

### El promedio

En las materias **aprobadas** aparece un campo para cargar la nota. **Es
opcional**: la app funciona igual sin ninguna, y el promedio solo se muestra si
hay al menos una cargada.

El promedio siempre aclara **con cuántas notas está hecho**: «8,17 de promedio,
con 3 notas cargadas de 12 materias aprobadas». Eso importa, porque un promedio
de 3 materias no significa lo mismo que uno de 25 y hay que poder verlo.

Se aceptan notas de 1 a 10. Si escribís cualquier otra cosa, la nota se descarta
en vez de romper la cuenta. Las notas se guardan **por carrera**, igual que los
estados, y solo en el teléfono.

La regla que aplica, tal como funciona la cursada:

- **Promocionar** una materia habilita a **promocionar** la que le sigue.
- **Aprobar solo la cursada** habilita a **cursar** la que le sigue, pero no a
  promocionarla: primero hay que rendir el final.

### Los tres planes cargados

| Carrera | Archivo | Variable | Materias |
|---|---|---|---|
| Licenciatura en Trabajo Social | `carrera/plan.js` | `PLAN_TS` | 31 |
| Tecnicatura en Gestión Comunitaria del Riesgo | `carrera/plan-tgcr.js` | `PLAN_TGCR` | 21 |
| Licenciatura en Fonoaudiología | `carrera/plan-fono.js` | `PLAN_FONO` | 42 |

Los tres tienen la misma forma, salvo dos diferencias que vienen de los planes
mismos y **no** son un descuido:

- **Trabajo Social y Gestión del Riesgo** traen **una sola** columna de
  correlativas, en el campo `correl`. Ahí vale la regla general de arriba.
- **Fonoaudiología** trae **dos** columnas —«CURSADA» y «FINAL / PROMOCIÓN»— así
  que sus materias usan `paraCursar` y `paraFinal` en lugar de `correl`.
- Los PDF de Gestión del Riesgo y de Fonoaudiología **no publican carga
  horaria**, así que esas materias no tienen el campo `horas`.

Arriba de la pantalla hay tres botones para elegir carrera. **Cada carrera guarda
lo suyo por separado** en el teléfono: marcar materias en una no toca a las otras,
y el botón «Empezar de nuevo» borra solo la que estás mirando.

Quien ya venía usando la app tenía sus materias de Trabajo Social guardadas en el
formato viejo. No se pierde nada: la primera vez que abre la pantalla nueva, eso
pasa solo a Trabajo Social.

### La pestaña «Mapa»

Muestra el plan de correlatividades **de izquierda a derecha**: una columna por
año, y una línea desde cada materia hasta las que te habilita.

Los colores son los mismos que en el resto del organizador:

- **Turquesa lleno** — ya la aprobaste.
- **Amarillo lleno** — aprobaste la cursada, te falta el final.
- **Borde turquesa** — la podés promocionar.
- **Borde amarillo** — la podés cursar, pero no promocionar.
- **Gris** — todavía no la podés cursar.

Las líneas se encienden solas: cuando una materia queda lista y gracias a eso se
te abre la siguiente, esa línea se pinta. **Turquesa si te habilita a
promocionar, amarillo si solo te habilita a cursar.** Ahí se ve de un vistazo lo
que dice el LEEME más arriba sobre la diferencia entre cursar y promocionar.

Tocando cualquier materia del mapa se abre la misma ficha de siempre. En el
celular el mapa se desliza hacia el costado; la página no se mueve.

Cuando una carrera no tiene algo, la sección desaparece en vez de quedar vacía:
Gestión del Riesgo no muestra el filtro «Anuales» porque no tiene materias
anuales, y ni ella ni Fonoaudiología muestran «Otros requisitos» ni la nota del
asterisco, porque son cosas del plan de Trabajo Social.

---

## Los dos candados de Supabase

Esto ya está resuelto, pero conviene entenderlo si algún día algo falla con un
error `42501 permission denied`:

- **GRANT** decide si un rol puede tocar una tabla.
- **RLS** decide qué filas puede ver o modificar.

Hay que abrir los dos. Si solo se escriben las políticas RLS, no funciona nada.

---

## Cómo funcionan los permisos

Acá hay una diferencia importante con la app del buffet.

En el buffet, "tener cuenta" = "ser del centro de estudiantes". Acá **no**:
cualquier estudiante puede crearse una cuenta. Por eso los permisos **no** se basan
en estar logueado, sino en la tabla `perfiles`, que tiene una columna `rol`:

- `estudiante` — es el rol que se asigna **solo** al registrarse. Puede leer lo
  publicado y guardar sus propios trámites. Nada más.
- `equipo` — se asigna **a mano** desde Supabase. Es el único que puede crear,
  editar y borrar contenido.

Está probado: una cuenta de estudiante que intenta editar o borrar un trámite
afecta **0 filas**, y si intenta cambiarse el rol a `equipo` recibe un error.

---

## Habilitar que los estudiantes puedan crearse una cuenta

La pantalla de **Perfil** ya tiene las dos solapas —«Ya tengo cuenta» y «Crear
una cuenta»— y la base ya está lista: un disparador (`al_crear_usuario`) le
arma el `perfiles` a cada persona que se registra, con `rol = 'estudiante'`.
No hay nada que programar.

**Lo único que falta son dos interruptores del tablero de Supabase**, que no se
tocan desde el código ni desde el SQL Editor:

1. supabase.com → proyecto **La Bolivar con vos** → **Authentication** →
   **Sign In / Providers** → **Email** → prenderlo (**Enable**) y **Save**.
   Mientras esté apagado no se puede ni crear cuenta ni entrar, ni siquiera las
   del equipo.
2. En esa misma pantalla, **«Confirm email»**:
   - **Apagado** → al crear la cuenta la persona queda adentro en el momento.
   - **Prendido** → le llega un correo y no entra hasta abrirlo. **Ojo con
     esto**: el correo que manda Supabase gratis tiene un tope de unos pocos
     por hora. Con una cuenta atrás de otra en una jornada de inscripción, el
     resto queda afuera hasta la hora siguiente.

**Nuestra recomendación es dejarlo apagado.** La cuenta acá no da acceso a nada
sensible: solo guarda qué trámites marcó cada quien, y el rol siempre arranca en
`estudiante`. El costo de una casilla trucha es cero; el de que veinte personas
no puedan entrar en el día de la inscripción, no.

La app está preparada para las dos formas: si «Confirm email» está prendido,
avisa «te mandamos un correo a tal dirección»; si está apagado, entra derecho.

Los errores de Supabase vienen en inglés y se traducen en `mi/index.html`. Los
que traen un número adentro («…after 41 seconds») se reconocen por lo que dicen,
no por una lista fija. Si alguna vez aparece un error en inglés en pantalla, es
uno nuevo: se agrega ahí.

---

## Dar de alta a alguien del equipo

1. Entrá a **supabase.com** → proyecto **La Bolivar con vos**.
2. Menú de la izquierda → **Authentication** → **Users** → botón **Add user** →
   **Create new user**.
3. Escribí el correo y una contraseña. **Marcá la casilla `Auto Confirm User`.**
4. Menú de la izquierda → **SQL Editor** → **New query**, pegá esto cambiando el
   correo, y apretá **Run**:

```sql
update public.perfiles set rol = 'equipo'
where id = (select id from auth.users where email = 'elcorreo@ejemplo.com');
```

5. Esa persona ya puede entrar a `/panel/`.

**Para sacarle el permiso a alguien:** el mismo SQL pero con `rol = 'estudiante'`.

---

## Las tablas

| Tabla | Qué guarda |
|---|---|
| `perfiles` | Quién es cada usuario y su rol (`estudiante` / `equipo`) |
| `categorias` | Los cuadraditos de la pantalla de inicio |
| `tramites` | Cada trámite, con sus pasos en la columna `pasos` |
| `faq` | Preguntas frecuentes |
| `publicaciones` | Fechas y novedades |
| `materiales` | El material de «Estudiemos», agrupado por materia |
| `guardados` | Qué trámite guardó cada estudiante (privado) |

---

## Cómo escribir el «¿Quiénes somos?»

**Esta pantalla no se edita desde el panel: se edita en el archivo.** Es la única
así, porque su texto cambia una vez por año y no valía la pena armarle una tabla.

Abrí `quienes/index.html`. Arriba de todo hay un bloque que dice **«ACÁ SE
ESCRIBE EL TEXTO DE ESTA PANTALLA»**. Todo lo que hay que tocar está ahí; el
resto del archivo dibuja lo que se escriba.

Cada bloque es un título y uno o más párrafos. Para sumar uno, copiá uno entero
y cambiale el texto. Para sacarlo, borralo: la pantalla se acomoda sola, sirve
con dos bloques o con diez.

**Todo lo que diga `REVISAR` es texto de ejemplo** y hay que reemplazarlo.

Los links de redes tienen una protección: **si el link no está cargado, en vez
del botón aparece un cartel apagado que dice que falta**. Así no se publica un
botón que no lleva a ningún lado. Cuando pegás un link de verdad, se convierte
en botón solo.

Se llega desde la **fila de secciones**, desde el **menú ☰** y desde el enlace
del **pie de página**, en todas las pantallas.

---

## Estudiemos: el material de los grupos de estudio

`estudiemos/index.html`. Es la única pantalla que **agrupa por materia** en vez
de por categoría, porque así es como lo busca una estudiante: primero piensa
«necesito algo de Epistemología», no «necesito un resumen».

**Antes de que funcione hay que correr `tabla-materiales.sql` una sola vez**, en
supabase.com → el proyecto → SQL Editor → New query → pegar todo → Run. Mientras
no se corra, la pantalla no se rompe: avisa que falta activarla. Se puede correr
más de una vez sin romper nada.

Después el material se carga desde el panel, en la solapa **📚 Estudiemos**. El
campo *materia* tiene la lista de las materias ya cargadas: **elegila de la
lista en vez de escribirla**, así no quedan «Trabajo Social I» y «Trabajo
social 1» como si fueran dos materias distintas.

Si una ficha todavía no tiene enlace —un grupo de estudio que se junta y no
tiene nada subido— la tarjeta se muestra igual, pero **no como botón**: no se
publica un botón que no lleva a ningún lado. Es la misma regla que en las redes
del «¿Quiénes somos?».

El SQL deja dos filas de EJEMPLO para que la pantalla no arranque vacía.
Cuando carguen material de verdad, se borran con:

```sql
delete from public.materiales where aporta = 'EJEMPLO';
```

## Si alguna vez la app queda en «Cargando…»

Ya pasó una vez y está arreglado, pero conviene saber por qué era.

La app usa una librería de Supabase de 208 KB. **Antes se bajaba en cada visita
de un servidor ajeno** (`cdn.jsdelivr.net`). Si esa descarga fallaba —red de la
facultad, bloqueador de publicidad, conexión mala— la primera línea de `app.js`
reventaba y **no corría nada más**: la pantalla quedaba en «Cargando…» para
siempre, sin decir qué había pasado.

Se arregló de tres formas:

1. **La librería vive ahora en `lib/supabase.js`**, adentro del proyecto. No se
   pide nada a servidores ajenos. De paso la versión quedó congelada en la
   2.112.4: antes decía `@2`, que es flotante, y una actualización de Supabase
   podía romper la app sola, sin que nadie tocara un archivo.
2. **Si falta algo, la app lo dice.** En vez de morir en silencio, muestra
   «No se pudo abrir la app» con el motivo y un botón para reintentar.
3. **Ninguna consulta espera para siempre.** A los 12 segundos se corta y avisa.
   Está en `conPaciencia()`, en `app.js`.

Para diagnosticar: si ves «Cargando…» y **nada más** —sin cabecera ni menú— es
que el JavaScript no corrió. Si ves la app entera pero una parte dice
«Cargando…», es la consulta.

## Avisos

- **El proyecto gratuito de Supabase se pausa** tras varios días sin actividad.
  Se reactiva desde el panel con **Restore project** y no se pierde nada.
- **El contenido cargado es de ejemplo.** Todo lo que dice `REVISAR` hay que
  reemplazarlo por información verificada con la facultad.
