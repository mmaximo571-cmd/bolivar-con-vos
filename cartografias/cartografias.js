/* ============================================================
   CARTOGRAFÍAS SOCIALES  ·  la lógica de `cartografias/`

   Dos vistas en una pantalla: la lista (las tuyas, sumarte con un
   código, crear una) y una cartografía abierta (el mapa, dibujar, la
   leyenda, el grupo). Cuál se ve lo dice la dirección; ver el
   comentario de `index.html`.

   Todo pide cuenta: las cartografías son de cada grupo y la base no le
   muestra nada a quien no está adentro (`sql/tabla-cartografias.sql`).

   Las partes, en orden: 1 arrancar, 2 la lista, 3 una abierta (el
   código, la leyenda, las referencias propias, el grupo), 4 el mapa,
   5 dibujar y corregir, 6 la ficha, 7 la información de base,
   8 bajar el mapa. La tanda 2 (18/11/2026) sumó corregir, el grupo
   con apodos, la información de base y bajar.

   Lo que todavía NO hace (tanda 3 de la propuesta 5 de
   `docs/PROPUESTAS.md`): dibujar sin señal, ver en vivo lo que dibuja
   el resto (por ahora, «Actualizar» y al volver a la pantalla) y
   publicar una cartografía.
   ============================================================ */
(function cartografiasSociales(){

  /* La misma zona que el mapa de riesgo. `limites` es lo que se deja
     mirar; `acepta` es lo que acepta la base, ni un metro más
     (`cartografia_geometria_valida`): si se cambia uno, el otro. */
  const ZONA = {
    centro:  [-34.885, -57.925],
    zoom:    12,
    limites: [[-35.25, -58.20], [-34.76, -57.72]],
    acepta:  { latMin:-35.25, latMax:-34.70, lngMin:-58.30, lngMax:-57.60 }
  };
  const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
  const PENDIENTE = 'bolivar-carto-codigo-pendiente';
  const TIPOS = { punto:'Lugar', linea:'Recorrido', zona:'Zona' };

  const $ = id => document.getElementById(id);

  $('cabecera').innerHTML = htmlCabecera();
  $('pie').innerHTML = htmlPie();
  pintarNav('cartografias');

  const params = new URLSearchParams(location.search);
  let yo = null;

  arrancar();


  /* ============================================================
     1. ARRANCAR
     ============================================================ */
  async function arrancar(){
    // Sin cliente de datos, app.js ya puso su cartel.
    if (!db || !('auth' in db)) return;

    let sesion;
    try { sesion = await conPaciencia(sesionActual()); }
    catch(e){ mostrarError($('carto-aviso'), e, 'ver si entraste con tu cuenta'); return; }
    yo = sesion.usuario;

    const codigoDelLink = limpiarCodigo(params.get('sumarme'));

    if (!yo){
      /* El link compartido llega muchas veces a alguien sin sesión. El
         código se guarda y aparece escrito cuando vuelva con cuenta:
         que no tenga que pedirlo de nuevo por WhatsApp. */
      if (codigoDelLink) guardarPendiente(codigoDelLink);
      $('carto-aviso').innerHTML = `
        <div class="vacio">
          <span class="vacio-icono" aria-hidden="true">🗺</span>
          <p class="vacio-titulo">Entrá con tu cuenta</p>
          <p>Cada cartografía es de su grupo y solo la ve quien está adentro.
             Entrá desde <a href="../mi/">Mi perfil</a> y volvé${codigoDelLink
               ? ': tu código va a estar esperándote' : ''}.</p>
        </div>`;
      return;
    }

    if (codigoDelLink){
      const r = await sumarmeCon(codigoDelLink);
      if (r.id){ history.replaceState(null, '', '?c=' + r.id); return abrir(r.id); }
      guardarPendiente(codigoDelLink);
      history.replaceState(null, '', location.pathname);
      mostrarLista();
      mostrarFallo('sumarme-error', r.texto);
      return;
    }

    const c = params.get('c');
    if (c && /^[0-9a-f-]{36}$/i.test(c)) abrir(c);
    else mostrarLista();
  }

  function limpiarCodigo(t){
    return String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  function guardarPendiente(c){ try { localStorage.setItem(PENDIENTE, c); } catch(e){} }
  function leerPendiente(){ try { return localStorage.getItem(PENDIENTE) || ''; } catch(e){ return ''; } }
  function borrarPendiente(){ try { localStorage.removeItem(PENDIENTE); } catch(e){} }

  /* Los errores propios de esta pantalla, antes que los de siempre. */
  function faltaElSQL(error){
    const c = String((error && error.code) || '');
    const m = String((error && error.message) || '');
    return ['PGRST205', 'PGRST202', '42P01', '42883'].includes(c)
      || /schema cache|does not exist/i.test(m);
  }
  function textoDelError(error){
    const m = String((error && error.message) || '');
    if (faltaElSQL(error))
      return 'Falta preparar la base: hay que correr sql/tabla-cartografias.sql en Supabase. Avisale al equipo.';
    if (/demasiados intentos/.test(m))
      return 'Probaste muchos códigos seguidos. Esperá una hora y volvé a intentar.';
    if (/demasiadas cartografias/.test(m))
      return 'Ya coordinás diez cartografías, que es el máximo. Borrá alguna que no uses.';
    if (/demasiados elementos/.test(m))
      return 'Se dibujó mucho en poco tiempo. Esperá unos minutos y volvé a guardar.';
    if (/geometria_ok/.test(m))
      return 'El dibujo tiene que quedar dentro de La Plata, Berisso o Ensenada.';
    if (/tiene que quedar alguien coordinando/.test(m))
      return 'Tiene que quedar al menos una persona coordinando. Primero nombrá a otra.';
    if (/solo quien coordina/.test(m))
      return 'Eso lo puede hacer solo quien coordina.';
    if (/row-level security/.test(m))
      return 'No tenés permiso para esto. Puede que ya no seas parte del grupo.';
    return errorEnCastellano(error);
  }
  function mostrarFallo(id, texto){
    const caja = $(id);
    caja.textContent = texto;
    caja.hidden = !texto;
  }
  async function pedir(promesa){
    try { return await conPaciencia(promesa, 15); }
    catch(e){ return { error: e }; }
  }


  /* ============================================================
     2. LA LISTA
     ============================================================ */
  async function mostrarLista(){
    $('vista-lista').hidden = false;
    dibujarPlano();
    const pendiente = leerPendiente();
    if (pendiente && !$('codigo').value) $('codigo').value = pendiente;

    const lista = $('mias-lista');
    lista.innerHTML = '<li class="carto-cargando">Buscando tus cartografías…</li>';

    const r = await pedir(db.from('cartografia_miembros')
      .select('rol, cartografias(id, nombre, descripcion)')
      .eq('usuario', yo.id));

    if (r.error){
      lista.innerHTML = '';
      if (faltaElSQL(r.error))
        $('carto-aviso').innerHTML = `<div class="aviso error">${esc(textoDelError(r.error))}</div>`;
      else mostrarError($('carto-aviso'), r.error, 'traer tus cartografías');
      return;
    }

    const filas = (r.data || []).filter(f => f.cartografias)
      .sort((a, b) => a.cartografias.nombre.localeCompare(b.cartografias.nombre, 'es'));

    if (!filas.length){
      lista.innerHTML = `
        <li class="carto-empezar">
          <p class="carto-empezar-titulo">Todavía no estás en ninguna</p>
          <ol class="carto-pasos">
            <li><strong>Creá una</strong> con el nombre del barrio o del taller.</li>
            <li><strong>Pasale el código</strong> a tu grupo.</li>
            <li><strong>Dibujen juntes</strong> lugares, recorridos y zonas.</li>
          </ol>
          <p class="carto-empezar-pie">¿Te pasaron un código? Escribilo acá abajo.</p>
        </li>`;
      return;
    }

    lista.innerHTML = filas.map(f => {
      const c = f.cartografias;
      return `<li><a class="carto-tarjeta" href="?c=${encodeURIComponent(c.id)}">
        <span class="carto-tarjeta-nombre">${esc(c.nombre)}</span>
        ${c.descripcion ? `<span class="carto-tarjeta-desc">${esc(c.descripcion)}</span>` : ''}
        <span class="carto-rol">${f.rol === 'coordina' ? 'Coordinás' : 'Participás'}</span>
      </a></li>`;
    }).join('');
  }

  async function sumarmeCon(codigo){
    if (codigo.length !== 6)
      return { texto: 'El código tiene seis letras y números, como K7RM2Q.' };
    const r = await pedir(db.rpc('sumarme_a_cartografia', { p_codigo: codigo }));
    if (r.error) return { texto: textoDelError(r.error) };
    if (!r.data)
      return { texto: 'No encontramos ninguna cartografía con ese código. Fijate que esté bien escrito.' };
    borrarPendiente();
    if (typeof anotarHito === 'function') anotarHito('se sumó a una cartografía');
    return { id: r.data };
  }

  $('form-sumarme').addEventListener('submit', async ev => {
    ev.preventDefault();
    const boton = $('sumarme-enviar');
    mostrarFallo('sumarme-error', '');
    boton.disabled = true;
    const r = await sumarmeCon(limpiarCodigo($('codigo').value));
    boton.disabled = false;
    if (r.id) location.href = '?c=' + encodeURIComponent(r.id);
    else mostrarFallo('sumarme-error', r.texto);
  });

  $('form-crear').addEventListener('submit', async ev => {
    ev.preventDefault();
    const nombre = $('crear-nombre').value.trim();
    mostrarFallo('crear-error', '');
    if (nombre.length < 3){
      mostrarFallo('crear-error', 'Ponele un nombre de tres letras o más: el barrio, el taller, la materia.');
      $('crear-nombre').focus();
      return;
    }
    const boton = $('crear-enviar');
    boton.disabled = true;
    const r = await pedir(db.rpc('crear_cartografia', {
      p_nombre: nombre, p_descripcion: $('crear-descripcion').value.trim()
    }));
    boton.disabled = false;
    const fila = r.data && (Array.isArray(r.data) ? r.data[0] : r.data);
    if (r.error || !fila){ mostrarFallo('crear-error', textoDelError(r.error)); return; }
    if (typeof anotarHito === 'function') anotarHito('creó una cartografía');
    location.href = '?c=' + encodeURIComponent(fila.id);
  });


  /* ============================================================
     EL PLANO DE LA PORTADA

     El casco de La Plata como lo reconoce cualquiera que vive acá: el
     cuadrado girado, las avenidas cada seis cuadras con su plaza en el
     cruce, las dos diagonales de punta a punta y el rombo de las otras,
     el Bosque del lado del río, y el río con Berisso y Ensenada. Es un
     dibujo, no un mapa: las proporciones están simplificadas.

     Encima, las ocho referencias fijas pegadas como figuritas. Salen de
     `REFERENCIAS_FIJAS`: si cambia la lista, cambia el plano.
     ============================================================ */
  const ANCHO = 360, ALTO = 230;
  // Dónde se pega cada figurita (en las coordenadas del dibujo).
  const LUGARES = [[118, 98], [178, 104], [150, 150], [94, 150],
                   [214, 150], [292, 128], [130, 196], [200, 70]];

  function dibujarPlano(){
    const caja = $('plano');
    if (!caja || caja.childElementCount) return;

    const L2 = 65;                     // medio lado del casco
    const paso = (2 * L2) / 12;        // 12 franjas de 3 cuadras
    let calles = '', plazas = '';
    for (let i = 1; i < 12; i++){
      const p = (-L2 + i * paso).toFixed(1);
      const avenida = i % 2 === 0;     // cada 6 cuadras, una avenida
      const clase = avenida ? 'pl-avenida' : 'pl-calle';
      calles += `<line class="${clase}" x1="${p}" y1="${-L2}" x2="${p}" y2="${L2}"/>` +
                `<line class="${clase}" x1="${-L2}" y1="${p}" x2="${L2}" y2="${p}"/>`;
      if (avenida) for (let j = 2; j < 12; j += 2)
        plazas += `<rect class="pl-plaza" x="${(+p - 2.2).toFixed(1)}" y="${(-L2 + j * paso - 2.2).toFixed(1)}" width="4.4" height="4.4"/>`;
    }

    const svg = `
      <svg viewBox="0 0 ${ANCHO} ${ALTO}" class="pl-dibujo" focusable="false">
        <path class="pl-rio" d="M176 0 C 232 34 292 70 360 84 L360 0 Z"/>
        <path class="pl-costa" d="M176 0 C 232 34 292 70 360 84"/>
        <path class="pl-ola" d="M262 22 q8 -5 16 0 t16 0"/>
        <path class="pl-ola" d="M314 44 q8 -5 16 0 t16 0"/>
        <text class="pl-rotulo pl-rotulo-rio" x="300" y="16">Río de la Plata</text>
        <g transform="translate(150 125) rotate(45)">
          <rect class="pl-casco" x="${-L2}" y="${-L2}" width="${2 * L2}" height="${2 * L2}"/>
          <rect class="pl-bosque" x="-4" y="${-L2 + 1}" width="34" height="${(paso * 1.6).toFixed(1)}"/>
          ${calles}
          <polygon class="pl-rombo" points="0,${-L2} ${L2},0 0,${L2} ${-L2},0"/>
          <line class="pl-diagonal" x1="${-L2}" y1="${-L2}" x2="${L2}" y2="${L2}"/>
          <line class="pl-diagonal" x1="${L2}" y1="${-L2}" x2="${-L2}" y2="${L2}"/>
          ${plazas}
          <rect class="pl-borde" x="${-L2}" y="${-L2}" width="${2 * L2}" height="${2 * L2}"/>
        </g>
        <text class="pl-rotulo" x="232" y="86">Ensenada</text>
        <text class="pl-rotulo" x="290" y="152">Berisso</text>
        <text class="pl-rotulo pl-rotulo-lp" x="20" y="210">La Plata</text>
      </svg>`;

    const figuritas = REFERENCIAS_FIJAS.map((r, i) => {
      const [x, y] = LUGARES[i % LUGARES.length];
      return `<span class="carto-figurita" style="left:${(x / ANCHO * 100).toFixed(2)}%;top:${(y / ALTO * 100).toFixed(2)}%;--i:${i}">
        <span class="carto-pin" style="--ref:${r.color}"><span>${r.glifo}</span></span></span>`;
    }).join('');

    caja.innerHTML = svg + figuritas;
  }


  /* ============================================================
     3. UNA CARTOGRAFÍA ABIERTA
     ============================================================ */
  const estado = {
    carto: null, rol: null, miembros: 0,
    lista: [],                // los miembros, en el orden en que se sumaron
    conApodos: true,          // false si la base todavía no tiene la tanda 2
    propias: [], elementos: [],
    ocultas: new Set(),       // referencias apagadas en el mapa
    traidoEn: 0
  };

  async function abrir(id){
    $('carto-titulo').textContent = 'Abriendo…';
    $('carto-bajada').textContent = '';

    const [c, listo] = await Promise.all([
      pedir(db.from('cartografias').select('id, nombre, descripcion, codigo').eq('id', id).maybeSingle()),
      traerLoDeAdentro(id)
    ]);

    if (c.error || !c.data){
      $('carto-titulo').innerHTML = 'Cartografías <em>sociales</em>';
      if (c.error && !faltaElSQL(c.error)) mostrarError($('carto-aviso'), c.error, 'abrir la cartografía');
      else $('carto-aviso').innerHTML = `<div class="aviso error">${esc(c.error
        ? textoDelError(c.error)
        : 'No encontramos esta cartografía, o ya no sos parte del grupo.')}
        <br><a href="./">Ver tus cartografías</a></div>`;
      return;
    }
    estado.carto = c.data;
    if (!listo) return;

    document.title = estado.carto.nombre + ' · Cartografías sociales';
    $('carto-titulo').textContent = estado.carto.nombre;
    $('carto-bajada').textContent = estado.carto.descripcion || '';
    $('vista-mapa').hidden = false;

    pintarCompartir();
    pintarLeyenda();
    pintarGrupo();
    armarFormReferencia();
    armarListaBase();
    armarMapa();
  }

  /* Miembros, referencias propias y lo dibujado. Se usa al abrir y en
     «Actualizar». Devuelve false si algo falló (y ya lo avisó). */
  async function traerLoDeAdentro(id){
    /* Sin la tanda 2 de la base todavía no existe `apodo` (error 42703):
       se sigue sin apodos y sin manejar el grupo, como en la tanda 1. */
    const traerMiembros = async () => {
      const r = await pedir(db.from('cartografia_miembros')
        .select('usuario, rol, apodo, sumado_at').eq('cartografia', id).order('sumado_at'));
      if (!r.error || r.error.code !== '42703') return r;
      const viejo = await pedir(db.from('cartografia_miembros')
        .select('usuario, rol, sumado_at').eq('cartografia', id).order('sumado_at'));
      viejo.sinApodos = true;
      return viejo;
    };
    const [m, ref, el] = await Promise.all([
      traerMiembros(),
      pedir(db.from('cartografia_referencias').select('id, nombre, color').eq('cartografia', id).order('creada_at')),
      pedir(db.from('cartografia_elementos')
        .select('id, autor, referencia, tipo, geometria, titulo, relato, creado_en_dispositivo, editado_at')
        .eq('cartografia', id).order('creado_en_dispositivo'))
    ]);
    const fallo = m.error || ref.error || el.error;
    if (fallo){
      if (faltaElSQL(fallo))
        $('carto-aviso').innerHTML = `<div class="aviso error">${esc(textoDelError(fallo))}</div>`;
      else mostrarError($('carto-aviso'), fallo, 'traer lo dibujado');
      return false;
    }
    $('carto-aviso').innerHTML = '';
    const mio = (m.data || []).find(x => x.usuario === yo.id);
    estado.rol = mio ? mio.rol : null;
    estado.miembros = (m.data || []).length;
    estado.lista = m.data || [];
    estado.conApodos = !m.sinApodos;
    // Un color que no sea un color no llega nunca al estilo en línea.
    estado.propias = (ref.data || []).filter(r => /^#[0-9a-f]{6}$/i.test(r.color));
    estado.elementos = (el.data || []).filter(geometriaUsable);
    estado.traidoEn = Date.now();
    return true;
  }

  function geometriaUsable(e){
    const g = e.geometria;
    return g && Array.isArray(g.coordinates) && (
      (e.tipo === 'punto' && g.coordinates.length === 2) ||
      (e.tipo === 'linea' && g.coordinates.length >= 2) ||
      (e.tipo === 'zona'  && Array.isArray(g.coordinates[0]) && g.coordinates[0].length >= 4));
  }

  async function actualizar(){
    if (!estado.carto) return;
    const boton = $('actualizar');
    boton.disabled = true;
    const ok = await traerLoDeAdentro(estado.carto.id);
    boton.disabled = false;
    if (!ok) return;
    if (!estado.rol){ location.href = './'; return; }
    pintarLeyenda();
    pintarGrupo();
    armarFormReferencia();
    pintarElementos();
    const abierta = $('panel-ficha').dataset.id;
    if (abierta) estado.elementos.some(e => e.id === abierta) ? abrirFicha(abierta) : cerrarFicha();
  }
  $('actualizar').addEventListener('click', actualizar);

  /* Lo que dibujó el resto mientras esta pestaña estaba atrás. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && estado.carto && !dibujo.modo && !dibujo.listo
        && Date.now() - estado.traidoEn > 60000) actualizar();
  });


  /* ---------- compartir el código ---------- */
  function pintarCompartir(){
    const c = estado.carto;
    const link = location.origin + location.pathname + '?sumarme=' + c.codigo;
    const texto = `Sumate a la cartografía «${c.nombre}» en La Bolívar con vos (código ${c.codigo})`;
    $('carto-codigo').textContent = c.codigo;
    /* El menú de compartir del teléfono deja elegir WhatsApp, Telegram o
       el mail del grupo. Donde no existe (casi toda compu), WhatsApp. Si
       la persona lo cierra sin elegir, no pasa nada: no es un error. */
    $('invitar').onclick = async () => {
      if (navigator.share){
        try { await navigator.share({ title: c.nombre, text: texto, url: link }); }
        catch(e){}
        return;
      }
      window.open('https://wa.me/?text=' + encodeURIComponent(texto + ': ' + link), '_blank', 'noopener');
    };
    $('copiar-link').onclick = async () => {
      const boton = $('copiar-link');
      try { await navigator.clipboard.writeText(link); boton.textContent = 'Copiado'; }
      catch(e){ window.prompt('Copiá el link:', link); return; }
      setTimeout(() => { boton.textContent = 'Copiar el link'; }, 2000);
    };
    $('carto-compartir').hidden = false;
  }


  /* ---------- la leyenda ---------- */
  function muestra(ref){
    return `<span class="carto-muestra" style="--ref:${ref.color}" aria-hidden="true">${esc(ref.glifo)}</span>`;
  }

  function pintarLeyenda(){
    const refs = todasLasReferencias(estado.propias);
    const cuenta = {};
    estado.elementos.forEach(e => { cuenta[e.referencia] = (cuenta[e.referencia] || 0) + 1; });
    $('leyenda').innerHTML = refs.map(r => {
      const n = cuenta[r.id] || 0;
      const prendida = !estado.ocultas.has(r.id);
      return `<li><button type="button" class="carto-ref" data-ref="${esc(r.id)}" aria-pressed="${prendida}">
        ${muestra(r)}
        <span class="carto-ref-nombre">${esc(r.nombre)}${r.propia ? ' <span class="carto-propia">del grupo</span>' : ''}
          ${r.ejemplo ? `<small>${esc(r.ejemplo)}</small>` : ''}</span>
        <span class="carto-ref-n" aria-label="${n} en el mapa">${n}</span>
      </button></li>`;
    }).join('');
  }

  $('leyenda').addEventListener('click', ev => {
    const b = ev.target.closest('.carto-ref');
    if (!b) return;
    const id = b.dataset.ref;
    if (estado.ocultas.has(id)) estado.ocultas.delete(id); else estado.ocultas.add(id);
    b.setAttribute('aria-pressed', String(!estado.ocultas.has(id)));
    pintarElementos();
  });


  /* ---------- las referencias propias (solo quien coordina) ---------- */
  function armarFormReferencia(){
    const form = $('form-referencia');
    form.hidden = estado.rol !== 'coordina';
    if (form.hidden || $('ref-colores').childElementCount) return;
    $('ref-colores').innerHTML = COLORES_PROPIOS.map((c, i) => `
      <label class="carto-color" style="--ref:${c}">
        <input type="radio" name="ref-color" value="${c}" ${i === 0 ? 'checked' : ''}>
        <span class="solo-lectores">Color ${i + 1}</span>
      </label>`).join('');
  }

  $('form-referencia').addEventListener('submit', async ev => {
    ev.preventDefault();
    mostrarFallo('referencia-error', '');
    const nombre = $('ref-nombre').value.trim();
    const elegido = document.querySelector('input[name="ref-color"]:checked');
    if (nombre.length < 2){
      mostrarFallo('referencia-error', 'Ponele un nombre de dos letras o más.');
      $('ref-nombre').focus();
      return;
    }
    const repetida = todasLasReferencias(estado.propias)
      .some(r => r.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetida){ mostrarFallo('referencia-error', 'Ya hay una referencia con ese nombre.'); return; }

    const boton = $('referencia-guardar');
    boton.disabled = true;
    const r = await pedir(db.from('cartografia_referencias')
      .insert({ cartografia: estado.carto.id, nombre, color: elegido ? elegido.value : COLORES_PROPIOS[0] })
      .select('id, nombre, color').single());
    boton.disabled = false;
    if (r.error){
      /* El tope de veinte lo pone la política: llega como «sin permiso». */
      mostrarFallo('referencia-error', estado.propias.length >= 20
        ? 'Llegaron a veinte referencias propias, que es el máximo.'
        : textoDelError(r.error));
      return;
    }
    estado.propias.push(r.data);
    $('ref-nombre').value = '';
    pintarLeyenda();
    if (dibujo.listo) pintarElegirReferencia();
  });


  /* ---------- el grupo ---------- */

  /* Cómo ve el grupo a cada quien: su apodo, o «Participante N» por el
     orden en que se sumó. El nombre de la cuenta no se pide nunca: la
     tabla `perfiles` sigue siendo de cada quien y del equipo. */
  function etiquetaDe(usuario){
    const i = estado.lista.findIndex(m => m.usuario === usuario);
    if (i === -1) return 'Alguien que ya no está en el grupo';
    const apodo = (estado.lista[i].apodo || '').trim();
    return apodo || 'Participante ' + (i + 1);
  }

  function pintarGrupo(){
    const n = estado.miembros;
    const coordina = estado.rol === 'coordina';
    const coordinadores = estado.lista.filter(m => m.rol === 'coordina').length;
    const maneja = coordina && estado.conApodos;

    $('carto-ceja').textContent =
      (coordina ? 'La coordinás' : 'Participás') + ' · ' +
      (n === 1 ? '1 persona' : n + ' personas');
    $('grupo-texto').textContent = coordina
      ? 'La coordinás: podés sumar referencias, borrar lo que no va y decidir quién está.'
      : 'Podés dibujar, y corregir o borrar lo tuyo.';

    $('form-apodo').hidden = !estado.conApodos;
    if (estado.conApodos && document.activeElement !== $('apodo'))
      $('apodo').value = (estado.lista.find(m => m.usuario === yo.id) || {}).apodo || '';

    $('miembros').innerHTML = estado.lista.map(m => {
      const vos = m.usuario === yo.id;
      const acciones = [];
      const boton = (accion, texto) =>
        `<button type="button" class="boton texto" data-miembro="${accion}" data-usuario="${esc(m.usuario)}">${texto}</button>`;
      if (maneja){
        if (m.rol === 'participa'){
          acciones.push(boton('coordinar', 'Que coordine'));
          acciones.push(boton('sacar', 'Sacar del grupo'));
        } else if (coordinadores > 1){
          acciones.push(boton('participar', vos ? 'Dejar de coordinar' : 'Quitarle la coordinación'));
        }
      }
      return `<li class="carto-miembro">
        <span class="carto-miembro-nombre">${esc(etiquetaDe(m.usuario))}${vos ? ' <span class="carto-vos">vos</span>' : ''}</span>
        ${m.rol === 'coordina' ? '<span class="carto-rol">Coordina</span>' : ''}
        ${acciones.length ? `<span class="carto-miembro-acciones">${acciones.join('')}</span>` : ''}
      </li>`;
    }).join('');

    $('cambiar-codigo').hidden = !maneja;
    // Quien coordina se puede ir solo si queda otra persona coordinando.
    $('salir').hidden = coordina && coordinadores < 2;
    $('borrar-carto').hidden = !coordina;
  }

  $('form-apodo').addEventListener('submit', async ev => {
    ev.preventDefault();
    mostrarFallo('apodo-error', '');
    const apodo = $('apodo').value.trim().slice(0, 40);
    const boton = $('apodo-guardar');
    boton.disabled = true;
    const r = await pedir(db.from('cartografia_miembros').update({ apodo: apodo || null })
      .eq('cartografia', estado.carto.id).eq('usuario', yo.id).select('apodo'));
    boton.disabled = false;
    if (r.error || !r.data || !r.data.length){
      mostrarFallo('apodo-error', r.error ? textoDelError(r.error) : 'No se pudo guardar. Tocá «Actualizar» y probá de nuevo.');
      return;
    }
    const yoEnLista = estado.lista.find(m => m.usuario === yo.id);
    if (yoEnLista) yoEnLista.apodo = apodo || null;
    pintarGrupo();
    boton.textContent = 'Guardado';
    setTimeout(() => { boton.textContent = 'Guardar'; }, 2000);
  });

  $('miembros').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-miembro]');
    if (!b) return;
    const usuario = b.dataset.usuario, accion = b.dataset.miembro;
    const quien = etiquetaDe(usuario);
    const pregunta = {
      coordinar: `¿Que «${quien}» también coordine? Va a poder sumar referencias, borrar cualquier cosa y decidir quién está.`,
      participar: usuario === yo.id
        ? '¿Dejar de coordinar? Seguís en el grupo y podés dibujar.'
        : `¿Quitarle la coordinación a «${quien}»? Sigue en el grupo.`,
      sacar: `¿Sacar a «${quien}» del grupo? Lo que dibujó queda en el mapa. Para volver va a necesitar el código.`
    }[accion];
    if (!pregunta || !window.confirm(pregunta)) return;

    mostrarFallo('grupo-error', '');
    b.disabled = true;
    const r = accion === 'sacar'
      ? await pedir(db.from('cartografia_miembros').delete()
          .eq('cartografia', estado.carto.id).eq('usuario', usuario).select('usuario'))
      : await pedir(db.rpc('cartografia_cambiar_rol', {
          p_cartografia: estado.carto.id, p_usuario: usuario,
          p_rol: accion === 'coordinar' ? 'coordina' : 'participa' }));
    b.disabled = false;
    if (r.error || (accion === 'sacar' && (!r.data || !r.data.length))){
      mostrarFallo('grupo-error', r.error ? textoDelError(r.error) : 'No se pudo. Tocá «Actualizar» y probá de nuevo.');
      return;
    }
    actualizar();
  });

  $('cambiar-codigo').addEventListener('click', async () => {
    if (!window.confirm('¿Cambiar el código? El de ahora deja de andar en el momento, también el link. Quien ya está en el grupo sigue adentro.')) return;
    mostrarFallo('grupo-error', '');
    const boton = $('cambiar-codigo');
    boton.disabled = true;
    const r = await pedir(db.rpc('cartografia_cambiar_codigo', { p_cartografia: estado.carto.id }));
    boton.disabled = false;
    if (r.error || !r.data){ mostrarFallo('grupo-error', textoDelError(r.error)); return; }
    estado.carto.codigo = r.data;
    pintarCompartir();
    $('carto-compartir').scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  $('salir').addEventListener('click', async () => {
    const c = estado.carto;
    if (!window.confirm(`¿Salir de «${c.nombre}»? Lo que dibujaste queda en el mapa del grupo. Para volver vas a necesitar el código.`)) return;
    const boton = $('salir');
    boton.disabled = true;
    const r = await pedir(db.from('cartografia_miembros').delete()
      .eq('cartografia', c.id).eq('usuario', yo.id).select('usuario'));
    boton.disabled = false;
    if (r.error || !r.data || !r.data.length){
      mostrarFallo('grupo-error', r.error ? textoDelError(r.error) : 'No se pudo. Si coordinás, primero nombrá a otra persona.');
      return;
    }
    location.href = './';
  });

  $('borrar-carto').addEventListener('click', async () => {
    const c = estado.carto;
    if (!window.confirm(`¿Borrar «${c.nombre}» para todo el grupo? Se pierde todo lo dibujado (${estado.elementos.length}). No se puede deshacer.`)) return;
    const boton = $('borrar-carto');
    boton.disabled = true;
    const r = await pedir(db.from('cartografias').delete().eq('id', c.id).select('id'));
    boton.disabled = false;
    if (r.error || !r.data || !r.data.length){
      mostrarFallo('grupo-error', r.error ? textoDelError(r.error) : 'No se pudo. Probá de nuevo en un rato.');
      return;
    }
    location.href = './';
  });


  /* ============================================================
     4. EL MAPA

     Leaflet se pide al abrir, como en `mapa/`, y lo guarda el service
     worker (la regla de Leaflet en `sw.js`). Sin él la pantalla sigue:
     la leyenda y el grupo se ven, pero no se puede dibujar.
     ============================================================ */
  let mapa = null, capaElementos = null, capaDibujo = null;
  const capaDe = {};            // id del elemento -> su capa de Leaflet

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

  async function armarMapa(){
    try { await cargarLeaflet(); }
    catch(e){
      const aviso = $('mapa-sin');
      aviso.textContent = 'El mapa necesita señal la primera vez. Volvé a abrir la pantalla cuando haya.';
      aviso.hidden = false;
      $('lienzo').classList.add('vacio-mapa');
      document.querySelectorAll('.carto-herramienta').forEach(b => { b.disabled = true; });
      $('bajar-imagen').disabled = true;
      pintarListaBase();
      return;
    }

    mapa = L.map('lienzo', {
      center: ZONA.centro, zoom: ZONA.zoom, minZoom: 10,
      maxBounds: L.latLngBounds(ZONA.limites).pad(0.15), maxBoundsViscosity: 0.8
    });
    const fondo = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    let avisoAzulejos = false;
    fondo.on('tileerror', () => {
      if (avisoAzulejos) return;
      avisoAzulejos = true;
      $('mapa-sin').textContent = 'Sin señal no se ven las calles, pero lo dibujado sí.';
      $('mapa-sin').hidden = false;
    });
    fondo.on('load', () => { if (avisoAzulejos) $('mapa-sin').hidden = true; avisoAzulejos = false; });

    /* La información de base va en su propio plano, DEBAJO de lo del
       grupo (que va en el de siempre, 400): lo dibujado nunca queda
       tapado. En canvas y no en SVG: RENABAP son cientos de polígonos. */
    mapa.createPane('base').style.zIndex = 350;
    lienzoBase = L.canvas({ pane: 'base', tolerance: 8 });

    capaElementos = L.layerGroup().addTo(mapa);
    capaDibujo = L.layerGroup().addTo(mapa);
    mapa.on('click', e => alTocarMapa(e.latlng));

    pintarElementos();
    encuadrar();
    aplicarBase();
  }

  /* La primera vista: todo lo dibujado, o la zona entera si no hay nada. */
  function encuadrar(){
    const capas = Object.values(capaDe);
    if (!capas.length) return;
    const limites = L.featureGroup(capas).getBounds();
    if (limites.isValid()) mapa.fitBounds(limites.pad(0.2), { maxZoom: 16 });
  }

  const aLeaflet = ([lng, lat]) => [lat, lng];   // GeoJSON va al revés

  function iconoDe(ref, clase){
    return L.divIcon({
      className: 'carto-pin-envoltura',
      html: `<span class="carto-pin ${clase || ''}" style="--ref:${ref.color}"><span>${esc(ref.glifo)}</span></span>`,
      iconSize: [40, 40], iconAnchor: [20, 38]
    });
  }

  function pintarElementos(){
    if (!mapa) return;
    capaElementos.clearLayers();
    Object.keys(capaDe).forEach(k => delete capaDe[k]);
    const refs = todasLasReferencias(estado.propias);

    /* Las zonas primero, las líneas después: una calle que cruza un
       barrio se tiene que poder tocar. Los lugares van solos arriba
       (son marcadores, en su propio plano). */
    const orden = { zona: 0, linea: 1, punto: 2 };
    estado.elementos.slice().sort((a, b) => orden[a.tipo] - orden[b.tipo]).forEach(e => {
      if (estado.ocultas.has(e.referencia)) return;
      if (dibujo.editando && dibujo.editando.id === e.id) return;
      const ref = buscarReferencia(refs, e.referencia);
      let capa;
      if (e.tipo === 'punto'){
        capa = L.marker(aLeaflet(e.geometria.coordinates), {
          icon: iconoDe(ref), title: e.titulo, keyboard: true, riseOnHover: true });
      } else if (e.tipo === 'linea'){
        capa = L.polyline(e.geometria.coordinates.map(aLeaflet), {
          color: ref.color, weight: 5, opacity: .9, lineCap: 'round', lineJoin: 'round' });
      } else {
        capa = L.polygon(e.geometria.coordinates[0].slice(0, -1).map(aLeaflet), {
          color: ref.color, weight: 2.5, fillColor: ref.color, fillOpacity: .22 });
      }
      /* Mientras se dibuja, tocar algo ya dibujado es tocar el mapa: si
         no, no se podría marcar un lugar adentro de una zona. */
      capa.on('click', ev => {
        L.DomEvent.stopPropagation(ev);
        if (dibujo.modo) alTocarMapa(ev.latlng);
        else if (!dibujo.listo) abrirFicha(e.id);
      });
      capaDe[e.id] = capa;
      capaElementos.addLayer(capa);
    });
  }


  /* ============================================================
     5. DIBUJAR Y CORREGIR

     A dedo y sin librerías: cada toque en el mapa es un punto nuevo, y
     cada punto se puede arrastrar para corregirlo. Un lugar es un punto;
     un recorrido, dos o más; una zona, tres o más, y se cierra sola (o
     tocando el primero). Arrastrar el mapa sigue moviendo el mapa:
     Leaflet distingue el toque del arrastre.

     Corregir es el mismo camino con lo ya dibujado cargado: la forma con
     sus puntos para mover, y después el formulario con lo que decía.
     ============================================================ */
  const dibujo = {
    modo: null,         // 'punto' | 'linea' | 'zona' mientras se dibuja
    vertices: [],
    listo: false,       // { tipo } cuando ya se terminó y falta el formulario
    editando: null      // { id, referencia, titulo, relato } al corregir
  };
  let capaForma = null;

  document.querySelectorAll('.carto-herramienta').forEach(b =>
    b.addEventListener('click', () => empezar(b.dataset.modo)));

  function hayAlgoSinGuardar(){
    return (dibujo.listo && $('el-titulo').value.trim()) || !!dibujo.editando;
  }

  function mostrarBarra(modo){
    document.querySelectorAll('.carto-herramienta').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
    $('dibujo-gps').hidden = modo !== 'punto' || !('geolocation' in navigator);
    $('dibujando').hidden = false;
    $('lienzo').classList.add('dibujando');
  }

  function empezar(modo){
    if (!mapa) return;
    if (hayAlgoSinGuardar()
        && !window.confirm('Hay un dibujo sin guardar. ¿Descartarlo y empezar otro?')) return;
    cerrarFicha();
    descartarNuevo(true);
    dibujo.modo = modo;
    dibujo.vertices = [];
    mostrarBarra(modo);
    pintarDibujo();
    $('lienzo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function editar(id){
    const e = estado.elementos.find(x => x.id === id);
    if (!e || !mapa) return;
    cerrarFicha();
    descartarNuevo(true);
    const c = e.geometria.coordinates;
    const pares = e.tipo === 'punto' ? [c] : e.tipo === 'linea' ? c : c[0].slice(0, -1);
    dibujo.editando = { id: e.id, referencia: e.referencia, titulo: e.titulo, relato: e.relato || '' };
    dibujo.modo = e.tipo;
    dibujo.vertices = pares.map(([lng, lat]) => L.latLng(lat, lng));
    pintarElementos();          // esconde el original mientras se corrige
    mostrarBarra(e.tipo);
    pintarDibujo();
    mapa.fitBounds(L.latLngBounds(dibujo.vertices).pad(0.5), { maxZoom: 17 });
    $('lienzo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function dentroDeLaZona(p){
    const z = ZONA.acepta;
    return p.lat >= z.latMin && p.lat <= z.latMax && p.lng >= z.lngMin && p.lng <= z.lngMax;
  }

  /* Al soltar un punto arrastrado, el navegador dispara además un toque
     en el mapa justo donde se soltó, y aparecía un punto nuevo encima.
     Lo que llega en ese instante no cuenta. */
  let soltadoEn = 0;

  function alTocarMapa(p){
    if (!dibujo.modo) return;
    if (Date.now() - soltadoEn < 400) return;
    if (!dentroDeLaZona(p)){
      $('dibujando-texto').textContent = 'Eso queda fuera de La Plata, Berisso y Ensenada.';
      return;
    }
    if (dibujo.modo === 'punto') dibujo.vertices = [p];
    else if (dibujo.vertices.length < 500) dibujo.vertices.push(p);
    pintarDibujo();
  }

  function minimo(modo){ return modo === 'punto' ? 1 : modo === 'linea' ? 2 : 3; }

  /* La forma va aparte de los puntos para poder redibujarla mientras se
     arrastra uno, sin tocar el punto que el dedo tiene agarrado. */
  function pintarForma(modo, final){
    capaForma.clearLayers();
    const v = dibujo.vertices;
    const estilo = { color: '#1A1A1A', weight: 4, opacity: .9, interactive: false,
                     dashArray: final ? null : '8 8', fillColor: '#F9E830', fillOpacity: .3 };
    if (modo === 'linea' && v.length >= 2) capaForma.addLayer(L.polyline(v, estilo));
    if (modo === 'zona' && v.length >= 3) capaForma.addLayer(L.polygon(v, estilo));
    else if (modo === 'zona' && v.length === 2) capaForma.addLayer(L.polyline(v, estilo));
  }

  function pintarDibujo(){
    capaDibujo.clearLayers();
    capaForma = L.layerGroup().addTo(capaDibujo);
    const v = dibujo.vertices;
    const modo = dibujo.modo || (dibujo.listo && dibujo.listo.tipo);
    const final = !!dibujo.listo;
    pintarForma(modo, final);

    v.forEach((p, i) => {
      const icono = modo === 'punto'
        ? iconoDe({ color: '#F9E830', glifo: '＋' }, 'nuevo')
        : L.divIcon({ className: 'carto-vertice' + (i === 0 ? ' primero' : ''), iconSize: [32, 32] });
      /* Leaflet apila los marcadores según la altura en el mapa: sin el
         `zIndexOffset`, un pin que queda más abajo tapa el punto que se
         quiere mover y el dedo agarra el pin. */
      const marca = L.marker(p, { icon: icono, draggable: !final, interactive: !final,
                                  keyboard: false, autoPan: true, zIndexOffset: 1000 });
      let antes = p;
      marca.on('dragstart', () => { antes = marca.getLatLng(); });
      marca.on('drag', () => { dibujo.vertices[i] = marca.getLatLng(); pintarForma(modo, false); });
      marca.on('dragend', () => {
        soltadoEn = Date.now();
        const ahora = marca.getLatLng();
        if (!dentroDeLaZona(ahora)){
          marca.setLatLng(antes);
          dibujo.vertices[i] = antes;
          pintarForma(modo, false);
          $('dibujando-texto').textContent = 'Eso queda fuera de La Plata, Berisso y Ensenada.';
          return;
        }
        dibujo.vertices[i] = ahora;
      });
      // En una zona, tocar el primer punto la cierra.
      if (i === 0 && modo === 'zona') marca.on('click', () => {
        if (dibujo.vertices.length >= 3) terminarDibujo();
      });
      capaDibujo.addLayer(marca);
    });
    if (final) return;

    const n = v.length;
    const textos = {
      punto: n ? 'Arrastralo si no quedó justo. Cuando esté bien, «Listo».'
               : 'Tocá el mapa donde está el lugar.',
      linea: !n ? 'Tocá el mapa donde empieza el recorrido.'
           : n === 1 ? 'Ahora tocá por dónde sigue, esquina por esquina.'
           : `${n} puntos. Seguí tocando, arrastrá uno para moverlo, o «Listo».`,
      zona:  !n ? 'Tocá el mapa en una esquina de la zona.'
           : n < 3 ? 'Seguí tocando el borde. Hacen falta tres puntos como mínimo.'
           : `${n} puntos. Seguí el borde, o tocá el primero para cerrarla.`
    };
    $('dibujando-texto').textContent = textos[dibujo.modo];
    $('dibujo-listo').disabled = n < minimo(dibujo.modo);
    $('dibujo-deshacer').disabled = !n;
  }

  $('dibujo-deshacer').addEventListener('click', () => { dibujo.vertices.pop(); pintarDibujo(); });
  $('dibujo-cancelar').addEventListener('click', () => descartarNuevo());

  $('dibujo-gps').addEventListener('click', () => {
    const boton = $('dibujo-gps');
    boton.disabled = true;
    $('dibujando-texto').textContent = 'Buscando dónde estás…';
    navigator.geolocation.getCurrentPosition(pos => {
      boton.disabled = false;
      const p = L.latLng(pos.coords.latitude, pos.coords.longitude);
      if (!dentroDeLaZona(p)){
        $('dibujando-texto').textContent = 'Estás fuera de La Plata, Berisso y Ensenada. Tocá el mapa.';
        return;
      }
      alTocarMapa(p);
      mapa.setView(p, Math.max(mapa.getZoom(), 16));
    }, () => {
      boton.disabled = false;
      $('dibujando-texto').textContent = 'No pudimos saber dónde estás. Tocá el mapa.';
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  });

  function terminarDibujo(){
    if (!dibujo.modo || dibujo.vertices.length < minimo(dibujo.modo)) return;
    dibujo.listo = { tipo: dibujo.modo };
    dibujo.modo = null;
    $('dibujando').hidden = true;
    $('lienzo').classList.remove('dibujando');
    document.querySelectorAll('.carto-herramienta').forEach(b => b.setAttribute('aria-pressed', 'false'));
    pintarDibujo();

    const ed = dibujo.editando;
    $('nuevo-titulo').textContent = ed
      ? ({ punto: 'Corregí este lugar', linea: 'Corregí este recorrido', zona: 'Corregí esta zona' })[dibujo.listo.tipo]
      : ({ punto: '¿Qué es este lugar?', linea: '¿Qué es este recorrido?', zona: '¿Qué es esta zona?' })[dibujo.listo.tipo];
    $('elemento-guardar').textContent = ed ? 'Guardar los cambios' : 'Guardar en el mapa';
    $('elemento-descartar').textContent = ed ? 'Dejarlo como estaba' : 'Descartar';
    if (ed && !$('el-titulo').value){
      $('el-titulo').value = ed.titulo;
      $('el-relato').value = ed.relato;
      $('relato-cuenta').textContent = ed.relato.length;
    }
    pintarElegirReferencia();
    mostrarFallo('elemento-error', '');
    $('panel-nuevo').hidden = false;
    $('panel-nuevo').scrollIntoView({ block: 'start', behavior: 'smooth' });
    $('panel-nuevo').focus({ preventScroll: true });
  }
  $('dibujo-listo').addEventListener('click', terminarDibujo);

  /* `callado`: al empezar otro dibujo no hace falta mover el foco. Si se
     estaba corrigiendo, el original vuelve a su lugar. */
  function descartarNuevo(callado){
    const corrigiendo = !!dibujo.editando;
    dibujo.modo = null;
    dibujo.vertices = [];
    dibujo.listo = false;
    dibujo.editando = null;
    if (capaDibujo) capaDibujo.clearLayers();
    $('dibujando').hidden = true;
    $('lienzo').classList.remove('dibujando');
    document.querySelectorAll('.carto-herramienta').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('panel-nuevo').hidden = true;
    $('form-elemento').reset();
    $('relato-cuenta').textContent = '0';
    if (corrigiendo) pintarElementos();
    if (!callado) $('lienzo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function pintarElegirReferencia(){
    const antes = (document.querySelector('input[name="referencia"]:checked') || {}).value;
    /* Un recorrido casi siempre es eso: un recorrido. Se ofrece
       marcado; si es otra cosa, se toca otra. Al corregir, la que tenía. */
    const sugerida = antes
      || (dibujo.editando && dibujo.editando.referencia)
      || (dibujo.listo && dibujo.listo.tipo === 'linea' ? 'recorridos' : '');
    $('elegir-referencia').innerHTML = todasLasReferencias(estado.propias).map(r => `
      <label class="carto-opcion">
        <input type="radio" name="referencia" value="${esc(r.id)}" ${r.id === sugerida ? 'checked' : ''}>
        ${muestra(r)}<span>${esc(r.nombre)}</span>
      </label>`).join('');
  }

  $('el-relato').addEventListener('input', () => {
    $('relato-cuenta').textContent = $('el-relato').value.length;
  });
  $('elemento-descartar').addEventListener('click', () => descartarNuevo());

  function nuevoId(){
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  /* Seis decimales son diez centímetros: de sobra para un dedo en una
     pantalla, y la mitad de bytes que los quince de Leaflet. */
  function geometriaDe(tipo, vertices){
    const c = vertices.map(p => [+p.lng.toFixed(6), +p.lat.toFixed(6)]);
    if (tipo === 'punto') return { type: 'Point', coordinates: c[0] };
    if (tipo === 'linea') return { type: 'LineString', coordinates: c };
    return { type: 'Polygon', coordinates: [c.concat([c[0]])] };
  }

  $('form-elemento').addEventListener('submit', async ev => {
    ev.preventDefault();
    mostrarFallo('elemento-error', '');
    const ref = (document.querySelector('input[name="referencia"]:checked') || {}).value;
    const titulo = $('el-titulo').value.trim();
    if (!ref){ mostrarFallo('elemento-error', 'Elegí una referencia: es lo que dice qué es en la leyenda.'); return; }
    if (!titulo){ mostrarFallo('elemento-error', 'Ponele un nombre corto.'); $('el-titulo').focus(); return; }

    const tipo = dibujo.listo.tipo;
    const datos = {
      referencia: ref,
      geometria: geometriaDe(tipo, dibujo.vertices),
      titulo,
      relato: $('el-relato').value.trim()
    };
    const ed = dibujo.editando;
    const boton = $('elemento-guardar');
    boton.disabled = true;

    if (ed){
      const cambios = Object.assign({ editado_at: new Date().toISOString() }, datos);
      const r = await pedir(db.from('cartografia_elementos').update(cambios).eq('id', ed.id).select('id'));
      boton.disabled = false;
      if (r.error || !r.data || !r.data.length){
        mostrarFallo('elemento-error', r.error ? textoDelError(r.error)
          : 'No se pudo guardar. Puede que ya no esté: tocá «Actualizar».');
        return;
      }
      const e = estado.elementos.find(x => x.id === ed.id);
      if (e) Object.assign(e, cambios);
      estado.ocultas.delete(ref);
      descartarNuevo(true);
      pintarLeyenda();
      abrirFicha(ed.id);
      return;
    }

    const fila = Object.assign({
      id: nuevoId(),
      cartografia: estado.carto.id,
      tipo,
      creado_en_dispositivo: new Date().toISOString()
    }, datos);
    const r = await pedir(db.from('cartografia_elementos').insert(fila));
    boton.disabled = false;
    // 23505: el pedido llegó antes y se perdió la respuesta. Ya está.
    if (r.error && r.error.code !== '23505'){
      mostrarFallo('elemento-error', textoDelError(r.error));
      return;
    }

    if (typeof anotarHito === 'function') anotarHito('dibujó en una cartografía');
    estado.elementos.push(Object.assign({ autor: yo.id }, fila));
    estado.ocultas.delete(ref);
    descartarNuevo(true);
    pintarLeyenda();
    pintarElementos();
    abrirFicha(fila.id);
  });


  /* ============================================================
     6. LA FICHA de lo que se toca en el mapa
     ============================================================ */
  let resaltado = null;

  function fechaCorta(iso){
    try {
      return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch(e){ return ''; }
  }

  function resaltar(id){
    if (resaltado && capaDe[resaltado] && capaDe[resaltado].setStyle){
      const e = estado.elementos.find(x => x.id === resaltado);
      if (e) capaDe[resaltado].setStyle({ weight: e.tipo === 'linea' ? 5 : 2.5, dashArray: null });
    }
    resaltado = id;
    const capa = id && capaDe[id];
    if (!capa) return;
    if (capa.setStyle){ capa.setStyle({ weight: 8, dashArray: null }); capa.bringToFront(); }
  }

  function abrirFicha(id){
    const e = estado.elementos.find(x => x.id === id);
    if (!e) return;
    const ref = buscarReferencia(todasLasReferencias(estado.propias), e.referencia);
    const mio = e.autor === yo.id;
    const puedeBorrar = mio || estado.rol === 'coordina';
    const relato = e.relato
      ? e.relato.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
      : '';

    /* Quién lo dibujó, con el apodo que eligió para este grupo. Lo
       corrige solo quien lo dibujó: quien coordina puede borrarlo, pero
       no cambiarle las palabras a otra persona. */
    const pie = [
      fechaCorta(e.creado_en_dispositivo),
      mio ? 'Lo dibujaste vos' : estado.conApodos ? 'Lo dibujó ' + etiquetaDe(e.autor) : '',
      e.editado_at ? 'corregido el ' + fechaCorta(e.editado_at) : ''
    ].filter(Boolean).join(' · ');

    const panel = $('panel-ficha');
    panel.dataset.id = id;
    panel.style.setProperty('--ref', ref.color);
    panel.innerHTML = `
      <p class="carto-ficha-ref">${muestra(ref)} ${esc(ref.nombre)} · ${TIPOS[e.tipo]}</p>
      <h2 class="carto-ficha-titulo">${esc(e.titulo)}</h2>
      <div class="carto-ficha-relato">${relato}</div>
      <p class="letra-chica carto-ayuda">${esc(pie)}</p>
      <div class="carto-botones">
        <button type="button" class="boton borde" data-accion="cerrar">Cerrar</button>
        ${mio ? '<button type="button" class="boton" data-accion="editar">Corregir</button>' : ''}
        ${puedeBorrar ? '<button type="button" class="boton peligro" data-accion="borrar">Borrar del mapa</button>' : ''}
      </div>
      <div class="aviso error" data-error hidden></div>`;
    panel.hidden = false;
    resaltar(id);
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function cerrarFicha(){
    const panel = $('panel-ficha');
    panel.hidden = true;
    delete panel.dataset.id;
    resaltar(null);
  }

  $('panel-ficha').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'cerrar'){ cerrarFicha(); return; }
    if (b.dataset.accion === 'editar'){ editar($('panel-ficha').dataset.id); return; }

    const id = $('panel-ficha').dataset.id;
    const e = estado.elementos.find(x => x.id === id);
    if (!e || !window.confirm(`¿Borrar «${e.titulo}» del mapa del grupo? No se puede deshacer.`)) return;
    b.disabled = true;
    const r = await pedir(db.from('cartografia_elementos').delete().eq('id', id).select('id'));
    b.disabled = false;
    const caja = $('panel-ficha').querySelector('[data-error]');
    if (r.error || !r.data || !r.data.length){
      caja.textContent = r.error ? textoDelError(r.error) : 'No se pudo borrar. Puede que ya no esté: tocá «Actualizar».';
      caja.hidden = false;
      return;
    }
    estado.elementos = estado.elementos.filter(x => x.id !== id);
    cerrarFicha();
    pintarLeyenda();
    pintarElementos();
  });


  /* ============================================================
     7. LA INFORMACIÓN DE BASE

     Las capas de `mapa/` (la lista en `mapa/capas-base.js`, los
     archivos en `mapa/datos/`): arroyos, polo industrial, barrios
     RENABAP, salud y clubes. Van debajo de lo que dibuja el grupo, en un
     solo canvas como allá, y se piden recién al prenderlas. Lo prendido
     queda anotado en el teléfono para la próxima vez.
     ============================================================ */
  const BASE_GUARDADA = 'bolivar-carto-base';
  const base = { prendidas: new Set(leerBase()), capas: {}, datos: {}, estado: {}, pedidos: new Map() };
  let lienzoBase = null;

  function leerBase(){
    try { const g = JSON.parse(localStorage.getItem(BASE_GUARDADA)); return Array.isArray(g) ? g : []; }
    catch(e){ return []; }
  }
  function guardarBase(){
    try { localStorage.setItem(BASE_GUARDADA, JSON.stringify([...base.prendidas])); } catch(e){}
  }
  function hayCapasBase(){ return typeof CAPAS_BASE !== 'undefined' && Array.isArray(CAPAS_BASE); }

  const TEXTO_BASE = {
    cargando:   'Bajando…',
    falta:      'Todavía no está cargada en la app',
    red:        'No se pudo bajar. Apagala y prendela para probar de nuevo',
    formato:    'El archivo no es un GeoJSON válido',
    proyeccion: 'El archivo no está en latitud y longitud'
  };

  /* La muestra de cada capa, con el mismo color con que se pinta. */
  function muestraBase(c){
    if (c.tipos){
      const paso = 100 / c.tipos.length;
      return 'background:linear-gradient(90deg,' + c.tipos.map((t, i) =>
        `${t.color} ${(i * paso).toFixed(0)}% ${((i + 1) * paso).toFixed(0)}%`).join(',') + ')';
    }
    const est = c.estilo({ geometry: { type: 'Polygon' }, properties: {} }) || {};
    return `background:${est.fillColor || est.color || '#888'};border-color:${est.color || '#888'}`;
  }

  /* Se arma una vez y después solo se le cambian los textos: rehacer la
     lista con cada cambio le sacaría el foco a quien usa el teclado. */
  function armarListaBase(){
    if (!hayCapasBase()){ $('capas-base').closest('section').hidden = true; return; }
    if ($('capas-base').childElementCount) return;
    $('capas-base').innerHTML = CAPAS_BASE.map(c => `
      <li><label class="carto-capa">
        <input type="checkbox" role="switch" data-base="${esc(c.id)}" ${base.prendidas.has(c.id) ? 'checked' : ''}>
        <span class="carto-capa-muestra" style="${muestraBase(c)}" aria-hidden="true"></span>
        <span class="carto-capa-nombre">${esc(c.nombre)}<small data-estado-base="${esc(c.id)}">${esc(c.detalle)}</small></span>
      </label></li>`).join('');
    pintarListaBase();
  }

  function pintarListaBase(){
    if (!hayCapasBase()) return;
    // Sin Leaflet no hay dónde dibujarla: se dice, en vez de dejar un
    // interruptor que se prende y no hace nada.
    const sinLeaflet = $('lienzo').classList.contains('vacio-mapa');
    CAPAS_BASE.forEach(c => {
      const i = document.querySelector(`[data-base="${c.id}"]`);
      const t = document.querySelector(`[data-estado-base="${c.id}"]`);
      if (!i || !t) return;
      const prendida = base.prendidas.has(c.id);
      const est = base.estado[c.id];
      i.checked = prendida;
      i.disabled = sinLeaflet;
      t.textContent = sinLeaflet ? 'Necesita el mapa, que todavía no bajó'
        : !prendida || !est || est === 'lista' ? c.detalle
        : TEXTO_BASE[est] || c.detalle;
      t.classList.toggle('con-problema', prendida && !!est && est !== 'lista' && est !== 'cargando');
    });
  }

  $('capas-base').addEventListener('change', ev => {
    const i = ev.target.closest('[data-base]');
    if (!i) return;
    const id = i.dataset.base;
    if (i.checked){
      base.prendidas.add(id);
      // Un error no se reintenta solo: se reintenta al volver a prenderla.
      if (base.estado[id] && base.estado[id] !== 'lista' && base.estado[id] !== 'cargando') delete base.estado[id];
    } else base.prendidas.delete(id);
    guardarBase();
    aplicarBase();
  });

  function aplicarBase(){
    if (!hayCapasBase()) return;
    if (mapa) CAPAS_BASE.forEach(c => {
      const prendida = base.prendidas.has(c.id);
      if (prendida && !base.capas[c.id] && !base.estado[c.id]) cargarBase(c);
      const capa = base.capas[c.id];
      if (capa){ if (prendida) capa.grupo.addTo(mapa); else mapa.removeLayer(capa.grupo); }
    });
    if (mapa) ordenarBase();
    pintarListaBase();
  }

  function traerBase(c){
    if (!base.pedidos.has(c.id)){
      const pedido = (async () => {
        const corte = new AbortController();
        const plazo = setTimeout(() => corte.abort(), 45000);
        let r;
        try { r = await fetch('../mapa/datos/' + c.archivo, { signal: corte.signal }); }
        catch(e){ throw { tipo: 'red' }; }
        finally { clearTimeout(plazo); }
        if (r.status === 404) throw { tipo: 'falta' };
        if (!r.ok) throw { tipo: 'red' };
        let datos;
        try { datos = await r.json(); } catch(e){ throw { tipo: 'formato' }; }
        if (!datos || !Array.isArray(datos.features)) throw { tipo: 'formato' };
        // POSGAR (metros) se dibujaría en medio del océano sin avisar.
        const f = datos.features.find(x => x && x.geometry && x.geometry.coordinates);
        let k = f && f.geometry.coordinates;
        while (Array.isArray(k) && Array.isArray(k[0])) k = k[0];
        if (Array.isArray(k) && (Math.abs(k[0]) > 180 || Math.abs(k[1]) > 90)) throw { tipo: 'proyeccion' };
        return datos;
      })();
      pedido.catch(() => base.pedidos.delete(c.id));
      base.pedidos.set(c.id, pedido);
    }
    return base.pedidos.get(c.id);
  }

  function cargarBase(c){
    base.estado[c.id] = 'cargando';
    traerBase(c).then(datos => {
      base.datos[c.id] = datos;
      base.capas[c.id] = armarCapaBase(c, datos);
      base.estado[c.id] = 'lista';
      aplicarBase();
    }, e => {
      base.estado[c.id] = (e && e.tipo) || 'red';
      aplicarBase();
    });
  }

  function armarCapaBase(c, datos){
    const de = tipos => ({ type: 'FeatureCollection',
      features: datos.features.filter(f => f && f.geometry && tipos.indexOf(f.geometry.type) !== -1) });
    const comun = {
      style: c.estilo, renderer: lienzoBase, pane: 'base',
      onEachFeature: (f, capa) => capa.on('click', ev => {
        L.DomEvent.stopPropagation(ev);
        /* Mientras se dibuja, tocar un barrio es poner un punto ahí,
           no abrir su ficha encima. */
        if (dibujo.modo) alTocarMapa(ev.latlng);
        else if (!dibujo.listo) fichaDeBase(c, f, ev.latlng);
      })
    };
    const rellenos = L.geoJSON(de(['Polygon', 'MultiPolygon']), comun);
    const lineas   = L.geoJSON(de(['LineString', 'MultiLineString']), comun);
    const puntos   = L.geoJSON(de(['Point', 'MultiPoint']), Object.assign({}, comun, {
      pointToLayer: (f, latlng) => {
        const tipo = tipoDePunto(c, f.properties);
        return L.circleMarker(latlng, Object.assign({}, c.estilo(f), {
          fillColor: tipo ? tipo.color : '#8A8A8A', renderer: lienzoBase, pane: 'base' }));
      }
    }));
    return { grupo: L.featureGroup([rellenos, lineas, puntos]), rellenos, lineas, puntos };
  }

  /* En un canvas manda el orden en que se agregó: los rellenos al
     fondo, las líneas en el medio, los puntos adelante. */
  function ordenarBase(){
    const prendidas = CAPAS_BASE.filter(c => base.prendidas.has(c.id) && base.capas[c.id]).map(c => base.capas[c.id]);
    prendidas.forEach(c => c.lineas.bringToFront());
    prendidas.forEach(c => c.puntos.bringToFront());
    prendidas.forEach(c => c.rellenos.bringToBack());
  }

  function fichaDeBase(c, f, donde){
    const p = f.properties || {};
    const tipo = tipoDePunto(c, p);
    const tipoCrudo = p.tipo || p.Tipo || p.TIPO || '';
    const nombre = primerCampo(p, CAMPOS_NOMBRE);
    const descripcion = primerCampo(p, CAMPOS_DESCRIPCION);
    L.popup({ maxWidth: 260 }).setLatLng(donde).setContent(`
      <div class="carto-base-ficha">
        <p class="carto-base-capa">${esc(c.nombre)}${tipo ? ' · ' + esc(tipo.nombre) : tipoCrudo ? ' · ' + esc(tipoCrudo) : ''}</p>
        <p class="carto-base-titulo">${esc(nombre || c.detalle)}</p>
        ${descripcion ? `<p>${esc(descripcion)}</p>` : ''}
        ${c.fuente ? `<p class="carto-base-fuente">Fuente: ${esc(c.fuente)}</p>` : ''}
      </div>`).openOn(mapa);
  }


  /* ============================================================
     8. BAJAR EL MAPA

     Dos cosas distintas para dos usos distintos:
       · la imagen, para presentar: el mapa como se ve ahora, con la
         leyenda abajo. Se dibuja a mano en un canvas (sin librerías):
         las calles, las capas de base prendidas y lo del grupo.
       · los datos, para QGIS: todo lo dibujado en GeoJSON, con su
         referencia, su nombre y su relato. Sin quién lo dibujó.
     ============================================================ */
  function nombreDeArchivo(ext){
    const limpio = String(estado.carto.nombre || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    return (limpio || 'cartografia') + '.' + ext;
  }

  function bajarArchivo(blob, nombre){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  $('bajar-geojson').addEventListener('click', () => {
    if (!estado.carto) return;
    const refs = todasLasReferencias(estado.propias);
    const coleccion = {
      type: 'FeatureCollection',
      name: estado.carto.nombre,
      features: estado.elementos.map(e => {
        const r = buscarReferencia(refs, e.referencia);
        return { type: 'Feature', geometry: e.geometria, properties: {
          titulo: e.titulo,
          relato: e.relato || '',
          referencia: r.nombre,
          color: r.color,
          tipo: TIPOS[e.tipo],
          fecha: String(e.creado_en_dispositivo || '').slice(0, 10),
          corregido: e.editado_at ? String(e.editado_at).slice(0, 10) : null
        } };
      })
    };
    const nombre = nombreDeArchivo('geojson');
    bajarArchivo(new Blob([JSON.stringify(coleccion, null, 1)], { type: 'application/geo+json' }), nombre);
    const n = estado.elementos.length;
    $('bajar-estado').textContent = `Listo: ${n === 1 ? '1 elemento' : n + ' elementos'} en «${nombre}». En QGIS se abre arrastrando el archivo a la ventana.`;
  });

  $('bajar-imagen').addEventListener('click', async () => {
    if (!mapa || !estado.carto) return;
    const boton = $('bajar-imagen');
    boton.disabled = true;
    $('bajar-estado').textContent = 'Armando la imagen…';
    try {
      let hecho = await armarImagen(true);
      let blob = await aBlob(hecho.lienzo).catch(() => null);
      /* Si las calles «ensuciaron» el canvas (un servidor sin permiso de
         CORS), el navegador no deja sacarlo: se arma otra vez sin ellas. */
      if (!blob){ hecho = await armarImagen(false); blob = await aBlob(hecho.lienzo); }
      const nombre = nombreDeArchivo('png');
      bajarArchivo(blob, nombre);
      $('bajar-estado').textContent = hecho.conCalles
        ? `Listo: «${nombre}».`
        : `Listo: «${nombre}», pero sin las calles de fondo, que no se pudieron bajar.`;
    } catch(e){
      $('bajar-estado').textContent = 'No se pudo armar la imagen. Probá de nuevo en un rato.';
    }
    boton.disabled = false;
  });

  function aBlob(lienzo){
    return new Promise((ok, mal) => {
      try { lienzo.toBlob(b => b ? ok(b) : mal(new Error('vacío')), 'image/png'); }
      catch(e){ mal(e); }
    });
  }

  /* Las teselas de OpenStreetMap del encuadre de ahora. El zoom de
     Leaflet acá es siempre entero, así que encajan sin escalar. */
  async function dibujarCalles(x, tam){
    const z = mapa.getZoom(), T = 256;
    const lim = mapa.getPixelBounds();
    const desde = lim.min.divideBy(T).floor(), hasta = lim.max.divideBy(T).floor();
    const pedidos = [];
    for (let tx = desde.x; tx <= hasta.x; tx++) for (let ty = desde.y; ty <= hasta.y; ty++){
      pedidos.push(new Promise(ok => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const plazo = setTimeout(() => ok(null), 10000);
        img.onload = () => { clearTimeout(plazo); ok({ img, tx, ty }); };
        img.onerror = () => { clearTimeout(plazo); ok(null); };
        img.src = `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
      }));
    }
    const azulejos = (await Promise.all(pedidos)).filter(Boolean);
    azulejos.forEach(a => x.drawImage(a.img, a.tx * T - lim.min.x, a.ty * T - lim.min.y, T, T));
    return azulejos.length > 0;
  }

  function camino(x, anillos, cerrar){
    x.beginPath();
    anillos.forEach(a => {
      a.forEach(([lng, lat], i) => {
        const p = mapa.latLngToContainerPoint([lat, lng]);
        if (i) x.lineTo(p.x, p.y); else x.moveTo(p.x, p.y);
      });
      if (cerrar) x.closePath();
    });
  }

  /* El estilo de Leaflet pasado a canvas. */
  function pintarCamino(x, est, conRelleno){
    if (conRelleno && est.fill !== false){
      x.globalAlpha = est.fillOpacity == null ? .2 : est.fillOpacity;
      x.fillStyle = est.fillColor || est.color || '#3388ff';
      x.fill('evenodd');
    }
    if (est.stroke !== false){
      x.globalAlpha = est.opacity == null ? 1 : est.opacity;
      x.strokeStyle = est.color || '#3388ff';
      x.lineWidth = est.weight == null ? 3 : est.weight;
      x.lineCap = est.lineCap || 'round';
      x.lineJoin = est.lineJoin || 'round';
      x.setLineDash(est.dashArray ? String(est.dashArray).split(/[ ,]+/).map(Number) : []);
      x.stroke();
    }
    x.globalAlpha = 1;
    x.setLineDash([]);
  }

  function dibujarGeometria(x, g, est, alPunto){
    if (!g || !g.coordinates) return;
    const c = g.coordinates;
    if (g.type === 'Polygon'){ camino(x, c, true); pintarCamino(x, est, true); }
    else if (g.type === 'MultiPolygon') c.forEach(p => { camino(x, p, true); pintarCamino(x, est, true); });
    else if (g.type === 'LineString'){ camino(x, [c], false); pintarCamino(x, est, false); }
    else if (g.type === 'MultiLineString'){ camino(x, c, false); pintarCamino(x, est, false); }
    else if (g.type === 'Point') alPunto(c);
    else if (g.type === 'MultiPoint') c.forEach(alPunto);
  }

  /* El pin de un lugar: un círculo con su glifo y una punta abajo. */
  function dibujarPin(x, [lng, lat], ref){
    const p = mapa.latLngToContainerPoint([lat, lng]);
    const cx = p.x, cy = p.y - 19, r = 13;
    x.beginPath();
    x.moveTo(cx - 7, cy + 9); x.lineTo(cx, p.y); x.lineTo(cx + 7, cy + 9); x.closePath();
    x.fillStyle = '#1A1A1A'; x.fill();
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2);
    x.fillStyle = ref.color; x.fill();
    x.lineWidth = 2; x.strokeStyle = '#1A1A1A'; x.stroke();
    x.fillStyle = '#FFFFFF';
    x.font = '700 14px Roboto, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(ref.glifo, cx, cy + 1);
  }

  /* Corta un texto en renglones que entren en `ancho`. */
  function renglones(x, texto, ancho){
    const palabras = String(texto).split(/\s+/);
    const salida = [];
    let linea = '';
    palabras.forEach(p => {
      const prueba = linea ? linea + ' ' + p : p;
      if (x.measureText(prueba).width > ancho && linea){ salida.push(linea); linea = p; }
      else linea = prueba;
    });
    if (linea) salida.push(linea);
    return salida;
  }

  async function armarImagen(conCalles){
    try { await Promise.all([document.fonts.load('22px "Archivo Black"'), document.fonts.load('700 14px Roboto')]); }
    catch(e){}

    const tam = mapa.getSize();
    const E = 2;                                    // el doble, para que se vea nítida
    const M = 20;                                   // el margen del pie
    const refs = todasLasReferencias(estado.propias);
    const visibles = estado.elementos.filter(e => !estado.ocultas.has(e.referencia));
    const usadas = refs.filter(r => visibles.some(e => e.referencia === r.id));
    const capas = hayCapasBase()
      ? CAPAS_BASE.filter(c => base.prendidas.has(c.id) && base.datos[c.id]) : [];

    // Primero se mide el pie, para saber de qué alto hacer el lienzo.
    const medir = document.createElement('canvas').getContext('2d');
    const anchoUtil = tam.x - 2 * M;
    const columnas = tam.x >= 560 ? 2 : 1;
    const items = usadas.map(r => ({ tipo: 'ref', r })).concat(capas.map(c => ({ tipo: 'base', c })));
    const filas = Math.ceil(items.length / columnas);
    medir.font = '400 11px Roboto, sans-serif';
    const fuentes = ['Calles: © OpenStreetMap y sus colaboradores']
      .concat(capas.filter(c => c.fuente).map(c => c.nombre + ': ' + c.fuente));
    const lineasFuente = renglones(medir, fuentes.join(' · '), anchoUtil);
    medir.font = '22px "Archivo Black", sans-serif';
    const lineasTitulo = renglones(medir, estado.carto.nombre.toUpperCase(), anchoUtil).slice(0, 3);
    const altoPie = M + lineasTitulo.length * 26 + 22 + (filas ? 14 + filas * 26 : 0) + 10 + lineasFuente.length * 15 + M;

    const lienzo = document.createElement('canvas');
    lienzo.width = tam.x * E;
    lienzo.height = (tam.y + altoPie) * E;
    const x = lienzo.getContext('2d');
    x.scale(E, E);

    // El mapa
    x.fillStyle = '#F3F0E6';
    x.fillRect(0, 0, tam.x, tam.y);
    const huboCalles = conCalles ? await dibujarCalles(x, tam) : false;
    x.save();
    x.beginPath(); x.rect(0, 0, tam.x, tam.y); x.clip();
    capas.forEach(c => base.datos[c.id].features.forEach(f => {
      if (!f || !f.geometry) return;
      const est = c.estilo(f) || {};
      dibujarGeometria(x, f.geometry, est, ([lng, lat]) => {
        const p = mapa.latLngToContainerPoint([lat, lng]);
        const tipo = tipoDePunto(c, f.properties);
        x.beginPath(); x.arc(p.x, p.y, est.radius || 6, 0, Math.PI * 2);
        x.fillStyle = tipo ? tipo.color : '#8A8A8A'; x.fill();
        x.lineWidth = est.weight || 1.5; x.strokeStyle = est.color || '#1A1A1A'; x.stroke();
      });
    }));
    const orden = { zona: 0, linea: 1, punto: 2 };
    visibles.slice().sort((a, b) => orden[a.tipo] - orden[b.tipo]).forEach(e => {
      const ref = buscarReferencia(refs, e.referencia);
      if (e.tipo === 'punto') dibujarPin(x, e.geometria.coordinates, ref);
      else if (e.tipo === 'linea') dibujarGeometria(x, e.geometria, { color: ref.color, weight: 5, opacity: .9 });
      else dibujarGeometria(x, e.geometria, { color: ref.color, weight: 2.5, fillColor: ref.color, fillOpacity: .22 });
    });
    x.restore();

    // El pie: el nombre, la fecha, la leyenda y las fuentes
    let y = tam.y;
    x.fillStyle = '#FFFFFF';
    x.fillRect(0, y, tam.x, altoPie);
    x.fillStyle = '#1A1A1A';
    x.fillRect(0, y, tam.x, 2);
    y += M;
    x.textAlign = 'left'; x.textBaseline = 'top';
    x.font = '22px "Archivo Black", sans-serif';
    lineasTitulo.forEach(l => { x.fillText(l, M, y); y += 26; });
    x.font = '400 12px Roboto, sans-serif';
    x.fillStyle = '#4E4E4E';
    x.fillText('Cartografía social · ' + new Date().toLocaleDateString('es-AR',
      { day: 'numeric', month: 'long', year: 'numeric' }) + ' · La Bolívar con vos', M, y);
    y += 22;
    if (filas){
      y += 14;
      const anchoCol = anchoUtil / columnas;
      items.forEach((it, i) => {
        const cx = M + (i % columnas) * anchoCol;
        const cy = y + Math.floor(i / columnas) * 26;
        if (it.tipo === 'ref'){
          x.beginPath(); x.arc(cx + 9, cy + 9, 9, 0, Math.PI * 2);
          x.fillStyle = it.r.color; x.fill();
          x.lineWidth = 1.5; x.strokeStyle = '#1A1A1A'; x.stroke();
        } else {
          const est = it.c.estilo({ geometry: { type: 'Polygon' }, properties: {} }) || {};
          x.fillStyle = it.c.tipos ? it.c.tipos[0].color : (est.fillColor || est.color || '#888');
          x.globalAlpha = it.c.tipos ? 1 : .6;
          x.fillRect(cx, cy + 2, 18, 14);
          x.globalAlpha = 1;
          x.lineWidth = 1.5; x.strokeStyle = est.color || '#1A1A1A'; x.strokeRect(cx, cy + 2, 18, 14);
        }
        const n = it.tipo === 'ref' ? visibles.filter(e => e.referencia === it.r.id).length : null;
        x.fillStyle = '#1A1A1A';
        x.font = '500 13px Roboto, sans-serif';
        x.textBaseline = 'middle';
        const texto = it.tipo === 'ref' ? `${it.r.nombre} (${n})` : it.c.nombre;
        x.fillText(renglones(x, texto, anchoCol - 34)[0] || '', cx + 26, cy + 10);
        x.textBaseline = 'top';
      });
      y += filas * 26;
    }
    y += 10;
    x.font = '400 11px Roboto, sans-serif';
    x.fillStyle = '#4E4E4E';
    lineasFuente.forEach(l => { x.fillText(l, M, y); y += 15; });

    return { lienzo, conCalles: huboCalles };
  }

})();
