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
- **El esquema de trabajo del 14 al 21 se fijó el 13/9 a la noche** y está en
  el cronograma, abajo: congelamiento el **jueves 17 a la noche**, unas 15
  sesiones de código, cada una con su objetivo. **Esa tabla manda sobre lo que
  diga cualquier otro renglón de esta sección.**
- **Los tres días que quedan se reordenaron el 17/9 a la noche**, y el
  cronograma de abajo ya está reescrito: el **viernes 18 es todo prueba en
  teléfono real y no entra código nuevo**, la lista de posteos se corre al
  **sábado 19**, el domingo 20 es una sola sesión corta y el lunes no entra
  nada. **Si el mapa de riesgo falla en el teléfono, se esconde y se lanza sin
  él**: ya está decidido, no se discute el viernes. Ver el cuadro y las notas
  que lo siguen.
- **Jueves 17: del lun 14 al mié 16 no entró nada.** Hoy se congela igual, y
  lo que no entre hoy se recorta. El recorte y el prompt corto para abrir cada
  sesión están en `PROMPT-SESION.md`: pasan a después del 21 las solapas 2, 3
  y 4 de la Fonoteca y el rastreo del Trayecto; quedan el aviso de Mi año (si
  llegan los plazos) y las fichas que tengan texto.
- **Jueves 17, después del congelamiento: entró el mapa de riesgo** (`mapa/`),
  por decisión de Máximo («entra el 21»). No estaba en el cronograma ni es
  «Prácticas y territorio», que sigue para después del 21: es una herramienta
  sola, para el mapeo participativo en La Plata, Berisso y Ensenada. Está
  publicado, con la tabla aplicada en Supabase, y **falta probarlo en un
  teléfono** (va con las pruebas del vie 18). Después se le sumaron **cinco
  capas de base** (GeoJSON), que ya andan pero **esperan los archivos**.
  Detalle en «Hecho y publicado».
- El domingo 13 decía: hoy es **domingo 13 de septiembre**. Quedan **ocho días** para el
  lanzamiento y **cuatro de código**. Lo último que entró a la app fue del **7/9** (calendario del
  celular, buscador y mapa); el 8 solo se escribieron papeles —el buzón
  `entrada/` y `PROMPT-FICHAS.md`— y del **9 al 12 no se trabajó** porque
  Máximo viajaba. Todo lo que hay está pusheado a `main`.
- Las cuatro decisiones de septiembre **siguen cerradas**: están contestadas y
  hechas.
- **El 7 entraron tres cosas que no estaban en el cronograma**, y no son
  invento: salieron de mirar la versión que Máximo armó en AI Studio
  (`Desktop/MÁXIMO/bolivar-con-vos 2.0`, React + Tailwind, 9.000 líneas). De
  ahí se tomaron **ideas, no código**: pasar una fecha al calendario, que el
  buscador mire toda la app, y que el mapa diga qué pide y qué abre cada
  materia. Lo que **no** se tomó y por qué está anotado abajo, en «Decisiones
  ya tomadas».
- **Máximo viaja del miércoles 9 al sábado 12**, a otra provincia. Eso ya no
  aprieta: del mar 8 al sáb 12 no queda ninguna tarea que lo necesite. Lo único
  que todavía espera material suyo son los **tres contactos por carrera** de
  Avisanos, y ese contenido puede entrar hasta el 20.
- El sábado 5 se usó para las fichas de estudio, y con eso **el sábado 12
  quedó hecho una semana antes**.
- **Al cerrar el domingo 6, el cronograma de acá al congelamiento del 13 está
  vacío.** El mar 8, el mié 9 y el jue 10 – vie 11 quedaron todos adelantados:
  los contactos, el plan que se imprime en vez de publicarse en PDF, y el
  glosario. **La última función del cronograma entró el 6, siete días antes del
  congelamiento.** Del 7 al 13 no queda ninguna tarea asignada.
- **El 8/9 esto cambió: sí se sigue construyendo.** El congelamiento se corrió
  al miércoles 16 o jueves 17 porque faltan herramientas por hacer. Lo que se
  achica es la ventana de pruebas: de ocho días pasa a tres o cuatro. Ver el
  cronograma.
- **Y quedó un agujero: esas «herramientas nuevas» no están escritas en ningún
  lado.** El cronograma reserva del 13 al 17 para hacerlas, pero no dice
  cuáles son ni en qué orden. Con tres o cuatro días de código, la lista es
  lo primero que hay que fijar: sin lista, cada sesión la reinventa. Se
  escribe acá, no en el chat.
- **Lo que sigue no es construir, es probar.** Con siete días libres antes del
  13 y una semana más de contenido y campaña, lo que falta es lo que nunca se
  pudo verificar acá: todo lo que depende del service worker —caché, andar sin
  señal, que Chrome ofrezca instalar— se prueba en producción, con el teléfono
  en la mano y con la app entrando por el navegador de Instagram, que es el
  navegador real de esta app. Eso no lo puede hacer nadie desde esta máquina.
- La app ya está viva en `bolivar-con-vos.vercel.app`. Vercel publica solo con
  cada `push` a `main`.

### Dónde vive cada cosa (4/9)

Había cuatro lugares donde podía vivir «qué hacemos ahora», y ninguno mandaba
sobre los otros. Ahora mandan así, y no se abre un quinto:

| | Qué |
|---|---|
| **`BITACORA.md`** | **el ahora.** Única fuente. Se lee al arrancar y se corrige al cerrar |
| `LEEME.md` | cómo funciona cada cosa. Referencia, no se lee al arrancar |
| `PROMPT-DISENO.md` | el molde para pedirle pantallas a Gemini y que salgan en HTML de esta app, no en React |
| `PROMPT-FICHAS.md` | el molde de una ficha de estudio: NotebookLM ordena el contenido, Claude Design lo dibuja, y **nunca al revés** |
| `PROMPT-TRAYECTO.md` | **el contenido de una pantalla sola** (13/9): las seis preguntas que el Trayecto Optativo tiene que contestar, y las cinco que todavía son `[FALTA]`. Se usa junto con `PROMPT-DISENO.md`, no en lugar de él |
| `PROMPT-FONOTECA.md` | **la Fonoteca** (13/9): el simulador de práctica audiológica. Las cuatro solapas con lo que depende cada una, y la regla que manda: **nada se publica sin el visto de la profesional**. Como la solapa 1 ya está escrita, el Paso 1 **no es para armarla sino para rediseñarla**, y el Paso 2 es la planilla que se le manda a ella. Va junto con `PROMPT-DISENO.md` |
| `entrada/` | **el buzón** (8/9). Lo que se trae de AI Studio o de donde sea se deja acá y se vacía en una sola sesión. No decide nada: es material de trabajo, no se sube |
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
| 4/9 | **El embudo del 21:** hitos (eligió carrera, marcó materia, instaló, volvió) y de qué link de Instagram vino cada visita. `v18` | `bc97ed6` |
| 5/9 | **Las ocho fichas de estudio del Equipo de Fonoaudiología**, en `estudiemos/fichas/`. Sin `v` nueva: son pantallas (van por red primero) y un archivo nuevo | `841c836` |
| 5/9 | La novena ficha, **el oído**, y los dos sellos del pie. El de Conducción va en vector | `a07cd8f` |
| 5/9 | **Los siete trípticos originales en PDF** (33 MB), en `estudiemos/tripticos/`. Van en el repo y no en un bucket de Supabase porque el MCP no sube archivos a storage. Si el repo pesa, mudarlos es cambiar la ruta en un lugar | `be80b2e` |
| 5/9 | **Estudiemos rediseñado:** buscador arriba, tres herramientas en superficie, y el amarillo una sola vez abajo en la invitación a compartir. `v19` | `db57993` |
| 5/9 | `PROMPT-DISENO.md`: el molde para que lo que salga de Gemini entre sin traducir | `2a3e0a1` |
| 5/9 | **La carga rota de cada publicación.** El registro mostró «memoriaDe is not defined» en la portada: HTML nuevo con `app.js` viejo. Ahora recarga una sola vez cuando entra la versión nueva. `v20` | `4f1c0dd` |
| 5/9 | **Borrar mi cuenta**, y la nota de qué se guarda / quién lo ve / cómo se borra en la pantalla de registro. `tabla-borrar-cuenta.sql` **ya está aplicado** en Supabase | `c9a2f41` |
| 5/9 | El renglón de «lo próximo» elegía lo más viejo y lo llamaba «Hoy». El 21 iba a tapar «Día del estudiante» con un período de tres meses | `e4b1f7c` |
| 5/9 | La portada, una vez por día, y botón **Crear mi cuenta** en la bienvenida | `8d3a12b` |
| 5/9 | El calendario, con nombre y flechas para quien no lo ve | `7c40e93` |
| 5/9 | **Las secciones se van abajo y son cuatro** (Inicio · Mi año · Estudiemos · Mi perfil). El calendario y el carrusel bajan al final. `v21` | `cca4d84` |
| 6/9 | **La portada pregunta en vez de invitar:** «¿Qué estás estudiando?» con las tres carreras, y después «¿Querés cargar tu trayectoria académica?». Se contesta ahí mismo; la carrera elegida se guarda en la llave de «Mi año», así que al entrar ya no se le vuelve a preguntar. Quien ya cargó su cursada sigue viendo la barra. `v23` | `8c7e407` |
| 6/9 | La bajada de la bienvenida deja de ser solo identidad: cada oración es uno de los tres botones —entrar, y armar la cuenta—. **No promete que la cuenta dé acceso a nada**, porque no lo da: `mi/` dice dos veces que la app anda entera sin cuenta. Sin `v` nueva: es solo `index.html`, que va por red primero | `c149000` |
| 6/9 | La pestaña dice **«Plan»** y deja de recortarse. Queda un píxel de margen en 320 px, y ahora la palabra más ancha de la fila es «FINALES» | `735d552` |
| 6/9 | **Fechas deja el tiempo real y baja 206 KB.** Pasa al cliente chico y se refresca al volver a la pantalla, con freno de 15 s. El JS de esa pantalla: 287 KB → 79 | `df2ea22` |
| 6/9 | **«Contacto de las cátedras» lleva a `/catedras/`** y no al PDF de Drive. Atrás vino la regla que faltaba: una ficha cuyo enlace no empieza con `http://` es una pantalla de la app y se abre adentro, sin pestaña nueva y con «→». El cartel del cuadrado dice **«En la app»** | `f7ef158` |
| 6/9 | **Los contactos de Avisanos, cargados** (7 nuevos). Y con eso aparecieron dos cosas rotas: el único contacto real que había estaba sin código de país, así que `wa.me` contestaba «número no válido» y el traspaso terminaba en un error; y el chat decía «SITIO OFICIAL» encima de preguntas frecuentes y de fichas que llevan adentro de la app | `467117d` |
| 6/9 | **El plan de estudios se imprime, y el PDF de 3,6 MB no se publica.** La pestaña «Plan» ya decía lo mismo que el archivo de la facultad y viaja con la app sin internet. Ahora esa vista se imprime con encabezado propio, sale aunque estés parado en otra pestaña, y en modo oscuro la hoja igual sale blanca. El cuadro del navegador ofrece «Guardar como PDF», así que de ahí salen el papel y el archivo. `v27` | `dbe9fcf` |
| 6/9 | **El botón de imprimir estaba al final del plan, o sea en ninguna parte.** Quedaba debajo de las cuarenta y dos materias, de las que se rinden libres y de la nota del asterisco: a cinco pantallas de scroll de donde se abre la pestaña. Máximo no lo encontró. Ahora abre la pestaña «Plan», arriba de PRIMER AÑO: a 350 px del principio contra los ~6.000 de antes. `v28` | `0992a25` |
| 6/9 | **Existe el glosario**, y la tarjeta de la portada deja de mentir. Once palabras que escribió Máximo, en tres grupos, con la respuesta corta en una línea y el detalle abajo. Cinco llevan a donde se hace la cosa. El texto va en el HTML y no en Supabase: es el reglamento, y así se lee sin señal. **Era la última función del cronograma.** `v29` | `19fba30` |
| 6/9 | Los turnos de examen **son nueve, faltaba noviembre.** Y ahora lo dice con el número adelante, para que a la próxima se note. Sin `v`: es solo la pantalla | `1e7f1ba` |
| 6/9 | **El glosario tenía una sola puerta.** Se llegaba únicamente por la tarjeta del kit de la portada, y volvía a «Info útil», que no llevaba para allá: una salida a un lugar sin entrada. Ahora está en el índice del pie —las doce pantallas— y con una puerta al final de Info útil. `v30` | `fe4c3b8` |
| 7/9 | **Una fecha se pasa al calendario del celular.** La app avisaba cuándo abría la inscripción a una mesa, pero avisar sirve solo si estás mirando la app ese día; ahora queda anotada en el teléfono y suena sola dos días antes. Dos caminos y no uno: el enlace de Google es una dirección web común y anda adentro del navegador de Instagram, el `.ics` queda para el iPhone y la compu. En el detalle de cada publicación que todavía viene, y abajo del calendario un botón que se baja todas las que faltan. `v32` | `3c40f05` |
| 7/9 | **El buscador miraba dos cosas de seis.** «Mesa de septiembre», «promoción» y «anatomo» daban SIN RESULTADOS y las tres estaban cargadas. Ahora mira trámites, preguntas, fechas, glosario, pantallas y cátedras. Cinco no cuestan un byte de más; las cátedras salen a la red recién cuando alguien escribe la segunda letra. Y los resultados llevan al lugar exacto: el glosario tiene una dirección por palabra (`#promocion`) y Cátedras acepta `?q=` | `82730c8` |
| 7/9 | **El mapa dibujaba las flechas pero no contestaba la pregunta.** Con cuarenta materias, seguir una flecha con el ojo es adivinar, y el resaltado que había era solo al pasar el mouse: en el celular no existía. Ahora se marcan los nodos con dos anillos —entero lo que pide, punteado lo que abre— y se marca al TOCAR, sin sacarle a la ficha su lugar. Arriba dice cuántas son de cada una. **No se apaga nada**: bajar a opacidad las materias sin relación deja el mapa ilegible. `v32` | `619892f` |

| 13/9 | **Dos datos que faltaban, publicados.** «Agrupación Gustavo **Legardón**» lleva tilde —confirmado, era un carácter en el glosario— y **Aulas Web** ya está en el índice del pie de las doce pantallas: `aulaswebgrado.ead.unlp.edu.ar`. Los sistemas de la UNLP pasan a cuatro. **`v33`**, por el mismo motivo que el `v30` del glosario: el pie lo dibuja `app.js`, que es armazón, y sin subir el número quien ya tiene la app sigue viendo tres sistemas | `HEAD` |

| 13/9 | **Las pruebas dejan de contarse como visitas.** `anotar()` no distinguía esta máquina de producción, y de la visita se guarda solo el `pathname` —a propósito, para no poder seguir a nadie—, así que una carga de prueba quedaba en la misma tabla que alguien entrando de Instagram y **no había forma de separarlas después**. Con el 18 al 20 dedicados a probar, eso ensuciaba justo el número del 21. El freno es una lista de lo que NO cuenta (localhost, la IP de casa, un archivo abierto a mano) y no de lo que sí: al revés, el día que la app se mude a un dominio propio el registro se apagaría en silencio. **Sin `v` nueva a propósito:** el `app.js` viejo cuenta las visitas bien —son visitas reales—, y el freno solo hace falta donde se prueba, que siempre carga fresco | `HEAD` |

| 13/9 | **El Trayecto Optativo tiene pantalla.** `trayecto/`, dibujada en Claude Design: siete preguntas con la respuesta corta arriba, una cuenta de las 120 horas por área que queda guardada en el teléfono, las cuatro reglas, las cuatro dudas que todavía no tenemos confirmadas y a quién preguntar. Tres puertas: Info útil, el índice del pie y **el casillero del plan en «Mi año»**. El texto va en el HTML, como el glosario. **Una diferencia con el diseño:** las preguntas iban plegadas y acá van abiertas. El conteo de materias del progreso no se tocó: sigue siendo la deuda postergada. `v34` | `HEAD` |

| 13/9 | **La carrera se elige una vez y la app entera la sigue.** Pedido de Máximo sobre un documento de AI Studio; de ahí se tomó la idea y no el código (era React). Casi todo ya existía —la llave `bolivar-carrera-v2` con cada carrera por separado, y las consultas filtradas—; lo nuevo es **«Elegí tu carrera» en el menú ☰ de las doce pantallas** y **una fila de tres botones en el inicio**. Al cambiarla se acomodan solos: los **tres primeros accesos** del inicio (TS: Trayecto y Cátedras; Fono: Anatomofisiología y Fichas; Tecnicatura: Cátedras y Estudiemos **hasta que tenga herramientas propias**, que Máximo quiere sumar estos días), la barra de progreso, Mi año, Cátedras, el orden de Estudiemos y de las fichas, y el chat deja de preguntarla. Quien no contestó ve TS y se le sigue preguntando. `materiales` está **vacía** en Supabase: el orden de Estudiemos está escrito pero no se vio con datos. `v35` | `5645b2b` |

| 13/9 | **La Fonoteca existe, con los casos escondidos.** Solapa 1 —audiometría tonal y PTP— en `estudiemos/fonoteca/`, armada sin Claude Design (lo decidió Máximo): historia clínica, el audiograma en SVG con los símbolos del molde, el diagnóstico por oído y **una devolución que dice por qué**, con el PTP, la ósea y el GAP en números. Los seis casos llevan `aprobado:false` y **no se ven**; la profesional los mira en **`/estudiemos/fonoteca/?revision`**, con el diagnóstico escrito y un chequeo automático (los seis coinciden). La cuarta tarjeta de Estudiemos está escrita y con `hidden`. Estilos adentro de la página: **sin `v` nueva**. Falta el **generador de tonos** | `9ee3206` |
| 13/9 | **La Fonoteca, rediseñada con lo que salió de Claude Design.** Máximo bajó el `.dc.html` y de ahí entraron cuatro cosas, traducidas al idioma de la app: **los filtros del gráfico** —los dos oídos / sólo derecho / sólo izquierdo, y la vía ósea a la vista u oculta—, que es lo que permite leer cuarenta símbolos encimados y **no cambian ningún dato**; el **PTP en grande**, con el promedio de la ósea al lado, porque es el número del que sale el grado; **cada oído como tarjeta con su canto de color** y las opciones en dos columnas, que antes eran cuatro filas de botones y se sentía un formulario; y los símbolos de cada oído **escritos con palabras** para quien no distingue rojo de azul. Del diseño **no se tomó el código**: llegó como bundle de 928 KB con las fuentes adentro y `<x-dc>`. Sin `v` nueva: es solo la pantalla | `HEAD` |

| 13/9 | **Los errores hablan en castellano.** Revisión de textos con `/design:ux-copy`. Sin señal, las pantallas mostraban «No se pudo conectar con la base. Failed to fetch», y el respaldo, la contraseña y el borrado de cuenta pasaban el mensaje de Supabase tal cual. Ahora `explicarError()` en `app.js` distingue cuatro casos —sin señal, sesión vencida, servidor 5xx, cualquier otro— y dice qué hacer; el detalle técnico se muestra en chiquito solo cuando no lo reconoce, porque dentro de Instagram no hay consola y la captura es lo único que nos llega. «No se pudo cargar los trámites» pasa a «No pudimos…», y «avisale al equipo» ahora es un enlace: «contanos por Instagram». El `panel/` no se tocó: es del equipo y ahí el mensaje crudo sirve. **`v36`**: `mi/` y `carrera/` llaman a `errorEnCastellano` justo cuando algo falla, y con el `app.js` viejo eso tira ReferenceError en vez de avisar. Probado en local con la red cortada a mano: el login sin señal muestra el texto nuevo | `HEAD` |

| 13/9 | **Las herramientas de Estudiemos pasan a ser un riel que se desliza**, con una tarjeta y media a la vista y el contador «01/03» a la derecha del título. El asomo de la siguiente **no es estética: es lo único que avisa que hay más**. A cambio de deslizar, cada tarjeta dice más: **la cinta de datos** de abajo, en monoespaciada, con cuánto hay adentro y **cuánto de eso es de tu carrera** —«9 fichas · 8 de la tuya» si sos de Fono, «1 de la tuya» si sos de TS—. Ese dato existía (8 fichas son de Fonoaudiología y 1 de Trabajo Social) y no lo decía ninguna pantalla. **A Gestión del Riesgo no se le escribe «ninguna de la tuya»**: se le muestra el reparto. La insignia dejó de estar posicionada por afuera —el riel tiene `overflow-x` y la recortaba— y pasó al primer renglón. Medido: el segundo renglón de la cinta da 8,3 de contraste y la flecha subió de 2,81 a 3,91. `v37` | `HEAD` |

| 13/9 | **Estudiemos se mueve como una landing**, con el lenguaje de movimiento de una referencia (getanchor.co) y **sin GSAP**: son 70 KB y el navegador del lanzamiento es el de Instagram. Entra el titular desde su máscara, después la bajada y el buscador, y al final las tarjetas del riel. El riel suma **flechas** (apagadas en los extremos), **flechas del teclado** y **arrastre con mouse**, con un viaje de 0,6 s propio, porque el suave del navegador no deja elegir la curva. El material entra al llegar **una sola vez**, y lo que ya entró no vuelve a entrar al filtrar (se reconoce por contenido, no por nodo). Las palabras de «Sumá tu granito de arena» se encienden al bajar. **Rompe a sabiendas la regla de 300 ms**, solo en esta pantalla y solo para entradas, no para interfaz: si en un celular se siente lento, se baja `--mov-destacada`. **No se hizo**: marquee de logos, tarjetas dispersas, mockup en perspectiva ni cabecera que se achica, porque la pantalla no tiene logos, ni collage, ni dispositivo, y la cabecera no es fija. `v38` | `HEAD` |

| 13/9 | **El movimiento se lleva a Inicio y a Fichas**, y sale de Estudiemos a un archivo compartido, **`movimiento.js`** (entra al armazón): `entrarAlLlegar` y `encenderAlBajar`. La entrada al abrir es CSS puro con `data-entra` y `.mov-renglon`. En Inicio, **el grito de la bienvenida entra de a un renglón** y el logo se asienta al final; lo de la zona de fondo entra al llegar **con `soloAbajo`**: lo que se ve al abrir no espera, porque los accesos están escritos a mano justo para verse desde el primer cuadro. En Fichas, el título y la bajada entran, y las fichas de más abajo aparecen al llegar. **Las tres pantallas llaman con `typeof` delante**: con un armazón viejo siguen andando, quietas. `v39` | `HEAD` |

| 13/9 | **Revisión de animaciones de Estudiemos** con `/review-animations` (skills de Emil Kowalski). La regla de los 0,8 s sigue valiendo **solo para el titular**: el buscador, las herramientas y el riel son interfaz. **El buscador ya no entra con movimiento**: estaba invisible 0,33 s y se asentaba pasado el segundo. **Las herramientas** se asientan en 0,35 s con 0,15 s de espera y 40 ms entre tarjetas (antes, la última llegaba a los ~1,5 s). **El hover de la tarjeta, solo con mouse**: en el celular quedaba pegado al volver atrás. **El riel viaja en 0,26 s** y no en 0,6, con la curva quint que sí se parece a la de entrada (el comentario decía power3). **La flecha del riel** se aprieta a `.96` con `--t-toque`/`--sale`. **Lo que entra al llegar** sube 12 px en 0,35 s, con 40 ms entre piezas y hasta 3 (era 32 px, 0,6 s, 80 ms, hasta 5); toca también Inicio y Fichas. `movimiento.js` **lee `--mov-bloque`** en vez de tener 600 escrito a mano. **Las palabras de la invitación parten de 0,45** y no de 0,2: negro al 20 % sobre amarillo no se leía. `v41` | `HEAD` |

| 17/9 | **El mapa de riesgo**, para las prácticas territoriales. Pedido como React + Zustand + Tailwind; **se hizo con el stack de la app** (Máximo lo eligió): Leaflet 1.9.4 desde cdnjs, JS sin compilar, estilos aparte en `mapa/mapa.css` para no engordar el armazón. Tres capas —**hídrico, industrial, redes comunitarias**—, cada pin con color **y glifo** (💧🏭🤝), y una **hoja que sube desde abajo** para reportar: ubicación por GPS o tocando el mapa, capa y categoría, y 280 caracteres. **El reporte no depende del mapa ni de la señal**: se guarda primero en el teléfono (IndexedDB, y si no abre, localStorage) y se manda al abrir, al volver la señal, al volver a la pantalla y cada 30 s. El `id` lo pone el teléfono, así un reintento choca con la clave (23505) y no duplica. **Carga con cuenta, se publica recién cuando el equipo aprueba** en la pestaña nueva 🗺 del panel, y **nadie puede leer quién cargó qué** (permisos por columna). Las nueve categorías viven en `mapa/capas.js` y **las escribí yo: las tiene que mirar Máximo**. Sin Background Sync: no existe en iPhone ni en Instagram. Las calles (azulejos de OpenStreetMap) no se guardan sin señal; Leaflet sí, por una regla en `sw.js`. `tabla-riesgo.sql` **aplicado en Supabase** y probado con una cuenta de estudiante y una del equipo dentro de una transacción deshecha: carga, duplicado, fuera de zona, más de 30 días, leer el autor, aprobar sin ser del equipo y lo que ve alguien sin cuenta, todo como tenía que dar. Entra al índice del pie. `v45` | `5b3d0f1` · `13c43c8` |
| 17/9 | **La Tecnicatura tiene su primera herramienta propia en el inicio:** el mapa de riesgo ocupa el acceso que tenía Estudiemos, que sigue en la barra de abajo. Sin `v`: es solo `index.html` | `b733ba6` |
| 17/9 | **El mapa suma cinco capas de base**, que no carga nadie desde la app: **riesgo hídrico** (arroyos y zonas inundables), **riesgo industrial**, **hábitat · RENABAP**, **redes de contención** (salud, clubes, bomberos) y **movilidad** (corredores seguros). Pedido como React/Next; hecho en el `mapa/` que ya existía. **La fila de chips pasó a un panel «Capas»** arriba del mapa, con interruptores de verdad y la muestra de color de cada capa (hace de leyenda): con ocho capas, los chips dejaban la mitad escondida. Cada GeoJSON está en `mapa/datos/`, **se baja recién al prender su capa** (arrancan apagadas: son datos del teléfono) y después lo guarda el service worker. Si no aparece, el renglón dice por qué: **falta el archivo, no es GeoJSON, está en POSGAR** y no en lat/long, o no hubo señal. Tocar un elemento abre su ficha con nombre, descripción y fuente; **mientras se marca un reporte, tocar un barrio pone el punto** y no abre la ficha. Los colores y los archivos viven en `mapa/capas-base.js`. **Un error que salió probando:** con tres canvas (rellenos, líneas, puntos) el de arriba se quedaba con el toque y los polígonos no se podían tocar; ahora es uno y el orden se pone a mano. **Los cinco GeoJSON todavía no están**: en producción las cinco capas dicen «Todavía no está cargada en la app». `v46` | `3c6ef5a` |

| 17/9 | **Las capas de base tienen datos, bajados desde acá.** **Cursos de agua** (824: arroyos, canales, desagües y ríos), **zonas industriales** (85, con el polo de YPF) y **redes de contención** (231: 63 hospitales, 79 centros de salud, 14 cuarteles y 74 clubes con nombre) salen de OpenStreetMap por la Overpass API; **RENABAP** (190 barrios de los tres partidos) del geoportal de Obras Públicas por WFS, porque la página del Ministerio ya no responde. Dos cosas que hubo que arreglar: **ese servidor devuelve los acentos rotos** —26 nombres de barrio repuestos con una tabla, ninguno dudoso— y **PowerShell 5.1 lee los `.ps1` como ANSI**, así que el propio script de conversión metía «MartÃ­n» hasta que se le puso la marca UTF-8 (ver memoria del entorno). Los desagües pasaron a línea fina: con el grosor de un arroyo tapaban el mapa. **Movilidad sigue sin archivo**: no hay dato público de corredores seguros, se dibujan. Cómo se rehace cada descarga está en `mapa/datos/LEEME.md` | `7d3fd07` |

| 17/9 | **Mi año se carga desde SIU Guaraní.** Quien tiene cuenta sube el «Reporte de materias - cursadas y finales» en PDF y se marcan solas las aprobadas (con nota y fecha) y las cursadas regulares (con el año). Se lee en el teléfono con pdf.js (`lib/leer-analitico.js`) y **el PDF no se sube**: tiene el DNI. Primero muestra lo leído y recién con «Cargar» guarda; no baja ningún estado; las optativas y lo que no está en el plan se muestran pero no se cargan. Probado con el analítico de Máximo: 24 aprobadas + 2 cursadas, cero renglones perdidos. **Y la regularidad vence a +4, no a +3:** el reporte dice 2024 → 31/3/2028; la app avisaba un año antes. La hoja ahora ofrece cinco años para elegir. | — |

| 17/9 | **Sexta capa: peligrosidad de inundación** (ADA), separada de los cursos de agua para que quien solo quiera ver el arroyo no baje el archivo pesado. El dato sale de los **21 mapas de peligrosidad de La Plata** de `riesgohidrico.ada.gba.gov.ar` (uno por localidad, más Berisso por la cuenca Maldonado-Garibaldi; **Ensenada no está** en esa serie), que son Google My Maps y se bajan como KML. Son **42.427 polígonos, uno por manzana**: en un celular no entran. Se queda con **alta y media** (10.890) y deja afuera baja y muy baja a nula (31.537), que son la mayor parte del partido y harían ver toda la ciudad como inundable. El sur del mapa bajó a -35.25 porque Etcheverry llega hasta ahí. **La capa está en la app y el archivo NO**: dice «Todavía no está cargada». Falta correr `mapa/datos/herramientas/unir.ps1` hasta el final (unos 10 minutos) y dejar `peligrosidad.geojson`. Tres tropiezos anotados, los tres de PowerShell desarmando listas: se perdieron dos corridas de 10 minutos, una con 170.000 anillos de un punto | `HEAD` |

| 17/9 | **El panel no cargaba: quedaba en los esqueletos.** En el formulario de trámites, un comentario HTML (el de por qué el enlace es `type="text"`, del 6/9) tenía **comillas invertidas**, y ese formulario vive adentro de un texto de JavaScript que abre y cierra con comillas invertidas. La primera cerraba el texto antes de tiempo, el guion entero del panel daba `SyntaxError` y el navegador no corría nada: **no fallaba solo Trámites, se caía todo el panel**. Se cambiaron por «comillas latinas»; no cambia nada de lo que se ve. Se revisó la sintaxis de los guiones de todas las pantallas: **era el único**. **Regla: dentro del HTML que arma el guion, ni en los comentarios van comillas invertidas.** Lo de detrás del login no se pudo probar sin la cuenta del equipo. `v49`, para que quien tenía guardado el panel roto reciba el arreglado | `HEAD` |

**Ojo con lo de las materias libres.** El listado sale de un documento que se
llama, textualmente, «**Propuesta** de materias libres … para agregar al régimen
de regularidad o anexar al plan de estudios». No está aprobado, y la app lo dice
con todas las letras. Si alguien confirma que se aprobó (o que no), hay que
cambiar `notaLibres` en `carrera/plan-fono.js`, que es el único lugar donde vive
ese texto.

### El asterisco (*) del plan de Trabajo Social

**Qué es, en una línea:** una marca que está **en el PDF de la facultad**, al
lado de diez materias del plan 2015. No la inventó la app: la app la copió tal
cual (`marcada:true` en `carrera/plan.js`) y **no sabe qué significa**, así que
lo dice: «Todavía no tenemos confirmado qué condición indica: si te toca alguna,
preguntá en Alumnado» (`notaAsterisco`, el único lugar donde vive ese texto).

**Lo que se midió el 13/9, y es un patrón limpio.** Las diez marcadas son
**todas** las cuatrimestrales de **64 horas de 2.º año en adelante**, sin una
sola excepción:

| | |
|---|---|
| 2.º año | Introducción a la Psicología · Teoría del Estado · Economía Política |
| 3.º año | Trabajo Social y Sujetos Colectivos |
| 4.º año | Psicología del desarrollo · Teoría y Práctica de la Educación · Derecho de infancia · Salud Colectiva |
| 5.º año | Filosofía Social · Debate contemporáneo y Trabajo Social |

Y las únicas cuatrimestrales de 64 h que **no** llevan asterisco son **las
cuatro de 1.º año**. Las de 96 y 128 horas no llevan ninguna. O sea: el
asterisco no señala materias sueltas, señala **una categoría entera** —64 horas,
cuatrimestral, de 2.º para arriba—. Eso descarta que sea una nota al pie de tres
o cuatro casos particulares.

**Por qué igual no se puede escribir qué significa.** Que sean todas de la misma
categoría dice que hay una regla, no cuál es. Las dos hipótesis siguen abiertas:
que se puedan **rendir libres**, o que sean las que se **eligen** para completar
el trayecto. El indicio a favor de «libres» es que cuatro de las seis materias
que TS comparte con Fonoaudiología están marcadas con asterisco **y** figuran
como libres en la propuesta de Fono —pero las otras dos, no—. Apunta para ese
lado y no alcanza.

**La pregunta para Alumnado, tal cual:** «En el plan 2015 de la Licenciatura en
Trabajo Social, las materias cuatrimestrales de 64 horas de 2.º a 5.º año
figuran con un asterisco. ¿Qué condición indica ese asterisco? ¿Que se pueden
rendir libres?». Hasta que haya respuesta, `notaAsterisco` se deja como está:
decir «no sabemos, preguntá» es correcto; adivinar en la pantalla de alguien que
está armando su cursada, no.

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
| vie 4 · 6 | ✅ **Cátedras parte 2:** la pantalla `catedras/` con buscador y la solapa del panel. El lun 7 queda libre | — |
| sáb 5 | ✅ **Las nueve fichas de estudio** y los siete trípticos en PDF. Se comió la tarea del sáb 12 | — |
| dom 6 | ✅ **Cerradas las cuatro decisiones**, y las tres que quedaban están hechas y publicadas: la pestaña «Plan», Fechas sin tiempo real, y la ficha de cátedras apuntando a `/catedras/` | — |
| lun 7 | ✅ Adelantado al vie 4. **Queda libre** | — |
| mar 8 | ✅ Adelantado al dom 6: los contactos ya están cargados y andando. **Queda libre** | — |
| mié 9 | ✅ Adelantado al dom 6. **El plan en PDF no va: va impreso.** Ver abajo | — |
| jue 10 – vie 11 | ✅ Adelantado al dom 6: **el glosario está hecho y publicado**. Los horarios se fueron al año que viene. **Queda libre** | — |
| sáb 12 | ✅ Adelantado al sáb 5. **Queda libre** | — |
| ~~dom 13~~ | ~~Congelamiento~~. **Movido el 8/9:** hacen falta más días para las herramientas nuevas | — |
| dom 13 · 1 | ✅ **Las seis deudas chicas, contestadas.** Legardón con tilde y Aulas Web publicados; Avisanos cerrado en dos contactos; el asterisco medido; las etiquetas de campaña explicadas; y el molde del Trayecto Optativo escrito | — |
| dom 13 · 2 | ✅ **El Trayecto Optativo tiene pantalla.** Diseñado, escrito y publicado el mismo día que el molde. Ver arriba | — |
| dom 13 · 3 | ✅ Fonoteca solapa 1 (casos escondidos), Estudiemos con movimiento, Espacios autogestivos, grafo. **Y el cuestionario que fijó el esquema de abajo** | — |

**El esquema del 13/9 a la noche.** Salió de un cuestionario con Máximo y
reemplaza lo que había acá. Lo que manda:

- **Congelamiento: jueves 17 a la noche** (no el 16).
- **Seis sesiones por día.** Del lun 14 al mié 16, **mitad contenido y mitad
  código**: tres de cada. El jueves 17, las seis son de código.
  **Unas 15 sesiones de código en total.** Cada renglón de abajo es una
  sesión, y cada sesión es un objetivo y un commit.
- **Todo entra el 21** (decisión de Máximo), salvo lo primero que se
  recorta: **Prácticas y territorio de la Tecnicatura pasa a después del 21.**
  Si igual no entra, lo siguiente que se recorta se decide el jue 17 a la
  mañana, no antes.

| Día · sesión de código | Objetivo | Espera de Máximo |
|---|---|---|
| lun 14 · 1 | ✅ **Fonoteca: generador de tonos.** Hecho el **jue 17**: del 14 al 16 no se trabajó. Arranca bajo, rampa de 30 ms, se corta solo a los 3 s, elige oído | — |
| lun 14 · 2 | ✅ Hecho el jue 17. En la web de la FTS no hay nada nuevo sobre 3 de las 4 dudas; sí la oferta del 2.º cuatrimestre 2026 (publicación del 3/9), que entró como sección «Lo que hay este cuatrimestre» con horas y link. La duda de los seminarios sigue. Era: **Trayecto Optativo: rastrear en la página de la facultad** los cuatro puntos sin confirmar. Lo que se encuentre con fuente, entra; lo que no, sigue diciendo que falta | — |
| lun 14 · 3 | ⏭ **Después del 21** (Máximo, 17/9): sin texto ni visto. Era: **Fonoteca solapa 2: GRBAS**, como definiciones. Dice que el audio llega después | — |
| mar 15 · 1 | ⏭ **Después del 21**. Era: **Fonoteca solapa 3: fonética rioplatense**, como definiciones | — |
| mar 15 · 2 | ⏭ **Después del 21**. Mientras, la ficha diseñada de anquiloglosia ya está en fichas/. Era: **Fonoteca solapa 4: anquiloglosia** | — |
| mar 15 · 3 | ✅ Entró en jue 17 · 2 y 3. Era: **Fichas de Fono, tanda 1** (dos o tres) | textos de NotebookLM con `PROMPT-FICHAS.md` |
| mié 16 · 1 | ✅ Entró en jue 17 · 2 y 3. Era: **Fichas de Fono, tanda 2** | ídem |
| mié 16 · 2 | ⏭ **Después del 21**: en la carpeta ESTUDIEMOS no hay material de la Tecnicatura. Era: **Fichas de la Tecnicatura, tanda 1**. Es su primera cosa propia en Estudiemos | ídem |
| mié 16 · 3 | ✅ Entró en jue 17 · 1. Era: **Aviso en Mi año, parte 1:** con lo que la persona ya marcó, qué se le está por vencer y adónde ir. Sin cuenta, en el celular. **Antes, preguntas cortas**: es un módulo nuevo | **los plazos de regularidad**, a más tardar el mié 16 a la mañana |
| jue 17 · 1 | ✅ **Aviso en Mi año, partes 1 y 2 juntas.** Regla de Máximo: la cursada vence en marzo del tercer ciclo lectivo después del que se aprobó (2024 → marzo 2027). Al marcar «me falta el final» la hoja pregunta el año (opcional, se guarda en `datos.regular`); en «Finales que tenés pendientes» sale un aviso rojo con lo vencido y lo que vence en 12 meses, cada tarjeta dice hasta cuándo vale, y todo manda a confirmar en SIU Guaraní | — |
| jue 17 · 2 | ✅ **Fichas de Fono, todas las que había (21).** Llegaron como texto de NotebookLM sin dibujar: las arma una sola página, `estudiemos/fichas/leer/?f=<nombre>`, desde `fichas/textos/*.txt` (máquinas como chips, preguntas que se corrigen; los ESQUEMA quedan afuera). 6 de Anatomo por módulo y 15 de Desarrollo de la Función Oral Faríngea; dos repetidas no entraron | — |
| jue 17 · 3 | ✅ **Fichas, tanda 3: 17 de las 21 dibujadas.** Llegó la entrega de Claude Design (17 `.dc.html`, misma clase y estilos, distinto dibujo). Cada una en `estudiemos/fichas/<nombre>/` con su `<template>`; la clase vive una vez en `ficha-texto.js`, los estilos en `assets/fichas-texto.css`, y `ficha.js` aprendió `setState(fn)`, props y el texto con formato de `React.createElement`. Quedan en `leer/` las Anatomo 3 a 6. Solo en claro. SW v44 | — |
| jue 17 · 4 | ✅ **Llegó el visto** de la profesional a los seis casos (confirmado por Máximo el 17/9). No hubo que prender nada: estaban publicados desde el 13/9; se corrigieron los comentarios. Solapas 2 a 4 (GRBAS, fonética, anquiloglosia): **después del 21**, decisión de Máximo. Era: **Fonoteca: prender o no.** Si llegó el visto, se muestran los casos y la cuarta tarjeta; si no, se decide ahí si sale sin casos o escondida | **el visto de la profesional** |
| jue 17 · 5 | ✅ Colchón: la tarjeta de Fichas en Estudiemos seguía diciendo «9 fichas / 8 de Fono» y «Nueve temas»; ahora 30 (29 Fono, 1 TS). Buscador en fichas/: después del 21 | — |
| **jue 17 · 6** | ✅ **Congelado el 17/9 a la noche.** SW queda en v44 (subida hoy con ficha.js): lo que cambió después son pantallas, que van primero a la red, así que otra versión solo haría bajar todo de nuevo. Grafo al día. Desde acá, solo arreglos. Era: **Congelamiento.** `v` del service worker, `graphify update .`, bitácora al día | — |
| jue 17 · fuera del cronograma | ✅ **El mapa de riesgo**, después del congelamiento y por decisión de Máximo. Sube el SW a **v45** (lo de arriba decía v44): `app.js` suma el mapa al pie y `sw.js` guarda Leaflet. Tabla aplicada en Supabase. Después, las **cinco capas de base** con el panel «Capas»: SW **v46**. Ver «Hecho y publicado» | — |
| **vie 18** | **El día que no se mueve. Cuatro sesiones, las cuatro de prueba en teléfono real.** 1) la app entera en el Android de Máximo, **entrando desde el link de Instagram**; 2) lo mismo en el iPhone prestado, que Safari rompe lo que Chrome no; 3) el mapa de riesgo: reportar con cuenta (GPS y tocando el mapa), aprobarlo en el panel y verlo sin cuenta; 4) abrir `mapa/` por segunda vez en modo avión, para ver que el reporte queda guardado y sale solo al volver la señal. Si para entonces están los GeoJSON, **prender RENABAP en el teléfono más viejo** que haya: son cientos de polígonos y es lo único de las capas que no se pudo medir acá. **La lista de posteos ya no sale de acá:** pasó al sáb 19 | los dos teléfonos |
| sáb 19 | **Sin agenda propia: se llena con lo que haya roto el viernes.** Si no rompió nada, entra **la lista de posteos** —qué publicación lleva a qué pantalla— y los links `?de=` escritos | la lista de posteos |
| dom 20 | **Una sola sesión, corta. Todo arriba**, y verificar la segunda carga: el service worker entrega lo nuevo recién ahí, así que si esto falla el lunes se ve una versión vieja | — |
| **lun 21** | **Lanzamiento. No entra nada nuevo.** Máximo está todo el día: se mira la solapa Registro y, si aparece un error, **arreglo chico, probado corriendo, y push** | — |

**El reordenamiento del 17/9 a la noche.** Del lun 14 al mié 16 no se trabajó, pero las seis sesiones del jueves están hechas y encima entró el mapa de riesgo: lo que se cayó ya estaba movido al después del 21. Lo que cambia es el criterio de los tres días que quedan, y es uno solo: **lo que no se probó en un teléfono real no existe**, y hoy la app entera está en esa situación. Por eso el viernes es todo prueba y no entra código nuevo, y por eso la lista de posteos —que no es trabajo de código— se corre al sábado.

**Las tres cosas que Máximo tiene que decidir no son sesiones.** Las nueve categorías de `mapa/capas.js`, quién modera el mapa y los GeoJSON que faltan se contestan por mensaje y se aplican en minutos. No hay que reservarles tiempo.

**Decidido de antemano, para no discutirlo cansado el viernes: si el mapa de riesgo da problemas en el teléfono, no se arregla a las corridas — se esconde del inicio y se lanza sin él.** Entró después del congelamiento, por fuera del cronograma, es la pieza más grande sin probar y **no es parte de lo que se prometió para el 21**: es una herramienta para las prácticas territoriales, que arrancan después. Queda publicado, se sigue probando con calma y se enciende cuando esté.

**Lo que Máximo tiene que hacer afuera, en orden:**

1. ✅ **Hecho: la profesional dio el visto (confirmado el 17/9).** ~~**Hoy o el lun 14:** mandarle a la profesional el link
   `estudiemos/fonoteca/?revision` con los seis casos. Todavía no se los pasó,
   y sin visto los casos no salen.~~
2. **Lun 14 – mié 16 (las sesiones de contenido):** pasar los PDFs de Fono y
   de la Tecnicatura por NotebookLM con `PROMPT-FICHAS.md`. Son más de seis
   fichas. Cada texto tiene que estar listo antes de su sesión.
3. **Mié 16 a la mañana:** los plazos de regularidad (años y turnos). Sin eso
   el aviso de Mi año no se puede escribir.
4. **Vie 18:** conseguir el iPhone.

**Después del 21, ya decidido que no entra:** Prácticas y territorio de la
Tecnicatura (el mapa de riesgo ya existe y, cuando esa sección se arme, va
adentro), las fichas que no lleguen, el audio de GRBAS y pares mínimos,
Rinne y Weber, enmascaramiento, el editor de casos para la profesional, el
Trayecto dentro del conteo de materias (`carrera/plan.js`), bajar las fuentes
y partir `estilos.css`. Y **pensar con tiempo la permanencia**: «que no
abandonen» y «estudiar con más herramientas» empiezan el 21 con el aviso de
Mi año, pero no terminan ahí.

### Las «herramientas nuevas»: lo que hay y lo que falta (13/9)

El 8/9 se corrieron cuatro días para esto y **la lista nunca se escribió**. Se
escribió el 13, y ese mismo día se hizo la primera:

1. ~~**El Trayecto Optativo en Info útil.**~~ ✅ **Hecho y publicado el 13/9**,
   el mismo día que se escribió el molde. **No es una materia** —son actividades
   que se acreditan— y la app lo dibujaba como una porque el plan lo lista con
   código `255`, 120 horas, 5.º año. El estudiante de 5.º veía un casillero sin
   ninguna explicación en toda la app. Ahora `trayecto/` contesta siete
   preguntas y tiene tres puertas. Cuatro de las respuestas siguen sin
   confirmarse, y la pantalla lo dice en vez de inventarlas.

2. **La Fonoteca**, cuarta herramienta de Estudiemos. Molde en
   `PROMPT-FONOTECA.md`, **reescrito entero el 13/9 a la tarde** cuando Máximo
   pasó su diseño de AI Studio, el TP de la cátedra y los aportes de la
   profesional de fono. **No es una colección de sonidos: es un entrenador para
   leer audiogramas**, y el generador de tonos es una parte chica. Cuatro
   solapas —audiometría tonal y PTP, GRBAS, fonética rioplatense y
   anquiloglosia—, y Máximo las quiere las cuatro el 21.

   **Lo que hay que mirar de frente: dos de las cuatro dependen de audio que no
   existe.** GRBAS es evaluación perceptual —se escucha una voz y se le pone un
   número— y «pares mínimos» también es escuchar. La cátedra tiene una
   aplicación con material y hay que preguntar si lo comparte. Sin eso, esas dos
   solapas son pantallas de definiciones, y **eso está bien si lo dicen**: lo
   que no puede pasar es una solapa que diga «escuchá la voz» y no tenga
   ninguna.

   **La solapa 1 no depende de nadie y sostiene sola la herramienta.** Los
   símbolos, los cinco grados y las tres reglas de clasificación los pasó Máximo
   desde el material de la facultad y están transcriptos en el molde. **Seis
   casos propios, distintos a los ocho del TP** —eso lo pidió la profesional y
   además el TP es material de la cátedra—, y **ninguno se publica sin su visto
   caso por caso**: un audiograma mal clasificado le enseña mal a alguien que
   después diagnostica.

   Queda anotado para después: el **Rinne y el Weber** del TP, el
   **enmascaramiento** —que es lo que ella llama «otros signos», y son las dos
   filas que el tablero de AudGen tiene y nosotros no—, y un **editor** para que
   ella cargue casos sola. Hoy sumar un caso es agregar una línea de números y
   se la pide a alguien; en el tablero que ella pasó, se editan.

**Y la Fonoteca abre una decisión de una línea que hay que tomar antes de
escribir el HTML:** Estudiemos tiene **tres** herramientas en superficie y que
sean tres fue decisión del 5/9 —el amarillo quedó para una sola cosa, abajo—.
Una cuarta tarjeta cambia esa fila. O es la cuarta, o se llega desde «Fichas
para estudiar», que es de donde viene el tema. Las dos se defienden; lo que no
se puede es descubrirlo con el HTML ya escrito.

**Lo que falta es decidir si hay algo más**, y decidirlo ya: quedan tres o
cuatro días de código. Con la ventana así, **cada herramienta tiene que caber en
una sesión**; lo que no entre se parte en dos o se corta el alcance. Y el
**mié 16 al mediodía se cierra la lista**: lo que no esté empezado ahí pasa a
`entrada/` como `idea-*` y es post-21. Cerrarla el 16 y no el 17 deja el jueves
para el error que aparezca, que siempre aparece.

### Lo que este cronograma dejó a la vista (al 6/9)

**El cuello de botella era el contenido, y se destrabó.** Cuando esto se escribió
el 3/9, de siete tareas cinco esperaban material de Máximo y tres lo recibían el
mismo día en que había que construir con él. Hoy: los mails llegaron el 4/9, los
PDFs del plan el 4/9, los de materiales el 5/9, y los horarios se fueron al año
que viene. **De las siete queda una sola esperando material: los tres contactos
por carrera de Avisanos, y ese contenido puede entrar hasta el 20** —lo que se
congela el 13 es el código, no los textos—.

**Lo que sale de ahí, ahora que Máximo viaja del 9 al 12:** del mar 8 al sáb 12
no hay ninguna tarea que lo necesite. El plan en PDF (mié 9) ya tiene sus
archivos, y el jue 10 – vie 11 quedó libre. Son cuatro días de trabajo que no
dependen de nadie más, justo los días en que no va a estar.

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

### Qué NO se trajo de la versión 2.0 de AI Studio (7/9)

Se miró entera y se tomaron tres cosas. Lo demás quedó afuera **a propósito**,
para no volver a discutirlo cada vez que alguien abra esa carpeta:

- **La barra de navegación de abajo.** Ya la sacamos y ganamos 64 px en cada
  pantalla. Está explicado en `LEEME.md`, «La navegación se mudó arriba».
- **El «Asistente Simón».** Es un chat con ocho `if` de palabras clave. Promete
  conversación y contesta un FAQ; lo mismo lo hace el buscador sin prometer de
  más. Y ya tenemos Avisanos, que lleva a una persona de verdad.
- **Los colores tal cual.** La 2.0 escribe `#0195B1` a mano como color de
  estado («aprobada»), y acá el celeste es el foco del teclado. Además usa
  texto de 10 y 11 px, por debajo de nuestro mínimo (`--letra-mini`, 12).
- **Su calculadora de vencimiento de regularidad.** La idea sirve; el dato no:
  dice «3 años y **5** llamados anuales» y nosotros ya corregimos que los
  turnos son **nueve**. Si se hace, los plazos los confirma el Equipo. Máximo
  dijo que los tiene: **falta que los pase.**
- **El mapa de correlativas y el modal de nota.** No hacía falta traerlos: lo
  nuestro ya los tenía y en varias cosas mejor (el promedio nuestro aclara
  sobre cuántas notas está hecho; el de la 2.0 no).

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

**La pantalla `catedras/` (parte 2):**

- **No entra en `SECCIONES`.** Son siete secciones y esto es una herramienta de
  consulta, no una octava. Se llega desde el pie de Mi año y desde Info útil.
- **Usa el cliente chico** (`lib/datos.js`): solo lee datos públicos. 6 KB en
  vez de 213.
- **Arranca en la carrera de la persona**, leída de lo que guardó Mi año. Si
  nunca entró, Trabajo Social, que es la más numerosa.
- **Buscar pisa el chip de carrera.** Quien escribe «anatomo» quiere esa
  materia, no «esa materia si está en la carrera que tenía elegida»: filtrando
  por las dos cosas, buscar algo de otra carrera no daría nada y parecería que
  no está cargado. Buscando se agrupa por carrera; sin buscar, por año.
- **El año vive en la tabla y no se saca de `plan.js`**, para que esta pantalla
  agrupe sin bajar los tres planes: son 20 KB para un solo dato. Los planes
  siguen siendo la fuente.
- **La solapa del panel valida el mail antes de guardar.** Una dirección con
  tildes o sin arroba no entra — es exactamente el error que nos trajo hasta
  acá. Y las cátedras sin contacto salen arriba de todo con aviso, porque son
  las que hay que resolver.
- **No hace falta subir el service worker:** solo se agregó una página y se
  tocaron dos, y las páginas se sirven red primero.

~~**Queda una decisión de contenido:**~~ ✅ **Resuelta el 6/9.** La entrada
«Contacto de las cátedras» (trámite 33) apuntaba a un PDF en Drive y ahora lleva
a `/catedras/`, con el botón «Buscar mi cátedra». Cambiado en la base.

**Lo que quedó afuera:** el **Profesorado en Trabajo Social** no existe como
carrera en la app, así que sus ocho mails no tienen dónde ir. Y el
**«Taller de metodología»** de Fono vino como de 3° año, pero en el plan el II
es de 4° y el de 3° es el Taller I (833). Sin mail, así que no urge.

### El plan de estudios no se publica en PDF: se imprime (6/9)

La tarea del mié 9 decía «Plan de estudios en PDF» y traía una decisión adentro:
los archivos que dio la facultad pesan **1,8 MB y 3,6 MB**. Contestada: **no se
publican.**

El motivo es que ya existían. La pestaña **«Plan»** de `carrera/` muestra el
plan entero desde `carrera/plan.js`, `plan-fono.js` y `plan-tgcr.js` —transcripto
del mismo PDF—, viaja con la app y anda sin internet. Publicar el archivo era
hacer bajar 3,6 MB, por celular y adentro del navegador de Instagram, para
repetir lo que la pantalla ya dice. Y el repositorio ya carga con los 33 MB de
los trípticos.

Lo que se hizo en su lugar: **esa vista se imprime**. Botón «Imprimir el plan»,
y un bloque `@media print` colgado de `.pantalla-carrera` —la clase del `<body>`
de esa pantalla y de ninguna otra— que apaga cabecera, pestañas, botones y las
otras tres vistas, y deja el plan con un encabezado que dice la carrera, la
facultad y la fecha. Tres cosas que no son obvias:

- **El plan sale aunque estés parado en «Mapa» o en «Finales».** Quien hace
  Ctrl+P espera el plan, no una hoja en blanco. El selector `#vista-todo[hidden]`
  le gana en especificidad al `[hidden]{display:none !important}` de la base.
- **En papel siempre es de día.** Con el teléfono en modo oscuro la hoja salía
  con fondo casi negro. Las variables de color se redefinen en el `<body>` dentro
  del bloque de impresión, así que ganan sobre las del `:root` oscuro. Medido:
  fondo `#FFF`, texto `#1A1A1A`.
- **El navegador de Instagram no imprime.** Es un WebView y ahí `print()` no
  hace nada: no falla, no avisa, no pasa nada. Como es la puerta por la que va a
  entrar casi todo el mundo el 21, el aviso de «tocá los tres puntitos y abrilo
  en el navegador» **se muestra por user agent antes de que toque**, y no después
  de que el botón se quede mudo.
- **El botón va arriba de la pestaña, no al final.** Salió al final en la
  primera versión y Máximo no lo encontró: quedaba debajo de las cuarenta y dos
  materias, a cinco pantallas de scroll. Vale como regla y no como anécdota: en
  esta pantalla, **lo que va después del plan no lo ve nadie**. El botón de
  «Empezar de nuevo» sigue ahí abajo a propósito —eso se busca cuando se
  necesita—, pero nada que uno tenga que descubrir puede vivir en esa zona.

Y de paso **el «Guardar como PDF» sigue existiendo**: está en el mismo cuadro
del navegador, en «Destino». O sea que de la pantalla salen el papel y el
archivo, y el archivo sale con lo que la persona tenga marcado.

**Lo que se pierde:** el PDF original tiene el sello y la firma de la facultad,
y la hoja impresa no. Si alguna vez hace falta el documento oficial para un
trámite, va como enlace a Drive, no como archivo en el repositorio.

### El glosario, y las dos cosas que hay que confirmar (6/9)

Las once definiciones las escribió Máximo y están publicadas tal como las
mandó, salvo dos retoques y dos dudas. **Viven en `glosario/index.html` y en
ningún otro lado**: no salen de Supabase a propósito, porque son el reglamento
—no cambian de un mes para el otro— y así la pantalla se lee sin señal, que es
cuando el ingresante la necesita: en el pasillo, antes de entrar a Alumnado.
Si algo de esto cambia, se edita ese archivo.

**Lo que se cambió del original, y por qué:**

- **La dirección del SIU.** El texto decía `guarani.unlp.edu.ar`, que es el
  genérico de la Universidad. Se puso el de la Facultad —
  `guarani-trabajosocial.unlp.edu.ar/acceso`— que es el que la app ya usa en el
  pie, en Info útil y en el linktree. Está anotado en `app.js` que ninguna de
  esas tres direcciones se pone de memoria.
- **«Agrupacion» sin tilde**, en la entrada del CEFTS. En la misma oración la
  otra estaba bien escrita: era un tipeo.

**Las dos que había que confirmar: ✅ las dos cerradas.**

1. ~~**«Agrupación Gustavo Legardon».**~~ ✅ **Confirmado el 13/9: lleva tilde.**
   Dice **Legardón** en `glosario/index.html`. Era un solo carácter, y no se
   corrigió de memoria a propósito: es el nombre de una agrupación compañera, y
   ni «Legardon» ni «Frente Malvinas Argentinas» aparecían en ninguna otra parte
   de la app, así que no había con qué contrastarlo.
2. ~~**Los turnos de examen.**~~ ✅ **Corregido el 6/9: son nueve, faltaba
   noviembre.** La entrada dice ahora «febrero, marzo, mayo, julio, agosto,
   septiembre, octubre, noviembre y diciembre», y lo dice con el número
   adelante —«que son nueve»— para que a la próxima se note si falta uno. La
   agenda de la app tiene sus propias fechas cargadas: si alguna vez se
   contradicen, manda la agenda, que es la que se actualiza.

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

## Decisiones pendientes — ✅ cerradas el domingo 6

**Las cuatro están contestadas.** Las tres que quedaban se cerraron hoy y las
tres están hechas y publicadas.

1. ~~**¿Quién actualiza los horarios en marzo?**~~ ✅ **Contestada el 6/9: no
   van.** «Esa tarea se revisará el año que viene, cuando se tengan.» O sea que
   los horarios **salen del cronograma del 21** y el jue 10 – vie 11 queda
   libre. Lo que había detrás de la pregunta sigue en pie para marzo: unos
   horarios propios que nadie actualice mienten el año entero, así que cuando
   se retome, primero el nombre de quien los mantiene y después el código.
2. ~~**¿Qué muestra la portada el 21?**~~ ✅ **Contestada el 5/9, y había un
   bug detrás.** El lugar de la alarma no queda vacío: lo ocupa lo próximo de la
   agenda. Pero ese renglón elegía mal —ordenaba por `fecha_desde`, así que
   ganaba siempre lo más viejo— y el 21 iba a decir «Hoy · Desarrollo de
   seminarios de 2.º cuatrimestre», un período que arrancó el 18/8 y termina el
   21/11, tapando «Día del estudiante». Arreglado: ahora dice **«Hoy · Día del
   estudiante»**. No era solo el 21: del 18/8 al 21/11 ese renglón mentía todos
   los días sin alarma.
3. ~~**¿Fechas conserva el tiempo real?**~~ ✅ **Contestada el 6/9: se refresca
   al volver.** Hecho y publicado. Fechas era la única pantalla que cargaba la
   librería grande de Supabase por UNA función, `db.channel(...)`: 212.718 bytes
   por eso. Ahora usa el cliente chico (6.357) y vuelve a pedir los datos cuando
   la pestaña se hace visible o el teléfono devuelve la página al tocar «atrás»,
   con un freno de 15 segundos. El JS de la pantalla pasó de 287 KB a 79. Lo que
   se pierde: quien tenga Fechas abierta **en ese momento** ve la novedad al
   volver a la pantalla y no al instante.
4. ~~**El texto de la pestaña «Plan completo»**~~ ✅ **Contestada el 6/9: dice
   «Plan».** Hecho y publicado. Medido con las cuatro pestañas a la vista: en
   375 px cada una recibe 78 px de texto y «Plan» ocupa 41; en 320 px reciben 64
   y la palabra más ancha pasa a ser «FINALES», con 62,8. **Queda un píxel de
   margen**: cualquier palabra nueva en esa fila se mide antes de escribirla.

**Y se cerró de paso una decisión de contenido que estaba anotada arriba:**
«Contacto de las cátedras» (ficha 33 de Info útil) ya no lleva al PDF de Drive
sino a `/catedras/`. El dato está cambiado en la base. Trajo código atrás: todas
las fichas se dibujaban como enlaces de afuera —pestaña nueva y «↗»—, y ahora la
regla la decide el enlace (con `http://` va afuera; sin eso, adentro de la app).
En el navegador de Instagram, que es el navegador real de esta app, abrir una
pantalla propia en pestaña nueva rompe el botón de volver.

## Lo que depende de Máximo

| Qué | Para cuándo |
|---|---|
| ~~Correr `tabla-registro.sql` de nuevo~~ | ✅ hecho. Verificado el 5/9 contra la base: entran los cuatro hitos (9 anotados) |
| **Etiquetar los links de Instagram** con `?de=`. Ver «Las etiquetas de campaña» abajo: no hay nada que generar, el link se escribe a mano | antes del 21 |
| Mirar la solapa **Registro** y el campo **«¿Alimenta la alarma?»** en el panel | cuanto antes |
| **Revisar las nueve categorías del mapa de riesgo** en `mapa/capas.js`: las escribió Claude, no la cátedra. El `nombre` se cambia cuando sea; el `id`, nunca una vez que haya reportes | antes del 21 |
| **Decidir quién del equipo modera el mapa** (pestaña 🗺 del panel). Sin moderación no aparece ningún punto | antes de la primera práctica |
| **Faltan dos GeoJSON, no cinco** (corregido el 17/9 a la noche): `peligrosidad.geojson` y `movilidad.geojson`. Ya están cargados y andando `hidrico`, `industrial`, `renabap` y `contencion`. Van en `mapa/datos/` con las tres reglas de `mapa/datos/LEEME.md`: en lat/long (WGS84), menos de 500 KB cada uno y recortados a los tres partidos. Sin ellos esas dos capas existen pero no muestran nada | cuando estén |
| **La fuente de las dos capas que faltan** (organismo y año). Va en `fuente` de `mapa/capas-base.js` y sale en cada ficha. **Movilidad sigue con `fuente:''`**, y un polígono sin fuente es una afirmación sin firma | con los archivos |
| ~~La dirección de Aulas Web~~ | ✅ **entregada el 13/9 y publicada:** `https://aulaswebgrado.ead.unlp.edu.ar/`. Está en el índice del pie de las doce pantallas. Los sistemas ahora son cuatro y el orden no es alfabético: primero los dos donde se entra con usuario y contraseña —SIU y Aulas Web—, después las dos instituciones |
| ~~Prender *Leaked password protection*~~ | ❌ **No se puede: es de plan Pro.** Cerrado el 5/9. **NO apagar el alta de cuentas**: el registro de estudiantes es a propósito, ya está hecho en `mi/`, y es lo que va a permitir personalizar la app |
| ~~Confirmar el mail con tildes de «Promoción y prevención en audiología»~~ | ✅ confirmado el 5/9: era un error de tipeo. Ya publicado sin tildes. **Falta escribirle una vez** para saber si la casilla existe |
| ~~Los mails de las cátedras~~ | ✅ entregados el 4/9 |
| ~~Los tres PDFs del plan de estudios~~ | ✅ entregados el 4/9, y **decidido el 6/9: no se publican.** El plan se muestra como página —ya existía— y ahora además se imprime. Los archivos quedan afuera del repositorio |
| ~~Los PDFs de los materiales de estudio~~ | ✅ entregados el 5/9, seis días antes. Ya publicados en `estudiemos/tripticos/` |
| ~~Tres contactos por carrera para Avisanos~~ | ✅ **cerrado el 13/9: quedan en dos y está bien.** Trabajo Social 4 (con Maxi), Tecnicatura 2, Fonoaudiología 2. **No hay más gente disponible**, y los que faltan se incorporan a fin de año, de cara al ingreso 2027. Con dos por carrera funciona: no es una tarea pendiente del 21 |

### Las etiquetas de campaña (13/9)

El 13/9 quedó claro que esto se había entendido como una herramienta que
faltaba construir. **No hay nada que generar.** La etiqueta es texto que se
escribe al final de la dirección, a mano, en el momento de programar la
publicación:

```
https://bolivar-con-vos.vercel.app/?de=dia-del-estudiante
```

Eso es todo. `?de=` y un nombre. La app lo lee en `deDondeVino()` de `app.js`,
lo guarda con la visita y aparece en la solapa **Registro** del panel.

**Tres reglas y una trampa:**

- **Solo minúsculas, números y guiones.** El código limpia todo lo demás y
  recorta a 40 caracteres. `?de=promoción` se guarda como `promocin`: los
  acentos y los espacios **desaparecen sin avisar**. Nunca una tilde, nunca
  una ñ, nunca un espacio.
- **Un nombre distinto por publicación.** Si dos posteos llevan la misma
  etiqueta, se suman y no se sabe cuál funcionó. Si dos llevan la misma a
  propósito —una historia y el posteo del mismo tema—, que sea porque querés
  medirlos juntos.
- **La etiqueta va después del `?` y antes del `#`.** Sirve en cualquier
  pantalla, no solo en la portada, y conviene: el link de cada publicación
  tiene que caer **donde está la cosa de la que habla**, no siempre en el
  inicio. La forma es
  `https://bolivar-con-vos.vercel.app/glosario/?de=que-es-una-promocion#promocion`.
- **La trampa:** sin etiqueta **la visita se cuenta igual**. O sea que el
  registro no va a mostrar un hueco ni un error: va a mostrar visitas sin
  origen, y eso se ve recién cuando lo mirás. Un link sin etiquetar no falla,
  solo no informa.

**Lo que falta es la lista de publicaciones de la campaña**, que no está
escrita en ningún archivo de este repositorio. Cuando esté, se escribe una
etiqueta por publicación y se pegan los links armados. Eso no es trabajo de
código: se puede hacer el 18, el 19 o el 20.

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
