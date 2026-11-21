/* ============================================================
   LA BOLIVAR CON VOS · EL DESFASE ENTRE LA PANTALLA Y EL ARMAZÓN
   (17/11/2026, v111)

   Por qué existe. Después de cada publicación, la primera vez que
   alguien que ya tiene la app abre una pantalla pasa esto:

     1. `sw.js` sirve las pantallas primero de la red: llega el HTML
        NUEVO.
     2. Pero `app.js` y los demás guiones los sirve primero de lo
        guardado, y quien atiende esa carga es el service worker VIEJO
        (el nuevo recién se baja, se instala y toma el control con
        `skipWaiting` + `clients.claim` después de que la pantalla ya
        corrió). Sale el `app.js` VIEJO de su caja.
     3. El HTML nuevo llama a una función que el `app.js` viejo no
        tiene, y salta un ReferenceError: «respuestaIngreso is not
        defined», «Can't find variable: modoIngreso» en Safari.

   Del 11 al 17/11/2026 fueron 64 errores en el inicio, uno por cada
   persona que volvía por primera vez después del 11/11 (v102, cuando
   esas funciones entraron a `app.js`). Antes pasó con `icono`,
   `htmlAgendarlo`, `pintarAvisos`, `vigilarAparicion` y
   `pintarCuentaParciales`, y va a volver a pasar en cada publicación
   que sume una función a un guion guardado.

   La recarga que ya estaba en `app.js` (al cambiar de service worker)
   no alcanzaba: llega DESPUÉS de que la pantalla corrió y anotó el
   error, y si la instalación tarda más de 5 s no recarga.

   Por qué acá y no en `app.js` ni en `sw.js`: en la carga desfasada,
   los dos son los viejos. Lo único que seguro llega nuevo es el HTML y
   lo que el HTML pide por primera vez. Este archivo es nuevo, así que
   el service worker viejo no lo tiene y lo baja de la red. Por lo
   mismo carga ANTES de `app.js`: tiene que escuchar los errores antes
   que el registro de `app.js`, para atajarlos sin que se anoten.

   Qué hace. Ante un ReferenceError en los primeros segundos de una
   pantalla servida por un service worker:
     · no lo deja llegar al registro de errores;
     · le pide al navegador que busque el service worker nuevo y, cuando
       toma el control, recarga UNA vez. Ya sale todo de la caja nueva.
     · Si no hay service worker nuevo (se cambió un guion sin subir
       VERSION), la carga desfasada ya refrescó la copia guardada por
       detrás: alcanza con recargar.

   No depende de ningún nombre de función, así que vale para las
   publicaciones que vengan.

   Los frenos, porque una recarga automática mal puesta es un bucle:
     · Una vez cada dos minutos por pestaña (`sessionStorage`). Si
       después de recargar el error vuelve, es un error de verdad y se
       anota como siempre.
     · Solo en los primeros 15 s: el desfase rompe al abrir. Un error
       más tarde se deja pasar y no se le mueve la pantalla a nadie.
     · Sin service worker que controle la pantalla no hay desfase
       posible (todo vino de la red), y no se toca nada.

   NO DEPENDE DE NADA y conviene que no cambie: si cambia, también lo
   sirve viejo el service worker viejo en la primera carga.
   ============================================================ */
(function(){
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;

  var LLAVE = 'bolivar-desfase';
  var arranco = Date.now();
  var curando = false;

  function yaSeIntento(){
    /* Sin sessionStorage no hay freno del bucle: mejor no intentar. */
    try { return Date.now() - Number(sessionStorage.getItem(LLAVE) || 0) < 120000; }
    catch(e){ return true; }
  }

  function recargar(){
    /* Si la instalación tardó tanto, la persona ya está mirando otra
       cosa: no se le mueve la pantalla. La que abra después sale bien. */
    if (Date.now() - arranco > 20000) return;
    location.reload();
  }

  function curar(){
    curando = true;
    try { sessionStorage.setItem(LLAVE, String(Date.now())); } catch(e){}
    /* Para ver en `sucesos` que esto pasa y se cura (tipo `hito`). Con
       `typeof` porque es justo el momento en que app.js puede ser otro. */
    try { if (typeof anotarHito === 'function') anotarHito('desfase atajado'); } catch(e){}

    navigator.serviceWorker.addEventListener('controllerchange', recargar);
    navigator.serviceWorker.getRegistration().then(function(reg){
      if (!reg) return recargar();
      return reg.update().catch(function(){}).then(function(){
        /* Hay uno nuevo: al terminar de instalarse toma el control solo
           (skipWaiting + claim) y `controllerchange` recarga. */
        if (reg.waiting) reg.waiting.postMessage('actualizar-ya');
        else if (!reg.installing){
          /* No hay versión nueva: la copia se refrescó por detrás en
             esta misma carga. Un respiro para que termine de guardarse. */
          setTimeout(recargar, 1500);
        }
      });
    }).catch(recargar);
  }

  function atajar(e, error){
    if (!(error instanceof ReferenceError)) return;
    if (!curando){
      if (Date.now() - arranco > 15000 || yaSeIntento()) return;
      curar();
    }
    /* Mientras se cura, los que siguen son del mismo desfase. */
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  window.addEventListener('error', function(e){ atajar(e, e.error); });
  window.addEventListener('unhandledrejection', function(e){ atajar(e, e.reason); });
})();
