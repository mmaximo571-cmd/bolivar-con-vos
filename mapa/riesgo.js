/* ============================================================
   EL MAPA DE RIESGO  ·  la lógica de `mapa/`

   Cinco partes, de abajo hacia arriba:

     1. EL ALMACÉN     el estado de la pantalla en un solo lugar
     2. EL GUARDADO    la cola de reportes en el teléfono (IndexedDB)
     3. EL ENVÍO       manda la cola cuando hay señal, sin duplicar
     4. EL MAPA        Leaflet, las tres capas y los pines
     5. LA HOJA        el formulario que sube desde abajo

   Sin React ni Zustand ni Dexie a propósito: la app no tiene paso de
   compilación y cada kilo que baja se paga en el celular del barrio.
   El almacén de acá hace lo mismo que Zustand (un estado, `set` con
   pedazos, suscripciones) en quince renglones, y la cola usa
   IndexedDB directo en cuarenta.
   ============================================================ */
(function mapaDeRiesgo(){

  const TABLA = 'reportes_riesgo';
  /* Las columnas que se pueden leer. `autor` NO está y no puede estar:
     la base no le da permiso a nadie (ver tabla-riesgo.sql). */
  const COLUMNAS = 'id,capa,categoria,lat,lng,descripcion,estado,creado_en_dispositivo';

  /* La zona: un rectángulo que abarca los tres partidos. El centro cae
     entre el casco de La Plata y el puerto, así se ven las tres
     ciudades en la primera vista de un teléfono. La base acepta un poco
     más de margen que esto; la app frena antes. */
  const ZONA = {
    centro: [-34.885, -57.925],
    zoom:   12,
    limites:[[-35.12, -58.20], [-34.76, -57.72]]
  };

  const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
  const $ = id => document.getElementById(id);

  document.getElementById('cabecera').innerHTML = htmlCabecera();
  document.getElementById('pie').innerHTML = htmlPie();
  pintarNav('mapa');


  /* ============================================================
     1. EL ALMACÉN
     ============================================================ */
  function crearAlmacen(inicial){
    let estado = inicial;
    const oyentes = new Set();
    return {
      get: () => estado,
      set(pedazo){
        const antes = estado;
        const nuevo = typeof pedazo === 'function' ? pedazo(estado) : pedazo;
        estado = Object.assign({}, estado, nuevo);
        oyentes.forEach(f => f(estado, antes));
      },
      suscribir(f){ oyentes.add(f); return () => oyentes.delete(f); }
    };
  }

  function borradorVacio(anterior){
    /* Capa y categoría se conservan: en una recorrida se cargan varios
       puntos seguidos del mismo tipo. Lo demás arranca de cero. */
    return {
      lat:null, lng:null, precision:null, origen:null,
      capa: anterior ? anterior.capa : null,
      categoria: anterior ? anterior.categoria : null,
      descripcion:''
    };
  }

  const almacen = crearAlmacen({
    reportes: [],             // lo que vino de la base
    copiaDel: null,           // si se muestra una copia vieja, de cuándo es
    cola: [],                 // lo guardado en el teléfono, sin enviar
    envio: 'quieto',          // quieto | enviando | sin-señal | falta-sesion | limite | con-errores
    capas: { hidrico:true, industrial:true, redes:true },
    borrador: leerBorrador() || borradorVacio(),
    marcando: false,          // la próxima vez que se toque el mapa, pone la ubicación
    mapaListo: false
  });


  /* ============================================================
     2. EL GUARDADO

     IndexedDB y no localStorage por lo que viene: la próxima cosa que
     se le va a pedir a un reporte es una foto, y una foto no entra en
     localStorage. Pero hay navegadores donde IndexedDB no abre (algunas
     ventanas privadas, algunos webviews): ahí cae a localStorage, que
     para texto alcanza. Un reporte que no se pudo guardar en ningún
     lado se avisa: nunca se pierde en silencio.
     ============================================================ */
  const guardado = (function(){
    let abriendo = null;
    function base(){
      if (!abriendo) abriendo = new Promise((ok, mal) => {
        if (!('indexedDB' in window)) return mal(new Error('sin IndexedDB'));
        const p = indexedDB.open('bolivar-riesgo', 1);
        p.onupgradeneeded = () => {
          const b = p.result;
          if (!b.objectStoreNames.contains('cola'))  b.createObjectStore('cola',  { keyPath:'id' });
          if (!b.objectStoreNames.contains('copia')) b.createObjectStore('copia', { keyPath:'clave' });
        };
        p.onsuccess = () => ok(p.result);
        p.onerror   = () => mal(p.error);
        p.onblocked = () => mal(new Error('IndexedDB bloqueada'));
      });
      return abriendo;
    }
    function pedido(tienda, modo, hacer){
      return base().then(b => new Promise((ok, mal) => {
        const t = b.transaction(tienda, modo);
        const r = hacer(t.objectStore(tienda));
        t.oncomplete = () => ok(r ? r.result : undefined);
        t.onerror = t.onabort = () => mal(t.error);
      }));
    }

    const LS = 'bolivar-riesgo-';
    function lsLeer(k){ try { return JSON.parse(localStorage.getItem(LS + k)); } catch(e){ return null; } }
    function lsPoner(k, v){ try { localStorage.setItem(LS + k, JSON.stringify(v)); return true; } catch(e){ return false; } }

    return {
      /* Lee de los dos lados y junta por id: si un día IndexedDB falló
         y otro día anduvo, hay reportes repartidos en los dos. */
      async leerCola(){
        let deIdb = [];
        try { deIdb = (await pedido('cola', 'readonly', s => s.getAll())) || []; } catch(e){}
        const deLs = lsLeer('cola') || [];
        const juntos = new Map();
        deLs.concat(deIdb).forEach(r => juntos.set(r.id, r));
        return [...juntos.values()].sort((a, b) =>
          a.creado_en_dispositivo < b.creado_en_dispositivo ? -1 : 1);
      },
      async poner(item){
        try { await pedido('cola', 'readwrite', s => s.put(item)); return true; }
        catch(e){
          const c = (lsLeer('cola') || []).filter(x => x.id !== item.id);
          c.push(item);
          return lsPoner('cola', c);
        }
      },
      async sacar(id){
        try { await pedido('cola', 'readwrite', s => s.delete(id)); } catch(e){}
        const c = lsLeer('cola');
        if (c && c.some(x => x.id === id)) lsPoner('cola', c.filter(x => x.id !== id));
      },
      /* La última lista aprobada, con la hora en que se trajo. */
      async guardarCopia(reportes){
        const copia = { clave:'aprobados', fecha:new Date().toISOString(), reportes };
        try { await pedido('copia', 'readwrite', s => s.put(copia)); } catch(e){}
      },
      async leerCopia(){
        try { return (await pedido('copia', 'readonly', s => s.get('aprobados'))) || null; }
        catch(e){ return null; }
      }
    };
  })();

  function leerBorrador(){
    try { return JSON.parse(localStorage.getItem('bolivar-riesgo-borrador')); } catch(e){ return null; }
  }
  /* El borrador se guarda en cada cambio: si el teléfono corta la
     pantalla o entra una llamada a mitad de escribir, al volver está. */
  almacen.suscribir((s, antes) => {
    if (s.borrador === antes.borrador) return;
    try { localStorage.setItem('bolivar-riesgo-borrador', JSON.stringify(s.borrador)); } catch(e){}
  });

  function nuevoId(){
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }


  /* ============================================================
     3. EL ENVÍO

     Cuándo se intenta: al abrir la pantalla, al guardar un reporte, al
     volver la señal, al volver a la pantalla desde otra app, y cada
     treinta segundos mientras quede algo en la cola.

     Lo de los treinta segundos es porque `navigator.onLine` miente: en
     el webview de Instagram y en una red con portal dice «hay conexión»
     sin que salga nada. La única prueba de que hay señal es que el
     pedido vuelva.

     Por qué no Background Sync del service worker: solo existe en
     Chrome de Android, no en iPhone ni adentro de Instagram, y además el
     service worker no ve la sesión, que vive en localStorage. Lo de acá
     anda en todos lados, con la condición de que la pantalla se vuelva a
     abrir alguna vez. Eso se dice en «Cómo se usa».
     ============================================================ */
  let enviando = false;
  let reintento = null;
  let espera = 5000;

  function conPlazo(promesa, ms){
    return Promise.race([promesa, new Promise((_, mal) =>
      setTimeout(() => mal(new Error('tardó demasiado')), ms))]);
  }

  function esDeRed(r){
    const e = r.error;
    return !e.code && (r.status === 0 || /fetch|network|load failed|conex/i.test(e.message || ''));
  }

  async function enviarCola(){
    const pendientes = almacen.get().cola.filter(r => !r.fallo);
    if (enviando || !db || !pendientes.length) return;
    enviando = true;
    clearTimeout(reintento);
    almacen.set({ envio:'enviando' });

    let resultado = 'quieto';
    try {
      const { data } = await db.auth.getSession();
      if (!data || !data.session) resultado = 'falta-sesion';
    } catch(e){ /* sin red para renovar la sesión: se prueba igual */ }

    if (resultado === 'quieto') for (const item of pendientes){
      let r;
      /* Si el plazo vence, el pedido pudo haber llegado igual. No
         importa: el próximo intento choca con el mismo id (23505). */
      try { r = await conPlazo(db.from(TABLA).insert(aFila(item)), 15000); }
      catch(e){ resultado = 'sin-señal'; break; }

      if (!r.error || r.error.code === '23505'){
        await guardado.sacar(item.id);
        almacen.set(s => ({ cola: s.cola.filter(x => x.id !== item.id) }));
        if (!r.error && typeof anotarHito === 'function') anotarHito('reportó en el mapa');
        continue;
      }
      const m = r.error.message || '';
      if (esDeRed(r)){ resultado = 'sin-señal'; break; }
      if (/demasiados/i.test(m)){ resultado = 'limite'; break; }
      if (r.status === 401 || /jwt/i.test(m) || (r.error.code === '42501' && !/row-level/i.test(m))){
        resultado = 'falta-sesion'; break;
      }
      /* Solo dos rechazos son del CONTENIDO y reintentar no los arregla:
         una regla de la tabla (fuera de la zona, 23514) y la política
         de los 30 días (row-level). Cualquier otro error —la tabla
         todavía no existe, la base caída— es del servidor: el reporte
         queda en la cola y se reintenta, nunca se da por perdido. */
      if (r.error.code !== '23514' && !/row-level/i.test(m)){ resultado = 'sin-señal'; break; }
      const conFallo = Object.assign({}, item, { fallo: explicarFallo(r.error) });
      await guardado.poner(conFallo);
      almacen.set(s => ({ cola: s.cola.map(x => x.id === item.id ? conFallo : x) }));
      resultado = 'con-errores';
    }

    enviando = false;
    almacen.set({ envio: resultado });

    if (resultado === 'sin-señal' || resultado === 'limite'){
      reintento = setTimeout(enviarCola, espera);
      espera = Math.min(espera * 2, 60000);
    } else {
      espera = 5000;
    }
    /* Si algo salió, se vuelve a pedir la lista: el punto propio pasa de
       «en tu teléfono» a «en revisión». */
    if (almacen.get().cola.length < pendientes.length) traerReportes();
  }

  function aFila(item){
    return {
      id: item.id, capa: item.capa, categoria: item.categoria,
      lat: item.lat, lng: item.lng, precision_m: item.precision_m,
      origen_ubicacion: item.origen_ubicacion, descripcion: item.descripcion,
      creado_en_dispositivo: item.creado_en_dispositivo, esquema: item.esquema
    };
  }

  function explicarFallo(error){
    const m = error.message || '';
    if (/lat|lng/.test(m))  return 'El punto quedó fuera de La Plata, Berisso y Ensenada.';
    if (/row-level|policy/.test(m)) return 'Se guardó hace más de 30 días y ya no se puede enviar.';
    return typeof explicarError === 'function'
      ? (explicarError(error).texto || m) : m;
  }

  window.addEventListener('online', enviarCola);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible'){ enviarCola(); }
  });
  setInterval(() => { if (almacen.get().cola.some(r => !r.fallo)) enviarCola(); }, 30000);

  async function traerReportes(){
    if (!db) return;
    let r;
    try {
      r = await conPlazo(db.from(TABLA).select(COLUMNAS)
        .neq('estado', 'rechazado')
        .order('creado_en_dispositivo', { ascending:false })
        .limit(800), 15000);
    } catch(e){ r = { error:{ message:'tardó demasiado' }, status:0 }; }

    if (r.error){
      /* Sin señal: lo último que se trajo, con la fecha a la vista. Un
         punto de riesgo viejo no engaña como una fecha de mesa vieja,
         pero igual se dice de cuándo es. Si el error es de la base y
         no de la red, no se dice «sin señal»: sería mentira. */
      if (!esDeRed(r)) return;
      if (!almacen.get().reportes.length){
        const copia = await guardado.leerCopia();
        if (copia) almacen.set({ reportes: copia.reportes, copiaDel: copia.fecha });
      }
      return;
    }
    almacen.set({ reportes: r.data || [], copiaDel: null });
    /* A la copia va SOLO lo aprobado: lo pendiente es de quien tiene la
       sesión abierta y en un teléfono prestado no tiene que quedar. */
    guardado.guardarCopia((r.data || []).filter(x => x.estado === 'aprobado'));
  }


  /* ============================================================
     EL ESTADO DEL ENVÍO, en una línea arriba del mapa
     ============================================================ */
  function pintarEstado(s){
    const sinEnviar = s.cola.filter(r => !r.fallo).length;
    const conFallo  = s.cola.length - sinEnviar;
    const n = k => k === 1 ? '1 reporte' : k + ' reportes';
    let texto = '', clase = '';

    if (s.envio === 'enviando')          { texto = 'Enviando…'; clase = 'enviando'; }
    else if (sinEnviar && s.envio === 'falta-sesion'){
      texto = `${n(sinEnviar)} guardado${sinEnviar > 1 ? 's' : ''}. Para enviar, entrá con tu cuenta.`;
      clase = 'atento';
    }
    else if (sinEnviar && s.envio === 'limite'){ texto = 'Muchos reportes seguidos: se envían en un rato.'; clase = 'atento'; }
    else if (sinEnviar)                  { texto = `Sin señal · ${n(sinEnviar)} esperando para enviarse`; clase = 'atento'; }
    else if (conFallo)                   { texto = `${n(conFallo)} no se pudo enviar. Mirá abajo del mapa.`; clase = 'error'; }
    else if (s.copiaDel)                 { texto = `Sin señal · mostrando lo guardado el ${fechaCorta(s.copiaDel)}`; clase = 'atento'; }

    const el = $('estado-envio');
    el.textContent = texto;
    el.className = 'mapa-estado ' + clase;
    el.hidden = !texto;
  }

  function pintarGuardados(s){
    $('mis-guardados').hidden = !s.cola.length;
    $('enviar-ahora').hidden = !s.cola.some(r => !r.fallo);
    $('guardados-lista').innerHTML = s.cola.map(r => `
      <li class="guardado${r.fallo ? ' con-fallo' : ''}">
        <span class="pin-chico pin-${esc(r.capa)}" aria-hidden="true">${capaRiesgo(r.capa).glifo}</span>
        <span class="crecer">
          <strong>${esc(nombreCategoriaRiesgo(r.capa, r.categoria))}</strong>
          <span class="letra-chica">${esc(fechaCorta(r.creado_en_dispositivo))}${
            r.fallo ? ' · ' + esc(r.fallo) : ' · sin enviar'}</span>
        </span>
        <button type="button" class="mini" data-borrar="${esc(r.id)}">Borrar</button>
      </li>`).join('');
  }

  $('guardados-lista').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-borrar]');
    if (!b) return;
    if (!confirm('¿Borrar este reporte del teléfono? No se envió y no se puede recuperar.')) return;
    await guardado.sacar(b.dataset.borrar);
    almacen.set(s => ({ cola: s.cola.filter(x => x.id !== b.dataset.borrar) }));
  });
  $('enviar-ahora').addEventListener('click', () => { espera = 5000; enviarCola(); });

  function fechaCorta(iso){
    try {
      return new Date(iso).toLocaleString('es-AR', {
        day:'numeric', month:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch(e){ return ''; }
  }


  /* ============================================================
     4. EL MAPA

     Leaflet se pide al abrir la pantalla y no está en el HTML: si no
     llega (sin señal en la primera visita), la pantalla sigue entera y
     el formulario anda con el GPS. Después de la primera vez queda
     guardado por el service worker (ver sw.js, la regla de Leaflet).
     ============================================================ */
  let mapa = null, grupos = {}, marcaBorrador = null;

  function cargarLeaflet(){
    if (window.L) return Promise.resolve(window.L);
    return new Promise((ok, mal) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = LEAFLET + 'leaflet.min.css'; css.crossOrigin = 'anonymous';
      const js = document.createElement('script');
      js.src = LEAFLET + 'leaflet.min.js'; js.crossOrigin = 'anonymous';
      js.onload  = () => window.L ? ok(window.L) : mal(new Error('Leaflet vacío'));
      js.onerror = () => mal(new Error('Leaflet no cargó'));
      document.head.append(css, js);
      setTimeout(() => mal(new Error('Leaflet tardó')), 20000);
    });
  }

  function iconoDe(capa, clase){
    return L.divIcon({
      className: 'pin-envoltura',
      html: `<span class="pin pin-${capa} ${clase || ''}"><span>${capaRiesgo(capa).glifo}</span></span>`,
      iconSize: [40, 40], iconAnchor: [20, 38], popupAnchor: [0, -34]
    });
  }

  async function armarMapa(){
    try { await cargarLeaflet(); }
    catch(e){
      const aviso = $('mapa-sin');
      aviso.textContent = 'El mapa necesita señal la primera vez. Igual podés reportar: tu ubicación sale del GPS del teléfono.';
      aviso.hidden = false;
      $('lienzo').classList.add('vacio-mapa');
      $('marcar-mapa').disabled = true;
      return;
    }

    const limites = L.latLngBounds(ZONA.limites);
    mapa = L.map('lienzo', {
      center: ZONA.centro, zoom: ZONA.zoom, minZoom: 10,
      maxBounds: limites.pad(0.15), maxBoundsViscosity: 0.8
    });
    const fondo = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    /* Sin señal los azulejos no llegan y el mapa queda gris. Los pines
       sí se ven: se avisa una vez por qué falta el fondo. */
    let avisoAzulejos = false;
    fondo.on('tileerror', () => {
      if (avisoAzulejos) return;
      avisoAzulejos = true;
      const aviso = $('mapa-sin');
      aviso.textContent = 'Sin señal no se ven las calles, pero los puntos y tu ubicación sí.';
      aviso.hidden = false;
    });
    fondo.on('load', () => { if (avisoAzulejos) $('mapa-sin').hidden = true; avisoAzulejos = false; });

    CAPAS_RIESGO.forEach(c => { grupos[c.id] = L.layerGroup(); });

    mapa.on('click', e => {
      if (!almacen.get().marcando) return;
      ponerUbicacion(e.latlng.lat, e.latlng.lng, null, 'mapa');
    });

    almacen.set({ mapaListo: true });
    pintarCapas(almacen.get());
    pintarPines(almacen.get());
    pintarMarcaBorrador(almacen.get());
  }

  /* Los interruptores de capa: afuera del mapa, grandes, y no el
     control de Leaflet, que es un ícono de 26 px escondido en una
     esquina y que en un teléfono no se encuentra. */
  function dibujarInterruptores(){
    $('capas-fila').innerHTML = CAPAS_RIESGO.map(c => `
      <button type="button" class="chip capa-chip capa-${c.id}" data-capa="${c.id}" aria-pressed="true">
        <span class="pin-chico pin-${c.id}" aria-hidden="true">${c.glifo}</span>${esc(c.corto)}
        <span class="capa-cuenta" data-cuenta="${c.id}"></span>
      </button>`).join('');
    $('capas-fila').addEventListener('click', ev => {
      const b = ev.target.closest('[data-capa]');
      if (!b) return;
      almacen.set(s => ({ capas: Object.assign({}, s.capas, { [b.dataset.capa]: !s.capas[b.dataset.capa] }) }));
    });
  }

  function pintarCapas(s){
    CAPAS_RIESGO.forEach(c => {
      const b = document.querySelector(`[data-capa="${c.id}"]`);
      if (b) b.setAttribute('aria-pressed', s.capas[c.id] ? 'true' : 'false');
      const cuantos = s.reportes.filter(r => r.capa === c.id).length +
                      s.cola.filter(r => r.capa === c.id).length;
      const n = document.querySelector(`[data-cuenta="${c.id}"]`);
      if (n) n.textContent = cuantos ? String(cuantos) : '';
      if (!mapa) return;
      if (s.capas[c.id]) grupos[c.id].addTo(mapa);
      else mapa.removeLayer(grupos[c.id]);
    });
  }

  function pintarPines(s){
    if (!mapa) return;
    Object.values(grupos).forEach(g => g.clearLayers());
    const poner = (r, clase, nota) => {
      const g = grupos[r.capa];
      if (!g) return;
      L.marker([r.lat, r.lng], {
        icon: iconoDe(r.capa, clase),
        title: nombreCategoriaRiesgo(r.capa, r.categoria),
        keyboard: true
      }).bindPopup(`
        <div class="pin-ficha">
          <p class="pin-ficha-capa">${esc(capaRiesgo(r.capa).nombre)}</p>
          <p class="pin-ficha-titulo">${esc(nombreCategoriaRiesgo(r.capa, r.categoria))}</p>
          ${r.descripcion ? `<p>${esc(r.descripcion)}</p>` : ''}
          <p class="letra-chica">Visto el ${esc(fechaCorta(r.creado_en_dispositivo))}</p>
          ${nota ? `<p class="pin-ficha-nota">${esc(nota)}</p>` : ''}
        </div>`).addTo(g);
    };
    s.reportes.forEach(r => r.estado === 'aprobado'
      ? poner(r)
      : poner(r, 'propio', 'En revisión: por ahora solo lo ves vos.'));
    s.cola.forEach(r => poner(r, 'propio en-telefono',
      r.fallo ? 'No se pudo enviar: ' + r.fallo : 'Guardado en tu teléfono, todavía sin enviar.'));
  }

  function pintarMarcaBorrador(s){
    if (!mapa) return;
    const b = s.borrador;
    const hayHoja = hoja.posicion() !== 'cerrada';
    if (!hayHoja || b.lat == null){
      if (marcaBorrador){ marcaBorrador.remove(); marcaBorrador = null; }
      return;
    }
    if (!marcaBorrador){
      marcaBorrador = L.marker([b.lat, b.lng], {
        icon: L.divIcon({ className:'pin-envoltura', html:'<span class="pin pin-borrador"><span>＋</span></span>',
                          iconSize:[40, 40], iconAnchor:[20, 38] }),
        draggable: true, zIndexOffset: 1000, title: 'Tu reporte'
      }).addTo(mapa);
      marcaBorrador.on('dragend', () => {
        const p = marcaBorrador.getLatLng();
        ponerUbicacion(p.lat, p.lng, null, 'mapa', true);
      });
    } else {
      marcaBorrador.setLatLng([b.lat, b.lng]);
    }
  }

  almacen.suscribir((s, antes) => {
    if (s.capas !== antes.capas || s.reportes !== antes.reportes || s.cola !== antes.cola) pintarCapas(s);
    if (s.reportes !== antes.reportes || s.cola !== antes.cola) pintarPines(s);
    if (s.cola !== antes.cola || s.envio !== antes.envio || s.copiaDel !== antes.copiaDel){
      pintarEstado(s); pintarGuardados(s);
    }
    if (s.borrador !== antes.borrador) { pintarMarcaBorrador(s); pintarFormulario(s); }
    if (s.marcando !== antes.marcando) pintarMarcando(s);
  });


  /* ============================================================
     5. LA HOJA DE ABAJO

     Se agarra de la franja de arriba y sigue al dedo 1:1, desde donde
     esté en ese momento (también a mitad de una animación). Al soltar
     se proyecta hacia dónde iba con la velocidad del dedo y se acomoda
     en la posición más cercana a ESE punto, no al punto donde se soltó:
     así un empujón corto hacia abajo la cierra, como en el teléfono.

     La animación es una transición CSS y el final se confirma con un
     setTimeout y no con `transitionend`: en el panel de prueba y en
     algunas pestañas en segundo plano ese evento no llega nunca.
     ============================================================ */
  const hoja = (function(){
    const el = $('hoja'), fondo = $('hoja-fondo'), agarre = $('hoja-agarre');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pos = 'cerrada', y = 0, fin = null, disparador = null, arrastre = null;

    function yDe(p){
      const alto = el.offsetHeight;
      if (p === 'abierta') return 0;
      if (p === 'baja') return Math.max(0, alto - agarre.offsetHeight);
      return alto + 24;
    }
    /* El valor que está en pantalla AHORA, aunque esté a mitad de camino. */
    function yEnPantalla(){
      const t = getComputedStyle(el).transform;
      if (!t || t === 'none') return y;
      try { return new DOMMatrixReadOnly(t).m42; } catch(e){ return y; }
    }
    function poner(nuevo, segundos){
      el.style.transition = segundos ? `transform ${segundos}s cubic-bezier(.32,.72,0,1)` : 'none';
      el.style.transform = `translate3d(0,${nuevo}px,0)`;
      y = nuevo;
    }
    /* Afuera del tope, sigue al dedo cada vez menos. */
    function gomita(pasado, dimension){
      return (pasado * dimension * 0.55) / (dimension + 0.55 * pasado);
    }
    /* Adónde llegaría con esa velocidad si nadie lo frena. */
    function proyectar(v){ return (v / 1000) * 0.99 / (1 - 0.99); }

    function ir(p, velocidad){
      const destino = yDe(p);
      let seg = 0.36;
      if (quieto.matches) seg = 0.01;
      else if (velocidad && Math.abs(velocidad) > 250){
        /* Si el dedo venía rápido, llega antes: la animación sigue a la
           velocidad del gesto en vez de frenarla en seco. */
        seg = Math.min(0.36, Math.max(0.16, Math.abs(destino - y) / Math.abs(velocidad) * 1.8));
      }
      pos = p;
      el.dataset.pos = p;
      fondo.classList.toggle('visible', p === 'abierta');
      fondo.hidden = p === 'cerrada';
      poner(destino, seg);
      bloquearDetras(p === 'abierta');
      $('abrir-hoja').hidden = p !== 'cerrada';
      clearTimeout(fin);
      fin = setTimeout(() => {
        if (pos !== 'cerrada') return;
        el.hidden = true;
        almacen.set({ marcando:false });
        pintarMarcaBorrador(almacen.get());
        if (disparador && disparador.focus) disparador.focus();
      }, seg * 1000 + 80);
    }

    /* Con la hoja abierta, lo de atrás no se alcanza con el teclado ni
       con un lector de pantalla. Baja, el mapa se tiene que poder tocar. */
    function bloquearDetras(si){
      ['contenido', 'cabecera', 'pie'].forEach(id => { const n = $(id); if (n) n.inert = si; });
      const nav = document.querySelector('.secciones.abajo');
      if (nav) nav.inert = si;
      el.setAttribute('aria-modal', si ? 'true' : 'false');
    }

    function abrir(){
      if (pos !== 'cerrada'){ ir('abierta'); return; }
      disparador = document.activeElement;
      el.hidden = false;
      poner(yDe('cerrada'), 0);
      void el.offsetHeight;              // que el navegador tome el punto de partida
      ir('abierta');
      pintarMarcaBorrador(almacen.get());
      setTimeout(() => $('hoja-titulo').focus({ preventScroll:true }), 60);
    }

    agarre.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button')) return;
      agarre.setPointerCapture(e.pointerId);
      clearTimeout(fin);
      const actual = yEnPantalla();
      poner(actual, 0);
      arrastre = { id:e.pointerId, y0:e.clientY, desde:actual, movio:false,
                   rastro:[{ y:e.clientY, t:e.timeStamp }] };
    });
    agarre.addEventListener('pointermove', e => {
      const a = arrastre;
      if (!a || e.pointerId !== a.id) return;
      const dy = e.clientY - a.y0;
      if (!a.movio && Math.abs(dy) < 6) return;
      a.movio = true;
      let nuevo = a.desde + dy;
      if (nuevo < 0) nuevo = -gomita(-nuevo, el.offsetHeight);
      poner(nuevo, 0);
      a.rastro.push({ y:e.clientY, t:e.timeStamp });
      if (a.rastro.length > 8) a.rastro.shift();
    });
    function soltar(e){
      const a = arrastre;
      if (!a || e.pointerId !== a.id) return;
      arrastre = null;
      if (!a.movio){
        /* Un toque en la franja: si estaba baja, sube. Si no, vuelve a
           donde estaba (pudo haberse agarrado a mitad de camino). */
        ir(pos === 'baja' ? 'abierta' : pos);
        return;
      }
      const ult = a.rastro[a.rastro.length - 1];
      const recientes = a.rastro.filter(p => ult.t - p.t <= 100);
      const pri = recientes[0];
      const v = ult.t > pri.t ? (ult.y - pri.y) / (ult.t - pri.t) * 1000 : 0;
      const hacia = y + proyectar(v);
      const opciones = almacen.get().marcando ? ['abierta', 'baja'] : ['abierta', 'baja', 'cerrada'];
      const elegida = opciones.reduce((mejor, p) =>
        Math.abs(yDe(p) - hacia) < Math.abs(yDe(mejor) - hacia) ? p : mejor);
      ir(elegida, v);
    }
    agarre.addEventListener('pointerup', soltar);
    agarre.addEventListener('pointercancel', soltar);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && pos !== 'cerrada') ir('cerrada');
    });
    fondo.addEventListener('click', () => ir('cerrada'));
    $('hoja-cerrar').addEventListener('click', () => ir('cerrada'));
    $('abrir-hoja').addEventListener('click', abrir);

    return { abrir, ir, posicion: () => pos };
  })();


  /* ============================================================
     EL FORMULARIO
     ============================================================ */
  const cambiarBorrador = pedazo =>
    almacen.set(s => ({ borrador: Object.assign({}, s.borrador, pedazo) }));

  function dentroDeLaZona(lat, lng){
    const [[s, o], [n, e]] = ZONA.limites;
    return lat >= s && lat <= n && lng >= o && lng <= e;
  }

  function ponerUbicacion(lat, lng, precision, origen, silencioso){
    if (!dentroDeLaZona(lat, lng)){
      $('ubicacion-estado').textContent =
        'Ese punto queda fuera de La Plata, Berisso y Ensenada. El mapa es solo para esa zona.';
      $('ubicacion-estado').className = 'ubicacion-estado error';
      return false;
    }
    cambiarBorrador({
      lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6,
      precision: precision == null ? null : Math.round(precision), origen
    });
    if (origen === 'mapa' && !silencioso){
      almacen.set({ marcando:false });
    }
    return true;
  }

  $('usar-gps').addEventListener('click', function(){
    const boton = this;
    const estado = $('ubicacion-estado');
    if (!('geolocation' in navigator)){
      estado.textContent = 'Este navegador no da la ubicación. Marcala en el mapa.';
      estado.className = 'ubicacion-estado error';
      return;
    }
    boton.disabled = true;
    estado.textContent = 'Buscando tu ubicación… al aire libre tarda menos.';
    estado.className = 'ubicacion-estado';
    navigator.geolocation.getCurrentPosition(p => {
      boton.disabled = false;
      if (ponerUbicacion(p.coords.latitude, p.coords.longitude, p.coords.accuracy, 'gps') && mapa){
        mapa.setView([p.coords.latitude, p.coords.longitude], Math.max(mapa.getZoom(), 16));
      }
    }, err => {
      boton.disabled = false;
      /* Adentro de Instagram el permiso muchas veces ni se pregunta: por
         eso el mensaje ofrece siempre la otra salida. */
      estado.textContent = err.code === 1
        ? 'No hay permiso para usar tu ubicación. Marcala tocando el mapa.'
        : 'No se pudo encontrar tu ubicación. Probá de nuevo o marcala en el mapa.';
      estado.className = 'ubicacion-estado error';
    }, { enableHighAccuracy:true, timeout:20000, maximumAge:30000 });
  });

  $('marcar-mapa').addEventListener('click', () => {
    if (!mapa) return;
    almacen.set({ marcando:true });
    hoja.ir('baja');
    $('lienzo').scrollIntoView({ block:'start' });
  });
  $('hoja-seguir').addEventListener('click', () => {
    almacen.set({ marcando:false });
    hoja.ir('abierta');
  });

  function pintarMarcando(s){
    $('aviso-marcar').hidden = !s.marcando;
    $('lienzo').classList.toggle('marcando', s.marcando);
    $('hoja-titulo').textContent = s.marcando ? 'Tocá el mapa' : 'Nuevo reporte';
    $('hoja-seguir').hidden = !s.marcando;
    /* Con el punto puesto, la hoja vuelve a subir sola. */
    if (!s.marcando && hoja.posicion() === 'baja') hoja.ir('abierta');
  }

  function dibujarElecciones(){
    $('elegir-capa').innerHTML = CAPAS_RIESGO.map(c => `
      <label class="opcion-capa capa-${c.id}">
        <input type="radio" name="capa" value="${c.id}">
        <span class="pin-chico pin-${c.id}" aria-hidden="true">${c.glifo}</span>
        <span>${esc(c.nombre)}</span>
      </label>`).join('');
    $('elegir-capa').addEventListener('change', ev => {
      if (ev.target.name === 'capa') cambiarBorrador({ capa: ev.target.value, categoria: null });
    });
    $('elegir-categoria').addEventListener('change', ev => {
      if (ev.target.name === 'categoria') cambiarBorrador({ categoria: ev.target.value });
    });
    $('descripcion').addEventListener('input', ev => {
      cambiarBorrador({ descripcion: ev.target.value });
    });
    /* El teclado del celular tapa media hoja: el campo se acomoda arriba. */
    $('descripcion').addEventListener('focus', ev => {
      setTimeout(() => ev.target.scrollIntoView({ block:'center' }), 300);
    });
  }

  let capaDibujada;
  function pintarFormulario(s){
    const b = s.borrador;
    const estado = $('ubicacion-estado');
    /* Un aviso de «falta tal cosa» que sigue ahí después de completarla
       parece un error nuevo. Se vuelve a mostrar al tocar Enviar. */
    $('form-error').hidden = true;
    /* Un error de ubicación no toca el borrador, así que no pasa por
       acá y queda escrito hasta que llega una ubicación buena. */
    if (b.lat != null){
      estado.textContent = b.origen === 'gps'
        ? `Listo: tu ubicación${b.precision ? ` (±${b.precision} m)` : ''}.`
        : 'Listo: el punto que marcaste en el mapa.';
      estado.className = 'ubicacion-estado bien';
    } else if (!/error/.test(estado.className)){
      estado.textContent = 'Todavía sin ubicación.';
      estado.className = 'ubicacion-estado';
    }

    document.querySelectorAll('input[name="capa"]').forEach(i => { i.checked = i.value === b.capa; });

    if (capaDibujada !== b.capa){
      capaDibujada = b.capa;
      const c = capaRiesgo(b.capa);
      $('elegir-categoria').innerHTML = c ? c.categorias.map(cat => `
        <label class="opcion-categoria">
          <input type="radio" name="categoria" value="${esc(cat.id)}">
          <span>${esc(cat.nombre)}</span>
        </label>`).join('') : '';
    }
    document.querySelectorAll('input[name="categoria"]').forEach(i => { i.checked = i.value === b.categoria; });
    /* Con clase y no con `:has(input:checked)`: los webviews de Android
       anteriores a Chrome 105 no lo entienden y no se vería qué se eligió. */
    document.querySelectorAll('.opcion-capa, .opcion-categoria').forEach(l =>
      l.classList.toggle('elegida', l.querySelector('input').checked));

    const campo = $('descripcion');
    if (campo.value !== b.descripcion) campo.value = b.descripcion;
    $('cuenta').textContent = b.descripcion.length;
  }

  $('form-reporte').addEventListener('submit', async ev => {
    ev.preventDefault();
    const b = almacen.get().borrador;
    const error = $('form-error');
    const falta = b.lat == null ? 'Falta la ubicación: usá la tuya o marcala en el mapa.'
                : !b.capa       ? 'Elegí qué tipo de reporte es.'
                : !b.categoria  ? 'Elegí qué es, dentro de ' + capaRiesgo(b.capa).nombre.toLowerCase() + '.'
                : null;
    if (falta){
      error.textContent = falta;
      error.hidden = false;
      error.scrollIntoView({ block:'nearest' });
      return;
    }
    error.hidden = true;

    const item = {
      id: nuevoId(),
      capa: b.capa, categoria: b.categoria,
      lat: b.lat, lng: b.lng, precision_m: b.precision,
      origen_ubicacion: b.origen === 'mapa' ? 'mapa' : 'gps',
      descripcion: b.descripcion.trim().slice(0, 280),
      creado_en_dispositivo: new Date().toISOString(),
      esquema: 1
    };

    const boton = $('enviar');
    boton.disabled = true;
    const seGuardo = await guardado.poner(item);
    almacen.set(s => ({ cola: s.cola.concat(item), borrador: borradorVacio(s.borrador) }));
    /* Que el navegador no borre la cola cuando le falte espacio. */
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch(e){}

    await enviarCola();
    boton.disabled = false;

    const salio = !almacen.get().cola.some(x => x.id === item.id);
    const envio = almacen.get().envio;
    $('listo-titulo').textContent = salio ? 'Enviado' : 'Guardado en tu teléfono';
    $('listo-texto').textContent = salio
      ? 'Lo revisa el equipo y después aparece para todes. Mientras tanto lo ves vos.'
      : !seGuardo
      ? 'Este navegador no deja guardar. No cierres la pantalla hasta que diga «Enviado».'
      : envio === 'falta-sesion'
      ? 'Para enviarlo tenés que entrar con tu cuenta desde Mi perfil. Queda guardado hasta entonces.'
      : 'No hay señal. Se manda solo cuando vuelva: no hace falta que hagas nada.';
    $('form-reporte').hidden = true;
    $('hoja-listo').hidden = false;
    $('hoja-listo').focus({ preventScroll:true });
  });

  function volverAlFormulario(){
    $('hoja-listo').hidden = true;
    $('form-reporte').hidden = false;
  }
  $('otro-reporte').addEventListener('click', () => { volverAlFormulario(); $('hoja-titulo').focus(); });
  $('listo-cerrar').addEventListener('click', () => { hoja.ir('cerrada'); setTimeout(volverAlFormulario, 400); });


  /* ============================================================
     ARRANQUE
     ============================================================ */
  dibujarInterruptores();
  dibujarElecciones();
  pintarFormulario(almacen.get());
  pintarEstado(almacen.get());

  guardado.leerCola().then(cola => {
    almacen.set({ cola });
    enviarCola();
  });
  traerReportes();
  armarMapa();

})();
