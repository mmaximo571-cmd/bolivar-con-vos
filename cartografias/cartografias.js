/* ============================================================
   CARTOGRAFÍAS SOCIALES  ·  la lógica de `cartografias/`

   Dos vistas en una pantalla: la lista (las tuyas, sumarte con un
   código, crear una) y una cartografía abierta (el mapa, dibujar, la
   leyenda, el grupo). Cuál se ve lo dice la dirección; ver el
   comentario de `index.html`.

   Todo pide cuenta: las cartografías son de cada grupo y la base no le
   muestra nada a quien no está adentro (`sql/tabla-cartografias.sql`).

   Lo que esta primera tanda NO hace todavía (propuesta 5 de
   `docs/PROPUESTAS.md`): dibujar sin señal, editar lo ya dibujado,
   prender las capas de base de `mapa/`, exportar, y ver en vivo lo que
   dibuja el resto (por ahora, «Actualizar» y al volver a la pantalla).
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
    armarMapa();
  }

  /* Miembros, referencias propias y lo dibujado. Se usa al abrir y en
     «Actualizar». Devuelve false si algo falló (y ya lo avisó). */
  async function traerLoDeAdentro(id){
    const [m, ref, el] = await Promise.all([
      pedir(db.from('cartografia_miembros').select('usuario, rol').eq('cartografia', id)),
      pedir(db.from('cartografia_referencias').select('id, nombre, color').eq('cartografia', id).order('creada_at')),
      pedir(db.from('cartografia_elementos')
        .select('id, autor, referencia, tipo, geometria, titulo, relato, creado_en_dispositivo')
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
  function pintarGrupo(){
    const n = estado.miembros;
    $('carto-ceja').textContent =
      (estado.rol === 'coordina' ? 'La coordinás' : 'Participás') + ' · ' +
      (n === 1 ? '1 persona' : n + ' personas');
    const gente = n === 1 ? 'Por ahora estás solo vos.' : `Son ${n} personas en el grupo.`;
    const boton = $('salir-o-borrar');
    if (estado.rol === 'coordina'){
      $('grupo-texto').textContent = gente + ' La coordinás vos: podés sumar referencias y borrar lo que no va.';
      boton.textContent = 'Borrar la cartografía';
    } else {
      $('grupo-texto').textContent = gente + ' Podés dibujar y borrar lo tuyo.';
      boton.textContent = 'Salir de la cartografía';
    }
  }

  $('salir-o-borrar').addEventListener('click', async () => {
    const c = estado.carto;
    const coordina = estado.rol === 'coordina';
    const pregunta = coordina
      ? `¿Borrar «${c.nombre}» para todo el grupo? Se pierde todo lo dibujado (${estado.elementos.length}). No se puede deshacer.`
      : `¿Salir de «${c.nombre}»? Lo que dibujaste queda en el mapa del grupo. Para volver vas a necesitar el código.`;
    if (!window.confirm(pregunta)) return;

    const boton = $('salir-o-borrar');
    boton.disabled = true;
    const r = coordina
      ? await pedir(db.from('cartografias').delete().eq('id', c.id).select('id'))
      : await pedir(db.from('cartografia_miembros').delete()
          .eq('cartografia', c.id).eq('usuario', yo.id).select('usuario'));
    boton.disabled = false;
    if (r.error || !r.data || !r.data.length){
      window.alert(r.error ? textoDelError(r.error) : 'No se pudo. Probá de nuevo en un rato.');
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

    capaElementos = L.layerGroup().addTo(mapa);
    capaDibujo = L.layerGroup().addTo(mapa);
    mapa.on('click', e => alTocarMapa(e.latlng));

    pintarElementos();
    encuadrar();
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
     5. DIBUJAR

     A dedo y sin librerías: cada toque en el mapa es un vértice. Un
     lugar es un toque (y se puede corregir tocando de nuevo); un
     recorrido, dos o más; una zona, tres o más, y se cierra sola.
     Arrastrar sigue moviendo el mapa: Leaflet distingue el toque del
     arrastre.
     ============================================================ */
  const dibujo = { modo: null, vertices: [], listo: false };

  document.querySelectorAll('.carto-herramienta').forEach(b =>
    b.addEventListener('click', () => empezar(b.dataset.modo)));

  function empezar(modo){
    if (!mapa) return;
    if (dibujo.listo && $('el-titulo').value.trim()
        && !window.confirm('Hay un dibujo sin guardar. ¿Descartarlo y empezar otro?')) return;
    cerrarFicha();
    descartarNuevo(true);
    dibujo.modo = modo;
    dibujo.vertices = [];
    document.querySelectorAll('.carto-herramienta').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
    $('dibujo-gps').hidden = modo !== 'punto' || !('geolocation' in navigator);
    $('dibujando').hidden = false;
    $('lienzo').classList.add('dibujando');
    pintarDibujo();
    $('lienzo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function dentroDeLaZona(p){
    const z = ZONA.acepta;
    return p.lat >= z.latMin && p.lat <= z.latMax && p.lng >= z.lngMin && p.lng <= z.lngMax;
  }

  function alTocarMapa(p){
    if (!dibujo.modo) return;
    if (!dentroDeLaZona(p)){
      $('dibujando-texto').textContent = 'Eso queda fuera de La Plata, Berisso y Ensenada.';
      return;
    }
    if (dibujo.modo === 'punto') dibujo.vertices = [p];
    else if (dibujo.vertices.length < 500) dibujo.vertices.push(p);
    pintarDibujo();
  }

  function minimo(modo){ return modo === 'punto' ? 1 : modo === 'linea' ? 2 : 3; }

  function pintarDibujo(){
    capaDibujo.clearLayers();
    const v = dibujo.vertices;
    const modo = dibujo.modo || (dibujo.listo && dibujo.listo.tipo);
    const final = !!dibujo.listo;
    const estilo = { color: '#1A1A1A', weight: 4, opacity: .9,
                     dashArray: final ? null : '8 8', fillColor: '#F9E830', fillOpacity: .3 };

    if (modo === 'linea' && v.length >= 2) capaDibujo.addLayer(L.polyline(v, estilo));
    if (modo === 'zona' && v.length >= 3) capaDibujo.addLayer(L.polygon(v, estilo));
    else if (modo === 'zona' && v.length === 2) capaDibujo.addLayer(L.polyline(v, estilo));

    if (modo === 'punto' && v.length){
      capaDibujo.addLayer(L.marker(v[0], {
        icon: iconoDe({ color: '#F9E830', glifo: '＋' }, 'nuevo'), interactive: false }));
    } else {
      v.forEach((p, i) => capaDibujo.addLayer(L.circleMarker(p, {
        radius: i === 0 ? 8 : 6, color: '#1A1A1A', weight: 2,
        fillColor: i === 0 ? '#F9E830' : '#FFFFFF', fillOpacity: 1, interactive: false })));
    }
    if (final) return;

    const n = v.length;
    const textos = {
      punto: n ? 'Si no es ahí, tocá de nuevo. Cuando esté bien, «Listo».'
               : 'Tocá el mapa donde está el lugar.',
      linea: !n ? 'Tocá el mapa donde empieza el recorrido.'
           : n === 1 ? 'Ahora tocá por dónde sigue, esquina por esquina.'
           : `${n} puntos. Seguí tocando, o «Listo» si llegaste.`,
      zona:  !n ? 'Tocá el mapa en una esquina de la zona.'
           : n < 3 ? 'Seguí tocando el borde. Hacen falta tres puntos como mínimo.'
           : `${n} puntos. Seguí el borde, o «Listo»: se cierra sola.`
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

  $('dibujo-listo').addEventListener('click', () => {
    if (dibujo.vertices.length < minimo(dibujo.modo)) return;
    dibujo.listo = { tipo: dibujo.modo };
    dibujo.modo = null;
    $('dibujando').hidden = true;
    $('lienzo').classList.remove('dibujando');
    document.querySelectorAll('.carto-herramienta').forEach(b => b.setAttribute('aria-pressed', 'false'));
    pintarDibujo();

    $('nuevo-titulo').textContent = ({ punto: '¿Qué es este lugar?',
      linea: '¿Qué es este recorrido?', zona: '¿Qué es esta zona?' })[dibujo.listo.tipo];
    pintarElegirReferencia();
    mostrarFallo('elemento-error', '');
    $('panel-nuevo').hidden = false;
    $('panel-nuevo').scrollIntoView({ block: 'start', behavior: 'smooth' });
    $('panel-nuevo').focus({ preventScroll: true });
  });

  /* `callado`: al empezar otro dibujo no hace falta mover el foco. */
  function descartarNuevo(callado){
    dibujo.modo = null;
    dibujo.vertices = [];
    dibujo.listo = false;
    if (capaDibujo) capaDibujo.clearLayers();
    $('dibujando').hidden = true;
    $('lienzo').classList.remove('dibujando');
    document.querySelectorAll('.carto-herramienta').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('panel-nuevo').hidden = true;
    $('form-elemento').reset();
    $('relato-cuenta').textContent = '0';
    if (!callado) $('lienzo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function pintarElegirReferencia(){
    const antes = (document.querySelector('input[name="referencia"]:checked') || {}).value;
    /* Un recorrido casi siempre es eso: un recorrido. Se ofrece
       marcado; si es otra cosa, se toca otra. */
    const sugerida = antes || (dibujo.listo && dibujo.listo.tipo === 'linea' ? 'recorridos' : '');
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

    const fila = {
      id: nuevoId(),
      cartografia: estado.carto.id,
      referencia: ref,
      tipo: dibujo.listo.tipo,
      geometria: geometriaDe(dibujo.listo.tipo, dibujo.vertices),
      titulo,
      relato: $('el-relato').value.trim(),
      creado_en_dispositivo: new Date().toISOString()
    };

    const boton = $('elemento-guardar');
    boton.disabled = true;
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

    const panel = $('panel-ficha');
    panel.dataset.id = id;
    panel.style.setProperty('--ref', ref.color);
    panel.innerHTML = `
      <p class="carto-ficha-ref">${muestra(ref)} ${esc(ref.nombre)} · ${TIPOS[e.tipo]}</p>
      <h2 class="carto-ficha-titulo">${esc(e.titulo)}</h2>
      <div class="carto-ficha-relato">${relato}</div>
      <p class="letra-chica carto-ayuda">${esc(fechaCorta(e.creado_en_dispositivo))}${mio ? ' · Lo dibujaste vos' : ''}</p>
      <div class="carto-botones">
        <button type="button" class="boton borde" data-accion="cerrar">Cerrar</button>
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

})();
