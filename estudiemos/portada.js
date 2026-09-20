/* ============================================================
   LA PORTADA DE ESTUDIEMOS (rediseño del 18/9/2026)

   Lo que antes era un riel de tarjetas iguales para todo el mundo, y
   ahora depende de quién entra:

   1. SEGUÍ DONDE DEJASTE. Lee la huella del teléfono (huella.js): lo
      último que abriste, cuánto leíste, y un botón que te devuelve al
      mismo punto de la página.
   2. TRES MODOS: Repasar, Practicar y Territorio. Se agrupa por lo que
      vas a HACER, no por el tipo de archivo. El orden de los tres
      depende de tu carrera: la Tecnicatura arranca por Territorio,
      Trabajo Social lo tiene segundo, Fono lo tiene último.
   3. TERRITORIO: el esquema del mapa de riesgo con los reportes
      aprobados. Es un dibujo propio (territorio.js), no Leaflet: carga
      al instante y no baja calles.
   4. EL BUSCADOR encuentra también fichas y herramientas, no solo los
      apuntes compartidos. Las fichas se leen de fichas/index.html, que
      sigue siendo la única lista: una ficha nueva aparece sola.

   Todo lo que se escribe acá sale de funciones de app.js (esc,
   normalizar, carreraElegidaApp, memoriaDe…) con `typeof` antes: si el
   service worker entrega un app.js viejo, la portada se achica pero la
   pantalla no se cae.
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const e = typeof esc === 'function' ? esc : (t => String(t == null ? '' : t)
    .replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]));
  const norma = typeof normalizar === 'function' ? normalizar
    : (t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
  const quieto = () => typeof menosMovimiento === 'function' ? menosMovimiento()
    : matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NOMBRE_CARRERA = { ts:'Trabajo Social', tgcr:'Gestión del Riesgo', fono:'Fonoaudiología' };
  const CORTO_CARRERA  = { ts:'TS', tgcr:'Riesgo', fono:'Fono' };
  function carrera(){
    try { const c = typeof carreraElegidaApp === 'function' ? carreraElegidaApp() : null; return c ? c.id : null; }
    catch(err){ return null; }
  }

  const huella = () => (typeof leerHuella === 'function' ? leerHuella() : [])
    .filter(x => x && x.u && x.k && x.k !== 'otro');

  /* ============================================================
     LAS HERRAMIENTAS. `carreras` en null es «sirve a todas».
     Los números son los mismos que tenía la pantalla anterior; si se
     suma una ficha, se cambia acá y en fichas/index.html.
     ============================================================ */
  const cuantosVideos = (window.VIDEOS || []).length;
  const HERRAMIENTAS = [
    { id:'fichas', modo:'repasar', nombre:'Fichas para estudiar', ico:'estudiemos', emoji:'📐',
      desc:'Treinta temas, cada uno con su autoevaluación.', href:'fichas/', carreras:['fono','ts'],
      dato: c => c === 'fono' ? '29 de la tuya' : c === 'ts' ? '1 de la tuya' : '29 de Fono · 1 de TS',
      avance: () => { const n = new Set(huella().filter(x => x.k === 'ficha').map(x => x.u)).size;
                      return n ? { a: n / 30, texto: 'Abriste ' + n + ' de 30' } : null; } },
    { id:'cuadro', modo:'repasar', nombre:'Los siete modelos', emoji:'🗂️',
      desc:'El cuadro de los modelos de intervención, para completar y guardar.',
      href:'fichas/modelos-cuadro/', carreras:['ts'], dato: () => 'Trabajo Social I · 7 modelos' },
    /* El mazo (19/9): Teorías de la Cultura es común a TS y Fono. El
       avance sale de lo que el mazo guarda al marcar «La sé». */
    { id:'mazo', modo:'repasar', nombre:'Mazo de Antropología', emoji:'🃏',
      desc:'Teorías de la Cultura y la otredad, en tarjetas: pregunta, respuesta y cuáles ya sabés.',
      href:'fichas/antropologia-otredad/', carreras:['ts','fono'], dato: () => '31 tarjetas · 5 unidades',
      avance: () => { let m = {};
                      try { m = JSON.parse(localStorage.getItem('bolivar-fichas-antropologia') || '{}') || {}; } catch(err){}
                      const n = Object.keys(m).filter(k => m[k] === 'se').length;
                      return n ? { a: n / 31, texto: 'Sabés ' + n + ' de 31' } : null; } },
    /* La línea de tiempo (19/9): Historia Social de América Latina y
       Argentina (214), primer año de Trabajo Social. */
    { id:'linea', modo:'repasar', nombre:'Línea de tiempo de Historia', emoji:'🕰️',
      desc:'Once procesos de 1880 a 2001, con su síntesis, la bibliografía y una pregunta para practicar.',
      href:'fichas/historia-social/', carreras:['ts'], dato: () => 'Historia Social · 11 hitos' },
    /* El repaso de Introducción a la Psicología (19/9), común a TS y Fono.
       El avance sale de lo que guarda la página al responder. */
    { id:'psico', modo:'repasar', nombre:'Introducción a la Psicología', emoji:'🧠',
      desc:'Las cuatro partes del programa: conceptos, cuadros, fichas rápidas y autoevaluación.',
      href:'fichas/psicologia-introduccion/', carreras:['ts','fono'], dato: () => '4 bloques · 22 fichas',
      avance: () => { let m = {};
                      try { m = JSON.parse(localStorage.getItem('bolivar-fichas-psicologia') || '{}') || {}; } catch(err){}
                      const n = Object.keys(m).length;
                      return n ? { a: n / 10, texto: 'Respondiste ' + n + ' de 10' } : null; } },
    /* `enFila`: no va en la grilla de Repasar, tiene su fila arriba de
       los modos. Sigue en la lista para que el buscador la encuentre. */
    { id:'videos', modo:'repasar', nombre:'En un minuto', emoji:'▶️', oculta: !cuantosVideos, enFila: true,
      desc:'Videos cortos de la agrupación, un tema por video.', href:'videos/', carreras:null,
      dato: () => cuantosVideos + (cuantosVideos === 1 ? ' video' : ' videos') },
    /* El pomodoro (20/9). `suelta`: no entra en la grilla —tiene su
       tira arriba, pegada a «Seguí donde dejaste»— pero sí en el
       buscador, que es donde lo va a buscar quien ya sabe que está.
       `#pomodoro` abre su hoja (lo escucha pomodoro.js). */
    { id:'pomodoro', modo:'repasar', nombre:'Pomodoro', emoji:'⏱️', suelta:true,
      desc:'El reloj de estudio: 25 minutos de foco y 5 de descanso, sin salir de acá.',
      href:'#pomodoro', carreras:null, dato: () => '25 · 5 minutos' },
    { id:'fonoteca', modo:'practicar', nombre:'Fonoteca', emoji:'🎧',
      desc:'Audiogramas para diagnosticar cada oído, con devolución.', href:'fonoteca/', carreras:['fono'],
      dato: () => '6 casos' },
    { id:'anatomo', modo:'practicar', nombre:'Anatomofisiología 3D', ico:'plan', emoji:'🧠',
      desc:'La laringe y el oído para girar, y el programa de la materia.', href:'../anatomo/', carreras:['fono'],
      dato: () => '2 modelos 3D' },
    { id:'finales', modo:'practicar', nombre:'Preparar un final', ico:'carrera', emoji:'📅',
      desc:'El programa, la fecha de la mesa y cuánto te falta.', href:'../carrera/#finales', carreras:null,
      dato: () => '9 turnos de examen' }
  ];

  const MODOS = {
    repasar:    { titulo:'Repasar',    bajada:'Leer y volver a leer lo que se vio en clase.' },
    practicar:  { titulo:'Practicar',  bajada:'Probarte con casos, modelos y mesas antes del examen.' },
    territorio: { titulo:'Territorio', bajada:'Mapeo participativo de riesgo para las prácticas en el barrio.' }
  };
  const ORDEN = { tgcr:['territorio','repasar','practicar'], ts:['repasar','territorio','practicar'],
                  fono:['repasar','practicar','territorio'] };

  function deQuien(h, c){
    if (!h.carreras) return { texto:'Todas las carreras', tuya: false };
    if (c && h.carreras.indexOf(c) >= 0) return { texto:'De tu carrera', tuya: true };
    return { texto:'De ' + h.carreras.map(x => CORTO_CARRERA[x]).join(' y '), tuya: false };
  }
  /* Íconos propios para lo que iconos.js no tiene. Los emoji quedaban
     distintos en cada teléfono (▶️ salía como un cuadro azul). */
  const trazo = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const PROPIOS = {
    videos:   trazo('<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/>'),
    cuadro:   trazo('<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.5h17M9.5 9.5v11"/>'),
    mazo:     trazo('<rect x="8" y="3" width="12.5" height="16" rx="2"/><path d="M5 6.5v12.5a2 2 0 0 0 2 2h10"/>'),
    psico:    trazo('<path d="M7 21v-3.2A7.5 7.5 0 1 1 19.2 12l1.3 3H18.5v2.5a2 2 0 0 1-2 2H14V21"/><path d="M11.5 7.5a2.5 2.5 0 0 1 2.5 2.5c0 1.5-2.5 1.8-2.5 3.5"/>'),
    linea:    trazo('<path d="M12 2.5v19"/><circle cx="12" cy="6" r="2.3" fill="currentColor"/><circle cx="12" cy="12" r="2.3" fill="currentColor"/><circle cx="12" cy="18" r="2.3" fill="currentColor"/><path d="M14.5 6H20M4 12h5.5M14.5 18H20"/>'),
    fonoteca: trazo('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>'),
    anatomo:  trazo('<path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/>')
  };
  function icono_(h){
    if (PROPIOS[h.id]) return PROPIOS[h.id];
    const svg = h.ico && typeof icono === 'function' ? icono(h.ico) : '';
    return svg || h.emoji;
  }

  function tile(h, c, ancho){
    const quien = deQuien(h, c);
    const av = h.avance ? h.avance() : null;
    return `<a class="est-tile${ancho ? ' ancho' : ''}" href="${e(h.href)}">
      <span class="est-tile-cabeza">
        <span class="est-tile-ico" aria-hidden="true">${icono_(h)}</span>
        <span class="est-tile-de${quien.tuya ? ' tuya' : ''}">${e(quien.texto)}</span>
      </span>
      <strong>${e(h.nombre)}</strong>
      <p>${e(h.desc)}</p>
      <span class="est-tile-dato">${e(h.dato(c))}${av ? ` <em>· ${e(av.texto)}</em>
        <span class="est-tile-barra" aria-hidden="true"><i style="--a:${av.a.toFixed(3)}"></i></span>` : ''}</span>
    </a>`;
  }

  function pintarModo(modo, c){
    const cont = $('modo-' + modo);
    if (!cont) return;
    const m = MODOS[modo];
    if (modo === 'territorio'){
      cont.querySelector('.est-rotulo').innerHTML = `<h2>${m.titulo}</h2><span>Participativo</span><p>${m.bajada}</p>`;
      return;
    }
    /* Las de tu carrera primero, después las de todas, después las otras. */
    const peso = h => !c ? 0 : !h.carreras ? 1 : (h.carreras.indexOf(c) >= 0 ? 0 : 2);
    /* Sin carrera elegida no hay «lo tuyo»: queda el orden de la lista. */
    const lista = HERRAMIENTAS.filter(h => h.modo === modo && !h.oculta && !h.enFila && !h.suelta)
      .sort((a, b) => peso(a) - peso(b));
    cont.querySelector('.est-rotulo').innerHTML =
      `<h2>${m.titulo}</h2><span>${lista.length} ${lista.length === 1 ? 'herramienta' : 'herramientas'}</span><p>${m.bajada}</p>`;
    /* Con número impar, la primera va a lo ancho: así la grilla cierra
       pareja y lo tuyo queda más grande. */
    cont.querySelector('.est-grilla').innerHTML =
      lista.map((h, i) => tile(h, c, i === 0 && lista.length % 2 === 1)).join('');
  }

  function ordenarModos(c){
    const portada = $('portada');
    (ORDEN[c] || ORDEN.fono).forEach(m => { const s = $('modo-' + m); if (s) portada.appendChild(s); });
  }

  /* ============================================================
     SEGUÍ DONDE DEJASTE
     ============================================================ */
  const TIPO = { ficha:'Ficha', cuadro:'Cuadro', mazo:'Mazo', linea:'Línea', fonoteca:'Fonoteca', video:'Video', '3d':'3D', mapa:'Mapa' };
  function hace(ms){
    const min = Math.round((Date.now() - ms) / 60000);
    if (min < 2) return 'recién';
    if (min < 60) return 'hace ' + min + ' min';
    const h = Math.round(min / 60);
    if (h < 24) return 'hace ' + h + ' h';
    const d = Math.round(h / 24);
    if (d === 1) return 'ayer';
    if (d < 7) return 'hace ' + d + ' días';
    const f = new Date(ms);
    return 'el ' + f.getDate() + '/' + (f.getMonth() + 1);
  }
  function pintarSeguir(){
    const cont = $('seguir');
    if (!cont) return;
    const l = huella();
    if (!l.length){
      cont.innerHTML = `<div class="est-rotulo"><h2>Para seguir</h2></div>
        <p class="est-primera">Lo que abras desde acá queda anotado en este teléfono,
        con hasta dónde leíste. La próxima vez, esto te lleva de vuelta al mismo punto.</p>`;
      return;
    }
    const [u, ...resto] = l;
    const leible = u.k === 'ficha' || u.k === 'cuadro' || u.k === 'linea';
    const pct = Math.round((u.a || 0) * 100);
    cont.innerHTML = `
      <div class="est-rotulo"><h2>Seguí donde dejaste</h2><span>${l.length} en este teléfono</span></div>
      <a class="est-seguir" href="${e(u.u)}?seguir">
        <p class="est-seguir-ojo">${e(TIPO[u.k] && TIPO[u.k] !== u.t ? TIPO[u.k] : 'Lo último')} · ${e(hace(u.v))}</p>
        <p class="est-seguir-titulo">${e(u.t)}</p>
        ${leible ? `<div class="est-avance" aria-label="Leíste ${pct}%">
            <span class="est-avance-barra" aria-hidden="true"><i style="--a:${(u.a || 0).toFixed(3)}"></i></span>
            <span>${pct}%</span></div>` : ''}
        <span class="est-seguir-boton">${leible && pct < 97 ? 'Seguir leyendo' : 'Volver a abrir'} <span aria-hidden="true">→</span></span>
      </a>
      ${resto.length ? `<ul class="est-tambien">${resto.slice(0, 3).map(x => `
        <li><a href="${e(x.u)}?seguir">
          <span class="tipo">${e(TIPO[x.k] || '')}</span>
          <span class="nombre">${e(x.t)}</span>
          <span class="cuando">${e(hace(x.v))}</span>
        </a></li>`).join('')}</ul>` : ''}`;
  }

  /* ============================================================
     EN UN MINUTO: la fila de videos (19/9)

     Portadas verticales, como los reels de donde salieron. Las de tu
     carrera primero, sin etiqueta: con cinco de siete de Fono, un
     cartel «Tu carrera» en cada una era ruido y el orden ya lo dice.
     La materia de cada video se busca en los planes (plan.js,
     plan-fono.js…), igual que hace el material compartido.
     Cada una abre el reproductor directo en ese video (#v=el-id).
     ============================================================ */
  const limpiarMateria = t => norma(String(t || '').replace(/\([^)]*\)/g, '')).replace(/\s+/g, ' ').trim();
  function carreraDeMateria(materia){
    const n = limpiarMateria(materia);
    const planes = [window.PLAN_TS, window.PLAN_TGCR, window.PLAN_FONO].filter(Boolean);
    const p = planes.find(pl => (pl.materias || []).some(m => limpiarMateria(m.nombre) === n));
    return p ? p.id : null;
  }
  function duracion(seg){ return Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0'); }
  function pintarVideos(c){
    const cont = $('videos-fila');
    const videos = window.VIDEOS || [];
    if (!cont || !videos.length){ if (cont) cont.hidden = true; return; }
    const vistos = new Set(huella().filter(x => x.k === 'video').map(x => x.u));
    const orden = videos.map((v, i) => ({ v, i, suya: c && carreraDeMateria(v.materia) === c }))
      .sort((a, b) => (b.suya - a.suya) || (a.i - b.i));
    cont.hidden = false;
    cont.innerHTML = `
      <div class="est-rotulo"><h2>En un minuto</h2><a class="est-rotulo-link" href="videos/">Ver todos (${videos.length})</a>
        <p>Un tema por video, para arrancar a estudiar.</p></div>
      <div class="est-reels" role="list">${orden.map(({ v, suya }) => `
        <a class="est-reel" role="listitem" href="videos/#v=${encodeURIComponent(v.id)}">
          <span class="est-reel-cuadro">
            ${v.portada ? `<img src="videos/${e(v.portada)}" alt="" loading="lazy" decoding="async" width="540" height="960">` : ''}
            <span class="est-reel-dura">${duracion(v.segundos || 0)}</span>
          </span>
          <span class="est-reel-titulo">${e(v.titulo)}</span>
          <span class="est-reel-materia">${e(v.materia)}</span>
        </a>`).join('')}</div>`;
  }

  /* ============================================================
     TERRITORIO
     ============================================================ */
  const T = window.TERRITORIO;
  function proyectar(lat, lng){
    return [ (lng - T.lng0) / (T.lng1 - T.lng0) * T.ancho, (T.lat1 - lat) / (T.lat1 - T.lat0) * T.alto ];
  }
  function pintarTerritorio(){
    const cont = $('modo-territorio');
    if (!cont || !T) { if (cont) cont.hidden = true; return; }
    const agua = T.agua.split('M').filter(Boolean)
      .map(d => `<path class="agua" pathLength="1" d="M${d}"/>`).join('');
    const barrios = T.barrios.split(' ').map(p => { const [x, y] = p.split(','); return `<circle cx="${x}" cy="${y}" r="1.7"/>`; }).join('');
    cont.querySelector('.est-territorio').innerHTML = `
      <div class="est-territorio-cabeza">
        <div><strong>Mapa de riesgo</strong><small>La Plata · Berisso · Ensenada</small></div>
        <span class="est-vivo" id="terr-estado">Buscando</span>
      </div>
      <div class="est-plano">
        <svg viewBox="0 0 ${T.ancho} ${T.alto}" preserveAspectRatio="xMidYMid slice" role="img"
             aria-labelledby="terr-alt"><title id="terr-alt">Esquema de arroyos, barrios populares y reportes aprobados</title>
          <g>${agua}</g><g class="barrios">${barrios}</g><g id="terr-pines"></g>
        </svg>
        <span class="est-plano-nota" id="terr-nota">Arroyos · barrios RENABAP</span>
      </div>
      <div class="est-capas" id="terr-capas">
        <div><b>–</b><span>💧 Hídrico</span></div>
        <div><b>–</b><span>🏭 Industrial</span></div>
        <div><b>–</b><span>🤝 Redes</span></div>
      </div>
      <div class="est-territorio-pie">
        <a class="primario" href="../mapa/">Abrir el mapa <span aria-hidden="true">→</span></a>
        <p id="terr-pie">Con tu cuenta podés marcar lo que ves: agua, industria o redes del barrio. El equipo lo revisa antes de publicarlo.</p>
      </div>`;

    /* La secuencia arranca cuando el bloque se ve, una sola vez. */
    const bloque = cont.querySelector('.est-territorio');
    if (quieto() || !('IntersectionObserver' in window)) bloque.classList.add('viva');
    else {
      const io = new IntersectionObserver(es => {
        if (es.some(x => x.isIntersecting)){ bloque.classList.add('viva'); io.disconnect(); }
      }, { threshold: .3 });
      io.observe(bloque);
    }
    traerReportes();
  }

  function pintarPines(reportes){
    const g = $('terr-pines');
    if (!g) return;
    const dentro = reportes.filter(r => { const [x, y] = proyectar(r.lat, r.lng);
      return x >= 0 && x <= T.ancho && y >= 0 && y <= T.alto; });
    /* Laten los seis más nuevos: todos a la vez sería ruido. */
    g.innerHTML = dentro.map((r, i) => {
      const [x, y] = proyectar(r.lat, r.lng);
      const capa = ['hidrico','industrial','redes'].indexOf(r.capa) >= 0 ? r.capa : 'redes';
      return (i < 6 ? `<circle class="onda pin-${capa}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" style="--i:${i}"/>` : '') +
        `<circle class="pin pin-${capa}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" style="--i:${Math.min(i, 30)}"/>`;
    }).join('');
    const n = c => reportes.filter(r => r.capa === c).length;
    $('terr-capas').querySelectorAll('b').forEach((b, i) => { b.textContent = n(['hidrico','industrial','redes'][i]); });
    /* Tres ceros seguidos parecen un tablero roto: sin reportes, la
       fila se va y lo dice el pie. */
    $('terr-capas').hidden = !reportes.length;
    if (!reportes.length){
      $('terr-nota').textContent = 'Todavía sin reportes aprobados';
      $('terr-pie').textContent = 'Todavía no hay reportes publicados. El primero puede ser el tuyo: entrá con tu cuenta y marcá lo que ves en el barrio.';
    } else {
      $('terr-nota').textContent = reportes.length + (reportes.length === 1 ? ' reporte aprobado' : ' reportes aprobados');
    }
  }

  function estado(texto, alDia){
    const el = $('terr-estado');
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle('al-dia', !!alDia);
  }

  async function traerReportes(){
    const guardada = typeof memoriaDe === 'function' ? memoriaDe('territorio') : null;
    if (guardada && guardada.datos) pintarPines(guardada.datos);
    if (typeof db === 'undefined' || !db){ estado(guardada ? 'Copia' : 'Sin datos'); return; }
    try {
      const pedido = db.from('reportes_riesgo').select('capa,lat,lng,creado_en_dispositivo')
        .eq('estado', 'aprobado').order('creado_en_dispositivo', { ascending:false }).limit(800);
      const r = await Promise.race([pedido, new Promise((_, no) => setTimeout(() => no(new Error('tardó')), 12000))]);
      if (r.error) throw r.error;
      const datos = r.data || [];
      pintarPines(datos);
      if (typeof guardarEnMemoria === 'function') guardarEnMemoria('territorio', datos);
      estado('Al día', true);
    } catch(err){
      estado(guardada ? 'Copia ' + hace(new Date(guardada.cuando).getTime()) : 'Sin conexión');
    }
  }

  /* ============================================================
     EL BUSCADOR: fichas y herramientas
     ============================================================ */
  let catalogo = null, pidiendo = null;
  async function traerCatalogo(){
    if (catalogo) return catalogo;
    if (pidiendo) return pidiendo;
    pidiendo = (async () => {
      /* Con `search` y `hash`, no solo la ruta: el pomodoro es
         `#pomodoro` en esta misma pantalla, y quedándose con el
         pathname el resultado llevaba a Estudiemos sin abrir nada. */
      const items = HERRAMIENTAS.filter(h => !h.oculta).map(h => {
        const d = new URL(h.href, location.href);
        return { tipo:'Herramienta', nombre:h.nombre, mas:h.desc,
                 href: d.pathname + d.search + d.hash,
                 texto: norma(h.nombre + ' ' + h.desc) };
      });
      (window.VIDEOS || []).forEach(v => items.push({
        tipo:'Video', nombre:v.titulo, mas:v.materia,
        href: new URL('videos/#v=' + encodeURIComponent(v.id), location.href).pathname + '#v=' + encodeURIComponent(v.id),
        texto: norma(v.titulo + ' ' + v.materia) }));
      try {
        const base = new URL('fichas/', location.href);
        const html = await (await fetch(base.href)).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('.titulo-seccion').forEach(t => {
          const lista = t.nextElementSibling;
          if (!lista || !lista.classList.contains('lista')) return;
          const grupo = t.id === 'fichas-fono' ? 'Fonoaudiología' : t.id === 'fichas-ts' ? 'Trabajo Social' : '';
          lista.querySelectorAll('a.tarjeta').forEach(a => {
            const nombre = (a.querySelector('h3') || {}).textContent || '';
            const p = ((a.querySelector('p') || {}).textContent || '').replace(/\s+/g, ' ').trim();
            const tipo = ((a.querySelector('.material-tipo') || {}).textContent || 'Ficha').trim();
            /* Con el `?`: las cuatro de Anatomo 3 a 6 son todas `leer/?f=…`.
               Solo con la ruta, la primera abría «No encontramos la ficha»
               y las otras tres se descartaban por repetidas. */
            const destino = new URL(a.getAttribute('href'), base);
            const ruta = destino.pathname + destino.search;
            /* Una herramienta que también es tarjeta de fichas sale una vez. */
            if (items.some(it => it.href === ruta)) return;
            items.push({ tipo, nombre: nombre.trim(), mas: [grupo, p].filter(Boolean).join(' · '),
              href: ruta,
              texto: norma([nombre, p, grupo, tipo].join(' ')) });
          });
        });
      } catch(err){ /* sin señal y sin copia: se busca solo en las herramientas */ }
      catalogo = items;
      return items;
    })();
    return pidiendo;
  }

  let turno = 0;
  async function buscar(){
    const filtro = $('filtro'), res = $('resultados'), main = $('contenido');
    const q = norma(filtro.value.trim());
    if (q.length < 2){ main.classList.remove('buscando'); res.hidden = true; res.innerHTML = ''; return; }
    main.classList.add('buscando');
    const mio = ++turno;
    const items = await traerCatalogo();
    if (mio !== turno) return;
    const palabras = q.split(/\s+/).filter(Boolean);
    const hallados = items.filter(it => palabras.every(p => it.texto.indexOf(p) >= 0)).slice(0, 12);
    res.hidden = false;
    res.innerHTML = `<div class="est-rotulo"><h2>En Estudiemos</h2><span>${hallados.length ? hallados.length + (hallados.length === 1 ? ' resultado' : ' resultados') : 'Nada'}</span></div>` +
      (hallados.length ? hallados.map(it => `
        <a class="est-hallazgo" href="${e(it.href)}">
          <span class="tipo">${e(it.tipo)}</span>
          <span><span class="nombre">${e(it.nombre)}</span>${it.mas ? `<span class="mas">${e(it.mas)}</span>` : ''}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
        </a>`).join('')
      : `<p class="est-primera">Ninguna ficha ni herramienta tiene «${e(filtro.value.trim())}». Probá con el nombre de la materia o con otra palabra del tema.</p>`);
  }

  /* ============================================================
     ARRANQUE
     ============================================================ */
  function pintarCarrera(c){
    const el = $('est-carrera');
    if (el) el.innerHTML = c
      ? `<b>${e(NOMBRE_CARRERA[c])}</b> · lo tuyo primero`
      : `Para las tres carreras · elegí la tuya en el menú ☰`;
  }
  function todo(){
    const c = carrera();
    pintarCarrera(c);
    ordenarModos(c);
    pintarModo('repasar', c);
    pintarModo('practicar', c);
    pintarModo('territorio', c);
    pintarSeguir();
    pintarVideos(c);
  }

  todo();
  pintarTerritorio();
  document.addEventListener('bolivar:carrera', todo);
  /* Volver con el botón «atrás» trae la página del bfcache: la huella
     cambió mientras tanto (se leyó una ficha), así que se repinta. */
  addEventListener('pageshow', ev => { if (ev.persisted) todo(); });
  const filtro = $('filtro');
  if (filtro){
    filtro.addEventListener('input', buscar);
    filtro.addEventListener('focus', () => { traerCatalogo(); }, { once:true });
  }
})();
