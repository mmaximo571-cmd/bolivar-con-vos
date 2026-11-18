# Sesión 8 · Mi año

La pantalla más útil y la más cara en datos. **Sin los planes de
estudio oficiales con correlativas, esta sesión no se hace.**

## Antes

- Los PDF de los planes de estudio de cada carrera.
- Las respuestas de la ficha, sección 3: turnos de examen, regularidad,
  promoción, materias libres.

## El prompt

```
TAREA: Sesión 8. carrera/index.html (la sección se llama «Mi año»): el
plan de estudios de cada carrera, marcar materias, qué se puede cursar,
el promedio.

LEÉ PRIMERO:
- docs/kit/00-ficha-del-proyecto.md, sección 3
- docs/kit/04-pantallas.md, la fila de Mi año y el párrafo «El plan de
  estudios va en el código»

MIRÁ EN LA REFERENCIA, por tramos:
- carrera/plan.js: las primeras 40 líneas (el formato de una materia:
  cod, nombre, anio, dictado, horas, correl, marcada). El formato se
  trae; las materias no.
- carrera/index.html, con grep -n: cómo se calcula qué se puede cursar
  y el promedio. LEEME.md de la referencia: grep -n «El promedio» y
  «Las tres pestañas» y leé solo esas secciones.
- app.js: CARRERAS_APP, carreraActual, anotarCarreraApp, y
  guardarCopiaCursada / leerCopiaCursada.

HACÉ:
1. Un carrera/plan-<id>.js por carrera, transcripto de los PDF que te
   paso. Cada materia con su código tal cual figura. Lo que el PDF no
   deja claro, con un comentario REVISAR: y una nota visible al
   estudiante que diga qué no está confirmado. No adivines
   correlativas.
2. Al entrar, si no eligió carrera, preguntarla, y si es ingresante o
   ya cursa. La carrera se guarda para toda la app.
3. Marcar cada materia: pendiente, cursando, cursada (debe el final),
   aprobada (con nota). Se guarda en el teléfono. Sin cuenta.
4. «Qué puedo cursar»: las que tienen las correlativas cumplidas.
5. El promedio, diciendo sobre cuántas notas está hecho.
6. Una pestaña con el plan entero, imprimible (con @media print, hoja
   blanca aunque esté en oscuro).

NO:
- No inventes plazos de regularidad ni cantidad de turnos. Si la ficha
  dice FALTA:, la pantalla no los menciona.

TERMINADO CUANDO: cada plan coincide materia por materia con su PDF
(listame las diferencias o dudas al final), las correlativas se
comprobaron con tres casos a mano, y se usa sin cuenta y sin red.

LOS PDF: <adjuntar>
```

## Después

**Que alguien de la agrupación revise cada plan contra el PDF**, materia
por materia. Es la parte de la app que la gente usa para decidir qué
cursar.
