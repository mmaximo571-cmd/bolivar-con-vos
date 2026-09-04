# Bitácora · La Bolívar con vos

**Este archivo se lee primero, antes de tocar nada y antes de explorar el
repositorio.** Existe para eso: el trabajo va en sesiones cortas, y sin esto
cada sesión vuelve a leerse `LEEME.md` (50 KB) y a mirar la estructura entera.
Con seis arranques por día, eso se paga seis veces.

Si algo de acá quedó viejo, se corrige acá mismo al cerrar la sesión.

---

## Dónde estamos

- **Lanzamiento: lunes 21 de septiembre de 2026**, Día del Estudiante, con
  campaña en Instagram a 4.213 seguidores. **La fecha no se mueve: se mueve el
  alcance.**
- Hoy es **4 de septiembre** y vamos **dos días adelantados**.
- La app ya está viva en `bolivar-con-vos.vercel.app`. Vercel publica solo con
  cada `push` a `main`.

### Dónde vive cada cosa (4/9)

Había cuatro lugares donde podía vivir «qué hacemos ahora», y ninguno mandaba
sobre los otros. Ahora mandan así, y no se abre un quinto:

| | Qué |
|---|---|
| **`BITACORA.md`** | **el ahora.** Única fuente. Se lee al arrancar y se corrige al cerrar |
| `LEEME.md` | cómo funciona cada cosa. Referencia, no se lee al arrancar |
| Memoria del proyecto | cómo se trabaja y qué no puede esta máquina |
| [Artifact del plan](https://claude.ai/code/artifact/25f7c752-e67f-465a-bf82-5913218cff95) | **congelado**, registro histórico. Ya no es el documento rector: quedó viejo cuando se rearmó el cronograma el 3/9 |

## Hecho y publicado

| Día | Qué | Commit |
|---|---|---|
| 2/9 | Cerradas las dos escrituras sin cuenta ni freno; azar fuerte en los códigos de respaldo; permisos de perfil corregidos; `TRUNCATE` revocado | `fa09983` |
| 3/9 | La alarma de inscripción sale de un dato (`alarma`/`periodo`) y no de un regex sobre el título | `07c3226` |
| 3/9 | La tipografía sube un punto y toda la app pasa por la escala `--letra-*` | `ef8737d` |
| 3/9 | Cinco pantallas dejan de bajar `lib/supabase.js` (212.718 → 6.357 bytes) | `6c91ada` |
| 3/9 | La app anota visitas, búsquedas y errores; solapa **Registro** en el panel | `6de2ac0` |
| 3/9 | El ícono de la app es el logo y no la «B» que inventaba Android; el service worker sube a `v5` para que los teléfonos ya instalados se enteren | `65968ac` |
| 3/9 | Inicio pinta los accesos y el kit de lo guardado mientras busca lo de ahora; sin red ya no se vacía la pantalla. Lo que lleva fecha sigue esperando a la red. `v6` | `0ad57f7` |
| 4/9 | Las cinco pantallas que faltaban guardan entre visitas: Info útil, Estudiemos, Anatomofisiología, ¿Quiénes somos? y El Consejo. `v7` | `38b6100` |
| 4/9 | Las materias que se rinden libres en Fonoaudiología, como listado de texto | `b95af25` |
| 4/9 | «Mi año» parte 1: la pregunta al entrar y la vista «Tu primer año» | `2a0f39f` |
| 4/9 | **El embudo del 21:** hitos (eligió carrera, marcó materia, instaló, volvió) y de qué link de Instagram vino cada visita. `v18` | (este commit) |

**Ojo con lo de las materias libres.** El listado sale de un documento que se
llama, textualmente, «**Propuesta** de materias libres … para agregar al régimen
de regularidad o anexar al plan de estudios». No está aprobado, y la app lo dice
con todas las letras. Si alguien confirma que se aprobó (o que no), hay que
cambiar `notaLibres` en `carrera/plan-fono.js`, que es el único lugar donde vive
ese texto.

Y quedó abierta una pregunta que vale para Trabajo Social: **qué significa el
asterisco (*)** que llevan diez materias en `plan.js`. Cuatro de las seis que TS
comparte con Fono están marcadas con asterisco Y figuran como libres en la
propuesta de Fono; las otras dos, no. O sea que apunta a lo mismo pero no
alcanza para afirmarlo. La pregunta para Alumnado es: «En el plan 2015, ¿qué
indica el asterisco de algunas materias cuatrimestrales? ¿Que se pueden rendir
libres?». Hasta que haya respuesta, la nota del asterisco se deja como está.

## El cronograma

Rearmado el 3/9 sobre la capacidad real: entre el jueves 3 y el viernes 4
entran 2 o 3 sesiones.

| Día | Qué | Espera algo de |
|---|---|---|
| jue 3 | ✅ Guardado entre visitas: el mecanismo y la pantalla Inicio | — |
| vie 4 · 1 | ✅ Guardado en las cinco pantallas que faltan | — |
| vie 4 · 2 | ✅ Materias libres de Fono, adelantado del mar 8. Y de paso apareció que `--letra-mini` llevaba un día apagada | — |
| vie 4 · 3 | ✅ **«Mi año» parte 1:** la pregunta al entrar y la vista «Tu primer año» | — |
| vie 4 · 4 | ✅ **El embudo del 21** y la bitácora como única fuente | — |
| vie 4 · 5 | ✅ **Contactos de las cátedras, parte 1:** la tabla, los 142 mails y la ficha de materia. Adelantado del lun 7 | — |
| sáb 5 | Cátedras parte 2: la pantalla con buscador y la solapa del panel | — |
| dom 6 | Se cierran las cuatro decisiones pendientes | Máximo |
| lun 7 | Buscador de cátedras | mails de las cátedras |
| mar 8 | Contactos en la página · **el código no espera nada**, se puede adelantar; lo que espera es el contenido | 3 contactos por carrera |
| mié 9 | Plan de estudios en PDF | los 3 PDFs |
| jue 10 – vie 11 | Horarios: completos (2 días) o cuadro oficial (medio día) | decisión del dom 6 |
| sáb 12 | Materiales como página web | PDFs de materiales |
| **dom 13** | **Congelamiento.** Última línea de función nueva | — |
| lun 14 – dom 20 | Contenido, pruebas y campaña. **Todo arriba el 20** | — |
| **lun 21** | **Lanzamiento** | — |

### Lo que este cronograma dejó a la vista

**El cuello de botella no es el código: es el contenido.** De las siete tareas
que quedan, cinco esperan material de Máximo, y en tres de ellas el material
llega **el mismo día** en que hay que construir con él (mails lun 7 → se
construye lun 7; PDFs mié 9 → se construye mié 9; PDFs de materiales vie 11 →
se construye sáb 12). Margen cero: si cualquiera de esas tres se corre un día,
la tarea se cae del otro lado del congelamiento.

**Lo que hay que hacer:** adelantar cada entrega dos días respecto del día en
que se construye. No cambia cuánto trabajo hay; cambia que una demora de un día
deje de costar una función entera.

## Decisiones ya tomadas — no volver a discutirlas

- **La facultad es aliada, no antagonista.** Nada del copy se apoya en «lo que
  la facultad no te dice».
- **El agujero de `respaldos` no era un agujero:** RLS sin políticas y funciones
  `SECURITY DEFINER` son el diseño a propósito (patrón de llave). Ya auditado
  entero; lo revisado y sano está anotado en `tabla-seguridad.sql` para no
  volver a auditarlo.
- **La base no frena nada.** No proponer optimizaciones de consultas ni de
  índices: el trabajo está del lado del navegador.
- **Una pantalla que necesita sesión usa `lib/supabase.js`.** El cliente chico
  no renueva el token y una sesión que no se renueva falla en silencio.
- **Nada de tiempo real ni de subir archivos en el cliente chico.**
- **`estilos.css` no se parte antes del congelamiento.** Son 162 KB y es lo más
  grande que queda, pero es texto: Vercel lo manda comprimido y desde la segunda
  visita sale del service worker. Partirlo es riesgo alto —ya pasó lo de
  `--letra-mini`— y ganancia baja. Después del 13 se puede discutir.
- **Lo que sí queda por bajar son las fuentes**, y es lo único del camino
  crítico que el service worker **no** guarda y que no se puede comprimir más
  (el woff2 ya viene comprimido). Se bajan cuatro familias y diez pesos, y el
  CSS usa cuatro: `700` (63 veces), `400` (11), `800` (1) y `500` (1).
  **Montserrat 600 se baja y no se usa en ningún lado.** Media sesión, riesgo
  casi cero, y pega justo en la llegada desde Instagram.

### Guardado entre visitas (3/9)

- **Va en la página, no en `sw.js`.** El service worker entrega la respuesta y
  la página no puede saber si vino de la red o de una caja: pintaría una fecha
  vieja como si fuera de ahora. Su regla de no guardar datos de Supabase **no
  se toca**.
- **Nunca se pinta de memoria lo que lleva fecha:** la alarma de inscripción,
  el renglón de lo próximo, el calendario y la pantalla Fechas. Esperan la red.
  `publicaciones` ni siquiera se guarda.
- **Una semana de vida** (`GUARDADO_VIDA` en `app.js`). Más viejo que eso se
  tira y la pantalla espera, como el primer día.
- **La pantalla Fechas queda afuera del guardado.** Su contenido *son* las
  fechas.
- **Nada que dependa de una sesión se guarda.** En una computadora de la
  facultad se lo lleva quien entra después.

### Cómo quedó, con las cinco pantallas (4/9)

- **De memoria sale el qué; el cuándo espera a la red.** Es la regla de arriba
  dicha para adentro de una pantalla. En Anatomofisiología se guarda el
  programa —qué entra en cada módulo, qué leer, cómo se aprueba— y **no se
  guarda ninguna fecha**: ni «las fechas que no hay que perderse» ni el cuándo
  se dicta cada módulo. Los campos se sacan **antes de guardar**, no al pintar,
  así lo viejo ni siquiera está para mostrarse por error.
- **Info útil se guarda sin filtrar por sección.** Las tres puertas —todo, «Mi
  carrera», «Mis derechos»— son la misma consulta: comparten una entrada, y
  entrar por una deja servidas a las otras dos.
- **Los `plazo` de los trámites se revisaron uno por uno** antes de guardarlos:
  son duraciones y ventanas que se repiten («tarda 20 a 25 días hábiles»,
  «la inscripción va de noviembre a marzo»), no vencimientos de este mes.
- **¿Quiénes somos? y El Consejo ahora avisan.** Ya tenían un texto de
  emergencia escrito en el archivo, pero **se caían en silencio**: nadie sabía
  que estaba viendo otra cosa. Ahora es lo guardado primero, el respaldo recién
  si nunca se vio la página de verdad, y siempre con el renglón que lo dice.
- **Si la red contesta que ya no hay nada, se olvida** (`olvidarMemoria`). Una
  materia despublicada o una lista vaciada es una respuesta, y es la más nueva
  que tenemos: sin esto seguiría en pantalla para siempre.
- **Los favoritos (`guardados`) no entran**, por la regla de la sesión.
- **«Mi año» quedó afuera a propósito:** lo suyo es sesión (`preparaciones`) y
  fechas (`publicaciones`), y además se reescribe en la sesión siguiente.

### «Mi año»: ingresante o avanzado (3/9)

- Se pregunta **al entrar a Mi año la primera vez, junto con la carrera**. Un
  solo momento, dos preguntas.
- El ingresante ve una **vista propia, «Tu primer año»**, en lugar de «Mi
  cursada», con la pestaña **Finales oculta** hasta que tenga una cursada
  aprobada. Mapa y Plan completo quedan.
- **Se esconde el 0%:** una barra vacía y «0 de 31» recibe con un cero a quien
  todavía no empezó.
- Los textos van **escritos en el archivo**, como el Kit de ingreso. Nada de
  tabla nueva: el congelamiento es el domingo 13.
- **Nunca se borra ni se esconde lo ya marcado.** Cambia lo que se muestra
  arriba, no lo guardado.

**Tres cosas que se decidieron construyéndolo (4/9), y conviene no deshacer:**

- **A quien ya venía usando la app no se le pregunta nada.** Si tiene materias
  marcadas, la respuesta ya la sabemos: se deduce `avanzado` y listo.
  Preguntarle sería hacerle repetir algo que su propio uso contesta.
- **La vista de ingresante se apaga sola** en cuanto marca su primera materia.
  A partir de ahí «Mi cursada» dice la verdad y «Tu primer año» sería un cartel
  viejo. `guardado.momento` **no** se toca: cambia lo que se muestra.
- **«Con qué empezás» muestra todo lo que no pide correlativas**, no solo primer
  año. En Fono eso suma una materia de segundo. La tarjeta dice «2° año», así
  que no engaña, y filtrarla sería que la app decida por la persona.

### El embudo del 21 (4/9)

Hasta hoy la app contestaba «cuánta gente entró» y nada más. El 21 la pregunta
es otra: **de los que entraron, ¿a cuántos les sirvió?**

- **No se rompe la regla de privacidad.** Sigue sin haber columna de usuario, así
  que esto **no es un recorrido**: no se puede decir «de estas 1.000 personas,
  300 marcaron materia». Se cuenta cada hito por separado y se divide. **La
  proporción es la métrica**, y ninguna fila sabe de quién es.
- **Cuatro hitos:** `eligió carrera`, `marcó materia`, `instaló`, `volvió
  instalada`. Van en la misma tabla `sucesos`, con tipo nuevo `hito` y el
  nombre en `detalle`.
- **Uno por visita y por nombre.** Quien marca treinta materias cuenta una vez:
  el número que buscamos es cuánta gente llegó hasta ahí, no cuánto usó el que
  ya llegó.
- **`volvió instalada` es la única señal de retorno posible** sin unir dos
  visitas. Alguien que abre en modo instalado, volvió. Por eso vale doble.
- **`instaló` sale del evento `appinstalled`, no de «tocó el botón».** Entre una
  cosa y la otra está el cartel del sistema, que mucha gente cancela. En iOS ese
  evento no existe, así que ahí la instalación se ve por `volvió instalada`.
- **La atribución viaja en el `detalle` de la visita** (`?de=historia-carreras`).
  Es un dato del **link**, no de la persona: no hace falta fila ni tipo nuevo. Se
  limpia a mano antes de mandarla —solo letras, números y guiones, 40 caracteres—
  porque va derecho a la base.
- **Los dos caminos a «marcó materia» están enganchados**, el de a una materia y
  el del diálogo de bienvenida. Si faltara el segundo, el camino más usado sería
  justo el que no se cuenta.

**Ojo: los hitos no entran hasta que se corra el SQL.** La restricción de la
tabla todavía solo acepta `visita`, `error` y `busqueda`; hasta que Máximo corra
`tabla-registro.sql` de nuevo, cada hito se rechaza en la base. No rompe nada
—el registro nunca rompe la pantalla— pero no se anota.

### Los contactos de las cátedras (4/9)

- **Se atan por código de materia, no por nombre.** Los mails vinieron
  abreviados —«Epis», «Intro a la psico», «Inves I»— y el plan los tiene
  completos. Por `materia_cod` enganchan los 75; por nombre no enganchaba ni la
  mitad.
- **Una materia compartida son dos filas**, una por carrera. Salud Colectiva
  (253) la cursan Trabajo Social y Fono, con la misma cátedra. Dos filas para
  que la pantalla filtre por carrera sin pensar, y para que el día que una
  carrera cambie de cátedra no haya que desarmar nada.
- **Se bajan todas de una y se guardan entre visitas.** Son 30 filas y ~5 KB en
  Trabajo Social. Pedirlas de a una sería una consulta cada vez que alguien abre
  una ficha. Y un mail de cátedra **no lleva fecha**, así que mostrar el de la
  semana pasada no miente: vale la regla de siempre, de memoria sale el qué.
- **Un contacto que rebota es peor que no tener contacto.** Las tres que no
  tienen mail usable entraron con `publicado = false`: están anotadas para el
  panel y no se muestran en la app.
- **No hace falta subir el service worker:** solo cambió `carrera/index.html`,
  que se sirve red primero.

**Cargado: 75 cátedras publicadas y 142 mails.** 30 de Trabajo Social, 33 de
Fono y 12 de TGCR.

**Lo que quedó afuera:** el **Profesorado en Trabajo Social** no existe como
carrera en la app, así que sus ocho mails no tienen dónde ir. Y el
**«Taller de metodología»** de Fono vino como de 3° año, pero en el plan el II
es de 4° y el de 3° es el Taller I (833). Sin mail, así que no urge.

### El «Kit de Inicio» del cronograma quedó viejo (4/9)

La tarea del sáb 5 decía «Mi año: el Kit de Inicio». Se escribió el 3/9, cuando
«Tu primer año» iba a ser un modo aparte para el ingresante. El commit `d57a177`
lo mató a propósito el 4/9: dejaba de aplicarse apenas marcabas tu primera
materia. **Ese Kit ya no tiene dónde ir.**

Lo que sí existe es el **Kit de ingreso de la portada**, y tiene un agujero
real: la tarjeta «Glosario universitario» promete «qué es una cursada, un final,
una promoción, una correlativa» y lleva a `quienes/`, que es la página de la
agrupación. **La palabra «glosario» aparece una sola vez en todo el código: en
la tarjeta que lo promete.** Es una promesa incumplida en la portada, dirigida
justo al ingresante que es el público del 21. Escribir ese glosario es trabajo
pendiente y sin fecha asignada.

## Decisiones pendientes — se cierran el domingo 6

1. **¿Quién actualiza los horarios en marzo?** Si hay nombre y apellido, se
   construyen completos (2 días). Si no, sale el cuadro oficial de la facultad
   (medio día) y no puede mentir.
2. **¿Qué muestra la portada el 21?** Ese día la alarma no va a estar: la
   inscripción de septiembre cierra el 10 y la siguiente abre el 9 de noviembre.
3. **¿Fechas conserva el tiempo real?** Si se cambia por «se refresca al
   volver», esa pantalla baja 212 KB. Es sacar una función: no se toca sin que
   Máximo lo diga.
4. **El texto de la pestaña «Plan completo»**, que no entra y se recorta.

## Lo que depende de Máximo

| Qué | Para cuándo |
|---|---|
| **Correr `tabla-registro.sql` de nuevo** en el SQL Editor. Sin esto los hitos se rechazan y el 21 no hay embudo | **cuanto antes** |
| **Etiquetar los links de Instagram** con `?de=`: `bolivar-con-vos.vercel.app/?de=historia-carreras`. Un nombre distinto por publicación, en minúscula y con guiones. Sin etiqueta la visita se cuenta igual, pero no se sabe de dónde vino | antes del 21 |
| Mirar la solapa **Registro** y el campo **«¿Alimenta la alarma?»** en el panel | cuanto antes |
| Prender *Leaked password protection* en supabase.com → Authentication | cuanto antes |
| **Confirmar un mail que no puede existir:** el de «Promoción y prevención en audiología» vino con tildes (`promoción…`) y la parte local de una dirección de Gmail no las acepta. Hasta que se confirme, esa cátedra no muestra contacto | cuanto antes |
| ~~Los mails de las cátedras~~ | ✅ entregados el 4/9 |
| ~~Los tres PDFs del plan de estudios~~ | ✅ entregados el 4/9. Ojo: pesan 1,8 MB y 3,6 MB; hay que decidir si se publican enteros o el plan se muestra como página |
| Los PDFs de los materiales de estudio | vie 11 |
| Tres contactos por carrera para Avisanos | mié 16 |

## Cómo se trabaja

- **Una variable de CSS no está bien porque esté escrita en el archivo: está
  bien si el navegador la resuelve.** El 4/9 se descubrió que `--letra-mini`
  llevaba un día sin existir en la app, aunque el archivo la tenía: un comentario
  mal cerrado en el commit de tipografía hacía que el parser descartara esa
  declaración y solo esa. Catorce lugares quedaron heredando el tamaño de al
  lado. **No se detecta leyendo el archivo ni contando líneas: se detecta
  midiendo.** Con una sonda alcanza:
  `s=document.createElement('span'); s.style.fontSize='var(--letra-mini)'`
  puesta en la raíz — si mide 16px, la variable no existe.
- **Una sesión, un objetivo, un commit.** El objetivo se dice antes de empezar.
- **Nada de «revisá toda la app» en una sesión corta.** Las auditorías amplias
  son lo más caro que existe.
- **Archivos grandes, por partes.** `estilos.css` 143 KB, `index.html` 54 KB,
  `LEEME.md` 50 KB, `panel/index.html` 109 KB. Nunca enteros: por selector o por
  pantalla.
- **Se publica con `git push`**, y va derecho a `main` porque es lo que Vercel
  mira. Antes de pushear, comprobar que sea un avance limpio.
- **Se publica sin preguntar** (decidido el 3/9): no hace falta pedir permiso
  para cada push. Pero **se publica lo que se probó corriendo, no lo que se
  leyó**. Acá no hay Node ni pruebas automáticas: la única red es levantar el
  servidor de `HttpListener`, abrir la pantalla y mirar consola y
  comportamiento. Lo que no se pueda verificar así se comitea, se avisa y **no
  se sube**. Pesa por lo de acá abajo: quien ya tiene la app se lleva la versión
  vieja en la primera carga, así que un error publicado no se arregla al
  instante ni revirtiéndolo enseguida.
- **Ojo el día del lanzamiento:** el service worker sirve la versión guardada en
  la primera carga y la nueva recién en la segunda. **Todo tiene que estar
  arriba el 20, no el 21.**
- Las limitaciones de esta máquina (sin Node, heredocs que se rompen, servidor
  de prueba con `HttpListener`, el panel de vista previa que no corre
  `requestAnimationFrame`) están en la memoria del proyecto, no acá.
