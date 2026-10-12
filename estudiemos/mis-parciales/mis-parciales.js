/* ============================================================
   MIS PARCIALES (11/10/2026)

   Dos cosas en una pantalla, porque se usan juntas:

   1. LAS FECHAS. Materia, qué es, día y, si se sabe, hora, aula y qué
      entra. El que viene aparece con la cuenta regresiva en el inicio
      de la app (lib/mis-parciales.js), y cada uno se puede pasar al
      calendario del celular con el mismo botón de Fechas.

   2. LAS PREGUNTAS DE PARCIALES VIEJOS. Es lo que más circula en
      época de parciales —fotos en el grupo, «¿alguien tiene el del año
      pasado?»— y lo que menos se practica: se lee una vez y se
      archiva. Acá se cargan por materia, de a una o pegando el texto
      entero, y se practican de a una: primero las marcadas «a repasar».

   Todo vive en este teléfono (ver lib/mis-parciales.js por qué). Para
   que el banco no muera en un teléfono, cada materia se COMPARTE como
   texto, y ese texto se vuelve a cargar con «Pegar varias» en el
   teléfono de quien lo recibe. Es una base de datos sin base de
   datos: no hay que moderar nada, porque nada se publica.

   Lo de app.js (htmlCabecera, anotarHito, carreraElegidaApp…) se
   llama con `typeof` antes: con un app.js viejo del service worker,
   la pantalla se achica pero no se cae.
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const e = escParcial;
  const hay = nombre => typeof window[nombre] === 'function';

  if (hay('htmlCabecera')) $('cabecera').innerHTML = htmlCabecera();
  if (hay('htmlPie'))      $('pie').innerHTML = htmlPie();
  if (hay('pintarNav'))    pintarNav('estudiemos');

  let datos = leerMisParciales();
  let filtro = '';            // la clave de la materia elegida; '' es «todas»
  let editandoParcial = null; // el id, o null si es uno nuevo
  let editandoPregunta = null;

  const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- Guardar, y avisar si no se pudo ---------- */
  function guardar(){
    if (guardarMisParciales(datos)) return true;
    avisar('No se pudo guardar en este teléfono. Puede que la memoria esté llena o que estés en una ventana privada.');
    return false;
  }

  /* El aviso de arriba. Con «Deshacer» cuando se borró algo: borrar
     de un toque y poder volver atrás es mejor que preguntar «¿seguro?»
     cada vez, que se contesta que sí sin leer. */
  let deshacer = null, avisoReloj = null;
  function avisar(texto, alDeshacer){
    const caja = $('mp-estado');
    deshacer = alDeshacer || null;
    caja.innerHTML = '<span>' + e(texto) + '</span>' +
      (deshacer ? '<button type="button" class="mp-deshacer" id="mp-deshacer">Deshacer</button>' : '');
    caja.classList.add('visible');
    clearTimeout(avisoReloj);
    avisoReloj = setTimeout(() => { caja.classList.remove('visible'); caja.innerHTML = ''; deshacer = null; }, deshacer ? 9000 : 5000);
  }
  $('mp-estado').addEventListener('click', ev => {
    if (!ev.target.closest('#mp-deshacer') || !deshacer) return;
    deshacer(); deshacer = null;
    guardar(); pintarTodo();
    avisar('Listo, volvió.');
  });

  /* ============================================================
     LAS MATERIAS: las del plan, para escribirlas igual siempre
     ============================================================ */
  const PLANES = { ts: window.PLAN_TS, tgcr: window.PLAN_TGCR, fono: window.PLAN_FONO };
  function carrera(){
    try { const c = hay('carreraElegidaApp') ? carreraElegidaApp() : null; return c ? c.id : null; }
    catch(err){ return null; }
  }
  /* Las que está cursando, según su organizador de la carrera. Son las
     primeras sugeridas: es casi seguro que el parcial es de una de esas. */
  function cursando(){
    const c = carrera(), plan = c && PLANES[c];
    if (!plan || !plan.materias) return [];
    try {
      const g = JSON.parse(localStorage.getItem('bolivar-carrera-v2') || '{}');
      const estados = ((g.datos || {})[c] || {}).estados || {};
      return plan.materias.filter(m => estados[m.cod] === 'cursando').map(m => m.nombre);
    } catch(err){ return []; }
  }
  function materiasDelPlan(){
    const c = carrera();
    const planes = c && PLANES[c] ? [PLANES[c]] : Object.values(PLANES);
    const nombres = [];
    planes.forEach(p => (p && p.materias || []).forEach(m => nombres.push(m.nombre)));
    return nombres;
  }
  /* Primero lo que ya usó, después lo que cursa, después el plan. */
  function materiasSugeridas(){
    const vistas = new Set(), lista = [];
    const sumar = n => { const k = claveMateria(n); if (k && !vistas.has(k)){ vistas.add(k); lista.push(n); } };
    datos.parciales.forEach(p => sumar(p.materia));
    datos.preguntas.forEach(q => sumar(q.materia));
    cursando().forEach(sumar);
    materiasDelPlan().forEach(sumar);
    return lista;
  }
  function pintarMaterias(){
    $('mp-lista-materias').innerHTML = materiasSugeridas().map(n => '<option value="' + e(n) + '">').join('');
    /* Los atajos debajo del campo: las que cursa, o las ya usadas. */
    const usadas = [...new Set(datos.parciales.concat(datos.preguntas).map(x => x.materia))];
    const atajos = (cursando().length ? cursando() : usadas).slice(0, 6);
    $('mp-sugeridas').innerHTML = atajos.length
      ? atajos.map(n => '<button type="button" class="chip" data-materia="' + e(n) + '">' + e(n) + '</button>').join('')
      : '';
  }
  $('mp-sugeridas').addEventListener('click', ev => {
    const b = ev.target.closest('[data-materia]');
    if (!b) return;
    $('mp-materia').value = b.dataset.materia;
    $('mp-que').focus();
  });

  /* Si la escribió en minúscula y existe en el plan, va como en el plan.
     Si escribió el principio («anatomo», «anatomofisiología») y en el
     plan hay UNA sola que empieza así, va esa: si no, «Anatomo» y
     «Anatomofisiología fonoaudiológica» serían dos materias con
     preguntas separadas. Con dos o más candidatas no se adivina. */
  function nombreMateria(t){
    const k = claveMateria(t);
    const todas = materiasSugeridas();
    const igual = todas.find(n => claveMateria(n) === k);
    if (igual) return igual;
    const empiezan = k.length >= 4 ? todas.filter(n => claveMateria(n).startsWith(k)) : [];
    if (empiezan.length === 1) return empiezan[0];
    const limpio = String(t).trim();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }
  const preguntasDe = materia => datos.preguntas.filter(q => claveMateria(q.materia) === claveMateria(materia));

  /* ============================================================
     LAS FECHAS
     ============================================================ */
  function htmlParcial(p, pasado){
    const dias = diasHastaParcial(p.fecha);
    const n = preguntasDe(p.materia).length;
    const donde = [fechaParcialLarga(p.fecha), p.hora ? p.hora + ' h' : '', p.lugar].filter(Boolean).map(e).join(' · ');
    const numero = pasado ? '' : `
      <div class="mp-cuenta" aria-hidden="true">
        <b>${dias === 0 ? 'Hoy' : dias}</b>${dias === 0 ? '' : '<span>' + (dias === 1 ? 'día' : 'días') + '</span>'}
      </div>`;
    return `
      <article class="tarjeta mp-parcial${pasado ? ' pasado' : ''}${!pasado && dias <= 3 ? ' cerca' : ''}" data-parcial="${e(p.id)}">
        ${numero}
        <div class="mp-cuerpo">
          <span class="mp-ceja">${e(p.que || 'Parcial')}${pasado ? '' : ' · ' + cuantoFaltaParcial(dias)}</span>
          <h3>${e(p.materia)}</h3>
          <p class="mp-cuando">${donde}</p>
          ${p.temas ? '<p class="mp-temas"><b>Entra:</b> ' + e(p.temas) + '</p>' : ''}
          <div class="mp-acciones">
            ${n ? `<button type="button" class="mp-accion principal" data-accion="practicar">Practicar · ${n}</button>`
                : `<button type="button" class="mp-accion" data-accion="cargar">Cargar preguntas</button>`}
            ${pasado ? '' : '<button type="button" class="mp-accion" data-accion="calendario" aria-expanded="false">Al calendario</button>'}
            <button type="button" class="mp-accion" data-accion="editar">Editar</button>
          </div>
          <div class="mp-calendario" hidden></div>
        </div>
      </article>`;
  }

  function pintarFechas(){
    const vienen = proximosParciales(datos);
    const pasados = datos.parciales.filter(p => diasHastaParcial(p.fecha) < 0)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('mp-proximos').innerHTML = vienen.length
      ? vienen.map(p => htmlParcial(p, false)).join('')
      : '<p class="mp-vacio">Todavía no anotaste ningún parcial. El que anotes va a aparecer en el inicio con los días que faltan.</p>';
    $('mp-pasados').hidden = !pasados.length;
    $('mp-pasados-titulo').textContent = pasados.length === 1 ? 'El que ya pasó' : 'Los ' + pasados.length + ' que ya pasaron';
    $('mp-pasados-lista').innerHTML = pasados.map(p => htmlParcial(p, true)).join('');
  }

  /* ---------- El formulario ---------- */
  const formParcial = $('mp-form-parcial');
  function abrirFormParcial(p){
    editandoParcial = p ? p.id : null;
    $('mp-form-parcial-titulo').textContent = p ? 'Cambiar el parcial' : 'Anotar un parcial';
    $('mp-materia').value = p ? p.materia : '';
    $('mp-que').value = p ? (p.que || '') : '1.º parcial';
    $('mp-fecha').value = p ? p.fecha : '';
    $('mp-hora').value = p ? (p.hora || '') : '';
    $('mp-lugar').value = p ? (p.lugar || '') : '';
    $('mp-temas').value = p ? (p.temas || '') : '';
    $('mp-borrar-parcial').hidden = !p;
    $('mp-error-parcial').hidden = true;
    pintarMaterias();
    formParcial.hidden = false;
    $('mp-nuevo').hidden = true;
    /* Si se edita uno de la lista, el formulario va justo abajo de la
       lista, que puede quedar lejos: se lleva la vista hasta él. */
    formParcial.scrollIntoView({ block:'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('mp-materia').focus({ preventScroll:true });
  }
  function cerrarFormParcial(){
    formParcial.hidden = true;
    $('mp-nuevo').hidden = false;
    editandoParcial = null;
  }
  function errorEn(id, texto, campo){
    const p = $(id);
    p.textContent = texto;
    p.hidden = false;
    if (campo) campo.focus();
  }

  $('mp-nuevo').addEventListener('click', () => abrirFormParcial(null));
  formParcial.addEventListener('submit', ev => {
    ev.preventDefault();
    const materia = $('mp-materia').value.trim();
    const fecha = $('mp-fecha').value;
    if (!materia) return errorEn('mp-error-parcial', 'Falta la materia.', $('mp-materia'));
    if (!esFechaParcial(fecha)) return errorEn('mp-error-parcial', 'Falta el día del parcial.', $('mp-fecha'));
    const fila = {
      id: editandoParcial || nuevoId(),
      materia: nombreMateria(materia),
      que: $('mp-que').value.trim() || 'Parcial',
      fecha,
      hora: $('mp-hora').value || '',
      lugar: $('mp-lugar').value.trim(),
      temas: $('mp-temas').value.trim()
    };
    const i = datos.parciales.findIndex(p => p.id === fila.id);
    if (i >= 0) datos.parciales[i] = fila; else datos.parciales.push(fila);
    if (!guardar()) return;
    if (i < 0 && hay('anotarHito')) anotarHito('anotó un parcial');
    cerrarFormParcial();
    pintarTodo();
    const dias = diasHastaParcial(fecha);
    avisar(dias >= 0 ? fila.materia + ': ' + cuantoFaltaParcial(dias).toLowerCase() + '. Ya está en el inicio.' : 'Guardado.');
    const tarjeta = document.querySelector('[data-parcial="' + CSS.escape(fila.id) + '"]');
    if (tarjeta) tarjeta.scrollIntoView({ block:'nearest' });
  });
  $('mp-borrar-parcial').addEventListener('click', () => {
    const i = datos.parciales.findIndex(p => p.id === editandoParcial);
    if (i < 0) return;
    const [ido] = datos.parciales.splice(i, 1);
    guardar(); cerrarFormParcial(); pintarTodo();
    avisar('Borraste ' + ido.materia + '.', () => { datos.parciales.push(ido); });
  });

  /* ---------- Los botones de cada tarjeta ---------- */
  function htmlCalendario(p){
    if (!hay('urlGoogleCalendar') || !hay('bajarICS')) return '<p class="letra-chica">No se pudo cargar el calendario. Probá recargar la pantalla.</p>';
    const ev = aEvento(p);
    return `
      <div class="botones-agenda">
        <a class="boton" href="${e(urlGoogleCalendar(ev))}" target="_blank" rel="noopener">Google Calendar ↗</a>
        <button type="button" class="boton borde" data-accion="ics">Otro calendario</button>
      </div>
      <p class="letra-chica">Queda anotado con un aviso dos días antes. Si entrás desde
        Instagram, «Otro calendario» puede no bajar: ahí conviene el de Google.</p>`;
  }
  /* La forma que entiende lib/fecha-al-calendario.js: la de una
     publicación de Fechas. Sin lugar, pone la dirección de la facultad,
     que para un parcial es casi siempre lo cierto. */
  function aEvento(p){
    return {
      id: 'parcial-' + p.id,
      titulo: (p.que || 'Parcial') + ' · ' + p.materia,
      fecha_desde: p.fecha,
      hora: p.hora || '',
      lugar: p.lugar || '',
      cuerpo: p.temas ? 'Entra: ' + p.temas : ''
    };
  }

  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-accion]');
    const tarjeta = b && b.closest('[data-parcial]');
    if (!tarjeta) return;
    const p = datos.parciales.find(x => x.id === tarjeta.dataset.parcial);
    if (!p) return;
    const accion = b.dataset.accion;
    if (accion === 'editar') abrirFormParcial(p);
    else if (accion === 'practicar') empezarPractica(p.materia);
    else if (accion === 'cargar') abrirFormPregunta(null, p.materia);
    else if (accion === 'calendario'){
      const caja = tarjeta.querySelector('.mp-calendario');
      const abrir = caja.hidden;
      if (abrir) caja.innerHTML = htmlCalendario(p);
      caja.hidden = !abrir;
      b.setAttribute('aria-expanded', String(abrir));
    }
    else if (accion === 'ics'){
      try { bajarICS([aEvento(p)], (p.que || 'Parcial') + ' ' + p.materia); }
      catch(err){ avisar('No se pudo bajar el archivo. Probá con Google Calendar.'); }
    }
  });

  /* ============================================================
     LAS PREGUNTAS
     ============================================================ */
  const ESTADOS = { nueva:'Sin practicar', repasar:'A repasar', sabe:'La sé' };

  function materiasConPreguntas(){
    const m = new Map();
    datos.preguntas.forEach(q => {
      const k = claveMateria(q.materia);
      if (!m.has(k)) m.set(k, { nombre:q.materia, n:0 });
      m.get(k).n++;
    });
    return [...m.entries()].map(([k, v]) => ({ clave:k, nombre:v.nombre, n:v.n }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }
  const delFiltro = () => datos.preguntas.filter(q => !filtro || claveMateria(q.materia) === filtro);

  function pintarPreguntas(){
    const materias = materiasConPreguntas();
    if (filtro && !materias.some(m => m.clave === filtro)) filtro = '';

    /* Los chips solo si hay más de una materia: con una sola, el
       «Todas» y el de la materia dicen lo mismo. */
    $('mp-filtro').hidden = materias.length < 2;
    $('mp-filtro').innerHTML = materias.length < 2 ? '' :
      '<button type="button" class="chip" data-filtro="" aria-pressed="' + (!filtro) + '">Todas · ' + datos.preguntas.length + '</button>' +
      materias.map(m => '<button type="button" class="chip" data-filtro="' + e(m.clave) + '" aria-pressed="' + (filtro === m.clave) + '">' +
        e(m.nombre) + ' · ' + m.n + '</button>').join('');

    const lista = delFiltro();
    const repasar = lista.filter(q => q.estado === 'repasar').length;
    const sabe = lista.filter(q => q.estado === 'sabe').length;
    $('mp-banco-acciones').innerHTML = lista.length ? `
      <p class="mp-resumen">${lista.length} ${lista.length === 1 ? 'pregunta' : 'preguntas'}${
        sabe ? ' · ' + sabe + ' que sabés' : ''}${repasar ? ' · ' + repasar + ' a repasar' : ''}</p>
      <div class="mp-botones">
        <button type="button" class="boton oscuro" id="mp-practicar">Practicar ${lista.length === 1 ? 'esta' : 'estas ' + lista.length}</button>
        <button type="button" class="boton borde" id="mp-compartir">Compartir con el grupo</button>
      </div>` : '';

    $('mp-preguntas').innerHTML = lista.length ? lista.map(q => `
      <li class="mp-preg" data-pregunta="${e(q.id)}">
        <div class="mp-preg-cabeza">
          <span class="mp-fuente">${e(filtro || materias.length < 2 ? (q.fuente || '') : q.materia + (q.fuente ? ' · ' + q.fuente : ''))}</span>
          <span class="mp-insignia ${e(q.estado || 'nueva')}">${ESTADOS[q.estado] || ESTADOS.nueva}</span>
        </div>
        <p class="mp-preg-texto">${e(q.texto)}</p>
        ${q.respuesta ? '<details class="mp-resp"><summary>Ver la respuesta</summary><p>' + e(q.respuesta) + '</p></details>' : ''}
        <div class="mp-acciones">
          <button type="button" class="mp-accion" data-preg-accion="editar">Editar</button>
          <button type="button" class="mp-accion" data-preg-accion="borrar">Borrar</button>
        </div>
      </li>`).join('')
      : '<li class="mp-vacio">Todavía no cargaste preguntas. Si alguien del grupo te pasó un parcial viejo, copiá el texto y tocá «Pegar varias».</li>';
  }

  $('mp-filtro').addEventListener('click', ev => {
    const b = ev.target.closest('[data-filtro]');
    if (!b) return;
    filtro = b.dataset.filtro;
    pintarPreguntas();
    const igual = $('mp-filtro').querySelector('[data-filtro="' + CSS.escape(filtro) + '"]');
    if (igual) igual.focus();
  });

  $('mp-preguntas').addEventListener('click', ev => {
    const b = ev.target.closest('[data-preg-accion]');
    if (!b) return;
    const id = b.closest('[data-pregunta]').dataset.pregunta;
    const i = datos.preguntas.findIndex(q => q.id === id);
    if (i < 0) return;
    if (b.dataset.pregAccion === 'editar') abrirFormPregunta(datos.preguntas[i]);
    else {
      const [ida] = datos.preguntas.splice(i, 1);
      guardar(); pintarTodo();
      avisar('Borraste la pregunta.', () => { datos.preguntas.splice(i, 0, ida); });
    }
  });

  $('mp-banco-acciones').addEventListener('click', ev => {
    if (ev.target.closest('#mp-practicar')) empezarPractica(null);
    if (ev.target.closest('#mp-compartir')) compartir();
  });

  /* ---------- Cargar una ---------- */
  const formPreg = $('mp-form-preg'), formPegar = $('mp-form-pegar');
  function materiaPorDefecto(){
    if (filtro){ const m = materiasConPreguntas().find(x => x.clave === filtro); if (m) return m.nombre; }
    const viene = proximosParciales(datos)[0];
    return viene ? viene.materia : '';
  }
  function abrirFormPregunta(q, materia){
    cerrarPractica();
    formPegar.hidden = true;
    editandoPregunta = q ? q.id : null;
    $('mp-form-preg-titulo').textContent = q ? 'Cambiar la pregunta' : 'Cargar una pregunta';
    $('mp-preg-materia').value = q ? q.materia : (materia || materiaPorDefecto());
    $('mp-preg-fuente').value = q ? (q.fuente || '') : '';
    $('mp-preg-texto').value = q ? q.texto : '';
    $('mp-preg-resp').value = q ? (q.respuesta || '') : '';
    $('mp-error-preg').hidden = true;
    pintarMaterias();
    formPreg.hidden = false;
    formPreg.scrollIntoView({ block:'start' });
    ($('mp-preg-materia').value ? $('mp-preg-texto') : $('mp-preg-materia')).focus({ preventScroll:true });
  }
  $('mp-nueva-preg').addEventListener('click', () => abrirFormPregunta(null));
  formPreg.addEventListener('submit', ev => {
    ev.preventDefault();
    const materia = $('mp-preg-materia').value.trim(), texto = $('mp-preg-texto').value.trim();
    if (!materia) return errorEn('mp-error-preg', 'Falta la materia.', $('mp-preg-materia'));
    if (!texto) return errorEn('mp-error-preg', 'Falta la pregunta.', $('mp-preg-texto'));
    const vieja = datos.preguntas.find(q => q.id === editandoPregunta);
    const fila = {
      id: vieja ? vieja.id : nuevoId(),
      materia: nombreMateria(materia),
      fuente: $('mp-preg-fuente').value.trim(),
      texto,
      respuesta: $('mp-preg-resp').value.trim(),
      estado: vieja ? vieja.estado : 'nueva'
    };
    if (vieja) datos.preguntas[datos.preguntas.indexOf(vieja)] = fila;
    else datos.preguntas.push(fila);
    if (!guardar()) return;
    if (!vieja && hay('anotarHito')) anotarHito('cargó preguntas de parciales');
    filtro = claveMateria(fila.materia);
    formPreg.hidden = true;
    pintarTodo();
    avisar(vieja ? 'Pregunta cambiada.' : 'Pregunta guardada en ' + fila.materia + '.');
    if (!vieja){
      /* Se carga una detrás de otra: el formulario vuelve vacío, con
         la misma materia y la misma fuente. */
      abrirFormPregunta(null, fila.materia);
      $('mp-preg-fuente').value = fila.fuente;
    }
  });

  /* ---------- Pegar varias ----------
     Entiende tres formas, que son como llegan de verdad: numeradas
     («1.», «2)»), separadas por un renglón en blanco, o una por
     renglón. Un renglón «R: …» es la respuesta de la de arriba; uno
     entre corchetes, «[1.º parcial 2025]», es la fuente de las que
     siguen; «# Materia: X» cambia de materia (así viaja lo que se
     comparte desde acá), y cualquier otro «# …» se saltea. */
  const NUMERADA = /^(?:\d{1,3}\s*[.)°º-]|[-•*–])\s*(.+)$/;
  const RESPUESTA = /^(?:r|rta|resp|respuesta)\s*[:.)-]\s*(.*)$/i;
  function partirPegado(texto, materiaBase, fuenteBase){
    const lineas = String(texto).replace(/\r/g, '').split('\n');
    const conNumero = lineas.some(l => NUMERADA.test(l.trim()));
    const conBlanco = lineas.some((l, i) => !l.trim() && i > 0 && i < lineas.length - 1);
    const unaPorRenglon = !conNumero && !conBlanco;

    const salida = [];
    let materia = materiaBase, fuente = fuenteBase, actual = null;
    const cerrar = () => {
      if (actual && actual.texto.trim()) salida.push({
        materia, fuente: actual.fuente, texto: actual.texto.trim(), respuesta: actual.respuesta.trim()
      });
      actual = null;
    };
    lineas.forEach(crudo => {
      const l = crudo.trim();
      if (!l){ cerrar(); return; }
      const m = /^#\s*materia\s*:\s*(.+)$/i.exec(l);
      if (m){ cerrar(); materia = m[1].trim(); fuente = fuenteBase; return; }
      if (l[0] === '#') return;
      const f = /^\[(.+)\]$/.exec(l);
      if (f){ cerrar(); fuente = f[1].trim(); return; }
      const r = RESPUESTA.exec(l);
      if (r && actual){ actual.respuesta += (actual.respuesta ? '\n' : '') + r[1]; actual.enRespuesta = true; return; }
      const n = NUMERADA.exec(l);
      if (n || !actual || unaPorRenglon){
        cerrar();
        actual = { texto: n ? n[1] : l, respuesta:'', fuente, enRespuesta:false };
        return;
      }
      if (actual.enRespuesta) actual.respuesta += '\n' + l;
      else actual.texto += '\n' + l;
    });
    cerrar();
    return salida;
  }

  $('mp-pegar').addEventListener('click', () => {
    cerrarPractica();
    formPreg.hidden = true;
    $('mp-pegar-materia').value = materiaPorDefecto();
    $('mp-pegar-fuente').value = '';
    $('mp-pegar-texto').value = '';
    $('mp-pegar-cuenta').textContent = '';
    $('mp-error-pegar').hidden = true;
    pintarMaterias();
    formPegar.hidden = false;
    formPegar.scrollIntoView({ block:'start' });
    ($('mp-pegar-materia').value ? $('mp-pegar-texto') : $('mp-pegar-materia')).focus({ preventScroll:true });
  });
  /* Antes de cargar, cuántas entendió: si pegó un parcial de diez y
     dice «1», se nota antes de guardar un bloque entero como una sola. */
  $('mp-pegar-texto').addEventListener('input', () => {
    const n = partirPegado($('mp-pegar-texto').value, '', '').length;
    $('mp-pegar-cuenta').textContent = n ? 'Se van a cargar ' + n + (n === 1 ? ' pregunta.' : ' preguntas.') : '';
  });
  formPegar.addEventListener('submit', ev => {
    ev.preventDefault();
    const materia = $('mp-pegar-materia').value.trim();
    const texto = $('mp-pegar-texto').value;
    const viene = partirPegado(texto, materia, $('mp-pegar-fuente').value.trim());
    if (!viene.length) return errorEn('mp-error-pegar', 'No encontramos preguntas en el texto.', $('mp-pegar-texto'));
    if (viene.some(q => !q.materia)) return errorEn('mp-error-pegar', 'Falta la materia.', $('mp-pegar-materia'));
    /* La misma pregunta pegada dos veces (pasa: el mismo parcial llega
       por dos grupos) no se duplica. */
    const ya = new Set(datos.preguntas.map(q => claveMateria(q.materia) + '|' + claveMateria(q.texto)));
    let nuevas = 0, repetidas = 0;
    viene.forEach(q => {
      const k = claveMateria(q.materia) + '|' + claveMateria(q.texto);
      if (ya.has(k)){ repetidas++; return; }
      ya.add(k);
      datos.preguntas.push({ id:nuevoId(), materia:nombreMateria(q.materia), fuente:q.fuente || '',
                             texto:q.texto, respuesta:q.respuesta || '', estado:'nueva' });
      nuevas++;
    });
    if (!guardar()) return;
    if (nuevas && hay('anotarHito')) anotarHito('cargó preguntas de parciales');
    filtro = claveMateria(nombreMateria(viene[0].materia));
    formPegar.hidden = true;
    pintarTodo();
    avisar((nuevas ? 'Cargaste ' + nuevas + (nuevas === 1 ? ' pregunta.' : ' preguntas.') : 'No había ninguna nueva.') +
      (repetidas ? ' ' + repetidas + (repetidas === 1 ? ' ya estaba.' : ' ya estaban.') : ''));
  });

  document.querySelectorAll('[data-cancelar]').forEach(b => b.addEventListener('click', () => {
    const form = b.closest('form');
    if (form === formParcial) cerrarFormParcial();
    else { form.hidden = true; editandoPregunta = null; }
  }));

  /* ---------- Compartir ----------
     Va como texto, en el formato que «Pegar varias» entiende, así
     quien lo recibe lo carga entero de un toque. Sin «La sé» ni «A
     repasar»: eso es de cada quien. */
  function textoParaCompartir(lista){
    const porMateria = new Map();
    lista.forEach(q => {
      const k = claveMateria(q.materia);
      if (!porMateria.has(k)) porMateria.set(k, { nombre:q.materia, preguntas:[] });
      porMateria.get(k).preguntas.push(q);
    });
    const partes = ['# Preguntas de parciales viejos, de La Bolívar con vos',
                    '# Para practicarlas: labolivarconvos.ar/estudiemos/mis-parciales/ → «Pegar varias»'];
    porMateria.forEach(m => {
      partes.push('', '# Materia: ' + m.nombre);
      let fuente = null, n = 0;
      m.preguntas.forEach(q => {
        if ((q.fuente || '') !== fuente){ fuente = q.fuente || ''; if (fuente) partes.push('', '[' + fuente + ']'); }
        n++;
        partes.push('', n + '. ' + q.texto.replace(/\n+/g, ' ') + (q.respuesta ? '\nR: ' + q.respuesta.replace(/\n+/g, ' ') : ''));
      });
    });
    return partes.join('\n');
  }
  async function compartir(){
    const lista = delFiltro();
    if (!lista.length) return;
    const texto = textoParaCompartir(lista);
    if (navigator.share){
      try { await navigator.share({ text: texto }); if (hay('anotarHito')) anotarHito('compartió preguntas de parciales'); return; }
      catch(err){ if (err && err.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(texto);
      if (hay('anotarHito')) anotarHito('compartió preguntas de parciales');
      avisar('Copiado. Pegalo en el grupo: quien lo reciba lo carga con «Pegar varias».');
    } catch(err){
      /* Sin compartir ni portapapeles (pasa en algunos navegadores de
         adentro de otras apps): se abre WhatsApp con el texto. */
      location.href = 'https://wa.me/?text=' + encodeURIComponent(texto);
    }
  }

  /* ============================================================
     PRACTICAR

     Una por vez. Primero las «a repasar», después las nuevas y al
     final las que ya sabe; adentro de cada grupo, mezcladas, para no
     aprenderse el orden en vez de la respuesta. La respuesta se
     esconde hasta que se la pide: el chiste es contestar antes.
     ============================================================ */
  let mazo = [], turno = 0, cuenta = { sabe:0, repasar:0 }, materiaPractica = null;
  const mezclar = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ORDEN_PRACTICA = ['repasar', 'nueva', 'sabe'];

  function empezarPractica(materia, soloRepasar){
    materiaPractica = materia;
    const base = materia ? preguntasDe(materia) : delFiltro();
    const elegidas = soloRepasar ? base.filter(q => q.estado === 'repasar') : base;
    if (!elegidas.length) return;
    mazo = [];
    ORDEN_PRACTICA.forEach(est => mazo.push(...mezclar(elegidas.filter(q => (q.estado || 'nueva') === est))));
    turno = 0; cuenta = { sabe:0, repasar:0 };
    formPreg.hidden = true; formPegar.hidden = true;
    $('mp-banco').hidden = true;
    $('mp-practica').hidden = false;
    if (hay('anotarHito')) anotarHito('practicó preguntas de parciales');
    pintarPractica();
    $('mp-practica').scrollIntoView({ block:'start' });
    $('mp-practica').focus({ preventScroll:true });
  }
  function cerrarPractica(){
    if ($('mp-practica').hidden) return;
    $('mp-practica').hidden = true;
    $('mp-banco').hidden = false;
    pintarPreguntas();
  }

  function pintarPractica(){
    const caja = $('mp-practica');
    if (turno >= mazo.length){
      const quedan = mazo.filter(q => q.estado === 'repasar').length;
      caja.innerHTML = `
        <p class="mp-ceja">Terminaste</p>
        <h3 class="mp-practica-final">${cuenta.sabe} que sabés · ${cuenta.repasar} a repasar</h3>
        <p class="letra-chica">${cuenta.repasar
          ? 'Las que marcaste «a repasar» van primero la próxima vez. Buscalas en el apunte antes de volver a probarte.'
          : 'Todas bien. Volvé en un par de días: lo que se repasa espaciado es lo que queda.'}</p>
        <div class="mp-botones">
          ${quedan ? '<button type="button" class="boton" data-practica="repasar">Otra vez, solo las de repasar</button>' : ''}
          <button type="button" class="boton borde" data-practica="salir">Volver a las preguntas</button>
        </div>`;
      const primero = caja.querySelector('button');
      if (primero) primero.focus();
      return;
    }
    const q = mazo[turno];
    caja.innerHTML = `
      <div class="mp-practica-cabeza">
        <span class="mp-ceja">Pregunta ${turno + 1} de ${mazo.length}</span>
        <button type="button" class="mp-accion" data-practica="salir">Terminar</button>
      </div>
      <div class="mp-practica-barra" aria-hidden="true"><i style="width:${(turno / mazo.length * 100).toFixed(1)}%"></i></div>
      <p class="mp-fuente">${e(q.materia)}${q.fuente ? ' · ' + e(q.fuente) : ''}</p>
      <p class="mp-practica-texto" id="mp-practica-texto">${e(q.texto)}</p>
      <div class="mp-practica-resp" id="mp-practica-resp" hidden>
        ${q.respuesta ? '<span class="mp-ceja">Tu respuesta guardada</span><p>' + e(q.respuesta) + '</p>'
          : '<p class="letra-chica">No le cargaste respuesta. Fijate en el apunte y, si querés, sumala con «Editar» cuando termines.</p>'}
      </div>
      <p class="letra-chica mp-practica-consigna" id="mp-practica-consigna">Contestala primero: en voz alta, en la cabeza o en un papel.</p>
      <div class="mp-botones" id="mp-practica-botones">
        <button type="button" class="boton oscuro ancho" data-practica="ver">Ver la respuesta</button>
      </div>`;
  }

  $('mp-practica').addEventListener('click', ev => {
    const b = ev.target.closest('[data-practica]');
    if (!b) return;
    const que = b.dataset.practica;
    if (que === 'salir'){ cerrarPractica(); $('mp-t-preguntas').scrollIntoView({ block:'start' }); return; }
    if (que === 'repasar'){ empezarPractica(materiaPractica, true); return; }
    if (que === 'ver'){
      $('mp-practica-resp').hidden = false;
      $('mp-practica-consigna').textContent = '¿Cómo te fue?';
      $('mp-practica-botones').innerHTML = `
        <button type="button" class="boton" data-practica="sabe">La sé</button>
        <button type="button" class="boton borde" data-practica="repasar-esta">A repasar</button>`;
      $('mp-practica-botones').querySelector('button').focus();
      return;
    }
    if (que === 'sabe' || que === 'repasar-esta'){
      const q = mazo[turno];
      const real = datos.preguntas.find(x => x.id === q.id);
      const estado = que === 'sabe' ? 'sabe' : 'repasar';
      if (real) real.estado = estado;
      q.estado = estado;
      cuenta[estado]++;
      guardar();
      turno++;
      pintarPractica();
      const sigue = $('mp-practica').querySelector('[data-practica="ver"]');
      if (sigue) sigue.focus();
    }
  });

  /* ============================================================ */
  function pintarTodo(){
    pintarMaterias();
    pintarFechas();
    if ($('mp-practica').hidden) pintarPreguntas();
  }
  pintarTodo();

  /* Elegir carrera desde el ☰ cambia qué materias se sugieren. Y volver
     con «atrás» trae la página del bfcache: pudo haber pasado el día. */
  document.addEventListener('bolivar:carrera', pintarMaterias);
  addEventListener('pageshow', ev => { if (ev.persisted){ datos = leerMisParciales(); pintarTodo(); } });
})();
