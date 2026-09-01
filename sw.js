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

const VERSION = 'bolivar-v2';
const ARMAZON = VERSION + '-armazon';
const PAGINAS = VERSION + '-paginas';

/* El armazón: lo que no cambia entre pantallas. */
const DEL_ARMAZON = [
  '/estilos.css',
  '/app.js',
  '/iconos.js',
  '/config.js',
  '/lectura.js',
  '/lib/supabase.js',
  '/manifest.json',
  '/imagenes/icono-192.png',
  '/imagenes/icono-512.png',
  '/imagenes/icono-32.png',
  '/imagenes/icono-96.png',
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
     por detrás, así nunca se espera pero tampoco se queda viejo. */
  evento.respondWith((async () => {
    const guardado = await caches.match(pedido);
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
