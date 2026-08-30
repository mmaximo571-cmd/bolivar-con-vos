/* ============================================================
   LA BOLIVAR CON VOS · funciones compartidas por todas las pantallas
   Se carga DESPUES de config.js y de la libreria de Supabase.
   Cada pantalla define antes window.RAIZ = "./" o "../"
   ============================================================ */

const RAIZ = window.RAIZ || './';

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
  document.addEventListener('DOMContentLoaded', function(){
    document.body.innerHTML =
      '<div style="max-width:520px;margin:60px auto;padding:0 20px;' +
      'font-family:Roboto,sans-serif;line-height:1.5">' +
      '<h1 style="font-size:22px;margin-bottom:10px">No se pudo abrir la app</h1>' +
      '<p>' + motivo + '</p>' +
      '<p><a href="" style="font-weight:700">Probá de nuevo</a></p></div>';
  });
}

let db = null;
if (!window.supabase || !window.supabase.createClient){
  avisarQueNoArranca('No cargó una parte de la app. Suele ser la conexión: ' +
    'probá de nuevo, o con otra red.');
} else if (!window.BOLIVAR_CONFIG){
  avisarQueNoArranca('Falta la configuración de la app. Avisale al equipo.');
} else {
  db = window.supabase.createClient(
    window.BOLIVAR_CONFIG.url,
    window.BOLIVAR_CONFIG.anonKey
  );
}

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
*/
function montarCalendario(caja, publicaciones, alElegirDia){
  const hoy   = hoyISO();
  const parteHoy = partesFecha(hoy);

  let anio = parteHoy.anio;
  let mes  = parteHoy.mes;      // 1-12
  let elegido = null;

  caja.innerHTML = `
    <div class="calendario">
      <div class="cal-cabecera">
        <button class="cal-flecha" id="cal-antes"  aria-label="Mes anterior">‹</button>
        <div class="cal-mes" id="cal-mes"></div>
        <button class="cal-flecha" id="cal-despues" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-grilla" id="cal-grilla"></div>
      <div class="cal-referencia">
        <span><i class="cal-punto info"></i> Facultad</span>
        <span><i class="cal-punto gremial"></i> La Bolívar</span>
        <span><i class="cal-punto saberes"></i> Saberes colectivos</span>
      </div>
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

    let html = ['L','M','M','J','V','S','D']
      .map(d => `<div class="cal-nombre-dia">${d}</div>`).join('');

    for (let i = 0; i < primerDia; i++)
      html += `<button class="cal-dia vacio" tabindex="-1"></button>`;

    for (let d = 1; d <= diasDelMes; d++){
      const iso   = armarISO(anio, mes, d);
      const suyas = publicacionesDe(iso);

      /* Un punto por línea editorial presente, hasta tres */
      const lineas = [...new Set(suyas.map(p => p.linea))].slice(0,3);
      const puntos = lineas.length
        ? `<span class="cal-puntos">${lineas.map(l =>
             `<i class="cal-punto ${esc(l)}"></i>`).join('')}</span>`
        : `<span class="cal-puntos"></span>`;

      const clases = ['cal-dia'];
      if (suyas.length) clases.push('con-cosas'); else clases.push('apagado');
      if (iso === hoy)  clases.push('hoy');

      html += `<button class="${clases.join(' ')}" data-dia="${iso}"
                 aria-pressed="${iso === elegido}"
                 ${suyas.length ? '' : 'disabled'}
                 aria-label="${d} de ${MESES_LARGO[mes-1]}${
                   suyas.length ? ', ' + suyas.length + ' actividad' + (suyas.length>1?'es':'') : ''}">
                 <span>${d}</span>${puntos}</button>`;
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

  caja.querySelector('#cal-antes').onclick = () => {
    mes--; if (mes < 1){ mes = 12; anio--; } dibujar();
  };
  caja.querySelector('#cal-despues').onclick = () => {
    mes++; if (mes > 12){ mes = 1; anio++; } dibujar();
  };

  dibujar();
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
  new MutationObserver(repasar)
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

  function abrir(si){
    fondo.hidden = !si; panel.hidden = !si;
    if (boton) boton.setAttribute('aria-expanded', si ? 'true' : 'false');
    document.body.style.overflow = si ? 'hidden' : '';
    if (si) panel.querySelector('a').focus();
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
       aria-label="Avisanos: ¿problemas con una materia o docente?">
      <svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a20,20,0,0,0,25.24,25.24l34.05-11.35A104,104,0,1,0,128,24Zm0,184a83.68,83.68,0,0,1-40.79-10.54,4,4,0,0,0-3.21-.25L49.15,208.85l11.64-34.85a4,4,0,0,0-.25-3.21A84,84,0,1,1,128,208Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,120Zm-12-64a12,12,0,0,0-12,12v28a12,12,0,0,0,24,0V68A12,12,0,0,0,128,56Z"/></svg>
      <span>Avisanos</span>
      <span class="avisanos-globo">¿Problemas con una materia o docente?</span>
    </a>`);

  const boton = document.getElementById('avisanos');
  const quieto = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let yaSalio = false;
  try { yaSalio = !!sessionStorage.getItem('bolivar-avisanos-visto'); } catch(e){}

  /* En el celular no existe el "pasar por encima", así que hay que
     mostrar de alguna forma para qué sirve el botón.

     Antes se abría un globo con la pregunta. El problema es que un
     cartel que sale solo SIEMPRE tapa algo: tapaba el calendario justo
     al abrir la pantalla, que es lo que la persona vino a mirar.

     Ahora el botón nace con la palabra adentro y se encoge a círculo
     solo. Nunca ocupa más que su propio lugar en la esquina. */
  if (!yaSalio && !quieto && window.matchMedia('(hover: none)').matches){
    boton.classList.add('con-palabra');
    const encoger = () => {
      boton.classList.remove('con-palabra');
      try { sessionStorage.setItem('bolivar-avisanos-visto', '1'); } catch(e){}
      window.removeEventListener('scroll', encoger);
    };
    setTimeout(encoger, 4000);
    /* Si se pone a leer antes de los 4 segundos, se encoge en el acto */
    window.addEventListener('scroll', encoger, { passive:true, once:true });
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
        boton.classList.toggle('apartado', y > ultimo && y > 240);
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
