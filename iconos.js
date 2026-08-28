/* ============================================================
   ICONOS · Phosphor Icons, peso Bold
   https://phosphoricons.com  ·  licencia MIT, uso libre

   COMO SUMAR UNO NUEVO
   1. Buscalo en phosphoricons.com, peso Bold, y tocá "Copy SVG".
   2. De todo lo que copiaste, pegá acá SOLO la parte que empieza
      con <path ...>, sin el <svg> de afuera.
   3. Ponele un nombre en la lista de abajo.

   OJO CON EL COLOR: Phosphor te lo copia con un color fijo
   (fill="#b52625"). Acá NO va ningún color: el color lo pone el CSS
   con "currentColor", así el mismo ícono sirve en negro sobre la
   cabecera y en celeste sobre una tarjeta blanca. Si dejás el color
   fijo, el ícono se ve rojo en todos lados.

   Mientras un ícono no esté acá, la app sigue mostrando el emoji
   de antes. Se pueden ir reemplazando de a uno.
   ============================================================ */

window.ICONOS = {

  /* --- Las secciones de arriba --- */
  inicio:
    '<path d="M222.14,105.85l-80-80a20,20,0,0,0-28.28,0l-80,80A19.86,19.86,0,0,0,28,120v96a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V120A19.86,19.86,0,0,0,222.14,105.85ZM204,204H52V121.65l76-76,76,76Z"/>',

  carrera:
    '<path d="M235.57,193.73,202.38,35.93a20,20,0,0,0-23.76-15.48L131.81,30.51a19.82,19.82,0,0,0-11,6.65A20,20,0,0,0,104,28H56A20,20,0,0,0,36,48V208a20,20,0,0,0,20,20h48a20,20,0,0,0,20-20V90.25l25.62,121.82A20,20,0,0,0,169.15,228a20.27,20.27,0,0,0,4.23-.45l46.81-10.06A20.1,20.1,0,0,0,235.57,193.73ZM148.19,88.65l39-8.38,2.53,12-39,8.38Zm7.46,35.5,39-8.38,9.16,43.58-39,8.38Zm24.06-79.39,2.53,12-39,8.38-2.53-12ZM60,88h40v80H60Zm40-36V64H60V52ZM60,204V192h40v12Zm112.29-.76-2.53-12,39-8.38,2.53,12Z"/>',

  mi:
    '<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20ZM79.57,196.57a60,60,0,0,1,96.86,0,83.72,83.72,0,0,1-96.86,0ZM100,120a28,28,0,1,1,28,28A28,28,0,0,1,100,120ZM194,179.94a83.48,83.48,0,0,0-29-23.42,52,52,0,1,0-74,0,83.48,83.48,0,0,0-29,23.42,84,84,0,1,1,131.9,0Z"/>',

  /* --- Botones de la cabecera --- */
  menu:
    '<path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"/>',

  /* --- Categorías --- */
  plan:
    '<path d="M236,64a36,36,0,1,0-48,33.94V112a4,4,0,0,1-4,4H96a27.8,27.8,0,0,0-4,.29V97.94a36,36,0,1,0-24,0v60.12a36,36,0,1,0,24,0V144a4,4,0,0,1,4-4h88a28,28,0,0,0,28-28V97.94A36.07,36.07,0,0,0,236,64ZM80,52A12,12,0,1,1,68,64,12,12,0,0,1,80,52Zm0,152a12,12,0,1,1,12-12A12,12,0,0,1,80,204ZM200,76a12,12,0,1,1,12-12A12,12,0,0,1,200,76Z"/>',

  inscripciones:
    '<path d="M216,36H40A20,20,0,0,0,20,56V216a12,12,0,0,0,17.37,10.73L64,213.42l26.63,13.31a12,12,0,0,0,10.74,0L128,213.42l26.63,13.31a12,12,0,0,0,10.74,0L192,213.42l26.63,13.31A12,12,0,0,0,236,216V56A20,20,0,0,0,216,36Zm-4,160.58-14.63-7.31a12,12,0,0,0-10.74,0L160,202.58l-26.63-13.31a12,12,0,0,0-10.74,0L96,202.58,69.37,189.27a12,12,0,0,0-10.74,0L44,196.58V60H212ZM62.63,170.73a12,12,0,0,0,16.1-5.36L81.42,160h37.16l2.69,5.37a12,12,0,1,0,21.46-10.74l-32-64a12,12,0,0,0-21.46,0l-32,64A12,12,0,0,0,62.63,170.73ZM106.58,136H93.42L100,122.83ZM144,128a12,12,0,0,1,12-12h4v-4a12,12,0,0,1,24,0v4h4a12,12,0,0,1,0,24h-4v4a12,12,0,0,1-24,0v-4h-4A12,12,0,0,1,144,128Z"/>'
};

/* Qué ícono le toca a cada categoría de la base de datos.
   La clave es el id de la categoría, que no cambia nunca.
   Las que todavía no tienen ícono siguen mostrando su emoji. */
window.ICONO_DE_CATEGORIA = {
  5:  'plan',            /* Plan de estudios y correlativas */
  1:  'inscripciones',   /* Inscripciones y finales         */
  8:  'donde-curso',     /* Dónde curso          · falta    */
  9:  'catedras',        /* Cátedras             · falta    */
  10: 'extension',       /* Extensión            · falta    */
  4:  'certificados',    /* Certificados         · falta    */
  3:  'becas',           /* Becas                · falta    */
  11: 'boleto',          /* Boleto universitario · falta    */
  12: 'alquiler',        /* Alquiler             · falta    */
  13: 'ayuda'            /* Dónde pedir ayuda    · falta    */
};

/* Devuelve el ícono como SVG, o null si todavía no lo cargamos.
   Quien lo llama decide qué poner mientras tanto. */
function icono(nombre){
  const dibujo = window.ICONOS[nombre];
  if (!dibujo) return null;
  return `<svg class="ico" viewBox="0 0 256 256" fill="currentColor"
               aria-hidden="true" focusable="false">${dibujo}</svg>`;
}

/* El ícono de una categoría, y si no hay, su emoji de siempre */
function iconoDeCategoria(cat){
  return icono(window.ICONO_DE_CATEGORIA[cat.id]) || esc(cat.emoji || '·');
}
