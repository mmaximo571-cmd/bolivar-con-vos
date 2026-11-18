# Los prompts

Cada archivo tiene un bloque para copiar y pegar al empezar la sesión.
Lo que está fuera del bloque es para quien dirige: qué preparar antes y
qué mirar después.

| Archivo | Para quién | Cuándo |
|---|---|---|
| `P00-arranque.md` … `P13-lanzamiento.md` | Claude Code | Una sesión cada uno, en orden (ver `../05-plan-de-sesiones.md`) |
| `P20-pantalla-nueva.md` | Claude Code | Cada pantalla después del lanzamiento |
| `P30-avisos.md` | Claude Code | Los avisos al celular, al final |
| `sesion.md` | Claude Code | Cualquier otra tarea suelta |
| `plantilla-pantalla.md` | Claude Code | Lo citan los demás: el esqueleto de una pantalla |
| `ia-estetica.md` | Gemini, Claude o la IA de diseño que se use | Antes de la sesión 1, con las placas |
| `ia-diseno.md` | Claude Design, Gemini, etc. | Antes de pedir el diseño de cualquier pantalla |
| `ia-curaduria.md` | Gemini o Claude (chat) | Para elegir y ordenar: qué pantallas, qué trámites primero |
| `ia-contenido.md` | NotebookLM | Para sacar trámites, preguntas y glosario de los PDF oficiales |

**Los prompts de Claude Code son cortos a propósito.** Las reglas
comunes están en `CLAUDE.md` del proyecto, que Claude lee solo al
empezar; el prompt dice nada más lo propio de la sesión.

**Donde dice «la referencia»** es el repositorio
`mmaximo571-cmd/bolivar-con-vos`. En una sesión en la nube se agrega a
la sesión en modo lectura; en una computadora, se clona al lado.
