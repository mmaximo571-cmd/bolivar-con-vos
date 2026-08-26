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

const NOMBRE_LINEA = {
  frente:  'Frente político',
  gremial: 'Gremial',
  info:    'Info importante',
  saberes: 'Saberes colectivos'
};

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

/* Barra de navegacion de abajo. actual: inicio | tramites | agenda | mi */
function pintarNav(actual){
  const items = [
    { id:'inicio',   texto:'Inicio',   icono:'🏠', url:RAIZ },
    { id:'tramites', texto:'Trámites', icono:'🧭', url:RAIZ+'tramites/' },
    { id:'agenda',   texto:'Agenda',   icono:'📅', url:RAIZ+'agenda/' },
    { id:'mi',       texto:'Mi cuenta',icono:'👤', url:RAIZ+'mi/' }
  ];
  document.body.insertAdjacentHTML('beforeend',
    `<nav class="nav-abajo">` +
    items.map(i => `<a href="${i.url}"${i.id===actual ? ' aria-current="page"' : ''}>
        <span class="icono">${i.icono}</span>${esc(i.texto)}</a>`).join('') +
    `</nav>`
  );
}

/* Cabecera negra con la marca */
function htmlCabecera(botonDerecha){
  return `<header class="cabecera"><div class="envoltura">
      <a href="${RAIZ}" style="text-decoration:none">
        <div class="marca">LA BOLÍVAR<br><em>CON VOS</em>
          <small>Agrupación Simón Bolívar · FTS UNLP</small>
        </div>
      </a>
      ${botonDerecha || ''}
    </div></header>`;
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
