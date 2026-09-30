/* ============================================================
   «VOY» Y «ME ANOTO»  ·  tanda 3 de la propuesta 3 (30/9/2026)

   En un paro, un grupo de estudio o una actividad, la estudiante dice
   que va. Sin cuenta: el teléfono se reconoce con una MARCA al azar
   que vive acá, en `localStorage`, y esa marca es la que desanota. La
   base guarda la marca y nada más (`sql/tabla-anotados.sql`), así que
   nadie puede armar una lista de quién va a qué: solo se cuenta.

   Lo que hace «Voy»:
     - suma uno al contador público («van 12»), que es lo que le sirve
       a quien organiza para pedir un aula del tamaño justo;
     - si el teléfono tiene los avisos prendidos, le llegan el aviso del
       día y el de cambio de ESE evento aunque tenga la categoría
       apagada (la función `avisos` mira `anotados`);
     - aparece en «Lo que marcaste» del inicio y en «Mío» de Fechas.

   Lo usan Fechas (`agenda/`) y el inicio. Carga DESPUÉS de `app.js`
   y de `lib/datos.js`: usa `db`, `esc`, `hoyISO` y `rangoLindo`.

   Qué ids marcó el teléfono se guarda también acá, y no se le pregunta
   a la base: la base no sabe de quién es cada marca, y está bien que
   no lo sepa.
   ============================================================ */

const CLAVE_VOY = 'bolivar-voy';

/* Las categorías a las que se puede ir. Una fecha académica o un
   comunicado no son un encuentro: no tiene sentido decir «voy». */
const CATEGORIAS_CON_VOY = ['paro', 'grupo', 'actividad'];

function leerVoy(){
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE_VOY) || 'null');
    if (g && typeof g === 'object'){
      return {
        marca:     /^[0-9a-f]{32}$/.test(g.marca || '') ? g.marca : '',
        ids:       Array.isArray(g.ids) ? g.ids.map(Number).filter(Boolean) : [],
        contactos: Array.isArray(g.contactos) ? g.contactos.map(Number).filter(Boolean) : []
      };
    }
  } catch(e){}
  return { marca: '', ids: [], contactos: [] };
}

function guardarVoy(g){
  try { localStorage.setItem(CLAVE_VOY, JSON.stringify(g)); } catch(e){}
}

/* La marca se inventa la primera vez que hace falta, no al abrir la
   app: quien nunca dijo «voy» no tiene por qué tener una. */
function marcaVoy(){
  const g = leerVoy();
  if (g.marca) return g.marca;
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  g.marca = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  guardarVoy(g);
  return g.marca;
}

function voyA(id){ return leerVoy().ids.includes(Number(id)); }

/* Mismo criterio que `anotable()` en la base: publicada, de una de las
   tres categorías, no suspendida y que no haya terminado. */
function sePuedeIr(p, hoy){
  if (!p || p.suspendido || !CATEGORIAS_CON_VOY.includes(p.categoria)) return false;
  const hasta = String(p.fecha_hasta || p.fecha_desde || '').slice(0, 10);
  return !hasta || hasta >= (hoy || hoyISO());
}

/* El timbre del teléfono, si tiene los avisos prendidos. Va a la base
   para que el aviso de ese evento le llegue; la base lo cambia por el
   número de suscripción y no lo guarda. */
async function timbreDelTelefono(){
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const r = await navigator.serviceWorker.getRegistration();
    if (!r) return null;
    const s = await r.pushManager.getSubscription();
    return s ? s.endpoint : null;
  } catch(e){ return null; }
}

/* Marca o desmarca. Devuelve cuántos van después del cambio. */
async function marcarVoy(id, quiero){
  id = Number(id);
  const marca = marcaVoy();
  const { data, error } = quiero
    ? await db.rpc('anotarme', {
        p_publicacion: id, p_marca: marca, p_endpoint: await timbreDelTelefono() })
    : await db.rpc('desanotarme', { p_publicacion: id, p_marca: marca });
  if (error) throw error;

  const g = leerVoy();
  g.ids = g.ids.filter(x => x !== id);
  if (quiero) g.ids.push(id);
  /* Desanotarse se lleva el número también (lo hace la base). */
  else g.contactos = g.contactos.filter(x => x !== id);
  guardarVoy(g);
  return Number(data) || 0;
}

/* El número para el grupo de WhatsApp: opcional, solo en los grupos, y
   solo estando anotado. Vacío lo borra. */
async function dejarContacto(id, telefono){
  id = Number(id);
  const { error } = await db.rpc('dejar_contacto', {
    p_publicacion: id, p_marca: marcaVoy(), p_telefono: telefono || '' });
  if (error) throw error;
  const g = leerVoy();
  g.contactos = g.contactos.filter(x => x !== id);
  if (telefono) g.contactos.push(id);
  guardarVoy(g);
}

/* Cuántos van a cada cosa: { id: n }. La vista pública trae solo los
   números, nunca las filas. Si falla (sin red, o la tabla todavía no
   está), vuelve vacío: el contador es un dato de más, no uno que
   frene la pantalla. */
async function cuantosVan(){
  try {
    const { data, error } = await db.from('anotados_totales').select('*');
    if (error || !Array.isArray(data)) return {};
    const cuenta = {};
    data.forEach(f => { cuenta[f.publicacion_id] = Number(f.cuantos) || 0; });
    return cuenta;
  } catch(e){ return {}; }
}

/* Cómo se dice cuántos van. «Van 0» desanima (propuesta 2): con cero
   se invita, y con uno se dice si es la persona misma. */
function textoCuantos(n, yoVoy, esGrupo){
  if (n >= 2) return `Van ${n}`;
  if (n === 1 && yoVoy) return esGrupo ? 'Sos la primera persona en anotarse' : 'Sos la primera persona que dice que va';
  if (n === 1) return 'Va una persona';
  return esGrupo ? 'Todavía no se anotó nadie' : 'Todavía nadie dijo que va';
}

/* Un enlace de WhatsApp es el del grupo del encuentro: aparece recién
   al anotarse (propuesta 2, «el link aparece en pantalla apenas aprieta
   me anoto»). Cualquier otro enlace se muestra como siempre. */
function esEnlaceDeWhatsApp(url){
  return /^https?:\/\/(chat\.whatsapp\.com|wa\.me|whatsapp\.com)\//i.test(String(url || ''));
}

/* Compartir por WhatsApp: título, día, hora, lugar y el enlace a la
   publicación. `wa.me` abre la app en el teléfono y la web en la
   computadora. */
function enlaceCompartir(p){
  const cuando = typeof rangoLindo === 'function' ? rangoLindo(p.fecha_desde, p.fecha_hasta) : '';
  const datos  = [cuando, p.hora, p.lugar].filter(Boolean).join(' · ');
  const texto  = [p.titulo, datos, `${location.origin}/agenda/?id=${p.id}`]
    .filter(Boolean).join('\n');
  return 'https://wa.me/?text=' + encodeURIComponent(texto);
}

/* Las marcas de lo que ya terminó no sirven para nada: se limpian
   cuando la pantalla tiene la lista entera de publicaciones. */
function limpiarVoy(publicaciones, hoy){
  const g = leerVoy();
  if (!g.ids.length) return;
  const vivas = new Set((publicaciones || [])
    .filter(p => String(p.fecha_hasta || p.fecha_desde || '9999').slice(0, 10) >= (hoy || hoyISO()))
    .map(p => Number(p.id)));
  const antes = g.ids.length;
  g.ids = g.ids.filter(id => vivas.has(id));
  g.contactos = g.contactos.filter(id => vivas.has(id));
  if (g.ids.length !== antes) guardarVoy(g);
}
