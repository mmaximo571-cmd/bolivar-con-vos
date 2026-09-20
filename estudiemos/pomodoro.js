/* ============================================================
   EL POMODORO DE ESTUDIEMOS (20/9/2026)

   Un reloj de estudio en la portada: 25 minutos de una sola cosa, 5
   de descanso, y cada cuatro focos un descanso largo. No es una
   pantalla aparte a propósito —quien estudia ya está acá, y una
   pestaña más es una excusa para irse—: es una tira arriba de los
   modos, con su hoja para el detalle.

   TRES DECISIONES QUE VALE LA PENA ESCRIBIR:

   1. LO QUE SE GUARDA ES LA HORA EN QUE TERMINA, no los segundos que
      faltan. Un teléfono con la pantalla apagada frena los relojes de
      JavaScript, así que un contador que descuenta de a un segundo
      llega tarde y miente. Guardando `fin` (un instante), volver a la
      pantalla es una resta y el número siempre es el de verdad.

   2. NO ENCADENA SOLO. Cuando se termina el foco, el descanso queda
      LISTO pero no arranca: si la app largara el descanso sola
      mientras alguien sigue escribiendo, estaría contando un descanso
      que no pasó. Un toque lo empieza.

   3. VIVE EN ESTE TELÉFONO (localStorage, como la huella): nada viaja
      a la base. Y no pide permiso de notificaciones —eso es de los
      avisos de la mesa, que sí valen la interrupción—: suena, vibra y
      escribe el tiempo en el título de la pestaña, que es lo que se
      ve cuando la persona se fue a otra pantalla del navegador.
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const caja = $('pomodoro-caja');
  if (!caja) return;

  const CLAVE = 'bolivar-pomodoro';
  /* Los dos ritmos: el clásico y el largo, para quien ya viene
     enganchada y cortar a los 25 le rompe más de lo que le suma. */
  const PRESETS = {
    '25': { foco:25, corto:5,  largo:15 },
    '50': { foco:50, corto:10, largo:20 }
  };
  const NOMBRE = { foco:'Foco', corto:'Descanso', largo:'Descanso largo' };
  /* Cortas a propósito: en la tira comparten renglón con el reloj, y
     a 360 px lo que no entra se corta con puntos suspensivos. */
  const BAJADA = {
    foco:  'Una cosa por vez.',
    corto: 'Parate, tomá agua.',
    largo: 'Cortá de verdad.'
  };

  function hoyEs(){
    const f = new Date();
    return f.getFullYear() + '-' + (f.getMonth() + 1) + '-' + f.getDate();
  }

  /* ---------- Lo guardado ---------- */
  const NUEVO = () => ({ preset:'25', fase:'foco', resta: 25 * 60000, fin:null,
                         corriendo:false, hechos:0, hoy:0, dia:hoyEs(), mudo:false });
  let p = NUEVO();
  let aviso = '';        // lo último que pasó, en castellano

  function leer(){
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (g && typeof g === 'object') p = Object.assign(NUEVO(), g);
    } catch(err){}
    if (!PRESETS[p.preset]) p.preset = '25';
    if (!NOMBRE[p.fase])    p.fase   = 'foco';
    /* La cuenta del día es del día: a la mañana siguiente arranca en cero. */
    if (p.dia !== hoyEs()){ p.dia = hoyEs(); p.hoy = 0; }
  }
  function guardar(){ try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch(err){} }

  const dura = f => PRESETS[p.preset][f] * 60000;
  const restante = () => p.corriendo ? Math.max(0, p.fin - Date.now()) : Math.max(0, p.resta);
  function reloj(ms){
    const s = Math.ceil(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /* ---------- El sonido ----------
     Tres notas cortas, hechas en el momento: un archivo de audio son
     kilobytes que casi nadie llega a escuchar. El contexto se crea
     con el dedo de la persona (al tocar «Empezar»), que es la única
     forma de que el navegador después lo deje sonar solo. */
  let audio = null;
  function despertarAudio(){
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio = audio || new Ctx();
      if (audio.state === 'suspended') audio.resume();
    } catch(err){ audio = null; }
  }
  function sonar(){
    try { if (navigator.vibrate) navigator.vibrate([120, 90, 120]); } catch(err){}
    if (p.mudo || !audio) return;
    try {
      /* `p.fase` ya es la que VIENE: si viene un foco es porque se
         terminó un descanso. Sube para volver, baja para parar. */
      const nota = p.fase === 'foco' ? 880 : 587;
      const ahora = audio.currentTime;
      [0, .22, .44].forEach((cuando, i) => {
        const o = audio.createOscillator(), vol = audio.createGain();
        o.type = 'sine';
        o.frequency.value = i === 2 ? nota * 1.5 : nota;
        vol.gain.setValueAtTime(.0001, ahora + cuando);
        vol.gain.exponentialRampToValueAtTime(.2, ahora + cuando + .02);
        vol.gain.exponentialRampToValueAtTime(.0001, ahora + cuando + .18);
        o.connect(vol).connect(audio.destination);
        o.start(ahora + cuando);
        o.stop(ahora + cuando + .2);
      });
    } catch(err){}
  }

  /* ---------- Los cambios de estado ---------- */
  function arrancar(){
    despertarAudio();
    if (p.corriendo) return;
    p.fin = Date.now() + Math.max(1000, restante());
    p.corriendo = true;
    aviso = '';
    guardar(); latir(); pintar();
  }
  function pausar(){
    if (!p.corriendo) return;
    p.resta = restante();
    p.corriendo = false;
    p.fin = null;
    aviso = 'En pausa. El reloj te espera.';
    guardar(); latir(); pintar();
  }
  /* `callado` es cuando el turno se terminó con la pantalla cerrada:
     ahí no se hace sonar nada horas después, solo se cuenta. */
  function terminar(callado){
    const era = p.fase;
    if (era === 'foco'){ p.hechos++; p.hoy++; }
    const sigue = era === 'foco' ? (p.hechos % 4 === 0 ? 'largo' : 'corto') : 'foco';
    p.fase = sigue;
    p.corriendo = false;
    p.fin = null;
    p.resta = dura(sigue);
    aviso = era === 'foco'
      ? (callado ? 'Mientras no estabas se terminó el foco. Te toca descansar.'
                 : 'Terminaste el foco. Descansá ' + PRESETS[p.preset][sigue] + ' minutos.')
      : (callado ? 'El descanso se terminó mientras no estabas.'
                 : 'Se terminó el descanso. ¿Arrancamos otro foco?');
    guardar();
    if (!callado) sonar();
    latir(); pintar();
  }
  /* Saltear NO cuenta el foco: contarlo sería regalarse un pomodoro
     que no pasó, y el número de abajo dejaría de querer decir algo. */
  function saltear(){
    const sigue = p.fase === 'foco' ? (p.hechos % 4 === 3 ? 'largo' : 'corto') : 'foco';
    p.fase = sigue; p.corriendo = false; p.fin = null; p.resta = dura(sigue);
    aviso = 'Saltaste al ' + NOMBRE[sigue].toLowerCase() + '.';
    guardar(); latir(); pintar();
  }
  function reiniciar(){
    p.corriendo = false; p.fin = null; p.resta = dura(p.fase);
    aviso = NOMBRE[p.fase] + ', de nuevo desde el principio.';
    guardar(); latir(); pintar();
  }
  function cambiarPreset(cual){
    if (!PRESETS[cual] || cual === p.preset) return;
    const hecho = Math.min(1, Math.max(0, 1 - restante() / dura(p.fase)));
    p.preset = cual;
    /* Con el reloj andando se estira o se achica lo que falta en la
       misma proporción; parado, se pone el turno entero. */
    if (p.corriendo) p.fin = Date.now() + dura(p.fase) * (1 - hecho);
    else p.resta = dura(p.fase);
    guardar(); pintar();
  }

  /* ---------- El latido ----------
     Cada 250 ms y no cada segundo: con un segundo justo, el número de
     la pantalla se atrasa hasta medio segundo del real. */
  let latido = null;
  function latir(){
    clearInterval(latido);
    latido = p.corriendo ? setInterval(pintar, 250) : null;
  }

  /* ---------- Dibujar ---------- */
  const abrirBoton = $('pomo-abrir'), accion = $('pomo-accion');
  const rotulo = $('pomo-rotulo'), bajada = $('pomo-bajada'), chico = $('pomo-chico');
  const barra = $('pomo-barra');
  const grande = $('pomo-grande'), fase = $('pomo-fase'), vuelta = $('pomo-vuelta');
  const ciclos = $('pomo-ciclos'), dicho = $('pomo-aviso'), cuenta = $('pomo-cuenta');
  const jugar = $('pomo-jugar'), botonSaltar = $('pomo-saltar'), botonSonido = $('pomo-sonido');
  const presets = [...document.querySelectorAll('.pomo-presets button')];
  const TITULO = document.title;

  function verbo(){
    if (p.corriendo) return 'Pausar';
    if (restante() < dura(p.fase)) return 'Seguir';
    /* «Descansar» y no «Empezar el descanso»: la tira lo muestra en un
       botón que en un teléfono de 360 px comparte renglón con el
       reloj, y la frase larga lo partía en tres líneas. */
    return p.fase === 'foco' ? 'Empezar' : 'Descansar';
  }

  function pintar(){
    if (p.corriendo && restante() <= 0){ terminar(false); return; }

    const queda = restante();
    const hecho = 1 - queda / dura(p.fase);
    const texto = reloj(queda);

    caja.classList.toggle('corriendo', p.corriendo);
    /* La fase pinta: amarillo el foco, celeste el descanso. Va en los
       dos lados porque la hoja vive fuera de la tira. */
    caja.dataset.fase = p.fase;
    hoja.dataset.fase = p.fase;

    rotulo.textContent = p.corriendo || aviso ? NOMBRE[p.fase] : 'Pomodoro';
    bajada.textContent = p.corriendo ? BAJADA[p.fase]
      : aviso ? aviso
      : PRESETS[p.preset].foco + ' minutos de foco, ' + PRESETS[p.preset].corto + ' de descanso.';
    chico.textContent = texto;
    chico.hidden = !p.corriendo;
    barra.style.setProperty('--a', hecho.toFixed(4));
    barra.hidden = !p.corriendo;
    accion.textContent = verbo();
    accion.classList.toggle('pausa', p.corriendo);

    grande.textContent = texto;
    /* El número cambia cuatro veces por segundo: se lee en voz alta el
       minuto, no el tic. Por eso el reloj no es una región viva y lo
       que se anuncia es el cambio de turno, abajo. */
    grande.setAttribute('aria-label',
      'Faltan ' + texto.replace(':', ' minutos y ') + ' segundos de ' + NOMBRE[p.fase].toLowerCase());
    fase.textContent = NOMBRE[p.fase];
    vuelta.style.strokeDashoffset = (1 - hecho).toFixed(4);
    jugar.textContent = verbo();
    botonSaltar.textContent = p.fase === 'foco' ? 'Saltar al descanso' : 'Saltar al foco';
    dicho.textContent = aviso;
    dicho.hidden = !aviso;
    /* El dato, en la voz de la pantalla: lo que la app midió. */
    cuenta.textContent = p.hoy
      ? p.hoy + (p.hoy === 1 ? ' foco terminado hoy' : ' focos terminados hoy')
      : 'Todavía ningún foco terminado hoy';
    botonSonido.setAttribute('aria-pressed', String(!p.mudo));
    botonSonido.textContent = p.mudo ? 'Sonido apagado' : 'Sonido prendido';

    /* Los cuatro puntos: en qué parte de la vuelta estás. */
    const llenos = p.fase === 'largo' ? 4 : p.hechos % 4;
    [...ciclos.children].forEach((d, i) => d.classList.toggle('lleno', i < llenos));

    presets.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.preset === p.preset)));

    document.title = p.corriendo ? texto + ' · ' + NOMBRE[p.fase] + ' · Estudiemos' : TITULO;
  }

  /* ---------- La hoja ----------
     Misma mecánica que la hoja de materias: se espera el final de la
     transición, con respaldo por tiempo por si no arranca (una hoja
     que no se cierra deja la pantalla inalcanzable). */
  const fondo = $('hoja-pomodoro-fondo'), hoja = $('hoja-pomodoro');
  let cerrando = null, volverA = null;

  function abrir(){
    if (!fondo.hidden) return;
    /* De dónde se vino, para devolver el foco ahí. No siempre es la
       tira: desde el buscador se llega por un resultado, y con la
       búsqueda escrita la portada entera está en display:none —
       devolverle el foco a algo escondido lo tira al vacío. */
    volverA = document.activeElement;
    pintar();
    fondo.hidden = false;
    document.body.style.overflow = 'hidden';
    $('hoja-pomodoro-titulo').focus({ preventScroll:true });
  }
  function cerrar(){
    if (fondo.hidden || cerrando !== null) return;
    const alTerminar = ev => { if (ev.target === hoja) listo(); };
    const listo = () => {
      hoja.removeEventListener('transitionend', alTerminar);
      clearTimeout(cerrando); cerrando = null;
      fondo.classList.remove('cerrando');
      hoja.style.transform = '';
      fondo.hidden = true;
      document.body.style.overflow = '';
      /* El foco vuelve al primero de estos que siga a la vista. El
         orden es el del camino de ida: de dónde se vino, el resultado
         del buscador que abrió la hoja —un enlace a #pomodoro manda el
         foco al vacío, porque la sección no se puede enfocar—, la tira
         (escondida mientras hay búsqueda escrita) y, si no queda nada,
         el cuerpo de la pantalla. Lo que NO se enfoca es el buscador:
         en el teléfono levantaría el teclado encima de todo. */
      const seVe = el => el && document.contains(el) && el.offsetParent !== null;
      const destino = [volverA, document.querySelector('#resultados a[href$="#pomodoro"]'),
                       abrirBoton, $('contenido')].find(seVe);
      if (destino) destino.focus({ preventScroll:true });
      volverA = null;
      /* Si se llegó por #pomodoro, la dirección se limpia: con el hash
         puesto, volver a elegirlo en el buscador no cambia nada y la
         hoja no se abriría una segunda vez. */
      if (location.hash === '#pomodoro')
        history.replaceState(null, '', location.pathname + location.search);
    };
    hoja.addEventListener('transitionend', alTerminar);
    cerrando = setTimeout(listo, 600);
    hoja.style.transform = '';
    fondo.classList.add('cerrando');
  }

  /* La manija promete que la hoja baja con el dedo, así que baja. */
  (function arrastre(){
    let desde = null, dy = 0, t0 = 0;
    hoja.addEventListener('pointerdown', ev => {
      if (!ev.target.closest('.hoja-manija, #hoja-pomodoro-titulo')) return;
      if (matchMedia('(min-width:720px)').matches) return;
      desde = ev.clientY; dy = 0; t0 = performance.now();
      hoja.setPointerCapture(ev.pointerId);
      hoja.classList.add('arrastrando');
    });
    hoja.addEventListener('pointermove', ev => {
      if (desde === null) return;
      dy = Math.max(0, ev.clientY - desde);
      hoja.style.transform = 'translateY(' + dy + 'px)';
    });
    const soltar = () => {
      if (desde === null) return;
      desde = null;
      hoja.classList.remove('arrastrando');
      const rapido = dy / Math.max(1, performance.now() - t0) > .6;
      if (dy > 90 || (rapido && dy > 30)) cerrar();
      else hoja.style.transform = '';
    };
    hoja.addEventListener('pointerup', soltar);
    hoja.addEventListener('pointercancel', soltar);
  })();

  /* ---------- Quién toca qué ---------- */
  const jugarOparar = () => { p.corriendo ? pausar() : arrancar(); };
  abrirBoton.addEventListener('click', abrir);
  accion.addEventListener('click', jugarOparar);
  jugar.addEventListener('click', jugarOparar);
  botonSaltar.addEventListener('click', saltear);
  $('pomo-reiniciar').addEventListener('click', reiniciar);
  botonSonido.addEventListener('click', () => {
    p.mudo = !p.mudo; guardar(); pintar();
    /* Prenderlo es el momento de pedirle permiso al navegador, y de
       que se oiga una nota: sin eso nadie sabe si quedó prendido. */
    if (!p.mudo){ despertarAudio(); sonar(); }
  });
  presets.forEach(b => b.addEventListener('click', () => cambiarPreset(b.dataset.preset)));
  fondo.addEventListener('click', ev => { if (ev.target === fondo) cerrar(); });
  document.addEventListener('keydown', ev => {
    if (!fondo.hidden && ev.key === 'Escape') cerrar();
  });

  /* Desde el buscador —«Pomodoro» es una herramienta más— y desde
     cualquier enlace a #pomodoro. */
  function porHash(){ if (location.hash === '#pomodoro') abrir(); }
  addEventListener('hashchange', porHash);

  /* Volver de una ficha trae la página del bfcache con el reloj
     congelado en el minuto en que se fue, y con la pestaña escondida
     el navegador frena el latido: las dos veces se recalcula contra
     la hora de verdad. */
  function despertar(){
    leer();
    if (p.corriendo && p.fin <= Date.now()) terminar(true);
    else { latir(); pintar(); }
  }
  addEventListener('pageshow', ev => { if (ev.persisted) despertar(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') despertar();
  });

  /* ---------- Arranque ---------- */
  despertar();
  porHash();
})();
