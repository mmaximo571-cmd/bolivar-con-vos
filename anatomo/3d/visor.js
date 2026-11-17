/* ============================================================
   EL VISOR 3D DE ANATOMOFISIOLOGÍA (17/11/2026)

   Laringe, deglución y respiración con las mallas de BodyParts3D,
   para girar, tocar una pieza y leer qué hace, y para practicar
   («tocá el cricoaritenoideo posterior»).

   SIN LIBRERÍAS, A PROPÓSITO. Three.js son 670 KB para una pantalla;
   esto es WebGL 1 a mano: un programa para pintar, otro para saber
   qué se tocó, y la cámara. Corre en cualquier teléfono que tenga
   WebGL, que hoy es casi todos.

   Lo que se ve sale de `piezas.js` (nombres y funciones) y de
   `datos/<vista>.bin` (la geometría; ver `armar-datos.mjs`).

   SIN 3D TAMBIÉN SIRVE. Si el teléfono no tiene WebGL o la descarga
   falla, la lista de piezas de abajo sigue andando: se elige una y se
   lee qué hace. Es además el camino para quien usa lector de
   pantalla, que no puede tocar un dibujo.
   ============================================================ */
(function(){
'use strict';

const { GRUPOS, VISTAS } = window.PIEZAS3D;
const $ = id => document.getElementById(id);

const lienzo   = $('v3d-lienzo');
const cartel   = $('v3d-cartel');
const ficha    = $('v3d-ficha');
const chipsVis = $('v3d-vistas');
const chipsGr  = $('v3d-grupos');
const lista    = $('v3d-lista');
const bajadaV  = $('v3d-bajada');
const practica = $('v3d-practica');

const params = new URLSearchParams(location.search);
let claveVista = VISTAS[params.get('vista')] ? params.get('vista') : 'laringe';

const estado = {
  vista: null,
  piezas: [],          // { id, def, n, pos, nor, ind } (pos/nor/ind: buffers de WebGL)
  porId: {},
  ocultos: new Set(),  // grupos apagados
  sel: null,
  aislar: false,
  quiz: null,          // { pregunta, bien, total, esperando }
  cargando: 0          // para descartar una descarga vieja si se cambia de vista a mitad
};

/* ============================================================
   LA MATEMÁTICA MÍNIMA (matrices de 4×4 por columnas, como WebGL)
   ============================================================ */
const resta  = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const cruz   = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const punto  = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const unidad = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };

function perspectiva(fov, asp, cerca, lejos){
  const f = 1 / Math.tan(fov / 2), nf = 1 / (cerca - lejos);
  return new Float32Array([f/asp,0,0,0, 0,f,0,0, 0,0,(lejos+cerca)*nf,-1, 0,0,2*lejos*cerca*nf,0]);
}

function mirar(ojo, centro){
  const z = unidad(resta(ojo, centro));
  const x = unidad(cruz([0,1,0], z));
  const y = cruz(z, x);
  return new Float32Array([x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0,
                           -punto(x,ojo),-punto(y,ojo),-punto(z,ojo),1]);
}

/* ============================================================
   LA CÁMARA: gira alrededor de un punto. `giro` 0 es de frente (el
   eje Z del modelo apunta hacia la cara); positivo, desde la
   izquierda del cuerpo.
   ============================================================ */
const cam = { giro:0, altura:0, dist:3, objetivo:[0,0,0], radio:1 };
const FOV = 0.62;

/* Encuadra lo que se ve: con un grupo escondido o una pieza aislada,
   la cámara se acerca a lo que queda. Las piezas con `encuadre:false`
   (el esófago, los músculos que van a la escápula o al cráneo) se ven
   pero no cuentan, o la laringe quedaría chiquita en el medio. */
function cajaVisible(){
  let lista = estado.piezas.filter(p => p.caja && visible(p));
  if (estado.aislar && estado.sel) lista = lista.filter(p => p.id === estado.sel);
  else {
    const centrales = lista.filter(p => p.def.encuadre !== false);
    if (centrales.length) lista = centrales;
  }
  if (!lista.length) return estado.vista.caja;
  const min = [1,1,1], max = [-1,-1,-1];
  for (const p of lista) for (let a = 0; a < 3; a++){
    min[a] = Math.min(min[a], p.caja[0][a]); max[a] = Math.max(max[a], p.caja[1][a]);
  }
  return [min, max];
}

function encuadrar(conAngulo = true){
  const v = estado.vista, caja = cajaVisible();
  cam.objetivo = [0,1,2].map(a => (caja[0][a] + caja[1][a]) / 2);
  cam.radio = Math.hypot(...[0,1,2].map(a => (caja[1][a] - caja[0][a]) / 2));
  cam.dist = cam.radio / Math.sin(FOV / 2) * (v.def.camara.distancia || 1);
  if (conAngulo){
    cam.giro = v.def.camara.giro || 0;
    cam.altura = v.def.camara.altura || 0;
  }
  pedirDibujo();
}

function ojo(){
  const c = Math.cos(cam.altura);
  return [cam.objetivo[0] + cam.dist * c * Math.sin(cam.giro),
          cam.objetivo[1] + cam.dist * Math.sin(cam.altura),
          cam.objetivo[2] + cam.dist * c * Math.cos(cam.giro)];
}

/* ============================================================
   WEBGL
   ============================================================ */
let gl = null, prog = null, progId = null, marcoId = null;

const VS = `
attribute vec3 aPos; attribute vec3 aNor;
uniform mat4 uVista; uniform mat4 uProy; uniform mat3 uGiro;
varying vec3 vNor; varying vec3 vPos;
void main(){
  vec4 p = uVista * vec4(aPos, 1.0);
  vPos = p.xyz; vNor = uGiro * aNor;
  gl_Position = uProy * p;
}`;

/* Luz que sale de la cámara (así nada queda en sombra al girar) y un
   poco desde arriba para que se lea el volumen. Las dos caras se
   iluminan: las membranas y la epiglotis son mallas abiertas. */
const FS = `
precision mediump float;
uniform vec3 uColor; uniform float uAlfa; uniform float uResalte;
varying vec3 vNor; varying vec3 vPos;
void main(){
  vec3 n = normalize(vNor);
  if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(-vPos);
  float dif = max(dot(n, v), 0.0);
  float cielo = 0.5 + 0.5 * n.y;
  float brillo = pow(max(dot(n, normalize(v + vec3(0.25, 0.55, 0.0))), 0.0), 28.0) * 0.16;
  vec3 c = uColor * (0.34 + 0.56 * dif + 0.14 * cielo) + brillo;
  c = mix(c, vec3(0.98, 0.91, 0.19), uResalte * 0.6);
  gl_FragColor = vec4(c * uAlfa, uAlfa);
}`;

const VS_ID = `
attribute vec3 aPos; uniform mat4 uVista; uniform mat4 uProy;
void main(){ gl_Position = uProy * uVista * vec4(aPos, 1.0); }`;
const FS_ID = `
precision mediump float; uniform vec3 uId;
void main(){ gl_FragColor = vec4(uId, 1.0); }`;

function compilar(vs, fs){
  const p = gl.createProgram();
  for (const [tipo, fuente] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]){
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fuente); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.bindAttribLocation(p, 0, 'aPos');
  gl.bindAttribLocation(p, 1, 'aNor');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++){
    const nombre = gl.getActiveUniform(p, i).name;
    u[nombre] = gl.getUniformLocation(p, nombre);
  }
  return { p, u };
}

function iniciarGL(){
  /* alpha:true para que el fondo sea el de la página y siga al modo
     oscuro sin que el visor tenga que enterarse. */
  gl = lienzo.getContext('webgl', { alpha:true, premultipliedAlpha:true, antialias:true });
  if (!gl) return false;
  prog = compilar(VS, FS);
  progId = compilar(VS_ID, FS_ID);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  return true;
}

function liberar(){
  for (const p of estado.piezas) if (p.pos){
    gl.deleteBuffer(p.pos); gl.deleteBuffer(p.nor); gl.deleteBuffer(p.ind);
  }
}

/* ============================================================
   EL TAMAÑO: el lienzo sigue a su caja, con hasta 2 píxeles reales
   por punto (más no se ve y gasta batería).
   ============================================================ */
function medir(){
  const r = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(lienzo.clientWidth * r));
  const h = Math.max(1, Math.round(lienzo.clientHeight * r));
  if (lienzo.width !== w || lienzo.height !== h){
    lienzo.width = w; lienzo.height = h;
    if (marcoId){ gl.deleteFramebuffer(marcoId.f); gl.deleteTexture(marcoId.t); gl.deleteRenderbuffer(marcoId.d); marcoId = null; }
    pedirDibujo();
  }
}

/* ============================================================
   DIBUJAR. Solo cuando algo cambia: un visor quieto no gasta nada.
   ============================================================ */
let pedido = false;
function pedirDibujo(){
  if (pedido || !gl || !estado.vista) return;
  pedido = true;
  requestAnimationFrame(() => { pedido = false; dibujar(); });
}

function matrices(){
  const e = ojo();
  const vista = mirar(e, cam.objetivo);
  const cerca = Math.max(cam.dist - cam.radio * 2, cam.dist * 0.02);
  const proy = perspectiva(FOV, lienzo.width / lienzo.height, cerca, cam.dist + cam.radio * 3);
  const giro = new Float32Array([vista[0],vista[1],vista[2], vista[4],vista[5],vista[6], vista[8],vista[9],vista[10]]);
  return { vista, proy, giro };
}

function visible(p){ return !estado.ocultos.has(p.def.grupo); }

function atar(p, conNormales){
  gl.bindBuffer(gl.ARRAY_BUFFER, p.pos);
  gl.vertexAttribPointer(0, 3, gl.SHORT, true, 0, 0);
  gl.enableVertexAttribArray(0);
  if (conNormales){
    gl.bindBuffer(gl.ARRAY_BUFFER, p.nor);
    gl.vertexAttribPointer(1, 3, gl.BYTE, true, 0, 0);
    gl.enableVertexAttribArray(1);
  } else gl.disableVertexAttribArray(1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.ind);
}

function dibujar(){
  medir();
  const m = matrices();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, lienzo.width, lienzo.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(prog.p);
  gl.uniformMatrix4fv(prog.u.uVista, false, m.vista);
  gl.uniformMatrix4fv(prog.u.uProy, false, m.proy);
  gl.uniformMatrix3fv(prog.u.uGiro, false, m.giro);

  const fantasmas = [];
  gl.disable(gl.BLEND); gl.depthMask(true);
  for (const p of estado.piezas){
    if (!visible(p)) continue;
    if (estado.aislar && estado.sel && p.id !== estado.sel){ fantasmas.push(p); continue; }
    pintar(p, 1, !estado.aislar && p.id === estado.sel ? 1 : 0);
  }
  /* Lo aislado se ve entero; el resto queda como un vidrio para no
     perder dónde está. Va después y sin escribir profundidad. */
  if (fantasmas.length){
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    for (const p of fantasmas) pintar(p, 0.1, 0);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }
}

function pintar(p, alfa, resalte){
  const c = GRUPOS[p.def.grupo].color;
  gl.uniform3f(prog.u.uColor, c[0], c[1], c[2]);
  gl.uniform1f(prog.u.uAlfa, alfa);
  gl.uniform1f(prog.u.uResalte, resalte);
  atar(p, true);
  gl.drawElements(gl.TRIANGLES, p.n, gl.UNSIGNED_SHORT, 0);
}

/* ============================================================
   QUÉ SE TOCÓ: se pinta cada pieza con su número como color en un
   lienzo que no se ve, y se lee el píxel del dedo. Exacto aunque la
   pieza sea un cartílago de dos milímetros.
   ============================================================ */
function tocado(x, y){
  if (!gl || !estado.vista) return null;
  medir();
  if (!marcoId){
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lienzo.width, lienzo.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    const d = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, d);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, lienzo.width, lienzo.height);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, d);
    marcoId = { f, t, d };
  }
  const m = matrices();
  gl.bindFramebuffer(gl.FRAMEBUFFER, marcoId.f);
  gl.viewport(0, 0, lienzo.width, lienzo.height);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(progId.p);
  gl.uniformMatrix4fv(progId.u.uVista, false, m.vista);
  gl.uniformMatrix4fv(progId.u.uProy, false, m.proy);
  estado.piezas.forEach((p, i) => {
    if (!visible(p)) return;
    if (estado.aislar && estado.sel && p.id !== estado.sel) return;
    const n = i + 1;
    gl.uniform3f(progId.u.uId, (n & 255) / 255, ((n >> 8) & 255) / 255, 0);
    atar(p, false);
    gl.drawElements(gl.TRIANGLES, p.n, gl.UNSIGNED_SHORT, 0);
  });
  const r = lienzo.width / lienzo.clientWidth;
  const px = new Uint8Array(4);
  gl.readPixels(Math.round(x * r), Math.round(lienzo.height - y * r), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const n = px[0] + (px[1] << 8);
  return n ? estado.piezas[n - 1].id : null;
}

/* ============================================================
   LOS DEDOS: uno gira, dos acercan y corren; un toque corto elige.
   ============================================================ */
const dedos = new Map();
let gesto = null;

lienzo.addEventListener('pointerdown', e => {
  lienzo.setPointerCapture(e.pointerId);
  dedos.set(e.pointerId, { x:e.clientX, y:e.clientY });
  if (dedos.size === 1) gesto = { x:e.clientX, y:e.clientY, t:Date.now(), movio:false };
  else if (gesto) gesto.movio = true;
});

lienzo.addEventListener('pointermove', e => {
  const antes = dedos.get(e.pointerId);
  if (!antes) return;
  const ahora = { x:e.clientX, y:e.clientY };
  if (dedos.size === 1){
    const dx = ahora.x - antes.x, dy = ahora.y - antes.y;
    if (gesto && Math.hypot(ahora.x - gesto.x, ahora.y - gesto.y) > 6) gesto.movio = true;
    if (gesto && gesto.movio){
      cam.giro -= dx * 0.008;
      cam.altura = Math.max(-1.45, Math.min(1.45, cam.altura + dy * 0.008));
      pedirDibujo();
    }
  } else if (dedos.size === 2){
    const [a, b] = [...dedos.entries()].map(([id, p]) => id === e.pointerId ? ahora : p);
    const [a0, b0] = [...dedos.values()];
    const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y), d1 = Math.hypot(a.x - b.x, a.y - b.y);
    if (d0 > 0 && d1 > 0) acercar(d0 / d1);
    correr((a.x + b.x - a0.x - b0.x) / 2, (a.y + b.y - a0.y - b0.y) / 2);
  }
  dedos.set(e.pointerId, ahora);
});

function soltar(e){
  if (!dedos.has(e.pointerId)) return;
  dedos.delete(e.pointerId);
  if (e.type === 'pointerup' && gesto && !gesto.movio && dedos.size === 0 && Date.now() - gesto.t < 500){
    const r = lienzo.getBoundingClientRect();
    elegirTocado(tocado(e.clientX - r.left, e.clientY - r.top));
  }
  if (!dedos.size) gesto = null;
}
lienzo.addEventListener('pointerup', soltar);
lienzo.addEventListener('pointercancel', soltar);

lienzo.addEventListener('wheel', e => {
  e.preventDefault();
  acercar(Math.exp(e.deltaY * 0.0015));
}, { passive:false });

function acercar(f){
  cam.dist = Math.max(cam.radio * 0.25, Math.min(8, cam.dist * f));
  pedirDibujo();
}

function correr(dx, dy){
  const vista = mirar(ojo(), cam.objetivo);
  const k = cam.dist * 2 * Math.tan(FOV / 2) / lienzo.clientHeight;
  const x = [vista[0], vista[4], vista[8]], y = [vista[1], vista[5], vista[9]];
  for (let a = 0; a < 3; a++) cam.objetivo[a] += (-dx * x[a] + dy * y[a]) * k;
  pedirDibujo();
}

/* El teclado, para quien no usa el dedo: flechas giran, + y −
   acercan, 0 vuelve a encuadrar. */
lienzo.addEventListener('keydown', e => {
  const paso = 0.15;
  if (e.key === 'ArrowLeft')       cam.giro += paso;
  else if (e.key === 'ArrowRight') cam.giro -= paso;
  else if (e.key === 'ArrowUp')    cam.altura = Math.min(1.45, cam.altura + paso);
  else if (e.key === 'ArrowDown')  cam.altura = Math.max(-1.45, cam.altura - paso);
  else if (e.key === '+' || e.key === '=') acercar(0.85);
  else if (e.key === '-')          acercar(1.18);
  else if (e.key === '0')          return encuadrar();
  else return;
  e.preventDefault();
  pedirDibujo();
});

/* ============================================================
   ELEGIR UNA PIEZA
   ============================================================ */
function elegirTocado(id){
  if (estado.quiz && !estado.quiz.esperando) return responder(id);
  if (!id){ if (!estado.aislar) elegir(null); return; }
  elegir(id);
}

function elegir(id){
  const estabaAislado = estado.aislar;
  estado.sel = id;
  if (!id) estado.aislar = false;
  pintarFicha();
  marcarLista();
  /* Aislado, la cámara se acercó a la pieza; al elegir otra o soltar,
     se vuelve a encuadrar sin cambiar el ángulo. */
  if (estabaAislado && gl && estado.vista) encuadrar(false);
  else pedirDibujo();
}

function pintarFicha(){
  const p = estado.sel && estado.porId[estado.sel];
  if (!p){
    ficha.hidden = true;
    return;
  }
  const g = GRUPOS[p.def.grupo];
  ficha.hidden = false;
  ficha.innerHTML = `
    <p class="v3d-ficha-grupo"><span class="v3d-punto" style="background:${colorCss(g.color)}"></span>${esc(g.nombre)}</p>
    <h2 class="v3d-ficha-nombre">${esc(p.def.nombre)}</h2>
    <p class="v3d-ficha-func">${esc(p.def.func)}</p>
    <div class="v3d-ficha-botones">
      ${gl ? `<button class="chip" type="button" id="v3d-aislar" aria-pressed="${estado.aislar}">Aislar</button>` : ''}
      <button class="chip" type="button" id="v3d-soltar">Cerrar</button>
    </div>`;
  const ais = $('v3d-aislar');
  if (ais) ais.onclick = () => {
    estado.aislar = !estado.aislar;
    ais.setAttribute('aria-pressed', estado.aislar);
    encuadrar(false);
  };
  $('v3d-soltar').onclick = () => elegir(null);
}

function colorCss(c){ return `rgb(${c.map(x => Math.round(x * 255)).join(',')})`; }

/* ============================================================
   PRACTICAR: el visor pregunta, el dedo contesta.
   ============================================================ */
function empezarPractica(){
  estado.quiz = { pregunta:null, bien:0, total:0, esperando:false };
  estado.aislar = false;
  elegir(null);
  siguientePregunta();
}

function terminarPractica(){
  estado.quiz = null;
  pintarPractica();
}

function siguientePregunta(){
  const q = estado.quiz;
  const posibles = estado.piezas.filter(p => visible(p) && p.id !== q.pregunta);
  if (!posibles.length){ terminarPractica(); return; }
  q.pregunta = posibles[Math.floor(Math.random() * posibles.length)].id;
  q.esperando = false;
  q.mensaje = '';
  elegir(null);
  pintarPractica();
}

function responder(id){
  const q = estado.quiz;
  if (!id) return;
  q.total++;
  const buscada = estado.porId[q.pregunta].def.nombre;
  if (id === q.pregunta){
    q.bien++;
    q.mensaje = `<b>¡Bien!</b> Eso es: ${esc(buscada)}.`;
  } else {
    q.mensaje = `Eso es <b>${esc(estado.porId[id].def.nombre)}</b>. Te marcamos dónde está lo que buscabas.`;
  }
  q.esperando = true;
  elegir(q.pregunta);
  pintarPractica();
}

function pintarPractica(){
  const q = estado.quiz;
  if (!q){
    practica.innerHTML = gl ? `
      <button class="boton borde" type="button" id="v3d-empezar">Practicar: tocá la pieza</button>` : '';
    const b = $('v3d-empezar');
    if (b) b.onclick = empezarPractica;
    return;
  }
  const nombre = esc(estado.porId[q.pregunta].def.nombre);
  practica.innerHTML = `
    <div class="v3d-quiz">
      <p class="v3d-quiz-cuenta">${q.bien} de ${q.total}</p>
      <p class="v3d-quiz-pregunta">${q.esperando ? q.mensaje : `Tocá en el modelo: <b>${nombre}</b>`}</p>
      <div class="v3d-ficha-botones">
        ${q.esperando ? `<button class="chip" type="button" id="v3d-otra">Otra</button>` :
                        `<button class="chip" type="button" id="v3d-paso">No sé</button>`}
        <button class="chip" type="button" id="v3d-fin">Terminar</button>
      </div>
    </div>`;
  const otra = $('v3d-otra'); if (otra) otra.onclick = siguientePregunta;
  const paso = $('v3d-paso'); if (paso) paso.onclick = () => {
    q.total++; q.esperando = true;
    q.mensaje = `Es esta: <b>${nombre}</b>.`;
    elegir(q.pregunta); pintarPractica();
  };
  $('v3d-fin').onclick = terminarPractica;
}

/* ============================================================
   LOS GRUPOS Y LA LISTA
   ============================================================ */
function pintarGrupos(){
  const v = estado.vista.def;
  chipsGr.innerHTML = v.grupos.map(g => `
    <button class="chip" type="button" data-grupo="${g}" aria-pressed="${!estado.ocultos.has(g)}">
      <span class="v3d-punto" style="background:${colorCss(GRUPOS[g].color)}"></span>${esc(GRUPOS[g].nombre)}
    </button>`).join('');
  chipsGr.querySelectorAll('[data-grupo]').forEach(b => b.onclick = () => {
    const g = b.dataset.grupo;
    if (estado.ocultos.has(g)) estado.ocultos.delete(g); else estado.ocultos.add(g);
    b.setAttribute('aria-pressed', !estado.ocultos.has(g));
    const s = estado.sel && estado.porId[estado.sel];
    if (s && estado.ocultos.has(s.def.grupo)) elegir(null);
    pedirDibujo();
  });
}

function pintarLista(){
  const v = estado.vista.def;
  lista.innerHTML = v.grupos.map(g => {
    const de = estado.piezas.filter(p => p.def.grupo === g);
    return `<h3 class="v3d-lista-grupo">${esc(GRUPOS[g].nombre)}</h3>
      <ul class="v3d-lista">${de.map(p => `
        <li><button type="button" data-pieza="${p.id}" aria-pressed="false">${esc(p.def.nombre)}</button></li>`).join('')}
      </ul>`;
  }).join('');
  lista.querySelectorAll('[data-pieza]').forEach(b => b.onclick = () => {
    const p = estado.porId[b.dataset.pieza];
    if (estado.ocultos.has(p.def.grupo)){ estado.ocultos.delete(p.def.grupo); pintarGrupos(); }
    elegir(p.id);
    ficha.scrollIntoView({ block:'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}

function marcarLista(){
  lista.querySelectorAll('[data-pieza]').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.pieza === estado.sel));
}

/* ============================================================
   CARGAR UNA VISTA
   ============================================================ */
async function bajar(url, avance){
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const total = +r.headers.get('content-length') || 0;
  if (!r.body || !total || !r.body.getReader) return new Uint8Array(await r.arrayBuffer());
  const lector = r.body.getReader(), partes = [];
  let n = 0;
  for (;;){
    const { done, value } = await lector.read();
    if (done) break;
    partes.push(value); n += value.length;
    avance(Math.min(1, n / total));
  }
  const todo = new Uint8Array(n);
  let o = 0;
  for (const p of partes){ todo.set(p, o); o += p.length; }
  return todo;
}

function leerBin(buf){
  const alinear = o => (o + 3) & ~3;
  const largo = new DataView(buf.buffer, buf.byteOffset).getUint32(0, true);
  const cab = JSON.parse(new TextDecoder().decode(buf.subarray(4, 4 + largo)));
  let o = alinear(4 + largo);
  const base = buf.byteOffset;
  const piezas = cab.piezas.map(p => {
    const pos = new Int16Array(buf.buffer, base + o, p.v * 3); o = alinear(o + p.v * 6);
    const nor = new Int8Array(buf.buffer, base + o, p.v * 3);  o = alinear(o + p.v * 3);
    const ind = new Uint16Array(buf.buffer, base + o, p.i);    o = alinear(o + p.i * 2);
    return { id:p.id, pos, nor, ind };
  });
  return { cab, piezas };
}

function subir(datos, tipo){
  const b = gl.createBuffer();
  gl.bindBuffer(tipo, b);
  gl.bufferData(tipo, datos, gl.STATIC_DRAW);
  return b;
}

async function cargarVista(clave){
  const def = VISTAS[clave];
  const turno = ++estado.cargando;
  claveVista = clave;
  estado.quiz = null;
  estado.sel = null;
  estado.aislar = false;
  estado.ocultos = new Set(def.ocultos || []);

  chipsVis.querySelectorAll('[data-vista]').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.vista === clave));
  bajadaV.textContent = def.bajada;
  const url = new URL(location.href);
  url.searchParams.set('vista', clave);
  url.searchParams.delete('pieza');
  history.replaceState(null, '', url);

  /* Sin WebGL la vista se arma igual, con la lista y las funciones. */
  if (gl) liberar();
  estado.vista = { clave, def, caja:[[-1,-1,-1],[1,1,1]] };
  estado.piezas = Object.entries(def.piezas).map(([id, d]) => ({ id, def:d, n:0 }));
  estado.porId = Object.fromEntries(estado.piezas.map(p => [p.id, p]));
  pintarGrupos(); pintarLista(); pintarFicha(); pintarPractica();

  if (!gl) return;

  cartel.hidden = false;
  cartel.innerHTML = `<p>Bajando el modelo de ${esc(def.nombre.toLowerCase())}…</p>
    <div class="v3d-barra"><span id="v3d-avance"></span></div>`;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let datos;
  try {
    datos = leerBin(await bajar(`datos/${clave}.bin`, f => {
      const a = $('v3d-avance'); if (a) a.style.width = Math.round(f * 100) + '%';
    }));
  } catch(e){
    if (turno !== estado.cargando) return;
    cartel.innerHTML = `<p>No se pudo bajar el modelo. ¿Hay señal?</p>
      <button class="chip" type="button" id="v3d-reintentar">Probar de nuevo</button>`;
    $('v3d-reintentar').onclick = () => cargarVista(clave);
    return;
  }
  if (turno !== estado.cargando) return;

  for (const d of datos.piezas){
    const p = estado.porId[d.id];
    if (!p) continue;
    p.pos = subir(d.pos, gl.ARRAY_BUFFER);
    p.nor = subir(d.nor, gl.ARRAY_BUFFER);
    p.ind = subir(d.ind, gl.ELEMENT_ARRAY_BUFFER);
    p.n = d.ind.length;
    const min = [1,1,1], max = [-1,-1,-1];
    for (let k = 0; k < d.pos.length; k++){
      const a = k % 3, x = d.pos[k] / 32767;
      if (x < min[a]) min[a] = x; if (x > max[a]) max[a] = x;
    }
    p.caja = [min, max];
  }
  /* Una pieza nueva en piezas.js que todavía no está en el .bin no
     se puede tocar ni pintar: se saca, en lugar de romper. */
  estado.piezas = estado.piezas.filter(p => p.pos);
  estado.porId = Object.fromEntries(estado.piezas.map(p => [p.id, p]));
  estado.vista.caja = datos.cab.caja;
  cartel.hidden = true;
  pintarLista();
  encuadrar();

  const pedida = params.get('pieza');
  if (pedida && estado.porId[pedida]){ elegir(pedida); params.delete('pieza'); }
}

/* ============================================================
   ARRANQUE
   ============================================================ */
chipsVis.innerHTML = Object.entries(VISTAS).map(([k, v]) =>
  `<button class="chip" type="button" data-vista="${k}" aria-pressed="false">${esc(v.nombre)}</button>`).join('');
chipsVis.querySelectorAll('[data-vista]').forEach(b => b.onclick = () => {
  if (b.dataset.vista !== claveVista || !estado.vista) cargarVista(b.dataset.vista);
});

$('v3d-encuadrar').onclick = () => { if (gl && estado.vista) encuadrar(); };

let hayGL = false;
try { hayGL = iniciarGL(); } catch(e){ hayGL = false; gl = null; }
if (!hayGL){
  gl = null;
  $('v3d-caja').classList.add('sin-3d');
  cartel.hidden = false;
  cartel.innerHTML = `<p>Este navegador no puede mostrar el modelo en 3D.
    <br>La lista de piezas de abajo sirve igual: tocá una y leé qué hace.</p>`;
} else {
  lienzo.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    cartel.hidden = false;
    cartel.innerHTML = `<p>El teléfono soltó el modelo para ahorrar memoria.</p>
      <button class="chip" type="button" onclick="location.reload()">Volver a cargarlo</button>`;
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => pedirDibujo()).observe(lienzo);
  else window.addEventListener('resize', pedirDibujo);
}

cargarVista(claveVista);
})();
