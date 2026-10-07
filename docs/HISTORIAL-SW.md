# Historial del service worker

Por qué subió cada número de `VERSION` en `sw.js`, de la v4 en adelante.
Se sacó de `sw.js` el 21/9/2026 (v72): eran unas 320 líneas de comentario
que viajaban cada vez que alguien abría el archivo.

**Al subir la versión:** cambiar `VERSION` en `sw.js` y agregar abajo de
todo una entrada con el número, la fecha y el porqué.

```text

/* Subir este número vacía el armazón guardado en los teléfonos que ya
   tienen la app. Hay que subirlo cada vez que cambia QUÉ se guarda, y
   también cada vez que cambia el CONTENIDO de algo que ya está en la
   lista, porque acá abajo se sirve lo guardado antes que la red:
   v4 (3/9/2026) saca la librería grande de Supabase de la lista.
   v5 (3/9/2026) suma el icono maskable y, sobre todo, tira el manifest
   y los iconos viejos que ya tienen guardados los teléfonos donde la
   app está instalada.
   v6 (3/9/2026) no cambia QUÉ se guarda: cambia el contenido de
   `app.js` y de `estilos.css`, que ya están en la lista. Ahí adentro
   está lo nuevo —lo guardado entre visitas— y sin subir el número los
   teléfonos seguirían sirviendo el app.js de antes.
   v7 (4/9/2026) misma razón: `app.js` suma `olvidarMemoria`, que es de
   lo que dependen las cinco pantallas nuevas para no seguir mostrando
   algo que la facultad dio de baja. Las pantallas en sí no necesitan
   esto —se sirven red primero—, pero el `app.js` que las sostiene sí.
   v8 (4/9/2026) `estilos.css` suma `.lista-libres`, que es como se ven
   las materias que se rinden libres en Fonoaudiología. La pantalla
   `carrera/` se sirve red primero y llega nueva, pero el CSS y el
   `plan-fono.js` que la sostienen salen de lo guardado: sin subir esto,
   el listado aparecía sin estilo y con los datos viejos.
   v9 (4/9/2026) `estilos.css` otra vez: se arregló un comentario mal
   cerrado que tenía apagada `--letra-mini` en toda la app. Quien alcanzó
   a guardar la v8 tiene el CSS roto adentro, y sin subir el número se lo
   quedaba. */
/* v14 (4/9/2026) `estilos.css` otra vez: la pastilla de estado del plan
   pasó a heredar el color del texto y «Aprobada» cambió de fondo. La
   pantalla `carrera/` llega nueva porque se sirve red primero, pero la
   hoja de estilos que la pinta sale de lo guardado: sin subir el número,
   quien ya tiene la v13 se queda con las pastillas ilegibles de noche.
   v15 (4/9/2026) `estilos.css` de nuevo, por el bloque «Empezar de
   nuevo» al pie de «Mi cursada». Sin subir el número, el botón llega
   pero sin la línea que lo separa del resumen.
   v16 (4/9/2026) `estilos.css` una vez más: «Te podés anotar» pasó a
   ser dos grupos plegables. Sin subir el número, los <details> llegan
   con la tipografía de los grupos de Agenda, que es tres puntos más
   grande y en Archivo Black.
   v17 (4/9/2026) `estilos.css` e `index.html`: la grilla de Instagram
   en el inicio. Sin subir el número, los cuadrados llegan sin estilo y
   se apilan a lo largo en vez de quedar de a tres.
   v18 (4/9/2026) `app.js` suma los hitos y de dónde vino la visita. Sin
   subir el número, quien ya tiene la app sigue anotando solo visitas y
   el 21 el embudo queda a medias: justo los teléfonos que más nos
   importa medir son los que ya la tienen instalada.
   v19 (5/9/2026) `estilos.css` e `iconos.js`: Estudiemos deja de tener
   tres bloques amarillos seguidos y pasa a buscador arriba, tres
   herramientas en superficie y una sola tarjeta amarilla abajo. Sin
   subir el numero, las herramientas llegan sin estilo —tres renglones
   de texto pelado— y el icono de subir no existe, asi que la tarjeta de
   compartir se queda con el emoji.
   v20 (5/9/2026) `app.js`: la recarga unica cuando entra una version
   nueva, por la carrera que dejaba HTML nuevo con app.js viejo. Sin
   subir el numero este arreglo no llega, que seria el colmo: es el
   arreglo de las publicaciones el que no se publicaria.
   v21 (5/9/2026) `app.js` y `estilos.css`: la fila de secciones se fue
   abajo y pasó a ser de cuatro. Sin subir el numero, quien ya tiene la
   app se queda sin ninguna barra: el HTML nuevo ya no dibuja la de
   arriba y el app.js viejo no sabe dibujar la de abajo.
   v22 (5/9/2026) `app.js` y `estilos.css`: la alarma de la mesa deja de
   ser una tarjeta en la portada y pasa a ser una alerta flotante en
   todas las pantallas. Sin subir el numero, la tarjeta ya no esta y la
   alerta todavia no llega: la mesa deja de avisarse en ningun lado.
   v23 (6/9/2026) `estilos.css`: la portada pregunta que carrera hacés
   en vez de invitar a armar la cursada. El `index.html` llega nuevo
   porque se sirve red primero, pero la hoja sale de lo guardado: sin
   subir el numero, la pregunta aparece adentro de la tarjeta amarilla
   y los tres botones de carrera quedan sin estilo, uno abajo del otro
   como texto pelado.
   v24 (6/9/2026) `estilos.css` y `app.js`: las fichas de dato en Mi año
   y el índice de secciones en el pie de todas las pantallas. Sin subir
   el numero pasan las dos cosas peores del caso: el `app.js` viejo
   nunca dibuja el índice —o sea que la mitad del cambio no llega— y en
   Mi año el HTML nuevo pide clases (`ficha-dato`, `progreso-barra`)
   que la hoja guardada no tiene, así que el promedio y los finales
   quedan como texto suelto sin caja, sin borde y sin tamaño.
   v25 (6/9/2026) `estilos.css`: en la solapa Plan, las materias
   trabadas pierden la segunda tinta. El `carrera/index.html` llega
   nuevo igual —se sirve red primero— y ya escribe cuántas
   correlativas faltan, así que sin subir el numero el texto se lee
   pero las treinta y una materias siguen pareciendo la misma cosa,
   que es justo lo que este cambio viene a resolver.
   v26 (6/9/2026) `estilos.css` y `lib/avisanos.js`: el saludo del chat
   abre con cuatro preguntas escritas como las diria una persona, en un
   renglon cada una. `avisanos.js` no esta en esta lista pero igual
   queda guardado la primera vez que alguien abre el chat, asi que sin
   subir el numero quien ya lo abrio sigue viendo las cuatro pastillas
   viejas; y si llegara el archivo nuevo con la hoja vieja, la clase
   `pregunta` no existe y las cuatro preguntas salen en mayusculas y
   partidas al medio.
   v27 (6/9/2026) `estilos.css`: el plan de estudios se puede imprimir.
   La pantalla `carrera/` llega nueva porque se sirve red primero, asi
   que el boton «Imprimir el plan» aparece igual; pero el bloque
   `@media print` vive en la hoja, que es armazon. Sin subir el numero,
   quien ya tiene la app toca el boton y le sale impresa la pantalla
   entera —cabecera, pestanas, botones y la vista que estuviera
   abierta— en vez del plan.
   v28 (6/9/2026) `estilos.css`: el boton de imprimir se fue al principio
   de la pestaña «Plan». Estaba al final y no se encontraba: quedaba
   debajo de las cuarenta y dos materias. Suma `.fila-imprimir`, y quien
   se haya llevado la hoja de v27 veria el boton y el texto pegados uno
   al lado del otro sin la fila que los ordena.
   v29 (6/9/2026) `estilos.css` e `index.html`: existe el glosario. La
   pantalla `glosario/` es nueva y se sirve red primero, asi que llega
   sola; pero la tarjeta del kit de la portada apuntaba a `quienes/` y
   esa portada SI esta guardada, y las clases `.glosario-corta` y
   `.glosario-ir` viven en la hoja, que es armazon. Sin subir el
   numero, quien ya tiene la app sigue yendo a la pagina de la
   agrupacion desde una tarjeta que dice «glosario».
   v30 (6/9/2026) `app.js`: el glosario entra al indice del pie, o sea a
   las doce pantallas. Tenia UNA sola puerta —la tarjeta del kit, en la
   portada— y quien lo leyo una vez no tenia como volver. El indice del
   pie lo dibuja `app.js`, que es armazon: sin subir el numero, quien ya
   tiene la app sigue sin ver la entrada en ninguna pantalla.
   v31 (6/9/2026) `estilos.css`: de noche, «Crear mi cuenta» no se veia.
   La placa amarilla de la portada no cambia con el tema, pero el boton
   de contorno hereda --texto, que de noche es casi blanco: contraste
   1,10 sobre el amarillo, medido. Ahora el boton y el anillo del foco
   van con la tinta fija, como ya lo hacen `.banda.tinta` y `.banda.sol`.
   El `index.html` llega nuevo igual —se sirve red primero— pero la
   hoja es armazon: sin subir el numero, quien ya tiene la app sigue
   sin poder leer de noche uno de los tres botones de la portada.
   v32 (7/9/2026) `app.js` y `estilos.css`: tres cosas que llegaron de
   la version que Maximo armo en AI Studio. Las tres tocan armazon y
   ninguna de las tres se ve sin subir el numero:
   · Pasar una fecha al calendario del celular. Los botones los pinta
     `htmlAgendarlo()`, que vive en `app.js`, y las clases `.agendarlo`
     y `.botones-agenda` en la hoja. Sin el numero nuevo, `agenda/`
     llega fresca de la red y no dibuja ningun boton, porque la
     funcion que los arma no existe en el `app.js` guardado.
   · El buscador del inicio mira seis cosas en vez de dos. Esto vive en
     `index.html`, que se sirve red primero, PERO usa `INDICE_PIE` y
     `memoriaDe()` de `app.js`. Con el `app.js` viejo, `INDICE_PIE`
     existe hace rato asi que no rompe; lo que no aparece es nada
     nuevo, porque toda la logica esta en la portada. Sube igual por
     los otros dos.
   · El mapa marca que pide y que abre cada materia. La pantalla
     `carrera/` llega nueva —red primero— pero los tres anillos y el
     renglon de arriba del mapa son `.mapa-nodo.pide`, `.abre`,
     `.elegida` y `.mapa-elegida`, todas en la hoja. Sin subir el
     numero, quien ya tiene la app toca una materia, el renglon le
     aparece sin caja y los anillos no se dibujan: o sea la funcion
     entera invisible. */
/* v33 (13/9/2026) `app.js`: Aulas Web entra al indice del pie, o sea a
   las doce pantallas. Es el mismo caso que v30 con el glosario: la
   lista `SISTEMAS_UNLP` vive en `app.js`, que es armazon, asi que sin
   subir el numero quien ya tiene la app sigue viendo tres sistemas y
   no cuatro. Y es la direccion donde cursa: es el enlace mas usado de
   los cuatro. Va tambien la tilde de «Legardon» en `glosario/`, que no
   necesitaria numero nuevo —las pantallas se sirven red primero— pero
   viaja en el mismo empujon. */
/* v34 (13/9/2026) `app.js` y `estilos.css`: existe `trayecto/`. La
   pantalla es nueva y llega sola, pero la puerta del indice del pie
   vive en `app.js` y la calculadora de las 120 horas se dibuja con
   clases de la hoja. Es el caso del v29 y el v30 juntos: sin subir el
   numero, quien ya tiene la app no ve la puerta y ve la pantalla sin
   estilos. */
/* v35 (13/9/2026) `app.js` y `estilos.css`: la carrera se elige desde
   el menú ☰ de todas las pantallas (CARRERAS_APP, anotarCarreraApp) y
   el inicio tiene la fila de chips. Las pantallas llegan nuevas, pero
   el inicio llama a funciones que viven en `app.js`: sin subir el
   número, quien ya tiene la app abre un inicio que se rompe. */
/* v36 (13/9/2026) `app.js`: los errores se traducen (explicarError,
   errorEnCastellano). `mi/` y `carrera/` llegan nuevas y llaman a
   errorEnCastellano justo cuando algo falla: con el `app.js` viejo esa
   llamada tira ReferenceError y en vez de un aviso no aparece nada. */
/* v37 (13/9/2026) `estilos.css`: las herramientas de Estudiemos pasan de
   grilla a riel que se desliza, con la cinta de datos abajo de cada
   tarjeta. La pantalla `estudiemos/` llega nueva —se sirve red
   primero— pero la hoja es armazon, y ahi esta TODO lo del riel. Sin
   subir el numero pasa lo peor: el HTML nuevo trae cuatro tarjetas
   apiladas a lo ancho sin `overflow-x`, o sea la fila desbordando la
   pantalla, y la cinta de datos sin la linea que la separa. */
/* v38 (13/9/2026) `estilos.css`: el movimiento de Estudiemos (entrada,
   flechas del riel, bloques que entran). La pantalla nueva trae la
   máscara del titular y dos botones de flecha; con la hoja vieja, las
   flechas salen como botones grises del sistema al lado del contador. */
/* v39 (13/9/2026) `movimiento.js` nuevo en el armazón, y `estilos.css`:
   el movimiento de Estudiemos se lleva a Inicio y a Fichas. Las
   pantallas llaman a entrarAlLlegar con `typeof` delante, así que con
   el armazón viejo siguen andando, quietas. */
/* v40 (13/9/2026) `estilos.css`: el renglón del estado vacío adentro de
   la invitación de Estudiemos. Con la hoja vieja sale en letra común,
   pegado al titular y sin su margen. */
/* v41 (13/9/2026) `estilos.css` y `movimiento.js`: la revisión de
   animaciones. El hover de las herramientas pasa a ser solo con mouse,
   las entradas se acortan y el encendido de palabras parte de 0,45. Sin
   subir el número, en el celular la tarjeta sigue quedando levantada. */
/* v42 (13/9/2026) `app.js` y `estilos.css`: existe `espacios/` (buffet y
   fotocopiadora). La puerta del ☰ y del pie vive en `app.js` y las
   tarjetas usan clases de la hoja: es el caso del v34. */
/* v43 (13/9/2026) `iconos.js`: el ícono de Espacios autogestivos. Sin
   subir el número, quien ya tiene la app sigue viendo el emoji 🤝. */
/* v44 (17/9/2026) `estudiemos/fichas/ficha.js`: el motor aprende el texto
   con formato de las 17 fichas de texto diseñadas. Sin subir, quien ya
   abrió una ficha tiene el motor viejo guardado y la nueva sale rota
   hasta la segunda visita. */
/* v45 (17/9/2026) `app.js` y este archivo: existe `mapa/`, el mapa de
   riesgo. El índice del pie lo dibuja `app.js`, que es armazón, y la
   regla que guarda Leaflet vive acá: sin subir el número, ni se llega a
   la pantalla desde el pie ni el mapa anda sin señal. */
/* v46 (17/9/2026) `mapa/riesgo.js`: las capas pasan de una fila de chips a un
   panel con las cinco capas de base. `mapa/index.html` va por red primero y
   ya no tiene la fila; con el `riesgo.js` guardado, que la busca, la
   pantalla se cortaba entera. */
/* v47 (17/9/2026) `fondo-red.js` nuevo en el armazón, y `estilos.css`: la
   red de nodos detrás de la interfaz. Las dos cosas van juntas y por eso
   sube el número: el color de la página se mudó del `body` al `html` para
   dejar lugar al lienzo, así que con la hoja nueva y sin el guion queda
   el fondo pelado sin red, y con el guion nuevo y la hoja vieja el body
   opaco tapa el lienzo y se dibuja algo que nadie ve. */
/* v48 (17/9/2026) `estilos.css`: las tarjetas, las etiquetas, los
   acordeones y los estados vacíos cambian de aspecto. El armazón se
   sirve primero desde la caja, así que sin subir el número quien ya
   tiene la app seguiría viendo la interfaz anterior. */
/* v49 (17/9/2026) `panel/index.html`: un comentario HTML con comillas
   invertidas, adentro del formulario de trámites, cortaba el texto del
   guion y el panel entero quedaba en los esqueletos. Sube para que quien
   ya tenía la versión rota guardada reciba la arreglada. (v48 queda
   reservado para el rediseño de `estilos.css`, que todavía no subió.) */
/* v50 (17/9/2026) el rediseño de v48 sale después de v49, que ya está
   publicado: sin pasar a v50, quien tiene v49 no recibe la hoja nueva. */
/* v51 (18/9/2026) entra `estilos-rediseno.css`, que va DESPUÉS de
   `estilos.css` en todas las pantallas: papel blanco cálido, sombras
   suaves en vez de la segunda tinta, y la agenda nueva (banner «Lo
   próximo», filtros, insignia HOY). Es un archivo nuevo del armazón:
   sin él en la lista, la primera carga sin red se vería sin rediseño. */
/* v52 (18/9/2026) la ronda 2 de la agenda: vista Semana, modo época
   de parciales y hoja de faltas, y «Mi cursada» en Mi perfil. Cambia
   `estilos-rediseno.css`, que es del armazón. */
/* v53 (18/9/2026) la campana de novedades: `app.js` la pone en la
   cabecera de todas las pantallas y `estilos-rediseno.css` la dibuja. */
/* v54 (18/9/2026) `estilos.css`: los correos largos de Cátedras se
   parten y la pantalla ya no se corre de costado en el teléfono. */
/* v55 (18/9/2026) `sw.js`: las pantallas esperan la red 6 s como mucho, no se guardan
   respuestas con error y la copia del armazón se saca a tiempo. */
/* v56 (18/9/2026) `app.js` suma `urlSegura()` y las pantallas que
   muestran enlaces cargados por el equipo la usan: un `javascript:`
   ya no se ejecuta al tocarlo. */
/* v57 (18/9/2026) `app.js` y `estilos-rediseno.css`: la mudanza a
   labolivarconvos.ar. Es lo que más necesita el número nuevo: quien
   abre la dirección vieja tiene el `app.js` guardado, y sin subir esto
   nunca le llega el código que lo muda con sus datos. */
/* v58 (18/9/2026) Lo que marcaron los estudiantes: la campana abre en
   el inicio (su panel usaba el mismo id que la lista de novedades de la
   portada), el botón «Mandanos tu resumen» se ve en tema claro, el chat
   ofrece desde el saludo pasar con un compa de la Bolívar, y el buscador
   de Info útil busca palabra por palabra. */
/* v59 (18/9/2026) `estilos.css` y Estudiemos: el material pasa a lista
   compacta, buscador y materia en una barra de vidrio pegada arriba, la
   materia se elige en una hoja desde abajo, y la invitación a compartir
   es un botón flotante (el bloque amarillo queda para el estado vacío). */
/* v60 (18/9/2026) Carrera: la hoja de la materia escucha solo su
   propio `transitionend` y lo suelta al cerrarse; antes, si la cerraba
   el respaldo por tiempo, se volvía a cerrar sola apenas se la abría. */
/* v61 (18/9/2026) Los videos de `estudiemos/videos/` no pasan por el
   service worker. Iban a caer en el armazón como cualquier archivo
   propio: 6 MB por video guardados para siempre, y encima servidos
   enteros cuando el navegador pide un pedazo (Range), que en el iPhone
   deja el video sin arrancar o sin poder adelantarse. */
/* v62 (18/9/2026) Rediseño de Estudiemos: portada por modos (Repasar,
   Practicar, Territorio), «seguí donde dejaste» y el esquema del mapa
   de riesgo. `estudiemos/fichas/ficha.js` suma la huella de lectura:
   sin número nuevo, quien ya abrió una ficha seguiría con el motor
   viejo y Estudiemos no sabría qué leyó. */
/* v63 (19/9/2026) Estudiemos: los videos «En un minuto» pasan a una
   fila de portadas arriba de los modos, antes que el mapa en las tres
   carreras, y el buscador encuentra cada video. */
/* v65 (19/9/2026) `estudiemos/estudiemos.css`: en el buscador, el
   rótulo «Herramienta» ya no se monta sobre la descripción a 375 px. La
   hoja se sirve de lo guardado; sin número nuevo, la primera visita
   después de subir seguía mostrando el rótulo encimado. */
/* v66 (19/9/2026) `estilos.css`: las placas de Instagram dejan la
   grilla de cuadraditos y entran al río de novedades como una tarjeta
   más, con su texto al lado. El inicio es una pantalla y llega fresco
   por la red, pero la hoja de estilos se sirve de lo guardado: sin
   número nuevo, la primera visita después de subir dibujaría las
   tarjetas nuevas con las reglas viejas, o sea sin la placa. */
/* v67 (19/9/2026) `estilos-rediseno.css`: las placas de Instagram
   dejan el río de novedades y pasan a una fila propia que se desliza
   y da la vuelta, con un visor que muestra el carrusel entero. La
   hoja se sirve de lo guardado: sin número nuevo, la primera visita
   después de subir dibujaría la fila sin sus reglas, o sea todas las
   portadas apiladas una abajo de la otra. */
/* v68 (19/9/2026) los avisos al celular. Acá abajo hay dos oyentes
   nuevos, `push` y `notificationclick`, y `app.js` suma el interruptor
   que los prende. Este número no es opcional esta vez: el service
   worker viejo NO tiene el oyente `push`, así que un teléfono que se
   quede con la v67 puede suscribirse igual y después no mostrar nunca
   el aviso que le llega. Se suscribe, no recibe, y no hay forma de
   darse cuenta desde afuera. */
/* v69 (20/9/2026) El pomodoro de Estudiemos: `estudiemos/estudiemos.css`
   y `estudiemos/portada.js` cambian, y las dos se sirven de lo guardado
   (la pantalla llega fresca por la red, el armazón que la sostiene no).
   Sin número nuevo, la primera visita después de subir dibujaría la
   tira del reloj sin una sola de sus reglas —el botón amarillo abajo
   de todo, el reloj en la tipografía del cuerpo— y el buscador
   seguiría sin encontrarlo. El `pomodoro.js` en sí es un archivo
   nuevo: ese llega igual, nadie lo tiene guardado.
   En el mismo número viajan `carrera/plan.js` y `carrera/plan-fono.js`:
   la ventanilla pasa a llamarse «Alumnos», que es como la nombra la
   facultad, y esas dos notas también salen de lo guardado. */
/* v70 (20/9/2026) «Lo que se consiguió» en el Consejo: las siete
   conquistas con su posteo de Instagram, plegado detrás de «Ver el
   posteo». Las reglas nuevas (`.conquistas`, `.cq-*`) viajan en
   `estilos.css`, que se sirve de lo guardado: sin número nuevo, la
   primera visita después de subir dibujaría la línea sin ninguna de
   ellas —los años sin pastilla, el riel sin riel y los renglones uno
   abajo del otro sin nada que los separe—. `consejo/index.html`
   también cambia, pero ese llega por la red; lo que lo tenía trabado
   era la hoja. */
/* v71 (21/9/2026) Estudiemos: la Fonoteca queda oculta hasta que se
   revise (`oculta:true` en `estudiemos/portada.js`, que se sirve de lo
   guardado: sin número nuevo seguiría apareciendo). */
/* v72 (21/9/2026) Estadísticas de visitas con Vercel Web Analytics:
   cada pantalla carga `/_vercel/insights/script.js`. Ese guion es de
   Vercel y lo cambian ellos, así que acá abajo va directo a la red y
   no se guarda en el armazón (guardado, podría quedar uno viejo que
   ya no cuente bien). Sin señal falla callado, que es lo que queremos:
   la app no depende de él. */
/* v73 (27/9/2026) `estilos.css` ya no existe: se partió en
   `css/tokens.css` (el panel de control estético), `css/base.css` (lo
   que usan todas) y siete hojas en `css/pantallas/`. El armazón nombraba
   `/estilos.css`, que ahora devuelve 404, y un teléfono con la app
   guardada se quedaba pegado a la hoja vieja. En la lista entran solo
   tokens y base: la hoja propia de una pantalla no va, la baja quien
   entre ahí y queda guardada sola por la regla del final de `sw.js`,
   mismo criterio que la librería grande de Supabase. */
/* v74 (27/9/2026) Tres piezas salieron de `app.js` a `lib/`. Cambia QUÉ
   se guarda: `lib/mudanza.js` entra al armazón porque la cargan las 22
   pantallas y carga ANTES de `app.js` —sin ella guardada, la primera
   visita sin señal se queda sin la mudanza—. `lib/fecha-al-calendario.js`
   y `lib/tarjeta-avisos.js` NO entran: las usa una pantalla cada una
   (Fechas y `mi/`). Y cambia el CONTENIDO de `app.js`, que ya estaba en
   la lista: quedó con 1970 líneas en vez de 2565, y sin subir el número
   los teléfonos seguirían sirviendo el viejo, que define lo que ahora
   está en `lib/` —y entonces habría dos definiciones o ninguna—. */
/* v75 (27/9/2026) `css/base.css` se partio en doce componentes bajo
   `css/base/`. Cambia QUE se guarda —entran doce archivos y sale uno— y
   ademas el viejo ya no existe: un telefono con la app guardada pedia
   `/css/base.css` y se quedaba sin la mitad de los estilos. Van los doce
   al armazon, no una parte: los usan todas las pantallas, la particion
   es para encontrar una regla sin abrir 3200 lineas, no para bajar
   menos. */
/* v76 (29/9/2026) no cambia QUÉ se guarda: cambia el CONTENIDO de dos
   archivos que ya están en la lista. `app.js` suma `puedeCargar()`, que
   es quien deja entrar a la pantalla nueva `cargar/`, y
   `css/base/01-cimientos.css` suma la regla de los chips que bajan de
   renglón ahí. Sin subir el número, un teléfono que ya tiene la app
   sirve el `app.js` viejo: `cargar/` lo llama, no existe, y la pantalla
   queda en blanco para la persona que justamente menos va a saber por
   qué. `cargar/index.html` NO va al armazón —es de una sola pantalla—:
   lo baja quien entre y queda guardado por la regla del final. */
/* v77 (30/9/2026) no cambia QUÉ se guarda: cambia el CONTENIDO de
   varios que ya están en la lista, por la tanda 1 de la propuesta 3
   (categorías y avisos por canal). `app.js` guarda los canales nuevos
   del timbre (paros, grupos, actividades y materias) con
   `guardar_aviso_canales`, y la campana marca los paros y lo
   suspendido. `css/tokens.css` suma los colores `--cat-*`;
   `css/base/03-controles.css`, `04-tarjetas.css` y `08-calendario.css`
   suman la etiqueta y el punto por categoría, la tarjeta suspendida y
   el día de paro pintado entero. Sin subir el número, un teléfono con
   la app sirve el CSS viejo y Fechas dibuja los puntos sin color, o
   el `app.js` viejo y el timbre no guarda los canales nuevos.
   `lib/fecha-al-calendario.js` y `lib/tarjeta-avisos.js` también
   cambian y NO van al armazón (una pantalla cada una): quedan
   guardados por la regla del final, y subir el número los tira
   igual. */
/* v78 (30/9/2026) no cambia QUÉ se guarda: cambia el CONTENIDO de
   tres que ya están en la lista, por la tanda 2 de la propuesta 3.
   `app.js` trae la campana nueva (la bandeja de Hoy, Esta semana,
   Cambios y Nuevo, lo leído por aviso y juntado con la cuenta) y la
   copia de la cursada que usa la tarjeta «Hoy». `lib/datos.js` suma
   `or`, que la campana nueva usa; `estilos-rediseno.css` suma cómo se
   ve la bandeja. Sin subir el número, un teléfono con la app sirve el
   `app.js` viejo con la campana vieja. Si llegaran desparejos —el
   `app.js` nuevo con el `datos.js` viejo, sin `or`—, la campana lo
   detecta por el error de la guardia y trae lo de antes. La tarjeta
   «Hoy» vive en `css/pantallas/inicio.css`, que no va al armazón: queda
   guardada por la regla del final, y subir el número también la tira.
   Esa hoja trae además el arreglo de la ruta del patio del fondo del
   inicio, rota desde el reparto de los estilos del 27/9. */
/* v79 (30/9/2026) no cambia QUÉ se guarda: cambia el CONTENIDO de tres
   que ya están en la lista. `css/base/08-calendario.css` rehace cómo se
   marca el mes: el calendario de Fechas rayaba todas las semanas con
   los períodos largos y no se entendía (captura del 30/9). Ahora son
   puntos para lo de un día, una banda suave para lo que dura de 2 a 10
   días, y lo más largo va abajo, en «Todo el mes». Se sacan las reglas
   de `.cal-barra`, que ya no usa nadie. `estilos-rediseno.css` suma
   `--hueco`, el hueco de la grilla que cubre la banda. Y el inicio pasa
   a usar el MISMO calendario que Fechas (`lib/fecha-al-calendario.js`,
   que no va al armazón): desde el 30/9 los dos marcan lo mismo. */
/* v80 (30/9/2026) Tanda 3 de la propuesta 3: «Voy» y «Me anoto». Cambia
   el CONTENIDO de dos del armazón: `css/base/01-cimientos.css` suma lo
   de Fechas (la caja de «Voy», las vistas Días y Mío, la clase de un
   día de paro en la semana) y `css/base/03-controles.css` la etiqueta
   «Vas» y el contador. Es nuevo `lib/voy.js`, que usan Fechas y el
   inicio: como `lib/fecha-al-calendario.js`, no va al armazón y queda
   guardado solo la primera vez que se baja. */
/* v81 (30/9/2026) Las 17 fichas de texto pasan al dibujo de la app. Es
   la rama del 24/9 (`claude/zealous-lamport-i64ppl`), que había quedado
   sin unir y se pensó como v73: `estudiemos/fichas/ficha-texto.js`
   pinta cabecera y pie, cambia los estilos sueltos por clases y suma el
   bloque «lo que te falta», y `estudiemos/fichas/assets/fichas-texto.css`
   se reescribe con las variables de la app. Los dos se sirven de lo
   guardado: sin subir, quien ya abrió una ficha recibe el HTML nuevo con
   la hoja y la lógica viejas. Al unirla, las 17 páginas cambiaron el
   `estilos.css` que ya no existe por las hojas de `css/` y suman
   `lib/mudanza.js`, como el resto desde el 27/9. */
/* v82 (30/9/2026) El Arsenal (`estudiemos/arsenal/`). No cambia el
   armazón: cambia CÓMO se sirve lo de esa carpeta. Su lista,
   `datos.json`, la edita la agrupación a mano en GitHub, y con la regla
   del final (lo guardado primero) un material recién sumado no aparecía
   hasta la visita siguiente: lo mismo que pasó con `videos.js` (v61). A
   diferencia de los videos, esto SÍ se guarda, porque el Arsenal y la
   lista del finde tienen que abrir sin señal. Así que todo lo de la
   carpeta que no es la pantalla (el JSON, `arsenal.js`, `marcas.js`,
   `arsenal.css`, las portadas) va como las pantallas: primero la red,
   a los 6 s lo guardado. Se sube el número porque cambia el propio
   `sw.js` y conviene que el nuevo tome el control en la visita
   siguiente, no cuando el navegador quiera.
   Antes de publicarla (3/10), dos cosas más entran en la misma v82:
   los 6 s pasan a ser para ir a lo guardado y no para rendirse (si no
   hay copia, se sigue esperando a la red; cortar dejaba la pantalla en
   «Cargando el Arsenal…» con señal floja), y `app.js`, que está en el
   armazón, suma Salud mental a `INDICE_PIE`: el buscador del inicio no
   la encontraba. */
/* v83 (4/10/2026) La época de parciales (propuesta 4). `app.js`, que
   está en el armazón, suma el hito «abrió una ficha» (se anota al tocar
   el link, porque las fichas dibujadas no cargan `app.js`). Lo demás es
   de una sola pantalla y no va a la lista: `estudiemos/parciales.js`
   (nuevo, la tira arriba de Estudiemos), `estudiemos/estudiemos.css`
   (sus atajos), `estudiemos/pomodoro.js` (el hito «terminó un
   pomodoro») y Fechas (el hito «prendió época de parciales», `?cat=` en
   el link, y la fecha en la clave `bolivar-enfoque` para que la cuenta
   no pise lo que se prendió desde Estudiemos). Se sube para que el
   `app.js` nuevo y esos guiones, que salen de lo guardado, lleguen en
   la visita siguiente. */
/* v84 (7/10/2026) El I° Congreso Interdisciplinario «Voces que habitan»
   (`congreso/`, nueva). `app.js`, que está en el armazón, suma el
   congreso a `INDICE_PIE` (el pie y el buscador del inicio). Lo demás es
   de una sola pantalla y no va a la lista: `congreso/congreso.js`,
   `css/pantallas/congreso.css`, el logo, la fachada y las placas de
   `congreso/`, y la tarjeta destacada del inicio (`index.html` y
   `css/pantallas/inicio.css`). Se sube para que el `app.js` nuevo
   llegue en la visita siguiente. */
/* v85 (7/10/2026) «Compartir con La Bolívar» desde el celular. Cambian
   dos cosas del service worker mismo: ataja el POST a `/compartir` (lo
   que manda el menú Compartir de Android), lo guarda en la caja
   `bolivar-compartido` y lleva a `cargar/?compartido=1`; y al activarse
   ya no borra esa caja, que no es de ninguna versión. Además cambia el
   contenido de `manifest.json`, que está en la lista: suma
   `share_target`. `lib/compartido.js` lo usan `cargar/` y `decilo/`, y
   no va a la lista. */
```
