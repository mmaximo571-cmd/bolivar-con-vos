/* ============================================================
   LAS CAPAS DE BASE DEL MAPA DE RIESGO

   Lo que NO cargan les estudiantes: información ya relevada por otros
   (arroyos, polo industrial, barrios RENABAP, salud y clubes, corredores)
   que viene como GeoJSON en `mapa/datos/`. Cómo se preparan esos
   archivos está en `mapa/datos/LEEME.md`.

   Son CINCO y no se mezclan con las tres capas de los reportes
   (`capas.js`): aquellas son lo que se ve en el barrio y pasa por
   moderación; estas son el fondo contra el que se lee.

   Cada capa dice:
     archivo   el nombre dentro de `mapa/datos/`
     fuente    de dónde salió. Se muestra en cada ficha: un polígono de
               «barrio popular» sin fuente es una afirmación sin firma.
               Las de OpenStreetMap y RENABAP se bajaron el 17/9/2026 (cómo,
               en `mapa/datos/LEEME.md`). Movilidad no tiene fuente: no
               existe un dato público de corredores seguros.
     estilo    cómo se pinta, según la geometría de cada elemento
     tipos     solo para puntos: el color según la propiedad `tipo`

   Los colores NO son los de la marca a propósito: van encima de un
   mapa de calles lleno de amarillos y naranjas, y lo que importa es que
   una capa no se confunda con otra ni con las rutas.
   ============================================================ */

function esPoligonoGeo(f){
  const t = f && f.geometry && f.geometry.type;
  return t === 'Polygon' || t === 'MultiPolygon';
}

const CAPAS_BASE = [
  { id:'hidrico', nombre:'Riesgo hídrico', detalle:'Arroyos, canales y desagües',
    archivo:'hidrico.geojson', fuente:'OpenStreetMap y sus colaboradores (ODbL), septiembre 2026',
    /* Dos geometrías posibles: el curso de agua es una línea, y una zona
       que se inunda sería un relleno apenas visible debajo (hoy el
       archivo no trae ninguna). El grosor va por tipo: con los 243
       desagües tan gruesos como un arroyo, el mapa quedaba tapado de azul
       y no se distinguía lo que desborda de una zanja. */
    estilo: f => {
      if (esPoligonoGeo(f)) return { color:'#1E5FB4', weight:1, opacity:.7, fillColor:'#3B82F6', fillOpacity:.18 };
      const tipo = sinTildes(f && f.properties && f.properties.descripcion);
      const menor = tipo.indexOf('desague') === 0;
      return { color:'#1E5FB4', weight: menor ? 2 : tipo === 'canal' ? 3.5 : 5,
               opacity: menor ? .6 : .9, lineCap:'round', lineJoin:'round' };
    } },

  { id:'industrial', nombre:'Riesgo industrial', detalle:'Polo petroquímico y zonas industriales',
    archivo:'industrial.geojson', fuente:'OpenStreetMap y sus colaboradores (ODbL), septiembre 2026',
    estilo: () => ({ color:'#1F1F1F', weight:1.5, opacity:.9, fillColor:'#3A3A3A', fillOpacity:.42 }) },

  { id:'habitat', nombre:'Hábitat · RENABAP', detalle:'Barrios populares del registro nacional',
    archivo:'renabap.geojson', fuente:'RENABAP 2020, Ministerio de Desarrollo Social de la Nación',
    estilo: () => ({ color:'#6B3FA0', weight:1.5, opacity:.85, fillColor:'#7C4DBA', fillOpacity:.16 }) },

  { id:'contencion', nombre:'Redes de contención', detalle:'Salud, clubes y bomberos',
    archivo:'contencion.geojson', fuente:'OpenStreetMap y sus colaboradores (ODbL), septiembre 2026',
    /* El `tipo` de cada punto se compara sin tildes ni mayúsculas y por
       pedazo de palabra: «Hospital», «CAPS» y «Salita» caen en salud.
       Lo que no coincide con nada va gris y dice su tipo tal cual. */
    tipos: [
      { id:'salud',    nombre:'Salud',    color:'#C0262D', palabras:['salud','hospital','caps','salita','sanitari','clinica'] },
      { id:'club',     nombre:'Clubes',   color:'#0F7A4A', palabras:['club','deport','sociedad de fomento'] },
      { id:'bomberos', nombre:'Bomberos', color:'#E0671B', palabras:['bombero'] }
    ],
    estilo: () => ({ color:'#1A1A1A', weight:2, fillOpacity:1, radius:8 }) },

  { id:'movilidad', nombre:'Movilidad', detalle:'Corredores seguros',
    archivo:'movilidad.geojson', fuente:'',
    /* Punteada: así no se confunde con un arroyo, que también es una
       línea gruesa, aunque alguien no distinga el verde del azul. */
    estilo: () => ({ color:'#0E7A5F', weight:5, opacity:.9, dashArray:'10 8', lineCap:'round' }) }
];

function capaBase(id){ return CAPAS_BASE.find(c => c.id === id) || null; }

function sinTildes(t){
  return String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/* El tipo de un punto de «Redes de contención», o null si no se reconoce. */
function tipoDePunto(capa, props){
  if (!capa.tipos) return null;
  const crudo = sinTildes(props && (props.tipo || props.Tipo || props.TIPO || props.categoria));
  return capa.tipos.find(t => t.palabras.some(p => crudo.indexOf(p) !== -1)) || null;
}

/* Las propiedades se llaman distinto en cada fuente: se prueba una lista
   corta en orden y se toma la primera que tenga algo. */
const CAMPOS_NOMBRE = ['nombre', 'Nombre', 'NOMBRE', 'name', 'nombre_barrio', 'barrio', 'NOMBRE_BAR', 'nam', 'fna'];
const CAMPOS_DESCRIPCION = ['descripcion', 'descripción', 'Descripcion', 'DESCRIPCION', 'description', 'desc', 'detalle'];

function primerCampo(props, campos){
  if (!props) return '';
  for (const c of campos){
    const v = props[c];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

/* La muestra de color del panel: la misma simbología que el mapa, en
   chiquito, así el panel sirve también de leyenda. */
function muestraDeCapaBase(capa){
  if (capa.tipos){
    return `<span class="muestra muestra-puntos" aria-hidden="true">${capa.tipos.map(t =>
      `<i style="background:${t.color}"></i>`).join('')}</span>`;
  }
  const poli = capa.estilo({ geometry:{ type:'Polygon' } });
  const lin  = capa.estilo({ geometry:{ type:'LineString' } });
  const relleno = capa.id === 'movilidad' ? '' :
    `<i class="muestra-relleno" style="background:${poli.fillColor};border-color:${poli.color};opacity:${Math.max(poli.fillOpacity * 2.2, .5)}"></i>`;
  const linea = (capa.id === 'hidrico' || capa.id === 'movilidad')
    ? `<i class="muestra-linea${lin.dashArray ? ' punteada' : ''}" style="color:${lin.color}"></i>` : '';
  return `<span class="muestra" aria-hidden="true">${relleno}${linea}</span>`;
}
