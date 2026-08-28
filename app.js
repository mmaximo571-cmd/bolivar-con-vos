/* ============================================================
   LA BOLIVAR CON VOS · funciones compartidas por todas las pantallas
   Se carga DESPUES de config.js y de la libreria de Supabase.
   Cada pantalla define antes window.RAIZ = "./" o "../"
   ============================================================ */

const RAIZ = window.RAIZ || './';

/* Cliente de Supabase */
const db = window.supabase.createClient(
  window.BOLIVAR_CONFIG.url,
  window.BOLIVAR_CONFIG.anonKey
);

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

/* Las secciones de la app, en el orden en que se muestran */
const SECCIONES = [
  { id:'inicio',   texto:'Inicio',    icono:'🏠', url:RAIZ },
  { id:'tramites', texto:'Trámites',  icono:'🧭', url:RAIZ+'tramites/' },
  { id:'carrera',  texto:'Cursadas',  icono:'🎓', url:RAIZ+'carrera/' },
  { id:'agenda',   texto:'Agenda',    icono:'📅', url:RAIZ+'agenda/' },
  { id:'mi',       texto:'Mi cuenta', icono:'👤', url:RAIZ+'mi/' }
];

/* ------------------------------------------------------------
   CABECERA
   Tres partes: el menu a la izquierda, la marca en el centro y
   Mi cuenta a la derecha. La marca queda centrada de verdad porque
   las tres columnas de los costados miden lo mismo.
   ------------------------------------------------------------ */
function htmlCabecera(){
  return `<header class="cabecera">
      <div class="envoltura barra-superior">
        <button class="boton-icono" id="abrir-menu" aria-label="Abrir el menú"
                aria-expanded="false" aria-controls="menu-lateral">☰</button>
        <a class="marca-centro" href="${RAIZ}">
          <span class="marca">LA BOLÍVAR <em>CON VOS</em></span>
          <small>Agrupación Simón Bolívar · FTS UNLP</small>
        </a>
        <a class="boton-icono" href="${RAIZ}mi/" aria-label="Mi cuenta">👤</a>
      </div>
    </header>`;
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
        <span class="icono">${s.icono}</span>${esc(s.texto)}</a>`).join('') +
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
            <span class="icono">${s.icono}</span>${esc(s.texto)}</a>`).join('')}
      </div>
      <div class="menu-pie">
        Agrupación Simón Bolívar<br>Conducción del CEFTS · FTS UNLP
      </div>
    </nav>`);

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

function htmlPie(){
  return `<footer class="pie">
      <strong>La Bolívar con vos</strong><br>
      Agrupación Simón Bolívar · Conducción del CEFTS<br>
      Facultad de Trabajo Social · UNLP
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
