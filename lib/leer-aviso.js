/* ============================================================
   LEER UN AVISO PEGADO  ·  7/10/2026

   Los paros y las asambleas llegan primero por WhatsApp, y cargarlos
   en la app era hacer el trabajo dos veces: el mensaje ya dice qué es,
   qué día, a qué hora y dónde, y había que volver a elegirlo todo a
   mano. En plena vorágine eso no pasa, y lo que no se carga no avisa.

   Esto lee el mensaje tal como llega y adivina esas cuatro cosas, más
   el asunto que va en el título. Corre en el teléfono: no le pregunta
   a ningún servicio, no cuesta nada y no se cae. A cambio adivina
   menos que una IA, y por eso NUNCA publica: llena los pasos de
   `cargar/` y la persona revisa todo en la vista previa. Lo que no
   encuentra queda vacío, igual que si se cargara a mano.

   `leerAviso(texto, { materias, que, hoy })` devuelve
   `{ que, fecha, hora, lugar, asunto, relativa }`. `relativa` es la
   palabra («mañana») de la que salió la fecha, porque esa depende del
   día en que se pega y no del día en que se escribió el mensaje.

   Se prueba con `node pruebas-avisos/pruebas-leer-aviso.mjs`.
   ============================================================ */
(function(){

  const DIAS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

  /* Nombres y abreviaturas, con un número de mes cada uno. La lista es
     cerrada a propósito: con un prefijo suelto («mar…») «9 marchas»
     sería el 9 de marzo. */
  const MESES = {
    enero:1, ene:1, febrero:2, feb:2, marzo:3, mar:3, abril:4, abr:4,
    mayo:5, may:5, junio:6, jun:6, julio:7, jul:7, agosto:8, ago:8,
    septiembre:9, setiembre:9, sept:9, sep:9, set:9, octubre:10, oct:10,
    noviembre:11, nov:11, diciembre:12, dic:12
  };
  const RE_MES = Object.keys(MESES).sort((a, b) => b.length - a.length).join('|');

  /* Qué palabra dice qué clase de cosa es. Gana la que aparece PRIMERO
     en el mensaje: «Asamblea para definir el paro» es una asamblea, y
     «Paro y movilización» es un paro. */
  const PALABRAS = {
    grupo: /grupo de estudio|grupos de estudio|nos juntamos a estudiar|juntarnos a estudiar|repaso para|repasar para|preparar el final/,
    paro: /\bparo\b|\bparamos\b|medida de fuerza|jornada de lucha|\bhuelga\b|no hay clases|sin dictado de clases|cese de actividades/,
    actividad: /\basamblea|\bcharla|\btaller|\bconversatorio|\bmovilizacion|\bmarcha\b|\bmarchamos\b|clase publica|clases publicas|\babrazo\b|\bjornada\b|\bencuentro\b|\bfestival|\bruidazo|\bsemaforazo|\bolla popular|\bvigilia|\bradio abierta|\bproyeccion\b|\bcine debate|\bvolanteada/
  };

  /* Siglas que no se pasan a minúscula al bajar un título que vino EN
     MAYÚSCULAS. Sin esta lista «PARO DE ADULP» quedaba «Paro de adulp». */
  const SIGLAS = ['UNLP','ADULP','CONADU','AGD','FTS','FUA','FULP','CTA','CGT','ATE',
                  'CEFTS','UBA','SUM','LGBTIQ','LGBTIQ+','ESI','ILE','IVE','DDHH','CONICET','UTN'];

  const SIN_TILDE = { 'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'ü':'u', 'ñ':'n' };

  /* Minúsculas y sin tildes, letra por letra: el resultado tiene el
     MISMO largo que el original, así una posición encontrada en uno
     sirve para cortar el otro y el asunto sale con sus tildes. */
  function plano(s){
    return s.toLowerCase().replace(/[áéíóúüñ]/g, c => SIN_TILDE[c]);
  }

  function aISO(d){
    /* A mano y no con `toISOString()`, que pasa a UTC y en Argentina
       adelanta un día toda la tarde (lo mismo que en `cargar/`). */
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function fechaValida(a, m, d){
    const f = new Date(a, m - 1, d);
    return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d ? f : null;
  }

  /* Sin año, un día y mes se toman de este año, salvo que ya haya
     pasado hace más de un mes: en diciembre, «5/2» es febrero que viene.
     Un mes de margen y no cero, porque a veces se carga algo de la
     semana pasada para que quede en la agenda. */
  function conAnio(m, d, hoy, anio){
    if (anio) return fechaValida(anio < 100 ? 2000 + anio : anio, m, d);
    const este = fechaValida(hoy.getFullYear(), m, d);
    if (!este) return null;
    const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    return este < haceUnMes ? fechaValida(hoy.getFullYear() + 1, m, d) : este;
  }

  function sumarDias(hoy, n){
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + n);
  }

  /* ------------------------------------------------------------
     LA FECHA
     Se juntan todas las que aparecen y gana la primera: los mensajes
     dicen el día arriba, y lo que viene después suele ser otra cosa
     («hasta el viernes», «la próxima asamblea es el 20»).
     ------------------------------------------------------------ */
  function buscarFecha(p, hoy){
    const halladas = [];
    let m;

    /* 9/10, 9-10, 9/10/26. El punto no cuenta como separador: «18.30»
       es una hora. */
    const reNum = /\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/g;
    while ((m = reNum.exec(p))){
      const f = conAnio(Number(m[2]), Number(m[1]), hoy, m[3] ? Number(m[3]) : null);
      if (f) halladas.push({ pos: m.index, fecha: f });
    }

    /* 9 de octubre, 9 oct */
    const reTexto = new RegExp(`\\b(\\d{1,2})(?:\\s+de)?\\s+(${RE_MES})\\b`, 'g');
    while ((m = reTexto.exec(p))){
      const f = conAnio(MESES[m[2]], Number(m[1]), hoy, null);
      if (f) halladas.push({ pos: m.index, fecha: f });
    }

    /* hoy, mañana, pasado mañana. «A la mañana» y «de la mañana» son
       la hora del día, no el día de mañana. */
    const reRel = /\b(pasado manana|manana|hoy)\b/g;
    while ((m = reRel.exec(p))){
      if (m[1] === 'manana' && /\b(la|esta) $/.test(p.slice(Math.max(0, m.index - 5), m.index))) continue;
      const n = m[1] === 'hoy' ? 0 : m[1] === 'manana' ? 1 : 2;
      halladas.push({ pos: m.index, fecha: sumarDias(hoy, n), relativa: m[1].replace('manana', 'mañana') });
    }

    /* El jueves, este jueves, el próximo jueves, jueves 9. */
    const reDia = /\b(?:(proximo|este|el)\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b(\s+\d{1,2}\b)?/g;
    while ((m = reDia.exec(p))){
      const objetivo = DIAS.indexOf(m[2]);
      /* «El miércoles 18 hs»: ese 18 es la hora, no el día del mes. */
      if (m[3] && /^\s*(hs|h|hrs|horas)\b|^[:.]\d/.test(p.slice(m.index + m[0].length))) m[3] = null;
      if (m[3]){
        /* «Jueves 9»: si además dice el mes («jueves 9 de octubre»,
           «jueves 9/10»), ya lo levantaron las de arriba. Si no, es el
           próximo día 9 que caiga desde hoy. */
        const despues = p.slice(m.index + m[0].length, m.index + m[0].length + 16);
        if (/^[\/-]\d/.test(despues) || new RegExp(`^\\s*(de\\s+)?(${RE_MES})\\b`).test(despues)) continue;
        const dia = Number(m[3]);
        for (let i = 0; i < 62; i++){
          const f = sumarDias(hoy, i);
          if (f.getDate() === dia){ halladas.push({ pos: m.index, fecha: f }); break; }
        }
        continue;
      }
      /* «El jueves» dicho un jueves es hoy; «el próximo jueves», el de
         la semana que viene. */
      let n = (objetivo - hoy.getDay() + 7) % 7;
      if (m[1] === 'proximo' && n === 0) n = 7;
      halladas.push({ pos: m.index, fecha: sumarDias(hoy, n), relativa: m[0].trim() });
    }

    if (!halladas.length) return { fecha: null, relativa: null };
    halladas.sort((a, b) => a.pos - b.pos);
    return { fecha: aISO(halladas[0].fecha), relativa: halladas[0].relativa || null };
  }

  /* ------------------------------------------------------------
     LA HORA
     ------------------------------------------------------------ */
  function buscarHora(p){
    const halladas = [];
    let m;

    const anotar = (pos, h, min, resto) => {
      h = Number(h); min = Number(min || 0);
      if (min > 59) return;
      /* «De la tarde/noche» suma doce; sin decir nada, de 1 a 7 también
         (nadie convoca a una asamblea a las 6 de la mañana: «a las 6»
         son las 18). Las 8 quedan como están: hay clases a las 8. */
      if (h < 12 && /^\s*(hs\.?|h\.?|horas)?\s*(de la tarde|de la noche|pm|p\.m)/.test(resto)) h += 12;
      else if (h >= 1 && h <= 7 && !/^\s*(hs\.?|h\.?|horas)?\s*(de la manana|am|a\.m)/.test(resto)) h += 12;
      if (h > 23) return;
      halladas.push({ pos, hora: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}` });
    };

    /* 18:30, 18.30, 18:30 hs */
    const reMin = /\b(\d{1,2})[:.](\d{2})\b/g;
    while ((m = reMin.exec(p))) anotar(m.index, m[1], m[2], p.slice(m.index + m[0].length, m.index + m[0].length + 16));

    /* 18 hs, 18hs, 18 h, 18 horas. Los paros de «48 hs» y «24 horas»
       no son horas del día: los que pasan de 23 se descartan solos, y
       «paro de 12 horas» se salta mirando lo que hay antes. */
    const reHs = /\b(\d{1,2})\s*(hs|h|hrs|horas)\b/g;
    while ((m = reHs.exec(p))){
      if (/(paro|medida|jornada|durante)\s+(de\s+)?$/.test(p.slice(Math.max(0, m.index - 16), m.index))) continue;
      anotar(m.index, m[1], 0, p.slice(m.index + m[1].length, m.index + m[0].length + 16));
    }

    /* a las 6, a partir de las 18 */
    const reALas = /\b(?:a las|desde las|a partir de las)\s+(\d{1,2})\b(?![:.]\d)/g;
    while ((m = reALas.exec(p))){
      anotar(m.index, m[1], 0, p.slice(m.index + m[0].length, m.index + m[0].length + 16));
    }

    const mediodia = p.search(/\bal mediodia\b/);
    if (mediodia >= 0) halladas.push({ pos: mediodia, hora: '12:00' });

    if (!halladas.length) return null;
    halladas.sort((a, b) => a.pos - b.pos);
    return halladas[0].hora;
  }

  /* ------------------------------------------------------------
     EL LUGAR
     Acá no gana el primero sino el más preciso: «en la facu, aula 3»
     es el aula 3. Los que coinciden con los botones de `cargar/` («La
     facultad», «El hall») se escriben igual, así el botón sale marcado.
     ------------------------------------------------------------ */
  function buscarLugar(t, p){
    let m;

    /* Una línea con 📍 o con «Lugar:» lo dice sin vueltas. */
    m = t.match(/(?:📍|\b[Ll]ugar\s*:|\b[Dd][oó]nde\s*:)\s*([^\n]+)/);
    if (m){
      const lugar = limpiarRenglon(m[1]).replace(/[.,;]+$/, '');
      if (lugar) return mayuscula(lugar).slice(0, 80);
    }

    m = p.match(/\baula\s+(magna|\d+[a-z]?\b|[ivx]+\b)/);
    if (m) return 'Aula ' + (m[1] === 'magna' ? 'Magna' : t.substr(m.index + 5, m[0].length - 5).trim().toUpperCase());

    if (/\bhall\b/.test(p)) return 'El hall';
    if (/\bsum\b/.test(p)) return 'El SUM';

    /* Plaza Moreno, Plaza San Martín, Plaza de Mayo: solo con
       mayúsculas, que es lo que distingue un nombre de «una plaza». */
    m = t.match(/\b(?:[Pp]laza|[Pp]arque)(?:\s+(?:de\s+)?[A-ZÁÉÍÓÚÑ][\wáéíóúñ]*){1,3}/);
    if (m) return mayuscula(m[0]);

    if (/\b(puerta|frente) (de|a) la facu(ltad)?\b/.test(p)) return 'La puerta de la facultad';
    if (/\brectorado\b/.test(p)) return 'El rectorado';
    if (/\bcomedor\b/.test(p)) return 'El comedor';
    if (/\bfacu(ltad)?\b/.test(p)) return 'La facultad';
    return '';
  }

  /* ------------------------------------------------------------
     EL ASUNTO
     Lo que en `cargar/` va en el título. Cada clase lo pide distinto:
     el paro, por qué es; el grupo, la materia; la actividad, qué es.
     ------------------------------------------------------------ */

  /* Sin emojis, sin almohadillas, sin espacios de más. */
  function limpiarRenglon(s){
    return s
      .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣]/gu, ' ')
      .replace(/#\S+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s:–—\-|·•]+|[\s:–—\-|·•]+$/g, '')
      .trim();
  }

  function mayuscula(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }

  /* Un título que llegó EN MAYÚSCULAS se baja, menos las siglas. */
  function bajarGritos(s){
    const letras = s.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
    if (letras.length < 4 || letras !== letras.toUpperCase()) return s;
    return mayuscula(s.split(' ').map(w =>
      SIGLAS.includes(w.replace(/[^\wÁÉÍÓÚÑ+]/g, '')) ? w : w.toLowerCase()).join(' '));
  }

  /* Corta en la última palabra entera antes de 80, que es el tope del
     campo en `cargar/`. */
  function recortar(s){
    if (s.length <= 80) return s;
    const corte = s.slice(0, 80);
    return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:]+$/, '');
  }

  /* «Contra el recorte», «en defensa de la universidad pública»: desde
     la palabra que da el motivo hasta donde termina la frase o empieza
     el cuándo. */
  function motivoDelParo(t, p){
    const re = /\b(en defensa de|en defensa del|contra|en rechazo a|en rechazo al|en reclamo de|en reclamo por|exigiendo|por)\s+(?!\d)/g;
    let m;
    while ((m = re.exec(p))){
      const desde = m.index;
      let resto = p.slice(desde);
      const fin = resto.search(/[.\n!;?]|\s(este|el|esta|hoy|manana|desde|a las|a partir)\s(lunes|martes|miercoles|jueves|viernes|sabado|domingo|\d|las|manana)|\s\d{1,2}[\/-]\d/);
      const largo = fin > 0 ? fin : resto.length;
      const motivo = limpiarRenglon(t.substr(desde, largo)).replace(/[,:]+$/, '');
      /* «por 48 hs», «por la tarde»: eso no es un motivo. */
      if (motivo.split(' ').length < 2 ||
          /^por (favor|eso|que|ello|lo tanto|la (tarde|manana|noche)|las)\b/.test(plano(motivo))) continue;
      return recortar(mayuscula(bajarGritos(motivo)));
    }
    return '';
  }

  /* Escrita igual que en el plan, que es lo que hace sonar el aviso a
     quien la cursa. Se compara sin tildes y con los números romanos
     pasados a cifras: «trabajo social 1» es «Trabajo Social I». */
  function materiaDelGrupo(p, materias){
    const romanos = s => s.replace(/\biv\b/g, '4').replace(/\biii\b/g, '3')
      .replace(/\bii\b/g, '2').replace(/\bi\b/g, '1').replace(/\bv\b/g, '5');
    const texto = romanos(p);
    let mejor = '';
    (materias || []).forEach(nombre => {
      const buscada = romanos(plano(nombre));
      const re = new RegExp('\\b' + buscada.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      if (re.test(texto) && nombre.length > mejor.length) mejor = nombre;
    });
    return mejor;
  }

  /* El renglón que nombra la actividad. Si quedó en una palabra sola
     («📣 ASAMBLEA 📣») y el renglón de abajo es el tema, se juntan. */
  function nombreDeLaActividad(t){
    const renglones = t.split('\n').map(limpiarRenglon).filter(Boolean);
    let i = renglones.findIndex(r => PALABRAS.actividad.test(plano(r)));
    if (i < 0) i = 0;
    let nombre = bajarGritos(renglones[i] || '');
    const siguiente = renglones[i + 1];
    if (nombre.split(' ').length <= 2 && siguiente && siguiente.length < 70 && !/\d/.test(siguiente) &&
        !/\b(hoy|manana|lunes|martes|miercoles|jueves|viernes|sabado|domingo|lugar|aula)\b/.test(plano(siguiente))){
      const sig = bajarGritos(siguiente);
      nombre += ' ' + (SIGLAS.includes(sig.split(' ')[0]) ? sig : sig[0].toLowerCase() + sig.slice(1));
    }
    return recortar(nombre);
  }

  /* ------------------------------------------------------------
     TODO JUNTO
     ------------------------------------------------------------ */
  function leerAviso(texto, opciones){
    opciones = opciones || {};
    const hoy = opciones.hoy || new Date();
    /* Lo que WhatsApp usa para negrita, cursiva y tachado no es texto. */
    const t = String(texto || '').normalize('NFC').replace(/[*_~]/g, '').replace(/\r/g, '');
    const p = plano(t);

    let que = opciones.que || null;
    if (!que){
      let primero = Infinity;
      Object.entries(PALABRAS).forEach(([clase, re]) => {
        const pos = p.search(re);
        if (pos >= 0 && pos < primero){ primero = pos; que = clase; }
      });
      /* «Grupo de estudio» gana aunque aparezca después: un grupo que
         dice «no hay clases el lunes, nos juntamos a estudiar» es un
         grupo, no un paro. */
      if (PALABRAS.grupo.test(p)) que = 'grupo';
    }

    const { fecha, relativa } = buscarFecha(p, hoy);
    const asunto = que === 'paro' ? motivoDelParo(t, p)
                 : que === 'grupo' ? materiaDelGrupo(p, opciones.materias)
                 : que === 'actividad' ? nombreDeLaActividad(t)
                 : '';

    return { que, fecha, hora: buscarHora(p), lugar: buscarLugar(t, p), asunto, relativa };
  }

  if (typeof window !== 'undefined') window.leerAviso = leerAviso;
  if (typeof module !== 'undefined') module.exports = leerAviso;
})();
