/* ============================================================
   EL CHAT DE «AVISANOS»

   Se baja SOLO cuando alguien toca el botón flotante. Quien nunca lo
   abre no paga ni un byte: por eso vive acá y no en app.js.

   QUÉ ES Y QUÉ NO ES. Busca entre los trámites y las preguntas
   frecuentes que el equipo cargó, y contesta con la ficha que ya
   está escrita. No es una inteligencia artificial y no redacta
   respuestas nuevas.

   Eso no es una limitación que arrastramos: es la decisión. A
   «¿hasta cuándo me inscribo?» hay una sola respuesta correcta y la
   sabe la facultad, no un modelo. Un bot que contesta con seguridad
   algo que se le ocurrió hace más daño que uno que dice «esto no lo
   tengo, preguntale a alguien».

   Cuando no sabe hace tres cosas, en este orden:
     1. lo dice sin vueltas,
     2. guarda la pregunta para que el equipo la cargue,
     3. pasa a un compañero de la carrera, por mensaje directo.

   Antes de que funcione hay que correr `tabla-avisanos.sql`.
   ============================================================ */

window.Avisanos = (function(){

  const LLAVE_CARRERA = 'bolivar-carrera-chat';
  const CARRERAS = { ts:'Trabajo Social', tgcr:'Gestión del Riesgo', fono:'Fonoaudiología' };
  const INSTAGRAM = 'https://www.instagram.com/SimonBolivarfts';

  let cargado = false;     // ¿ya trajimos los trámites?
  let tramites = [], preguntas = [], contactos = [];
  let carrera = null;
  let caja, hilo, entrada;

  /* ============================================================
     1. BUSCAR

     Un `includes` no alcanza. Quien escribe «no me deja anotarme a
     una materia» no comparte ni una palabra con el título
     «Inscribirse a las materias del cuatrimestre», pero sí con sus
     palabras clave: anotarse, materias, inscripcion. Por eso el peso
     grande está ahí y no en el título.
     ============================================================ */

  function normalizar(s){
    return (s || '').toString()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9ñ]+/g, ' ').trim();
  }

  /* Palabras que aparecen en cualquier pregunta y no distinguen nada.
     Sin sacarlas, «cómo hago para X» le da puntos a todo. */
  const VACIAS = new Set(('de la el los las un una unos unas y o u en a al con por para que ' +
    'como donde cuando cual cuales cuanto quien mi me se es son esta este esa ese eso hay si no ' +
    'del lo su sus te tu yo mas muy ya pero tengo tiene puedo quiero necesito hacer hago saber ' +
    'sobre hasta desde algo alguien cosa favor gracias hola buenas dias tardes').split(' '));

  /* Singular y plural cuentan igual: «materia» tiene que encontrar
     «materias», y «becas» tiene que encontrar «beca». */
  function mismaPalabra(a, b){
    if (a === b) return true;
    const raiz = p => p.replace(/(es|s)$/, '');
    if (raiz(a) === raiz(b) && raiz(a).length >= 4) return true;

    /* Y si arrancan igual por seis letras, es la misma palabra
       conjugada de otra forma: «inscribo» e «inscripcion», «imprimo»
       e «imprimir», «certificado» y «certificacion».

       Seis es el punto justo. Con cinco, «programa» y «progresar»
       pasarían por lo mismo, y el que busca el programa de una
       materia terminaría en la beca PROGRESAR. */
    let iguales = 0;
    while (iguales < a.length && iguales < b.length && a[iguales] === b[iguales]) iguales++;
    return iguales >= 6;
  }

  function fichasBuscables(){
    return tramites.map(t => ({
      tipo: 'tramite', id: t.id, titulo: t.titulo,
      resumen: t.resumen || '',
      claves: normalizar(t.palabras_clave).split(' ').filter(Boolean),
      tienePasos: Array.isArray(t.pasos) && t.pasos.length
    })).concat(preguntas.map(p => ({
      tipo: 'faq', id: p.id, titulo: p.pregunta,
      resumen: (p.respuesta || '').slice(0, 160),
      claves: normalizar(p.pregunta + ' ' + p.respuesta).split(' ').filter(Boolean),
      tienePasos: false
    })));
  }

  function buscar(consulta){
    const texto  = normalizar(consulta);
    const piezas = texto.split(' ').filter(p => p.length >= 3 && !VACIAS.has(p));
    if (!piezas.length) return [];

    return fichasBuscables().map(f => {
      const enTitulo = normalizar(f.titulo).split(' ');
      const enResumen = normalizar(f.resumen);
      let puntos = 0;

      piezas.forEach(p => {
        if (f.claves.some(c => mismaPalabra(c, p)))    puntos += 6;
        if (enTitulo.some(t => mismaPalabra(t, p)))    puntos += 4;
        else if (enResumen.indexOf(p) !== -1)          puntos += 1;
      });

      /* La frase entera, tal cual, vale aparte: «boleto universitario»
         tiene que ganarle a una ficha que solo diga «universitario». */
      if (texto.length >= 6 && normalizar(f.titulo + ' ' + f.claves.join(' ')).indexOf(texto) !== -1)
        puntos += 5;

      return { ficha: f, puntos: puntos };
    })
    /* El corte en 6 es un acierto sólido: una palabra clave entera, o
       dos palabras del título. Con menos empieza a contestar
       cualquier cosa, que es peor que no contestar. */
    .filter(x => x.puntos >= 6)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 3)
    .map(x => x.ficha);
  }

  /* ============================================================
     2. LOS DATOS
     ============================================================ */

  async function traer(){
    if (cargado) return true;
    try {
      const [rT, rF, rC] = await Promise.all([
        db.from('tramites').select('id,titulo,resumen,palabras_clave,pasos').eq('publicado', true),
        db.from('faq').select('id,pregunta,respuesta').eq('publicado', true),
        db.from('contactos').select('*').eq('activo', true).order('orden')
      ]);
      tramites  = rT.data || [];
      preguntas = rF.data || [];
      /* Si falta la tabla de contactos el chat igual sirve: busca y
         responde, y para el traspaso queda el Instagram de la
         agrupación. Media función es mejor que un cartel de error. */
      contactos = rC.error ? [] : (rC.data || []);
      cargado = true;
      return true;
    } catch(e){ return false; }
  }

  /* Tres al azar de la carrera que dijo, más los que atienden a todos.
     Al azar y no siempre los mismos para que las consultas no le
     caigan siempre a la misma compañera. */
  function contactosDe(id){
    const suyos = contactos.filter(c => c.carrera === id || c.carrera === 'todas');
    const mezclados = suyos.slice();
    for (let i = mezclados.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [mezclados[i], mezclados[j]] = [mezclados[j], mezclados[i]];
    }
    return mezclados.slice(0, 3);
  }

  function enlaceDe(c){
    if (c.tipo === 'whatsapp') return 'https://wa.me/' + String(c.destino).replace(/\D/g, '');
    if (c.tipo === 'mail')     return 'mailto:' + c.destino;
    return 'https://www.instagram.com/' + String(c.destino).replace(/^@/, '');
  }

  function comoSeEscribe(c){
    return c.tipo === 'whatsapp' ? 'WhatsApp' : c.tipo === 'mail' ? 'Correo' : 'Instagram';
  }

  async function guardarConsulta(texto){
    try {
      await db.from('consultas').insert({
        texto: texto.slice(0, 500),
        carrera: carrera,
        pantalla: location.pathname
      });
    } catch(e){ /* que no se haya podido guardar no es asunto del estudiante */ }
  }

  /* ============================================================
     3. LA CONVERSACIÓN
     ============================================================ */

  function decir(quien, html, clase){
    const d = document.createElement('div');
    d.className = 'chat-burbuja ' + quien + (clase ? ' ' + clase : '');
    d.innerHTML = html;
    hilo.appendChild(d);
    hilo.scrollTop = hilo.scrollHeight;
    return d;
  }

  function fichaHTML(f){
    const url = RAIZ + 'tramites/?' + (f.tipo === 'faq' ? 'faq=' : 'id=') + f.id;
    return `<a class="chat-ficha" href="${url}">
        <span class="chat-ficha-titulo">${esc(f.titulo)}</span>
        <span class="marca-tipo ${f.tienePasos ? 'guia' : 'enlace'}">${
          f.tienePasos ? 'Paso a paso' : 'Sitio oficial'}</span>
      </a>`;
  }

  function preguntarCarrera(){
    const d = decir('bot', `¿De qué carrera sos? Así te paso el contacto que corresponde.
      <div class="chat-opciones">${Object.keys(CARRERAS).map(k =>
        `<button class="chat-opcion" data-carrera="${k}">${esc(CARRERAS[k])}</button>`).join('')}</div>`);
    d.querySelectorAll('[data-carrera]').forEach(b => {
      b.onclick = () => {
        carrera = b.dataset.carrera;
        try { localStorage.setItem(LLAVE_CARRERA, carrera); } catch(e){}
        d.querySelector('.chat-opciones').remove();
        decir('yo', esc(CARRERAS[carrera]));
        ofrecerContactos();
      };
    });
  }

  function ofrecerContactos(){
    const suyos = contactosDe(carrera);

    if (!suyos.length){
      decir('bot', `Escribinos por mensaje directo a Instagram y te contestamos.
        <div class="chat-opciones">
          <a class="chat-opcion" href="${INSTAGRAM}" target="_blank" rel="noopener">
            Abrir Instagram</a></div>`);
      return;
    }

    decir('bot', `Escribile a cualquiera de estos compañeros y te dan una mano:
      <div class="chat-contactos">${suyos.map(c => `
        <a class="chat-contacto" href="${esc(enlaceDe(c))}" target="_blank" rel="noopener">
          <span class="chat-contacto-nombre">${esc(c.nombre)}</span>
          ${c.detalle ? `<span class="chat-contacto-detalle">${esc(c.detalle)}</span>` : ''}
          <span class="chat-contacto-como">${comoSeEscribe(c)}</span>
        </a>`).join('')}</div>
      <span class="chat-nota">O por mensaje directo a
        <a href="${INSTAGRAM}" target="_blank" rel="noopener">@SimonBolivarfts</a>.</span>`);
  }

  async function responder(texto){
    decir('yo', esc(texto));

    const pensando = decir('bot', '<span class="chat-puntos"><i></i><i></i><i></i></span>', 'pensando');
    const hay = await traer();
    pensando.remove();

    if (!hay){
      decir('bot', `No pude conectarme para buscar. Probá de nuevo en un rato, o
        escribinos por mensaje directo a
        <a href="${INSTAGRAM}" target="_blank" rel="noopener">@SimonBolivarfts</a>.`);
      return;
    }

    const encontradas = buscar(texto);

    if (encontradas.length){
      decir('bot', (encontradas.length === 1
          ? 'Esto es lo que tenemos:'
          : 'Encontré esto:') +
        `<div class="chat-fichas">${encontradas.map(fichaHTML).join('')}</div>
         <span class="chat-nota">¿No era esto? Escribilo de otra forma, o
           <button class="chat-enlace" data-pasar="1">hablá con un compañero</button>.</span>`);
      /* Si acá toca «hablá con un compañero» es que lo que encontramos
         no le servía: eso también es una consulta sin responder y hay
         que guardarla igual que si no hubiéramos encontrado nada. */
      const ultimo = [...hilo.querySelectorAll('[data-pasar]')].pop();
      if (ultimo) ultimo.onclick = () => { guardarConsulta(texto); pasarAPersona(); };
      return;
    }

    /* No encontró. Se dice sin vueltas, se guarda para que el equipo
       lo cargue, y se pasa a una persona. */
    guardarConsulta(texto);
    decir('bot', `Eso no lo tengo cargado, así que prefiero no inventarte una respuesta.`);
    pasarAPersona();
  }

  function pasarAPersona(){
    if (carrera) ofrecerContactos();
    else preguntarCarrera();
  }

  /* ============================================================
     4. LA VENTANA
     ============================================================ */

  function sugerencias(){
    return ['Inscribirme a una materia', 'Anotarme para un final',
            'Boleto universitario', 'Becas'];
  }

  function montar(){
    document.body.insertAdjacentHTML('beforeend', `
      <div class="chat-fondo" id="chat-fondo" hidden>
        <div class="chat" role="dialog" aria-modal="true" aria-labelledby="chat-titulo">
          <div class="chat-cabecera">
            <div>
              <h2 id="chat-titulo">AVISANOS</h2>
              <p>Te busco entre los trámites y las preguntas de la app.</p>
            </div>
            <button class="chat-cerrar" id="chat-cerrar" aria-label="Cerrar el chat">✕</button>
          </div>
          <div class="chat-hilo" id="chat-hilo" role="log" aria-live="polite"></div>
          <form class="chat-pie" id="chat-pie">
            <input id="chat-entrada" autocomplete="off" placeholder="Escribí tu consulta…"
                   aria-label="Escribí tu consulta" maxlength="500">
            <button class="chat-enviar" type="submit" aria-label="Enviar">→</button>
          </form>
        </div>
      </div>`);

    caja    = document.getElementById('chat-fondo');
    hilo    = document.getElementById('chat-hilo');
    entrada = document.getElementById('chat-entrada');

    document.getElementById('chat-cerrar').onclick = cerrar;
    caja.addEventListener('click', e => { if (e.target === caja) cerrar(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !caja.hidden) cerrar();
    });

    document.getElementById('chat-pie').onsubmit = e => {
      e.preventDefault();
      const t = entrada.value.trim();
      if (!t) return;
      entrada.value = '';
      responder(t);
    };

    try { carrera = localStorage.getItem(LLAVE_CARRERA) || null; } catch(e){}

    const d = decir('bot', `Hola. Te busco entre los trámites y las preguntas
      frecuentes que tenemos cargados. Si no lo tengo, te paso con alguien.
      <div class="chat-opciones">${sugerencias().map(s =>
        `<button class="chat-opcion" data-sug="${esc(s)}">${esc(s)}</button>`).join('')}</div>`);
    d.querySelectorAll('[data-sug]').forEach(b => {
      b.onclick = () => { d.querySelector('.chat-opciones').remove(); responder(b.dataset.sug); };
    });

    /* Se traen los datos apenas se abre, sin esperar a que escriba:
       para cuando termine de tipear ya están. */
    traer();
  }

  function cerrar(){
    caja.hidden = true;
    document.body.style.overflow = '';
    const boton = document.getElementById('avisanos');
    if (boton) boton.focus();
  }

  function abrir(){
    if (!caja) montar();
    caja.hidden = false;
    document.body.style.overflow = 'hidden';
    entrada.focus();
  }

  return { abrir: abrir, buscar: buscar,
           /* para poder probar el buscador sin base de datos */
           _cargar: (t, f) => { tramites = t; preguntas = f || []; cargado = true; } };
})();
