/* ============================================================
   LA BOLIVAR CON VOS · PASAR UNA FECHA AL CALENDARIO DEL CELULAR

   Salio de app.js el 27/9/2026. Eran 310 lineas que bajaban las 23
   pantallas y que usaba UNA: Fechas (`agenda/`). Desde el 30/9 la usa
   tambien el inicio, por el calendario del mes: los dos marcan lo
   mismo (ver `montarCalendario`). Se carga DESPUES de
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

/* Los nombres de la referencia del calendario, en el orden en que se
   leen: primero lo que cambia el día. */
const NOMBRE_CATEGORIA_CAL = {
  paro:       'Paro',
  grupo:      'Grupo de estudio',
  actividad:  'Actividad',
  fecha:      'Fecha académica',
  comunicado: 'Comunicado'
};

/*
  Dibuja un calendario mensual dentro de `caja`.

  publicaciones : las filas de la tabla publicaciones
  alElegirDia   : función que recibe (iso, publicacionesDeEseDia). Si el
                  estudiante deselecciona, recibe (null, []).
  alCambiarMes  : opcional. Recibe (anio, mes) cada vez que se cambia de
                  mes, y una vez al montarse. Lo usa «Fechas» para abrir
                  abajo el grupo del mes que se está mirando arriba.
*/
function montarCalendario(caja, publicaciones, alElegirDia, alCambiarMes, opciones){
  /* `opciones.enlace` arma el vínculo a una publicación: en Fechas es
     `?id=`, en el inicio `agenda/?id=`. `opciones.clase` suma una clase a
     la caja (el inicio usa `cuadrado`). */
  const enlace = (opciones && opciones.enlace) || (id => '?id=' + encodeURIComponent(id));
  const hoy   = hoyISO();
  const parteHoy = partesFecha(hoy);

  let anio = parteHoy.anio;
  let mes  = parteHoy.mes;      // 1-12
  let elegido = null;

  /* Las marcas van por CATEGORÍA desde el 30/9/2026: lo que la
     estudiante necesita saber de un día es si hay paro, si hay un
     grupo, si hay una asamblea; la línea editorial es cosa nuestra.
     Una fila vieja sin `categoria` (antes de correr el SQL) cae en
     la de su tipo, así la grilla nunca queda sin marcas. */
  const cat = p => p.categoria ||
    (p.tipo === 'fecha' ? 'fecha' : p.tipo === 'novedad' ? 'comunicado' : 'actividad');

  /* Lo suspendido no marca el día: sigue en la lista, tachado, pero
     un punto en la grilla diría que ese día pasa algo. */
  const vigentes = publicaciones.filter(p => !p.suspendido && p.fecha_desde);

  /* CÓMO SE DIBUJA CADA COSA (rehecho el 30/9/2026)

     Antes cada fecha de varios días era una raya debajo de los números,
     y un período de tres meses —los seminarios del cuatrimestre— rayaba
     todas las semanas: con dos o tres períodos a la vez, el mes entero
     quedaba tachado y no se entendía nada. Se buscó cómo lo resuelven
     los calendarios de teléfono y se tomó lo que coincide en todos: en
     una pantalla chica la grilla es para ubicarse, y el detalle va en
     la lista de abajo. Entonces:

       de un día        un punto del color de la categoría (hasta tres)
       de 2 a 10 días   una banda suave detrás de los días, como el rango
                        de fechas de Material: se ve que es UNA cosa que
                        dura, sin tapar los números. Una sola por día, la
                        más corta.
       de más de 10     no va en la grilla: va en «Todo el mes», abajo,
                        con hasta cuándo dura. Su primer y su último día
                        llevan un punto, porque esos días sí pasa algo.
       paro             pinta el día entero de rojo.

     Un día sin ninguna marca no se resalta ni se puede tocar, aunque un
     período largo lo cubra: si no, todo el mes quedaría en negrita. */
  const dia0 = p => String(p.fecha_desde).slice(0,10);
  const dia1 = p => String(p.fecha_hasta || p.fecha_desde).slice(0,10);
  const duracion = p => Math.round((Date.parse(dia1(p)) - Date.parse(dia0(p))) / 86400000) + 1;
  const RANGO_MAXIMO = 10;
  const esParo    = p => cat(p) === 'paro';
  const esRango   = p => !esParo(p) && duracion(p) >= 2 && duracion(p) <= RANGO_MAXIMO;
  const esPeriodo = p => !esParo(p) && duracion(p) > RANGO_MAXIMO;

  caja.innerHTML = `
    <div class="calendario${opciones && opciones.clase ? ' ' + esc(opciones.clase) : ''}">
      <div class="cal-cabecera">
        <button class="cal-flecha" id="cal-antes"  aria-label="Mes anterior">‹</button>
        <div class="cal-mes" id="cal-mes"></div>
        <button class="cal-flecha" id="cal-despues" aria-label="Mes siguiente">›</button>
      </div>
      <div class="cal-grilla" id="cal-grilla"></div>
      <div id="cal-pie"></div>
    </div>`;

  const grilla    = caja.querySelector('#cal-grilla');
  const tituloMes = caja.querySelector('#cal-mes');
  const pie       = caja.querySelector('#cal-pie');

  function publicacionesDe(iso){
    return publicaciones.filter(p => caeEnElDia(p, iso));
  }

  /* Lo que marca un día, ya decidido. */
  function marcasDe(iso){
    const aca = vigentes.filter(p => caeEnElDia(p, iso));
    const puntos = [];
    aca.forEach(p => {
      if (esParo(p) || esRango(p) && dia0(p) !== iso) return;
      if (esPeriodo(p) && iso !== dia0(p) && iso !== dia1(p)) return;
      if (puntos.indexOf(cat(p)) === -1) puntos.push(cat(p));
    });
    const rango = aca.filter(esRango).sort((a, b) => duracion(a) - duracion(b))[0] || null;
    return { puntos: puntos.slice(0, 3), rango, paro: aca.some(esParo) };
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

    const usadas = new Set();
    let hayBanda = false;

    for (let d = 1; d <= diasDelMes; d++){
      const iso = armarISO(anio, mes, d);
      const m   = marcasDe(iso);
      const tiene = m.puntos.length || m.rango || m.paro;

      m.puntos.forEach(c => usadas.add(c));
      if (m.paro) usadas.add('paro');

      const clases = ['cal-dia'];
      clases.push(tiene ? 'con-cosas' : 'apagado');
      if (iso === hoy) clases.push('hoy');
      if (m.paro)      clases.push('hay-paro');
      if (m.rango){
        hayBanda = true;
        usadas.add(cat(m.rango));
        clases.push('en-rango', 'rango-' + cat(m.rango));
        /* La banda se redondea donde empieza o termina, y también en el
           borde de la semana, así no parece que sigue fuera de la grilla. */
        const col = (primerDia + d - 1) % 7;
        if (iso === dia0(m.rango) || col === 0) clases.push('rango-inicio');
        if (iso === dia1(m.rango) || col === 6 || d === diasDelMes) clases.push('rango-fin');
      }

      const cuantas = publicacionesDe(iso).length;
      const puntos = m.puntos.length ? `<span class="cal-puntos">${
        m.puntos.map(c => `<i class="cal-punto cat-${esc(c)}"></i>`).join('')}</span>` : '';

      html += `<button class="${clases.join(' ')}" data-dia="${iso}"
                 aria-pressed="${iso === elegido}"
                 ${tiene ? '' : 'tabindex="-1"'}
                 aria-label="${d} de ${MESES_LARGO[mes-1]}${m.paro ? ', hay paro' : ''}${
                   m.rango ? ', ' + esc(m.rango.titulo || '') : ''}${
                   tiene && cuantas ? ', ' + cuantas + ' cosa' + (cuantas > 1 ? 's' : '') : ''}">
                 <span class="cal-numero">${d}</span>${puntos}</button>`;
    }

    grilla.innerHTML = html;
    pintarPie(usadas, hayBanda);
  }

  /* Abajo de la grilla: los períodos largos de este mes y la referencia
     de colores. La referencia nombra SOLO lo que está dibujado este mes:
     una leyenda de un color que no aparece hace dudar de si uno se
     perdió algo. */
  function pintarPie(usadas, hayBanda){
    const inicioMes = armarISO(anio, mes, 1);
    const finMes    = armarISO(anio, mes, new Date(anio, mes, 0).getDate());
    const periodos = vigentes
      .filter(p => esPeriodo(p) && dia0(p) <= finMes && dia1(p) >= inicioMes)
      .sort((a, b) => dia1(a).localeCompare(dia1(b)));

    const enCurso = periodos.length ? `
      <div class="cal-en-curso">
        <div class="cal-en-curso-rotulo">Todo el mes</div>
        ${periodos.map(p => `
          <a class="cal-periodo" href="${esc(enlace(p.id))}">
            <i class="cal-punto cat-${esc(cat(p))}" aria-hidden="true"></i>
            <span>${esc(p.titulo || '')}</span>
            <small>${dia0(p) > inicioMes ? 'desde el ' + esc(fechaLinda(dia0(p))) + ' · ' : ''}hasta el ${esc(fechaLinda(dia1(p)))}</small>
          </a>`).join('')}
      </div>` : '';

    const orden = Object.keys(NOMBRE_CATEGORIA_CAL).filter(c => usadas.has(c));
    const referencia = (orden.length || hayBanda) ? `
      <div class="cal-referencia">
        ${orden.map(c => `<span><i class="cal-punto cat-${esc(c)}"></i> ${esc(NOMBRE_CATEGORIA_CAL[c])}</span>`).join('')}
        ${hayBanda ? '<span><i class="cal-banda-muestra" aria-hidden="true"></i> Dura varios días</span>' : ''}
      </div>` : '';

    pie.innerHTML = enCurso + referencia;
  }

  function elegir(iso){
    elegido = (elegido === iso) ? null : iso;
    dibujar();
    alElegirDia(elegido, elegido ? publicacionesDe(elegido) : []);
  }

  grilla.addEventListener('click', ev => {
    const b = ev.target.closest('[data-dia]');
    if (b) elegir(b.dataset.dia);
  });

  /* MOVERSE CON LAS FLECHAS (venía del calendario del inicio).
     Con el tabulador solo se para en los días que tienen algo, pero
     «¿el 17 está libre?» es una pregunta legítima: las flechas recorren
     el mes entero, día por día y semana por semana. En el borde del mes
     no pasa nada; para eso están ‹ ›. */
  grilla.addEventListener('keydown', ev => {
    const b = ev.target.closest && ev.target.closest('[data-dia]');
    if (!b) return;
    const pasos = { ArrowRight:1, ArrowLeft:-1, ArrowDown:7, ArrowUp:-7 };
    const dias = grilla.querySelectorAll('[data-dia]');
    let destino = null;
    if (Object.prototype.hasOwnProperty.call(pasos, ev.key)){
      const n = +b.dataset.dia.slice(8) + pasos[ev.key];
      destino = grilla.querySelector('[data-dia$="-' + String(n).padStart(2, '0') + '"]');
    } else if (ev.key === 'Home') destino = dias[0];
    else if (ev.key === 'End') destino = dias[dias.length - 1];
    else return;
    ev.preventDefault();
    if (destino) destino.focus();
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
