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
| 1 | Carga fácil de paros y grupos de estudio | chico-mediano | hecha, falta correr el SQL |
| 2 | Anotarse a un grupo de estudio | chica | hecha en la tanda 3 de la 3 (30/9) |
| 3 | Calendario y avisos: que se revisen todos los días | grande, en tres tandas | hecha: las tres tandas y la función `avisos` v11 en producción (30/9) |
| 4 | Época de parciales en Estudiemos (va con el reel) | chica | hecha el 4/10 (v83), falta publicar |

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
- **Estado:** hecha en código (29/9/2026): `sql/tabla-publicaciones.sql`,
  la pantalla `cargar/`, la bandeja de aprobación del panel y los enlaces
  desde el panel y desde `mi/`. **Falta correr el SQL en Supabase** y
  probarla con una cuenta `comunicacion` de verdad. Hasta que eso pase,
  no está terminada.

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
- **Estado:** lista para hacer. Desde el 30/9/2026 va dentro de la
  tanda 3 de la propuesta 3, junto con «Voy».

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

### 3. Calendario y avisos: que se revisen todos los días

- **Qué:** que la estudiante abra la app y sepa en dos segundos qué pasa
  hoy (hay paro, hay grupo de su materia, hay asamblea), que el
  calendario distinga a simple vista un paro de un grupo de estudio, y
  que el teléfono le avise solo, sin que nadie marque «avisar» a mano.
- **Por qué:** se viene un mes con mucha carga (grupos de estudio,
  paros, actividades) y hoy el calendario y la campana no lo aguantan:
  - Un paro y un grupo de estudio son los dos `tipo = 'evento'`: se
    ven iguales y no se pueden filtrar por separado.
  - La campana muestra las últimas 10 de 14 días, no distingue lo nuevo
    de lo que es mañana ni de lo que cambió, y lo leído vive en un solo
    teléfono.
  - Al celular solo sale una novedad si alguien marca `avisar`, y solo
    en las 48 horas siguientes. No hay recordatorio del día, ni aviso de
    «se suspendió» o «cambió de aula», que es lo que más se necesita.
- **Dónde toca:** `sql/tabla-publicaciones.sql`, `sql/tabla-avisos.sql`,
  `supabase/functions/avisos/`, `cargar/`, `panel/` (el formulario de
  publicaciones), `agenda/`, `app.js` (la campana), `index.html` (la
  tarjeta Hoy), `lib/tarjeta-avisos.js`, `lib/fecha-al-calendario.js`,
  `css/base/07-avisos.css` y `08-calendario.css`, `sw.js` con `VERSION`
  arriba en cada tanda.
- **Tamaño:** grande. Partida en tres tandas; cada una se sube y se usa
  sola.
- **Estado:** tandas 1 y 2 hechas el 30/9/2026 (SQL en producción,
  función `avisos` v10 subida, `sw.js` v78). Tanda 3 hecha el mismo día
  (SQL en producción, `sw.js` v80); la función `avisos` v11, que le
  avisa a quien marcó «Voy», subida el 30/9 a las 10:31.

**Lo que se decidió (30/9/2026):**

| Tema | Decisión |
|---|---|
| Clasificación | Categorías visibles: **Paro, Grupo de estudio, Actividad, Fecha académica, Comunicado**. Cada una con ícono, color, filtro e interruptor de aviso propios. |
| Avisos automáticos | **Al publicar**, **el mismo día a la mañana** (con hora y lugar) y **cuando cambia o se suspende**. Sin recordatorio del día anterior. Se respeta la franja de 9 a 21. |
| A quién | General para todes; los **grupos de estudio de sus materias** se resaltan y avisan. |
| Canales | Uno por categoría: Paros (prendido de fábrica), Grupos de mis materias, Actividades, Comunicados. Las mesas y «mis fechas» siguen como están. |
| Paros | **Se publican directo** desde `cargar/`, sin visto bueno. |
| `cargar/` | Suma **Actividades** y **Editar y suspender** lo propio. Sin repetición semanal ni cupo por ahora. |
| Qué hace la estudiante | «**Voy**» (me anoto, en los grupos), **pasarlo al calendario** y **compartir por WhatsApp**. |
| Campana | **Bandeja completa**: Hoy, Esta semana, Nuevo, Cambios; lo leído se sincroniza con cuenta. |
| Portada | **Tarjeta Hoy** y **lo que marcó «Voy»**. Sin tira de la semana. |
| Calendario | **Puntos por categoría** (el paro pinta el día entero), **vista agenda continua**, **Mi calendario** y **paro cruzado con la cursada**. |

**Tanda 1 · lo que hace falta para cargar este mes**

1. `publicaciones`: columnas `categoria` (`paro`, `grupo`, `actividad`,
   `fecha`, `comunicado`), `materia` (para los grupos), `suspendido`
   y `cambiado_at` (la pone un disparador cuando cambian fecha, hora o
   lugar, igual que `avisar_at`). Lo cargado hasta hoy se completa desde
   `tipo` y `linea`: evento gremial = paro, evento saberes = grupo, otro
   evento = actividad, fecha = fecha, novedad = comunicado. `tipo` se
   queda: las políticas de hoy lo usan.
2. Políticas: el rol liviano publica paros directo y edita o suspende
   **solo lo suyo** (ya existe `creado_por`).
3. `cargar/`: tercer botón «Una actividad», y una lista «Lo que cargué»
   con Editar y Suspender.
4. `avisos_suscripciones`: columnas `paros`, `grupos`, `actividades`,
   `comunicados` y `materias text[]`. `guardar_aviso` nuevo, **sin
   borrar el viejo**: un teléfono con `app.js` del caché lo va a seguir
   llamando unos días.
5. La función `avisos`: tres claves por publicación
   (`pub:ID:nueva`, `pub:ID:hoy:FECHA`, `pub:ID:cambio:CAMBIADO_AT`)
   en `avisos_enviados`, así nada suena dos veces. Lo publicado a la
   noche sale a las 9.
6. `agenda/`: puntos por categoría en la grilla, el paro pinta el día,
   filtros por categoría en vez de por línea, y lo suspendido tachado.
7. La tarjeta de avisos en `mi/`: un interruptor por categoría y la
   elección de materias (con cuenta, sale sola de `cursada`).

**Cómo quedó la tanda 1 (30/9/2026), por si hay que volver:**

- La materia de un grupo se compara sin tildes ni mayúsculas contra las
  que la persona marcó en la tarjeta de avisos y las de su `cursada`.
  Sin ninguna, le llegan todos los grupos.
- La tarjeta de avisos ofrece como materias las de los grupos
  publicados que todavía no pasaron, no el plan entero.
- Las fechas académicas no avisan solas (son decenas y se cargan de a
  muchas). Los comunicados siguen con la marca manual de 48 horas.
- `cargar/` sugiere el nombre de la materia desde los tres planes de
  `carrera/`, para que coincida con lo que la gente carga en su cursada.
- Un paro que quedó sin publicar de antes del cambio (hay uno del 30/9)
  se publica desde la bandeja del panel o desde «Lo que cargaste».

**Tanda 2 · el hábito diario**

- La campana como bandeja: Hoy, Esta semana, Nuevo, Cambios. Lo leído
  se guarda en la cuenta si hay sesión; sin sesión, como hoy.
- Tarjeta **Hoy** arriba del inicio: lo de hoy y sus clases, en rojo si
  hay paro.
- ~~«Lo que marcaste Voy» en el inicio.~~ Pasa a la tanda 3: sin «Voy»
  no hay nada que mostrar, y «Voy» es de la tanda 3.

**Cómo quedó la tanda 2 (30/9/2026):**

- **La bandeja** (`app.js`, «La campana»). Cada publicación va una vez,
  en la primera parte que le toca: Hoy (lo que empieza hoy, el último
  día de algo largo y el paro que cubre hoy), Esta semana (lo que
  empieza en los próximos siete días), Cambios (cambiado o suspendido
  en la última semana) y Nuevo (publicado en las últimas dos). Lo que
  ya pasó y los períodos largos en el medio no van. Cambios y
  suspensiones se dicen arriba del título, en rojo; lo suspendido va
  tachado. Al final ofrece prender los avisos al celular si el teléfono
  no los tiene.
- **Lo leído va por aviso y no por publicación**: `pub:ID:nueva`,
  `pub:ID:cambio:<ms>` o `pub:ID:hoy:<fecha>`, el más reciente. Por eso
  el globo de la campana tiene algo que decir el día del paro aunque el
  paro se haya leído cuando se publicó, y vuelve a sonar si un grupo
  cambia de aula. El formato viejo del teléfono (`ids`) se lee igual.
- **Con cuenta**, lo leído se junta en `campana_leidas`
  (`sql/tabla-campana.sql`, aplicado): tabla propia y no una columna de
  `preferencias`, porque una fila creada por la campana con los valores
  por defecto le apagaba a Fechas el modo parciales. Se junta solo en
  las pantallas con la librería grande; en las demás queda en el
  teléfono hasta la próxima visita a Perfil, Mi año o Info útil.
- **La tarjeta «Hoy»** (`index.html`, `pintarHoy`) ocupa el lugar del
  renglón de lo próximo cuando hoy pasa algo o la persona tiene clases;
  si no, vuelve el renglón. Los grupos de sus materias dicen «Tu
  materia». Con paro se pone roja y, si tiene clases ese día, le dice
  que se fije con la cátedra: la app no sabe si la clase se da.
- **Las clases** salen de una copia liviana que dejan Fechas y Perfil
  en el teléfono (`guardarCopiaCursada`, en `app.js`), porque el inicio
  no tiene sesión. Se borra al cerrar sesión y no se usa si la sesión
  guardada es de otra cuenta.
- `lib/datos.js` suma `or`. De paso se arregló la ruta del patio del
  fondo del inicio, rota desde el reparto de los estilos del 27/9.

**Tanda 3 · la estudiante hace algo con el evento**

- «Voy» en cualquier evento y «Me anoto» en los grupos: es la
  propuesta 2 entera, con su decisión de **sin cuenta** y **solo
  contar**. Quien marca Voy recibe el aviso de ese evento aunque tenga
  la categoría apagada.
- «Lo que marcaste Voy» en el inicio (venía de la tanda 2).
- Compartir por WhatsApp: título, día, hora, lugar y link.
- Vista agenda continua, pestaña **Mi calendario** (clases, finales,
  Voy, paros que le tocan) y el paro cruzado con la cursada: sus clases
  de un día de paro salen marcadas.

**Cómo quedó la tanda 3 (30/9/2026):**

- **`sql/tabla-anotados.sql`, aplicado** (migración `tabla_anotados`),
  después de ensayarlo con begin/rollback y 22 pruebas de permisos:
  anotarse sin cuenta, el mismo teléfono no suma dos veces, nadie lee
  la tabla, el contador sale de la vista, no se anota a lo suspendido
  ni a una fecha académica, el número lo ve solo quien cargó el grupo
  y desanotarse se lo lleva.
- **`lib/voy.js`** (nuevo, lo cargan Fechas y el inicio): la marca al
  azar del teléfono (`bolivar-voy`), qué marcó, marcar y desmarcar,
  dejar el número y el enlace para compartir. Qué ids marcó el teléfono
  vive en el teléfono: la base no sabe de quién es cada marca.
- **El detalle de Fechas** (`agenda/?id=`): la caja de «Voy» (o «Me
  anoto» en los grupos) va arriba del flyer, con el contador. Con cero
  no dice «van 0»: invita. En un grupo con enlace de WhatsApp, el
  enlace aparece al anotarse; abajo, «Prefiero que me sumen con mi
  número», opcional. Abajo de todo, «Compartir por WhatsApp» con
  título, día, hora, lugar y enlace. Quien marcó «Voy» antes de prender
  los avisos queda atado a su teléfono la próxima vez que abre el
  detalle con los avisos prendidos.
- **La lista de Fechas**: «Vas» en lo marcado y «Van N» desde dos.
- **Las pestañas Días y Mío**, al lado de Mes y Semana. Días es la
  agenda seguida de las próximas seis semanas, día por día. Mío son tres
  semanas de lo de la persona: sus clases y sus finales (con cuenta), lo
  que marcó «Voy» y los paros. Una clase en un día de paro dice «Hay
  paro: fijate con tu cátedra si se da». En Semana, esa clase sale con
  borde rojo y «Hay paro».
- **El inicio**: «Vas» en la tarjeta Hoy y en el renglón de lo próximo,
  y «Dijiste que vas» abajo, con lo marcado que viene (sin repetir lo
  que ya dice el renglón).
- **`cargar/`**, en «Lo que cargaste»: cuántos van a cada cosa y, en los
  grupos, los números que dejaron, con el aviso de para qué son y de
  que se borran solos.
- **La función `avisos` v11** (`supabase/functions/avisos/index.ts`):
  quien marcó «Voy» con los avisos prendidos recibe el aviso del día y
  el de cambio de ese evento aunque tenga la categoría apagada o el
  grupo no sea de sus materias. **Subida el 30/9/2026 a las 10:31**,
  con el visto bueno de Máximo, igual al archivo del repo.
- No entró: el calendario suscripto (`webcal://`), que sigue en dudas.

**Dudas abiertas:**

- **Paros sin visto bueno.** Con aviso automático al publicar, un paro
  mal cargado le suena a toda la facultad y no se puede des-mandar. Lo
  que lo acota: solo carga el rol liviano (con cuenta, con `creado_por`),
  y editar o suspender manda el aviso de corrección. Vale revisar quién
  tiene ese rol antes de la tanda 1.
- **«Que se actualice solo» en el calendario del celular.** El `.ics`
  bajado y el enlace de Google son una copia: si el evento cambia, no se
  enteran. Lo que se actualiza solo es un calendario **suscripto**
  (`webcal://`), que necesita una función de Supabase que sirva el
  `.ics` en vivo. Se puede sumar a la tanda 3; mientras tanto, el aviso
  de cambio es el que cubre.
- **Grupos de mis materias sin cuenta.** Sin sesión no hay `cursada`:
  la materia se elige a mano en la tarjeta de avisos y se guarda en la
  suscripción, no en el teléfono.

### 4. Época de parciales en Estudiemos

- **Qué:** una tira arriba de Estudiemos, hasta el cierre del 2.º
  cuatrimestre, con el interruptor «Época de parciales» y dos atajos: los
  grupos de estudio de Fechas y las fichas de tu carrera. Más
  tres hitos de estudio: «prendió época de parciales», «terminó un
  pomodoro» y «abrió una ficha».
- **Por qué:** se vienen los parciales y la gente no vuelve a estudiar: la
  semana del 27/9 al 3/10 Estudiemos y sus pantallas tuvieron 195 visitas
  de 1.577 (12 %). El interruptor existe
  pero está escondido en las opciones de Fechas. Y no hay ningún hito de
  estudio: si el reel de `marca/REEL-PARCIALES.md` funciona, hoy solo se
  vería como visitas, no como gente estudiando. La tira es donde cae el
  link del reel.
- **Dónde toca:** `estudiemos/index.html` y `estudiemos/portada.js` (la
  tira), `css/pantallas/estudiemos.css`; el interruptor comparte la clave
  `bolivar-enfoque` con `agenda/index.html`, así que prenderlo en un lado lo
  prende en el otro. Hitos con `anotarHito()` de `app.js`: en el
  interruptor de los dos lados, al terminar una fase de foco en
  `estudiemos/pomodoro.js` (`terminar()`), y al tocar una ficha en el
  índice o en la portada, porque las fichas dibujadas no cargan `app.js`.
  Subir `VERSION` de `sw.js`.
- **Tamaño:** chica (una sesión).
- **Estado:** hecha el 4/10/2026 (v83), sin publicar. Detalle en `BITACORA.md`.

Notas: la tira se esconde sola después del 21/11 (cierre de clases del
2.º cuatrimestre, cargado en Fechas) para no quedar vieja. En la tira, el
interruptor con `typeof` antes de llamar a lo de `app.js`, por si llega
el viejo del caché. Los grupos de estudio los carga el equipo desde el
panel: sin grupos, el atajo lleva a una lista vacía y conviene esconderlo.

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
