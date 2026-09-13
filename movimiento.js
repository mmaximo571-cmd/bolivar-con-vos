/* ============================================================
   EL MOVIMIENTO DE LAS PANTALLAS QUE SE RECORREN (13/9)

   Nació en Estudiemos y se llevó a Inicio y a Fichas. Son dos cosas,
   las dos sin librería (ver el comentario de `.mov` en estilos.css):

     entrarAlLlegar   las piezas suben 32 px y aparecen al cruzar el
                      85 % de la pantalla, UNA sola vez.
     encenderAlBajar  las palabras de un titular arrancan apagadas y se
                      prenden de a una según cuánto se bajó.

   La entrada al abrir la pantalla no está acá: es CSS puro, con
   `data-entra` y `.mov-renglon`, y no necesita que corra nada.

   Va después de app.js: usa `menosMovimiento` y `esc`.
   ============================================================ */

/* Cómo se reconoce una pieza que ya entró. Por CONTENIDO y no por
   nodo: las listas se redibujan enteras con cada tecla del buscador y
   dos veces al abrir (lo guardado y lo de la red), y si «ya entró» se
   guardara en el nodo, cada redibujo haría entrar todo de nuevo. El
   número de un título de grupo no cuenta: «Epistemología 2» pasa a
   ser «Epistemología 1» al filtrar, y es el mismo título. */
function claveDeEntrada(p){
  const c = p.cloneNode(true);
  c.querySelectorAll('.cuenta-grupo').forEach(n => n.remove());
  return c.textContent.replace(/\s+/g, ' ').trim();
}

/* raiz      dónde buscar. Se vigila entera: lo que se pinte adentro
             más tarde (lo que llega de la base) también entra.
   selector  qué piezas entran.
   opciones.soloAbajo
             lo que ya está a la vista cuando se lo encuentra NO entra:
             se queda quieto en su lugar. Es para Inicio, donde los
             accesos se ven desde el primer cuadro a propósito y no se
             puede inventar una demora que no existe. */
function entrarAlLlegar(raiz, selector, opciones){
  opciones = opciones || {};
  if (!raiz || menosMovimiento() ||
      !('IntersectionObserver' in window) || !('MutationObserver' in window)) return;

  const yaEntraron = new Set();
  const mirando = new Set();
  let aviso = false, enTanda = 0, ultima = -Infinity;

  const mostrar = (p, espera) => {
    yaEntraron.add(claveDeEntrada(p));
    if (espera) p.style.transitionDelay = espera + 'ms';
    p.classList.add('mov-visto');
    /* Terminado, se devuelven la transición y el hover a la pieza. */
    setTimeout(() => {
      p.classList.remove('mov-entra', 'mov-visto');
      p.style.transitionDelay = '';
    }, 600 + espera + 60);
  };

  const vigia = new IntersectionObserver((entradas, obs) => {
    aviso = true;
    const llegan = entradas.filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!llegan.length) return;
    const ahora = performance.now();
    if (ahora - ultima > 300) enTanda = 0;
    ultima = ahora;
    llegan.forEach(e => {
      mostrar(e.target, Math.min(enTanda, 5) * 80);
      enTanda++;
      obs.unobserve(e.target);
      mirando.delete(e.target);
    });
  }, { rootMargin: '0px 0px -15% 0px' });

  function revisar(){
    /* Lo que se borró de la página se deja de mirar. */
    mirando.forEach(p => { if (!p.isConnected){ vigia.unobserve(p); mirando.delete(p); } });

    /* Lo que no se está dibujando (adentro de un `hidden`) no se decide
       todavía. Mide cero, y cero es «arriba de todo»: con `soloAbajo`
       se lo daba por visto y ya no entraba nunca. Pasó en Inicio, donde
       la app arranca escondida detrás de la bienvenida. */
    const nuevas = [...raiz.querySelectorAll(selector)].filter(p =>
      p.getClientRects().length &&
      !p.classList.contains('mov-entra') && !yaEntraron.has(claveDeEntrada(p)));
    nuevas.forEach(p => {
      if (opciones.soloAbajo && p.getBoundingClientRect().top < innerHeight){
        yaEntraron.add(claveDeEntrada(p));
        return;
      }
      p.classList.add('mov-entra');
      vigia.observe(p);
      mirando.add(p);
    });

    /* RED DE SEGURIDAD, la misma de lectura.js: si el observador no
       avisó NADA en un segundo y medio, no está andando, y una lista
       invisible es infinitamente peor que una que aparece sin gracia. */
    if (nuevas.length) setTimeout(() => {
      if (aviso) return;
      mirando.forEach(p => { vigia.unobserve(p); mostrar(p, 0); });
      mirando.clear();
    }, 1500);
  }

  let pendiente = 0;
  const pedirRevision = () => {
    clearTimeout(pendiente);
    pendiente = setTimeout(revisar, 0);
  };
  new MutationObserver(pedirRevision).observe(raiz, { childList: true, subtree: true });
  /* Y cuando la raíz pasa de escondida a visible: sacar un `hidden` de
     más arriba no cambia nada ADENTRO, así que el observador de arriba
     no se entera. Lo que sí cambia es el tamaño. */
  if ('ResizeObserver' in window) new ResizeObserver(pedirRevision).observe(raiz);
  revisar();
}

/* ============================================================
   LAS PALABRAS QUE SE ENCIENDEN AL BAJAR

   Arranca cuando el borde de arriba de cada pieza está al 80 % de la
   pantalla y termina al 30 %. Si la pieza es de lo último de la página
   y nunca llega al 30 %, el final se corre a donde sí llega: un titular
   que no se termina de encender es un titular gris para siempre.

   El «scrub 0,5» de la referencia se imita con un seguimiento que
   alcanza al scroll en medio segundo: sin eso, las palabras copian
   cada tirón del dedo.

   NADA SE APAGA SI NO CORRE EL DIBUJO. El 0,2 inicial lo escribe el
   primer cuadro: si el navegador no dibuja, las palabras se quedan
   como vinieron, que es encendidas.

   piezas: [{ el, tarde }], donde `tarde` corre el encendido para que
   un párrafo arranque un poco después que su titular.
   ============================================================ */
function encenderAlBajar(piezas){
  piezas = (piezas || []).filter(g => g && g.el);
  if (!piezas.length || menosMovimiento()) return;

  const grupos = piezas.map(g => {
    const palabras = g.el.textContent.trim().split(/\s+/);
    g.el.innerHTML = palabras.map(p => `<span class="mov-palabra">${esc(p)}</span>`).join(' ');
    return { el: g.el, tarde: g.tarde || 0, ahora: -1,
             palabras: [...g.el.querySelectorAll('.mov-palabra')] };
  });

  const metaDe = (el, tarde) => {
    const alto = innerHeight;
    const arriba = el.getBoundingClientRect().top;
    /* Dónde queda ese borde con la página bajada hasta el fondo. */
    const enElFondo = arriba - (document.documentElement.scrollHeight - alto - scrollY);
    const fin = Math.max(alto * .3, enElFondo);
    const inicio = Math.max(alto * .8, fin + alto * .2);
    return Math.max(0, Math.min(1, (inicio - arriba) / (inicio - fin) - tarde));
  };

  let andando = false, ultimo = 0;
  const cuadro = t => {
    const dt = ultimo ? Math.min(100, t - ultimo) : 0;
    ultimo = t;
    /* Alcanza el 95 % del camino en medio segundo. */
    const seguir = 1 - Math.exp(-dt / 167);
    let falta = false;
    grupos.forEach(g => {
      const meta = metaDe(g.el, g.tarde);
      g.ahora = g.ahora < 0 ? meta : g.ahora + (meta - g.ahora) * seguir;
      if (Math.abs(meta - g.ahora) > .002) falta = true; else g.ahora = meta;
      const n = g.palabras.length;
      g.palabras.forEach((w, i) => {
        const luz = Math.max(0, Math.min(1, g.ahora * n - i));
        w.style.opacity = (.2 + .8 * luz).toFixed(3);
      });
    });
    if (falta) requestAnimationFrame(cuadro);
    else { andando = false; ultimo = 0; }
  };
  const despertar = () => {
    if (andando) return;
    andando = true;
    requestAnimationFrame(cuadro);
  };
  addEventListener('scroll', despertar, { passive: true });
  addEventListener('resize', despertar);
  /* Lo de arriba cambia de alto cuando llega lo de la base o se filtra,
     y eso mueve la pieza sin que nadie haya scrolleado. */
  if ('ResizeObserver' in window) new ResizeObserver(despertar).observe(document.body);
  despertar();
}
