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
const VERSION = 'bolivar-v12';
const ARMAZON = VERSION + '-armazon';
const PAGINAS = VERSION + '-paginas';

/* El armazón: lo que no cambia entre pantallas. */
const DEL_ARMAZON = [
  '/estilos.css',
  '/app.js',
  '/iconos.js',
  '/config.js',
  '/lectura.js',
  /* El cliente chico, que es el que usan seis de las diez pantallas.
     La librería grande (`/lib/supabase.js`, 213 KB) YA NO se guarda de
     entrada: la necesitan cuatro pantallas y guardarla acá obligaba a
     bajarla en la primera visita aunque la persona nunca las abriera.
     Igual queda guardada la primera vez que alguien entra a una de
     esas cuatro, por la regla de más abajo. */
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
