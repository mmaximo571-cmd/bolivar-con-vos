/* ============================================================
   I° CONGRESO INTERDISCIPLINARIO · la pantalla `congreso/`

   Tres cosas:
     1. El cronograma, que viene de `congreso_mesas` y lo edita el
        equipo desde el panel. Si la base no contesta, se dibuja con
        la copia de abajo (MESAS_DE_RESERVA), que es lo que decían las
        placas el 7/10: en una sala con mala señal, el horario y el
        aula tienen que estar igual.
     2. Las preguntas de cada mesa y los aportes de cada eje, en una
        hoja que sube desde abajo. Sin cuenta: el teléfono se reconoce
        con una MARCA al azar (como en «Voy», `lib/voy.js`, pero en
        otra llave: un apoyo en el congreso no tiene que ver con ir a
        un paro).
     3. Lo que sigue: arriba del cronograma, la mesa que está pasando
        ahora o la próxima.

   Todo se lee y se escribe por las funciones de
   `sql/tabla-congreso.sql`. La base nunca devuelve la marca de nadie;
   qué preguntas son «mías» y cuáles apoyé lo sabe solo este teléfono.

   Carga DESPUÉS de `app.js` (usa `db`, `esc`, `hoyISO`,
   `htmlCabecera`, `pintarNav`…) y de `lib/fecha-al-calendario.js`
   (`urlGoogleCalendar`).
   ============================================================ */
(function congreso(){
  'use strict';

  document.getElementById('cabecera').innerHTML = htmlCabecera();
  document.getElementById('pie').innerHTML = htmlPie();
  pintarNav('congreso');
  document.body.classList.remove('sin-js');
  vigilarAparicion();

  const EJES = {
    salud:       'Salud',
    territorio:  'Territorio',
    tecnologias: 'Nuevas tecnologías'
  };
  const ROMANOS = ['', 'I','II','III','IV','V','VI','VII','VIII','IX','X',
                   'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];
  const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  /* Lo que dura una mesa, para saber si está «en vivo». Es la misma
     cuenta que usa el calendario (`puntasDelEvento`). */
  const DURA_MINUTOS = 120;
  const CADA_CUANTO = 20000;   // refrescar el muro abierto
  const LARGO_MAXIMO = 600;    // el mismo tope que la base

  /* Lo que decían las placas el 7/10/2026. Es la RESERVA, no la
     fuente: si la base contesta, manda la base. */
  const MESAS_DE_RESERVA = [
    { id:null, numero:1, titulo:'Derecho a la salud: ¿qué puede la APS?',
      bajada:'Territorios, prácticas y cuidados en debate.', eje:'salud',
      fecha:'2026-10-09', hora:'12:00', lugar:'Aula Magna', placa:'placas/mesa-1.webp',
      expositores:[{nombre:'Ale Wagner'},{nombre:'Ana Fuks'},{nombre:'Cynthia Ramacciotti'}] },
    { id:null, numero:3, titulo:'Trabajo Social y la justicia hoy',
      bajada:'Transformaciones, tensiones y desafíos para la intervención.', eje:null,
      fecha:'2026-10-14', hora:'14:30', lugar:'Aula 14', placa:'placas/mesa-3.webp',
      expositores:[{nombre:'Luciana Ponziani'},{nombre:'Marcela Velurtas'},{nombre:'Analía Chillemi'}] },
    { id:null, numero:4, titulo:'Niñeces e intervención fonoaudiológica',
      bajada:'', eje:null,
      fecha:'2026-10-16', hora:'18:00', lugar:'Aula 14', placa:'placas/mesa-4.webp',
      expositores:[{nombre:'Silvia Cesanelli'},{nombre:'Gisele Prado'}] },
    { id:null, numero:5, titulo:'¿La IA puede reemplazarnos?',
      bajada:'Nuevas subjetividades e intervención profesional.', eje:'tecnologias',
      fecha:'2026-10-22', hora:'13:00', lugar:'Aula Magna', placa:'placas/mesa-5.webp',
      expositores:[{nombre:'Verónica Sforzin'},{nombre:'Javier'},{nombre:'Daniel T'}] },
    { id:null, numero:6, titulo:'Experiencias de gestión comunitaria del riesgo',
      bajada:'Con el CEPA (Cuerpo de Evacuación y Primeros Auxilios, La Plata), en conjunto con la cátedra Estado, Territorio y Problemáticas Sociales.',
      eje:'territorio', fecha:'2026-10-22', hora:'17:00', lugar:'Aula 4', placa:'placas/mesa-6.webp',
      expositores:[{nombre:'CEPA La Plata'}] }
  ];

  /* ------------------------------------------------------------
     LO QUE SABE ESTE TELÉFONO
     ------------------------------------------------------------ */
  const LLAVE = 'bolivar-congreso';

  function leerMio(){
    try {
      const g = JSON.parse(localStorage.getItem(LLAVE) || 'null');
      if (g && typeof g === 'object') return {
        marca:  /^[0-9a-f]{32}$/.test(g.marca || '') ? g.marca : '',
        apoyos: Array.isArray(g.apoyos) ? g.apoyos.map(Number).filter(Boolean) : [],
        mias:   Array.isArray(g.mias)   ? g.mias.map(Number).filter(Boolean)   : [],
        nombre: typeof g.nombre === 'string' ? g.nombre.slice(0, 60) : ''
      };
    } catch(e){}
    return { marca:'', apoyos:[], mias:[], nombre:'' };
  }
  function guardarMio(g){
    try { localStorage.setItem(LLAVE, JSON.stringify(g)); } catch(e){}
  }
  /* La marca se inventa la primera vez que hace falta: quien solo mira
     el cronograma no tiene por qué tener una. */
  function marca(){
    const g = leerMio();
    if (g.marca) return g.marca;
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    g.marca = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    guardarMio(g);
    return g.marca;
  }

  /* ------------------------------------------------------------
     LA HORA DE LA FACULTAD
     Con la de Argentina y no con la del teléfono, como en Espacios.
     ------------------------------------------------------------ */
  function ahoraEnLaPlata(){
    try {
      const p = new Intl.DateTimeFormat('en-CA', {
        timeZone:'America/Argentina/Buenos_Aires', year:'numeric', month:'2-digit',
        day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false
      }).formatToParts(new Date());
      const v = t => (p.find(x => x.type === t) || {}).value;
      return { fecha: `${v('year')}-${v('month')}-${v('day')}`,
               minutos: (Number(v('hour')) % 24) * 60 + Number(v('minute')) };
    } catch(e){
      const d = new Date();
      return { fecha: hoyISO(), minutos: d.getHours() * 60 + d.getMinutes() };
    }
  }
  const minutosDe = hora => {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(hora || ''));
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const horaLinda = hora => String(hora || '').slice(0, 5);

  function estadoDe(m, ahora){
    if (m.fecha < ahora.fecha) return 'paso';
    if (m.fecha > ahora.fecha) return 'viene';
    const empieza = minutosDe(m.hora);
    if (empieza === null) return 'hoy';
    if (ahora.minutos < empieza) return 'hoy';
    if (ahora.minutos < empieza + DURA_MINUTOS) return 'vivo';
    return 'paso';
  }

  function diaLindo(iso){
    const [a, me, d] = iso.split('-').map(Number);
    const fecha = new Date(a, me - 1, d);
    return `${DIAS[fecha.getDay()]} ${d}/${me}`;
  }

  /* Una placa cargada desde el panel trae la dirección completa; las
     de la carpeta vienen como `placas/…`. */
  const urlPlaca = p => !p ? '' : /^https:\/\//.test(p) ? p : p.replace(/^\/+/, '');

  /* ------------------------------------------------------------
     EL CRONOGRAMA
     ------------------------------------------------------------ */
  let mesas = [];
  let hayBase = false;   // si no, no se puede preguntar
  const cajaMesas = document.getElementById('cg-mesas');

  function etiquetaEstado(estado){
    return estado === 'vivo' ? '<span class="cg-estado vivo">Ahora</span>'
         : estado === 'hoy'  ? '<span class="cg-estado hoy">Hoy</span>'
         : estado === 'paso' ? '<span class="cg-estado">Ya pasó</span>' : '';
  }

  function htmlCuando(m){
    return `<ul class="cg-cuando">
        <li>${esc(diaLindo(m.fecha))}</li>
        ${m.hora ? `<li>${esc(horaLinda(m.hora))} h</li>` : ''}
        ${m.lugar ? `<li>${esc(m.lugar)}</li>` : ''}
      </ul>`;
  }

  function htmlGente(m){
    const g = (Array.isArray(m.expositores) ? m.expositores : []).filter(x => x && x.nombre);
    return g.length ? `<ul class="cg-gente" aria-label="Quienes exponen">
        ${g.map(x => `<li>${esc(x.nombre)}</li>`).join('')}</ul>` : '';
  }

  function htmlMesa(m, i, ahora){
    const estado = estadoDe(m, ahora);
    const serie = m.numero ? 'Voces que habitan ' + (ROMANOS[m.numero] || m.numero) : 'Voces que habitan';
    return `
      <article class="cg-mesa ${estado === 'paso' ? 'paso' : ''} ${estado === 'vivo' ? 'en-vivo' : ''}"
               id="mesa-${m.id || 'r' + i}">
        <p class="cg-serie">${esc(serie)} ${etiquetaEstado(estado)}</p>
        <h3>${esc(m.titulo)}</h3>
        ${m.bajada ? `<p class="bajada">${esc(m.bajada)}</p>` : ''}
        ${htmlGente(m)}
        ${htmlCuando(m)}
        ${m.eje && EJES[m.eje] ? `<span class="cg-eje">Eje ${esc(EJES[m.eje])}</span>` : ''}
        <div class="cg-mesa-acciones">
          <button type="button" class="boton${estado === 'vivo' ? ' oscuro' : ''}" data-mesa="${i}">
            ${estado === 'paso' ? 'Ver las preguntas' : 'Preguntar'}</button>
          ${estado !== 'paso' && typeof urlGoogleCalendar === 'function' ? `
            <a class="boton borde" target="_blank" rel="noopener"
               href="${esc(urlGoogleCalendar({ titulo:'Voces que habitan: ' + m.titulo,
                 fecha_desde:m.fecha, hora:horaLinda(m.hora), lugar:(m.lugar ? m.lugar + ', ' : '') + 'FTS UNLP, 9 y 63',
                 cuerpo:'I° Congreso Interdisciplinario. ' + (m.bajada || '') }))}">
              Agendar ↗<span class="solo-lectores"> en Google Calendar</span></a>` : ''}
        </div>
      </article>`;
  }

  function pintarMesas(){
    const ahora = ahoraEnLaPlata();
    if (!mesas.length){
      cajaMesas.innerHTML = `<div class="vacio">Todavía no hay mesas cargadas.
        Seguinos en Instagram para enterarte del cronograma.</div>`;
      return;
    }
    ultimaHuella = mesas.map(m => estadoDe(m, ahora)).join();
    let dia = '';
    cajaMesas.innerHTML = mesas.map((m, i) => {
      const cabeza = m.fecha !== dia ? `<h3 class="cg-dia">${esc(diaLindo(m.fecha))}</h3>` : '';
      dia = m.fecha;
      return cabeza + htmlMesa(m, i, ahora);
    }).join('') + (hayBase ? '' : `
      <div class="aviso">Ahora no pudimos traer el cronograma actualizado: esto es
        lo último que sabemos. Si cambió algo, lo vas a ver cuando vuelva la señal.</div>`);

    pintarAhora(ahora);
    pintarAulas();
  }

  /* Arriba del cronograma: lo que está pasando, o lo que sigue. */
  function pintarAhora(ahora){
    const caja = document.getElementById('cg-ahora');
    const i = mesas.findIndex(m => estadoDe(m, ahora) === 'vivo');
    const j = i >= 0 ? i : mesas.findIndex(m => estadoDe(m, ahora) !== 'paso');
    if (j < 0){ caja.innerHTML = ''; return; }
    const m = mesas[j];
    const vivo = i >= 0;
    caja.innerHTML = `
      <div class="cg-ahora">
        <span class="rotulo${vivo ? ' vivo' : ''}">${vivo ? 'Está pasando ahora' : 'Lo que sigue'}</span>
        <strong>${esc(m.titulo)}</strong>
        <span>${esc(diaLindo(m.fecha))}${m.hora ? ' · ' + esc(horaLinda(m.hora)) + ' h' : ''}${
          m.lugar ? ' · ' + esc(m.lugar) : ''}</span>
        <button type="button" class="boton" data-mesa="${j}">${vivo ? 'Preguntar ahora' : 'Dejar una pregunta'}</button>
      </div>`;
  }

  /* Las aulas de «Dónde» salen de las mesas: si el panel cambia un
     aula, cambia también abajo. */
  function pintarAulas(){
    const aulas = [...new Set(mesas.map(m => (m.lugar || '').trim()).filter(Boolean))];
    if (aulas.length)
      document.getElementById('cg-aulas').innerHTML = aulas.map(a => `<li>${esc(a)}</li>`).join('');
  }

  async function traerMesas(){
    const memoria = memoriaDe('congreso');
    if (memoria && Array.isArray(memoria.datos) && memoria.datos.length){
      mesas = memoria.datos; hayBase = true; pintarMesas();
    }
    try {
      const { data, error } = await conPaciencia(
        db.from('congreso_mesas')
          .select('id,numero,titulo,bajada,eje,fecha,hora,lugar,expositores,placa,preguntas_abiertas')
          .eq('publicada', true)
          .order('fecha', { ascending:true })
          .order('hora',  { ascending:true }), 12);
      if (error) throw error;
      mesas = data || [];
      hayBase = true;
      guardarEnMemoria('congreso', mesas);
    } catch(e){
      if (!memoria || !Array.isArray(memoria.datos)){
        mesas = MESAS_DE_RESERVA.slice();
        hayBase = false;
      }
    }
    pintarMesas();
    abrirLoQuePideElEnlace();
  }

  /* ------------------------------------------------------------
     LA HOJA: las preguntas de una mesa o los aportes de un eje
     ------------------------------------------------------------ */
  const fondo  = document.getElementById('cg-fondo');
  const cuerpo = document.getElementById('cg-hoja-cuerpo');
  let abierta = null;     // { tipo:'pregunta', mesa } | { tipo:'aporte', eje }
  let volverA = null;
  let reloj = null;
  let muro = [];

  function abrirHoja(que, desde){
    abierta = que;
    volverA = desde || document.activeElement;
    fondo.classList.remove('cerrando');
    fondo.hidden = false;
    document.body.style.overflow = 'hidden';
    pintarHoja();
    cargarMuro();
    clearInterval(reloj);
    reloj = setInterval(() => { if (!document.hidden) cargarMuro(true); }, CADA_CUANTO);
    /* Que el enlace lleve directo acá: se puede compartir una mesa. */
    try {
      history.replaceState(null, '', que.tipo === 'pregunta'
        ? (que.mesa.id ? '?mesa=' + que.mesa.id : location.pathname)
        : '?eje=' + que.eje);
    } catch(e){}
    document.getElementById('cg-cerrar').focus();
  }

  function cerrarHoja(){
    if (fondo.hidden) return;
    clearInterval(reloj);
    abierta = null;
    fondo.classList.add('cerrando');
    const fin = () => { fondo.hidden = true; fondo.classList.remove('cerrando'); };
    fondo.addEventListener('transitionend', fin, { once:true });
    setTimeout(fin, 450);   // por si no hay transición (menos movimiento)
    document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname); } catch(e){}
    if (volverA && volverA.focus) volverA.focus();
  }

  document.getElementById('cg-cerrar').addEventListener('click', cerrarHoja);
  fondo.addEventListener('click', ev => { if (ev.target === fondo) cerrarHoja(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') cerrarHoja(); });

  function sePuedeEscribir(){
    if (!hayBase || !abierta) return false;
    if (abierta.tipo === 'aporte') return true;
    const m = abierta.mesa;
    if (!m.id || m.preguntas_abiertas === false) return false;
    /* Mismo criterio que la base: hasta el día siguiente a la mesa. */
    return m.fecha >= isoVecino(ahoraEnLaPlata().fecha, -1);
  }

  function pintarHoja(){
    const q = abierta;
    const mio = leerMio();
    const esPregunta = q.tipo === 'pregunta';
    const m = q.mesa;

    const cabeza = esPregunta ? `
        <p class="cg-serie">${esc(m.numero ? 'Voces que habitan ' + (ROMANOS[m.numero] || m.numero) : 'Voces que habitan')}</p>
        <h2 id="cg-hoja-titulo">${esc(m.titulo)}</h2>
        ${htmlGente(m)}
        ${htmlCuando(m)}
        ${m.placa ? `<details class="cg-placa"><summary>Ver la placa</summary>
          <img src="${esc(urlPlaca(m.placa))}" alt="La placa de la mesa ${esc(m.titulo)}" loading="lazy"></details>` : ''}`
      : `
        <p class="cg-serie">Eje de discusión</p>
        <h2 id="cg-hoja-titulo">${esc(EJES[q.eje])}</h2>
        <p style="margin:6px 0 0">Lo que pensás, una experiencia de tus prácticas, una pregunta
          que querés que el congreso se haga. Si alguien ya lo dijo, tocá
          <strong>Me sumo</strong>.</p>`;

    const formulario = sePuedeEscribir() ? `
        <form class="cg-formulario" id="cg-form" novalidate>
          <div class="campo">
            <label for="cg-texto">${esPregunta ? 'Tu pregunta para quienes exponen' : 'Tu aporte'}</label>
            <textarea id="cg-texto" maxlength="${LARGO_MAXIMO}" required
              placeholder="${esPregunta ? '¿Qué…?' : 'Desde mis prácticas en…'}"></textarea>
            <span class="cg-cuenta" id="cg-cuenta" aria-live="polite">0 / ${LARGO_MAXIMO}</span>
          </div>
          <div class="campo">
            <label for="cg-nombre">Tu nombre <span style="font-weight:400">(opcional)</span></label>
            <input id="cg-nombre" maxlength="60" autocomplete="given-name"
                   placeholder="Si lo dejás vacío, sale como «Anónimo»" value="${esc(mio.nombre)}">
          </div>
          <button class="boton ancho oscuro" type="submit" id="cg-mandar">
            ${esPregunta ? 'Mandar la pregunta' : 'Mandar el aporte'}</button>
          <div id="cg-form-aviso" role="status" aria-live="polite"></div>
        </form>`
      : `<div class="aviso cg-cerrado">${!hayBase
          ? 'Ahora no hay conexión con la base: por eso no se puede mandar nada. Probá de nuevo en un rato.'
          : esPregunta && !m.id
          ? 'Esta mesa todavía no está cargada para recibir preguntas.'
          : 'Las preguntas de esta mesa ya están cerradas. Igual podés leer las que quedaron.'}</div>`;

    cuerpo.innerHTML = cabeza + formulario + `
        <div class="cg-muro-cabeza">
          <h3>${esPregunta ? 'Preguntas' : 'Aportes'}</h3>
          <span id="cg-cuantas"></span>
        </div>
        <ul class="cg-muro" id="cg-muro" aria-live="polite">
          <li class="esq-tarjeta"><div class="esqueleto esq-linea"></div><div class="esqueleto esq-linea media"></div></li>
        </ul>`;

    const form = document.getElementById('cg-form');
    if (form){
      const texto = document.getElementById('cg-texto');
      const cuenta = document.getElementById('cg-cuenta');
      texto.addEventListener('input', () => { cuenta.textContent = texto.value.length + ' / ' + LARGO_MAXIMO; });
      form.addEventListener('submit', mandar);
    }
  }

  function pintarMuro(){
    const lista = document.getElementById('cg-muro');
    if (!lista) return;
    const mio = leerMio();
    const esPregunta = abierta && abierta.tipo === 'pregunta';
    document.getElementById('cg-cuantas').textContent =
      muro.length ? muro.length + (muro.length === 1 ? ' hasta ahora' : ' hasta ahora') : '';
    if (!muro.length){
      lista.innerHTML = `<li class="vacio">${esPregunta
        ? 'Todavía no hay preguntas. ¡Hacé la primera!'
        : 'Todavía no hay aportes en este eje.'}</li>`;
      return;
    }
    /* Las respondidas bajan: ya pasaron por la sala. */
    const orden = muro.slice().sort((a, b) =>
      (a.respondida - b.respondida) || (b.apoyos - a.apoyos) ||
      String(a.creado_at).localeCompare(String(b.creado_at)));
    lista.innerHTML = orden.map(v => {
      const apoye = mio.apoyos.includes(Number(v.id));
      const esMia = mio.mias.includes(Number(v.id));
      return `
        <li class="cg-voz${esMia ? ' mia' : ''}${v.respondida ? ' respondida' : ''}">
          <p class="texto">${esc(v.texto)}</p>
          <p class="quien">${esc(v.nombre || 'Anónimo')}${esMia ? ' · la tuya' : ''}${
            v.respondida ? ' · ya se respondió' : ''}</p>
          <button type="button" class="cg-apoyo" data-apoyo="${esc(v.id)}"
                  aria-pressed="${apoye ? 'true' : 'false'}"
                  aria-label="${esPregunta ? 'Apoyar esta pregunta' : 'Me sumo a este aporte'}. Tiene ${Number(v.apoyos)}">
            <span class="flecha" aria-hidden="true">${esPregunta ? '↑' : '✊'}</span>
            <span class="cuantos" aria-hidden="true">${Number(v.apoyos)}</span>
          </button>
        </li>`;
    }).join('');
  }

  async function cargarMuro(callado){
    if (!abierta) return;
    const q = abierta;
    if (!hayBase || (q.tipo === 'pregunta' && !q.mesa.id)){
      muro = []; pintarMuro(); return;
    }
    const { data, error } = await db.rpc('congreso_muro', q.tipo === 'pregunta'
      ? { p_mesa: q.mesa.id, p_eje: null } : { p_mesa: null, p_eje: q.eje });
    if (abierta !== q) return;   // la cerraron o cambiaron mientras tanto
    if (error){
      if (!callado){
        const lista = document.getElementById('cg-muro');
        if (lista) lista.innerHTML = `<li class="aviso error">No pudimos traer lo que se dijo: ${esc(errorEnCastellano(error))}</li>`;
      }
      return;
    }
    muro = data || [];
    pintarMuro();
  }

  /* Los mensajes de la base vienen en minúscula y sin tilde (son para
     quien programa). Acá se dicen para quien está en la sala. */
  function motivo(error){
    const m = String(error && error.message || '');
    if (/ratito/.test(m))        return 'Mandaste varias seguidas: esperá un par de minutos y probá de nuevo.';
    if (/tope de hoy/.test(m))   return 'Llegaste al máximo de mensajes por hoy desde este teléfono.';
    if (/ya mandaste/.test(m))   return 'Eso ya lo mandaste.';
    if (/cerradas/.test(m))      return 'Las preguntas de esta mesa ya se cerraron.';
    if (/muy corto/.test(m))     return 'Escribí un poquito más.';
    if (/muy largo/.test(m))     return 'Es muy largo: el máximo son ' + LARGO_MAXIMO + ' caracteres.';
    if (/demasiad/.test(m))      return 'Están llegando muchísimas a la vez. Probá en un minuto.';
    if (/congreso_/.test(m))     return 'Esta parte todavía no está activada en la base.';
    return errorEnCastellano(error);
  }

  async function mandar(ev){
    ev.preventDefault();
    const q = abierta;
    const caja = document.getElementById('cg-form-aviso');
    const boton = document.getElementById('cg-mandar');
    const texto = document.getElementById('cg-texto').value.trim();
    const nombre = document.getElementById('cg-nombre').value.trim();
    if (texto.length < 3){
      caja.innerHTML = '<div class="aviso error">Escribí tu ' + (q.tipo === 'pregunta' ? 'pregunta' : 'aporte') + ' antes de mandar.</div>';
      document.getElementById('cg-texto').focus();
      return;
    }
    boton.disabled = true; boton.textContent = 'Mandando…';
    const { data, error } = await db.rpc('congreso_intervenir', {
      p_tipo: q.tipo,
      p_mesa: q.tipo === 'pregunta' ? q.mesa.id : null,
      p_eje:  q.tipo === 'aporte' ? q.eje : null,
      p_texto: texto, p_nombre: nombre, p_marca: marca()
    });
    boton.disabled = false;
    boton.textContent = q.tipo === 'pregunta' ? 'Mandar la pregunta' : 'Mandar el aporte';
    if (error){
      caja.innerHTML = `<div class="aviso error">${esc(motivo(error))}</div>`;
      return;
    }
    const g = leerMio();
    if (data) g.mias.push(Number(data));
    g.nombre = nombre;   // para no tener que escribirlo cada vez
    guardarMio(g);
    document.getElementById('cg-texto').value = '';
    document.getElementById('cg-cuenta').textContent = '0 / ' + LARGO_MAXIMO;
    caja.innerHTML = `<div class="aviso ok">¡Listo! ${q.tipo === 'pregunta'
      ? 'Tu pregunta ya está en la lista.' : 'Tu aporte ya está en el eje.'}</div>`;
    if (typeof anotarHito === 'function') anotarHito('participó del congreso');
    cargarMuro();
  }

  cuerpo.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-apoyo]');
    if (!b || b.disabled) return;
    const id = Number(b.dataset.apoyo);
    const g = leerMio();
    const quiero = !g.apoyos.includes(id);
    b.disabled = true;
    const { data, error } = await db.rpc('congreso_apoyar',
      { p_id: id, p_marca: marca(), p_quiero: quiero });
    b.disabled = false;
    if (error){
      const caja = document.getElementById('cg-form-aviso');
      if (caja) caja.innerHTML = `<div class="aviso error">${esc(motivo(error))}</div>`;
      return;
    }
    const g2 = leerMio();
    g2.apoyos = quiero ? g2.apoyos.concat(id) : g2.apoyos.filter(x => x !== id);
    guardarMio(g2);
    const v = muro.find(x => Number(x.id) === id);
    if (v) v.apoyos = Number(data);
    pintarMuro();
    /* El foco vuelve al mismo botón: el muro se redibujó entero. */
    const nuevo = cuerpo.querySelector(`[data-apoyo="${id}"]`);
    if (nuevo) nuevo.focus();
  });

  /* Los botones de las mesas, de «lo que sigue» y de los ejes. */
  document.getElementById('contenido').addEventListener('click', ev => {
    const bm = ev.target.closest('[data-mesa]');
    if (bm){
      const m = mesas[Number(bm.dataset.mesa)];
      if (m) abrirHoja({ tipo:'pregunta', mesa:m }, bm);
      return;
    }
    const be = ev.target.closest('[data-eje]');
    if (be && EJES[be.dataset.eje]) abrirHoja({ tipo:'aporte', eje:be.dataset.eje }, be);
  });

  /* `congreso/?mesa=12` o `?eje=salud` abren la hoja directo. Es lo
     que se pone en un QR en la puerta del aula. */
  function abrirLoQuePideElEnlace(){
    const idMesa = Number(parametro('mesa'));
    const eje = parametro('eje');
    if (idMesa){
      const m = mesas.find(x => Number(x.id) === idMesa);
      if (m) abrirHoja({ tipo:'pregunta', mesa:m });
    } else if (eje && EJES[eje]){
      abrirHoja({ tipo:'aporte', eje });
    }
  }

  /* Cada minuto se vuelve a mirar qué está pasando: quien deja la
     pantalla abierta en la sala ve cambiar «Lo que sigue» a «Ahora». */
  /* Solo se redibuja si algún estado cambió: redibujar igual le
     sacaría el foco a quien está recorriendo la lista con el teclado. */
  const huella = () => { const a = ahoraEnLaPlata(); return mesas.map(m => estadoDe(m, a)).join(); };
  let ultimaHuella = '';
  setInterval(() => {
    if (document.hidden || !mesas.length) return;
    const h = huella();
    if (h !== ultimaHuella){ ultimaHuella = h; pintarMesas(); }
  }, 60000);

  traerMesas();
})();
