# Sesión 3 · La base de datos y los permisos

## Antes

- Tener a mano el correo de la primera persona del equipo.
- Si la sesión usa el conector de Supabase, autorizarlo para este
  proyecto. Si no, Claude escribe los SQL y una persona los corre en el
  SQL Editor.

## El prompt

```
TAREA: Sesión 3. Las tablas, los roles y los permisos, cada uno en su
sql/tabla-*.sql, ensayados antes de dejarlos puestos.

LEÉ PRIMERO:
- docs/kit/02-datos-y-permisos.md entero

MIRÁ EN LA REFERENCIA, por tramos:
- sql/tabla-seguridad.sql: cuidar_rol() y su disparador, y el revoke de
  TRUNCATE.
- sql/tabla-publicaciones.sql: la tabla, los check y las políticas. La
  columna `linea` NO se trae (es la línea editorial de la Bolívar).
- sql/tabla-registro.sql: la tabla sucesos, el grant por columnas y el
  disparador freno_sucesos. Esta sesión crea la tabla; el lado del
  navegador es de la sesión 12.

HACÉ, un archivo por cada uno:
1. sql/tabla-perfiles.sql: perfiles, es_equipo(), al_crear_usuario y
   cuidar_rol. Roles: estudiante, equipo, comunicacion.
2. sql/tabla-seguridad.sql: el revoke de truncate/trigger/references y
   una sección «revisado y sano» vacía para ir anotando.
3. sql/tabla-publicaciones.sql: tipo en ('novedad','evento','fecha'),
   fecha_desde, fecha_hasta, hora, lugar, imagen_url, link_url,
   destacado, publicado. Más un `carrera` opcional para filtrar.
4. sql/tabla-tramites.sql: tramites (titulo, resumen, pasos jsonb,
   categoria, orden, publicado), faq (pregunta, respuesta, orden,
   publicado) y categorias (nombre, icono, orden, publicado).
5. sql/tabla-quienes.sql: una sola fila editable con el texto.
6. sql/tabla-registro.sql: sucesos con su freno.
Todas con la plantilla de 02-datos-y-permisos.md: GRANT y RLS.

ENSAYÁ cada archivo antes de correrlo: begin; … un bloque do $$ que
haga raise exception si (a) anon puede escribir, (b) un estudiante
puede escribir, (c) un estudiante puede cambiarse el rol, (d) anon no
puede leer lo publicado … rollback;. Después un select que confirme que
no quedó nada. Recién ahí correlo de verdad.

Al final, dame los pasos exactos para que una persona:
- prenda Email en Authentication y deje «Confirm email» apagado,
- cree la primera cuenta del equipo y le ponga rol equipo.

NO:
- No crees tablas desde el tablero sin archivo.
- No escribas la clave secreta en ningún lado.

TERMINADO CUANDO: los seis archivos están en sql/, corridos, con los
cuatro chequeos pasando, y en BITACORA.md queda qué se corrió y cuándo.

CORREO DEL EQUIPO: <pegar>
```
