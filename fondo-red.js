/* ============================================================
   LA RED DE FONDO · una malla que respira detrás de la interfaz

   Nodos en deriva lenta y enlaces que aparecen SOLO cuando dos
   puntos se acercan. Trazo de 1 px, opacidad baja, capa de abajo:
   estructura visible sin competir con lo que se está leyendo.

   POR QUÉ SON VARIOS LIENZOS Y NO UNO. Las pantallas de esta app
   están armadas de dos maneras distintas, y un solo lienzo detrás
   de todo sirve para una sola de las dos:

   - Fechas, Mi año, el panel y la mayoría: el contenido flota
     sobre el fondo de la página. Ahí alcanza con UN lienzo fijo,
     pegado a la ventana, detrás de todo.
   - Quiénes somos, Consejo, Glosario, Trayecto, Espacios y
     Fonoteca están hechas de BANDAS de borde a borde —.banda
     tinta, .banda papel, .banda sol— y cada banda tiene su propio
     color opaco. Apiladas tapan la pantalla entera: el lienzo fijo
     queda abajo de todo y no se ve un solo nodo. (El pie de
     página es una banda, así que esto pasa en TODAS las pantallas,
     no solo en esas seis.)

   Entonces hay un lienzo fijo para el fondo de la página y uno
   adentro de cada banda. Lo de la banda encaja sin pelear con
   nada: la hoja ya dice `.banda{position:relative}` y
   `.banda > .envoltura{z-index:1}`, o sea que el contenido de la
   banda ya está levantado. El lienzo entra como primer hijo, en
   z-index 0: arriba del color de la banda y abajo de su texto.

   Los lienzos que no están a la vista no dibujan: un solo bucle
   recorre las capas y saltea las que el IntersectionObserver
   marcó como fuera de pantalla.

   Se carga DESPUÉS de app.js: usa menosMovimiento() y
   alCambiarMovimiento() de ahí. Si por lo que sea no están, hay
   una respuesta de emergencia más abajo y la red igual arranca.
   ============================================================ */
(function(){

/* ------------------------------------------------------------
   LOS NÚMEROS

   Son los del diseño, no inventados acá. Cada uno tiene su porqué
   al lado porque son justo los que uno tienta a tocar.
   ------------------------------------------------------------ */
var AJUSTES = {
  /* Un nodo cada N píxeles cuadrados. Da ~60 en una pantalla de
     escritorio. Más denso que esto y deja de ser un fondo: se
     vuelve un dibujo. */
  densidad: 22000,

  /* Techo y piso, por capa. El techo es por costo (ver O(n²) más
     abajo). El piso existe por los teléfonos y por las bandas
     bajas: una banda de 375x300 da 5 nodos con la densidad de
     arriba y queda vacía, así que ahí manda el piso. */
  nodosMax: 90,
  nodosMin: 16,

  /* Píxeles por segundo. Por encima de 25 el fondo se vuelve
     protagonista y molesta para leer. */
  velocidad: 13,

  /* A qué distancia dos nodos se enlazan. */
  radio: 158,

  /* Opacidad de la capa. La de abajo es para los fondos claros:
     la tinta oscura sobre papel contrasta más que el amarillo
     sobre negro, así que pide menos alfa para pesar lo mismo. */
  opacidad: 0.22,
  opacidadClaro: 0.82,

  /* LOS DOS TONOS. El primero es el amarillo de la Agrupación tal
     cual: sobre un fondo oscuro brilla y es la marca.

     El segundo es ese mismo amarillo bajado hasta que se lee
     contra un fondo claro. Hace falta porque el fondo de la app
     YA es amarillo, y la banda `sol` es amarillo pleno: amarillo
     sobre amarillo no se ve. Sigue siendo el color de la marca,
     un par de pasos más hondo. */
  tono:      '#F9E830',
  tonoHondo: '#8A7512',

  /* Los nodos como puntitos, además de las líneas. */
  puntos: true,

  /* Los nodos se dejan empujar por el cursor y se enlazan con él.
     Es lo que hace que la malla se sienta viva en vez de un GIF.
     Si alguna vez distrae para leer, se apaga poniendo false acá
     y no hay que tocar nada más. */
  cursor: true,
  radioCursor: 240
};

/* ------------------------------------------------------------
   ¿HAY QUE MOVER?

   Con «menos movimiento» la malla se dibuja igual, con sus
   enlaces y todo, pero quieta. Se sigue viendo la estructura; lo
   único que se va es el movimiento, que es lo que se pidió.
   ------------------------------------------------------------ */
function quiereQuieto(){
  /* La de app.js pregunta el valor de AHORA, que es lo correcto:
     quien activa «menos movimiento» con la app abierta es
     exactamente quien ya se empezó a marear. */
  if (typeof menosMovimiento === 'function') return menosMovimiento();
  return !!(window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function aRGB(hex){
  var h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
var RGB_TONO  = aRGB(AJUSTES.tono);
var RGB_HONDO = aRGB(AJUSTES.tonoHondo);

function esDeNoche(){
  return document.documentElement.dataset.tema === 'oscuro';
}

/* ------------------------------------------------------------
   UNA CAPA

   `suelo` dice sobre qué color va a dibujar, que es lo único que
   decide el tono:
     'tinta'  la banda negra. Siempre oscura, de día y de noche.
     'sol'    la banda amarilla. Siempre clara, de día y de noche.
     'tema'   sigue el modo de la app: la banda papel y el fondo
              de la página, que son los que se dan vuelta.
   ------------------------------------------------------------ */
function Capa(lienzo, suelo){
  this.lienzo = lienzo;
  this.suelo = suelo;
  this.pts = null;
  this.an = 0; this.al = 0;
  this.ctx = null; this.dpr = 1;
  this.aLaVista = true;
  this.pendiente = 0;
}

Capa.prototype.oscuroAbajo = function(){
  if (this.suelo === 'tinta') return true;
  if (this.suelo === 'sol') return false;
  return esDeNoche();
};

Capa.prototype.cuantos = function(){
  return Math.max(AJUSTES.nodosMin,
         Math.min(AJUSTES.nodosMax,
         Math.round((this.an * this.al) / AJUSTES.densidad)));
};

/* OJO CON CUÁNDO SE MIDE. Este guion corre al final del cuerpo, y
   ahí el navegador todavía puede no haber resuelto la caja: la
   primera medición volvía con unos pocos píxeles y los nodos
   nacían todos amontonados en la esquina de arriba a la izquierda.

   Por eso dos cosas. Una, hay un ResizeObserver que vuelve a medir
   apenas la caja es real, sin esperar a que alguien mueva la
   ventana. Y dos, al cambiar de tamaño los nodos se reubican EN
   PROPORCIÓN en vez de recortarse contra el borde: si uno estaba a
   un tercio del ancho, sigue a un tercio del ancho. Eso hace que
   la malla acompañe el cambio sin pegar un salto, y de paso
   endereza sola la medición fallada del arranque. */
Capa.prototype.medir = function(){
  /* El tope de 2 es por las pantallas de mucha densidad: dibujar a
     3x cuesta el doble y en un trazo de 1 px no se nota. */
  this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  var a = this.lienzo.clientWidth  || 0;
  var l = this.lienzo.clientHeight || 0;
  if (!a || !l) return false;
  if (a === this.an && l === this.al && this.pts) return false;

  this.lienzo.width  = Math.round(a * this.dpr);
  this.lienzo.height = Math.round(l * this.dpr);
  this.ctx = this.lienzo.getContext('2d');
  this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

  var antesAn = this.an, antesAl = this.al;
  this.an = a; this.al = l;

  if (!this.pts) this.armar();
  else {
    var ea = antesAn ? a / antesAn : 1, el = antesAl ? l / antesAl : 1;
    for (var i = 0; i < this.pts.length; i++){
      this.pts[i].x *= ea; this.pts[i].y *= el;
    }
    /* Si la caja cambió tanto que le corresponde otra cantidad de
       nodos —girar el teléfono, abrir la ventana a pantalla
       completa—, se rearma. Mientras el número dé igual no se
       toca: rearmar en cada resize haría que la malla se reinicie
       cada vez que el navegador del celular esconde la barra de
       direcciones, que es todo el tiempo. */
    if (this.cuantos() !== this.pts.length) this.armar();
  }
  return true;
};

Capa.prototype.armar = function(){
  var n = this.cuantos();
  this.pts = [];
  for (var i = 0; i < n; i++){
    var ang = Math.random() * Math.PI * 2;
    /* Velocidades desparejas: si todos van igual de rápido la
       malla se mueve en bloque y se nota que es un bucle. */
    var v = AJUSTES.velocidad * (0.55 + Math.random() * 0.9);
    this.pts.push({
      x: Math.random() * this.an, y: Math.random() * this.al,
      vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
      r: 0.9 + Math.random() * 1.5
    });
  }
};

/* Dónde cae el cursor DENTRO de esta capa. El lienzo fijo arranca
   en 0,0 de la ventana, así que ahí las coordenadas del evento ya
   sirven; el de una banda está donde esté la banda. La caja se
   pregunta una vez por cuadro, no por nodo. */
Capa.prototype.cursorLocal = function(){
  if (!cursor.activo) return null;
  var r = this.lienzo.getBoundingClientRect();
  var x = cursor.x - r.left, y = cursor.y - r.top;
  if (x < -AJUSTES.radioCursor || y < -AJUSTES.radioCursor ||
      x > this.an + AJUSTES.radioCursor ||
      y > this.al + AJUSTES.radioCursor) return null;
  return { x: x, y: y };
};

Capa.prototype.cuadro = function(paso){
  var ctx = this.ctx, pts = this.pts;
  if (!ctx || !pts) return;

  var W = this.an, H = this.al;
  var R = AJUSTES.radio, R2 = R * R;
  var hondo = this.oscuroAbajo();
  var c = hondo ? RGB_TONO : RGB_HONDO;
  var base = AJUSTES.opacidad * (hondo ? 1 : AJUSTES.opacidadClaro);
  var cur = (AJUSTES.cursor && paso) ? this.cursorLocal() : null;
  var i, j, p, dx, dy, d2, d, k;

  /* --- deriva --- */
  for (i = 0; i < pts.length; i++){
    p = pts[i];
    if (cur){
      dx = cur.x - p.x; dy = cur.y - p.y;
      d2 = dx*dx + dy*dy;
      if (d2 < AJUSTES.radioCursor * AJUSTES.radioCursor && d2 > 1){
        d = Math.sqrt(d2);
        var f = (1 - d / AJUSTES.radioCursor) * 24 * paso;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }
    /* Amortiguación: el cursor acelera los nodos y sin esto, al
       rato, la malla es un enjambre. Los que se pasaron de rosca
       frenan de a poco hasta volver a la velocidad nominal. */
    var sp = Math.sqrt(p.vx*p.vx + p.vy*p.vy) || 1;
    if (sp > AJUSTES.velocidad * 1.9){ p.vx *= 0.97; p.vy *= 0.97; }

    p.x += p.vx * paso; p.y += p.vy * paso;
    /* Rebote contra los bordes de la capa. */
    if (p.x < 0) { p.x = 0; p.vx =  Math.abs(p.vx); }
    if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx); }
    if (p.y < 0) { p.y = 0; p.vy =  Math.abs(p.vy); }
    if (p.y > H) { p.y = H; p.vy = -Math.abs(p.vy); }
  }

  ctx.clearRect(0, 0, W, H);
  /* Trazo constante, sin escalar con la densidad. En pantallas de
     mucha definición 0,75 se ve igual de fino que 1 en las otras. */
  ctx.lineWidth = this.dpr > 1 ? 0.75 : 1;

  /* --- enlaces ---
     Esto es O(n²): con 60 nodos son ~1.800 comparaciones por
     cuadro, nada para el hilo principal. Por eso el techo de 90:
     a 200 nodos serían 20.000 y ahí sí se siente. Y por eso las
     capas fuera de pantalla no entran acá. */
  for (i = 0; i < pts.length; i++){
    var a = pts[i];
    for (j = i + 1; j < pts.length; j++){
      var b = pts[j];
      dx = a.x - b.x; dy = a.y - b.y; d2 = dx*dx + dy*dy;
      if (d2 > R2) continue;
      /* La opacidad al cuadrado es lo que hace que el enlace entre
         y salga sin corte duro: al ras del radio vale casi cero. */
      k = 1 - Math.sqrt(d2) / R;
      ctx.strokeStyle = 'rgba('+c[0]+','+c[1]+','+c[2]+','+(k*k*base).toFixed(3)+')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  /* --- enlaces al cursor --- */
  if (cur){
    for (i = 0; i < pts.length; i++){
      p = pts[i];
      dx = p.x - cur.x; dy = p.y - cur.y; d2 = dx*dx + dy*dy;
      if (d2 > R2) continue;
      k = 1 - Math.sqrt(d2) / R;
      ctx.strokeStyle = 'rgba('+c[0]+','+c[1]+','+c[2]+','+(k*k*base*1.6).toFixed(3)+')';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
    }
  }

  /* --- los nodos --- */
  if (AJUSTES.puntos){
    ctx.fillStyle = 'rgba('+c[0]+','+c[1]+','+c[2]+','+(base*2.6).toFixed(3)+')';
    for (i = 0; i < pts.length; i++){
      p = pts[i];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
  }
};

/* ------------------------------------------------------------
   EL CONJUNTO
   ------------------------------------------------------------ */
var capas = [];
var cursor = { x: -1e4, y: -1e4, activo: false };
var pedido = 0, ultimo = 0, quieto = false;
var observaCaja = null, observaVista = null;

function nuevoLienzo(fijo){
  var l = document.createElement('canvas');
  l.className = 'red-fondo';
  l.setAttribute('aria-hidden', 'true');
  /* Los estilos van acá y no en estilos.css a propósito: si el
     guion no corre, el elemento tampoco existe, así que no hay
     ninguna regla huérfana esperando en la hoja. */
  l.style.cssText =
    (fijo ? 'position:fixed;z-index:-1;' : 'position:absolute;z-index:0;') +
    'inset:0;width:100%;height:100%;pointer-events:none';
  return l;
}

function sueloDeBanda(el){
  if (el.classList.contains('tinta')) return 'tinta';
  if (el.classList.contains('sol'))   return 'sol';
  return 'tema';   /* papel, y cualquier banda sin color propio */
}

function sumarCapa(lienzo, suelo){
  var c = new Capa(lienzo, suelo);
  capas.push(c);
  if (observaCaja) observaCaja.observe(lienzo);
  if (observaVista){ c.aLaVista = false; observaVista.observe(lienzo); }
  c.medir();
  return c;
}

function armarTodo(){
  /* 1. El lienzo fijo, detrás del fondo de la página. */
  var fijo = nuevoLienzo(true);
  document.body.appendChild(fijo);
  sumarCapa(fijo, 'tema');

  /* 2. Uno adentro de cada banda, arriba de su color y abajo de
        su contenido. Va como PRIMER hijo: las bandas y el lienzo
        son todos posicionados sin z-index propio, así que entre
        ellos manda el orden del documento. */
  var bandas = document.querySelectorAll('.banda');
  for (var i = 0; i < bandas.length; i++){
    var l = nuevoLienzo(false);
    bandas[i].insertBefore(l, bandas[i].firstChild);
    sumarCapa(l, sueloDeBanda(bandas[i]));
  }
}

/* --- el bucle: una pasada por todas las capas a la vista --- */
function bucle(t){
  var dt = Math.min((t - ultimo) / 1000, 0.05);
  ultimo = t;
  var paso = quieto ? 0 : dt;
  for (var i = 0; i < capas.length; i++){
    if (capas[i].aLaVista) capas[i].cuadro(paso);
  }
  pedido = requestAnimationFrame(bucle);
}
function prender(){
  if (pedido) return;
  ultimo = performance.now();
  pedido = requestAnimationFrame(bucle);
}
function apagar(){
  if (!pedido) return;
  cancelAnimationFrame(pedido);
  pedido = 0;
}
/* Una sola pasada, sin prender el bucle. Es para cuando cambia
   algo que se ve —el tema, el tamaño— mientras la red está
   quieta por «menos movimiento». */
function repintar(){
  if (pedido) return;
  for (var i = 0; i < capas.length; i++){
    if (capas[i].aLaVista) capas[i].cuadro(0);
  }
}

function arrancar(){
  quieto = quiereQuieto();

  /* Mirar la caja de cada lienzo, y no el resize de la ventana,
     cubre los dos casos con un solo mecanismo: el cambio de
     tamaño de verdad, y el primer cuadro en que la caja pasa a
     existir (ver el comentario largo en Capa.medir). Las ráfagas
     —el navegador del celular escondiendo la barra de
     direcciones— se juntan en un solo cuadro. */
  if (window.ResizeObserver){
    observaCaja = new ResizeObserver(function(entradas){
      for (var i = 0; i < entradas.length; i++){
        var c = deLienzo(entradas[i].target);
        if (c) marcarMedicion(c);
      }
    });
  }

  /* Las capas fuera de pantalla no dibujan. En una pantalla de
     bandas hay cuatro o cinco lienzos y a la vista hay uno, dos
     como mucho: sin esto se estarían calculando todos. */
  if (window.IntersectionObserver){
    observaVista = new IntersectionObserver(function(entradas){
      for (var i = 0; i < entradas.length; i++){
        var c = deLienzo(entradas[i].target);
        if (c){
          c.aLaVista = entradas[i].isIntersecting;
          if (c.aLaVista){
            /* Al entrar en pantalla puede no haberse medido nunca
               —una banda de más abajo—, así que se mide ahí. */
            marcarMedicion(c);
            /* Y si la red está quieta por «menos movimiento» no hay
               bucle que la dibuje: con la banda ya medida de antes,
               medir() no cambia nada y la banda se quedaba en
               blanco para siempre. Se pinta acá, una vez. */
            if (quieto) c.cuadro(0);
          }
        }
      }
    }, { threshold: 0 });
  }

  armarTodo();

  window.addEventListener('resize', function(){
    for (var i = 0; i < capas.length; i++) marcarMedicion(capas[i]);
  });

  if (AJUSTES.cursor){
    window.addEventListener('pointermove', function(e){
      cursor.x = e.clientX; cursor.y = e.clientY; cursor.activo = true;
    }, { passive: true });
    window.addEventListener('pointerleave', function(){
      cursor.activo = false; cursor.x = cursor.y = -1e4;
    });
  }

  /* El tema se cambia desde el menú ☰ y desde el sistema. En los
     dos casos termina en el mismo lugar: el atributo data-tema del
     <html>. El tono se lee en cada cuadro, así que con la red en
     movimiento el cambio entra solo; esto es para cuando está
     quieta. */
  new MutationObserver(function(){
    if (quieto) repintar();
  }).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-tema']
  });

  /* Sin esto, un teléfono con la app abierta atrás sigue gastando
     batería dibujando algo que nadie mira. */
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) apagar();
    else if (!quieto) prender();
  });

  /* Si alguien activa «menos movimiento» con la app abierta, la
     red se planta en el lugar sin recargar. Y al revés también. */
  if (typeof alCambiarMovimiento === 'function'){
    alCambiarMovimiento(function(ahora){
      quieto = ahora;
      if (quieto){ apagar(); repintar(); }
      else prender();
    });
  }

  if (quieto) repintar();
  else prender();
}

function deLienzo(el){
  for (var i = 0; i < capas.length; i++){
    if (capas[i].lienzo === el) return capas[i];
  }
  return null;
}

function marcarMedicion(c){
  if (c.pendiente) return;
  c.pendiente = requestAnimationFrame(function(){
    c.pendiente = 0;
    if (c.medir() && quieto) repintar();
  });
}

/* ------------------------------------------------------------
   ARRANQUE

   En el navegador viejo que no tenga canvas no se rompe nada:
   simplemente no hay red.
   ------------------------------------------------------------ */
var prueba = document.createElement('canvas');
if (!prueba.getContext || !prueba.getContext('2d')) return;

if (document.body) arrancar();
else document.addEventListener('DOMContentLoaded', arrancar);

})();
