/* ============================================================
   LA BOLIVAR CON VOS · funciones compartidas por todas las pantallas
   Se carga DESPUES de config.js y de la libreria de Supabase.
   Cada pantalla define antes window.RAIZ = "./" o "../"
   ============================================================ */

const RAIZ = window.RAIZ || './';

/* ------------------------------------------------------------
   «MENOS MOVIMIENTO», PREGUNTADO CADA VEZ

   Quien tiene vértigo, migraña o sensibilidad al movimiento lo activa
   en el teléfono y toda la app tiene que hacerle caso. El CSS lo hace
   solo. El JavaScript no: había cinco lugares que leían la preferencia
   UNA vez, al cargar la pantalla, y se quedaban con esa respuesta para
   siempre. Si alguien la activaba con la app abierta —que es
   exactamente lo que hace quien empezó a marearse— no pasaba nada
   hasta recargar. Y el carrusel, que es lo primero que marea, seguía
   corriéndose solo.

   Son dos cosas. La función contesta con el valor de AHORA, así que
   preguntar es siempre barato y siempre correcto. Y alCambiarMovimiento
   avisa a quien tenga algo prendido —un reloj, un carrusel— para que lo
   apague en el momento, sin esperar a la próxima pantalla.
   ------------------------------------------------------------ */
const consultaMovimiento = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

function menosMovimiento(){
  return !!(consultaMovimiento && consultaMovimiento.matches);
}

function alCambiarMovimiento(hacer){
  if (!consultaMovimiento) return;
  /* addEventListener es lo correcto; addListener es lo único que
     entienden Safari 13 y los Android viejos, que son bastantes de los
     teléfonos que abren esto. */
  if (consultaMovimiento.addEventListener)
    consultaMovimiento.addEventListener('change', e => hacer(e.matches));
  else if (consultaMovimiento.addListener)
    consultaMovimiento.addListener(e => hacer(e.matches));
}

/* ------------------------------------------------------------
   CLIENTE DE SUPABASE

   Esta linea es la mas fragil de toda la app: si la libreria no
   esta, revienta, y como pasa ANTES que todo lo demas, no se dibuja
   ni la cabecera. La pantalla queda en "Cargando..." para siempre y
   sin decir por que. Ya paso una vez.

   Por eso ahora: si algo falta, se avisa en pantalla en castellano
   en vez de morir en silencio.
   ------------------------------------------------------------ */
function avisarQueNoArranca(motivo){
  /* Este es EL error que hay que enterarse: la app no abrió. Por eso
     `anotar` no depende del cliente de datos, que es justo lo que
     acaba de fallar. */
  try { anotar('error', 'no arranca: ' + motivo); } catch(e){}
  document.addEventListener('DOMContentLoaded', function(){
    document.body.innerHTML =
      '<div style="max-width:520px;margin:60px auto;padding:0 20px;' +
      'font-family:Roboto,sans-serif;line-height:1.5">' +
      '<h1 style="font-size:22px;margin-bottom:10px">No se pudo abrir la app</h1>' +
      '<p>' + motivo + '</p>' +
      '<p><a href="" style="font-weight:700">Probá de nuevo</a></p></div>';
  });
}

/* Hay DOS clientes posibles, y esta pantalla ya eligió cuál arriba,
   en el <script> que cargó:

     lib/supabase.js  la librería grande. La necesitan las pantallas
                      que inician sesión o suben archivos: «Info útil»,
                      «Mi año», «Perfil» y el panel.
     lib/datos.js     el cliente chico, 56 KB menos. Alcanza para
                      cualquier pantalla que solo lea datos públicos.

   Si por lo que sea estuvieran los dos, manda la grande, que hace
   todo lo que hace la chica. */
let db = null;
const armarCliente =
    (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient
  : (window.datosBolivar && window.datosBolivar.crearCliente)
  ? window.datosBolivar.crearCliente
  : null;

if (!armarCliente){
  avisarQueNoArranca('No cargó una parte de la app. Suele ser la conexión: ' +
    'probá de nuevo, o con otra red.');
} else if (!window.BOLIVAR_CONFIG){
  avisarQueNoArranca('Falta la configuración de la app. Avisale al equipo.');
} else {
  db = armarCliente(
    window.BOLIVAR_CONFIG.url,
    window.BOLIVAR_CONFIG.anonKey
  );
}

/* ------------------------------------------------------------
   EL REGISTRO

   Hasta hoy la app no anotaba nada: si algo se rompía en un
   telefono ajeno, no nos enterabamos nunca. El 21 entran 4.213
   personas de una y eso es la diferencia entre saber que pasó y
   suponerlo.

   Tres reglas de como esta escrito:

   1. NO usa `db`. Va con `fetch` pelado contra la base, porque
      tiene que poder anotar justamente el error de que el cliente
      de datos no cargó. Si dependiera de `db`, el dia que falle lo
      importante no habria registro.
   2. NUNCA rompe la pantalla. Todo va adentro de try/catch y no se
      espera la respuesta. Un registro que tira la app es peor que
      no tener registro.
   3. NO identifica a nadie. No hay usuario, ni IP, ni nada que
      permita seguir a una persona entre visitas. Del aparato se
      guarda un balde grueso —iphone, android, escritorio—, que
      alcanza para saber donde se rompio algo y no para reconocer
      a nadie.
   ------------------------------------------------------------ */
function queAparato(){
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iphone';
  if (/Android/i.test(ua))          return 'android';
  if (/Mobi/i.test(ua))             return 'otro';
  return 'escritorio';
}

function anotar(tipo, detalle){
  try {
    const cfg = window.BOLIVAR_CONFIG;
    if (!cfg || !cfg.url || !cfg.anonKey) return;
    fetch(cfg.url.replace(/\/+$/, '') + '/rest/v1/sucesos', {
      method: 'POST',
      /* `keepalive` es lo que permite que el aviso llegue aunque la
         persona cierre la pantalla en el mismo momento. */
      keepalive: true,
      headers: {
        apikey: cfg.anonKey,
        Authorization: 'Bearer ' + cfg.anonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify([{
        tipo:        tipo,
        pantalla:    String(location.pathname).slice(0, 120),
        detalle:     detalle ? String(detalle).slice(0, 300) : null,
        dispositivo: queAparato()
      }])
    }).catch(function(){ /* si no se pudo anotar, no es asunto de nadie */ });
  } catch(e){ /* idem */ }
}

/* Para las pantallas que tienen buscador. Lo que se anota es el
   termino, igual que ya se hace con las preguntas de Avisanos: es
   la lista de lo que la gente busca y no encuentra, escrita con sus
   palabras. */
let relojBusqueda = null, ultimaBusqueda = '';
function anotarBusqueda(termino){
  const t = String(termino || '').trim();
  clearTimeout(relojBusqueda);
  if (t.length < 3) return;
  /* Se anota cuando deja de tipear, no en cada tecla: si no, buscar
     «certificado» dejaria once renglones y ninguno seria la
     busqueda de verdad. Y no se repite el mismo termino dos veces
     en la misma visita. */
  relojBusqueda = setTimeout(function(){
    if (t === ultimaBusqueda) return;
    ultimaBusqueda = t;
    anotar('busqueda', t);
  }, 1500);
}

(function registrar(){
  /* Los errores: como mucho tres por visita y sin repetir. Un error
     adentro de un bucle podria mandar miles, y ahi el registro pasa
     de ser util a ser el problema. */
  let cuantos = 0;
  const yaVistos = {};
  function anotarError(texto){
    if (cuantos >= 3) return;
    const t = String(texto || '').slice(0, 300);
    if (!t || yaVistos[t]) return;
    yaVistos[t] = true; cuantos++;
    anotar('error', t);
  }

  window.addEventListener('error', function(e){
    anotarError((e.message || 'error') +
      (e.filename ? ' · ' + String(e.filename).split('/').pop() +
        (e.lineno ? ':' + e.lineno : '') : ''));
  });
  window.addEventListener('unhandledrejection', function(e){
    const r = e.reason;
    anotarError('promesa: ' + ((r && (r.message || r)) || 'sin motivo'));
  });

  /* La visita: una sola por carga, y despues de que la pantalla ya
     este dibujada, para no competir por el ancho de banda con lo que
     la persona vino a buscar.

     Lo unico que NO se cuenta es una pagina que el navegador preparo
     de antemano sin que nadie la abriera (`prerendering`): eso no es
     una visita. Una pestaña en segundo plano SI se cuenta, porque
     alguien la abrio a proposito.

     Se probo primero descartando todo lo que estuviera escondido, y
     estaba mal: si un navegador no avisa cuando se vuelve visible,
     esa visita se perdia para siempre. Para un numero que el 21
     tiene que ser confiable, conviene contar de mas y no de menos. */
  function contarVisita(){ anotar('visita', null); }
  function programarVisita(){ setTimeout(contarVisita, 2500); }

  if (document.prerendering){
    document.addEventListener('prerenderingchange', programarVisita, { once:true });
  } else if (document.readyState === 'complete'){
    programarVisita();
  } else {
    window.addEventListener('load', programarVisita);
  }
})();

/* ------------------------------------------------------------
   UTILIDADES
   ------------------------------------------------------------ */

/* Evita que un texto cargado desde la base rompa o inyecte HTML */
function esc(t){
  return String(t ?? '').replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}

/* Texto con saltos de linea -> HTML seguro */
function escMulti(t){ return esc(t).replace(/\n/g,'<br>'); }

/* Lee un parametro de la direccion: ?id=3 */
function parametro(nombre){
  return new URLSearchParams(location.search).get(nombre);
}

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESES_LARGO = ['enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre'];

/* "2026-09-04" -> {dia:"4", mes:"sep"}  (sin lios de zona horaria) */
function partesFecha(iso){
  if(!iso) return null;
  const [a,m,d] = String(iso).slice(0,10).split('-').map(Number);
  if(!a || !m || !d) return null;
  return { anio:a, mes:m, dia:d, mesCorto:MESES[m-1], mesLargo:MESES_LARGO[m-1] };
}

function fechaLinda(iso){
  const f = partesFecha(iso);
  return f ? `${f.dia} de ${f.mesLargo}` : '';
}

/* Rango: "4 de septiembre" o "4 al 8 de septiembre" */
function rangoLindo(desde, hasta){
  const a = partesFecha(desde), b = partesFecha(hasta);
  if(!a) return '';
  if(!b || (a.dia===b.dia && a.mes===b.mes)) return fechaLinda(desde);
  if(a.mes === b.mes) return `${a.dia} al ${b.dia} de ${a.mesLargo}`;
  return `${a.dia} de ${a.mesLargo} al ${b.dia} de ${b.mesLargo}`;
}

/* Fecha de hoy como "2026-08-25", segun el reloj del celular */
function hoyISO(){
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`;
}

/* Compara sin acentos ni mayusculas, para que "tramite" encuentre "trámite" */
function normalizar(t){
  return String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

/* Las dos puertas grandes de la app. El orden de acá es el orden en que se muestran. */
const NOMBRE_SECCION = {
  carrera:  'Mi carrera',
  derechos: 'Mis derechos'
};

const NOMBRE_LINEA = {
  frente:  'Frente político',
  gremial: 'Gremial',
  info:    'Info importante',
  saberes: 'Saberes colectivos'
};

/* ------------------------------------------------------------
   CALENDARIO
   ------------------------------------------------------------ */

/* Devuelve "2026-09-04" a partir de año, mes (1-12) y día, sin pasar por
   objetos Date, que en zonas horarias negativas corren el día para atrás. */
function armarISO(anio, mes, dia){
  return `${anio}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
}

/* El día de al lado. Se hace todo en UTC y se lee en UTC: con la hora
   local, en husos negativos como el nuestro, el día se corre para atrás. */
function isoVecino(iso, paso){
  const [a, m, d] = String(iso).slice(0,10).split('-').map(Number);
  const t = new Date(Date.UTC(a, m - 1, d + paso));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,'0')}-${String(t.getUTCDate()).padStart(2,'0')}`;
}

/* ¿Esta publicación cae en este día? Contempla los rangos de varios días. */
function caeEnElDia(p, iso){
  if (!p.fecha_desde) return false;
  const desde = String(p.fecha_desde).slice(0,10);
  const hasta = String(p.fecha_hasta || p.fecha_desde).slice(0,10);
  return iso >= desde && iso <= hasta;
}

/*
  Dibuja un calendario mensual dentro de `caja`.

  publicaciones : las filas de la tabla publicaciones
  alElegirDia   : función que recibe (iso, publicacionesDeEseDia). Si el
                  estudiante deselecciona, recibe (null, []).
  alCambiarMes  : opcional. Recibe (anio, mes) cada vez que se cambia de
                  mes, y una vez al montarse. Lo usa «Fechas» para abrir
                  abajo el grupo del mes que se está mirando arriba.
*/
function montarCalendario(caja, publicaciones, alElegirDia, alCambiarMes){
  const hoy   = hoyISO();
  const parteHoy = partesFecha(hoy);

  let anio = parteHoy.anio;
  let mes  = parteHoy.mes;      // 1-12
  let elegido = null;

  /* La referencia nombra SOLO las líneas que de verdad tienen fechas
     cargadas. Una leyenda que explica un color que no está en la
     grilla no ayuda: hace dudar de si uno se perdió algo. */
  function referencia(){
    const presentes = Object.keys(NOMBRE_LINEA)
      .filter(l => publicaciones.some(p => p.linea === l && p.fecha_desde));
    if (!presentes.length) return '';
    return `<div class="cal-referencia">${presentes.map(l =>
      `<span><i class="cal-punto ${esc(l)}"></i> ${esc(NOMBRE_LINEA[l])}</span>`
    ).join('')}</div>`;
  }

  caja.innerHTML = `
    <div class="calendario">
      <div class="cal-cabecera">
        <button class="cal-flecha" id="cal-antes"  aria-label="Mes anterior">‹</button>
        <div class="cal-mes" id="cal-mes"></div>
        <button class="cal-flecha" id="cal-despues" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-grilla" id="cal-grilla"></div>
      ${referencia()}
    </div>`;

  const grilla    = caja.querySelector('#cal-grilla');
  const tituloMes = caja.querySelector('#cal-mes');

  function publicacionesDe(iso){
    return publicaciones.filter(p => caeEnElDia(p, iso));
  }

  function dibujar(){
    tituloMes.textContent = `${MESES_LARGO[mes-1]} ${anio}`.toUpperCase();

    /* getDay() da 0 para domingo; acá la semana arranca el lunes */
    const primerDia   = (new Date(anio, mes-1, 1).getDay() + 6) % 7;
    const diasDelMes  = new Date(anio, mes, 0).getDate();

    /* Miércoles va con X, como en el calendario del inicio: con dos M
       seguidas no se sabe cuál es martes. */
    let html = ['L','M','X','J','V','S','D']
      .map(d => `<div class="cal-nombre-dia">${d}</div>`).join('');

    for (let i = 0; i < primerDia; i++)
      html += `<button class="cal-dia vacio" tabindex="-1"></button>`;

    for (let d = 1; d <= diasDelMes; d++){
      const iso   = armarISO(anio, mes, d);
      const suyas = publicacionesDe(iso);

      /* Una FRANJA por línea presente, no un punto por día.
         La diferencia no es estética: una inscripción que dura tres
         semanas es UNA cosa, y marcada con veinte puntos iguales se
         lee como veinte. Estirada, se lee como el período que es, y
         el resto de los días vuelven a destacarse por contraste. */
      const lineas = [...new Set(suyas.map(p => p.linea))].slice(0, 2);
      const franjas = lineas.map((l, i) => {
        const sigue = vecino =>
          publicaciones.some(p => p.linea === l && caeEnElDia(p, vecino));
        return `<span class="cal-barra ${esc(l)}${
          sigue(isoVecino(iso, -1)) ? ' sigue-izq' : ''}${
          sigue(isoVecino(iso,  1)) ? ' sigue-der' : ''}${
          i ? ' segunda' : ''}"></span>`;
      }).join('');

      const clases = ['cal-dia'];
      if (suyas.length) clases.push('con-cosas'); else clases.push('apagado');
      if (iso === hoy)  clases.push('hoy');

      html += `<button class="${clases.join(' ')}" data-dia="${iso}"
                 aria-pressed="${iso === elegido}"
                 ${suyas.length ? '' : 'disabled'}
                 aria-label="${d} de ${MESES_LARGO[mes-1]}${
                   suyas.length ? ', ' + suyas.length + ' actividad' + (suyas.length>1?'es':'') : ''}">
                 <span class="cal-numero">${d}</span>${franjas}</button>`;
    }

    grilla.innerHTML = html;
  }

  function elegir(iso){
    elegido = (elegido === iso) ? null : iso;
    dibujar();
    alElegirDia(elegido, elegido ? publicacionesDe(elegido) : []);
  }

  grilla.addEventListener('click', ev => {
    const b = ev.target.closest('[data-dia]');
    if (b && !b.disabled) elegir(b.dataset.dia);
  });

  function irAlMes(paso){
    mes += paso;
    if (mes < 1){ mes = 12; anio--; }
    if (mes > 12){ mes = 1;  anio++; }
    dibujar();
    if (alCambiarMes) alCambiarMes(anio, mes);
  }
  caja.querySelector('#cal-antes').onclick   = () => irAlMes(-1);
  caja.querySelector('#cal-despues').onclick = () => irAlMes(1);

  dibujar();
  if (alCambiarMes) alCambiarMes(anio, mes);
}

/* ------------------------------------------------------------
   SESION
   ------------------------------------------------------------ */

/* Devuelve {usuario, perfil} o {usuario:null, perfil:null} */
async function sesionActual(){
  const { data:{ user } } = await db.auth.getUser();
  if(!user) return { usuario:null, perfil:null };
  const { data:perfil } = await db
    .from('perfiles').select('*').eq('id', user.id).maybeSingle();
  return { usuario:user, perfil:perfil || null };
}

function esDelEquipo(perfil){ return !!perfil && perfil.rol === 'equipo'; }

/* ------------------------------------------------------------
   PARTES VISUALES REPETIDAS
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   LAS SECCIONES DE LA APP

   El orden de acá es el orden en que aparecen arriba y en el menú.
   Para cambiar un nombre se toca SOLO este renglón: se actualiza en
   las siete pantallas de una.

   Son siete, así que la fila de arriba se desliza en el celular. Se
   ven las primeras cinco y las otras dos están a un empujón.
   ------------------------------------------------------------ */
const SECCIONES = [
  { id:'inicio',     texto:'Inicio',          icono:'🏠', url:RAIZ },
  { id:'tramites',   texto:'Info útil',       icono:'🧭', url:RAIZ+'tramites/' },
  { id:'carrera',    texto:'Mi año',          icono:'🎓', url:RAIZ+'carrera/' },
  { id:'estudiemos', texto:'Estudiemos',      icono:'📚', url:RAIZ+'estudiemos/' },
  { id:'agenda',     texto:'Fechas',          icono:'📅', url:RAIZ+'agenda/' },
  { id:'mi',         texto:'Perfil',          icono:'👤', url:RAIZ+'mi/' },
  { id:'quienes',    texto:'¿Quiénes somos?', icono:'✊', url:RAIZ+'quienes/' }
];

/* ------------------------------------------------------------
   CABECERA
   Tres partes: el menu a la izquierda, la marca en el centro y
   Mi cuenta a la derecha. La marca queda centrada de verdad porque
   las tres columnas de los costados miden lo mismo.
   ------------------------------------------------------------ */
function htmlCabecera(){
  /* El enlace de saltar va PRIMERO de todo: es la única forma de que,
     navegando con teclado, no haya que pasar por el menú y las siete
     secciones en cada pantalla. Solo se ve cuando se lo enfoca. */
  return `<a class="saltar" href="#contenido">Saltar al contenido</a>
    <header class="cabecera">
      <div class="envoltura barra-superior">
        <button class="boton-icono" id="abrir-menu" aria-label="Abrir el menú"
                aria-expanded="false" aria-controls="menu-lateral">${icono('menu') || '☰'}</button>
        <a class="marca-centro" href="${RAIZ}">
          <img class="marca-logo" src="${RAIZ}imagenes/marca-amarilla.webp"
               alt="" width="260" height="215">
          <span class="marca-texto">
            <span class="marca">LA BOLÍVAR <em>CON VOS</em></span>
            <small>Agrupación Simón Bolívar · FTS UNLP</small>
          </span>
        </a>
        <a class="boton-icono" href="${RAIZ}mi/" aria-label="Mi perfil">${icono('mi') || '👤'}</a>
      </div>
    </header>`;
}

/* ============================================================
   LOS TÍTULOS DE SECCIÓN SON TÍTULOS DE VERDAD

   «A DÓNDE IR», «LO QUE SE VIENE» y compañía se dibujan con un <div>.
   Para el ojo alcanza; para un lector de pantalla no existen, y la
   pantalla queda como una lista plana de sesenta elementos sin
   ninguna estructura.

   Se marcan acá, en un solo lugar, en vez de tocar los treinta lugares
   donde se generan. El observador los agarra también cuando aparecen
   después, que es lo que pasa en casi todas las pantallas: el
   contenido llega de Supabase y se dibuja recién ahí.
   ============================================================ */
/* ============================================================
   LOS COLORES DE LA PANTALLA

   Tres opciones: automático (sigue al teléfono, y es lo que viene
   puesto), claro y oscuro.

   Quien decide es el atributo data-tema del <html>, que ya dejó puesto
   el script del <head> antes de dibujar nada. Acá solo se cambia
   cuando la persona toca una opción.

   Por qué tres y no un interruptor de dos: con dos, apenas tocás una
   vez perdés para siempre la opción de seguir al teléfono. Con tres se
   puede volver.
   ============================================================ */
const TEMAS = ['auto', 'claro', 'oscuro'];

function temaGuardado(){
  let g = 'auto';
  try { g = localStorage.getItem('bolivar-tema') || 'auto'; } catch(e){}
  return TEMAS.indexOf(g) === -1 ? 'auto' : g;
}

function aplicarTema(cual){
  const oscuro = cual === 'oscuro' || (cual === 'auto' &&
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro';

  /* La barra de arriba del navegador en el celular también acompaña */
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', oscuro ? '#17160F' : '#F9E830');
}

function pintarTema(){
  const guardado = temaGuardado();
  aplicarTema(guardado);

  document.querySelectorAll('[data-tema-op]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.temaOp === guardado ? 'true' : 'false');
    b.onclick = () => {
      try { localStorage.setItem('bolivar-tema', b.dataset.temaOp); } catch(e){}
      pintarTema();
    };
  });
}

/* Si está en automático y la persona cambia el modo del teléfono con la
   app abierta, la app acompaña sin que haya que recargar. */
if (window.matchMedia){
  const consulta = window.matchMedia('(prefers-color-scheme: dark)');
  const alCambiar = () => { if (temaGuardado() === 'auto') aplicarTema('auto'); };
  if (consulta.addEventListener) consulta.addEventListener('change', alCambiar);
  else if (consulta.addListener) consulta.addListener(alCambiar);
}

/* La lupa del buscador estaba escrita como emoji en las tres pantallas
   que tienen buscador. Un emoji lo dibuja cada teléfono a su manera y
   quedaba de otro color y otro peso que el resto de los íconos. */
function ponerLupa(donde){
  const dibujo = icono('buscador');
  if (!dibujo) return;                       /* sin ícono, se queda el emoji */
  (donde || document).querySelectorAll('.lupa:not(.ya-cambiada)').forEach(l => {
    l.innerHTML = dibujo;
    l.classList.add('ya-cambiada');
  });
}

function marcarTitulos(donde){
  (donde || document).querySelectorAll('.titulo-seccion:not([role])')
    .forEach(t => { t.setAttribute('role', 'heading'); t.setAttribute('aria-level', '2'); });
}

/* Casi todo el contenido llega de Supabase y se dibuja después de que
   la pantalla ya existe. Por eso no alcanza con arreglar una vez al
   arrancar: hay que mirar también lo que aparece más tarde. */
function vigilarTitulos(){
  const repasar = () => { marcarTitulos(); ponerLupa(); };
  repasar();
  if (!window.MutationObserver) return;

  /* EL REPASO VA EN LOS RATOS LIBRES, NO EN EL ACTO.

     Este observador mira TODO el body y, cada vez que algo cambia,
     recorre el documento entero dos veces buscando títulos y lupas.
     Además escribe innerHTML, o sea que se vuelve a disparar a sí
     mismo. Sin freno, eso pasaba en cada pintada de lista, en cada
     mensaje del chat y en cada cuadro de las pantallas que se arman de
     a pedazos: justo mientras algo se está animando, que es cuando el
     hilo principal no tiene nada de sobra.

     Con requestIdleCallback el repaso espera a que el navegador haya
     terminado de dibujar. Nada de esto es urgente —son atributos de
     accesibilidad y un ícono— y esperar dos cuadros no se nota. Lo que
     sí se nota es el tirón cuando se hace en el medio.

     El agrupador es lo otro que importa: veinte mutaciones seguidas
     —que es lo que produce un innerHTML— ahora son UN repaso, no
     veinte. En navegadores sin requestIdleCallback, un setTimeout de
     cero cumple la misma función de agrupar. */
  let pedido = null;
  const enCuantoSePueda = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 500 })
    : (fn) => setTimeout(fn, 0);

  const agendarRepaso = () => {
    if (pedido !== null) return;
    pedido = enCuantoSePueda(() => { pedido = null; repasar(); });
  };

  new MutationObserver(agendarRepaso)
    .observe(document.body, { childList: true, subtree: true });
}

/* ------------------------------------------------------------
   LAS SECCIONES, debajo de la cabecera, y el menu lateral

   Antes esto era una barra fija abajo de la pantalla. Ahora la
   navegacion vive arriba: se ve donde estas parado sin tapar
   contenido, y se recuperan los 64px que comia la barra.
   ------------------------------------------------------------ */
function pintarNav(actual){
  const cabecera = document.querySelector('.cabecera');
  if (!cabecera) return;

  cabecera.insertAdjacentHTML('afterend',
    `<nav class="secciones" aria-label="Secciones"><div class="envoltura secciones-fila">` +
    SECCIONES.map(s => `<a href="${s.url}"${s.id===actual ? ' aria-current="page"' : ''}>
        <span class="icono">${icono(s.id) || s.icono}</span>${esc(s.texto)}</a>`).join('') +
    `</div></nav>`);

  /* El menu lateral repite las secciones y suma lo que no entra arriba */
  document.body.insertAdjacentHTML('beforeend', `
    <div class="menu-fondo" id="menu-fondo" hidden></div>
    <nav class="menu-lateral" id="menu-lateral" aria-label="Menú" hidden>
      <div class="menu-encabezado">
        <span class="marca">LA BOLÍVAR <em>CON VOS</em></span>
        <button class="boton-icono" id="cerrar-menu" aria-label="Cerrar el menú">✕</button>
      </div>
      <div class="menu-lista">
        ${SECCIONES.map(s => `<a href="${s.url}"${s.id===actual ? ' aria-current="page"' : ''}>
            <span class="icono">${icono(s.id) || s.icono}</span>${esc(s.texto)}</a>`).join('')}
      </div>
      <div class="menu-tema">
        <span class="menu-tema-rotulo">Colores de la pantalla</span>
        <div class="tema-opciones" role="group" aria-label="Colores de la pantalla">
          <button type="button" data-tema-op="auto">Automático</button>
          <button type="button" data-tema-op="claro">Claro</button>
          <button type="button" data-tema-op="oscuro">Oscuro</button>
        </div>
      </div>
      <div class="menu-pie">
        Agrupación Simón Bolívar<br>Conducción del CEFTS · FTS UNLP
      </div>
    </nav>`);

  pintarTema();

  pintarAvisanos();
  vigilarTitulos();
  ponerLupa();

  /* Con siete secciones la fila no entra en un celular y se desliza. Traemos
     al centro la sección donde estás parada, si no en «¿Quiénes somos?» la
     marca de "estás acá" queda fuera de la pantalla y no se ve dónde estás.
     Movemos la fila, nunca la página: por eso scrollLeft y no scrollIntoView. */
  const activo = document.querySelector('.secciones-fila a[aria-current="page"]');
  if (activo){
    const fila = activo.parentElement;
    fila.scrollLeft = activo.offsetLeft - (fila.clientWidth - activo.offsetWidth) / 2;
  }

  const fondo = document.getElementById('menu-fondo');
  const panel = document.getElementById('menu-lateral');
  const boton = document.getElementById('abrir-menu');

  /* El cajón se abre deslizándose desde el borde izquierdo y se cierra
     por donde vino. La entrada la resuelve el CSS solo con
     @starting-style: basta con sacarle el hidden.

     La salida no puede: si escondiéramos el panel en el acto, no habría
     nada que animar. Así que se le pone .cerrando, se espera a que el
     movimiento TERMINE —el evento, no un número de milisegundos
     copiado del CSS— y recién ahí se esconde. El respaldo por tiempo
     está por si la transición nunca se dispara: pestaña en segundo
     plano, animaciones apagadas por el sistema. Sin ese respaldo, una
     transición que no arranca deja el cajón trabado en pantalla. */
  let cerrando = null;
  function abrir(si){
    clearTimeout(cerrando);
    if (si){
      fondo.classList.remove('cerrando');
      panel.classList.remove('cerrando');
      fondo.hidden = false; panel.hidden = false;
      if (boton) boton.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      panel.querySelector('a').focus();
      return;
    }

    if (boton) boton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (panel.hidden) return;

    const guardar = () => {
      clearTimeout(cerrando);
      fondo.hidden = true; panel.hidden = true;
      fondo.classList.remove('cerrando');
      panel.classList.remove('cerrando');
      /* El foco vuelve al botón que lo abrió: quien navega con teclado
         no puede quedar parado sobre algo que ya no está en pantalla. */
      if (boton) boton.focus();
    };
    panel.addEventListener('transitionend', guardar, { once:true });
    cerrando = setTimeout(guardar, 500);
    fondo.classList.add('cerrando');
    panel.classList.add('cerrando');
  }
  if (boton) boton.addEventListener('click', () => abrir(true));
  document.getElementById('cerrar-menu').addEventListener('click', () => abrir(false));
  fondo.addEventListener('click', () => abrir(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) abrir(false);
  });
}

/* ------------------------------------------------------------
   EL BOTON "AVISANOS"

   Fijo abajo a la derecha, en todas las pantallas. Es la puerta
   para contar un problema con una materia o con un docente: el tipo
   de cosa que un centro de estudiantes puede resolver y la facultad
   no se entera.

   A DONDE LLEVA: cambiá esta linea por el link que quieran usar.
   Puede ser un formulario, el Instagram o un correo. Mientras tanto
   va a "Quiénes somos", donde están los contactos.
   ------------------------------------------------------------ */
const AVISANOS_URL = RAIZ + 'quienes/';

function pintarAvisanos(){
  if (document.querySelector('.avisanos')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <a class="avisanos" id="avisanos" href="${AVISANOS_URL}"
       aria-haspopup="dialog"
       aria-label="Avisanos: preguntá lo que necesites">
      <svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a20,20,0,0,0,25.24,25.24l34.05-11.35A104,104,0,1,0,128,24Zm0,184a83.68,83.68,0,0,1-40.79-10.54,4,4,0,0,0-3.21-.25L49.15,208.85l11.64-34.85a4,4,0,0,0-.25-3.21A84,84,0,1,1,128,208Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,120Zm-12-64a12,12,0,0,0-12,12v28a12,12,0,0,0,24,0V68A12,12,0,0,0,128,56Z"/></svg>
      <span>Avisanos</span>
      <span class="avisanos-globo">¿Problemas con una materia o docente?</span>
    </a>`);

  const boton = document.getElementById('avisanos');

  /* El chat se baja recién cuando alguien lo toca. Son unos 12 KB que
     la mayoría no usa nunca, y en un celular con datos contados eso
     importa más que el parpadeo de la primera apertura.

     Sigue siendo un <a> con href de verdad: si el archivo no baja
     -sin señal, o el servidor caído- el enlace lleva a «Quiénes
     somos», donde están los contactos escritos. La función vieja
     sigue estando abajo de la nueva. */
  boton.addEventListener('click', function(ev){
    if (window.Avisanos){ ev.preventDefault(); window.Avisanos.abrir(); return; }

    ev.preventDefault();
    boton.classList.add('cargando');
    const s = document.createElement('script');
    s.src = RAIZ + 'lib/avisanos.js';
    s.onload = () => {
      boton.classList.remove('cargando');
      if (window.Avisanos) window.Avisanos.abrir();
      else location.href = AVISANOS_URL;
    };
    s.onerror = () => { boton.classList.remove('cargando'); location.href = AVISANOS_URL; };
    document.head.appendChild(s);
  });

  let yaSalio = false;
  try { yaSalio = !!sessionStorage.getItem('bolivar-avisanos-visto'); } catch(e){}

  /* En el celular no existe el "pasar por encima", así que hay que
     mostrar de alguna forma para qué sirve el botón.

     TRES INTENTOS Y POR QUÉ ESTE.

     El primero fue un globo que salía solo a los pocos segundos de
     abrir. Tapaba el calendario justo cuando la persona lo estaba
     mirando, que era a lo que había venido.

     El segundo fue hacer que el botón naciera con la palabra adentro y
     se encogiera a círculo a los cuatro segundos. Sacaba el problema de
     tapar, pero traía uno peor: el botón cambiaba de forma solo, en el
     medio de la lectura, y el cambio era un salto seco. No se podía
     suavizar sin animar el ancho, que obliga a recalcular la página en
     cada cuadro. Una interfaz que se transforma sola mientras leés es
     de las pocas cosas que se sienten mal aunque estén bien hechas.

     Este es el tercero: el globo vuelve, pero espera al primer gesto de
     SUBIR. Subir significa «terminé de leer esto, busco otra cosa», y
     es exactamente el momento en que un cartel que dice para qué sirve
     este botón no molesta a nadie: no hay nada que tapar porque la
     persona ya no está leyendo, está buscando. Sale una vez por sesión
     y se va sola a los cuatro segundos, o antes si se vuelve a bajar.

     El botón, mientras tanto, no cambia nunca de forma. */
  const sinHover = !window.matchMedia ||
    window.matchMedia('(hover: none)').matches;
  let globoFuera = null;

  function mostrarGlobo(){
    /* La preferencia se consulta ACÁ y no al cargar la pantalla: si
       alguien la activó hace un minuto, el globo ya no sale. */
    if (yaSalio || !sinHover || menosMovimiento()) return;
    if (globoFuera !== null) return;
    boton.classList.add('dice');
    try { sessionStorage.setItem('bolivar-avisanos-visto', '1'); } catch(e){}
    globoFuera = setTimeout(esconderGlobo, 4000);
  }
  function esconderGlobo(){
    if (globoFuera === null) return;
    clearTimeout(globoFuera);
    boton.classList.remove('dice');
  }

  /* El botón está fijo, así que SIEMPRE hay algo tapado abajo a la
     derecha: el calendario al abrir, un cuadro de «A dónde ir» al bajar,
     el pie al final. Se aparta mientras se baja —que es cuando la
     persona está leyendo— y vuelve apenas se sube, que es el gesto de
     «quiero volver a algo». Así nunca queda encima de lo que se está
     mirando, y tampoco hay que ir a buscarlo. */
  let ultimo = window.scrollY, pendiente = false;
  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      /* Los saltitos de menos de 6 px no cuentan: si no, el botón
         parpadea con el rebote del dedo. */
      if (Math.abs(y - ultimo) > 6){
        const bajando = y > ultimo && y > 240;
        boton.classList.toggle('apartado', bajando);
        /* Subiendo y con la página ya recorrida: es el momento del
           globo. Bajando, se va, aunque no hayan pasado los 4 segundos:
           la persona volvió a leer. */
        if (bajando) esconderGlobo();
        else if (y > 240) mostrarGlobo();
        ultimo = y;
      }
      pendiente = false;
    });
  }, { passive: true });
}

function htmlPie(){
  return `<footer class="pie">
      <strong>La Bolívar con vos</strong><br>
      Agrupación Simón Bolívar · Conducción del CEFTS<br>
      Facultad de Trabajo Social · UNLP
      <span class="pie-nota">Esta app la hacemos entre nosotras y nosotros.
        Si algo falta, está mal o no se entiende, decinos.</span>
      <a class="pie-enlace" href="${RAIZ}quienes/">¿Quiénes somos?</a>
    </footer>`;
}

/* Mensaje de error visible, en castellano, sin jerga */
function mostrarError(contenedor, error, queEstabaHaciendo){
  console.error(queEstabaHaciendo, error);
  const detalle = error && (error.message || error.error_description) || 'Error desconocido';
  contenedor.innerHTML =
    `<div class="aviso error"><strong>No se pudo ${esc(queEstabaHaciendo)}.</strong><br>
     ${esc(detalle)}<br>
     <small>Si esto sigue pasando, avisale al equipo de la agrupación.</small></div>`;
}

/* ------------------------------------------------------------
   NO ESPERAR PARA SIEMPRE

   Una consulta puede no fallar y tampoco contestar: se queda colgada.
   Sin esto, la pantalla se queda en "Cargando..." sin fin y la
   persona no sabe si esperar o irse.

   Envolviendo la consulta con esto, a los 12 segundos se corta y
   salta el aviso de error de siempre.
   ------------------------------------------------------------ */
function conPaciencia(promesa, segundos){
  const espera = new Promise((_, rechazar) =>
    setTimeout(() => rechazar(new Error(
      'La conexión está tardando demasiado. Puede ser tu red, o que el ' +
      'servidor esté despertando: probá de nuevo en un minuto.')),
      (segundos || 12) * 1000));
  return Promise.race([promesa, espera]);
}

/* ------------------------------------------------------------
   LO GUARDADO ENTRE VISITAS

   La segunda entrada a una pantalla no tiene por qué ser una pantalla
   en blanco esperando a la red. Acá se guarda lo que trajo la visita
   anterior, para pintarlo MIENTRAS se busca lo de ahora. Mientras, no
   en lugar de: el pedido a la base sale igual, siempre.

   POR QUÉ ACÁ Y NO EN EL SERVICE WORKER

   `sw.js` se niega a guardar respuestas de Supabase, y hace bien: él
   entrega la respuesta y la página no puede saber si vino de la red o
   de una caja guardada, así que pintaría una fecha de la semana pasada
   como si fuera de hoy. Esa regla no se toca.

   La página sí puede. Es el único lugar que tiene las dos cosas juntas
   —el dato y la pantalla—, así que es el único que puede decir «esto
   que estás viendo es de antes, aguantá que busco lo de ahora». La
   diferencia entre viejo y mentiroso es que lo viejo lo avisa.

   LO QUE NO ENTRA ACÁ

   · Nada que dependa de una sesión: trámites guardados, preparaciones,
     perfil. En una computadora de la facultad, eso se lo lleva quien
     entra después.
   · Nada con fecha que llame a actuar: la alarma de inscripción, el
     renglón de «lo próximo», el calendario y la pantalla Fechas se
     pintan solo con lo que vino de la red. Una alarma que dice «te
     quedan tres días» es un llamado a hacer algo ahora; ponerle al
     lado un cartel de «guardado» es contradecirse.
   ------------------------------------------------------------ */

const GUARDADO_PREFIJO = 'bolivar-guardado-';

/* Pasada una semana ya no es «viejo mientras carga», es viejo y
   punto: se tira y la pantalla espera a la red como el primer día. */
const GUARDADO_VIDA = 7 * 24 * 60 * 60 * 1000;

function memoriaDe(pantalla){
  try {
    const crudo = localStorage.getItem(GUARDADO_PREFIJO + pantalla);
    if (!crudo) return null;
    const g = JSON.parse(crudo);
    if (!g || !g.cuando || !g.datos) return null;
    /* Una edad negativa es un reloj adelantado que despues se
       corrigio: eso no es memoria fresca, es memoria rota. */
    const edad = Date.now() - g.cuando;
    if (edad < 0 || edad > GUARDADO_VIDA){
      localStorage.removeItem(GUARDADO_PREFIJO + pantalla);
      return null;
    }
    return { datos: g.datos, cuando: g.cuando };
  } catch(e){ return null; }
}

function guardarEnMemoria(pantalla, datos){
  try {
    localStorage.setItem(GUARDADO_PREFIJO + pantalla,
      JSON.stringify({ cuando: Date.now(), datos: datos }));
  } catch(e){ /* modo incognito, o memoria llena: se sigue sin guardar */ }
}

/* «hace un rato», «ayer», «hace 3 dias». En palabras y no en fecha
   exacta porque lo que importa no es CUANDO se guardo sino CUANTO
   hace: nadie sabe si el 28 de agosto fue hace mucho. */
function desdeCuando(cuando){
  const minutos = Math.round((Date.now() - cuando) / 60000);
  if (minutos < 60) return 'hace un rato';
  const horas = Math.round(minutos / 60);
  if (horas < 24) return 'hace ' + horas + (horas === 1 ? ' hora' : ' horas');
  const dias = Math.round(horas / 24);
  if (dias <= 1) return 'ayer';
  return 'hace ' + dias + ' días';
}

/* El renglon del aviso vive debajo de la fila de secciones, que es
   donde empieza el contenido de todas las pantallas. */
function cajaDelAviso(){
  let caja = document.getElementById('aviso-guardado');
  if (caja) return caja;
  const donde = document.querySelector('.secciones') ||
                document.querySelector('.cabecera');
  if (!donde) return null;
  caja = document.createElement('div');
  caja.id = 'aviso-guardado';
  caja.setAttribute('role', 'status');
  donde.insertAdjacentElement('afterend', caja);
  return caja;
}

/* La caja nace vacia y se llena un instante despues a proposito: un
   role="status" que aparece con el texto ya adentro no siempre lo
   anuncian los lectores de pantalla, porque nunca lo vieron cambiar. */
function ponerAviso(clase, texto){
  const caja = cajaDelAviso();
  if (!caja) return;
  caja.className = clase;
  setTimeout(function(){ caja.textContent = texto; }, 0);
}

/* Mientras se busca lo de ahora: un renglon fino, sin alarma, porque
   no esta pasando nada malo y ademas dura lo que tarde la red. */
function avisarMostrandoGuardado(cuando){
  ponerAviso('aviso-guardado buscando',
    'Esto es lo que guardamos ' + desdeCuando(cuando) + '. Buscando lo de ahora…');
}

/* Cuando la red no contesto: ahi si el aviso se agranda y se queda,
   porque lo que hay en pantalla es lo unico que va a haber. */
function avisarNoSePudoActualizar(cuando){
  ponerAviso('aviso-guardado sin-red',
    'Sin conexión. Esto es lo que guardamos ' + desdeCuando(cuando) +
    ', así que puede haber cambiado.');
}

function sacarAvisoGuardado(){
  const caja = document.getElementById('aviso-guardado');
  if (caja) caja.remove();
}

/* ------------------------------------------------------------
   TENER LA APP A MANO

   Dos cosas separadas que trabajan juntas:

   · El service worker guarda el armazón, así la app abre sin señal y
     sin volver a gastar datos. Se registra en toda pantalla.

   · La invitación a ponerla en la pantalla de inicio. NO aparece en la
     primera visita: aparece cuando la persona ya cargó algo suyo, o
     sea cuando ya tiene algo que perder. Ahí el motivo es cierto y se
     puede decir sin vender nada.

   Sobre iOS: Safari no deja instalar desde un botón. No existe la API.
   Lo único que se puede hacer es explicar dónde está Compartir. Por eso
   la invitación tiene dos formas, y no es un descuido.
   ------------------------------------------------------------ */

if ('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register(RAIZ + 'sw.js', { scope: RAIZ })
      .catch(function(){ /* sin service worker la app anda igual, solo sin guardar */ });
  });
}

/* Chrome avisa una sola vez que se puede instalar, y hay que atajarlo
   antes de que se vaya. Se guarda para usarlo en el momento elegido. */
let __invitacionDelNavegador = null;
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  __invitacionDelNavegador = e;
});

const LLAVE_INSTALAR = 'bolivar-instalar-visto';

function yaEstaInstalada(){
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}
function esiOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function seDijoQueNo(){
  try { return localStorage.getItem(LLAVE_INSTALAR) === 'no'; } catch(e){ return true; }
}
function anotarQueSeVio(valor){
  try { localStorage.setItem(LLAVE_INSTALAR, valor); } catch(e){}
}

/* ¿Tiene sentido invitar ahora? Si ya está instalada, si ya dijeron que
   no, o si el navegador no puede hacer nada, la respuesta es no. */
function sePuedeInvitarAInstalar(){
  if (yaEstaInstalada() || seDijoQueNo()) return false;
  return !!__invitacionDelNavegador || esiOS();
}

/* La invitación. «motivo» es la frase que explica por qué ahora: la
   escribe quien la llama, porque depende de lo que la persona acaba de
   hacer. */
function invitarAInstalar(motivo){
  if (!sePuedeInvitarAInstalar()) return false;

  const enIOS = !__invitacionDelNavegador && esiOS();
  const caja = document.createElement('div');
  caja.className = 'invitacion-instalar';
  caja.innerHTML =
    '<div class="invitacion-hoja">' +
      '<p class="invitacion-ceja">Para que no se te pierda</p>' +
      '<h2>Tenela en la<br>pantalla de inicio</h2>' +
      '<p class="invitacion-motivo">' + esc(motivo || '') + '</p>' +
      (enIOS
        ? '<ol class="invitacion-pasos">' +
            '<li>Tocá <b>Compartir</b> abajo de todo</li>' +
            '<li>Elegí <b>Agregar a inicio</b></li>' +
          '</ol>' +
          '<button class="boton ancho" data-cerrar>Listo</button>'
        : '<button class="boton ancho" data-instalar>Agregar a la pantalla de inicio</button>') +
      '<button class="boton texto ancho" data-no>Ahora no</button>' +
    '</div>';

  document.body.appendChild(caja);

  function cerrar(){
    caja.classList.add('cerrando');
    setTimeout(function(){ caja.remove(); }, 220);
  }
  caja.querySelector('[data-no]').onclick = function(){
    anotarQueSeVio('no'); cerrar();
  };
  const listo = caja.querySelector('[data-cerrar]');
  if (listo) listo.onclick = function(){ anotarQueSeVio('ios'); cerrar(); };

  const boton = caja.querySelector('[data-instalar]');
  if (boton) boton.onclick = async function(){
    const invitacion = __invitacionDelNavegador;
    __invitacionDelNavegador = null;
    anotarQueSeVio('pedida');
    cerrar();
    if (invitacion) { invitacion.prompt(); await invitacion.userChoice; }
  };

  /* Tocar afuera es lo mismo que «ahora no», pero sin darlo por
     rechazado para siempre: pudo ser sin querer. */
  caja.addEventListener('click', function(e){
    if (e.target === caja) cerrar();
  });
  return true;
}
