/* ============================================================
   EL LECTOR DE LAS FICHAS DE TEXTO

   Lee `textos/<nombre>.txt` —lo que devuelve NotebookLM con el molde
   de PROMPT-FICHAS.md— y lo arma: portada, qué es, las máquinas como
   chips, las preguntas que se corrigen solas y lo que falta aclarar.

   El texto no se toca a mano: si NotebookLM lo devolvió con `###`
   adelante de los títulos, o con WHY en vez de POR QUÉ, se entiende
   igual. Lo que no se reconoce no se muestra, y la ficha sigue.
   ============================================================ */
(function(){
  const nombre = new URLSearchParams(location.search).get('f') || '';
  const destino = document.getElementById('ficha');

  document.getElementById('cabecera').innerHTML = htmlCabecera();
  document.getElementById('pie').innerHTML = htmlPie();
  pintarNav('estudiemos');

  /* El nombre va a una ruta: solo letras, números y guiones. */
  if (!/^[a-z0-9-]+$/.test(nombre)){ noEsta(); return; }

  fetch('../textos/' + nombre + '.txt')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(t => pintar(leer(t)))
    .catch(noEsta);

  function noEsta(){
    destino.innerHTML = '<h1 class="titulo-pantalla">No encontramos la ficha</h1>' +
      '<p class="bajada">Puede que el enlace esté mal copiado, o que no tengas ' +
      'conexión. Volvé a <a href="../">las fichas de estudio</a>.</p>';
  }

  /* ---------- EL TEXTO EN LIMPIO ---------- */

  function esc(s){
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  /* Negritas, citas y huecos. La cita larga «(CUADERNILLO X.pdf, pág. 82)»
     queda en «(pág. 82)»: el cuadernillo es siempre el mismo y ya está
     nombrado arriba, y el nombre entero se comía medio renglón. */
  function linea(s){
    return esc(s)
      .replace(/\(([^()]*?\.pdf),\s*(p[áa]gs?\.[^)]*)\)/gi, '($2)')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/`?\[FALTA\]`?/g, '<span class="ft-falta">falta en el material</span>')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\((p[áa]gs?\.[^)]*)\)/gi, '<span class="ft-cita">($1)</span>');
  }

  /* ---------- LEER ---------- */

  function leer(texto){
    const secciones = {};
    let actual = null;
    texto.replace(/\r/g, '').split('\n').forEach(crudo => {
      const l = crudo.replace(/^#+\s*/, '').replace(/\s+$/, '');
      const m = /^(\d)\s*·/.exec(l);
      if (m){ actual = m[1]; secciones[actual] = []; return; }
      if (actual !== null && l !== '---') secciones[actual].push(l);
    });

    return {
      portada:   campos(secciones['0'] || []),
      quees:     campos(secciones['1'] || []),
      maquinas:  maquinas(secciones['2'] || []),
      preguntas: preguntas(secciones['3'] || []),
      aclarar:   (secciones['4'] || []).filter(l => /^\s*[*-]\s/.test(l))
                   .map(l => l.replace(/^\s*[*-]\s+/, ''))
    };
  }

  /* «- CLAVE: valor», y los renglones de abajo que no abren otra clave
     son parte del mismo campo. */
  function campos(lineas){
    const c = {};
    let clave = null;
    lineas.forEach(l => {
      const m = /^-\s+([A-ZÁÉÍÓÚÑ ]+):\s*(.*)$/.exec(l);
      if (m){ clave = m[1].trim(); c[clave] = m[2] ? [m[2]] : []; return; }
      if (clave && l.trim()) c[clave].push(l.trim());
    });
    return c;
  }

  function maquinas(lineas){
    const lista = [];
    let m = null;
    lineas.forEach(l => {
      const t = /^MÁQUINA\s*\d+\s*·\s*(.*)$/i.exec(l);
      if (t){ m = { titulo: t[1], lineas: [] }; lista.push(m); return; }
      if (m) m.lineas.push(l);
    });
    return lista.map(x => {
      const c = campos(x.lineas);
      const opciones = (c['POR CADA OPCIÓN'] || []).map(o => {
        const p = /^-\s*\*\*(.+?)\*\*\s*:\s*(.*)$/.exec(o);
        return p ? { nombre: p[1], texto: p[2] } : null;
      }).filter(Boolean);
      return { titulo: x.titulo, elige: (c['QUÉ SE ELIGE'] || []).join(' '), opciones };
    }).filter(x => x.opciones.length);
  }

  function preguntas(lineas){
    const lista = [];
    let p = null;
    lineas.forEach(l => {
      let m;
      if ((m = /^\d+\.\s+(.*)$/.exec(l))){ p = { texto: m[1], opciones: [], correcta: '', porque: '' }; lista.push(p); return; }
      if (!p) return;
      if ((m = /^([A-F])\)\s*(.*)$/.exec(l))){ p.opciones.push({ letra: m[1], texto: m[2] }); return; }
      if ((m = /^-\s*CORRECTA:\s*([A-F])/i.exec(l))){ p.correcta = m[1].toUpperCase(); return; }
      if ((m = /^-\s*(?:POR QUÉ|WHY):\s*(.*)$/i.exec(l))){ p.porque = m[1]; return; }
    });
    return lista.filter(x => x.opciones.length && x.correcta);
  }

  /* ---------- DIBUJAR ---------- */

  function pintar(f){
    const P = f.portada, Q = f.quees;
    const uno = (c, k) => (c[k] || []).join(' ');
    const titulo = uno(P, 'TÍTULO');
    if (!titulo){ noEsta(); return; }
    document.title = titulo.charAt(0) + titulo.slice(1).toLowerCase() + ' · Fichas · La Bolívar con vos';

    let h = '<h1 class="titulo-pantalla">' + esc(titulo) + '</h1>';
    if (uno(P, 'SUBTÍTULO')) h += '<p class="ft-elige">' + esc(uno(P, 'SUBTÍTULO')) + '</p>';
    if (uno(P, 'ENTRADA'))   h += '<p class="bajada">' + linea(uno(P, 'ENTRADA')) + '</p>';
    const materia = uno(P, 'MATERIA').replace(/\s*\([^)]*\)\s*$/, '');
    if (materia) h += '<p class="ft-elige"><b>' + esc(materia) + '</b></p>';

    /* 1 · Qué es */
    h += '<section class="tarjeta ft-bloque"><h2>Qué es</h2>';
    (Q['DEFINICIÓN'] || []).forEach(l => { h += '<p>' + linea(l) + '</p>'; });
    h += '</section>';
    if (uno(Q, 'LO QUE MÁS SE CONFUNDE')){
      h += '<div class="ft-confunde"><span class="ft-rotulo">Lo que más se confunde</span>' +
        linea(uno(Q, 'LO QUE MÁS SE CONFUNDE')) + '</div>';
    }
    const piezas = (Q['PIEZAS'] || []).map(l => l.replace(/^\d+\.\s*/, ''));
    if (piezas.length){
      h += '<section class="tarjeta ft-bloque"><h2>Las piezas</h2><ol class="ft-piezas">' +
        piezas.map(l => '<li>' + linea(l) + '</li>').join('') + '</ol></section>';
    }

    /* 2 · Cómo funciona */
    if (f.maquinas.length){
      h += '<div class="titulo-seccion">CÓMO FUNCIONA</div>';
      f.maquinas.forEach((m, i) => {
        h += '<section class="tarjeta ft-bloque" data-maquina="' + i + '">' +
          '<h2>' + esc(m.titulo) + '</h2>' +
          (m.elige ? '<p class="ft-elige">Elegí: ' + linea(m.elige) + '</p>' : '') +
          '<div class="chips ft-chips">' + m.opciones.map((o, j) =>
            '<button type="button" class="chip" data-op="' + j + '" aria-pressed="' + (j === 0) + '">' +
            esc(o.nombre) + '</button>').join('') + '</div>' +
          '<div class="ft-opcion" aria-live="polite">' + linea(m.opciones[0].texto) + '</div>' +
          '</section>';
      });
    }

    /* 3 · Cómo te das cuenta */
    if (f.preguntas.length){
      h += '<div class="titulo-seccion">CÓMO TE DAS CUENTA</div>' +
        '<section class="tarjeta ft-bloque"><p class="ft-cuenta" aria-live="polite">' +
        'Contestá tocando una opción. Llevás 0 de ' + f.preguntas.length + '.</p>';
      f.preguntas.forEach((p, i) => {
        h += '<div class="ft-preg" data-preg="' + i + '"><p>' + (i + 1) + '. ' + linea(p.texto) + '</p>' +
          p.opciones.map(o => '<button type="button" class="ft-resp" data-letra="' + o.letra + '">' +
            o.letra + ') ' + linea(o.texto) + '</button>').join('') + '</div>';
      });
      h += '</section>';
    }

    /* 4 · Lo que hay que aclarar */
    if (f.aclarar.length){
      h += '<div class="titulo-seccion">LO QUE HAY QUE ACLARAR</div>' +
        '<section class="tarjeta ft-bloque"><ul class="ft-aclarar">' +
        f.aclarar.map(l => '<li>' + linea(l) + '</li>').join('') + '</ul></section>';
    }

    h += '<p class="aviso-transcripcion">La armó el <b>Equipo de Fonoaudiología</b> ' +
      'de la Agrupación Simón Bolívar con el cuadernillo de la cátedra. Es material de ' +
      'estudio, no el programa: <b>si algo no coincide con lo que dijeron en clase, ' +
      'vale lo que dice la cátedra.</b></p>';

    destino.innerHTML = h;

    /* Las máquinas: tocar un chip cambia el texto de abajo. */
    destino.querySelectorAll('[data-maquina]').forEach(sec => {
      const m = f.maquinas[+sec.dataset.maquina];
      sec.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
        sec.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        sec.querySelector('.ft-opcion').innerHTML = linea(m.opciones[+b.dataset.op].texto);
      }));
    });

    /* Las preguntas: se contesta una vez y se ve por qué. */
    let bien = 0, hechas = 0;
    const cuenta = destino.querySelector('.ft-cuenta');
    destino.querySelectorAll('[data-preg]').forEach(div => {
      const p = f.preguntas[+div.dataset.preg];
      div.querySelectorAll('.ft-resp').forEach(b => b.addEventListener('click', () => {
        if (div.dataset.hecha) return;
        div.dataset.hecha = '1';
        hechas++;
        const acerto = b.dataset.letra === p.correcta;
        if (acerto) bien++;
        div.querySelectorAll('.ft-resp').forEach(x => {
          x.disabled = true;
          if (x.dataset.letra === p.correcta) x.classList.add('bien');
          else if (x === b) x.classList.add('mal');
        });
        div.insertAdjacentHTML('beforeend', '<p class="ft-porque"><b>' +
          (acerto ? 'Bien.' : 'Era la ' + p.correcta + '.') + '</b> ' + linea(p.porque) + '</p>');
        cuenta.textContent = hechas < f.preguntas.length
          ? 'Llevás ' + bien + ' bien de ' + hechas + ' contestadas (son ' + f.preguntas.length + ').'
          : 'Terminaste: ' + bien + ' de ' + f.preguntas.length + ' bien.';
      }));
    });
  }
})();
