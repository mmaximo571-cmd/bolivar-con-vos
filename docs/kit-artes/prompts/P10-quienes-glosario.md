# Sesión 10 · Quiénes somos y el glosario

## Antes

- El texto del «Quiénes somos» cargado en el panel, o pegado.
- La lista de palabras del glosario con su explicación. Si no está
  escrita, armarla con `ia-contenido.md` desde el reglamento de la
  facultad. **Las escribe la agrupación, no la IA.**

## El prompt

```
TAREA: Sesión 10. quienes/index.html (editable desde el panel) y
glosario/index.html (texto en el HTML, no en Supabase).

LEÉ PRIMERO:
- docs/kit/04-pantallas.md, filas de Quiénes somos y Glosario

MIRÁ EN LA REFERENCIA, por tramos:
- sql/tabla-quienes.sql y, en panel/index.html, vistaQuienes (grep -n).
- glosario/index.html: la estructura de una palabra (respuesta corta en
  una línea, el detalle abajo, un id por palabra para el ancla).

HACÉ:
1. quienes/: lee pagina_quienes con lib/datos.js. Una solapa en el
   panel para editarla.
2. glosario/: las palabras que te paso, agrupadas. Cada una con id
   (#promocion) para que el buscador lleve directo. Las que tienen una
   pantalla donde se hace la cosa, con un enlace ahí.
3. Sumá el glosario al buscador (sesión 6) y al índice del pie. Y al
   menos dos puertas más: desde Info útil y desde Mi año.

NO:
- No agregues palabras que no estén en la lista que te paso. Si ves que
  falta una obvia, decímelo al final.

TERMINADO CUANDO: las dos publicadas con texto real; buscar una palabra
del glosario lleva a su ancla; el glosario tiene tres puertas de
entrada.

EL GLOSARIO: <pegar>
```
