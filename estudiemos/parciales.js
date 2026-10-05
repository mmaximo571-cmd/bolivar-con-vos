/* ============================================================
   LA TIRA «ÉPOCA DE PARCIALES» (4/10/2026, propuesta 4)

   Se vienen los parciales y la gente vuelve a Mi año, no a estudiar:
   la semana del 27/9 al 3/10, Estudiemos y sus pantallas fueron el
   12 % de las visitas. Esta tira es donde cae el link del reel de
   parciales (marca/REEL-PARCIALES.md): arriba de todo, el mismo
   interruptor de Fechas y atajos a lo que sirve esas semanas.

   - EL INTERRUPTOR es el de Fechas, no uno nuevo, y se ve igual
     (`.enfoque`, de estilos-rediseno.css). Escribe la misma clave del
     teléfono, `bolivar-enfoque`, con la fecha: así Fechas sabe que esto
     es más nuevo que lo guardado en la cuenta. Acá no hay sesión
     (lib/datos.js no la tiene), por eso no se sube desde acá: lo sube
     Fechas la próxima vez que se abra con cuenta.
   - LOS GRUPOS DE ESTUDIO aparecen solo si hay alguno de hoy en
     adelante. Un atajo a una lista vacía es una promesa rota.
   - LAS FICHAS son de TS y de Fono. La Tecnicatura no tiene, y el
     atajo no se inventa.
   - SALUD MENTAL NO VA, a propósito (decisión de Máximo, 4/10/2026):
     sufrir por los parciales es normal, y no todo padecimiento pide
     atención. Ponerla al lado de los parciales lo trataba como si sí.

   Se esconde sola después del cierre de clases del 2.º cuatrimestre
   (21/11, cargado en Fechas). Pasada esa fecha, este archivo, su
   <script> y su <section> se pueden sacar.

   Lo de app.js (esc, hoyISO, carreraElegidaApp, anotarHito, icono) se
   llama con `typeof` antes, como en portada.js: si el service worker
   entrega un app.js viejo, la tira se achica pero no se cae.
   ============================================================ */
(function(){
  const HASTA = '2026-11-21';
  const CLAVE = 'bolivar-enfoque';

  const caja = document.getElementById('parciales');
  if (!caja) return;
  const hoy = typeof hoyISO === 'function' ? hoyISO() : new Date().toISOString().slice(0, 10);
  if (hoy > HASTA) return;

  const e = typeof esc === 'function' ? esc : (t => String(t == null ? '' : t)
    .replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]));

  function carrera(){
    try { const c = typeof carreraElegidaApp === 'function' ? carreraElegidaApp() : null; return c ? c.id : null; }
    catch(err){ return null; }
  }

  /* ---------- El interruptor, compartido con Fechas ---------- */
  function leer(){
    try { return JSON.parse(localStorage.getItem(CLAVE) || 'null') || {}; }
    catch(err){ return {}; }
  }
  let encendida = !!leer().enfoque;

  /* Las categorías que quedan visibles las elige cada quien en Fechas:
     acá se respetan las que ya tenía, o las de siempre. */
  function guardar(){
    const g = leer();
    try { localStorage.setItem(CLAVE, JSON.stringify({
      enfoque: encendida,
      cats: Array.isArray(g.cats) && g.cats.length ? g.cats : ['info', 'saberes'],
      cuando: Date.now()
    })); } catch(err){}
  }

  /* ---------- Los grupos de estudio de hoy en adelante ----------
     null es «todavía no se sabe»: hasta que conteste la base, el
     atajo no aparece, para no mostrar uno y sacarlo. */
  let grupos = null;
  /* La misma regla que `categoriaDe` de Fechas, para las filas viejas
     que no tienen categoría. */
  const esGrupo = p => p.categoria ? p.categoria === 'grupo'
    : p.tipo !== 'fecha' && p.tipo !== 'novedad' && p.linea === 'saberes';

  async function contarGrupos(){
    if (typeof db === 'undefined' || !db) return;
    try {
      const pedido = db.from('publicaciones').select('categoria,linea,tipo,suspendido')
        .eq('publicado', true)
        .or('fecha_desde.gte.' + hoy + ',fecha_hasta.gte.' + hoy)
        .limit(300);
      const r = await Promise.race([pedido,
        new Promise((_, no) => setTimeout(() => no(new Error('tardó')), 12000))]);
      if (r.error) throw r.error;
      grupos = (r.data || []).filter(p => !p.suspendido && esGrupo(p)).length;
      pintar();
    } catch(err){ /* sin señal: el atajo no aparece, el resto de la tira sí */ }
  }

  /* ---------- Los atajos ---------- */
  const FICHAS = {
    ts:   { href:'fichas/#fichas-ts',   nombre:'Fichas de Trabajo Social' },
    fono: { href:'fichas/#fichas-fono', nombre:'Fichas de Fonoaudiología' },
    '':   { href:'fichas/',             nombre:'Fichas para estudiar' }
  };

  function atajos(){
    const c = carrera();
    const lista = [];
    if (grupos) lista.push({ href:'../agenda/?cat=grupo', nombre:'Grupos de estudio',
      mas: grupos + ' para sumarte, en Fechas' });
    const f = c === 'tgcr' ? null : FICHAS[c || ''];
    if (f) lista.push({ href:f.href, nombre:f.nombre,
      mas:'Con autoevaluación, para probarte antes del parcial' });
    return lista;
  }

  function pintar(){
    const ico = (typeof icono === 'function' && icono('enfoque')) || '◎';
    /* Puede quedar sin atajos (la Tecnicatura, sin grupos cargados):
       entonces la tira es solo el interruptor, sin una lista vacía. */
    const lista = atajos();
    caja.innerHTML = `
      <div class="enfoque est-parciales${encendida ? ' encendido' : ''}">
        <div class="enfoque-fila">
          <span class="enfoque-icono" aria-hidden="true">${ico}</span>
          <label for="sw-parciales">
            <b>Época de parciales</b>
            <span>${encendida
              ? 'Prendida: en Fechas queda solo lo académico, hasta que la apagues'
              : 'Prendela y Fechas deja en pantalla solo lo académico'}</span>
          </label>
          <button type="button" class="switch" id="sw-parciales" role="switch"
                  aria-checked="${encendida}" aria-label="Época de parciales"></button>
        </div>
        ${lista.length ? `<ul class="est-parciales-atajos">${lista.map(a => `
          <li><a href="${e(a.href)}">
            <span><span class="nombre">${e(a.nombre)}</span><span class="mas">${e(a.mas)}</span></span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
          </a></li>`).join('')}
        </ul>` : ''}
      </div>`;
    caja.hidden = false;
  }

  /* Delegado en la caja: sobrevive a cada repintado. */
  caja.addEventListener('click', ev => {
    if (!ev.target.closest('#sw-parciales')) return;
    encendida = !encendida;
    guardar();
    if (encendida && typeof anotarHito === 'function') anotarHito('prendió época de parciales');
    pintar();
    const sw = document.getElementById('sw-parciales');
    if (sw) sw.focus();
  });

  pintar();
  contarGrupos();
  /* Elegir carrera desde el ☰ cambia qué fichas van. Volver con
     «atrás» desde Fechas trae la página del bfcache: el interruptor
     pudo cambiar allá. */
  document.addEventListener('bolivar:carrera', pintar);
  addEventListener('pageshow', ev => { if (ev.persisted){ encendida = !!leer().enfoque; pintar(); } });
})();
