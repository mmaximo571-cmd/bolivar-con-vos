/* ============================================================
   EL SERVICE WORKER

   Hace dos cosas, y las dos importan para lo mismo: que la app siga
   estando cuando el teléfono no.

   1. Guarda el armazón de la app —el CSS, los guiones, los iconos— así
      la segunda visita abre al instante y no gasta datos de nuevo. En
      la red de la facultad eso es la diferencia entre abrir y no abrir.

   2. Es el requisito que pide Chrome para ofrecer instalar la app en la
      pantalla de inicio. Sin esto, el navegador nunca ofrece nada.

   Lo que NO hace: guardar respuestas de Supabase. Los trámites, las
   fechas y la agenda cambian, y una fecha vieja guardada es peor que
   no tener fecha: alguien se pierde una mesa por creerle a la app.
   ============================================================ */

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
   al lado del otro sin la fila que los ordena. */
const VERSION = 'bolivar-v28';
const ARMAZON = VERSION + '-armazon';
const PAGINAS = VERSION + '-paginas';

/* El armazón: lo que no cambia entre pantallas. */
const DEL_ARMAZON = [
  '/estilos.css',
  '/app.js',
  '/iconos.js',
  '/config.js',
  '/lectura.js',
  /* El cliente chico, que es el que usa la mayoría de las pantallas
     —desde el 6/9/2026 también Fechas—.
     La librería grande (`/lib/supabase.js`, 213 KB) YA NO se guarda de
     entrada: la necesitan tres pantallas y el panel, y guardarla acá
     obligaba a bajarla en la primera visita aunque la persona nunca
     las abriera. Igual queda guardada la primera vez que alguien entra
     a una de ellas, por la regla de más abajo. */
  '/lib/datos.js',
  '/manifest.json',
  '/imagenes/icono-192.png',
  '/imagenes/icono-512.png',
  '/imagenes/icono-32.png',
  '/imagenes/icono-96.png',
  /* El maskable es el que Android recorta a la forma del launcher, y es
     el único al que apunta el manifest para eso. Faltaba en esta lista:
     era el único icono declarado que no quedaba guardado. */
  '/imagenes/icono-maskable-512.png',
  /* Las tres capas del logo de la apertura. Van acá porque son lo
     PRIMERO que se ve al abrir y la animación no puede empezar hasta
     que estén: bajándolas de la red, cada visita nueva arrancaba con
     hasta seis décimas de rectángulo amarillo vacío mientras el
     teléfono además peleaba por el ancho de banda con las consultas de
     la agenda. Guardadas, la apertura arranca en el primer cuadro y la
     red queda entera para lo que la persona vino a buscar. */
  '/marca/map.png',
  '/marca/simon.png',
  '/marca/bolivar.png',
  '/sin-conexion.html'
];

self.addEventListener('install', evento => {
  evento.waitUntil((async () => {
    const c = await caches.open(ARMAZON);
    /* De a uno: si un archivo falla, no se cae la instalación entera. */
    await Promise.all(DEL_ARMAZON.map(u =>
      c.add(new Request(u, { cache:'reload' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', evento => {
  evento.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres
      .filter(n => n.indexOf(VERSION) !== 0)
      .map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* Deja que la página pida saltar la espera cuando hay versión nueva. */
self.addEventListener('message', e => {
  if (e.data === 'actualizar-ya') self.skipWaiting();
});

function esDeSupabase(url){
  return /supabase\.(co|in)$/.test(url.hostname) || url.pathname.indexOf('/rest/v1') === 0;
}

self.addEventListener('fetch', evento => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);

  /* Los datos NUNCA se guardan: una fecha vieja engaña. */
  if (esDeSupabase(url)) return;
  if (url.origin !== self.location.origin) return;

  /* Las pantallas: primero la red, y si no hay, la última que vimos.
     Así el contenido siempre está fresco cuando se puede. */
  if (pedido.mode === 'navigate'){
    evento.respondWith((async () => {
      try {
        const dela_red = await fetch(pedido);
        const c = await caches.open(PAGINAS);
        c.put(pedido, dela_red.clone());
        return dela_red;
      } catch(e){
        const guardada = await caches.match(pedido, { ignoreSearch:true });
        if (guardada) return guardada;
        const aviso = await caches.match('/sin-conexion.html');
        return aviso || new Response('Sin conexión', {
          status:503, headers:{ 'Content-Type':'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  /* El armazón: se sirve de lo guardado al instante y se refresca
     por detrás, así nunca se espera pero tampoco se queda viejo.

     OJO CON DÓNDE SE BUSCA. Antes decía `caches.match(pedido)` a secas,
     y eso busca en TODAS las cajas guardadas, incluidas las de versiones
     viejas que todavía no se borraron. O sea que subir una versión nueva
     no invalidaba nada: el armazón podía seguir saliendo de la caja de
     la versión anterior. Buscando adentro de la caja de ESTA versión, un
     cambio de VERSION vacía el armazón de verdad. */
  evento.respondWith((async () => {
    const caja = await caches.open(ARMAZON);
    const guardado = await caja.match(pedido);
    const dela_red = fetch(pedido).then(r => {
      if (r && r.ok){
        caches.open(ARMAZON).then(c => c.put(pedido, r.clone()));
      }
      return r;
    }).catch(() => null);
    return guardado || (await dela_red) ||
      new Response('', { status:504 });
  })());
});
