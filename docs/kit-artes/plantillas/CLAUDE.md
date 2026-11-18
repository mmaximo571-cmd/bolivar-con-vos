# {{NOMBRE_APP}}

<!-- Plantilla. En la sesión 0 se copia a la raíz del repositorio nuevo
     y se reemplaza cada {{…}} con lo de docs/kit/00-ficha-del-proyecto.md.
     Lo que todavía no se sepa queda como FALTA:. -->

App de {{AGRUPACION}} para estudiantes de {{FACULTAD}}, {{UNIVERSIDAD}}.
HTML, CSS y JavaScript a mano, sin compilar nada: lo que está en el
repositorio es lo que corre. Los datos salen de Supabase. Se publica en
Vercel, en {{DOMINIO}}, con cada push a `main`.

Este proyecto repite el armado de La Bolívar con vos
(`mmaximo571-cmd/bolivar-con-vos`). El cómo y el porqué están en
`docs/kit/`: arquitectura en `01`, datos en `02`, diseño en `03`,
pantallas en `04`, el orden de trabajo en `05`.

## Reglas de cada sesión

- **Una sesión, una tarea, un commit.** La tarea la dice el prompt.
- **No leer enteros** `BITACORA.md`, `LEEME.md`, `app.js`,
  `panel/index.html` ni `index.html`. Se busca con Grep y se lee el
  tramo.
- **Antes de escribir algo, fijarse si ya existe** (en este repositorio
  o en el de referencia). Reusar clases y funciones.
- **El repositorio de referencia se lee por tramos** y se toma la idea,
  no el contenido. Nada de Trabajo Social, de la UNLP ni de la Bolívar
  puede terminar acá.
- **No se inventan datos de la facultad**: materias, correlativas,
  plazos, trámites, contactos. Si falta, se pregunta o se deja `FALTA:`
  sin publicar.
- **Si la tarea es sobre todo redacción**, no se escribe: se arma el
  prompt para NotebookLM o Gemini (`docs/kit/prompts/ia-contenido.md`).
- **Módulo nuevo: primero hasta tres preguntas cortas.** Arreglo:
  directo.

## Dónde está cada cosa

### Estilos

El orden de carga en cada pantalla es siempre
`css/tokens.css → css/base/01..12 → css/pantallas/<la suya>.css`
y no se cambia.

| Archivo | Qué tiene |
|---|---|
| `css/tokens.css` | colores, tipografías, escala de letra y espacio, radios, sombras, tiempos, modo oscuro. **Cualquier cambio de aspecto de toda la app empieza y termina acá** |
| `css/base/01..12-*.css` | lo que usan varias pantallas, en doce componentes (ver `docs/kit/01-arquitectura.md`) |
| `css/pantallas/*.css` | lo que usa **una sola** pantalla |

Una clase que usa más de una pantalla, o que escribe `app.js`, va en la
base. Ninguna regla está en dos hojas. Ningún color fuera de
`tokens.css`. Ningún tamaño de letra ni espacio fuera de la escala.

### JavaScript

- `app.js`: lo compartido por todas las pantallas.
- `lib/datos.js`: el cliente chico de Supabase, para las pantallas que
  solo leen. **No tiene sesión.** Preguntar `'auth' in db` antes de
  `db.auth`.
- `lib/supabase.js`: la librería oficial, congelada. Solo en las
  pantallas con cuenta (perfil, panel, y las que guardan cosas de quien
  entró).
- `config.js`: URL y clave **publicable** (pública a propósito). La
  secreta no va en ningún archivo.
- Un `<script>` nuevo se agrega a mano en cada pantalla que lo use, y al
  armazón de `sw.js` si lo usan todas.

### Lo demás

- `sql/tabla-*.sql`: una tabla con sus permisos por archivo. Toda tabla
  tiene archivo. Las pantallas avisan «falta correr
  `sql/tabla-x.sql`» cuando la tabla no está.
- `docs/HISTORIAL-SW.md`: por qué subió cada versión del service worker.
- `BITACORA.md`: el cronograma y lo hecho. Se busca con Grep.

## El service worker

`sw.js` sirve el armazón guardado antes que la red. **Cada vez que
cambia qué se guarda, o el contenido de algo que ya está en la lista
(`tokens.css`, la base, `app.js`, las piezas chicas), hay que subir
`VERSION`** y anotar número, fecha y porqué en `docs/HISTORIAL-SW.md`.
Las pantallas (`.html`) van por red primero y no lo necesitan.

Los datos de Supabase **nunca** se guardan en el service worker.

## Al escribir código

- Todo en castellano: funciones, clases, variables y comentarios.
  Comentarios que explican **por qué**, no qué.
- Textos de pantalla en castellano rioplatense, de vos, con el tono de
  la agrupación.
- Todo lo tocable: 48 px de alto mínimo, foco visible, `:active`.
- Cada pantalla: un `h1`, «Saltar al contenido» primero, estado vacío,
  esqueleto de carga y error legible.

## Antes de dar por terminada una sesión

1. Probado corriendo: servidor local, 375 px, claro y oscuro, consola
   sin errores. Si toca datos, también con la red cortada.
2. Si se tocó el armazón: `VERSION` y su línea en el historial.
3. Una línea en `BITACORA.md`, sección «Hecho y publicado».
4. Commit y push.
5. Respuesta final: qué quedó, qué se probó, qué falta.
