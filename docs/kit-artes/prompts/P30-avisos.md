# Los avisos al celular

La pieza más frágil de la app. Cuatro partes, y si falta una, la persona
prende el interruptor y no recibe nada sin que nadie se entere. En la
Bolívar, con todo armado y 93 teléfonos suscriptos, no salía ningún
aviso: el secreto cargado como privado era la clave pública.

**Hacerlo solo si hay algo que avisar que no se puede perder**: en la
Bolívar, la inscripción a mesas (una ventana de cuatro días, nueve veces
al año).

## Antes

- Que alguien con acceso al tablero de Supabase esté en la sesión: los
  secretos de Edge Functions no los carga Claude.
- Un teléfono Android y un iPhone para probar. **En iPhone los avisos
  solo funcionan con la app instalada en la pantalla de inicio.**

## El prompt

```
TAREA: Los avisos al celular. Interruptor, suscripción guardada, la
función que manda y el reloj que la despierta cada hora.

LEÉ PRIMERO:
- docs/kit/02-datos-y-permisos.md, «Funciones security definer»

MIRÁ EN LA REFERENCIA, por tramos:
- LEEME.md: grep -n «Los avisos al celular» y leé hasta «Si alguien dice
  que no le llegan» inclusive.
- sql/tabla-avisos.sql: la tabla de suscripciones (cerrada con llave) y
  el bloque del reloj al final.
- supabase/functions/avisos/index.ts y supabase/functions/reloj/index.ts.
- lib/tarjeta-avisos.js (el interruptor) y, en sw.js, los oyentes push
  y notificationclick.

HACÉ:
1. sql/tabla-avisos.sql de este proyecto, ensayado.
2. Las dos Edge Functions.
3. El interruptor en el perfil. El permiso se pide recién al tocarlo,
   nunca al entrar: si alguien dice que no, el navegador no vuelve a
   preguntar.
4. Los oyentes en sw.js, y subir VERSION.
5. Generá el par de claves VAPID. La PÚBLICA va en config.js. La
   PRIVADA me la mostrás UNA vez en la respuesta para que la cargue en
   el tablero, y no la escribís en ningún archivo.
6. Dame los pasos exactos para cargar los tres secretos (VAPID_PRIVADA,
   VAPID_PUBLICA, VAPID_CONTACTO) y comprobá después, llamando a la
   función, que la privada no es igual a la pública.

NO:
- Nunca generes un par nuevo una vez que haya teléfonos suscriptos:
  los deja afuera a todos.

TERMINADO CUANDO: un aviso de prueba llega a un Android con la app
cerrada y a un iPhone con la app instalada.
```
