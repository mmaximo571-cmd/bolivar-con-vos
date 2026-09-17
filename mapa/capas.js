/* ============================================================
   LAS CAPAS DEL MAPA DE RIESGO

   Una sola lista para la pantalla `mapa/` y para el panel. Sumar una
   categoría es sumar un renglón acá: la base no tiene la lista
   (`tabla-riesgo.sql` solo exige la capa), así que no hace falta SQL.

   Lo que NO se hace: cambiarle el `id` a una categoría que ya tiene
   reportes. Los viejos quedarían con un id que la lista no conoce y se
   mostrarían con el nombre crudo. Si hay que renombrar, se cambia el
   `nombre`, que es lo único que se lee.

   El glifo va adentro del pin a propósito: las tres capas NO se
   distinguen solo por el color. Quien no ve bien el rojo del celeste
   igual distingue una gota de una fábrica.
   ============================================================ */
const CAPAS_RIESGO = [
  { id:'hidrico', nombre:'Riesgo hídrico', corto:'Hídrico', glifo:'💧',
    categorias:[
      { id:'se-inunda',      nombre:'Calle o casas que se inundan' },
      { id:'desague-tapado', nombre:'Desagüe o zanja tapada' },
      { id:'arroyo',         nombre:'Arroyo o canal desbordado o con basura' }
    ] },
  { id:'industrial', nombre:'Riesgo industrial', corto:'Industrial', glifo:'🏭',
    categorias:[
      { id:'olor-humo', nombre:'Olor, humo o emisión' },
      { id:'derrame',   nombre:'Derrame o agua contaminada' },
      { id:'residuos',  nombre:'Residuos peligrosos o quema' }
    ] },
  { id:'redes', nombre:'Redes comunitarias', corto:'Redes', glifo:'🤝',
    categorias:[
      { id:'comedor',   nombre:'Comedor o merendero' },
      { id:'salud',     nombre:'Salita o centro de salud' },
      { id:'encuentro', nombre:'Lugar de encuentro o refugio' }
    ] }
];

function capaRiesgo(id){ return CAPAS_RIESGO.find(c => c.id === id) || null; }

function nombreCategoriaRiesgo(capa, categoria){
  const c = capaRiesgo(capa);
  const cat = c && c.categorias.find(x => x.id === categoria);
  return cat ? cat.nombre : categoria;
}
