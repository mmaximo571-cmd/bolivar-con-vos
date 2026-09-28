/* ============================================================
   LA BOLIVAR CON VOS · PASAR UNA FECHA AL CALENDARIO DEL CELULAR

   Salio de app.js el 27/9/2026. Eran 310 lineas que bajaban las 23
   pantallas y que usa UNA: Fechas (`agenda/`). Se carga DESPUES de
   app.js, porque necesita de ahi `armarISO`, `caeEnElDia`, `esc`,
   `hoyISO`, `isoVecino`, `normalizar` y `partesFecha`.
   ============================================================ */

/* ------------------------------------------------------------
   PASAR UNA FECHA AL CALENDARIO DEL CELULAR

   La app ya avisa cuándo abre la inscripción a una mesa, pero avisar
   sirve solo si el estudiante está mirando la app ese día. Lo que
   resuelve esto es lo otro: que la fecha quede anotada en el teléfono
   y suene sola dos días antes, con la app cerrada.

   HAY DOS CAMINOS Y NO UNO A PROPÓSITO. El navegador real de esta app
   es el de Instagram, que bloquea bajar archivos casi siempre: si el
   único camino fuera el .ics, en el navegador donde más se usa la app
   el botón no haría nada visible. El enlace de Google Calendar es una
   dirección web común y anda ahí adentro. El .ics queda para el
   calendario del iPhone, el de la compu y quien no use Google.
   ------------------------------------------------------------ */

const LUGAR_POR_DEFECTO = 'Facultad de Trabajo Social, UNLP · 9 y 63, La Plata';
const HUSO = 'America/Argentina/Buenos_Aires';

/* '2026-09-14' -> '20260914' */
function soloNumeros(iso){ return String(iso).slice(0,10).replace(/-/g, ''); }

/* '14:30' -> '143000'. Si viene cualquier otra cosa, null. */
function horaNumeros(hora){
  const m = /^(\d{1,2})[:.]?(\d{2})?/.exec(String(hora || '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  if (!(h >= 0 && h <= 23)) return null;
  return String(h).padStart(2,'0') + (m[2] || '00') + '00';
}

/* Las dos puntas de un evento, en el formato que piden los calendarios.

   EL FINAL ES EXCLUSIVO cuando el evento dura días enteros: una mesa
   del 14 se anota como «del 14 al 15», o el calendario la dibuja como
   un día menos. Es el error clásico de los .ics y por eso está acá una
   sola vez y no en cada pantalla. */
function puntasDelEvento(p){
  const desde = String(p.fecha_desde).slice(0,10);
  const hasta = String(p.fecha_hasta || p.fecha_desde).slice(0,10);
  const hora  = horaNumeros(p.hora);

  if (hora){
    /* Con hora: dos horas de duración, que es lo que dura una mesa. */
    const finHora = String(Math.min(23, Number(hora.slice(0,2)) + 2)).padStart(2,'0')
                  + hora.slice(2);
    return { conHora:true,
             arranque: soloNumeros(desde) + 'T' + hora,
             final:    soloNumeros(hasta) + 'T' + finHora };
  }
  return { conHora:false,
           arranque: soloNumeros(desde),
           final:    soloNumeros(isoVecino(hasta, 1)) };
}

/* El texto que va adentro del evento. Corto: en la notificación del
   celular se ven dos renglones, y el resto es ruido. */
function detalleDelEvento(p){
  const partes = [];
  if (p.cuerpo) partes.push(String(p.cuerpo).trim().slice(0, 400));
  partes.push('Del cronograma de la FTS UNLP · La Bolívar con vos');
  return partes.join('\n\n');
}

function urlGoogleCalendar(p){
  const t = puntasDelEvento(p);
  const q = new URLSearchParams({
    action:   'TEMPLATE',
    text:     p.titulo || 'Fecha de la facu',
    details:  detalleDelEvento(p),
    location: p.lugar || LUGAR_POR_DEFECTO,
    dates:    t.arranque + '/' + t.final,
    ctz:      HUSO
  });
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

/* Adentro de un .ics la coma, el punto y coma y la barra son señales,
   así que en el texto van escapadas. Y los saltos de línea se escriben
   con las dos letras, no como salto de verdad. */
function escaparICS(t){
  return String(t ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g,  '\\;')
    .replace(/,/g,  '\\,')
    .replace(/\r?\n/g, '\\n');
}

/* Los renglones largos van cortados a 75 bytes y seguidos con un
   espacio adelante. Se cuenta en BYTES y no en letras porque cada
   acento pesa dos: cortar a 75 letras da renglones de 90 bytes y hay
   calendarios que ahí se plantan. */
function doblarRenglon(renglon){
  const medir = new TextEncoder();
  let hechos = '', actual = '', bytes = 0;
  for (const letra of renglon){
    const cuanto = medir.encode(letra).length;
    if (bytes + cuanto > 73){ hechos += actual + '\r\n '; actual = ''; bytes = 1; }
    actual += letra; bytes += cuanto;
  }
  return hechos + actual;
}

function eventoICS(p){
  const t = puntasDelEvento(p);
  const inicio = t.conHora ? `DTSTART:${t.arranque}` : `DTSTART;VALUE=DATE:${t.arranque}`;
  const fin    = t.conHora ? `DTEND:${t.final}`      : `DTEND;VALUE=DATE:${t.final}`;

  return [
    'BEGIN:VEVENT',
    `UID:publicacion-${p.id}-${soloNumeros(p.fecha_desde)}@bolivar-con-vos`,
    `DTSTAMP:${soloNumeros(hoyISO())}T000000Z`,
    `SUMMARY:${escaparICS(p.titulo || 'Fecha de la facu')}`,
    `DESCRIPTION:${escaparICS(detalleDelEvento(p))}`,
    `LOCATION:${escaparICS(p.lugar || LUGAR_POR_DEFECTO)}`,
    inicio,
    fin,
    'BEGIN:VALARM',
    'TRIGGER:-P2D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escaparICS('En dos días: ' + (p.titulo || 'una fecha de la facu'))}`,
    'END:VALARM',
    'END:VEVENT'
  ].map(doblarRenglon).join('\r\n');
}

function archivoICS(publicaciones, nombreCalendario){
  const eventos = publicaciones.filter(p => p.fecha_desde).map(eventoICS);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Bolivar con vos//FTS UNLP//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escaparICS(nombreCalendario)}`,
    `X-WR-TIMEZONE:${HUSO}`
  ].map(doblarRenglon).join('\r\n') + '\r\n' + eventos.join('\r\n') + '\r\nEND:VCALENDAR\r\n';
}

/* Nombre de archivo sin acentos ni espacios: hay calendarios que con
   «Inscripción a la mesa.ics» abren un archivo llamado «Inscripci». */
function nombreDeArchivo(t){
  return (normalizar(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'fecha')
         .slice(0, 40) + '.ics';
}

function bajarICS(publicaciones, nombreCalendario){
  const texto = archivoICS(publicaciones, nombreCalendario);
  const bolsa = new Blob([texto], { type:'text/calendar;charset=utf-8' });
  const url   = URL.createObjectURL(bolsa);
  const a     = document.createElement('a');
  a.href = url;
  a.download = nombreDeArchivo(nombreCalendario);
  document.body.appendChild(a);
  a.click();
  a.remove();
  /* Soltarlo enseguida cancela la descarga en algunos navegadores. */
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ¿Esta fecha todavía sirve para agendar? Ofrecer anotar una mesa que
   ya pasó es peor que no ofrecer nada. */
function todaviaViene(p){
  if (!p || !p.fecha_desde) return false;
  return String(p.fecha_hasta || p.fecha_desde).slice(0,10) >= hoyISO();
}

/* El bloque de los dos botones. Se usa igual en el detalle de una
   publicación y en cualquier pantalla que muestre una fecha. */
function htmlAgendarlo(p){
  if (!todaviaViene(p)) return '';
  return `
    <div class="agendarlo">
      <div class="titulo-seccion">PASALO A TU CALENDARIO</div>
      <div class="botones-agenda">
        <a class="boton" href="${esc(urlGoogleCalendar(p))}"
           target="_blank" rel="noopener">Google Calendar ↗</a>
        <button type="button" class="boton borde" data-agendar="${esc(p.id)}">
          Otro calendario
        </button>
      </div>
      <p class="letra-chica">
        Queda anotado con un aviso dos días antes. «Otro calendario» baja un
        archivo que abre el calendario del iPhone o de la computadora; si estás
        entrando desde Instagram puede que no te deje bajarlo, y ahí conviene
        el de Google.
      </p>
    </div>`;
}

/*
  Dibuja un calendario mensual dentro de `caja`.

  publicaciones : las filas de la tabla publicaciones
  alElegirDia   : función que recibe (iso, publicacionesDeEseDia). Si el
                  estudiante deselecciona, recibe (null, []).
  alCambiarMes  : opcional. Recibe (anio, mes) cada vez que se cambia de
                  mes, y una vez al montarse. Lo usa «Fechas» para abrir
                  abajo el grupo del mes que se está mirando arriba.
*/
function montarCalendario(caja, publicaciones, alElegirDia, alCambiarMes){
  const hoy   = hoyISO();
  const parteHoy = partesFecha(hoy);

  let anio = parteHoy.anio;
  let mes  = parteHoy.mes;      // 1-12
  let elegido = null;

  /* La referencia nombra SOLO las líneas que de verdad tienen fechas
     cargadas. Una leyenda que explica un color que no está en la
     grilla no ayuda: hace dudar de si uno se perdió algo. */
  function referencia(){
    const presentes = Object.keys(NOMBRE_LINEA)
      .filter(l => publicaciones.some(p => p.linea === l && p.fecha_desde));
    if (!presentes.length) return '';
    return `<div class="cal-referencia">${presentes.map(l =>
      `<span><i class="cal-punto ${esc(l)}"></i> ${esc(NOMBRE_LINEA[l])}</span>`
    ).join('')}</div>`;
  }

  caja.innerHTML = `
    <div class="calendario">
      <div class="cal-cabecera">
        <button class="cal-flecha" id="cal-antes"  aria-label="Mes anterior">‹</button>
        <div class="cal-mes" id="cal-mes"></div>
        <button class="cal-flecha" id="cal-despues" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-grilla" id="cal-grilla"></div>
      ${referencia()}
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

    /* Miércoles va con X, como en el calendario del inicio: con dos M
       seguidas no se sabe cuál es martes. */
    let html = ['L','M','X','J','V','S','D']
      .map(d => `<div class="cal-nombre-dia">${d}</div>`).join('');

    for (let i = 0; i < primerDia; i++)
      html += `<button class="cal-dia vacio" tabindex="-1"></button>`;

    for (let d = 1; d <= diasDelMes; d++){
      const iso   = armarISO(anio, mes, d);
      const suyas = publicacionesDe(iso);

      /* Una FRANJA por línea presente, no un punto por día.
         La diferencia no es estética: una inscripción que dura tres
         semanas es UNA cosa, y marcada con veinte puntos iguales se
         lee como veinte. Estirada, se lee como el período que es, y
         el resto de los días vuelven a destacarse por contraste. */
      const lineas = [...new Set(suyas.map(p => p.linea))].slice(0, 2);
      const franjas = lineas.map((l, i) => {
        const sigue = vecino =>
          publicaciones.some(p => p.linea === l && caeEnElDia(p, vecino));
        return `<span class="cal-barra ${esc(l)}${
          sigue(isoVecino(iso, -1)) ? ' sigue-izq' : ''}${
          sigue(isoVecino(iso,  1)) ? ' sigue-der' : ''}${
          i ? ' segunda' : ''}"></span>`;
      }).join('');

      const clases = ['cal-dia'];
      if (suyas.length) clases.push('con-cosas'); else clases.push('apagado');
      if (iso === hoy)  clases.push('hoy');

      html += `<button class="${clases.join(' ')}" data-dia="${iso}"
                 aria-pressed="${iso === elegido}"
                 ${suyas.length ? '' : 'disabled'}
                 aria-label="${d} de ${MESES_LARGO[mes-1]}${
                   suyas.length ? ', ' + suyas.length + ' actividad' + (suyas.length>1?'es':'') : ''}">
                 <span class="cal-numero">${d}</span>${franjas}</button>`;
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

  function irAlMes(paso){
    mes += paso;
    if (mes < 1){ mes = 12; anio--; }
    if (mes > 12){ mes = 1;  anio++; }
    dibujar();
    if (alCambiarMes) alCambiarMes(anio, mes);
  }
  caja.querySelector('#cal-antes').onclick   = () => irAlMes(-1);
  caja.querySelector('#cal-despues').onclick = () => irAlMes(1);

  dibujar();
  if (alCambiarMes) alCambiarMes(anio, mes);
}
