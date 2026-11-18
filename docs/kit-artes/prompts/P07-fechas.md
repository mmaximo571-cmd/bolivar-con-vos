# Sesión 7 · Fechas

## Antes

El calendario académico del año cargado en el panel, como `fecha`
(inscripciones, mesas, recesos) y `evento` (actividades de la
agrupación). En Artes conviene decidir antes si las muestras y funciones
van acá como otro `tipo` o en pantalla aparte (ver `04-pantallas.md`).

## El prompt

```
TAREA: Sesión 7. agenda/index.html: el calendario del mes, la lista de
lo que viene, y pasar una fecha al calendario del celular.

LEÉ PRIMERO:
- docs/kit/04-pantallas.md, la fila de Fechas
- sql/tabla-publicaciones.sql de este repositorio

MIRÁ EN LA REFERENCIA, por tramos:
- lib/fecha-al-calendario.js: urlGoogleCalendar, eventoICS,
  archivoICS, escaparICS, doblarRenglon, y montarCalendario (el
  calendario del mes, que usan Fechas y el inicio). Se trae casi entero: el ICS
  tiene reglas finas (escapar, doblar renglones a 75 bytes) que ya
  están resueltas.
- css/base/08-calendario.css, para la barrita de color por día.
- LEEME.md de la referencia: grep -n «Pasar una fecha al calendario» y
  leé solo esa sección.

HACÉ:
1. lib/fecha-al-calendario.js con montarCalendario, para que el
   inicio use el mismo. El calendario mensual con flechas y nombre accesible. Cada día
   marcado lleva una barrita de color por familia; varios días seguidos
   de lo mismo se leen como una franja. Debajo, una leyenda en palabras
   de qué cae ese mes.
2. Tocar un día abre lo que hay ese día, completo.
3. La lista de lo que viene, con filtros por tipo.
4. En cada publicación que todavía no pasó: «Pasalo a tu calendario»,
   con dos caminos: el enlace de Google (anda adentro del navegador de
   Instagram) y el .ics (iPhone y computadora).
5. lib/datos.js (solo lee). Se refresca al volver a la pantalla
   (visibilitychange y pageshow), con un freno de 15 segundos. Nada de
   tiempo real.
6. Esta pantalla NO usa memoriaDe: su contenido son las fechas.

TERMINADO CUANDO: las fechas del año se ven en el mes que corresponde;
el .ics abre en el calendario de un teléfono real y el enlace de Google
anda desde el navegador de Instagram; a 375px, claro y oscuro.
```
