# La Bolívar con vos

App de la Agrupación Simón Bolívar (Conducción del CEFTS) para estudiantes de la
Facultad de Trabajo Social, UNLP.

---

## Qué hace

| Pantalla | Archivo | Para qué |
|---|---|---|
| Inicio | `index.html` | Apertura, bienvenida, tarjeta de carrera, recuadros, buscador |
| Trámites | `tramites/index.html` | Guía paso a paso + preguntas frecuentes |
| Cursadas | `carrera/index.html` | Organizador de cursadas según el plan de estudios |
| Agenda | `agenda/index.html` | Fechas, comunicados y actividades. Se actualiza sola |
| Mi cuenta | `mi/index.html` | Cuenta **opcional** del estudiante, para guardar trámites |
| Quiénes somos | `quienes/index.html` | La agrupación y quién impulsa la app |
| Panel | `panel/index.html` | Donde el equipo carga y edita todo |

**La app se usa entera sin registrarse.** La cuenta solo sirve para guardar trámites.

---

## Lo primero que ve el estudiante

Al abrir `index.html` pasan tres cosas, en este orden:

1. **La apertura: el logo animado de la Agrupación.** Sobre el amarillo de la
   marca se dibuja el contorno de Sudamérica de norte a sur, después entran
   SIMÓN y BOLÍVAR barriendo de izquierda a derecha, un destello cruza el logo
   y todo se disuelve. Se ve **una vez por visita**: si entrás a Trámites y
   volvés, no se repite. Se puede saltear tocando la pantalla, y quien tenga
   activado «reducir movimiento» en su teléfono ve el logo ya armado, sin
   animación.
2. **La bienvenida.** Solo la **primerísima vez**, nunca más. Dos botones:
   **Entrar** (pasa directo, sin registrarse) y **Ya tengo cuenta** (va al login).
   Los dos marcan la bienvenida como vista.
3. **El inicio.** En este orden:
   - **La cabecera**, en tres partes: el botón de menú a la izquierda, la marca
     centrada, y Mi cuenta a la derecha.
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
   en la Agenda, pero acá tapaba lo importante. De 46 fechas cargadas, al
   calendario entran 14.

   Para sumar o sacar una familia de fechas se toca **una sola lista**,
   `QUE_VA_AL_CALENDARIO`, arriba del calendario en `index.html`.
   - **Los nueve accesos**, en una grilla de 3x3: el organizador de cursadas
     primero, en amarillo, y después las categorías que tengan contenido.
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
peso **Bold**, licencia MIT.

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
| `publicaciones` | Agenda y novedades |
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

Se llega desde el **menú ☰** y desde el enlace del **pie de página**, en todas
las pantallas. No está en la fila de secciones de arriba a propósito: esa fila
ya tiene cinco y se desliza en el celular, y esto se consulta una vez, no todos
los días.

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
