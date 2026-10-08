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
   lista, porque acá abajo se sirve lo guardado antes que la red.
   Por qué subió cada número (v4 en adelante): `docs/HISTORIAL-SW.md`.
   Al subirlo, anotar ahí el número, la fecha y el porqué. */
const VERSION = 'bolivar-v88';
const ARMAZON = VERSION + '-armazon';
const PAGINAS = VERSION + '-paginas';

/* El armazón: lo que no cambia entre pantallas. */
const DEL_ARMAZON = [
  /* Los estilos, partidos desde el 27/9/2026. Acá van solo las dos
     hojas que usa CUALQUIER pantalla; la hoja propia de una pantalla
     (`/css/pantallas/carrera.css` y las demás) no se guarda de entrada
     —la baja quien entre a esa pantalla, y queda guardada sola por la
     regla del final—. Mismo criterio que la librería grande. */
  '/css/tokens.css',
  /* La base se partio en doce componentes el 27/9/2026. Van los doce:
     no es que cada pantalla use unos y no otros —los usan todas—, es
     que asi se encuentra una regla sin abrir 3200 lineas. El ORDEN de
     esta lista no importa para guardar, pero si importa en el HTML de
     cada pantalla, y es el numerado. */
  '/css/base/01-cimientos.css',
  '/css/base/02-encabezado.css',
  '/css/base/03-controles.css',
  '/css/base/04-tarjetas.css',
  '/css/base/05-secciones.css',
  '/css/base/06-hoja.css',
  '/css/base/07-avisos.css',
  '/css/base/08-calendario.css',
  '/css/base/09-avisanos.css',
  '/css/base/10-lectura.css',
  '/css/base/11-navegacion.css',
  '/css/base/12-movimiento.css',
  '/estilos-rediseno.css',
  /* La mudanza a labolivarconvos.ar salio de app.js el 27/9/2026 y se
     carga antes que el: tiene que estar guardada igual que app.js, o la
     primera visita sin senal se queda sin ella. Las otras dos piezas que
     salieron (`fecha-al-calendario` y `tarjeta-avisos`) no van aca: la
     primera la usan dos pantallas (Fechas y, desde el 30/9, el inicio)
     y la segunda una, y ninguna dibuja su calendario sin red. Quedan
     guardadas solas por la regla del final. */
  '/lib/mudanza.js',
  '/app.js',
  '/iconos.js',
  '/config.js',
  '/lectura.js',
  '/movimiento.js',
  '/fondo-red.js',
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
    /* Menos lo compartido, que no es de ninguna versión (ver «Compartir»). */
    await Promise.all(nombres
      .filter(n => n.indexOf(VERSION) !== 0 && n !== 'bolivar-compartido')
      .map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* Deja que la página pida saltar la espera cuando hay versión nueva. */
self.addEventListener('message', e => {
  if (e.data === 'actualizar-ya') self.skipWaiting();
});

/* ============================================================
   LOS AVISOS QUE LLEGAN CON LA APP CERRADA

   Esto es lo único del service worker que corre cuando la app NO
   está abierta: el teléfono lo despierta, le da el mensaje cifrado
   que mandó Supabase, y se vuelve a dormir.

   Quien manda es `supabase/functions/avisos/index.ts`; quién lo
   recibe se decide en Mi perfil. Acá solo se dibuja.

   REGLA DEL NAVEGADOR: si entra un `push`, TIENE que salir una
   notificación. Chrome le cuenta a cada sitio las veces que lo
   despertó sin mostrar nada, y a las pocas deja de despertarlo. Por
   eso hay un aviso de reserva: si el mensaje viene vacío o mal
   armado, igual se muestra algo antes que nada.
   ============================================================ */
self.addEventListener('push', evento => {
  let a = {};
  try { a = evento.data ? evento.data.json() : {}; } catch(e){ a = {}; }

  const titulo = a.titulo || 'La Bolívar con vos';
  const cuerpo = a.cuerpo || 'Tocá para ver qué hay de nuevo.';

  evento.waitUntil(self.registration.showNotification(titulo, {
    body:  cuerpo,
    icon:  '/imagenes/icono-192.png',
    badge: '/imagenes/icono-96.png',
    lang:  'es-AR',

    /* El `tag` hace que un aviso del mismo asunto REEMPLACE al
       anterior en vez de apilarse. Si por lo que sea sale dos veces
       «mañana cierra la inscripción», en el teléfono se ve una. */
    tag:   a.clave || 'bolivar',

    /* Sin esto, el aviso que llegó mientras el teléfono estaba
       guardado se muestra callado y nadie lo ve hasta el otro día.
       La inscripción dura cuatro días: vale el sonido. */
    renotify: !!a.clave,

    data:  { url: a.url || '/' }
  }));
});

/* Tocar el aviso tiene que llevar AL LUGAR, no a la portada. Si la
   app ya está abierta en alguna pestaña se reusa esa —abrir una
   segunda copia de una app instalada desconcierta— y recién si no
   hay ninguna se abre una nueva. */
self.addEventListener('notificationclick', evento => {
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url) || '/';

  evento.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({
      type: 'window', includeUncontrolled: true
    });
    for (const c of abiertas){
      if (new URL(c.url).origin === self.location.origin){
        await c.focus();
        if ('navigate' in c) { try { await c.navigate(destino); } catch(e){} }
        return;
      }
    }
    await self.clients.openWindow(destino);
  })());
});

function esDeSupabase(url){
  return /supabase\.(co|in)$/.test(url.hostname) || url.pathname.indexOf('/rest/v1') === 0;
}

self.addEventListener('fetch', evento => {
  const pedido = evento.request;

  /* «COMPARTIR» DESDE EL CELULAR (7/10/2026, v85)
     Lo que se comparte con la app (`share_target` en manifest.json)
     llega acá como un formulario. No hay servidor que lo reciba —el
     sitio es estático—, así que se guarda en una caja aparte y se
     manda a `cargar/`, que lo lee con `lib/compartido.js`. La caja no
     lleva la versión en el nombre a propósito: lo compartido no es
     parte de la app, y que una actualización justo en ese momento lo
     borre es perder lo que alguien acaba de mandar. */
  if (pedido.method === 'POST' && new URL(pedido.url).pathname === '/compartir'){
    evento.respondWith((async () => {
      try {
        const datos = await pedido.formData();
        /* WhatsApp manda el mensaje en `texto`; otras apps mandan un
           título o un enlace aparte. Se juntan en un solo texto. */
        const texto = ['titulo', 'texto', 'enlace']
          .map(k => String(datos.get(k) || '').trim()).filter(Boolean).join('\n');
        const placa = datos.get('placa');
        await caches.delete('bolivar-compartido');
        const caja = await caches.open('bolivar-compartido');
        const cuando = { 'X-Cuando': String(Date.now()) };
        await caja.put('/compartido/texto', new Response(texto, { headers: cuando }));
        if (placa && placa.size){
          await caja.put('/compartido/placa', new Response(placa, {
            headers: { 'Content-Type': placa.type || 'image/jpeg' } }));
        }
      } catch(e){}
      return Response.redirect('/cargar/?compartido=1', 303);
    })());
    return;
  }

  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);

  /* Los datos NUNCA se guardan: una fecha vieja engaña. */
  if (esDeSupabase(url)) return;

  /* Leaflet, el mapa de `mapa/`. Es lo único de afuera que se guarda:
     sin esto, la segunda visita sin señal —que en un barrio es la
     normal— no tiene mapa aunque ya lo haya bajado. Va atado a la
     versión 1.9.4 en la dirección, así que nunca cambia: se sirve de lo
     guardado sin preguntar. Las calles (los azulejos de OpenStreetMap)
     NO se guardan: son miles y su licencia no deja bajarlos en masa. */
  if (url.hostname === 'cdnjs.cloudflare.com' &&
      url.pathname.indexOf('/ajax/libs/leaflet/1.9.4/') === 0){
    evento.respondWith((async () => {
      const caja = await caches.open(ARMAZON);
      const guardado = await caja.match(pedido);
      if (guardado) return guardado;
      const r = await fetch(pedido);
      if (r && r.ok) caja.put(pedido, r.clone());
      return r;
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* Las estadísticas de Vercel: directo a la red, nunca guardadas (v72). */
  if (url.pathname.indexOf('/_vercel/') === 0) return;

  /* Los videos van directo a la red, sin guardarse (ver v61). Y todo
     lo de su carpeta también: la lista `videos.js` servida de lo
     guardado mostraba la lista vieja hasta la visita siguiente, o sea
     que un video recién subido no aparecía. La pantalla en sí (que es
     `navigate`) sigue hasta el bloque de abajo y se guarda como las demás. */
  if (pedido.destination === 'video' || pedido.headers.has('range') ||
      /\.(mp4|webm|mov)$/i.test(url.pathname) ||
      (pedido.mode !== 'navigate' && url.pathname.indexOf('/estudiemos/videos/') === 0)) return;

  /* El Arsenal (v82): su lista, datos.json, la edita la agrupación a
     mano, y servida de lo guardado un material recién sumado no
     aparecía hasta la visita siguiente (lo mismo que videos.js). Pero a
     diferencia de los videos, SÍ se guarda: sin señal, el Arsenal y la
     lista del finde tienen que abrir. Todo lo de la carpeta va como las
     pantallas, primero la red; lo que no es pantalla, si falla, no cae
     en sin-conexion.html: un JSON que llega como HTML rompe peor.
     LOS 6 SEGUNDOS SON PARA IR A LO GUARDADO, NO PARA RENDIRSE: si a
     los 6 s no hay copia (la primera visita con señal floja), se sigue
     esperando a la red. Cortar ahí dejaba arsenal.js sin correr y la
     pantalla en «Cargando el Arsenal…» para siempre. El 504 queda solo
     para cuando la red falla de verdad y no hay copia. */
  if (pedido.mode !== 'navigate' && url.pathname.indexOf('/estudiemos/arsenal/') === 0){
    evento.respondWith((async () => {
      const red = fetch(pedido).then(r => {
        if (r.ok){
          const copia = r.clone();
          caches.open(PAGINAS).then(c => c.put(pedido, copia));
        }
        return r;
      });
      try {
        return await Promise.race([
          red,
          new Promise((_, no) => setTimeout(() => no(new Error('lenta')), 6000))
        ]);
      } catch(e){
        const guardada = await caches.match(pedido, { ignoreSearch:true });
        if (guardada) return guardada;
        try { return await red; }
        catch(err){ return new Response('', { status:504 }); }
      }
    })());
    return;
  }

  /* Las pantallas: primero la red, y si no hay, la última que vimos.
     Así el contenido siempre está fresco cuando se puede. */
  if (pedido.mode === 'navigate'){
    evento.respondWith((async () => {
      try {
        /* Con señal débil el fetch puede colgarse minutos sin fallar:
           a los 6 s se da por perdido y se sirve la guardada. */
        const dela_red = await Promise.race([
          fetch(pedido),
          new Promise((_, no) => setTimeout(() => no(new Error('lenta')), 6000))
        ]);
        /* Solo se guarda una pantalla que llegó bien: un 404 o un 500
           guardado pisaría la buena que servimos sin señal. */
        if (dela_red.ok){
          const copia = dela_red.clone();
          caches.open(PAGINAS).then(c => c.put(pedido, copia));
        }
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
      /* La copia se saca YA: si se saca dentro del `then`, la página
         puede haber leído la respuesta antes y el clone tira error. */
      if (r && r.ok){
        const copia = r.clone();
        caches.open(ARMAZON).then(c => c.put(pedido, copia));
      }
      return r;
    }).catch(() => null);
    return guardado || (await dela_red) ||
      new Response('', { status:504 });
  })());
});
