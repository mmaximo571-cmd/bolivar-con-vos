# Sesión 5 · El inicio

## Antes

- Contenido real cargado desde el panel (al menos fechas y categorías).
- Las fotos o ilustraciones de portada, con permiso, si las hay.
- Si se quiere, un diseño previo con `ia-diseno.md`.

## El prompt

```
TAREA: Sesión 5. index.html, la pantalla de inicio.

LEÉ PRIMERO:
- docs/kit/04-pantallas.md, la fila de Inicio
- docs/kit/03-diseno.md, «Las reglas de pantalla» y «La navegación»
- Si hay un diseño de una IA en docs/disenos/, ese archivo

MIRÁ EN LA REFERENCIA, por tramos. index.html pesa 136 KB: NUNCA
ENTERO. Con grep -n, solo:
- mostrarBienvenida (la primerísima vez, con dos botones)
- proximoDeLaAgenda y pintarHoy (el renglón de «lo próximo»)
- pintarAccesos (la grilla de accesos)
- el tramo alrededor de la llamada a montarCalendario (cerca de la
  línea 1910): desde el 30/9/2026 el inicio y Fechas usan el mismo
  calendario, de lib/fecha-al-calendario.js. Antes eran dos y decían
  cosas distintas.
La apertura animada del logo, el carrusel de Instagram, el modo
ingreso y la fila de carreras son de la Bolívar: no los mires.

HACÉ, en este orden de arriba a abajo:
1. Cabecera y secciones (de app.js).
2. Bienvenida solo la primera vez: «Entrar» (sin cuenta) y «Ya tengo
   cuenta». No promete que la cuenta dé acceso a nada.
3. «Lo próximo»: la fecha más cercana que todavía no pasó. Ojo: no
   elegir un período largo ya empezado y llamarlo «Hoy».
4. Los accesos, desde categorias.
5. Novedades.
6. El calendario: el mismo montarCalendario que arma la sesión 7. Si
   la sesión 7 todavía no se hizo, dejá el hueco y lo llena esa
   sesión. Un calendario en el inicio y otro distinto en Fechas es un
   error que la Bolívar ya cometió.
Lo que no lleva fecha se pinta de memoriaDe mientras llega lo nuevo;
lo que lleva fecha espera a la red.

NO:
- No metas una apertura animada en esta sesión. Si se hace, es aparte,
  una vez por visita, salteable y apagada con «menos movimiento».

TERMINADO CUANDO: con datos reales, a 375px, claro y oscuro; con la
red cortada después de una visita, abre lo guardado sin inventar
fechas; consola limpia.
```
