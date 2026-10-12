/* ============================================================
   FONO A COLOR · LEER A TU MANERA (11/10/2026)

   La lógica de «Fono a Color», el proyecto de accesibilidad del
   equipo, llevada a las fichas: cada quien acomoda cómo lee, y se
   guarda para todas las fichas en este teléfono.

   - LA LETRA. La de siempre, Lexend (diseñada para leer con menos
     esfuerzo) o Atkinson Hyperlegible (para baja visión: cada letra
     distinta de su vecina, la «I» de la «l»). No va OpenDyslexic a
     propósito: las pruebas con lectores con dislexia no le encuentran
     ventaja sobre una letra sin serifa clara, y lo que sí ayuda —más
     espacio entre letras y renglones— está en «Más aire», para
     cualquier letra.
   - EL TAMAÑO, el aire, el fondo de color (los filtros de color de
     Fono a Color: crema, celeste, verde, rosa) y dos altos contrastes.
   - LA REGLA DE LECTURA: una franja que deja a la vista dos o tres
     renglones y oscurece el resto. Se toca donde se está leyendo.
   - EL MARCADOR: con él prendido, tocar un párrafo lo pinta del color
     elegido. Se guarda por ficha.

   POR QUÉ UNA PIEZA SOLA, CON SU PROPIO CSS ADENTRO. Las fichas
   dibujadas en Claude Design no cargan las hojas de la app (tienen su
   sistema visual, ver laringe/index.html), y las de texto sí. Esto
   tiene que andar en las dos sin tocar ninguna: por eso trae su
   estilo, y por eso pisa con !important. Los colores se cambian por
   las VARIABLES de cada sistema (--bg/--tx de las dibujadas,
   --fondo/--texto de la app) y no pintando cada elemento: así los
   esquemas y los chips conservan su forma.

   Va en el <head>, sin defer: lo guardado se aplica antes del primer
   cuadro. Si fuera al final, quien lee con fondo crema vería cada
   ficha blanca durante medio segundo. El botón se arma recién cuando
   el cuerpo existe.
   ============================================================ */
(function(){
  const CLAVE = 'bolivar-lectura';
  const raiz = document.documentElement;

  const LETRAS = {
    normal:   { nombre:'La de siempre', familia:'' },
    lexend:   { nombre:'Lexend',   familia:"'Lexend', Verdana, sans-serif",
                url:'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap' },
    atkinson: { nombre:'Atkinson', familia:"'Atkinson Hyperlegible', Verdana, sans-serif",
                url:'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap' }
  };
  const FONDOS = {
    ninguno: { nombre:'Sin color', color:'' },
    crema:   { nombre:'Crema',   color:'#F6E7C1' },
    celeste: { nombre:'Celeste', color:'#C9E7F2' },
    verde:   { nombre:'Verde',   color:'#D3EBCB' },
    rosa:    { nombre:'Rosa',    color:'#F5D3DE' }
  };
  const MARCAS = {
    amarillo: { nombre:'Amarillo', color:'#FFEF6E' },
    verde:    { nombre:'Verde',    color:'#B8EBAE' },
    celeste:  { nombre:'Celeste',  color:'#B5E3F3' },
    rosa:     { nombre:'Rosa',     color:'#F8C3D4' }
  };
  const NUEVO = () => ({ letra:'normal', tam:0, aire:false, fondo:'ninguno', contraste:'normal', regla:false });

  let ajustes = NUEVO();
  try { Object.assign(ajustes, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch(e){}
  if (!LETRAS[ajustes.letra]) ajustes.letra = 'normal';
  if (!FONDOS[ajustes.fondo]) ajustes.fondo = 'ninguno';
  if (!['normal', 'negro', 'blanco'].includes(ajustes.contraste)) ajustes.contraste = 'normal';
  ajustes.tam = [0, 1, 2].includes(ajustes.tam) ? ajustes.tam : 0;

  function guardar(){ try { localStorage.setItem(CLAVE, JSON.stringify(ajustes)); } catch(e){} }

  /* ---------- El estilo ---------- */
  const NEGRO = '--bg:#000;--paper:#0A0A0A;--tx:#FFF;--mut:#F0F0F0;--stroke:#FFF;--onyel:#000;--line:#5BD8F5;--red:#FF9A8C;' +
    '--fondo:#000;--superficie:#0A0A0A;--superficie-2:#171717;--texto:#FFF;--texto-suave:#EDEDED;--linea:#9A9A9A;--tinta-borde:#FFF;';
  const BLANCO = '--bg:#FFF;--paper:#FFF;--tx:#000;--mut:#111;--stroke:#000;--onyel:#000;--line:#00566A;--red:#9E0F0E;' +
    '--fondo:#FFF;--superficie:#FFF;--superficie-2:#F0F0F0;--texto:#000;--texto-suave:#151515;--linea:#4A4A4A;--tinta-borde:#000;';
  const imp = s => s.replace(/;/g, ' !important;');
  /* Lo que se lee de corrido. Los títulos no entran en «Más aire»: con
     las letras separadas, un título de una palabra parece de otra. */
  const CORRIDO = 'p,li,dd,dt,td,th,blockquote,figcaption,label,summary,.ft-opcion';
  const fuera = ':not(svg):not(svg *):not(.fac-ui):not(.fac-ui *)';

  let css = `
html[data-fac-contraste="negro"]{${imp(NEGRO)}color-scheme:dark}
html[data-fac-contraste="blanco"]{${imp(BLANCO)}color-scheme:light}
html[data-fac-contraste] body{background:var(--bg,var(--fondo)) !important;color:var(--tx,var(--texto)) !important}
html[data-fac-tam="1"] .fac-zona{zoom:1.15}
html[data-fac-tam="2"] .fac-zona{zoom:1.3}
html[data-fac-aire] .fac-zona :is(${CORRIDO}){line-height:1.8 !important;letter-spacing:.04em !important;word-spacing:.16em !important}
html[data-fac-aire] .fac-zona :is(p,li){margin-bottom:.9em !important}
.fac-zona [data-fac-marca]{border-radius:4px;box-shadow:0 0 0 3px var(--fac-m);background:var(--fac-m) !important}
.fac-zona [data-fac-marca],.fac-zona [data-fac-marca] *{color:#141414 !important}
html.fac-marcando .fac-zona :is(${CORRIDO},h1,h2,h3,h4){cursor:pointer}
`;
  Object.keys(LETRAS).forEach(k => {
    if (!LETRAS[k].familia) return;
    css += `html[data-fac-letra="${k}"] body,html[data-fac-letra="${k}"] body *${fuera}{font-family:${LETRAS[k].familia} !important}
html[data-fac-letra="${k}"] .fac-zona :is(h1,h2,h3){font-weight:700 !important;letter-spacing:0 !important}
`;
  });
  Object.keys(MARCAS).forEach(k => { css += `.fac-zona [data-fac-marca="${k}"]{--fac-m:${MARCAS[k].color}}\n`; });

  /* El panel y sus piezas. Colores fijos, no de la app: tiene que
     verse igual en una ficha dibujada y en una de texto. */
  css += `
.fac-ui{font-family:Roboto,system-ui,sans-serif;color:#1A1A1A;-webkit-text-size-adjust:100%}
.fac-ui *{box-sizing:border-box}
.fac-ui button{font:inherit;cursor:pointer;color:inherit}
.fac-ui :focus-visible{outline:3px solid #0195B1;outline-offset:2px}
.fac-boton{position:fixed;left:14px;bottom:calc(var(--fac-abajo,16px) + env(safe-area-inset-bottom,0px));z-index:2147483600;
  width:52px;height:52px;border-radius:50%;border:2px solid #1A1A1A;background:#F9E830;color:#1A1A1A;
  box-shadow:2px 2px 0 #1A1A1A;font-family:Georgia,serif;font-size:21px;font-weight:700;line-height:1;display:grid;place-items:center}
.fac-boton:active{transform:translate(2px,2px);box-shadow:none}
.fac-boton.prendido::after{content:'';position:absolute;top:2px;right:2px;width:11px;height:11px;border-radius:50%;background:#0195B1;border:2px solid #F9E830}
.fac-panel{position:fixed;left:0;right:0;bottom:0;z-index:2147483601;max-height:82vh;overflow:auto;overscroll-behavior:contain;
  background:#FDFCF7;border-top:2px solid #1A1A1A;border-radius:20px 20px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.25);
  padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px))}
.fac-panel[hidden],.fac-tira[hidden]{display:none}
@media (min-width:720px){.fac-panel{left:auto;right:16px;bottom:16px;width:400px;border:2px solid #1A1A1A;border-radius:20px}}
.fac-cabeza{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 6px}
.fac-cabeza h2{margin:0;font-family:'Archivo Black',Impact,sans-serif;font-weight:400;font-size:21px;line-height:1.1;text-transform:uppercase}
.fac-cabeza p{margin:3px 0 0;font-size:12.5px;line-height:1.4;color:#3A3A3A}
.fac-cerrar{flex:0 0 auto;width:40px;height:40px;border-radius:50%;border:1px solid #C9C4B5;background:#fff;font-size:18px}
.fac-grupo{margin:14px 0 0;padding:0;border:0}
.fac-grupo legend,.fac-rotulo{display:block;padding:0;margin:0 0 7px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#3A3A3A}
.fac-opciones{display:flex;flex-wrap:wrap;gap:6px}
.fac-op{min-height:42px;padding:8px 13px;border-radius:99px;border:1.5px solid #C9C4B5;background:#fff;font-size:14px}
.fac-op[aria-pressed="true"]{border-color:#1A1A1A;background:#1A1A1A;color:#fff}
.fac-muestra{display:inline-block;width:18px;height:18px;border-radius:50%;border:1px solid rgba(0,0,0,.35);vertical-align:-4px;margin-right:6px}
.fac-fila{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0 0;padding:10px 12px;background:#fff;border:1px solid #DDD8CA;border-radius:10px}
.fac-fila b{display:block;font-size:14.5px}
.fac-fila span{display:block;font-size:12.5px;line-height:1.35;color:#3A3A3A}
.fac-switch{flex:0 0 auto;position:relative;width:48px;height:28px;border-radius:99px;border:1.5px solid #1A1A1A;background:#DDD8CA}
.fac-switch::after{content:'';position:absolute;top:2px;left:2px;width:21px;height:21px;border-radius:50%;background:#fff;border:1.5px solid #1A1A1A;transition:transform .15s}
.fac-switch[aria-checked="true"]{background:#0195B1}
.fac-switch[aria-checked="true"]::after{transform:translateX(19px)}
.fac-nota{margin:6px 0 0;font-size:12.5px;color:#3A3A3A}
.fac-op:disabled{opacity:.45;cursor:default}
.fac-pie{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
.fac-texto{background:none;border:0;padding:8px 0;text-decoration:underline;font-size:13px;color:#3A3A3A}
.fac-tira{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--fac-abajo,16px) + 64px + env(safe-area-inset-bottom,0px));z-index:2147483600;
  display:flex;align-items:center;gap:6px;max-width:calc(100vw - 24px);padding:7px 8px 7px 13px;border-radius:99px;
  background:#1A1A1A;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.3);font-size:13px}
.fac-tira .fac-color{width:32px;height:32px;border-radius:50%;border:2px solid transparent;padding:0}
.fac-tira .fac-color[aria-pressed="true"]{border-color:#fff;box-shadow:0 0 0 2px #1A1A1A inset}
.fac-tira .fac-listo{margin-left:4px;min-height:34px;padding:6px 12px;border-radius:99px;border:0;background:#F9E830;color:#1A1A1A;font-weight:700}
.fac-tinte{position:fixed;inset:0;z-index:2147483500;pointer-events:none;mix-blend-mode:multiply}
.fac-regla{position:fixed;left:0;right:0;top:0;height:4.6em;z-index:2147483550;pointer-events:none;font-size:16px;
  border-top:2px solid #F9E830;border-bottom:2px solid #F9E830;box-shadow:0 0 0 200vmax rgba(12,12,12,.42)}
@media (prefers-reduced-motion:reduce){.fac-switch::after{transition:none}}
@media print{.fac-ui,.fac-tinte,.fac-regla{display:none !important}}
`;
  const hoja = document.createElement('style');
  hoja.id = 'fac-estilo';
  hoja.textContent = css;
  (document.head || raiz).appendChild(hoja);

  /* Las letras se piden recién cuando alguien las elige: son 30 a 60 KB
     que quien lee con la de siempre no tiene por qué bajar. */
  const pedidas = {};
  function pedirLetra(k){
    const l = LETRAS[k];
    if (!l || !l.url || pedidas[k]) return;
    pedidas[k] = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = l.url;
    (document.head || raiz).appendChild(link);
  }

  function aplicar(){
    const d = raiz.dataset;
    if (ajustes.letra !== 'normal'){ d.facLetra = ajustes.letra; pedirLetra(ajustes.letra); } else delete d.facLetra;
    if (ajustes.tam) d.facTam = String(ajustes.tam); else delete d.facTam;
    if (ajustes.aire) d.facAire = ''; else delete d.facAire;
    if (ajustes.contraste !== 'normal') d.facContraste = ajustes.contraste; else delete d.facContraste;
    if (cuerpoListo){ pintarTinte(); pintarRegla(); pintarPanel(); }
  }
  let cuerpoListo = false;
  aplicar();

  /* ============================================================
     LO QUE NECESITA EL CUERPO
     ============================================================ */
  function montar(){
    cuerpoListo = true;
    const zona = document.getElementById('ficha') || document.querySelector('main') || document.body;
    zona.classList.add('fac-zona');

    /* ---------- El tinte y la regla ---------- */
    const tinte = document.createElement('div');
    tinte.className = 'fac-tinte';
    tinte.setAttribute('aria-hidden', 'true');
    const regla = document.createElement('div');
    regla.className = 'fac-regla';
    regla.setAttribute('aria-hidden', 'true');
    let reglaY = Math.round(innerHeight * .38);

    /* El tinte es una capa que multiplica: sobre el blanco queda el
       color, sobre el negro del texto queda negro. Es lo mismo que una
       lámina de color encima de la hoja, y por eso anda igual en las
       fichas dibujadas y en las de texto. Con alto contraste no va:
       se pelearían. */
    pintarTinte = function(){
      const c = ajustes.contraste === 'normal' && FONDOS[ajustes.fondo].color;
      tinte.style.background = c || '';
      tinte.hidden = !c;
    };
    pintarRegla = function(){
      regla.hidden = !ajustes.regla;
      regla.style.transform = 'translateY(' + Math.max(0, Math.min(innerHeight - 60, reglaY - 30)) + 'px)';
    };
    /* Se mueve adonde se toca o adonde pasa el mouse. Escuchar con
       `passive` y sin preventDefault: la regla no puede trabar el
       desplazamiento, que es justamente como se lee con ella. */
    const mover = ev => {
      if (!ajustes.regla) return;
      const t = ev.touches ? ev.touches[0] : ev;
      if (!t || ev.target.closest && ev.target.closest('.fac-ui')) return;
      reglaY = t.clientY;
      pintarRegla();
    };
    addEventListener('pointerdown', mover, { passive:true });
    addEventListener('mousemove', mover, { passive:true });

    /* ---------- El botón, el panel y la tira del marcador ---------- */
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'fac-ui fac-boton';
    boton.setAttribute('aria-label', 'Leer a tu manera: letra, tamaño, colores y marcador');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', 'fac-panel');
    boton.textContent = 'Aa';

    const panel = document.createElement('div');
    panel.className = 'fac-ui fac-panel';
    panel.id = 'fac-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'fac-titulo');
    panel.hidden = true;

    const tira = document.createElement('div');
    tira.className = 'fac-ui fac-tira';
    tira.setAttribute('role', 'toolbar');
    tira.setAttribute('aria-label', 'Marcador');
    tira.hidden = true;

    document.body.append(tinte, regla, boton, tira, panel);

    /* El botón va a la izquierda y a la altura del globo de Avisanos,
       que en las pantallas con barra de abajo sube para no taparla. */
    const avisanos = document.querySelector('.avisanos');
    if (avisanos){
      const b = parseFloat(getComputedStyle(avisanos).bottom);
      if (b) raiz.style.setProperty('--fac-abajo', b + 'px');
    }

    /* ---------- Las marcas, por ficha ----------
       Se guardan por el TEXTO del párrafo, no por su lugar: las fichas
       dibujadas se redibujan enteras al tocar un chip (ficha.js), y
       un párrafo que era el quinto pasa a ser el séptimo. El texto es
       el mismo. Si la ficha cambia de texto, esa marca se pierde, que
       es lo que corresponde: ya no marca lo que se marcó. */
    const CLAVE_MARCAS = 'bolivar-marcas:' + location.pathname + location.search;
    let marcas = {};
    try { marcas = JSON.parse(localStorage.getItem(CLAVE_MARCAS) || '{}') || {}; } catch(e){}
    const guardarMarcas = () => {
      try {
        if (Object.keys(marcas).length) localStorage.setItem(CLAVE_MARCAS, JSON.stringify(marcas));
        else localStorage.removeItem(CLAVE_MARCAS);
      } catch(e){}
    };
    const huella = el => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      let h = 0;
      for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
      return t.length + ':' + (h >>> 0).toString(36);
    };
    const MARCABLE = CORRIDO + ',h1,h2,h3,h4';
    function repintarMarcas(){
      zona.querySelectorAll(MARCABLE).forEach(el => {
        const m = marcas[huella(el)];
        if (m && MARCAS[m]){ if (el.dataset.facMarca !== m) el.dataset.facMarca = m; }
        else if (el.dataset.facMarca) delete el.dataset.facMarca;
      });
    }
    let esperaMarcas = null;
    new MutationObserver(lista => {
      /* Lo que cambia este mismo guion (el atributo) no cuenta. */
      if (lista.every(m => m.type === 'attributes')) return;
      clearTimeout(esperaMarcas);
      esperaMarcas = setTimeout(repintarMarcas, 80);
    }).observe(zona, { childList:true, subtree:true });
    repintarMarcas();

    let marcando = false, colorMarca = 'amarillo';
    function prenderMarcador(si){
      marcando = si;
      raiz.classList.toggle('fac-marcando', si);
      pintarTira();
      if (si){ cerrar(false); const elegido = tira.querySelector('[aria-pressed="true"]'); if (elegido) elegido.focus(); }
    }
    function pintarTira(){
      tira.hidden = !marcando;
      if (!marcando) return;
      tira.innerHTML = '<span>Tocá un párrafo</span>' +
        Object.keys(MARCAS).map(k => '<button type="button" class="fac-color" data-color="' + k + '" aria-pressed="' + (k === colorMarca) +
          '" aria-label="' + MARCAS[k].nombre + '" style="background:' + MARCAS[k].color + '"></button>').join('') +
        '<button type="button" class="fac-listo" data-listo>Listo</button>';
    }
    tira.addEventListener('click', ev => {
      const c = ev.target.closest('[data-color]');
      if (c){ colorMarca = c.dataset.color; pintarTira(); const otra = tira.querySelector('[data-color="' + colorMarca + '"]'); if (otra) otra.focus(); return; }
      if (ev.target.closest('[data-listo]')){ prenderMarcador(false); boton.focus(); }
    });
    /* En captura, para llegar antes que la ficha. Lo que se toca y
       hace algo (un chip, un enlace, una respuesta) sigue haciéndolo:
       el marcador solo se queda con el toque sobre texto quieto. */
    document.addEventListener('click', ev => {
      if (!marcando || ev.target.closest('.fac-ui')) return;
      if (ev.target.closest('a,button,input,select,textarea,summary,label,[role="button"],[onclick],[tabindex]:not([tabindex="-1"])')) return;
      const el = ev.target.closest(MARCABLE);
      if (!el || !zona.contains(el)) return;
      ev.preventDefault(); ev.stopPropagation();
      const h = huella(el);
      if (marcas[h] === colorMarca) delete marcas[h]; else marcas[h] = colorMarca;
      guardarMarcas();
      repintarMarcas();
      pintarPanel();
    }, true);

    /* ---------- El panel ---------- */
    const op = (grupo, valor, actual, texto, extra) =>
      '<button type="button" class="fac-op" data-grupo="' + grupo + '" data-valor="' + valor + '" aria-pressed="' + (String(valor) === String(actual)) + '"' +
      (extra || '') + '>' + texto + '</button>';
    const sw = (id, si) => '<button type="button" class="fac-switch" role="switch" id="' + id + '" aria-checked="' + si + '" aria-labelledby="' + id + '-r"></button>';

    pintarPanel = function(){
      boton.classList.toggle('prendido', ajustes.letra !== 'normal' || ajustes.tam || ajustes.aire ||
        ajustes.fondo !== 'ninguno' || ajustes.contraste !== 'normal' || ajustes.regla);
      if (panel.hidden) return;
      const enFoco = document.activeElement && panel.contains(document.activeElement)
        ? (document.activeElement.id || document.activeElement.dataset.grupo + ':' + document.activeElement.dataset.valor) : null;
      const cuantas = Object.keys(marcas).length;
      panel.innerHTML = `
        <div class="fac-cabeza">
          <div>
            <h2 id="fac-titulo">Leer a tu manera</h2>
            <p>Fono a Color. Se guarda para todas las fichas, en este teléfono.</p>
          </div>
          <button type="button" class="fac-cerrar" data-cerrar aria-label="Cerrar">✕</button>
        </div>
        <fieldset class="fac-grupo"><legend>Letra</legend><div class="fac-opciones">
          ${Object.keys(LETRAS).map(k => op('letra', k, ajustes.letra, LETRAS[k].nombre,
            LETRAS[k].familia ? ' style="font-family:' + LETRAS[k].familia.replace(/"/g, '&quot;') + '"' : '')).join('')}
        </div></fieldset>
        <fieldset class="fac-grupo"><legend>Tamaño</legend><div class="fac-opciones">
          ${op('tam', 0, ajustes.tam, 'Normal', ' aria-label="Tamaño normal"')}
          ${op('tam', 1, ajustes.tam, '<span style="font-size:1.15em">Más grande</span>')}
          ${op('tam', 2, ajustes.tam, '<span style="font-size:1.3em">Grande</span>')}
        </div></fieldset>
        <div class="fac-fila"><div id="fac-aire-r"><b>Más aire</b><span>Más espacio entre renglones, palabras y letras.</span></div>${sw('fac-aire', ajustes.aire)}</div>
        <fieldset class="fac-grupo"><legend>Fondo de color</legend><div class="fac-opciones">
          ${Object.keys(FONDOS).map(k => op('fondo', k, ajustes.fondo,
            (FONDOS[k].color ? '<span class="fac-muestra" style="background:' + FONDOS[k].color + '"></span>' : '') + FONDOS[k].nombre,
            ajustes.contraste !== 'normal' ? ' disabled' : '')).join('')}
        </div>${ajustes.contraste !== 'normal' ? '<p class="fac-nota">Con alto contraste no hay fondo de color.</p>' : ''}</fieldset>
        <fieldset class="fac-grupo"><legend>Contraste</legend><div class="fac-opciones">
          ${op('contraste', 'normal', ajustes.contraste, 'Normal')}
          ${op('contraste', 'negro', ajustes.contraste, 'Alto, fondo negro')}
          ${op('contraste', 'blanco', ajustes.contraste, 'Alto, fondo blanco')}
        </div></fieldset>
        <div class="fac-fila"><div id="fac-regla-r"><b>Regla de lectura</b><span>Una franja que deja a la vista dos o tres renglones. Tocá donde estás leyendo.</span></div>${sw('fac-regla', ajustes.regla)}</div>
        <div class="fac-fila"><div id="fac-marcador-r"><b>Marcador</b><span>Tocá un párrafo para pintarlo. ${cuantas ? 'Llevás ' + cuantas + (cuantas === 1 ? ' marca' : ' marcas') + ' en esta ficha.' : 'Se guarda en esta ficha.'}</span></div>${sw('fac-marcador', marcando)}</div>
        <div class="fac-pie">
          ${cuantas ? '<button type="button" class="fac-texto" data-borrar-marcas>Borrar las marcas de esta ficha</button>' : ''}
          <button type="button" class="fac-texto" data-reiniciar>Volver a como estaba</button>
        </div>`;
      if (enFoco){
        const [g, v] = enFoco.split(':');
        const otra = document.getElementById(enFoco) || panel.querySelector('[data-grupo="' + g + '"][data-valor="' + v + '"]');
        if (otra) otra.focus();
      }
    };

    let volverA = null;
    function abrir(){
      volverA = document.activeElement;
      if (marcando) prenderMarcador(false);
      panel.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      pintarPanel();
      const x = panel.querySelector('[data-cerrar]');
      if (x) x.focus();
    }
    function cerrar(devolver){
      if (panel.hidden) return;
      panel.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
      if (devolver !== false) (volverA && document.contains(volverA) ? volverA : boton).focus();
    }
    boton.addEventListener('click', () => panel.hidden ? abrir() : cerrar());
    document.addEventListener('keydown', ev => {
      if (ev.key !== 'Escape') return;
      if (!panel.hidden) cerrar();
      else if (marcando){ prenderMarcador(false); boton.focus(); }
    });

    panel.addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.cerrar !== undefined) return cerrar();
      if (b.dataset.grupo){
        const g = b.dataset.grupo;
        ajustes[g] = g === 'tam' ? Number(b.dataset.valor) : b.dataset.valor;
        if (g === 'letra' && ajustes.letra !== 'normal' && typeof anotarHito === 'function') anotarHito('cambió la letra de una ficha');
      }
      else if (b.id === 'fac-aire') ajustes.aire = !ajustes.aire;
      else if (b.id === 'fac-regla'){ ajustes.regla = !ajustes.regla; if (ajustes.regla) reglaY = Math.round(innerHeight * .38); }
      else if (b.id === 'fac-marcador'){ prenderMarcador(!marcando); return; }
      else if (b.dataset.borrarMarcas !== undefined){ marcas = {}; guardarMarcas(); repintarMarcas(); }
      else if (b.dataset.reiniciar !== undefined) ajustes = NUEVO();
      else return;
      guardar();
      aplicar();
    });

    addEventListener('resize', () => pintarRegla(), { passive:true });
    /* Otra pestaña con otra ficha puede haber cambiado los ajustes. */
    addEventListener('storage', ev => {
      if (ev.key !== CLAVE) return;
      try { ajustes = Object.assign(NUEVO(), JSON.parse(ev.newValue || '{}')); } catch(e){ ajustes = NUEVO(); }
      aplicar();
    });

    aplicar();
  }
  let pintarTinte = () => {}, pintarRegla = () => {}, pintarPanel = () => {};

  if (document.body) montar();
  else document.addEventListener('DOMContentLoaded', montar);
})();
