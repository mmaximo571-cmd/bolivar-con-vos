# Sesión 9 · Perfil y la cuenta

## Antes

Decidido «Confirm email» (recomendado: apagado, ver
`02-datos-y-permisos.md`) y Email prendido en Authentication.

## El prompt

```
TAREA: Sesión 9. mi/index.html: la cuenta opcional. Crear, entrar,
salir, olvidé mi contraseña, borrar mi cuenta. Y que lo marcado en Mi
año sin cuenta se suba al crearla.

LEÉ PRIMERO:
- docs/kit/02-datos-y-permisos.md, «Lo que no se hace con SQL»
- docs/kit/01-arquitectura.md, «Dos clientes de datos»

MIRÁ EN LA REFERENCIA, por tramos:
- mi/index.html, con grep -n: las dos solapas (Ya tengo cuenta / Crear
  una cuenta), cómo distingue si «Confirm email» está prendido, y la
  traducción de los errores de Supabase al castellano.
- sql/tabla-borrar-cuenta.sql: borrar la cuenta propia desde la app.
- sql/tabla-mi-ano.sql: cómo se guarda la cursada de quien tiene
  cuenta.

HACÉ:
1. mi/ con lib/supabase.js. Dos solapas. Arriba, en una oración: la app
   se usa entera sin cuenta; la cuenta sirve para tener lo tuyo en
   cualquier teléfono.
2. Si «Confirm email» está prendido, «te mandamos un correo a tal
   dirección»; si no, entra derecho. Las dos formas probadas.
3. Errores de Supabase traducidos. Los que traen un número adentro
   («after 41 seconds») se reconocen por el texto, no por una lista
   fija.
4. Al crear cuenta o entrar, si hay cursada guardada en el teléfono y
   no en la cuenta, se sube. Si hay en los dos lados, se pregunta cuál
   queda.
5. Borrar mi cuenta, con confirmación, y una nota de qué se guarda,
   quién lo ve y cómo se borra.
6. El selector de tema también está acá.
7. sql/tabla-mi-ano.sql y sql/tabla-borrar-cuenta.sql de este proyecto,
   ensayados como en la sesión 3.

NO:
- No guardes nada de la sesión en memoriaDe: en una computadora de la
  facultad se lo lleva quien entra después.

TERMINADO CUANDO: crear, entrar, salir, olvidé, borrar, probados con una
cuenta de prueba que al final se borra; la cursada sube; los errores en
castellano.
```
