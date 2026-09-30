/* ============================================================
   LA BOLIVAR CON VOS · LA TARJETA DE LOS AVISOS

   `pintarAvisos()`, que salio de app.js el 27/9/2026. La usa `mi/` y
   nada mas. Se carga DESPUES de app.js: necesita de ahi todo el
   manejo del timbre (`prenderAvisos`, `apagarAvisos`,
   `guardarElTimbre`, `gustosDeAvisos` y compania).
   ============================================================ */

/* ------------------------------------------------------------
   LA TARJETA

   `donde` es el elemento donde se dibuja. `conCuenta` dice si hay
   sesión abierta: sin ella, «mis fechas» no se ofrece, porque los
   finales están atados a la cuenta y prometer un aviso que no va a
   llegar es peor que no ofrecerlo.

   Usa la misma tarjeta y el mismo switch que «Época de parciales» en
   Fechas. No es ahorro de CSS: es que dos interruptores que hacen lo
   mismo tienen que verse igual.
   ------------------------------------------------------------ */
async function pintarAvisos(donde, opciones){
  if (!donde) return;
  const conCuenta = !!(opciones && opciones.conCuenta);

  /* iPhone sin instalar: el permiso no existe hasta que la app está
     en la pantalla de inicio. Es un límite de Safari, no algo que
     podamos arreglar, así que se dice y se ofrece el camino. */
  if (!seBancanLosAvisos() && typeof esiOS === 'function' && esiOS() &&
      typeof yaEstaInstalada === 'function' && !yaEstaInstalada()){
    donde.innerHTML =
      '<div class="enfoque"><div class="enfoque-fila">' +
        '<span class="enfoque-icono" aria-hidden="true">' +
          (icono('inscripciones') || '🔔') + '</span>' +
        '<label><b>Que te avisemos de las mesas</b>' +
        '<span>En iPhone hace falta tener la app en la pantalla de ' +
        'inicio. Es así en todas las apps web, no solo en esta.</span></label>' +
      '</div>' +
      '<div class="enfoque-cats">' +
        '<button class="boton ancho" type="button" id="avisos-instalar">' +
        'Agregar a la pantalla de inicio</button></div></div>';

    const boton = donde.querySelector('#avisos-instalar');
    if (boton) boton.onclick = function(){
      try { localStorage.removeItem(LLAVE_INSTALAR); } catch(e){}
      invitarAInstalar('Con la app instalada te podemos avisar cuando abra la inscripción.');
    };
    return;
  }

  if (!seBancanLosAvisos()){
    donde.innerHTML =
      '<div class="enfoque"><div class="enfoque-fila">' +
        '<span class="enfoque-icono" aria-hidden="true">' +
          (icono('inscripciones') || '🔔') + '</span>' +
        '<label><b>Que te avisemos de las mesas</b>' +
        '<span>Este navegador no puede mandar avisos. Desde el ' +
        'celular, con Chrome o con la app instalada, sí.</span></label>' +
      '</div></div>';
    return;
  }

  const sub    = await suscripcionDeEsteTelefono();
  /* Con los canales nuevos por si `app.js` vino del caché viejo y
     todavía no los conoce: esta hoja puede llegar antes que él. */
  const g      = Object.assign({ paros:true, grupos:true, actividades:true, materias:[] },
                               gustosDeAvisos());
  const activo = !!sub && Notification.permission === 'granted';

  /* Las materias que se ofrecen para los grupos: las de los grupos que
     hay publicados (lo que de verdad puede sonar) más las que ya había
     elegido. No se ofrece el plan entero: son ochenta materias en tres
     carreras, y una lista así no se lee en un celular. */
  const materiasOfrecidas = activo && g.grupos ? await materiasDeLosGrupos(g.materias) : [];

  /* «Bloqueado» es distinto de «apagado», y confundirlos deja a la
     persona tocando un interruptor que no hace nada: el navegador ya
     dijo que no y no vuelve a preguntar. La salida está en el candado
     de la barra de direcciones, y hay que decirlo con esas palabras. */
  const bloqueado = Notification.permission === 'denied';

  const chip = (id, nombre, categoria) =>
    '<button type="button" class="chip" data-aviso="' + id + '" ' +
    'aria-pressed="' + (g[id] ? 'true' : 'false') + '">' +
    (categoria ? '<i class="punto cat-' + categoria + '" aria-hidden="true"></i>' : '') +
    esc(nombre) + '</button>';

  /* Solo con los grupos prendidos y si hay alguno publicado: preguntar
     de qué materias cuando no hay ningún grupo es preguntar al vacío.
     Ninguna elegida quiere decir TODAS, y se dice así, porque un chip
     apagado se lee como «no me avises». */
  function htmlMaterias(){
    if (!materiasOfrecidas.length) return '';
    const elegidas = new Set(g.materias);
    return '<div class="enfoque-rotulo" style="margin-top:14px">Grupos de qué materias</div>' +
      '<div class="filtros" style="margin:0;padding:0;flex-wrap:wrap">' +
        materiasOfrecidas.map(m =>
          '<button type="button" class="chip" data-materia-aviso="' + esc(m) + '" ' +
          'aria-pressed="' + (elegidas.has(m) ? 'true' : 'false') + '">' + esc(m) + '</button>'
        ).join('') +
      '</div>' +
      '<div class="enfoque-nota">' +
        (g.materias.length ? 'Solo te avisamos de los grupos de las que marcaste. '
                           : 'Sin ninguna marcada te avisamos de todos los grupos. ') +
        (conCuenta ? 'Las materias de tu cursada ya cuentan solas.' : '') +
      '</div>';
  }

  donde.innerHTML =
    '<div class="enfoque' + (activo ? ' encendido' : '') + '" id="avisos-tarjeta">' +
      '<div class="enfoque-fila">' +
        '<span class="enfoque-icono" aria-hidden="true">' +
          (icono('inscripciones') || '🔔') + '</span>' +
        '<label for="sw-avisos"><b>Avisos en este teléfono</b><span>' +
          (bloqueado
            ? 'Los tenés bloqueados. Tocá el candado al lado de la dirección y permití las notificaciones.'
            : activo
              ? 'Te avisamos aunque no tengas la app abierta.'
              : 'Que no se te pase un paro, un grupo de estudio ni la inscripción a una mesa.') +
        '</span></label>' +
        '<button type="button" class="switch" id="sw-avisos" role="switch" ' +
          'aria-checked="' + (activo ? 'true' : 'false') + '" ' +
          (bloqueado ? 'disabled ' : '') +
          'aria-label="Avisos en este teléfono"></button>' +
      '</div>' +
      '<div class="enfoque-cuerpo"><div><div class="enfoque-cats">' +
        '<div class="enfoque-rotulo">De qué avisarte</div>' +
        '<div class="filtros" style="margin:0;padding:0;flex-wrap:wrap">' +
          chip('paros', 'Paros', 'paro') +
          chip('grupos', 'Grupos de estudio', 'grupo') +
          chip('actividades', 'Actividades', 'actividad') +
          chip('mesas', 'Inscripción a mesas') +
          chip('novedades', 'Comunicados', 'comunicado') +
          (conCuenta ? chip('misFechas', 'Mis fechas de final') : '') +
        '</div>' +
        htmlMaterias() +
        '<div class="enfoque-nota">' +
          'Los paros, grupos y actividades te avisan cuando se publican, a la ' +
          'mañana del día y si cambian o se suspenden. ' +
          (conCuenta ? '' : 'Con una cuenta podés sumar los avisos de tus propias mesas de final. ') +
          'Lo apagás cuando quieras, desde acá mismo.</div>' +
      '</div></div></div>' +
    '</div>';

  /* La tarjeta se abre sola cuando está prendida: las opciones de qué
     avisar no tienen sentido apagadas, y verlas ahí invita a tocarlas
     para nada. */
  const tarjeta = donde.querySelector('#avisos-tarjeta');
  const sw = donde.querySelector('#sw-avisos');

  if (sw) sw.onclick = async function(){
    const prendiendo = sw.getAttribute('aria-checked') !== 'true';
    sw.disabled = true;

    if (prendiendo){
      const problema = await prenderAvisos(gustosDeAvisos());
      sw.disabled = false;
      if (problema){
        /* Sin cartel rojo si la persona simplemente cerró el pedido
           del sistema: no se equivocó en nada, solo dijo «ahora no». */
        if (problema !== 'sin-respuesta'){
          const que =
            problema === 'bloqueado' ? 'El navegador los tiene bloqueados. Se prenden desde el candado de la barra de direcciones.'
          : problema === 'no-se-puede' ? 'Este navegador no puede mandar avisos.'
          : 'No pudimos prenderlos. Probá de nuevo en un rato.';
          donde.insertAdjacentHTML('beforeend', '<div class="aviso error">' + esc(que) + '</div>');
        }
        return pintarAvisos(donde, opciones);
      }
      return pintarAvisos(donde, opciones);
    }

    await apagarAvisos();
    sw.disabled = false;
    pintarAvisos(donde, opciones);
  };

  const CANALES = ['mesas', 'novedades', 'misFechas', 'paros', 'grupos', 'actividades'];

  donde.querySelectorAll('[data-aviso]').forEach(b => {
    b.onclick = async function(){
      const cual = b.dataset.aviso;
      const g2 = Object.assign({}, g, gustosDeAvisos());
      g2[cual] = b.getAttribute('aria-pressed') !== 'true';

      /* No dejar todos apagados y el interruptor prendido: eso es un
         timbre que existe y no suena nunca, y la persona cree que tiene
         los avisos puestos. El último que queda no se apaga. */
      if (!CANALES.some(c => g2[c])){
        b.setAttribute('aria-pressed', 'true');
        return;
      }

      b.setAttribute('aria-pressed', g2[cual] ? 'true' : 'false');
      guardarGustosDeAvisos(g2);

      const s = await suscripcionDeEsteTelefono();
      if (s) await guardarElTimbre(s, g2);

      /* Prender o apagar los grupos muestra u oculta la elección de
         materias, así que ese sí redibuja. */
      if (cual === 'grupos') pintarAvisos(donde, opciones);
    };
  });

  donde.querySelectorAll('[data-materia-aviso]').forEach(b => {
    b.onclick = async function(){
      const m = b.dataset.materiaAviso;
      const g2 = Object.assign({}, g, gustosDeAvisos());
      const lista = (g2.materias || []).filter(x => x !== m);
      if (b.getAttribute('aria-pressed') !== 'true') lista.push(m);
      g2.materias = lista.slice(0, 30);
      guardarGustosDeAvisos(g2);
      const s = await suscripcionDeEsteTelefono();
      if (s) await guardarElTimbre(s, g2);
      pintarAvisos(donde, opciones);
    };
  });

  /* Si el teléfono tiene una suscripción que la base no conoce —se
     reinstaló la app, o el navegador la renovó sola— se vuelve a
     guardar en silencio. Un timbre que el navegador cree activo y la
     base no tiene es la falla que nadie ve: la persona ve el
     interruptor prendido y no le llega nunca nada. */
  if (activo && sub && g.endpoint !== sub.endpoint) guardarElTimbre(sub, g);
}

/* Las materias de los grupos de estudio publicados que todavía no
   pasaron, más las que la persona ya había elegido (aunque hoy no haya
   grupo de esa: si se apagara sola, el próximo grupo no le avisaría).
   Si la consulta falla, se ofrecen solo las elegidas. */
async function materiasDeLosGrupos(elegidas){
  const todas = new Set(elegidas || []);
  try {
    const hace = new Date(Date.now() - 86400000);
    const ayer = hace.getFullYear() + '-' + String(hace.getMonth() + 1).padStart(2, '0') +
                 '-' + String(hace.getDate()).padStart(2, '0');
    const { data } = await db.from('publicaciones')
      .select('materia').eq('publicado', true).eq('categoria', 'grupo')
      .not('materia', 'is', null).gte('fecha_desde', ayer).limit(100);
    (data || []).forEach(p => { if (p.materia) todas.add(p.materia); });
  } catch(e){}
  return [...todas].sort((a, b) => a.localeCompare(b, 'es'));
}
