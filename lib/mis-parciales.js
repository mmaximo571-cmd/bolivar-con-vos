/* ============================================================
   MIS PARCIALES · LO COMPARTIDO (11/10/2026)

   Lo usan dos pantallas: el organizador (`estudiemos/mis-parciales/`),
   donde se anotan los parciales y las preguntas de parciales viejos,
   y el inicio, que muestra cuántos días faltan para el que viene.
   Se carga DESPUÉS de app.js en las dos, pero no depende de él: si el
   service worker entrega un app.js viejo, la cuenta igual aparece.

   VIVE EN ESTE TELÉFONO (localStorage, como el pomodoro y la huella).
   Nada viaja a la base, y por eso no pide cuenta: anotar «Anatomo, 26
   de octubre» tiene que costar diez segundos, no un registro. La
   contracara es que si se borra el navegador se pierde, y el
   organizador lo dice con todas las letras. Las preguntas se pasan de
   un teléfono a otro como texto (Compartir / Pegar varias), que es
   como ya circulan: por el grupo de WhatsApp.

   La cuenta de días es de calendario, no de horas: un parcial del
   lunes a las 8 visto el domingo a las 23 es «mañana», no «en 9 horas».
   ============================================================ */
const LLAVE_PARCIALES = 'bolivar-mis-parciales';

const DIAS_PARCIAL  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MESES_PARCIAL = ['enero','febrero','marzo','abril','mayo','junio',
                       'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function escParcial(t){
  return String(t == null ? '' : t)
    .replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
}

/* Lo guardado se filtra al leer: una fila a medio escribir (o tocada
   a mano desde la consola) no tiene que tirar abajo la pantalla. */
const esFechaParcial = f => /^\d{4}-\d{2}-\d{2}$/.test(String(f || ''));
function leerMisParciales(){
  let g = null;
  try { g = JSON.parse(localStorage.getItem(LLAVE_PARCIALES) || 'null'); } catch(e){}
  if (!g || typeof g !== 'object') g = {};
  return {
    parciales: (Array.isArray(g.parciales) ? g.parciales : [])
      .filter(p => p && p.id && p.materia && esFechaParcial(p.fecha)),
    preguntas: (Array.isArray(g.preguntas) ? g.preguntas : [])
      .filter(q => q && q.id && q.materia && q.texto)
  };
}
/* Devuelve si pudo: con la memoria llena o en una ventana privada de
   Safari, setItem tira error, y la pantalla tiene que avisarlo en vez
   de hacer como que guardó. */
function guardarMisParciales(d){
  try {
    localStorage.setItem(LLAVE_PARCIALES, JSON.stringify({ v:1, parciales:d.parciales, preguntas:d.preguntas }));
    return true;
  } catch(e){ return false; }
}

function diasHastaParcial(iso){
  if (!esFechaParcial(iso)) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const h = new Date();
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(h.getFullYear(), h.getMonth(), h.getDate())) / 86400000);
}

/* «lunes 26 de octubre». El año solo si no es este: casi siempre lo es. */
function fechaParcialLarga(iso){
  if (!esFechaParcial(iso)) return '';
  const [a, m, d] = iso.split('-').map(Number);
  const dia = DIAS_PARCIAL[new Date(a, m - 1, d).getDay()];
  return dia + ' ' + d + ' de ' + MESES_PARCIAL[m - 1] + (a !== new Date().getFullYear() ? ' de ' + a : '');
}

function cuantoFaltaParcial(dias){
  if (dias === 0) return 'Es hoy';
  if (dias === 1) return 'Es mañana';
  return 'Faltan ' + dias + ' días';
}

/* «Anatomofisiología» y «anatomofisiologia » son la misma materia. */
const claveMateria = t => String(t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

function proximosParciales(d){
  return d.parciales
    .filter(p => diasHastaParcial(p.fecha) >= 0)
    .sort((a, b) => (a.fecha + (a.hora || '99')).localeCompare(b.fecha + (b.hora || '99')));
}

/* ------------------------------------------------------------
   LA CUENTA DEL INICIO

   Aparece solo si hay un parcial de hoy en adelante. Sin parciales no
   se muestra nada, ni una invitación: el inicio ya está lleno, y una
   tarjeta que dice «anotá tus parciales» todos los días se vuelve
   ruido. A la pantalla se llega desde Estudiemos.
   ------------------------------------------------------------ */
function pintarCuentaParciales(caja){
  if (!caja) return;
  const d = leerMisParciales();
  const vienen = proximosParciales(d);
  if (!vienen.length){ caja.innerHTML = ''; caja.hidden = true; return; }

  const p = vienen[0];
  const dias = diasHastaParcial(p.fecha);
  const preguntas = d.preguntas.filter(q => claveMateria(q.materia) === claveMateria(p.materia)).length;
  const raiz = window.RAIZ || '/';

  const otros = vienen.length - 1;
  const mas = [];
  if (preguntas) mas.push(preguntas + (preguntas === 1 ? ' pregunta' : ' preguntas') + ' para practicar');
  if (otros) mas.push('y ' + otros + (otros === 1 ? ' parcial más' : ' parciales más'));

  caja.innerHTML = `
    <a class="cuenta-parciales${dias <= 3 ? ' cerca' : ''}" href="${raiz}estudiemos/mis-parciales/">
      <span class="cp-numero" aria-hidden="true">
        <b>${dias === 0 ? 'Hoy' : dias}</b>${dias === 0 ? '' : `<small>${dias === 1 ? 'día' : 'días'}</small>`}
      </span>
      <span class="cp-texto">
        <span class="cp-ceja">${cuantoFaltaParcial(dias)}</span>
        <strong>${escParcial(p.materia)}</strong>
        <span class="cp-cuando">${escParcial(p.que || 'Parcial')} · ${fechaParcialLarga(p.fecha)}${p.hora ? ' · ' + escParcial(p.hora) + ' h' : ''}</span>
        ${mas.length ? `<span class="cp-mas">${escParcial(mas.join(', '))}</span>` : ''}
      </span>
      <span class="cuadro-flecha" aria-hidden="true">→</span>
    </a>`;
  caja.hidden = false;
}
