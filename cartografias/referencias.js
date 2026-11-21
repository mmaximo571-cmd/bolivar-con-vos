/* ============================================================
   LAS REFERENCIAS DE UNA CARTOGRAFÍA SOCIAL

   Son la leyenda del mapa: qué es cada cosa que se dibuja. Hay un
   juego fijo, igual para todos los grupos (así dos cartografías del
   mismo barrio se pueden leer una al lado de la otra), y cada grupo
   suma las suyas desde la pantalla (`cartografia_referencias`).

   Las fijas viven SOLO acá: la base no tiene la lista
   (`sql/tabla-cartografias.sql` guarda el id como texto suelto), así
   que sumar una no pide SQL. Lo que NO se hace es cambiarle el `id` a
   una que ya se usó: lo dibujado quedaría con un id que nadie conoce y
   se vería gris, con el nombre crudo. Para renombrar, se cambia
   `nombre`.

   Cada una lleva color Y glifo: el glifo va adentro del pin, y quien
   no distingue el rojo del marrón igual distingue ⚠️ de ☣️. Los
   colores no son los de la marca a propósito, como en `mapa/`: van
   encima de un mapa de calles lleno de amarillos y naranjas.
   ============================================================ */
const REFERENCIAS_FIJAS = [
  { id:'instituciones',  nombre:'Instituciones',            glifo:'🏫', color:'#1E5FB4',
    ejemplo:'Escuelas, salitas, clubes, iglesias' },
  { id:'organizaciones', nombre:'Organizaciones y redes',   glifo:'🤝', color:'#7A4FB5',
    ejemplo:'Comedores, cooperativas, movimientos, centros culturales' },
  { id:'recursos',       nombre:'Recursos y servicios',     glifo:'🚰', color:'#0D8C85',
    ejemplo:'Agua, luz, transporte, espacios verdes' },
  { id:'encuentro',      nombre:'Lugares de encuentro',     glifo:'🧉', color:'#C98A00',
    ejemplo:'Plazas, esquinas, ferias, canchitas' },
  { id:'conflictos',     nombre:'Conflictos y problemas',   glifo:'⚠️', color:'#B52625',
    ejemplo:'Inseguridad, desalojos, violencias, falta de algo' },
  { id:'riesgos',        nombre:'Riesgos ambientales',      glifo:'☣️', color:'#7A4A12',
    ejemplo:'Inundaciones, basurales, contaminación' },
  { id:'recorridos',     nombre:'Recorridos y circulación', glifo:'🚶', color:'#1A1A1A',
    ejemplo:'Por dónde se camina, dónde no se pasa, el colectivo' },
  { id:'deseos',         nombre:'Deseos y propuestas',      glifo:'🌱', color:'#2F7D32',
    ejemplo:'Lo que falta y lo que se sueña para el barrio' }
];

/* Los colores para las referencias que suma cada grupo. Distintos de
   los fijos, para que una propia no se confunda con una de las ocho. */
const COLORES_PROPIOS = [
  '#D9480F', '#C2255C', '#4C6EF5', '#1098AD',
  '#5C940D', '#E67700', '#5F6B76', '#9C36B5'
];

/* Junta las fijas con las del grupo en una sola lista, con la misma
   forma. Las propias no tienen glifo: el pin lleva la inicial. */
function todasLasReferencias(propias){
  return REFERENCIAS_FIJAS.concat((propias || []).map(r => ({
    id: r.id, nombre: r.nombre, color: r.color, propia: true,
    glifo: (r.nombre || '?').trim().charAt(0).toUpperCase()
  })));
}

function buscarReferencia(lista, id){
  return lista.find(r => r.id === id)
    || { id, nombre: 'Sin referencia', glifo: '•', color: '#8A8A8A', perdida: true };
}
