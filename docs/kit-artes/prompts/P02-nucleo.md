# Sesión 2 · El núcleo: `app.js` y el cliente de datos

## Antes

Decidir los nombres de las secciones de arriba (cuatro a siete). Si
todavía no está claro, alcanza con: Inicio, Info útil, Fechas, Mi año,
Perfil.

## El prompt

```
TAREA: Sesión 2. Escribir app.js (lo compartido), lib/datos.js (el
cliente chico de Supabase) y bajar lib/supabase.js congelada.

LEÉ PRIMERO:
- docs/kit/01-arquitectura.md, secciones «El JavaScript» y «Errores que
  dicen algo»
- docs/kit/prompts/plantilla-pantalla.md

MIRÁ EN LA REFERENCIA, por tramos (usá grep -n para encontrarlos):
- lib/datos.js: ENTERO, es corto. Se trae casi tal cual; cambiá solo
  los comentarios que nombran pantallas de la Bolívar.
- app.js, solo estas funciones: avisarQueNoArranca, esc, urlSegura,
  normalizar, MESES, fechaLinda, rangoLindo, hoyISO, sesionActual,
  esDelEquipo, SECCIONES, htmlCabecera, pintarNav, TEMAS, aplicarTema,
  pintarTema, marcarTitulos, explicarError, conPaciencia, memoriaDe,
  GUARDADO_VIDA.
- No mires la campana, la alarma de mesa, el registro ni Avisanos:
  vienen después o no vienen.

HACÉ:
1. lib/datos.js desde la referencia. Mismos métodos (select, eq, or,
   order, limit, maybeSingle, insert, rpc) y la guardia que tira un
   error con nombre ante cualquier otro.
2. lib/supabase.js: la librería oficial @supabase/supabase-js en su
   build UMD, con la versión EXACTA escrita en un comentario arriba.
   Bajala de npm (no de un CDN en tiempo de ejecución). Verificá la
   versión mirando el package.json que bajaste; no la adivines.
3. app.js con, en este orden: RAIZ, menos movimiento, avisarQueNoArranca,
   utilidades de texto y fechas, la sesión y el rol, SECCIONES (con los
   nombres de abajo), la cabecera con «Saltar al contenido», el menú
   lateral con el selector de tema de tres opciones (Automático, Claro,
   Oscuro), el pie con un índice de pantallas, explicarError,
   conPaciencia (12 s) y memoriaDe (una semana). Las llaves de
   localStorage empiezan con el prefijo de la ficha.
4. Una pantalla de prueba con la plantilla que use todo eso y lea una
   tabla que no existe: tiene que mostrar un error en castellano, no
   romperse.
5. Probá también sin config.js: la pantalla dice «No se pudo abrir la
   app» con el motivo y un botón de reintentar.

NO:
- No copies SECCIONES, INDICE_PIE ni ningún texto de la referencia.
- No cargues nada de un CDN en tiempo de ejecución.

TERMINADO CUANDO: la pantalla de prueba muestra cabecera, secciones,
menú, tema que se guarda y sigue al teléfono en «Automático», pie, y
los dos errores legibles. Consola sin errores.

LAS SECCIONES: <pegar la lista, en orden>
```
