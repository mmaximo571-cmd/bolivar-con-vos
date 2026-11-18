# Una sesión suelta

Para pegar al empezar cualquier sesión que no tenga prompt propio,
cambiando solo TAREA y MATERIAL. Existe para gastar pocos tokens: le
dice a Claude qué no leer.

```
TAREA: <una sola, del cronograma de BITACORA.md>
MATERIAL: <pegado abajo, o «ninguno»>

Reglas de esta sesión:
- No leas BITACORA.md ni LEEME.md enteros: grep -n por la TAREA y leé
  solo ese tramo.
- No abras enteros app.js, index.html ni panel/index.html.
- Mirá primero si la app ya tiene el dato o la pieza; reusá clases y
  funciones.
- Si la tarea es sobre todo redacción, no la escribas: dame el prompt
  para NotebookLM o Gemini y el formato en que lo querés de vuelta.
- Módulo nuevo: primero hasta 3 preguntas cortas. Arreglo: directo.
- Una tarea, un commit. Probalo corriendo (servidor local y 375px),
  anotá una línea en la bitácora y pusheá.
- Respuesta final: qué quedó, qué probaste y qué falta. Nada más.
```
