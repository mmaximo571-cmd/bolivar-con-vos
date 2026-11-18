# Sesión 6 · Info útil y el buscador

## Antes

Diez trámites y diez preguntas cargados en el panel, **confirmados**.
Si los textos no están, primero `ia-contenido.md` con los PDF de la
facultad.

## El prompt

```
TAREA: Sesión 6. tramites/index.html (trámites paso a paso y preguntas
frecuentes) y el buscador del inicio, que mira toda la app.

LEÉ PRIMERO:
- docs/kit/04-pantallas.md, la fila de Info útil
- sql/tabla-tramites.sql de este repositorio

MIRÁ EN LA REFERENCIA, por tramos:
- tramites/index.html: cómo se pintan los pasos y los campos Cuándo y
  Dónde (que no se muestran si están vacíos), con grep -n.
- index.html, función resultado() y lo que la rodea: el buscador.
- app.js, normalizar() y anotarBusqueda() (anotarBusqueda se conecta
  en la sesión 12; dejá el llamado preparado).
- LEEME.md de la referencia, grep -n «El buscador mira toda la app» y
  leé solo esa sección.

HACÉ:
1. Info útil: los trámites agrupados por categoría, cada uno con sus
   pasos. Cuándo y Dónde solo si tienen dato. Las preguntas frecuentes
   en acordeón. Usa lib/datos.js (solo lee). Si después hay trámites
   guardados por cuenta, cambia a lib/supabase.js en la sesión 9.
2. El buscador mira trámites, preguntas, fechas y los nombres de las
   pantallas. Sin tildes ni mayúsculas. Cada resultado lleva al lugar
   exacto (un ancla por trámite y por pregunta).
3. Sin resultados: decir qué se buscó y ofrecer escribirle a la
   agrupación.

TERMINADO CUANDO: buscar una palabra de un trámite, una de una pregunta
y una de una fecha lleva al lugar exacto; «sin resultados» dice algo
útil; a 375px, claro y oscuro.
```
