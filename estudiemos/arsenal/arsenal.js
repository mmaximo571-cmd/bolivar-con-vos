/* ============================================================
   EL ARSENAL (30/9/2026)

   Material que recomendamos para acompañar la carrera: libros,
   artículos, revistas, películas nacionales, cortos, discos. Cada uno
   con el PORQUÉ, escrito por nosotres, y no la sinopsis de Wikipedia:
   lo que vale es qué te resuelve en la cursada o en el territorio.

   LA LISTA NO ESTÁ ACÁ: está en datos.json, al lado. Sumar un material
   es sumar un bloque a ese archivo (COMO-SUMAR.md dice cómo) sin tocar
   este. Va en un JSON y no en Supabase porque así cualquiera de la
   agrupación lo edita desde GitHub, sin panel ni cuenta, y porque la
   lista cambia de a poco: viaja con la app y se lee sin señal.

   Como el JSON lo escribe gente a mano, TODO lo que trae se lee con
   desconfianza: un bloque con un campo de menos se saltea y se avisa
   (en la consola siempre, y en pantalla cuando se prueba en la compu),
   no deja en blanco la pantalla de todes.

   Las dos marcas de cada tarjeta, «Para el finde» y «Me sirvió», viven
   solo en este teléfono: las maneja marcas.js y no salen de acá.

   Va después de app.js: usa esc, urlSegura, parametro, conPaciencia,
   mostrarError, esPrueba, anotar, carreraElegidaApp y menosMovimiento.
   ============================================================ */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const e = esc;

  const TODO = 'todo';
  /* Lo mismo que dura algo como «nuevo» en la campana (NOVEDADES_DIAS). */
  const DIAS_NUEVO = 14;

  const marcas = crearMarcas('bolivar-arsenal', ['finde', 'sirvio']);

  const cont = $('filas');
  const filtros = $('filtros');
  const vacio = $('vacio');
  const aviso = $('aviso');

  let arsenal = null;
  let filtro = TODO;

  /* ============================================================
     LEER datos.json SIN CREERLE
     ============================================================ */
  const texto = v => (v == null ? '' : String(v)).trim();
  const listaDe = v => Array.isArray(v) ? v : [];
  const esId = v => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v);

  /* Los tres dibujos de portada que hay. Un tipo nuevo en el JSON elige
     uno con "portada"; si no dice nada, amarillo. */
  const PORTADAS = ['amarillo', 'negro', 'papel'];

  function mayuscula(t){ return t.charAt(0).toUpperCase() + t.slice(1); }

  /* El link del botón. Uno relativo (un PDF que está en la app) abre
     acá; uno de afuera, en otra pestaña, así el Arsenal queda donde
     estaba al volver. */
  function esDeAfuera(url){
    try { return new URL(url, location.href).origin !== location.origin; }
    catch(err){ return false; }
  }

  function armar(crudo){
    const problemas = [];
    if (!crudo || typeof crudo !== 'object' || Array.isArray(crudo)){
      problemas.push('El archivo tiene que empezar con { y terminar con }.');
      crudo = {};
    }

    const disciplinas = listaDe(crudo.disciplinas)
      .filter(d => d && texto(d.id) && texto(d.nombre))
      .map(d => ({ id: texto(d.id), nombre: texto(d.nombre),
                   carreras: listaDe(d.carreras).map(texto) }));
    const hayDisciplina = new Set(disciplinas.map(d => d.id));

    const filas = listaDe(crudo.filas)
      .filter(f => f && texto(f.id) && texto(f.titulo))
      .filter(f => {
        if (esId(texto(f.id))) return true;
        problemas.push('La fila "' + texto(f.id) + '": el id lleva solo minúsculas, números y guiones. Se saltea.');
        return false;
      })
      .map(f => ({ id: texto(f.id), titulo: texto(f.titulo), bajada: texto(f.bajada) }));
    const hayFila = new Set(filas.map(f => f.id));

    const tipos = {};
    const tiposCrudos = crudo.tipos && typeof crudo.tipos === 'object' ? crudo.tipos : {};
    Object.keys(tiposCrudos).forEach(k => {
      const t = tiposCrudos[k] || {};
      tipos[k.toLowerCase()] = {
        nombre: texto(t.nombre) || mayuscula(k),
        boton: texto(t.boton),
        portada: PORTADAS.indexOf(texto(t.portada)) >= 0 ? texto(t.portada) : 'amarillo'
      };
    });

    /* El buscador de la biblioteca, con {q} donde va lo que se busca.
       Con esto, un libro sin link igual tiene su botón: se busca por
       título y autoría en el catálogo. */
    const bib = crudo.biblioteca && typeof crudo.biblioteca === 'object' ? crudo.biblioteca : {};
    const buscarEnBiblioteca = /^https:\/\/.+\{q\}/.test(texto(bib.buscar)) ? texto(bib.buscar) : '';

    const vistos = new Set();
    const materiales = [];
    listaDe(crudo.materiales).forEach((m, i) => {
      const donde = 'Bloque ' + (i + 1) + (m && texto(m.titulo) ? ' («' + texto(m.titulo) + '»)' : '');
      if (!m || typeof m !== 'object' || Array.isArray(m)){
        problemas.push(donde + ': no es un bloque { … }.');
        return;
      }
      if (m.oculto === true) return;

      const id = texto(m.id);
      const titulo = texto(m.titulo);
      const porque = texto(m.porque);
      if (!id){ problemas.push(donde + ': le falta "id". Se saltea.'); return; }
      if (!titulo){ problemas.push(donde + ': le falta "titulo". Se saltea.'); return; }
      if (!porque){ problemas.push(donde + ': le falta "porque", que es lo que hace a una recomendación. Se saltea.'); return; }
      if (vistos.has(id)){ problemas.push(donde + ': el id "' + id + '" ya lo usa otro bloque. Se saltea.'); return; }
      if (!esId(id))
        problemas.push(donde + ': el id "' + id + '" lleva solo minúsculas, números y guiones (sin tildes ni espacios).');
      vistos.add(id);

      const tipo = texto(m.tipo).toLowerCase() || 'material';
      if (!tipos[tipo]){
        if (texto(m.tipo)) problemas.push(donde + ': el tipo "' + tipo + '" no está en "tipos". Sale igual, con portada amarilla.');
        tipos[tipo] = { nombre: mayuscula(tipo), boton: '', portada: 'amarillo' };
      }

      const suyas = listaDe(m.disciplinas).map(texto).filter(Boolean);
      suyas.filter(d => !hayDisciplina.has(d)).forEach(d =>
        problemas.push(donde + ': la disciplina "' + d + '" no está en "disciplinas". Sale en «Todo» pero en ningún filtro.'));

      let fila = texto(m.fila);
      if (fila && !hayFila.has(fila)){
        problemas.push(donde + ': la fila "' + fila + '" no está en "filas". Va a «Más del Arsenal».');
        fila = '';
      }

      /* El botón: el link del bloque, o la búsqueda en la biblioteca. */
      let boton = null;
      const b = m.boton && typeof m.boton === 'object' ? m.boton : {};
      const url = texto(b.url);
      if (url){
        const segura = urlSegura(url);
        if (segura === '#') problemas.push(donde + ': el link de "boton" no empieza con https://. Queda sin botón.');
        else boton = { texto: texto(b.texto) || tipos[tipo].boton || 'Abrir', url: segura };
      } else if (buscarEnBiblioteca){
        /* Se busca por el título solo, sin tildes, como arma sus propios
           links la UNLP: la autoría a veces está cargada con errata en el
           catálogo («Rozas Pagazza») y con ella no aparece nada. Si el
           título no alcanza, el bloque trae su propio "buscar". */
        const q = (texto(m.buscar) || titulo).normalize('NFD').replace(/[̀-ͯ]/g, '');
        boton = { texto: texto(b.texto) || 'Buscar en Biblioteca',
                  url: buscarEnBiblioteca.replace('{q}', encodeURIComponent(q)) };
      } else {
        problemas.push(donde + ': no tiene "boton" con "url", ni hay "biblioteca" para buscarlo. Sale sin botón.');
      }

      /* La portada es opcional: sin imagen se dibuja una con el título. */
      let portada = texto(m.portada);
      if (portada && urlSegura(portada) === '#'){
        problemas.push(donde + ': la "portada" no es una dirección válida. Se dibuja una.');
        portada = '';
      }

      /* La fecha es un día, no una hora: se toma su medianoche de acá.
         Con el mediodía, lo sumado hoy a la mañana todavía «no había
         pasado» y salía sin el sello de nuevo. */
      let sumado = null;
      if (texto(m.sumado)){
        const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto(m.sumado));
        const f = p ? new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3])) : null;
        if (f && !isNaN(f) && f.getDate() === Number(p[3])) sumado = f.getTime();
        else problemas.push(donde + ': "sumado" va como fecha AAAA-MM-DD (por ejemplo 2026-09-30).');
      }

      materiales.push({
        id, titulo, porque, tipo, fila, boton, portada, sumado,
        autoria: texto(m.autoria),
        anio: texto(m.anio),
        dato: texto(m.dato),
        disciplinas: suyas
      });
    });

    return { disciplinas, filas, tipos, materiales, problemas };
  }

  /* ============================================================
     DIBUJAR
     ============================================================ */
  const trazo = (d, clase) =>
    `<svg class="${clase}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICONOS = {
    finde:  '<path d="M6.5 3.5h11v17l-5.5-4.2-5.5 4.2z"/>',
    sirvio: '<path d="M12 2.8c.7 3.1 2.7 4.9 4.3 6.8 1.3 1.5 2.2 3 2.2 5A6.5 6.5 0 0 1 12 21a6.5 6.5 0 0 1-6.5-6.4c0-2.3 1.1-4.2 2.7-5.7.2 1.5.9 2.6 2.1 3.3C9.9 9 10.4 5.6 12 2.8z"/>',
    afuera: '<path d="M7 17 17 7M9 7h8v8"/>',
    antes:  '<path d="M15 5l-7 7 7 7"/>',
    despues:'<path d="M9 5l7 7-7 7"/>'
  };
  const MARCAS = {
    finde:  { texto: 'Para el finde' },
    sirvio: { texto: 'Me sirvió' }
  };

  function esNuevo(m){
    if (!m.sumado) return false;
    /* Desde -1: una fecha de mañana es un reloj atrasado o un bloque
       cargado desde otro huso, no algo del futuro. */
    const dias = (Date.now() - m.sumado) / 86400000;
    return dias > -1 && dias <= DIAS_NUEVO;
  }

  /* El título en la portada dibujada se achica según lo largo, en vez
     de cortarse: es el único lugar donde se lee entero (ver htmlTarjeta). */
  function largoDelTitulo(t){
    return t.length > 70 ? ' muy-largo' : t.length > 40 ? ' largo' : '';
  }

  function htmlPortada(m){
    const t = arsenal.tipos[m.tipo];
    const imagen = m.portada
      ? `<img src="${e(m.portada)}" alt="" loading="lazy" decoding="async">` : '';
    /* El dibujo va siempre debajo: si la imagen no carga (un nombre mal
       escrito, sin señal), se la saca y queda el dibujo, no un hueco. */
    return `<div class="ars-portada tinta-${t.portada}${imagen ? ' con-imagen' : ''}" aria-hidden="true">
      <span class="ars-portada-titulo${largoDelTitulo(m.titulo)}">${e(m.titulo)}</span>
      ${imagen}
    </div>`;
  }

  function htmlMarca(tipo, m, idTitulo){
    return `<button type="button" class="ars-marca ${tipo}" data-marca="${tipo}" data-id="${e(m.id)}"
      aria-pressed="${marcas.tiene(tipo, m.id)}" aria-describedby="${idTitulo}">${
      trazo(ICONOS[tipo], 'ars-marca-ico')}<span>${MARCAS[tipo].texto}</span></button>`;
  }

  /* `principal`: la tarjeta de su fila temática, la que lleva el
     `id` para los links directos (…/arsenal/#m-el-id). La copia de la
     fila del finde no lo lleva: dos elementos con el mismo id rompen
     el salto y el lector de pantalla.

     Con la portada dibujada, el título ya se lee grande arriba y el
     <h3> queda solo para el lector de pantalla (que no lee la portada):
     repetirlo abajo gastaba media pantalla del teléfono. */
  function htmlTarjeta(m, fila, principal){
    const t = arsenal.tipos[m.tipo];
    /* Escapado como todo lo que viene de datos.json: un id con comillas
       cortaba el atributo (esId solo avisa, no lo saltea). */
    const idTitulo = e('ars-t-' + fila + '-' + m.id);
    const ficha = [m.autoria, m.anio, m.dato].filter(Boolean).map(e).join(' · ');
    const afuera = m.boton && esDeAfuera(m.boton.url);
    return `<li class="ars-item">
      <article class="ars-tarjeta" data-id="${e(m.id)}" aria-labelledby="${idTitulo}"${
        principal ? ` id="m-${e(m.id)}"` : ''}>
        ${htmlPortada(m)}
        <span class="ars-sellos">
          <span class="ars-tipo">${e(t.nombre)}</span>
          ${esNuevo(m) ? '<span class="ars-nuevo">Nuevo</span>' : ''}
        </span>
        <div class="ars-cuerpo">
          <h3 class="ars-titulo${m.portada ? '' : ' solo-lectores'}" id="${idTitulo}">${e(m.titulo)}</h3>
          ${ficha ? `<p class="ars-ficha">${ficha}</p>` : ''}
          <p class="ars-porque"><span class="ars-porque-rotulo">Por qué te lo recomendamos</span>${e(m.porque)}</p>
          <div class="ars-pie">
            ${m.boton ? `<a class="boton ancho ars-cta" href="${e(m.boton.url)}"${
              afuera ? ' target="_blank" rel="noopener"' : ''}>${e(m.boton.texto)}${
              afuera ? trazo(ICONOS.afuera, 'ars-cta-ico') + '<span class="solo-lectores"> (se abre en otra pestaña)</span>' : ''}</a>` : ''}
            <div class="ars-marcas">
              ${htmlMarca('finde', m, idTitulo)}
              ${htmlMarca('sirvio', m, idTitulo)}
            </div>
          </div>
        </div>
      </article>
    </li>`;
  }

  function htmlFila(f, lista, esFinde){
    const idH = 'ars-fila-' + f.id;
    return `<section class="ars-fila${esFinde ? ' es-finde' : ''}" aria-labelledby="${idH}" data-fila="${e(f.id)}">
      <div class="ars-fila-cabeza">
        <h2 id="${idH}">${e(f.titulo)}</h2>
        <span class="ars-cuenta">${lista.length}</span>
        <span class="ars-flechas" aria-hidden="true">
          <button type="button" tabindex="-1" data-correr="-1">${trazo(ICONOS.antes, '')}</button>
          <button type="button" tabindex="-1" data-correr="1">${trazo(ICONOS.despues, '')}</button>
        </span>
        ${f.bajada ? `<p>${e(f.bajada)}</p>` : ''}
      </div>
      <ul class="ars-riel" role="list">
        ${lista.map(m => htmlTarjeta(m, f.id, !esFinde)).join('')}
      </ul>
    </section>`;
  }

  /* Las dos filas que no vienen del JSON llevan un guion adelante, que
     un id de fila del JSON no puede tener: así nunca se pisan. */
  const FILA_FINDE = { id: '-finde', titulo: 'Para el finde',
    bajada: 'Lo que guardaste. Queda en este teléfono, sin cuenta.' };

  function visibles(){
    return arsenal.materiales.filter(m => filtro === TODO || m.disciplinas.indexOf(filtro) >= 0);
  }

  function htmlFinde(lista){
    const porId = new Map(lista.map(m => [m.id, m]));
    const suyos = marcas.lista('finde').filter(id => porId.has(id)).map(id => porId.get(id));
    return suyos.length ? htmlFila(FILA_FINDE, suyos, true) : '';
  }

  function pintar(){
    const lista = visibles();
    let html = `<div id="lugar-finde">${htmlFinde(lista)}</div>`;
    arsenal.filas.forEach(f => {
      const deFila = lista.filter(m => m.fila === f.id);
      if (deFila.length) html += htmlFila(f, deFila, false);
    });
    const sueltos = lista.filter(m => !m.fila);
    if (sueltos.length)
      html += htmlFila({ id: '-mas', titulo: arsenal.filas.length ? 'Más del Arsenal' : 'Todo el Arsenal' }, sueltos, false);
    cont.innerHTML = html;

    vacio.hidden = lista.length > 0;
    if (!lista.length){
      const d = arsenal.disciplinas.find(x => x.id === filtro);
      $('vacio-titulo').textContent = d ? 'En ' + d.nombre + ' todavía no hay nada' : 'Todavía no hay nada acá';
    }
    medirRieles();
  }

  function pintarFiltros(){
    /* Un filtro que no trae nada es una trampa: solo van las
       disciplinas con algún material. La de tu carrera, primero. */
    const c = (() => {
      try { const x = typeof carreraElegidaApp === 'function' ? carreraElegidaApp() : null; return x ? x.id : null; }
      catch(err){ return null; }
    })();
    const conAlgo = arsenal.disciplinas.filter(d => arsenal.materiales.some(m => m.disciplinas.indexOf(d.id) >= 0));
    const peso = d => (c && d.carreras.indexOf(c) >= 0) ? 0 : 1;
    const orden = conAlgo.map((d, i) => ({ d, i }))
      .sort((a, b) => peso(a.d) - peso(b.d) || a.i - b.i).map(x => x.d);
    if (filtro !== TODO && !conAlgo.some(d => d.id === filtro)) filtro = TODO;

    filtros.hidden = orden.length < 2;
    filtros.innerHTML = [{ id: TODO, nombre: 'Todo' }].concat(orden).map(d =>
      `<button type="button" class="chip" data-filtro="${e(d.id)}" aria-pressed="${d.id === filtro}">${e(d.nombre)}</button>`
    ).join('');
  }

  /* Los problemas del JSON, a la vista solo cuando se prueba en la
     compu: quien sumó un bloque ve al toque qué le quedó mal. En la
     app publicada no sale nunca (nada de «REVISAR» a la vista de une
     estudiante); ahí quedan en la consola. */
  function pintarProblemas(problemas){
    if (!problemas.length) return;
    console.warn('El Arsenal: datos.json tiene ' + problemas.length + ' problema(s):\n· ' + problemas.join('\n· '));
    if (!esPrueba()) return;
    const caja = $('problemas');
    caja.hidden = false;
    caja.innerHTML = `<strong>datos.json tiene ${problemas.length} ${problemas.length === 1 ? 'cosa' : 'cosas'} para revisar</strong>
      <small>(esto solo se ve en tu compu, no en la app publicada)</small>
      <ul>${problemas.map(p => `<li>${e(p)}</li>`).join('')}</ul>`;
  }

  /* ============================================================
     LOS RIELES: flechas en la compu, dedo en el teléfono
     ============================================================ */
  function medirRiel(seccion){
    const riel = seccion.querySelector('.ars-riel');
    if (!riel) return;
    const sobra = riel.scrollWidth - riel.clientWidth;
    seccion.classList.toggle('desborda', sobra > 4);
    const [antes, despues] = seccion.querySelectorAll('[data-correr]');
    if (antes) antes.disabled = riel.scrollLeft <= 4;
    if (despues) despues.disabled = riel.scrollLeft >= sobra - 4;
  }
  function medirRieles(){ cont.querySelectorAll('.ars-fila').forEach(medirRiel); }

  /* Se mide cuando el riel para de moverse, uno por uno. setTimeout y
     no requestAnimationFrame: con la pestaña de fondo rAF no corre, y
     las flechas quedarían mal al volver. */
  const relojesRiel = new WeakMap();
  cont.addEventListener('scroll', ev => {
    const s = ev.target.closest && ev.target.closest('.ars-fila');
    if (!s) return;
    clearTimeout(relojesRiel.get(s));
    relojesRiel.set(s, setTimeout(() => medirRiel(s), 100));
  }, { capture: true, passive: true });
  window.addEventListener('resize', () => { if (arsenal) medirRieles(); });

  /* ============================================================
     TOCAR
     ============================================================ */
  let relojAviso = null;
  function avisar(t){
    aviso.textContent = t;
    aviso.classList.add('visible');
    clearTimeout(relojAviso);
    relojAviso = setTimeout(() => aviso.classList.remove('visible'), 3800);
  }

  /* Algo que aparece ARRIBA de lo que se está mirando (la fila del
     finde, la primera vez que se guarda algo) empuja todo para abajo, y
     la tarjeta que se acaba de tocar se va de la pantalla. Se mide
     dónde estaba el botón, se cambia, y se corrige el desplazamiento
     para que quede en el mismo lugar. Safari no lo hace solo. */
  function sinSaltar(ancla, cambiar){
    const antes = ancla.getBoundingClientRect().top;
    cambiar();
    if (!document.contains(ancla)) return;
    const delta = ancla.getBoundingClientRect().top - antes;
    if (Math.abs(delta) > 1) window.scrollBy(0, delta);
  }

  function reflejarMarca(tipo, id, marcado){
    cont.querySelectorAll(`.ars-marca[data-marca="${tipo}"]`).forEach(b => {
      if (b.dataset.id === id) b.setAttribute('aria-pressed', String(marcado));
    });
  }

  function alMarcar(boton){
    const tipo = boton.dataset.marca;
    const id = boton.dataset.id;
    const marcado = marcas.alternar(tipo, id);
    reflejarMarca(tipo, id, marcado);
    /* El saltito del ícono, solo en el botón que se tocó: si fuera por
       `aria-pressed`, saltarían también los ya marcados al abrir. */
    boton.classList.remove('recien');
    void boton.offsetWidth;
    boton.classList.add('recien');

    if (tipo === 'finde'){
      const lugar = $('lugar-finde');
      const enFinde = lugar.querySelector(`.ars-tarjeta[data-id="${CSS.escape(id)}"]`);
      if (enFinde){
        /* Ya está en la fila del finde: se atenúa o se recupera, pero no
           se saca hasta el próximo dibujo. Si se sacara en el acto, el
           foco se perdería con la tarjeta y deshacer el toque sería
           imposible: se toca de nuevo y vuelve. */
        enFinde.classList.toggle('sacada', !marcado);
        lugar.querySelector('.ars-cuenta').textContent =
          lugar.querySelectorAll('.ars-tarjeta:not(.sacada)').length;
      } else if (marcado){
        sinSaltar(boton, () => { lugar.innerHTML = htmlFinde(visibles()); medirRieles(); });
      }
    }

    if (!marcas.seGuarda()){
      avisar('Lo marcamos, pero este navegador no nos deja guardarlo: al cerrar la pestaña se pierde.');
      return;
    }
    if (tipo === 'finde') avisar(marcado ? 'Guardado para el finde. Lo tenés arriba de todo.' : 'Lo sacamos de tu finde.');
    else avisar(marcado ? 'Marcado: te sirvió.' : 'Le sacamos la marca.');
  }

  function alFiltrar(id){
    if (id === filtro) return;
    filtro = id;
    filtros.querySelectorAll('.chip').forEach(c =>
      c.setAttribute('aria-pressed', String(c.dataset.filtro === filtro)));
    /* El filtro queda en la dirección: el link que se comparte, o el
       de una placa de Instagram, abre con el filtro puesto. */
    const u = new URL(location.href);
    if (filtro === TODO) u.searchParams.delete('ver'); else u.searchParams.set('ver', filtro);
    u.hash = '';
    history.replaceState(null, '', u.pathname + u.search);
    pintar();
    const n = visibles().length;
    avisar(n ? (n === 1 ? 'Un material' : n + ' materiales') + (filtro === TODO ? ' en todo el Arsenal.' : ' en este filtro.') : 'Nada en este filtro, todavía.');
  }

  filtros.addEventListener('click', ev => {
    const c = ev.target.closest('.chip[data-filtro]');
    if (c) alFiltrar(c.dataset.filtro);
  });

  cont.addEventListener('click', ev => {
    const marca = ev.target.closest('.ars-marca');
    if (marca){ alMarcar(marca); return; }
    const flecha = ev.target.closest('[data-correr]');
    if (flecha){
      const riel = flecha.closest('.ars-fila').querySelector('.ars-riel');
      riel.scrollBy({ left: Number(flecha.dataset.correr) * riel.clientWidth * 0.85,
                      behavior: menosMovimiento() ? 'auto' : 'smooth' });
    }
  });

  /* Una portada que no carga se saca y queda el dibujo de abajo. El
     evento `error` de una imagen no sube: se escucha en la captura. */
  cont.addEventListener('error', ev => {
    const img = ev.target;
    if (img && img.tagName === 'IMG' && img.closest('.ars-portada')){
      img.closest('.ars-portada').classList.remove('con-imagen');
      img.remove();
    }
  }, true);

  /* Otra pestaña marcó algo: se redibuja todo con lo nuevo. */
  marcas.alCambiar(cambio => { if (cambio.deOtraPestana && arsenal) pintar(); });

  /* ============================================================
     ARRANCAR
     ============================================================ */
  function errorDeJSON(err, crudo){
    /* Chrome dice «at position 812», Firefox «at line 30 column 5».
       Se traduce a renglón, que es lo que se ve en el editor. */
    const m = String(err && err.message || '');
    let renglon = (m.match(/line (\d+)/) || [])[1];
    const pos = (m.match(/position (\d+)/) || [])[1];
    if (!renglon && pos) renglon = crudo.slice(0, Number(pos)).split('\n').length;
    /* El Chrome de ahora no da la posición: da el pedazo de texto que
       rodea al error, diez caracteres antes y diez después («Unexpected
       token ']', ..."  },\n  ]\n}" is not valid JSON»). Se busca ese
       pedazo en el archivo, y el error está diez caracteres adentro. */
    if (!renglon){
      const ini = m.indexOf('"', m.indexOf(', '));
      const fin = m.search(/"(\.\.\.)? is not valid JSON/);
      const pedazo = ini >= 0 && fin > ini ? m.slice(ini + 1, fin) : '';
      const donde = pedazo ? crudo.indexOf(pedazo) : -1;
      if (donde >= 0) renglon = crudo.slice(0, donde + Math.min(10, pedazo.length - 1)).split('\n').length;
    }
    const x = new Error('datos.json no se puede leer' + (renglon ? ' (renglón ' + renglon + ')' : '') +
      '. Lo más común: una coma de más después del último bloque, una que falta entre dos, o comillas sin cerrar.');
    x.esDelJSON = true;
    return x;
  }

  async function arrancar(){
    let crudo;
    try {
      /* `no-cache`: que el navegador pregunte siempre si cambió. El
         service worker, además, lo pide primero a la red (ver sw.js). */
      const r = await conPaciencia(fetch('datos.json', { cache: 'no-cache' }), 12);
      if (!r.ok) throw Object.assign(new Error('No encontramos la lista del Arsenal (error ' + r.status + ').'), { status: r.status });
      const t = await r.text();
      try { crudo = JSON.parse(t); }
      catch(err){ throw errorDeJSON(err, t); }
    } catch(err){
      cont.removeAttribute('aria-busy');
      if (err && err.esDelJSON){
        anotar('error', 'arsenal: ' + err.message);
        cont.innerHTML = `<div class="aviso error"><strong>No pudimos abrir el Arsenal.</strong><br>
          Se nos rompió la lista de nuestro lado. Probá de nuevo en un rato.${
          esPrueba() ? `<br><small>${e(err.message)}</small>` : ''}</div>`;
      } else {
        mostrarError(cont, err, 'cargar el Arsenal');
      }
      return;
    }

    arsenal = armar(crudo);
    pintarProblemas(arsenal.problemas);

    /* Un link a un material (…/arsenal/#m-el-id) abre sin filtro, para
       que la tarjeta esté seguro. Si no, el filtro de la dirección. */
    const pedida = (location.hash.match(/^#m-([a-z0-9-]+)$/) || [])[1];
    const ver = parametro('ver');
    if (!pedida && ver) filtro = ver;

    pintarFiltros();
    /* Si la dirección pedía un filtro que no quedó puesto (no existe, o
       no tiene nada), se saca de la dirección: si no, al recargar se
       aplicaría uno que no se ve marcado. */
    if (ver && filtro !== ver){
      const u = new URL(location.href);
      u.searchParams.delete('ver');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
    cont.removeAttribute('aria-busy');
    pintar();

    if (pedida){
      const t = document.getElementById('m-' + pedida);
      if (t){
        t.classList.add('pedida');
        t.scrollIntoView({ block: 'center', inline: 'start' });
      }
    }
  }

  arrancar();
})();
