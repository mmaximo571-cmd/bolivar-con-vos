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
  const g      = gustosDeAvisos();
  const activo = !!sub && Notification.permission === 'granted';

  /* «Bloqueado» es distinto de «apagado», y confundirlos deja a la
     persona tocando un interruptor que no hace nada: el navegador ya
     dijo que no y no vuelve a preguntar. La salida está en el candado
     de la barra de direcciones, y hay que decirlo con esas palabras. */
  const bloqueado = Notification.permission === 'denied';

  const chip = (id, nombre) =>
    '<button type="button" class="chip" data-aviso="' + id + '" ' +
    'aria-pressed="' + (g[id] ? 'true' : 'false') + '">' + esc(nombre) + '</button>';

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
              : 'Que no se te pase la inscripción a una mesa.') +
        '</span></label>' +
        '<button type="button" class="switch" id="sw-avisos" role="switch" ' +
          'aria-checked="' + (activo ? 'true' : 'false') + '" ' +
          (bloqueado ? 'disabled ' : '') +
          'aria-label="Avisos en este teléfono"></button>' +
      '</div>' +
      '<div class="enfoque-cuerpo"><div><div class="enfoque-cats">' +
        '<div class="enfoque-rotulo">De qué avisarte</div>' +
        '<div class="filtros" style="margin:0;padding:0;flex-wrap:wrap">' +
          chip('mesas', 'Inscripción a mesas') +
          chip('novedades', 'Novedades') +
          (conCuenta ? chip('misFechas', 'Mis fechas de final') : '') +
        '</div>' +
        '<div class="enfoque-nota">' +
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

  donde.querySelectorAll('[data-aviso]').forEach(b => {
    b.onclick = async function(){
      const cual = b.dataset.aviso;
      const g2 = gustosDeAvisos();
      g2[cual] = b.getAttribute('aria-pressed') !== 'true';

      /* No dejar las tres apagadas y el interruptor prendido: eso es
         un timbre que existe y no suena nunca, y la persona cree que
         tiene los avisos puestos. Se apaga la última que quede. */
      if (!g2.mesas && !g2.novedades && !g2.misFechas){
        b.setAttribute('aria-pressed', 'true');
        return;
      }

      b.setAttribute('aria-pressed', g2[cual] ? 'true' : 'false');
      guardarGustosDeAvisos(g2);

      const s = await suscripcionDeEsteTelefono();
      if (s) await guardarElTimbre(s, g2);
    };
  });

  /* Si el teléfono tiene una suscripción que la base no conoce —se
     reinstaló la app, o el navegador la renovó sola— se vuelve a
     guardar en silencio. Un timbre que el navegador cree activo y la
     base no tiene es la falla que nadie ve: la persona ve el
     interruptor prendido y no le llega nunca nada. */
  if (activo && sub && g.endpoint !== sub.endpoint) guardarElTimbre(sub, g);
}
