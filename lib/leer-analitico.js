/* ============================================================
   LEER UN ANALÍTICO DE SIU GUARANÍ  ·  del PDF a «Mi año»

   Entra el «Reporte de materias - cursadas y finales» que baja cada
   estudiante de SIU Guaraní y sale lo que Mi año sabe guardar:
   qué materias aprobó (con nota y fecha) y qué cursadas tiene
   regulares (con el año, que es de lo que sale el vencimiento).

   POR QUÉ ES UN ARCHIVO APARTE: igual que `leer-programa.js`, la
   lectura no toca la pantalla. Así se puede probar sola, con el texto
   de un analítico de verdad, y la pantalla solo muestra y guarda.

   EL PDF NO SALE DEL TELÉFONO. Tiene el DNI y el nombre completo, y
   Mi año no necesita ninguno de los dos. Se lee acá, con pdf.js, y
   se tira: no se sube ni se guarda.

   CÓMO VIENE EL REPORTE (FTS-UNLP, plan 2015, septiembre de 2026):

     Aprobadas
     Asignatura Nota Fecha Acta/Resolución
     Trabajo Social I 8 (Ocho) 14/12/2020 8482
     Teorías de la Cultura y Antropologías de las        <- nombre largo:
     9 (nueve) 25/11/2021 2291                           <- la nota queda
     Sociedades Contemporáneas                           <- en el medio
     Créditos / Optativas
     Trayecto Optativo. Actividad: ... Aprobado 23/11/2022 TO-PRD008/19
     Regularidades
     Asignatura Fecha Reg. Fin Vig. Acta/Resolución
     Trabajo Social IV 25/11/2024 31/03/2028 2445

   Lo que hay que saber antes de tocarlo:
   - El encabezado de la sección se repite al cambiar de hoja. Eso no
     corta la fila que venía: un nombre puede seguir en la hoja nueva.
   - Los nombres del reporte NO son los del plan que tiene la app
     («Configuración de Problemas Sociales» contra «Configuración de
     los Problemas Sociales»). Se emparejan por parecido, y los
     números romanos tienen que coincidir: «Trabajo Social I» se
     parece muchísimo a «Trabajo Social II» y no es la misma materia.
   - Las optativas no tienen lugar en Mi año: el Trayecto se cuenta
     por horas en su propia pantalla. Se muestran, no se cargan.
   ============================================================ */
(function(){

const FECHA = '(\\d{2})/(\\d{2})/(\\d{4})';
const FILA  = new RegExp('^(.*?)\\s*(\\d{1,2}) \\([^)]+\\)\\s+' + FECHA + '\\s+(\\S+)$');
const FILA_SIN_NOTA = new RegExp('^(.*?)\\s*Aprobado\\s+' + FECHA + '\\s+(\\S+)$');
const REGULAR = new RegExp('^(.*?)\\s*' + FECHA + '\\s+' + FECHA + '\\s+(\\S+)$');
const RUIDO = /^(FACULTAD|LICENCIATURA|TECNICATURA|Reporte de|Apellido|DNI|Estado:|Asignatura|P.gina \d)/i;
const SECCIONES = {
  'aprobadas': 'aprobadas',
  'creditos / optativas': 'optativas',
  'regularidades': 'regularidades'
};

function sinTildes(s){
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* Para comparar nombres: sin tildes, sin signos y sin las palabras
   chicas, que son justo las que cambian entre el reporte y el plan. */
const VACIAS = ['los','las','la','el','y','de','del','en','a'];
function normal(s){
  return sinTildes(s.toLowerCase()).replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter(p => p && VACIAS.indexOf(p) === -1).join(' ');
}

const ROMANOS = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x|\d+)$/;
function numeros(s){
  return normal(s).split(' ').filter(p => ROMANOS.test(p)).join(' ');
}

/* Parecido entre 0 y 1 por pares de letras (Dice). Tolera plurales y
   palabras de más, que es lo que separa el reporte del plan. */
function pares(s){
  const t = s.replace(/ /g, ''), p = {};
  for (let i = 0; i < t.length - 1; i++){
    const k = t.substr(i, 2); p[k] = (p[k] || 0) + 1;
  }
  return p;
}
function parecido(a, b){
  if (numeros(a) !== numeros(b)) return 0;
  const na = normal(a), nb = normal(b);
  if (na === nb) return 1;
  const pa = pares(na), pb = pares(nb);
  let comun = 0, total = 0;
  Object.keys(pa).forEach(k => { total += pa[k]; if (pb[k]) comun += Math.min(pa[k], pb[k]); });
  Object.keys(pb).forEach(k => { total += pb[k]; });
  return total ? 2 * comun / total : 0;
}

const MINIMO = 0.8;

function iso(d, m, a){ return a + '-' + m + '-' + d; }

/* ---------- 1. Del texto a filas ----------
   Un nombre largo sale partido: un pedazo arriba de la fila con la
   nota y otro abajo. Los pedazos de arriba se juntan hasta que
   aparece la fila; el de abajo se le pega si la fila quedó sin nombre
   propio, o si arranca en minúscula o termina en punto (que es como
   termina el nombre de un seminario). */
function filas(texto){
  const res = { aprobadas:[], optativas:[], regularidades:[] };
  const sobras = [];
  let seccion = null, suelto = [], ultima = null;

  texto.split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).forEach(l => {
    const clave = SECCIONES[sinTildes(l.toLowerCase())];
    if (clave){
      if (clave !== seccion){ seccion = clave; suelto = []; ultima = null; }
      return;
    }
    if (/^OBSERVACIONES/i.test(l)){ seccion = null; return; }
    if (!seccion || RUIDO.test(l)) return;

    let fila = null, m;
    if (seccion === 'regularidades'){
      if ((m = l.match(REGULAR)))
        fila = { propio:m[1], fecha:iso(m[2], m[3], m[4]), vence:iso(m[5], m[6], m[7]), acta:m[8] };
    } else if ((m = l.match(FILA))){
      fila = { propio:m[1], nota:Number(m[2]), fecha:iso(m[3], m[4], m[5]), acta:m[6] };
    } else if ((m = l.match(FILA_SIN_NOTA))){
      fila = { propio:m[1], nota:null, fecha:iso(m[2], m[3], m[4]), acta:m[5] };
    }

    if (fila){
      fila.nombre = suelto.concat(fila.propio ? [fila.propio] : []).join(' ');
      fila.huerfana = !fila.propio;
      delete fila.propio;
      suelto = [];
      res[seccion].push(fila);
      ultima = fila;
    } else if (ultima && (ultima.huerfana || /^[a-záéíóúñ]/.test(l) || /\.$/.test(l))){
      ultima.nombre = (ultima.nombre + ' ' + l).trim();
      ultima.huerfana = false;
    } else {
      suelto.push(l);
    }
  });

  if (suelto.length) sobras.push(suelto.join(' '));
  Object.keys(res).forEach(k => res[k].forEach(f => {
    delete f.huerfana;
    if (!f.nombre) sobras.push('Una fila del ' + f.fecha + ' sin nombre');
  }));
  return { res, sobras };
}

/* ---------- 2. De filas a materias del plan ----------
   Cada materia del plan se usa una sola vez: si dos filas caen en la
   misma, se queda la más parecida y la otra va a «no reconocidas».
   Mejor mostrar una de menos que cargar una aprobada que no es. */
function emparejar(lista, materias){
  const tomadas = {};
  lista.forEach(f => {
    let mejor = null, puntaje = 0;
    materias.forEach(m => {
      const p = parecido(f.nombre, m.nombre);
      if (p > puntaje){ puntaje = p; mejor = m; }
    });
    f.puntaje = puntaje;
    if (mejor && puntaje >= MINIMO){
      const antes = tomadas[mejor.cod];
      if (!antes || antes.puntaje < puntaje){
        if (antes) antes.materia = null;
        f.materia = mejor; tomadas[mejor.cod] = f;
      }
    }
  });
}

/* De qué carrera es el reporte, por el encabezado. */
function carreraDelTexto(texto){
  const t = sinTildes(texto.slice(0, 400).toLowerCase());
  if (/licenciatura en trabajo social/.test(t)) return 'ts';
  if (/fonoaudiologia/.test(t)) return 'fono';
  if (/gestion comunitaria del riesgo|gestion del riesgo/.test(t)) return 'tgcr';
  return null;
}

/* La lectura entera. `plan` es el mismo objeto de `carrera/plan*.js`.
   Devuelve:
     carrera        'ts' | 'fono' | 'tgcr' | null (según el encabezado)
     aprobadas      [{ cod, nombre, leido, nota, fecha }]
     cursadas       [{ cod, nombre, leido, fecha, vence, anio }]
     optativas      [{ nombre, nota, fecha }]   (no se cargan)
     noReconocidas  [{ nombre, fecha }]          (no están en el plan)
     sobras         [texto]                      (renglones que no se entendieron) */
function leerAnalitico(texto, plan){
  const { res, sobras } = filas(texto);
  emparejar(res.aprobadas, plan.materias);
  emparejar(res.regularidades, plan.materias);

  const salida = {
    carrera: carreraDelTexto(texto),
    aprobadas: [], cursadas: [], noReconocidas: [], sobras: sobras,
    optativas: res.optativas.map(f => ({ nombre:f.nombre, nota:f.nota, fecha:f.fecha }))
  };
  res.aprobadas.forEach(f => {
    if (!f.materia) return salida.noReconocidas.push({ nombre:f.nombre, fecha:f.fecha });
    salida.aprobadas.push({ cod:f.materia.cod, nombre:f.materia.nombre, leido:f.nombre,
                            nota:f.nota, fecha:f.fecha });
  });
  res.regularidades.forEach(f => {
    if (!f.materia) return salida.noReconocidas.push({ nombre:f.nombre, fecha:f.fecha });
    salida.cursadas.push({ cod:f.materia.cod, nombre:f.materia.nombre, leido:f.nombre,
                           fecha:f.fecha, vence:f.vence, anio:Number(f.fecha.slice(0, 4)) });
  });
  return salida;
}

/* ---------- 3. El texto del PDF ----------
   Como en el panel: pdf.js da pedazos sueltos con su posición, y los
   renglones se rearman por la altura. Acá además se ordenan por X y
   se separan con un espacio cuando hay hueco entre pedazos, porque el
   reporte pone cada columna como un pedazo aparte y sin eso «8 (Ocho)»
   queda pegado a la fecha. */
async function textoDelAnalitico(datos, pdfjsLib){
  const doc = await pdfjsLib.getDocument({ data: datos }).promise;
  let texto = '';
  for (let n = 1; n <= doc.numPages; n++){
    const hoja = await doc.getPage(n);
    const cont = await hoja.getTextContent();
    const renglones = [];
    cont.items.forEach(it => {
      if (!it.str || !it.str.trim()) return;
      const y = it.transform[5];
      let r = renglones.find(r => Math.abs(r.y - y) <= 2);
      if (!r){ r = { y, partes:[] }; renglones.push(r); }
      r.partes.push({ x: it.transform[4], fin: it.transform[4] + (it.width || 0), str: it.str });
    });
    renglones.sort((a, b) => b.y - a.y);
    texto += renglones.map(r => {
      r.partes.sort((a, b) => a.x - b.x);
      let linea = '', finAnterior = null;
      r.partes.forEach(p => {
        if (finAnterior !== null && p.x - finAnterior > 1 && !/\s$/.test(linea)) linea += ' ';
        linea += p.str; finAnterior = p.fin;
      });
      return linea.replace(/\s+/g, ' ').trim();
    }).join('\n') + '\n';
  }
  return texto;
}

/* pdf.js pesa más de 300 KB: se baja recién cuando alguien elige un
   archivo, no al abrir Mi año. */
let cargandoPdf = null;
function cargarPdfJs(raiz){
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!cargandoPdf) cargandoPdf = new Promise((listo, error) => {
    const s = document.createElement('script');
    s.src = raiz + 'lib/pdf.js';
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = raiz + 'lib/pdf.worker.js';
      listo(window.pdfjsLib);
    };
    s.onerror = () => { cargandoPdf = null; error(new Error('No se pudo abrir el lector de PDF. Fijate la conexión y probá de nuevo.')); };
    document.head.appendChild(s);
  });
  return cargandoPdf;
}

const api = { leerAnalitico, textoDelAnalitico, cargarPdfJs, parecido };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else window.LeerAnalitico = api;

})();
