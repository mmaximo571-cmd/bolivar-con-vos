# Prompt para abrir una sesión de código (17/9 en adelante)

Para pegar al empezar cada sesión, cambiando solo la línea TAREA. Existe
para gastar pocos tokens: le dice a Claude qué no leer.

---

```
TAREA: <una sola, del cronograma de BITACORA.md; ej. «Aviso en Mi año, parte 1»>
MATERIAL: <pegado abajo, o «ninguno»>

Reglas de esta sesión:
- No leas BITACORA.md ni LEEME.md enteros: `grep -n` por la TAREA y leé solo ese tramo.
- Antes de abrir un archivo grande, `graphify query "<pregunta>"`; después abrí solo el tramo que indique.
- No abras enteros estilos.css, index.html, app.js ni panel/index.html.
- Mirá primero si la app ya tiene el dato o la pieza; reusá clases existentes.
- Si la tarea es sobre todo redacción, no la escribas: dame el prompt para NotebookLM/Gemini y el formato en que lo querés de vuelta.
- Módulo nuevo: primero hasta 3 preguntas cortas. Arreglo: directo.
- Una tarea, un commit. Probalo corriendo (servidor local y 375 px), `graphify update .`, anotá una línea en el cronograma y pusheá a main.
- Respuesta final: qué quedó, qué probaste y qué falta. Nada más.
```

---

## Las tareas de hoy, jueves 17 (congelamiento a la noche)

| # | TAREA | MATERIAL que hace falta |
|---|---|---|
| 1 | ✅ Fonoteca: generador de tonos | — |
| 2 | Aviso en Mi año, parte 1 | los plazos de regularidad (años y turnos) |
| 3 | Aviso en Mi año, parte 2 | — |
| 4 | Fichas: la tanda que tenga textos listos | textos de NotebookLM con `PROMPT-FICHAS.md` |
| 5 | Colchón: el error que aparezca | — |
| 6 | Congelamiento: `v` del service worker, `graphify update .`, bitácora al día | — |

Sin plazos, la 2 y la 3 salen del 21; sin textos, sale la 4. **No se
reemplazan con otra cosa: se usan de colchón.**
