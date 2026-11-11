/* ============================================================
   FERIAZO · LO QUE COMPARTEN SUS TRES PANTALLAS (11/11/2026)

   `feriazo/` (la vidriera), `feriazo/sumar/` (el formulario de cada
   quien) y `cargar/feriazo.js` (la revisión del equipo) dibujan la
   misma tarjeta y validan lo mismo. Antes las listas estaban copiadas
   en cada una («si se agrega un rubro, va en los tres»); ahora viven
   acá y en los `check` de `sql/tabla-feriazo.sql`, que son dos lugares
   y no cuatro.

   Carga DESPUÉS de `app.js` (usa `esc` y `urlSegura`). No va al
   armazón de `sw.js`: la usan tres pantallas, no todas.
   Subir y borrar fotos necesita la librería grande (`db.storage`); la
   vidriera, que carga la chica, no llama a esas dos.
   ============================================================ */

const RUBROS_FERIAZO = {
  comida:    { texto:'Comida',            emoji:'🍪' },
  ropa:      { texto:'Ropa y accesorios', emoji:'👕' },
  arte:      { texto:'Arte y artesanías', emoji:'🎨' },
  bienestar: { texto:'Cosmética y bienestar', emoji:'🌿' },
  plantas:   { texto:'Plantas y huerta',  emoji:'🪴' },
  libros:    { texto:'Libros y papelería', emoji:'📓' },
  servicios: { texto:'Servicios y clases', emoji:'🛠' },
  otros:     { texto:'Otros',             emoji:'✨' }
};

const QUIEN_FERIAZO = { estudiante:'Estudiante', docente:'Docente', nodocente:'No docente' };
const CARRERA_FERIAZO = { ts:'Trabajo Social', fono:'Fonoaudiología', tgcr:'Gestión del Riesgo' };

/* EL SELLO. Siete tintes y tres portadas: cada emprendimiento elige
   los suyos y por eso dos tarjetas vecinas no se parecen. Ninguno de
   los tintes es el amarillo, que en cada pantalla es de la acción
   principal y de nadie más. Los colores están en
   `css/pantallas/feriazo.css` (`.fz-t-…`), todos salidos de tokens. */
const TINTES_FERIAZO = {
  menta:'Menta', rosa:'Rosa', cielo:'Cielo', papel:'Papel',
  celeste:'Celeste', hondo:'Celeste hondo', negro:'Negro'
};
const PORTADAS_FERIAZO = {
  inicial: { texto:'Iniciales', nota:'Grandes, con tu color' },
  fotos:   { texto:'Fotos',     nota:'Las de tus productos' },
  frase:   { texto:'Frase',     nota:'Lo tuyo en una línea' }
};

/* Cómo se consigue un producto. No hay precio a propósito: el Feriazo
   no es una tienda (ver `sql/tabla-feriazo.sql`). */
const MODOS_FERIAZO = { pedido:'A pedido', stock:'Hay stock', servicio:'Servicio' };

/* Lo que manda la gente es de todo: «@alfajores.ana», «Alfajores.Ana »,
   o el link entero que copió del navegador con `?igsh=…` al final. La
   base solo acepta el usuario pelado y en minúscula; esto lo saca de
   cualquiera de las tres. */
function usuarioInstagram(texto){
  let t = String(texto || '').trim();
  const enLink = /instagram\.com\/([^/?#\s]+)/i.exec(t);
  if (enLink) t = enLink[1];
  return t.replace(/^@+/, '').replace(/\/+$/, '').toLowerCase();
}
const usuarioValido = u => /^[a-z0-9._]{1,30}$/.test(u);

/* El WhatsApp como lo quiere wa.me: solo números, con el país y sin
   el +. Acá se escribe «221 15 555-1234», «0221 5551234» o
   «+54 9 221 555 1234», y las tres son el mismo número. Diez dígitos
   pelados son un celular argentino sin el país: se le pone el 549. */
function numeroWhatsapp(texto){
  let n = String(texto || '').replace(/\D/g, '');
  if (!n) return '';
  if (n.indexOf('549') === 0) return n;
  if (n.indexOf('54') === 0 && n.length >= 12) return '549' + n.slice(2);
  n = n.replace(/^0/, '');
  /* El 15 después de la característica: «221 15 5551234». */
  if (n.length === 12 && /^\d{2,4}15\d+$/.test(n)) n = n.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
  return n.length === 10 ? '549' + n : n;
}
const whatsappValido = n => /^[0-9]{10,15}$/.test(n);

/* «Estudiante de Trabajo Social», «Docente», «No docente». */
function quienLoHaceFeriazo(e){
  const base = QUIEN_FERIAZO[e.quien] || '';
  return base && e.carrera && CARRERA_FERIAZO[e.carrera] ? base + ' de ' + CARRERA_FERIAZO[e.carrera] : base;
}

/* Dos letras para la portada: «Migas del Sur» → «MS», «Brote» → «Br».
   Las palabras de relleno no cuentan, que si no todo empieza con «MD». */
function inicialesFeriazo(nombre){
  const todas = String(nombre || '').trim().split(/\s+/).filter(Boolean);
  if (!todas.length) return '?';
  const sinRelleno = todas.filter(p => !/^(de|del|la|las|el|los|y|e|con|para|por)$/i.test(p));
  /* «La Tinta» es LT: si sacando el relleno queda una sola palabra, el
     artículo es parte del nombre. */
  const palabras = sinRelleno.length > 1 ? sinRelleno : todas;
  const letras = palabras.length > 1 ? palabras[0].charAt(0) + palabras[1].charAt(0)
                                     : palabras[0].slice(0, 2);
  return letras.charAt(0).toUpperCase() + letras.slice(1);
}

/* El alto de la portada sale del id, no del azar: la misma tarjeta
   mide siempre lo mismo, y el mosaico no baila entre una visita y otra
   más de lo que ya lo mezcla el orden. */
function altoFeriazo(e){ return 1 + (Math.abs(Number(e.id) || String(e.nombre || '').length) % 3); }

const tinteFeriazo = e => TINTES_FERIAZO[e.tinte] ? e.tinte : 'menta';

/* La portada: iniciales, frase o las fotos de los productos. Si eligió
   fotos y todavía no hay ninguna, o frase y no la escribió, van las
   iniciales: una portada vacía no le sirve a nadie. */
function htmlPortadaFeriazo(e, alto){
  const fotos = (e.productos || []).map(p => p.foto).filter(f => /^https:\/\//i.test(f || '')).slice(0, 4);
  let adentro;
  if (e.portada === 'fotos' && fotos.length){
    adentro = `<span class="fz-cuadros fz-cuadros-${fotos.length}">${fotos.map(f =>
      `<img src="${esc(urlSegura(f))}" alt="" loading="lazy" decoding="async">`).join('')}</span>`;
  } else if (e.portada === 'frase' && (e.frase || '').trim()){
    adentro = `<span class="fz-frase">${esc(e.frase.trim())}</span>`;
  } else {
    adentro = `<span class="fz-inicial" aria-hidden="true">${esc(inicialesFeriazo(e.nombre))}</span>`;
  }
  return `<span class="fz-portada fz-alto-${alto || altoFeriazo(e)} fz-t-${tinteFeriazo(e)}">${adentro}</span>`;
}

/* El logo, si hay, va como un sello redondo montado entre la portada y
   el texto. */
function htmlLogoFeriazo(e){
  return /^https:\/\//i.test(e.foto || '')
    ? `<img class="fz-logo" src="${esc(urlSegura(e.foto))}" alt="" width="44" height="44" loading="lazy" decoding="async">`
    : '';
}

/* Una tarjeta del mosaico. `atributos` es lo que la hace tocable en la
   vidriera (`data-abrir="…"`); en la vista previa del formulario va
   vacío y es un `div`. */
function htmlTarjetaFeriazo(e, atributos){
  const rubro = RUBROS_FERIAZO[e.rubro] || RUBROS_FERIAZO.otros;
  const quien = quienLoHaceFeriazo(e);
  const marca = atributos ? 'button type="button"' : 'div';
  return `
    <${marca} class="fz-puesto" ${atributos || ''}>
      ${htmlPortadaFeriazo(e)}
      <span class="fz-cuerpo">
        ${htmlLogoFeriazo(e)}
        <span class="fz-nombre">${esc(e.nombre || 'Tu emprendimiento')}</span>
        ${quien ? `<span class="fz-quien">${esc(quien)}</span>` : ''}
        <span class="etiqueta">${esc(rubro.texto)}</span>
      </span>
    </${atributos ? 'button' : 'div'}>`;
}

/* ------------------------------------------------------------
   LAS FOTOS (solo con la librería grande)
   ------------------------------------------------------------ */

/* La foto se achica en el teléfono antes de subir: con 800 de lado
   pesa unos 80 KB y sube con la señal del aula. Fondo blanco por los
   logos PNG transparentes, que en JPEG saldrían negros. */
async function achicarFotoFeriazo(archivo){
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error('Ese archivo no es una imagen.'));
      i.src = url;
    });
    const escala = Math.min(1, 800 / Math.max(img.naturalWidth, img.naturalHeight));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(img.naturalWidth * escala);
    lienzo.height = Math.round(img.naturalHeight * escala);
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    return await new Promise((ok, mal) => lienzo.toBlob(
      b => b ? ok(b) : mal(new Error('No se pudo preparar la foto.')), 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* `deQuien` es el id de la cuenta cuando sube alguien que no es del
   equipo: la base solo le deja subir `feriazo-<su id>-…`. El equipo no
   lo pasa. Las cuatro letras del final son por si se suben dos fotos
   en el mismo milisegundo (pasa al elegir varias seguidas). */
async function subirFotoFeriazo(archivo, deQuien){
  const chica = await achicarFotoFeriazo(archivo);
  const nombre = 'feriazo-' + (deQuien ? deQuien + '-' : '') + Date.now() + '-' +
    Math.random().toString(36).slice(2, 6).padEnd(4, '0') + '.jpg';
  const { error } = await db.storage.from('fotos').upload(nombre, chica, { contentType:'image/jpeg' });
  if (error){
    if (/row-level security|Unauthorized/i.test(error.message || ''))
      throw new Error('Tu cuenta no tiene permiso para subir fotos del Feriazo. ¿Ya se corrió sql/tabla-feriazo.sql?');
    throw error;
  }
  return { url: db.storage.from('fotos').getPublicUrl(nombre).data.publicUrl, nombre: nombre };
}

/* Borrar el archivo, no solo dejar de mostrarlo: si alguien pide que
   bajen su emprendimiento, la foto tiene que irse de verdad. */
async function borrarFotoFeriazo(nombre){
  if (!nombre) return;
  try { await db.storage.from('fotos').remove([nombre]); } catch(e){ /* ya no estaba */ }
}
