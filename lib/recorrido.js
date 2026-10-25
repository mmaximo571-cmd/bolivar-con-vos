/* ============================================================
   LOS RECORRIDOS GUIADOS (24/10/2026)

   «¿Cómo se usa?» en vivo: se oscurece la pantalla, se ilumina una
   parte y una tarjeta abajo cuenta para qué sirve. Siguiente, Atrás,
   Salir. Es la otra mitad de `primeros-pasos/`: ahí se lee y se
   comparte por link; desde cada ficha, «Mostrame en la app» trae acá
   con `?recorrido=<id>`.

   Pensado para el ingreso 2027: quien llega en marzo no sabe que la
   campana existe, ni que Mi cursada pide cuenta, ni que el botón de
   abajo a la derecha es una persona y no un bot.

   CÓMO SE ESCRIBE UN PASO. `sel` es una lista de selectores: se usa el
   primero que esté a la vista. Así un mismo paso sirve con cuenta y sin
   cuenta (mi/ dibuja cosas distintas). Si ninguno está, el paso se
   salta solo: un recorrido que señala el vacío enseña que la app está
   rota. El primer paso se espera hasta 8 segundos, porque el inicio
   tiene la apertura y la bienvenida antes de mostrar nada.

   Carga después de `app.js`, solo en las pantallas que tienen
   recorrido (inicio, agenda, mi, estudiemos). No va al armazón de
   `sw.js`: lo guarda la regla del final, como `lib/voy.js`.
   ============================================================ */

const RECORRIDOS = {
  inicio: {
    pantalla: '', nombre: 'El inicio',
    pasos: [
      { sel: ['.caja-buscador'], titulo: 'El buscador',
        texto: 'Escribí lo que necesitás con tus palabras: «constancia», «final», «micro». Busca en trámites, preguntas, fechas, cátedras y el glosario.' },
      { sel: ['#fila-carrera', '#mi-cursada .pregunta'], titulo: 'Tu carrera',
        texto: 'Elegí tu carrera y la app se acomoda: los accesos, las materias y las fechas pasan a ser las tuyas. Se cambia cuando quieras.' },
      { sel: ['#accesos'], titulo: 'A dónde ir',
        texto: 'Las pantallas de todos los días: tu año, Estudiemos, Fechas, los trámites. Tocá cualquiera.' },
      { sel: ['#kit'], titulo: 'Si recién empezás',
        texto: 'Lo primero de todo, en orden: anotarte, los trámites básicos, el vocabulario de la facu y cómo llegar.' },
      { sel: ['.campana'], titulo: 'La campana',
        texto: 'Lo de hoy, lo de esta semana, lo que cambió y lo nuevo. El numerito dice cuántas cosas no viste.' },
      { sel: ['.avisanos'], titulo: 'Avisanos',
        texto: 'Si no encontrás algo, preguntá acá. Primero busca en lo que ya está cargado y, si no lo tiene, te pasa con alguien de la agrupación.' },
      { sel: ['#abrir-menu'], titulo: 'El menú',
        texto: 'Todas las pantallas de la app, y tu perfil para entrar con tu cuenta.' }
    ]
  },

  fechas: {
    pantalla: 'agenda/', nombre: 'Fechas',
    pasos: [
      { sel: ['#calendario'], titulo: 'El calendario',
        texto: 'Los días con algo tienen un punto de color. Tocá un día para ver qué hay.' },
      { sel: ['#proximo'], titulo: 'Lo que viene',
        texto: 'Lo más cercano, sin buscar: una mesa de final, un paro, una charla.' },
      { sel: ['#filtros .filtros'], titulo: 'Los filtros',
        texto: 'Mostrá solo un tipo de cosa: finales, paros, actividades, grupos de estudio.' },
      { sel: ['#enfoque .enfoque'], titulo: 'Época de parciales',
        texto: 'Prendelo cuando estés a full con el estudio: deja en pantalla solo lo académico y esconde el resto mientras dure.' },
      { sel: ['#btn-bajar-todo'], titulo: 'Pasalo a tu calendario',
        texto: 'Baja un archivo que anota todas las fechas que vienen en el calendario del celular, cada una con aviso dos días antes.' }
    ]
  },

  avisos: {
    pantalla: 'mi/', nombre: 'Los avisos al celular',
    pasos: [
      { sel: ['#caja-avisos'], titulo: 'Prendé los avisos',
        texto: 'Te llega una notificación cuando hay un paro, abre la inscripción a mesas o hay una actividad. Elegís qué sí y qué no.' },
      { sel: ['.campana'], titulo: 'Y si te perdiste uno',
        texto: 'Todo lo que se avisó queda en la campana. Desde cualquier pantalla.' }
    ]
  },

  cursada: {
    pantalla: 'mi/', nombre: 'Mi cursada',
    pasos: [
      { sel: ['#formulario'], titulo: 'Primero, tu cuenta',
        texto: 'Mi cursada se guarda en tu cuenta, así no se pierde si cambiás de teléfono. Crearla es con un mail y una contraseña.' },
      { sel: ['#cursada'], titulo: 'Tu cursada',
        texto: 'Cargá qué materias cursás, qué día, a qué hora y en qué aula.' },
      { sel: ['#form-cursada'], titulo: 'Sumar una materia',
        texto: 'Elegí la materia y el horario. Aparece en Fechas, en la vista Semana.' },
      { sel: ['#mi-asistencia'], titulo: 'Tu asistencia',
        texto: 'Cada vez que entrás te preguntamos si fuiste a la última clase, y la app te dice cómo venís con el mínimo para no quedar libre.' }
    ]
  },

  estudiemos: {
    pantalla: 'estudiemos/', nombre: 'Estudiemos',
    pasos: [
      { sel: ['#elegir-materia', '#barra-estudio'], titulo: 'Elegí la materia',
        texto: 'Apuntes, resúmenes, programas y fichas de cada materia, ordenados.' },
      { sel: ['#modo-repasar'], titulo: 'Para repasar',
        texto: 'Fichas, mazos, líneas de tiempo y videos de un minuto para repasar las materias.' },
      { sel: ['#modo-practicar'], titulo: 'Para practicar',
        texto: 'Ahí está Mis parciales: anotás cuándo rendís y la app te cuenta los días que faltan, también desde el inicio.' },
      { sel: ['#pomodoro-caja'], titulo: 'Para concentrarte',
        texto: 'Un reloj de estudio: 25 minutos de foco y 5 de descanso.' },
      { sel: ['#comunidad'], titulo: 'Lo que comparten les estudiantes',
        texto: 'Si tenés un resumen que te sirvió, compartilo con el botón de abajo: le sirve a quien viene atrás.' }
    ]
  }
};

const LLAVE_RECORRIDOS = 'bolivar-recorridos-vistos';

function recorridosVistos(){
  try { return JSON.parse(localStorage.getItem(LLAVE_RECORRIDOS) || '[]') || []; }
  catch(e){ return []; }
}

/* A la vista de verdad: no escondido, con tamaño, y no adentro de algo
   con `hidden` (el inicio tiene `#app hidden` mientras corre la
   apertura). */
function __recorridoVisible(el){
  if (!el || el.closest('[hidden]')) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function __recorridoBuscar(paso){
  for (const s of paso.sel){
    const el = [...document.querySelectorAll(s)].find(__recorridoVisible);
    if (el) return el;
  }
  return null;
}

function empezarRecorrido(id){
  const rec = RECORRIDOS[id];
  if (!rec || document.querySelector('.recorrido-fondo')) return;
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fondo = document.createElement('div');
  fondo.className = 'recorrido-fondo';
  const foco = document.createElement('div');
  foco.className = 'recorrido-foco';
  foco.setAttribute('aria-hidden', 'true');
  const tarjeta = document.createElement('div');
  tarjeta.className = 'recorrido-tarjeta';
  tarjeta.setAttribute('role', 'dialog');
  tarjeta.setAttribute('aria-modal', 'true');
  tarjeta.setAttribute('aria-labelledby', 'recorrido-titulo');
  tarjeta.tabIndex = -1;
  document.body.append(fondo, foco, tarjeta);

  let n = -1, actual = null;
  const volverA = document.activeElement;

  /* El foco sigue al elemento si la página se mueve (una imagen que
     terminó de cargar, el teclado que sube). */
  function ubicar(){
    if (!actual) return;
    const r = actual.getBoundingClientRect(), m = 6;
    Object.assign(foco.style, {
      top: (r.top - m) + 'px', left: (r.left - m) + 'px',
      width: (r.width + m * 2) + 'px', height: (r.height + m * 2) + 'px'
    });
    /* La tarjeta va del lado contrario a lo iluminado, para no taparlo. */
    tarjeta.classList.toggle('arriba', r.top + r.height / 2 > window.innerHeight * 0.55);
  }

  function pintar(){
    const p = rec.pasos[n];
    const cuantos = rec.pasos.length, ultimo = n === cuantos - 1;
    tarjeta.innerHTML = `
      <p class="recorrido-cuenta">${esc(rec.nombre)} · ${n + 1} de ${cuantos}</p>
      <h2 id="recorrido-titulo">${esc(p.titulo)}</h2>
      <p>${esc(p.texto)}</p>
      <div class="recorrido-botones">
        <button type="button" class="boton texto" data-r="salir">Salir</button>
        ${n > 0 ? '<button type="button" class="boton borde" data-r="atras">Atrás</button>' : ''}
        <button type="button" class="boton" data-r="seguir">${ultimo ? 'Listo' : 'Siguiente'}</button>
      </div>`;
    tarjeta.querySelector('[data-r="seguir"]').focus();
  }

  /* Va al paso que sigue en esa dirección que tenga algo a la vista. */
  function ir(dir){
    let k = n + dir;
    while (k >= 0 && k < rec.pasos.length && !__recorridoBuscar(rec.pasos[k])) k += dir;
    if (k < 0) return;
    if (k >= rec.pasos.length) return terminar(true);
    n = k;
    actual = __recorridoBuscar(rec.pasos[n]);
    actual.scrollIntoView({ block: 'center', behavior: menosMovimiento ? 'auto' : 'smooth' });
    pintar();
    ubicar();
    /* El scroll suave tarda: se vuelve a ubicar cuando termina. */
    setTimeout(ubicar, menosMovimiento ? 0 : 450);
  }

  function terminar(completo){
    window.removeEventListener('scroll', ubicar, true);
    window.removeEventListener('resize', ubicar);
    document.removeEventListener('keydown', teclas);
    fondo.remove(); foco.remove(); tarjeta.remove();
    if (completo){
      const vistos = recorridosVistos().filter(x => x !== id);
      vistos.push(id);
      try { localStorage.setItem(LLAVE_RECORRIDOS, JSON.stringify(vistos)); } catch(e){}
      if (typeof anotarHito === 'function') anotarHito('recorrido-' + id);
    }
    /* Que la dirección no quede con `?recorrido=`: si recarga, no
       tiene por qué volver a empezar. */
    try {
      const u = new URL(location.href);
      if (u.searchParams.has('recorrido')){
        u.searchParams.delete('recorrido');
        history.replaceState(history.state, '', u.pathname + u.search + u.hash);
      }
    } catch(e){}
    if (volverA && volverA.focus) volverA.focus();
  }

  function teclas(ev){
    if (ev.key === 'Escape') terminar(false);
    else if (ev.key === 'ArrowRight') ir(1);
    else if (ev.key === 'ArrowLeft') ir(-1);
  }

  tarjeta.addEventListener('click', ev => {
    const b = ev.target.closest('[data-r]');
    if (!b) return;
    if (b.dataset.r === 'salir') terminar(false);
    else if (b.dataset.r === 'atras') ir(-1);
    else ir(1);
  });
  window.addEventListener('scroll', ubicar, true);
  window.addEventListener('resize', ubicar);
  document.addEventListener('keydown', teclas);

  /* El primer paso puede tardar en aparecer (apertura, datos de la
     red): se espera un rato antes de darse por vencido. */
  tarjeta.innerHTML = '<p class="recorrido-cuenta">Preparando el recorrido…</p>';
  const desde = Date.now();
  (function esperar(){
    /* Al primero se lo espera 3 segundos aunque ya se vea otro: en mi/
       la campana aparece antes que la caja de avisos, y arrancar con lo
       primero que se ve se salteaba justo el paso principal. */
    const espera = Date.now() - desde;
    if (__recorridoBuscar(rec.pasos[0])
        || (espera > 3000 && rec.pasos.some(__recorridoBuscar))) return ir(1);
    if (espera > 8000){
      tarjeta.innerHTML = `<h2 id="recorrido-titulo">No encontramos qué mostrarte</h2>
        <p>Puede que la pantalla todavía esté cargando. Probá de nuevo en un rato.</p>
        <div class="recorrido-botones"><button type="button" class="boton" data-r="salir">Cerrar</button></div>`;
      return;
    }
    setTimeout(esperar, 300);
  })();
}

/* Si la dirección trae `?recorrido=<id>` y el recorrido es de esta
   pantalla, arranca solo. Se compara la pantalla para que un link mal
   armado no ilumine cosas de otra. */
(function arrancarDesdeLaDireccion(){
  let id = null;
  try { id = new URLSearchParams(location.search).get('recorrido'); } catch(e){}
  const rec = id && RECORRIDOS[id];
  if (!rec) return;
  const raiz = new URL(window.RAIZ || './', location.href).pathname;
  if (location.pathname.replace(/index\.html$/, '') !== raiz + rec.pantalla) return;
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', () => empezarRecorrido(id));
  else empezarRecorrido(id);
})();
