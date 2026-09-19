/* ============================================================
   LA HUELLA DE ESTUDIO (18/9/2026)

   Lo que hace que Estudiemos sepa dónde quedaste. Cada pantalla de
   estudio (fichas, cuadro, Fonoteca, 3D, videos, mapa) carga esto, y
   anota en el teléfono: qué abriste, cuándo, hasta dónde bajaste y en
   qué punto de la página estabas.

   Vive SOLO en este teléfono (localStorage, decidido el 18/9): nada
   viaja a la base. Si algún día se sincroniza con la cuenta, la forma
   de cada renglón ya sirve para una tabla.

   Un renglón:  { u: ruta, t: título, k: tipo, v: última visita (ms),
                  a: avance 0..1, y: posición de scroll }

   «Seguir» abre la página con ?seguir: acá se lee y se vuelve a la
   posición guardada, una vez que la ficha terminó de dibujarse.
   ============================================================ */
(function(){
  var CLAVE = 'bolivar-huella', TOPE = 40;

  function leer(){
    try { var d = JSON.parse(localStorage.getItem(CLAVE) || '[]'); return Array.isArray(d) ? d : []; }
    catch(e){ return []; }
  }
  function escribir(l){ try { localStorage.setItem(CLAVE, JSON.stringify(l.slice(0, TOPE))); } catch(e){} }

  /* Estudiemos la lee con esto; no hace falta que sepa la clave. */
  window.leerHuella = leer;

  /* Quien carga esto desde Estudiemos solo quiere leer. */
  if (window.HUELLA_SOLO_LEER) return;

  var ruta = location.pathname.replace(/index\.html$/, '');
  var k = /\/fichas\/modelos-cuadro\//.test(ruta) ? 'cuadro'
        : /\/fichas\/antropologia-otredad\//.test(ruta) ? 'mazo'
        : /\/fichas\/historia-social\//.test(ruta) ? 'linea'
        : /\/fichas\//.test(ruta)   ? 'ficha'
        : /\/fonoteca\//.test(ruta) ? 'fonoteca'
        : /\/videos\//.test(ruta)   ? 'video'
        : /\/anatomo\//.test(ruta)  ? '3d'
        : /\/mapa\//.test(ruta)     ? 'mapa' : 'otro';
  var titulo = (document.title || '').split(' · ')[0].trim() || ruta;

  function anotar(){
    var alto = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    var a = Math.min(1, Math.max(0, scrollY / alto));
    var l = leer(), viejo = null;
    l = l.filter(function(x){ if (x.u === ruta){ viejo = x; return false; } return true; });
    l.unshift({ u: ruta, t: titulo, k: k, v: Date.now(),
                a: Math.max(a, viejo && viejo.a || 0),
                y: Math.round(scrollY) });
    escribir(l);
  }

  /* La posición de la visita anterior se lee ANTES de anotar esta,
     que arranca arriba de todo y la pisaría. */
  var q = new URLSearchParams(location.search);
  var seguir = q.has('seguir');
  var previo = seguir ? leer().filter(function(x){ return x.u === ruta; })[0] : null;

  /* Al abrir ya queda anotada, aunque no se baje nada. Si viene a
     seguir, se conserva la posición vieja hasta que vuelva a ella. */
  if (!previo) anotar();

  var espera = null;
  addEventListener('scroll', function(){
    if (espera) return;
    espera = setTimeout(function(){ espera = null; anotar(); }, 900);
  }, { passive: true });
  addEventListener('pagehide', anotar);
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'hidden') anotar();
  });

  /* VOLVER AL PUNTO. Se espera a que la página tenga alto: las fichas
     se dibujan con JS y al principio miden una pantalla. Hasta 3 s. */
  if (!seguir) return;
  q.delete('seguir');
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  if (!previo || !previo.y){ anotar(); return; }
  var intentos = 0;
  (function volver(){
    if (document.documentElement.scrollHeight - innerHeight >= previo.y || intentos > 15){
      /* Safari anterior a 16.4 no conoce 'instant' y tira error. */
      try { scrollTo({ top: previo.y, behavior: 'instant' }); }
      catch(e){ scrollTo(0, previo.y); }
      return;
    }
    intentos++; setTimeout(volver, 200);
  })();
})();
