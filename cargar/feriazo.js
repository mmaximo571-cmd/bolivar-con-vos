/* ============================================================
   FERIAZO · LA CARGA DEL EQUIPO (24/10/2026)

   La pestaña «Feriazo» de `cargar/`. Desde el 11/11/2026 cada quien
   manda el suyo con su cuenta desde `feriazo/sumar/`, y llega acá
   PARA REVISAR: no se ve hasta que alguien lo aprueba. También se
   sigue pudiendo cargar a mano el de quien escribe por Instagram, y
   corregir, ocultar o borrar cualquiera. La pantalla pública es
   `feriazo/`.

   Está acá y no en el panel porque el panel es solo del rol `equipo`
   y el 24/10/2026 no había ninguna cuenta así: quien carga es
   comunicación, desde el celular. Los permisos los pone la base
   (`sql/tabla-feriazo.sql`), no este archivo.

   Va aparte de `cargar/index.html` para no sumarle 300 renglones a una
   pantalla que ya pasa los 1500. Se usa con
   `montarFeriazoCarga(caja)`; necesita `db` (la librería grande, para
   subir la foto), `esc` y `urlSegura` de `app.js`.
   ============================================================ */

/* Las listas (rubros, tintes, portadas), la tarjeta y lo de subir y
   borrar fotos se mudaron a `lib/feriazo.js` el 11/11/2026: las usan
   también la vidriera y el formulario de cada quien. `cargar/` lo
   carga antes que este archivo. */

function montarFeriazoCarga(caja){
  let filas = [];

  function avisar(texto, clase){
    const m = document.getElementById('fz-msj');
    if (m) m.innerHTML = texto ? `<div class="aviso ${clase}">${esc(texto)}</div>` : '';
  }

  async function traer(){
    const { data, error } = await db.from('feriazo').select('*').order('nombre');
    if (error){
      caja.innerHTML = /feriazo/.test(error.message || '')
        ? `<div class="aviso error"><strong>Falta activar el Feriazo.</strong><br>
             Hay que correr <b>sql/tabla-feriazo.sql</b> en el SQL Editor de Supabase.
             Es una sola vez.</div>`
        : `<div class="aviso error">No se pudo cargar: ${esc(error.message)}</div>`;
      return;
    }
    filas = data || [];
    /* Los productos, para poder mirar lo que se aprueba. Si la tabla
       todavía no está, la lista anda igual sin ellos. */
    const p = await db.from('feriazo_productos').select('*').order('orden');
    filas.forEach(e => { e.productos = (p.data || []).filter(x => x.feriazo_id === e.id); });
    pintarLista();
  }

  /* ------------------------------------------------------------
     LA LISTA
     ------------------------------------------------------------ */
  /* Lo que llegó del formulario, entero: quien aprueba tiene que ver
     la tarjeta como va a salir, el contacto y cada producto. */
  function htmlPendiente(e){
    return `
      <div class="tarjeta" style="margin-bottom:10px">
        <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div style="flex:0 0 150px">${htmlTarjetaFeriazo(e, '')}</div>
          <div style="flex:1 1 180px;min-width:0">
            <p style="margin:0 0 8px">${esc(e.descripcion)}</p>
            <p class="letra-chica" style="margin:0 0 4px">${[
              e.instagram ? `<a href="https://www.instagram.com/${encodeURIComponent(e.instagram)}/" target="_blank" rel="noopener">@${esc(e.instagram)} ↗</a>` : '',
              e.whatsapp ? 'WhatsApp +' + esc(e.whatsapp) : ''].filter(Boolean).join(' · ')}</p>
            ${(e.etiquetas || []).length ? `<p class="letra-chica" style="margin:0">Etiquetas: ${esc(e.etiquetas.join(', '))}</p>` : ''}
          </div>
        </div>
        ${(e.productos || []).length ? `<div class="fz-carrusel" style="margin-top:10px">${e.productos.map(p => `
          <div class="fz-prod">
            <span class="fz-prod-foto fz-t-${tinteFeriazo(e)}">${p.foto
              ? `<img src="${esc(urlSegura(p.foto))}" alt="">`
              : `<span class="fz-inicial" aria-hidden="true">${esc(inicialesFeriazo(p.nombre))}</span>`}</span>
            <span class="fz-prod-nombre">${esc(p.nombre)}</span>
            ${p.nota ? `<span class="fz-prod-nota">${esc(p.nota)}</span>` : ''}
            <span class="fz-modo ${esc(p.modo)}">${esc(MODOS_FERIAZO[p.modo] || p.modo)}</span>
          </div>`).join('')}</div>` : '<p class="letra-chica" style="margin:10px 0 0">No cargó productos.</p>'}
        <div class="chips" style="margin-top:10px">
          <button type="button" class="chip" data-aprobar="${e.id}">Aprobar y publicar</button>
          <button type="button" class="chip" data-editar="${e.id}">Editar</button>
          <button type="button" class="chip" data-borrar="${e.id}">Rechazar y borrar</button>
        </div>
      </div>`;
  }

  function pintarLista(){
    const pendientes = filas.filter(e => e.pendiente && !e.publicado);
    const cargados = filas.filter(e => !pendientes.includes(e));
    caja.innerHTML = `
      <h1 class="titulo-pantalla">FERIAZO</h1>
      <p class="bajada">Los emprendimientos que se ven en <a href="../feriazo/">Feriazo</a>.
        Cada quien manda el suyo desde <a href="../feriazo/sumar/">Sumá tu emprendimiento</a>
        y llega acá para revisar. También se puede cargar a mano.</p>
      <button type="button" class="boton ancho" id="fz-nuevo">+ Sumar un emprendimiento</button>
      <div id="fz-msj" role="status" aria-live="polite"></div>
      ${pendientes.length ? `
        <div class="titulo-seccion">PARA REVISAR (${pendientes.length})</div>
        <p class="letra-chica" style="margin:0 0 10px">Fijate que el Instagram sea de quien lo manda
          y que no haya precios ni nada que no vaya.</p>
        ${pendientes.map(htmlPendiente).join('')}` : ''}
      <div class="titulo-seccion">CARGADOS (${cargados.length})</div>
      ${cargados.length ? cargados.map(e => `
        <div class="tarjeta" style="margin-bottom:8px${e.publicado ? '' : ';opacity:.65'}">
          <div style="display:flex;gap:12px;align-items:center">
            ${e.foto ? `<img src="${esc(urlSegura(e.foto))}" alt="" width="52" height="52"
                 style="width:52px;height:52px;object-fit:cover;border-radius:6px;flex:0 0 auto">` : ''}
            <div style="min-width:0">
              <h3 style="margin:0">${esc(e.nombre)}</h3>
              <p class="letra-chica" style="margin:2px 0 0">${esc(e.instagram ? '@' + e.instagram : 'WhatsApp +' + (e.whatsapp || ''))} ·
                ${esc((RUBROS_FERIAZO[e.rubro] || {}).texto || e.rubro)}${e.publicado ? '' : ' · <b>oculto</b>'}</p>
            </div>
          </div>
          <div class="chips" style="margin-top:8px">
            <button type="button" class="chip" data-editar="${e.id}">Editar</button>
            <button type="button" class="chip" data-mostrar="${e.id}">${e.publicado ? 'Ocultar' : 'Publicar'}</button>
            <button type="button" class="chip" data-borrar="${e.id}">Borrar</button>
          </div>
        </div>`).join('')
        : '<div class="vacio">Todavía no hay ninguno. El primero se carga con el botón de arriba.</div>'}`;

    document.getElementById('fz-nuevo').onclick = () => pintarFormulario(null);

    caja.querySelectorAll('[data-editar]').forEach(b => b.onclick = () =>
      pintarFormulario(filas.find(e => String(e.id) === b.dataset.editar)));

    caja.querySelectorAll('[data-aprobar]').forEach(b => b.onclick = async () => {
      const e = filas.find(x => String(x.id) === b.dataset.aprobar);
      b.disabled = true;
      const { error } = await db.from('feriazo').update({ publicado: true, pendiente: false }).eq('id', e.id);
      if (error){ b.disabled = false; avisar('No se pudo aprobar: ' + error.message, 'error'); return; }
      await traer();
      avisar(`«${e.nombre}» ya se ve en el Feriazo.`, 'ok');
    });

    caja.querySelectorAll('[data-mostrar]').forEach(b => b.onclick = async () => {
      const e = filas.find(x => String(x.id) === b.dataset.mostrar);
      /* Cómo estaba ANTES de tocar: después de `traer()` la fila ya es
         la nueva y el aviso diría lo contrario de lo que pasó. */
      const estaba = e.publicado;
      b.disabled = true;
      const { error } = await db.from('feriazo').update({ publicado: !estaba, pendiente: false }).eq('id', e.id);
      if (error){ b.disabled = false; avisar('No se pudo: ' + error.message, 'error'); return; }
      await traer();
      avisar(estaba ? `«${e.nombre}» quedó oculto. No se borró: se puede volver a publicar.`
                         : `«${e.nombre}» ya se ve en el Feriazo.`, 'ok');
    });

    caja.querySelectorAll('[data-borrar]').forEach(b => b.onclick = async () => {
      const e = filas.find(x => String(x.id) === b.dataset.borrar);
      if (!confirm(`¿Borrar «${e.nombre}» del Feriazo? Se borran también sus productos y sus fotos, y no se puede deshacer. Si solo querés sacarlo un tiempo, usá «Ocultar».`)) return;
      b.disabled = true;
      const { error } = await db.from('feriazo').delete().eq('id', e.id);
      if (error){ b.disabled = false; avisar('No se pudo borrar: ' + error.message, 'error'); return; }
      await Promise.all([e.foto_archivo].concat((e.productos || []).map(p => p.foto_archivo))
        .filter(Boolean).map(borrarFotoFeriazo));
      await traer();
      avisar(`«${e.nombre}» se borró, con sus fotos.`, 'ok');
    });
  }

  /* ------------------------------------------------------------
     EL FORMULARIO · para sumar uno o corregirlo
     ------------------------------------------------------------ */
  function pintarFormulario(e){
    const esto = {
      rubro: e ? e.rubro : null,
      quien: e ? e.quien : null,
      tinte: e ? tinteFeriazo(e) : 'menta',
      portada: e && PORTADAS_FERIAZO[e.portada] ? e.portada : 'inicial',
      foto: e ? e.foto : null,
      fotoArchivo: e ? e.foto_archivo : null,
      /* La que se subió en esta edición y todavía no se guardó: si se
         cancela, o se sube otra encima, se borra para no dejar fotos
         huérfanas en el depósito. */
      subida: null
    };

    const chipsDe = (lista, elegido, dato) => Object.keys(lista).map(k => `
      <button type="button" class="chip" data-${dato}="${k}" aria-pressed="${k === elegido}">${
        lista[k].emoji ? `<span aria-hidden="true">${lista[k].emoji}</span> ` : ''}${esc(lista[k].texto || lista[k])}</button>`).join('');

    caja.innerHTML = `
      <h1 class="titulo-pantalla">${e ? 'CORREGIR' : 'SUMAR UNO'}</h1>
      <div class="ficha">
        <div class="campo"><label for="fz-nombre">Nombre del emprendimiento</label>
          <input id="fz-nombre" maxlength="80" value="${esc(e ? e.nombre : '')}" placeholder="Alfajores de Ana"></div>

        <div class="campo"><label for="fz-ig">Instagram</label>
          <p class="letra-chica" style="margin:0 0 6px">Sirve el usuario con o sin @, o el link que te pasaron.
            Si no tiene, alcanza con el WhatsApp.</p>
          <input id="fz-ig" autocapitalize="none" autocomplete="off" spellcheck="false"
                 value="${esc(e && e.instagram ? '@' + e.instagram : '')}" placeholder="@alfajores.ana">
          <p class="letra-chica" id="fz-ig-ver" style="margin:6px 0 0"></p></div>

        <div class="campo"><label for="fz-wa">WhatsApp (optativo, queda a la vista de todes)</label>
          <input id="fz-wa" type="tel" inputmode="tel" autocomplete="off"
                 value="${esc(e && e.whatsapp ? e.whatsapp : '')}" placeholder="221 555 1234"></div>

        <div class="campo"><label for="fz-desc">Qué hace, en una línea</label>
          <textarea id="fz-desc" maxlength="240" style="min-height:80px"
            placeholder="Alfajores de maicena y de chocolate, por encargo. Los llevo a la facu los jueves.">${esc(e ? e.descripcion : '')}</textarea>
          <p class="letra-chica" id="fz-desc-cuenta" style="margin:4px 0 0"></p></div>

        <div class="campo"><label id="fz-rubro-rot">Rubro</label>
          <div class="chips" style="flex-wrap:wrap" role="group" aria-labelledby="fz-rubro-rot">${chipsDe(RUBROS_FERIAZO, esto.rubro, 'rubro')}</div></div>

        <div class="campo"><label id="fz-quien-rot">Quién lo lleva</label>
          <div class="chips" style="flex-wrap:wrap" role="group" aria-labelledby="fz-quien-rot">${chipsDe(QUIEN_FERIAZO, esto.quien, 'quien')}</div></div>

        <div class="campo"><label for="fz-carrera">Carrera (si corresponde)</label>
          <select id="fz-carrera">
            <option value="">— no decir —</option>
            ${Object.keys(CARRERA_FERIAZO).map(k =>
              `<option value="${k}"${e && e.carrera === k ? ' selected' : ''}>${CARRERA_FERIAZO[k]}</option>`).join('')}
          </select></div>

        <div class="campo"><label for="fz-etiquetas">Etiquetas (hasta 4, separadas con coma)</label>
          <input id="fz-etiquetas" maxlength="110" autocomplete="off"
                 value="${esc(e ? (e.etiquetas || []).join(', ') : '')}" placeholder="Sin TACC, Retiro en la facu"></div>

        <div class="campo"><label id="fz-tinte-rot">El color de su tarjeta</label>
          <div class="chips" style="flex-wrap:wrap" role="group" aria-labelledby="fz-tinte-rot">${chipsDe(TINTES_FERIAZO, esto.tinte, 'tinte')}</div></div>

        <div class="campo"><label id="fz-portada-rot">La portada</label>
          <div class="chips" style="flex-wrap:wrap" role="group" aria-labelledby="fz-portada-rot">${chipsDe(PORTADAS_FERIAZO, esto.portada, 'portada')}</div>
          <p class="letra-chica" style="margin:6px 0 0">«Fotos» usa las de sus productos; si no cargó ninguna, salen las iniciales.</p></div>

        <div class="campo"><label for="fz-frase">La frase (solo si la portada es «Frase»)</label>
          <input id="fz-frase" maxlength="44" autocomplete="off" value="${esc(e && e.frase ? e.frase : '')}"></div>

        <div class="campo"><label for="fz-foto-archivo">Foto o logo</label>
          <p class="letra-chica" style="margin:0 0 6px">Se recorta en cuadrado, como la de perfil de
            Instagram. <b>Si se ve la cara de alguien, que esté de acuerdo.</b></p>
          <div id="fz-foto-vista"></div>
          <input id="fz-foto-archivo" type="file" accept="image/*"></div>

        <label style="display:flex;align-items:center;gap:8px;margin:6px 0 14px">
          <input type="checkbox" id="fz-publicado" ${!e || e.publicado ? 'checked' : ''}>
          Publicado (se ve en la app)</label>

        <div id="fz-msj" role="status" aria-live="polite"></div>
        <button type="button" class="boton ancho" id="fz-guardar">${e ? 'Guardar los cambios' : 'Sumarlo al Feriazo'}</button>
        <button type="button" class="boton ancho borde" id="fz-cancelar" style="margin-top:10px">← Volver</button>
      </div>`;

    /* El usuario se ve como va a quedar mientras se escribe: si se pegó
       mal, se nota acá y no cuando el link no abre. */
    const campoIg = document.getElementById('fz-ig');
    function verIg(){
      const u = usuarioInstagram(campoIg.value);
      document.getElementById('fz-ig-ver').innerHTML = !campoIg.value.trim() ? ''
        : usuarioValido(u)
          ? `Va a quedar <b>@${esc(u)}</b> · <a href="https://www.instagram.com/${encodeURIComponent(u)}/" target="_blank" rel="noopener">probar el link ↗</a>`
          : '<b>Así no es un usuario de Instagram:</b> van letras, números, punto y guion bajo, hasta 30.';
    }
    campoIg.addEventListener('input', verIg);
    verIg();

    const campoDesc = document.getElementById('fz-desc');
    function verCuenta(){
      const n = campoDesc.value.trim().length;
      document.getElementById('fz-desc-cuenta').textContent =
        n < 10 ? `${n} de 240 · hacen falta al menos 10` : `${n} de 240`;
    }
    campoDesc.addEventListener('input', verCuenta);
    verCuenta();

    /* Los chips eligen uno solo por grupo */
    caja.querySelectorAll('[data-rubro], [data-quien], [data-tinte], [data-portada]').forEach(b => b.onclick = () => {
      const dato = ['rubro', 'quien', 'tinte', 'portada'].find(d => b.dataset[d] != null);
      esto[dato] = b.dataset[dato];
      caja.querySelectorAll(`[data-${dato}]`).forEach(x =>
        x.setAttribute('aria-pressed', String(x === b)));
    });

    function pintarFoto(){
      const v = document.getElementById('fz-foto-vista');
      v.innerHTML = esto.foto ? `
        <img src="${esc(urlSegura(esto.foto))}" alt="" width="96" height="96"
             style="width:96px;height:96px;object-fit:cover;border-radius:6px;display:block;margin-bottom:8px">
        <button type="button" class="boton texto" id="fz-foto-sacar">Sacar la foto</button>` : '';
      const sacar = document.getElementById('fz-foto-sacar');
      if (sacar) sacar.onclick = () => { esto.foto = null; pintarFoto(); };
    }
    pintarFoto();

    document.getElementById('fz-foto-archivo').onchange = async function(){
      const archivo = this.files && this.files[0];
      if (!archivo) return;
      const v = document.getElementById('fz-foto-vista');
      v.innerHTML = '<p class="letra-chica">Subiendo…</p>';
      /* Con mala señal la foto tarda, y guardar en el medio dejaba la
         tarjeta sin la foto nueva y el archivo huérfano en el depósito. */
      const guardar = document.getElementById('fz-guardar');
      guardar.disabled = true;
      try {
        const subida = await subirFotoFeriazo(archivo);
        if (esto.subida) await borrarFotoFeriazo(esto.subida);
        esto.subida = subida.nombre;
        esto.foto = subida.url;
        pintarFoto();
      } catch(err){
        v.innerHTML = `<div class="aviso error">${esc(err.message || err)}</div>`;
      }
      guardar.disabled = false;
      this.value = '';
    };

    document.getElementById('fz-cancelar').onclick = async () => {
      if (esto.subida) await borrarFotoFeriazo(esto.subida);
      traer();
    };

    document.getElementById('fz-guardar').onclick = async function(){
      const nombre = document.getElementById('fz-nombre').value.trim();
      const igEscrito = campoIg.value.trim();
      const waEscrito = document.getElementById('fz-wa').value.trim();
      const instagram = usuarioInstagram(igEscrito);
      const whatsapp = numeroWhatsapp(waEscrito);
      const descripcion = campoDesc.value.trim();
      const frase = document.getElementById('fz-frase').value.trim();
      const etiquetas = document.getElementById('fz-etiquetas').value.split(',').map(t => t.trim()).filter(Boolean);

      /* Lo que falta se dice todo junto y en palabras: el `check` de la
         base diría lo mismo, pero en un idioma que no se entiende. */
      const falta = [];
      if (nombre.length < 2) falta.push('el nombre');
      if (!igEscrito && !waEscrito) falta.push('un Instagram o un WhatsApp');
      if (igEscrito && !usuarioValido(instagram)) falta.push('un Instagram que ande');
      if (waEscrito && !whatsappValido(whatsapp)) falta.push('un WhatsApp completo');
      if (esto.portada === 'frase' && frase.length < 3) falta.push('la frase de la portada');
      if (etiquetas.length > 4 || etiquetas.join('').length > 96) falta.push('dejar hasta 4 etiquetas cortas');
      if (descripcion.length < 10) falta.push('una línea de qué hace');
      if (!esto.rubro) falta.push('el rubro');
      if (!esto.quien) falta.push('quién lo lleva');
      if (falta.length){ avisar('Falta ' + falta.join(', ') + '.', 'error'); return; }

      /* Si la foto cambió, el archivo nuevo es el que se sube ahora; si
         se sacó, ninguno. El viejo se borra recién cuando la fila ya se
         guardó: si el guardado falla, la tarjeta sigue con su foto. */
      const archivoFinal = esto.subida && esto.foto ? esto.subida
                         : esto.foto ? esto.fotoArchivo : null;
      const publicado = document.getElementById('fz-publicado').checked;
      const fila = {
        nombre, descripcion,
        instagram: igEscrito ? instagram : null,
        whatsapp: waEscrito ? whatsapp : null,
        tinte: esto.tinte, portada: esto.portada,
        frase: frase.length >= 3 ? frase : null,
        etiquetas,
        /* Sigue «para revisar» solo si ya lo estaba y se guarda sin
           publicar: editarlo no es aprobarlo. */
        pendiente: !!(e && e.pendiente) && !publicado,
        rubro: esto.rubro,
        quien: esto.quien,
        carrera: document.getElementById('fz-carrera').value || null,
        foto: esto.foto || null,
        foto_archivo: archivoFinal,
        publicado
      };

      this.disabled = true; this.textContent = 'Guardando…';
      const { error } = e
        ? await db.from('feriazo').update(fila).eq('id', e.id)
        : await db.from('feriazo').insert(fila);
      this.disabled = false; this.textContent = e ? 'Guardar los cambios' : 'Sumarlo al Feriazo';

      if (error){
        avisar(/feriazo_instagram_unico|duplicate/i.test(error.message || '')
          ? `@${instagram} ya está cargado. Buscalo en la lista y editalo.`
          : 'No se pudo guardar: ' + error.message, 'error');
        return;
      }
      if (e && e.foto_archivo && e.foto_archivo !== archivoFinal) await borrarFotoFeriazo(e.foto_archivo);
      await traer();
      avisar(fila.publicado ? `Listo: «${nombre}» ya se ve en el Feriazo.`
                            : `Listo: «${nombre}» quedó guardado, oculto.`, 'ok');
    };
  }

  traer();
}
