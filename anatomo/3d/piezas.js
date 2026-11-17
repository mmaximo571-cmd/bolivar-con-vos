/* ============================================================
   LAS PIEZAS DEL VISOR 3D (17/11/2026)

   Qué se ve en cada vista, cómo se llama en castellano y para qué
   sirve. Es la única fuente: `armar-datos.mjs` lee de acá qué mallas
   de BodyParts3D meter en cada `datos/<vista>.bin`, así que el texto
   y la geometría no se pueden desencontrar.

   `mallas` son los nombres en inglés de BodyParts3D 4.0, tal cual.
   Un nombre suelto («arytenoid cartilage») junta el izquierdo y el
   derecho: se estudian de a pares y se tocan como una sola pieza.
   Los que empiezan con «/» son expresiones regulares (los 28
   dientes, las 98 ramas del árbol bronquial).

   Las funciones las escribió la agrupación con la bibliografía de
   la materia a mano. Si algo no coincide con lo que dice la
   cátedra, vale la cátedra: se corrige acá y se vuelve a armar.

   `encuadre:false` deja la pieza fuera del cálculo de la cámara
   inicial: el esófago baja hasta el estómago y, si contara, la
   faringe se vería chiquita.
   ============================================================ */
(function(){

/* Los colores son de anatomía, no de la marca: un músculo es rojo en
   cualquier atlas. Van apagados para que el resaltado se note. */
var GRUPOS = {
  cartilago:   { nombre:'Cartílagos',            color:[0.62,0.76,0.84] },
  hueso:       { nombre:'Huesos',                color:[0.91,0.86,0.77] },
  intrinseco:  { nombre:'Músculos intrínsecos',  color:[0.78,0.30,0.30] },
  ligamento:   { nombre:'Ligamentos y membranas',color:[0.89,0.79,0.45] },
  infrahioideo:{ nombre:'Infrahioideos',         color:[0.70,0.42,0.36] },
  suprahioideo:{ nombre:'Suprahioideos',         color:[0.80,0.48,0.36] },
  via:         { nombre:'Vía aérea',             color:[0.90,0.63,0.66] },
  boca:        { nombre:'Boca',                  color:[0.95,0.93,0.88] },
  lengua:      { nombre:'Lengua',                color:[0.84,0.47,0.50] },
  paladar:     { nombre:'Velo del paladar',      color:[0.86,0.56,0.40] },
  faringe:     { nombre:'Faringe y esófago',     color:[0.74,0.35,0.42] },
  glandula:    { nombre:'Glándulas salivales',   color:[0.85,0.68,0.38] },
  columna:     { nombre:'Columna',               color:[0.80,0.78,0.72] },
  nariz:       { nombre:'Nariz',                 color:[0.66,0.78,0.86] },
  torax:       { nombre:'Tórax',                 color:[0.91,0.86,0.77] },
  respiratorio:{ nombre:'Músculos respiratorios',color:[0.78,0.30,0.30] }
};

/* ---- Piezas que se repiten en más de una vista ---- */
var P = {
  tiroides: { nombre:'Cartílago tiroides', grupo:'cartilago', mallas:['thyroid cartilage'],
    func:'El más grande de la laringe: dos láminas unidas adelante, en la prominencia laríngea (la «nuez»). Protege los pliegues vocales y bascula sobre el cricoides cuando se tensan.' },
  cricoides: { nombre:'Cartílago cricoides', grupo:'cartilago', mallas:['cricoid cartilage'],
    func:'El único anillo completo de la vía aérea, con forma de anillo de sello: angosto adelante y alto atrás. Es la base de la laringe: sobre él se apoyan los aritenoides y se articula el tiroides.' },
  aritenoides: { nombre:'Cartílagos aritenoides', grupo:'cartilago', mallas:['arytenoid cartilage'],
    func:'Dos pirámides sobre el borde posterior del cricoides. En su apófisis vocal se inserta el pliegue vocal y en la muscular los cricoaritenoideos: al rotar y deslizarse, abren y cierran la glotis.' },
  epiglotis: { nombre:'Epiglotis', grupo:'cartilago', mallas:['epiglottis'],
    func:'Cartílago elástico con forma de hoja, por detrás de la lengua. En la deglución, al subir la laringe, bascula hacia atrás y ayuda a cubrir la entrada de la vía aérea.' },
  hioides: { nombre:'Hueso hioides', grupo:'hueso', mallas:['hyoid bone'],
    func:'El único hueso que no se articula con otro: queda suspendido por músculos y ligamentos. De él cuelga la laringe y en él se insertan la lengua y los músculos supra e infrahioideos.' },
  traquea: { nombre:'Tráquea', grupo:'via', mallas:['trachea'],
    func:'Sigue al cricoides hasta la bifurcación en los bronquios. Sus anillos de cartílago son incompletos atrás, donde apoya el esófago.' },
  digastrico: { nombre:'Digástrico', grupo:'suprahioideo', mallas:['digastric'],
    func:'Dos vientres unidos por un tendón que pasa junto al hioides. Eleva el hioides en la deglución y, con el hioides fijo, ayuda a bajar la mandíbula.' },
  estilohioideo: { nombre:'Estilohioideo', grupo:'suprahioideo', mallas:['stylohyoid'],
    func:'De la apófisis estiloides al hioides: lo eleva y lo lleva hacia atrás durante la deglución.' },
  milohioideo: { nombre:'Milohioideo', grupo:'suprahioideo', mallas:['mylohyoid'],
    func:'Forma el piso de la boca. Eleva el piso y la lengua al comienzo de la deglución y empuja el bolo hacia atrás.' },
  geniohioideo: { nombre:'Geniohioideo', grupo:'suprahioideo', mallas:['geniohyoid'],
    func:'Por encima del milohioideo, del mentón al hioides: lleva el hioides hacia arriba y adelante, lo que ayuda a abrir el esfínter esofágico superior.' },
  mandibula: { nombre:'Mandíbula', grupo:'hueso', mallas:['mandible'],
    func:'El único hueso móvil del cráneo, articulado con el temporal en la ATM. Sostiene los dientes inferiores y es inserción de los músculos del piso de la boca.' },
  maxilares: { nombre:'Maxilares', grupo:'hueso', mallas:['maxilla'],
    func:'Forman el techo de la boca (paladar duro, con los palatinos), el piso de las fosas nasales y sostienen los dientes superiores.' },
  palatinos: { nombre:'Huesos palatinos', grupo:'hueso', mallas:['palatine bone'],
    func:'Completan atrás el paladar duro, donde se fija el velo del paladar.' }
};

function copia(p, cambios){
  var c = {}; for (var k in p) c[k] = p[k];
  for (var j in (cambios || {})) c[j] = cambios[j];
  return c;
}

var VISTAS = {

  /* ---------------------------------------------------- LARINGE */
  laringe: {
    nombre:'Laringe', modulo:3,
    bajada:'El esqueleto de cartílagos, los músculos que abren, cierran y tensan los pliegues vocales, y los que suben y bajan la laringe.',
    camara:{ giro:-0.55, altura:0.22, distancia:1.0 },
    grupos:['cartilago','hueso','intrinseco','ligamento','infrahioideo','suprahioideo','via'],
    /* Los extrínsecos tapan todo y van lejos (a la escápula, al
       cráneo): arrancan escondidos y se prenden desde su botón. */
    ocultos:['infrahioideo','suprahioideo'],
    piezas:{
      tiroides:P.tiroides, cricoides:P.cricoides, aritenoides:P.aritenoides,
      corniculados:{ nombre:'Cartílagos corniculados', grupo:'cartilago', mallas:['corniculate cartilage'],
        func:'Pequeños, sobre el vértice de cada aritenoides (de Santorini), dentro del pliegue aritenoepiglótico.' },
      cuneiformes:{ nombre:'Cartílagos cuneiformes', grupo:'cartilago', mallas:['cuneiform cartilage'],
        func:'Dentro del pliegue aritenoepiglótico (de Wrisberg): le dan rigidez al borde de la entrada de la laringe.' },
      epiglotis:P.epiglotis, hioides:P.hioides,
      traquea:copia(P.traquea, { encuadre:false }),

      crico_post:{ nombre:'Cricoaritenoideo posterior', grupo:'intrinseco', mallas:['posterior crico-arytenoid'],
        func:'El único abductor: rota los aritenoides hacia afuera y separa los pliegues vocales. Abre la glotis para respirar.' },
      crico_lat:{ nombre:'Cricoaritenoideo lateral', grupo:'intrinseco', mallas:['lateral crico-arytenoid'],
        func:'Aductor: rota los aritenoides hacia adentro y acerca la parte membranosa de los pliegues vocales.' },
      arit_trans:{ nombre:'Aritenoideo transverso', grupo:'intrinseco', mallas:['transverse arytenoid'],
        func:'El único impar. Acerca los aritenoides entre sí y cierra la parte posterior de la glotis (aductor).' },
      arit_obl:{ nombre:'Aritenoideos oblicuos', grupo:'intrinseco', mallas:['oblique arytenoid'],
        func:'Cruzan en X por detrás del transverso. Ayudan a juntar los aritenoides y siguen como aritenoepiglóticos.' },
      ariepi:{ nombre:'Aritenoepiglótico', grupo:'intrinseco', mallas:['aryepiglotticus'],
        func:'Continuación del aritenoideo oblicuo hasta la epiglotis: achica la entrada de la laringe al tragar.' },
      tiroarit:{ nombre:'Tiroaritenoideo', grupo:'intrinseco', mallas:['thyro-arytenoid'],
        func:'Del ángulo del tiroides al aritenoides: es el cuerpo del pliegue vocal. Acorta y relaja los pliegues y ayuda a cerrar la glotis.' },
      vocal:{ nombre:'Músculo vocal', grupo:'intrinseco', mallas:['vocalis'],
        func:'La porción interna del tiroaritenoideo, junto al ligamento vocal. Regula la tensión y el grosor de la parte que vibra.' },
      cricotiroideo:{ nombre:'Cricotiroideo', grupo:'intrinseco',
        mallas:['straight part of left cricothyroid','straight part of right cricothyroid',
                'oblique part of left cricothyroid','oblique part of right cricothyroid'],
        func:'El tensor: con su porción recta y su porción oblicua acerca adelante el cricoides y el tiroides, alarga los pliegues vocales y sube la frecuencia. Lo inerva el laríngeo superior; a todos los demás intrínsecos, el recurrente.' },

      lig_vocal:{ nombre:'Ligamento vocal', grupo:'ligamento', mallas:['vocal ligament'],
        func:'El borde superior libre del cono elástico, del ángulo del tiroides a la apófisis vocal del aritenoides. Es el esqueleto del pliegue vocal.' },
      cono:{ nombre:'Cono elástico', grupo:'ligamento', mallas:['conus elasticus'],
        func:'Membrana que sube desde el borde superior del cricoides y termina arriba engrosada en el ligamento vocal.' },
      cricotir_medio:{ nombre:'Ligamento cricotiroideo medio', grupo:'ligamento', mallas:['median cricothyroid ligament'],
        func:'Une cricoides y tiroides por delante, en la línea media. Es donde se hace la cricotirotomía de urgencia.' },
      memb_tirohioidea:{ nombre:'Membrana tirohioidea', grupo:'ligamento', mallas:['thyrohyoid membrane'],
        func:'Une el borde superior del tiroides con el hioides: de ella cuelga la laringe.' },
      tirohioideo_medio:{ nombre:'Ligamento tirohioideo medio', grupo:'ligamento', mallas:['median thyrohyoid ligament'],
        func:'El engrosamiento central de la membrana tirohioidea.' },
      tirohioideos_lat:{ nombre:'Ligamentos tirohioideos laterales', grupo:'ligamento', mallas:['lateral thyrohyoid ligament'],
        func:'Los bordes posteriores de la membrana, de las astas superiores del tiroides a las astas mayores del hioides.' },
      hioepi:{ nombre:'Ligamento hioepiglótico', grupo:'ligamento', mallas:['hyo-epiglottic ligament'],
        func:'Une la cara anterior de la epiglotis con el hioides.' },
      tiroepi:{ nombre:'Ligamento tiroepiglótico', grupo:'ligamento', mallas:['thyro-epiglottic ligament'],
        func:'Fija el pie (pecíolo) de la epiglotis al ángulo interno del tiroides.' },

      esternohioideo:{ encuadre:false, nombre:'Esternohioideo', grupo:'infrahioideo', mallas:['sternohyoid'],
        func:'Del esternón al hioides: lo baja después de tragar.' },
      esternotiroideo:{ encuadre:false, nombre:'Esternotiroideo', grupo:'infrahioideo', mallas:['sternothyroid'],
        func:'Del esternón al tiroides: baja la laringe.' },
      tirohioideo:{ encuadre:false, nombre:'Tirohioideo', grupo:'infrahioideo', mallas:['thyrohyoid'],
        func:'Del tiroides al hioides. Baja el hioides o, con el hioides fijo, sube la laringe y la acerca a él.' },
      omohioideo:{ encuadre:false, nombre:'Omohioideo', grupo:'infrahioideo', mallas:['omohyoid'],
        func:'Dos vientres, de la escápula al hioides: baja y fija el hioides.' },

      digastrico:copia(P.digastrico, { encuadre:false }),
      estilohioideo:copia(P.estilohioideo, { encuadre:false }),
      milohioideo:copia(P.milohioideo, { encuadre:false }),
      geniohioideo:copia(P.geniohioideo, { encuadre:false })
    }
  },

  /* -------------------------------------------------- DEGLUCIÓN */
  deglucion: {
    nombre:'Deglución', modulo:2,
    bajada:'La boca, la lengua, el velo del paladar, los constrictores de la faringe y la laringe que sube: todo lo que mueve el bolo.',
    camara:{ giro:1.25, altura:0.15, distancia:1.05 },
    grupos:['hueso','boca','lengua','paladar','faringe','suprahioideo','cartilago','glandula','columna'],
    piezas:{
      mandibula:P.mandibula, maxilares:P.maxilares, palatinos:P.palatinos, hioides:P.hioides,

      labios:{ nombre:'Labios', grupo:'boca', mallas:['lip'],
        func:'Cierran la boca adelante y contienen el bolo durante la fase oral.' },
      dientes:{ nombre:'Dientes', grupo:'boca', mallas:['/tooth$/i'],
        func:'La dentición permanente: 28 piezas en este modelo (no trae las muelas del juicio). Cortan y trituran en la masticación, la preparación del bolo.' },
      encias:{ nombre:'Encías', grupo:'boca', mallas:['/^gingiva/i'],
        func:'La mucosa que recubre los rebordes alveolares alrededor de los dientes.' },

      lengua:{ nombre:'Lengua', grupo:'lengua', mallas:['tongue'],
        func:'Junta y forma el bolo, y lo propulsa hacia atrás contra el paladar en la fase oral. Su base empuja el bolo hacia la faringe.' },
      geniogloso:{ nombre:'Geniogloso', grupo:'lengua', mallas:['genioglossus'],
        func:'El extrínseco más grande de la lengua: la lleva hacia adelante (protrusión) y deprime su centro.' },
      hiogloso:{ nombre:'Hiogloso', grupo:'lengua', mallas:['hyoglossus'],
        func:'Del hioides a los costados de la lengua: la baja y la retrae.' },

      elevador_velo:{ nombre:'Elevador del velo del paladar', grupo:'paladar', mallas:['levator veli palatini'],
        func:'Eleva el velo y lo lleva hacia atrás: cierra la nasofaringe para que el bolo no pase a la nariz (y en el habla, para los sonidos orales).' },
      tensor_velo:{ nombre:'Tensor del velo del paladar', grupo:'paladar', mallas:['tensor veli palatini'],
        func:'Tensa el velo y abre la trompa de Eustaquio: por eso al tragar se compensa la presión del oído medio.' },
      uvula:{ nombre:'Músculo de la úvula', grupo:'paladar', mallas:['uvular muscle'],
        func:'Acorta y eleva la úvula; refuerza el cierre velofaríngeo.' },

      const_sup:{ nombre:'Constrictor superior de la faringe', grupo:'faringe', mallas:['superior pharyngeal constrictor'],
        func:'Los constrictores se contraen en orden, de arriba hacia abajo, y empujan el bolo en la fase faríngea. El superior ayuda además al cierre velofaríngeo.' },
      const_medio:{ nombre:'Constrictor medio de la faringe', grupo:'faringe', mallas:['middle pharyngeal constrictor'],
        func:'Nace en el hioides y sigue la onda de contracción que baja por la faringe.' },
      const_inf:{ nombre:'Constrictor inferior de la faringe', grupo:'faringe', mallas:['inferior pharyngeal constrictor'],
        func:'Nace en el tiroides y el cricoides. Su porción más baja, el cricofaríngeo, forma el esfínter esofágico superior.' },
      palatofaringeo:{ nombre:'Palatofaríngeo', grupo:'faringe', mallas:['palatopharyngeus'],
        func:'Forma el pilar posterior del velo. Eleva la faringe y la laringe y acerca los pilares entre sí.' },
      salpingofaringeo:{ nombre:'Salpingofaríngeo', grupo:'faringe', mallas:['salpingopharyngeus'],
        func:'Baja desde la trompa de Eustaquio y eleva la faringe al tragar.' },
      estilofaringeo:{ nombre:'Estilofaríngeo', grupo:'faringe', mallas:['stylopharyngeus'],
        func:'De la apófisis estiloides a la faringe: la eleva y la ensancha para recibir el bolo. Es el único músculo que inerva el glosofaríngeo (IX).' },
      rafe_faringeo:{ nombre:'Rafe faríngeo', grupo:'faringe', mallas:['pharyngeal raphe'],
        func:'La costura de la línea media posterior, donde se unen los constrictores de cada lado.' },
      rafe_pterigo:{ nombre:'Rafe pterigomandibular', grupo:'faringe', mallas:['pterygomandibular raphe'],
        func:'Une el constrictor superior con el buccinador: la pared de la faringe sigue en la de la mejilla.' },
      esofago:{ nombre:'Esófago', grupo:'faringe', mallas:['esophagus'], encuadre:false,
        func:'Lleva el bolo al estómago por peristaltismo (fase esofágica), entre el esfínter esofágico superior y el inferior.' },

      digastrico:P.digastrico, estilohioideo:P.estilohioideo,
      milohioideo:P.milohioideo, geniohioideo:P.geniohioideo,
      lig_estilohioideo:{ nombre:'Ligamento estilohioideo', grupo:'suprahioideo', mallas:['stylohyoid ligament'],
        func:'De la apófisis estiloides al asta menor del hioides: lo suspende del cráneo.' },

      epiglotis:P.epiglotis,
      tiroides:copia(P.tiroides, { func:'En la deglución la laringe entera sube y va hacia adelante, bajo la base de la lengua: es uno de los mecanismos de protección de la vía aérea.' }),
      cricoides:P.cricoides, aritenoides:P.aritenoides,

      sublingual:{ nombre:'Glándulas sublinguales', grupo:'glandula', mallas:['sublingual gland'],
        func:'Bajo la mucosa del piso de la boca. Su saliva, mucosa, lubrica el bolo.' },
      submandibular:{ nombre:'Glándulas submandibulares', grupo:'glandula', mallas:['submandibular gland'],
        func:'Debajo de la mandíbula; vuelcan su saliva a los costados del frenillo de la lengua.' },

      cervical:{ nombre:'Vértebras cervicales', grupo:'columna', mallas:['atlas','axis','/^(third|fourth|fifth|sixth|seventh) cervical vertebra$/i'],
        func:'La faringe se apoya por delante de ellas. Sirven de referencia: la laringe del adulto queda a la altura de C3 a C6.' }
    }
  },

  /* ------------------------------------------------ RESPIRACIÓN */
  respiracion: {
    nombre:'Respiración', modulo:4,
    bajada:'La nariz, la laringe, el árbol bronquial y la caja que se agranda al inspirar. Este modelo no trae los pulmones: se ven sus bronquios.',
    camara:{ giro:-0.5, altura:0.12, distancia:1.0 },
    grupos:['nariz','cartilago','via','torax','respiratorio'],
    piezas:{
      cart_tabique:{ nombre:'Cartílago del tabique', grupo:'nariz', mallas:['septal nasal cartilage'],
        func:'La parte anterior del tabique nasal, que separa las dos fosas.' },
      cart_laterales:{ nombre:'Cartílagos laterales de la nariz', grupo:'nariz', mallas:['lateral nasal cartilage'],
        func:'Forman las paredes del dorso de la nariz, debajo de los huesos nasales.' },
      cart_alares:{ nombre:'Cartílagos alares mayores', grupo:'nariz', mallas:['major alar cartilage'],
        func:'Dan forma a la punta y a las alas de la nariz, alrededor de las narinas.' },
      huesos_nasales:{ nombre:'Huesos nasales', grupo:'nariz', mallas:['nasal bone'],
        func:'El esqueleto del dorso de la nariz.' },
      cornetes:{ nombre:'Cornetes inferiores', grupo:'nariz', mallas:['inferior nasal concha'],
        func:'Láminas óseas de la pared lateral de las fosas. Aumentan la superficie de mucosa que calienta, humedece y filtra el aire.' },
      vomer:{ nombre:'Vómer', grupo:'nariz', mallas:['vomer'],
        func:'La parte posteroinferior del tabique óseo.' },
      etmoides:{ nombre:'Etmoides', grupo:'nariz', mallas:['ethmoid'],
        func:'Su lámina perpendicular forma la parte alta del tabique óseo; sus masas laterales llevan los cornetes superior y medio. La lámina cribosa deja pasar los nervios olfatorios.' },
      maxilares:P.maxilares,

      tiroides:P.tiroides, cricoides:P.cricoides, epiglotis:P.epiglotis, aritenoides:P.aritenoides,
      traquea:P.traquea,
      bronquios:{ nombre:'Bronquios principales', grupo:'via', mallas:['left main bronchus','right main bronchus proper'],
        func:'Salen de la bifurcación de la tráquea. El derecho es más corto, más ancho y más vertical: por eso lo aspirado suele irse a ese lado.' },
      arbol:{ nombre:'Árbol bronquial', grupo:'via', mallas:['/bronchial tree$/i'],
        func:'Las ramas lobares y segmentarias. Son vías de conducción: llevan el aire hasta donde se hace el intercambio.' },

      costillas:{ nombre:'Costillas', grupo:'torax', mallas:['/ rib$/i'],
        func:'Al inspirar se elevan y rotan hacia afuera: agrandan el tórax de adelante hacia atrás (en manija de bomba) y de lado a lado (en asa de balde).' },
      cart_costales:{ nombre:'Cartílagos costales', grupo:'torax', mallas:['/costal cartilage$/i'],
        func:'Unen las costillas al esternón y le dan elasticidad a la caja: ayudan a que vuelva sola a su lugar al espirar.' },
      esternon:{ nombre:'Esternón', grupo:'torax', mallas:['manubrium','body of sternum','xiphoid process'],
        func:'Manubrio, cuerpo y apéndice xifoides. Sube y va hacia adelante con las costillas al inspirar.' },

      diafragma:{ nombre:'Diafragma', grupo:'respiratorio', mallas:['diaphragm'],
        func:'El principal músculo de la inspiración. Al contraerse baja su cúpula y agranda el tórax de arriba hacia abajo. En reposo, la espiración es pasiva.' },
      ic_externos:{ nombre:'Intercostales externos', grupo:'respiratorio', mallas:['external intercostal muscle'],
        func:'Elevan las costillas: participan en la inspiración.' },
      ic_internos:{ nombre:'Intercostales internos', grupo:'respiratorio', mallas:['internal intercostal muscle'],
        func:'Bajan las costillas en la espiración forzada (al hablar fuerte, cantar o toser).' },
      escalenos:{ nombre:'Escalenos', grupo:'respiratorio', mallas:['scalenus anterior','scalenus medius','scalenus posterior'],
        func:'De las vértebras cervicales a la 1.ª y 2.ª costilla: las elevan. Son accesorios de la inspiración.' },
      ecm:{ nombre:'Esternocleidomastoideo', grupo:'respiratorio', mallas:['sternocleidomastoid'],
        func:'Con la cabeza fija, eleva el esternón y las clavículas: accesorio de la inspiración forzada.' }
    }
  }
};

var raiz = typeof window !== 'undefined' ? window : globalThis;
raiz.PIEZAS3D = { GRUPOS: GRUPOS, VISTAS: VISTAS };
})();
