# Sesión 11 · Instalable y sin señal

## Antes

El logo en vector (SVG), para sacar los íconos.

## El prompt

```
TAREA: Sesión 11. sw.js, manifest.json, sin-conexion.html, los íconos,
y el botón de instalar.

LEÉ PRIMERO:
- docs/kit/01-arquitectura.md, «El service worker» y «Lo guardado entre
  visitas»

MIRÁ EN LA REFERENCIA, por tramos:
- sw.js: el comentario de arriba, VERSION, DEL_ARMAZON, y los eventos
  install, activate, message y el bloque `pedido.mode === 'navigate'`
  de fetch. Lo de compartir, videos, Leaflet y el Arsenal es de la
  Bolívar: no lo traigas.
- app.js: el final, donde se registra el service worker y la recarga
  única cuando entra una versión nueva (grep -n serviceWorker).
- manifest.json.
- docs/HISTORIAL-SW.md de la referencia: solo las primeras 30 líneas,
  para ver el formato.

HACÉ:
1. sw.js con: VERSION = '<prefijo>-v1'; el armazón (tokens, los doce de
   la base, app.js, config.js, iconos.js, lib/datos.js, los íconos,
   sin-conexion.html); los datos de Supabase NUNCA se guardan; las
   pantallas primero por la red con tope de 6 s, después la copia,
   después sin-conexion.html; solo se guarda una respuesta ok.
2. En app.js, registrar el service worker y recargar una sola vez
   cuando entra una versión nueva (si no, HTML nuevo con app.js viejo).
3. manifest.json con nombre, colores de la ficha e íconos (192, 512 y
   maskable). Los PNG salen del SVG.
4. sin-conexion.html: autosuficiente, sin depender de nada que pueda
   no estar.
5. Un botón «Instalar la app» que aparece solo cuando el navegador lo
   ofrece (beforeinstallprompt). En iPhone, una explicación de cómo
   agregarla a la pantalla de inicio.
6. Primera línea de docs/HISTORIAL-SW.md: v1, fecha, por qué.
7. Un script chico (refs) que lea DEL_ARMAZON y verifique que cada
   archivo existe. Dejalo en herramientas/ y anotá en CLAUDE.md cuándo
   correrlo.

TERMINADO CUANDO: Chrome de Android ofrece instalarla; con la red
cortada, una pantalla ya visitada abre y una no visitada muestra
sin-conexion.html; cambiar un color en tokens.css sin subir VERSION NO
se ve en el teléfono instalado, y subiéndola sí (probalo: es la regla
que más se olvida).
```
