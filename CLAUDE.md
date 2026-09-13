# La Bolívar con vos

## graphify: la bitácora del código

En `graphify-out/` hay un grafo de la app (código propio, pantallas y
documentos; sin librerías de terceros ni material de estudio, ver
`.graphifyignore`). Existe para **economizar tokens**: antes de abrir
archivos grandes (`app.js`, `index.html`, `carrera/index.html`,
`panel/index.html`, `LEEME.md`, `BITACORA.md`, `estilos.css`), preguntale
al grafo.

Reglas:
- Para preguntas sobre la app («dónde está…», «qué usa…», «qué pantalla
  lee tal tabla»), lo primero es `graphify query "<pregunta>"`. Para
  relaciones, `graphify path "<A>" "<B>"`; para un concepto,
  `graphify explain "<nombre>"`. Devuelven un recorte chico.
- `graphify-out/GRAPH_REPORT.md` solo para una mirada general de la
  arquitectura, no en cada sesión.
- Abrir el archivo fuente recién cuando haya que modificarlo o depurarlo,
  y solo la parte que indica `source_location`.
- Después de cambiar código, `graphify update .` (solo AST, no gasta
  tokens). Si cambian documentos o pantallas a fondo, `/graphify --update`.
  Ojo: `update` rebautiza los grupos con el nombre de su nodo central; a
  las consultas no les afecta, así que no hace falta re-etiquetarlos.
- El grafo sabe poco de lo que está al final de `BITACORA.md` y `LEEME.md`:
  si la pregunta es sobre una decisión vieja y el grafo no la trae, buscar
  con Grep en esos archivos, nunca leerlos enteros.

Si `graphify` no está en el PATH, el ejecutable está en
`C:\Users\Acer\.uv\tools\graphifyy\Scripts\graphify.exe`.
