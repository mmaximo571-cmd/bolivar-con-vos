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
- Hoy es **3 de septiembre** y vamos **dos días adelantados**.
- La app ya está viva en `bolivar-con-vos.vercel.app`. Vercel publica solo con
  cada `push` a `main`.
- Plan completo (documento rector):
  https://claude.ai/code/artifact/25f7c752-e67f-465a-bf82-5913218cff95

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
| 4/9 | Las cinco pantallas que faltaban guardan entre visitas: Info útil, Estudiemos, Anatomofisiología, ¿Quiénes somos? y El Consejo. `v7` | (este commit) |

## El cronograma

Rearmado el 3/9 sobre la capacidad real: entre el jueves 3 y el viernes 4
entran 2 o 3 sesiones.

| Día | Qué | Espera algo de |
|---|---|---|
| jue 3 | ✅ Guardado entre visitas: el mecanismo y la pantalla Inicio | — |
| vie 4 · 1 | ✅ Guardado en las cinco pantallas que faltan | — |
| vie 4 · 2 | **«Mi año» ingresante:** la vista «Tu primer año» | **5 respuestas** |
| sáb 5 | «Mi año»: el Kit de Inicio y el pulido | ídem |
| dom 6 | Se cierran las cuatro decisiones pendientes | Máximo |
| lun 7 | Buscador de cátedras | mails de las cátedras |
| mar 8 | Contactos en la página + materias libres de Fono | 3 contactos por carrera |
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
| Mirar la solapa **Registro** y el campo **«¿Alimenta la alarma?»** en el panel | cuanto antes |
| Prender *Leaked password protection* en supabase.com → Authentication | cuanto antes |
| Los mails de las cátedras | lun 7 |
| Los tres PDFs del plan de estudios (TS, TGCR, Fono) | mié 9 |
| Los PDFs de los materiales de estudio | vie 11 |
| Tres contactos por carrera para Avisanos | mié 16 |

## Cómo se trabaja

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
