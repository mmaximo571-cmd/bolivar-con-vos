# Propuestas

Las ideas para la app antes de ser tarea. Acá se anotan como llegan, se
piensan y se ordenan; cuando una está decidida pasa al cronograma de
`BITACORA.md` y se marca acá con el commit que la cerró.

Existe para que ninguna idea viva solo en una conversación.

## Cómo se anota

Una propuesta por bloque, con estos cinco renglones. Si falta alguno, se
escribe igual y se deja en `pensándola`: la idea a medio escribir sirve
más que la idea perdida.

- **Qué** — en una línea, lo que vería el estudiante.
- **Por qué** — el problema que resuelve. Si no hay problema, no es propuesta.
- **Dónde toca** — pantallas, hojas de estilo, tablas de `sql/`. Se
  averigua con `graphify query`, no abriendo archivos.
- **Tamaño** — chico (una sesión), mediano (dos o tres), grande (hay que partirla).
- **Estado** — `pensándola` · `lista para hacer` · `en curso` · `hecha` · `descartada`.

Las descartadas no se borran: el porqué del descarte ahorra volver a
discutirla en tres meses.

## Índice

| # | Propuesta | Tamaño | Estado |
|---|---|---|---|
| 1 | Carga fácil de paros y grupos de estudio | chico-mediano | en curso |
| 2 | Anotarse a un grupo de estudio | chica | lista para hacer |

## Las propuestas

### 1. Carga fácil de paros y grupos de estudio

- **Qué:** una pantalla corta, aparte del panel, donde un compañero de
  la agrupación carga un paro o un grupo de estudio en tres pasos y le
  aparece en el calendario. Sin elegir «línea editorial», sin decidir si
  alimenta la alarma, sin pegar direcciones de imágenes.
- **Por qué:** los paros y los grupos de estudio son lo que más se
  mueve, y hoy cargarlos exige entrar al panel del equipo y completar
  **trece campos** (`titulo`, `tipo`, `linea`, `alarma`, `periodo`,
  `cuerpo`, `fecha_desde`, `fecha_hasta`, `hora`, `lugar`, `imagen_url`,
  `link_url`, `publicado`, `avisar`), con dos validaciones que retan si
  falta algo. Para alguien sin manejo tecnológico es una pared: el
  resultado es que se carga tarde, o lo carga siempre la misma persona.
- **Dónde toca:**
  - `panel/index.html:964-1170` — el formulario de hoy, que queda como
    está para el resto de las publicaciones.
  - Pantalla nueva y chica (`cargar/`, a definir el nombre), que escribe
    en la tabla `publicaciones` con `lib/datos.js`.
  - `agenda/index.html` — `dibujar` (L239) y `montarCal` (L390) ya
    dibujan cualquier fila de `publicaciones`: si se carga bien, aparece
    en el calendario **sin tocar nada acá**. Eso es lo que hace que la
    propuesta sea barata.
  - `index.html:814` (`proximoDeLaAgenda`) — también lo levanta solo.
  - `sql/` — hace falta el archivo de permisos. **Ojo: `publicaciones`
    es la única tabla importante que no tiene su `sql/tabla-*.sql`**
    (está en Supabase pero no en el repositorio). Sea con esta propuesta
    o antes, hay que escribirlo.
  - `css/` — la pantalla no tiene hoja propia: según la regla de
    `CLAUDE.md`, sus reglas van al final de `css/base/01-cimientos.css`,
    o se le hace hoja en `css/pantallas/` si crece.
  - `sw.js` — subir `VERSION` y anotar en `docs/HISTORIAL-SW.md`.
- **Tamaño:** chico-mediano (bajó al decidir el rol liviano, ver abajo).
  Ampliar cuatro políticas que ya existen, la pantalla corta, la bandeja
  de aprobación en el panel, y la prueba con alguien de la agrupación
  mirando.
- **Estado:** en curso (29/9/2026). Hecho: `sql/tabla-publicaciones.sql`.
  Falta: la pantalla de carga y la bandeja de aprobación del panel.

**Cómo sería el paso a paso** (la idea a discutir, no algo decidido):

1. **¿Qué es?** Dos botones grandes: «Un paro» · «Un grupo de estudio».
   Nada de menús desplegables. La elección completa sola `tipo`, `linea`
   y `alarma` — los tres campos que hoy hay que entender y que en estos
   dos casos son siempre los mismos.
2. **¿Cuándo?** Fecha con botones de atajo («hoy», «mañana», «el lunes»)
   además del calendario, y la hora de una lista de horarios de cursada
   en vez de escribirla a mano.
3. **¿Dónde y qué decís?** Lugar (con los de siempre a un toque: aula,
   hall, facultad) y un renglón de texto libre. El título se arma solo
   a partir de lo elegido, así nadie tiene que redactar.

Antes de guardar, **una vista previa igual a como se va a ver en la
app**: es lo que más confianza da a quien no maneja tecnología, porque
deja de ser un formulario a ciegas.

**Decidido (29/9/2026): los grupos salen directo, los paros con
revisión.**

El grupo de estudio entra con `publicado = true` y se ve en la app en el
momento: si sale mal, lo peor que pasa es que se perdió un grupo. El
paro entra con `publicado = false` y espera el visto bueno de alguien
del equipo, porque un paro mal cargado en la portada se paga caro.

Lo que eso obliga a resolver, y que hay que hacer sí o sí para que la
decisión no se vuelva en contra:

- **Al que carga hay que decírselo en la cara, antes de guardar.** Dos
  textos distintos en la vista previa: «esto se va a ver ya» para el
  grupo, «esto lo tiene que aprobar el equipo» para el paro. Si alguien
  carga un paro creyendo que ya está publicado, es peor que no tener la
  pantalla.
- **Después de guardar un paro, decirle en qué quedó.** Una pantalla que
  diga «lo mandamos, falta que lo aprueben» y —si se puede— que pueda
  volver a mirar el estado. Si no, el compañero pregunta por WhatsApp y
  perdimos lo que ganamos.
- **Alguien tiene que enterarse de que hay un paro esperando.** Un paro
  aprobado dos días tarde es un paro que no se avisó. Las opciones: que
  el panel muestre el número de pendientes bien visible, o que le suene
  el teléfono a quien modera (la app ya sabe mandar avisos, ver
  `sql/tabla-avisos.sql`). Esto es parte de la propuesta, no un extra.
- **El panel necesita dónde aprobarlos.** Una lista corta de «paros
  esperando» con dos botones, publicar y descartar. No el formulario de
  trece campos: si aprobar cuesta lo mismo que cargar, nadie aprueba.
  Suma media sesión de trabajo, y por eso la propuesta sigue siendo
  mediana pero queda en el techo de mediano.

**Decidido (29/9/2026): entra con un rol liviano, `comunicacion`.**

Al buscar cómo estaba hecho ese rol apareció que **media propuesta ya
está escrita**. `sql/tabla-buzon.sql:88-109` le da a `comunicacion`
cuatro políticas sobre `publicaciones` —ver, cargar, editar y borrar—
acotadas a `tipo = 'novedad'` y forzando `alarma = 'ninguna'`. O sea: el
rol existe, ya puede escribir en la tabla del calendario, y el alta está
documentada en el mismo archivo (punto 5, `update public.perfiles set
rol = 'comunicacion'`).

Lo que falta es correr el borde: hoy solo puede cargar `tipo =
'novedad'`, y un paro o un grupo de estudio son `tipo = 'evento'`
(tienen fecha, hora y lugar). Hay que ampliar las cuatro políticas a
`tipo in ('novedad', 'evento')`, **sin soltar `alarma = 'ninguna'`**.

Y los campos difíciles quedan resueltos solos, porque el mapeo es
exacto:

| Elige | `tipo` | `linea` | `alarma` | `publicado` |
|---|---|---|---|---|
| Un paro | `evento` | `gremial` | `ninguna` | `false` (espera visto bueno) |
| Un grupo de estudio | `evento` | `saberes` | `ninguna` | `true` (sale directo) |

Ningún compañero tiene que entender qué es una «línea editorial»: la
elige el botón que apretó.

**Por qué `alarma = 'ninguna'` no se negocia.** Lo encontró el
`/security-review` del 24/9 y está explicado en
`sql/tabla-buzon.sql:84-87`: la app y la función de avisos **miran el
título**, así que una publicación llamada «Inscripción a la mesa…» haría
sonar la alarma de mesas en todos los teléfonos. Como en esta pantalla
el título se arma solo, hay que armarlo de forma que **nunca** empiece
como una mesa de examen (`panel/index.html:1114` tiene la expresión que
lo detecta). La política de la base es el segundo candado, por si la
pantalla cambia algún día.

**Lo que hay que mirar de nuevo por esta decisión:** `comunicacion` ya
puede **editar y borrar**, no solo cargar. Habría que ver si se le deja
borrar eventos —probablemente sí, los suyos— o si se acota, porque el
rol se pensó para novedades y ahora va a tocar el calendario.

**El tamaño baja de mediano a chico-mediano:** no hay rol nuevo que
inventar ni alta que documentar, es ampliar cuatro políticas que ya
existen, la pantalla corta, y la bandeja de aprobación en el panel.

**Sigue faltando** el `sql/tabla-publicaciones.sql`: las políticas de
`comunicacion` sobre esa tabla viven hoy dentro de `tabla-buzon.sql`,
que no es su lugar.

**Lo que no entra en esta propuesta:** cargar imágenes, mandar aviso al
teléfono (`avisar`), y editar o borrar lo ya cargado. Eso sigue siendo
del panel. Cuanto más chica la pantalla, más gente la va a usar.

---

### 2. Anotarse a un grupo de estudio

- **Qué:** en un grupo de estudio de la agenda, un botón «me anoto», y
  que quien lo organiza sepa cuántos van.
- **Por qué:** hoy un grupo de estudio se publica y después nadie sabe
  si van tres o treinta. Quien organiza no puede pedir un aula del
  tamaño que hace falta, ni avisar si se cambia, ni darse cuenta de que
  no fue nadie. Y al que se anota, anotarse le sirve de compromiso: es
  más probable que vaya.
- **Dónde toca:**
  - `sql/tabla-anotados.sql` — tabla nueva (no existe nada parecido).
  - `agenda/index.html` — `dibujar` (L239) y el detalle `?id=` (L89):
    ahí va el botón y el contador.
  - `panel/index.html` — quien organiza tiene que ver el número.
  - `lib/datos.js` para escribir; `css/base/01-cimientos.css` o la hoja
    de agenda para el estilo; `sw.js` con `VERSION` arriba.
  - Depende de la propuesta 1: sin grupos cargados con fecha, no hay a
    qué anotarse. **Se hace después de la 1**, no en paralelo.
- **Tamaño:** chica (bajó al decidir que alcanza con el número, ver
  abajo). Sigue haciéndose después de la 1.
- **Estado:** lista para hacer

**La decisión que manda sobre todo lo demás: ¿con cuenta o sin cuenta?**

`LEEME.md:32` dice que la app se usa entera sin registrarse, y es una
decisión vieja y buena. Si anotarse exige crear cuenta, se anota la
mitad: el que más necesita el grupo de estudio es justo el que menos
ganas tiene de registrarse.

**Recomiendo sin cuenta**, con el patrón que la app ya probó dos veces
(`sql/tabla-avisanos.sql` y el buzón de `sql/tabla-buzon.sql`):

- Quien no tiene cuenta puede escribir **pocas columnas y con tope de
  largo**, y el resto lo pisa un disparador de entrada.
- Un tope de anotados por hora, para que nadie infle el número.
- Para **poder desanotarse** hace falta reconocer el teléfono sin
  reconocer a la persona: se guarda una marca al azar en el teléfono
  (`localStorage`) y esa marca es la que borra la fila. Sin cuenta y sin
  nombre, pero reversible.
- Si quiere que le recuerden, el aviso se ata al **endpoint del
  teléfono** y se guarda solo el número de fila de
  `avisos_suscripciones`, como hace el buzón: el timbre no queda
  duplicado en una tabla que el equipo lee.

**Lo que hay que pensar antes, porque son datos de personas:** una lista
de quién va a qué grupo de estudio es una lista que queda en manos de la
agrupación. En un centro de estudiantes eso no es un detalle. Por eso la
opción más sana es que **por defecto solo se cuente**, no se registre
quién: el número alcanza para pedir el aula, que es el problema real.

**Pedido (29/9/2026): que se pida un número de contacto, para mandarles
el link del grupo o en qué aula es.**

Queda anotado y se hace. Pero al mirar qué hay armado, **dos de los tres
usos no necesitan ningún número**, y conviene saberlo antes de pedirlo:

| Para qué | Cómo se resuelve sin número |
|---|---|
| Avisar en qué aula es | Los avisos al celular ya están hechos y funcionando (`sql/tabla-avisos.sql`). Se le golpea la puerta al teléfono sin saber de quién es: se guarda el `endpoint`, no una persona. Es el mismo mecanismo que usa el buzón para avisarle al autor de un pedido. |
| Avisar que se cambió el aula | Igual que arriba, y **mejor**: le llega aunque no abra la app, que es justo el agujero que los avisos vinieron a tapar. |
| Dar el link del grupo de WhatsApp | Mostrarlo en la app **en el momento de anotarse**. El link aparece en pantalla apenas aprieta «me anoto»: no hay que mandarle nada. |

Lo único que un número resuelve y el aviso no, es **meter a la persona
al grupo de WhatsApp vos** en vez de que entre por el link. Si eso es lo
que buscás, el número hace falta. Si es por el aula, los avisos lo hacen
mejor y sin guardar datos.

**Y si se pide igual, cómo pedirlo sin que sea un problema.** Un listado
de teléfonos de estudiantes que van a grupos de estudio, en manos de una
agrupación, y en la misma tabla que los paros, es un dato delicado. No
es motivo para no hacerlo; es motivo para hacerlo así:

- **Opcional y con el para qué escrito al lado.** «Dejá tu número si
  querés que te sumemos al grupo de WhatsApp (no hace falta para
  anotarte)». Si es obligatorio, se anota menos gente que hoy con los
  avisos solos.
- **Lo ve solo quien organiza ese grupo**, nunca el resto del equipo y
  nunca en la app. Eso es una política de RLS por fila, no una pantalla
  que filtra.
- **Se borra después.** Un número que se pidió para avisar de un grupo
  del martes no tiene por qué seguir ahí en marzo. Lo más limpio es un
  borrado automático a los días del encuentro; la fecha ya está en la
  publicación, así que sale solo.
- **Nunca se usa para otra cosa.** Ni para difusión, ni para la campaña,
  ni para sumarlos a una lista. Si algún día se quiere eso, se pide de
  nuevo y aparte.
- **Con tope de largo y validación**, como el resto de lo que se escribe
  sin cuenta.

Yo arrancaría con el aviso al celular y el link en pantalla —que son
gratis, ya están hechos y no guardan nada— y **dejaría el número como
casilla opcional** para el caso del WhatsApp. Si en dos o tres grupos se
ve que nadie usa el link y todos quieren que los sumen a mano, ahí el
número se justifica solo.

**Decidido (29/9/2026): alcanza con cuántos · el contador es público ·
sin cupo.**

- **Solo el número.** La tabla no guarda quién: una fila por anotado,
  con la marca al azar del teléfono para poder desanotarse y nada más.
  Esto saca de encima toda la discusión de quién ve la lista y cuánto se
  guarda. **El número de contacto opcional queda como el único dato
  personal de la propuesta**, y por eso conviene que viva en su propia
  tabla (`anotados_contacto`) y no como una columna al lado del
  contador: así la tabla que lee todo el mundo para el contador no tiene
  ni una columna con datos de nadie, y el borrado automático de los
  números es un `delete` sobre una tabla chica y aparte.
- **Contador público.** Hay que resolverlo con una **vista**, no
  abriendo la tabla: quien no tiene cuenta tiene que poder leer «van
  12» sin poder leer las filas. La app ya tiene ese patrón hecho en
  `buzon_totales` (`sql/tabla-buzon.sql`), así que se copia de ahí.
  Queda pendiente de tu gusto una sola cosa chica, que se puede decidir
  mirándolo: si con 0 o 1 anotado conviene no mostrar el número y poner
  «sé el primero», porque «van 0» desanima. Es un `if` en la pantalla,
  no cambia nada de la base.
- **Sin cupo.** El botón no se apaga nunca. Menos código y una columna
  menos.

**Con esto la propuesta baja a chica** y queda lista para hacer: una
tabla sin datos personales, una vista para el contador, una tabla aparte
y opcional para los números, el botón en el detalle de la agenda y el
número en el panel.

**Lo que no entra:** lista de espera, confirmar asistencia el día
después, y avisar al que se anotó cuando el grupo cambia de aula. Lo
último es lo primero que va a hacer falta, pero mejor una vez que se vea
si la gente se anota.

---

<!-- Plantilla para copiar:

### N. Título corto

- **Qué:**
- **Por qué:**
- **Dónde toca:**
- **Tamaño:**
- **Estado:** pensándola

Notas: lo que se conversó, las dudas abiertas, lo que hay que medir antes.

-->

## Descartadas

_(todavía ninguna)_
