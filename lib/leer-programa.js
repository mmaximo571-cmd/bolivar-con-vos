/* ============================================================
   LEER UN PROGRAMA  ·  de texto suelto a unidades y textos

   Esto no toca la pantalla ni la base: entra el texto de un
   programa (venga de un PDF, de un Word o de un pegado a mano) y
   sale el mismo objeto `unidades` que guarda la tabla `programas`.

       [ { titulo: 'Unidad 1: ...',
           textos: [ { autor, anio, titulo, obligatorio } ] } ]

   POR QUE ES UN ARCHIVO APARTE: lo usan dos lugares. El panel lo
   corre sobre los PDFs que arrastra el equipo, y el mismo panel lo
   corre sobre el texto pegado a mano. Si la lectura vive en un solo
   lado, los dos caminos dan siempre el mismo resultado.

   LO QUE HAY QUE SABER ANTES DE TOCARLO: los programas de la
   facultad NO tienen un formato unico. Conviven al menos dos:

     A) UNIDAD 1: TITULO EN MAYUSCULAS
        -Teorico 1
        - GALEANO, Eduardo. Las venas abiertas..., Siglo XXI, 2004.

     B) Unidad 1. Titulo en minusculas
        (parrafo de contenidos)
        Bibliografia Obligatoria
        Carballeda, Alfredo (2024). Ficha de catedra...

   Por eso esto acierta bastante, no siempre. Lo que no reconoce lo
   deja a la vista con un aviso, y se corrige en el formulario. Un
   parser que se equivoca en silencio seria peor que no tenerlo.
   ============================================================ */

window.LeerPrograma = (function(){

  /* ---------- Los tres planes, si estan cargados en la pagina ---------- */
  function planes(){
    return [window.PLAN_TS, window.PLAN_TGCR, window.PLAN_FONO].filter(Boolean);
  }

  /* Sin tildes, sin mayusculas y sin espacios de mas: asi se comparan
     'Epistemologia' del PDF con 'Epistemología' del plan de estudios. */
  function normalizar(s){
    return (s || '').toString()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  /* ============================================================
     1. LA CABECERA: que materia es, de que año y de que carrera
     ============================================================ */

  /* El codigo aparece de tres formas segun la catedra:
     'Codigo 211', 'COD. 213' y '(717)' pegado al nombre. */
  function buscarCodigo(cabecera){
    var m = cabecera.match(/\bc[oó]d(?:igo)?\.?[ \t]*:?[ \t]*n?[°º]?[ \t]*(\d{3}[ \t]*[A-Za-z]?)\b/i);
    if (m) return m[1].trim().toUpperCase();
    m = cabecera.match(/\(\s*(\d{3})\s*\)/);
    return m ? m[1] : null;
  }

  function buscarAnio(cabecera){
    var m = cabecera.match(/\ba[nñ]o\s*(?:lectivo)?\s*:?\s*(20\d{2})\b/i);
    if (m) return Number(m[1]);
    m = cabecera.match(/\b(20[12]\d)\b/);
    return m ? Number(m[1]) : null;
  }

  /* Solo los digitos: '211 A' y '211' se comparan igual. El codigo
     NO alcanza para decidir (211 A y 211 B comparten numero), asi
     que suma poco al puntaje y manda el nombre. */
  function digitos(cod){ return (cod || '').replace(/\D/g, ''); }

  /* Cruza la cabecera contra los tres planes y se queda con la
     materia cuyo nombre aparece completo y es el mas largo. Lo mas
     largo gana a proposito: en el programa de 'Trabajo Social II'
     tambien se lee 'Trabajo Social I', y tiene que ganar el II. */
  function reconocerMateria(cabecera, listaPlanes){
    var cab = normalizar(cabecera);
    var cod = buscarCodigo(cabecera);
    var mejor = null;

    listaPlanes.forEach(function(plan){
      (plan.materias || []).forEach(function(mat){
        var nombre = normalizar(mat.nombre);
        var puntos = 0;
        if (nombre.length > 6 && cab.indexOf(nombre) !== -1) puntos += nombre.length * 2;
        if (cod && digitos(cod) && digitos(mat.cod) === digitos(cod)) puntos += 30;
        if (puntos && (!mejor || puntos > mejor.puntos))
          mejor = { plan: plan, materia: mat, puntos: puntos };
      });
    });
    return mejor;
  }

  /* ============================================================
     2. LAS UNIDADES
     ============================================================ */

  var RE_UNIDAD =
    /^[\s•·*\-–—]*(unidad|m[oó]dulo|eje(?:\s+tem[aá]tico)?|bloque|tema|n[uú]cleo)\s*(?:n[°º]?\s*)?(\d{1,2}|[ivx]{1,5})\b\s*[:.\)\-–—]?\s*(.*)$/i;

  /* Algunas catedras no escriben la palabra 'unidad': encabezan con
     'I. INTRODUCCION A LA EPISTEMOLOGIA', en mayusculas. Se usa solo
     como ultimo recurso y solo si aparece dos veces o mas, porque un
     patron tan suelto agarraria cualquier renglon numerado. */
  var RE_UNIDAD_SUELTA =
    /^[ \t]{0,40}((?:[IVXL]{1,6})|(?:\d{1,2}))[ \t]*[.\-–)][ \t]+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ0-9 ,;:'"()\/\-–]{5,88})[ \t]*$/;

  /* 'Bibliografia', 'Lecturas obligatorias', 'Material de lectura'. */
  var RE_BIBLIO =
    /^[\s•·*\-–—]*(bibliograf[ií]a|lecturas?\b|material(?:es)?\s+de\s+lectura|textos\b)/i;

  /* Lo que NO es obligatorio, aunque este listado igual. */
  var RE_NO_OBLIG =
    /(optativa|optativo|complementaria|complementario|ampliatoria|sugerida|sugerido|recomendada|de\s+consulta|de\s+profundizaci[oó]n)/i;

  /* Formato A: la bibliografia no se anuncia, arranca despues de
     '-Teorico 1' o '-Trabajo Practico 2'. */
  var RE_SECCION =
    /^[\s]*[-–—]?\s*(te[oó]rico|trabajo\s+pr[aá]ctico|pr[aá]ctico|clase|seminario|taller)s?\s*(n[°º]?\s*)?\d*\s*:?\s*$/i;

  /* Los renglones que no son bibliografia ni titulo: pie de pagina,
     numero de pagina suelto, el membrete que se repite. */
  function esRuido(l){
    var t = l.trim();
    if (!t) return true;
    if (/^\d{1,3}$/.test(t)) return true;
    if (/^p[aá]gina\s+\d+/i.test(t)) return true;
    if (/^(universidad|facultad)\b/i.test(t) && t.length < 90) return true;
    return false;
  }

  /* Una referencia puede venir cortada en dos o tres renglones. Se
     empieza una nueva cuando el renglon arranca con vineta, con
     'Apellido, Nombre' o con 'Autor (2004)'. Lo demas es la
     continuacion del anterior. */
  function inicioDeReferencia(l){
    /* La vineta manda, sea punto, asterisco o guion. Hay catedras que
       listan con guion y sangran la continuacion, y sin esto los dos
       renglones se pegan y sale una cita Frankenstein. */
    if (/^[ \t]*[•·*\-–—]\s/.test(l)) return true;
    var t = l.replace(/^[\s•·*\-–—]+/, '');
    if (/^[A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚÑÜáéíóúñü'’.\- ]{1,45},\s*[A-ZÁÉÍÓÚÑÜ]/.test(t)) return true;
    if (/^[A-ZÁÉÍÓÚÑÜ][^()]{0,70}\(\s*\d{4}/.test(t)) return true;
    return false;
  }

  /* Un renglon puede traer dos citas pegadas cuando el PDF tenia dos
     columnas. Se corta antes de un 'Apellido, Nombre (2004)' que
     aparezca en el medio, nunca al principio. */
  function despegar(ref){
    return ref.split(/\s{2,}(?=[A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚÑÜáéíóúñü'’.\-]{1,30},\s*[A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚÑÜáéíóúñü.\- ]{1,30}\(\s*\d{4})/)
              .filter(function(p){ return p.trim(); });
  }

  /* Un autor de verdad es corto, no tiene numeros y suele venir como
     'Apellido, Nombre'. Si no se parece, se deja vacio: mejor un
     texto sin autor que un autor que dice 'Buenos Aires. Año'. */
  function pareceAutor(s){
    var t = (s || '').trim();
    if (!t || t.length > 70) return false;
    if (/\d/.test(t)) return false;
    if (/^[A-ZÁÉÍÓÚÑÜ][A-Za-zÁÉÍÓÚÑÜáéíóúñü'’.\- ]{1,45},\s*[A-ZÁÉÍÓÚÑÜ]/.test(t)) return true;
    /* Sin coma que separe apellido de nombre, un 'de', 'la' o 'y' en
       minuscula delata que no es un autor sino el titulo del texto:
       'Nociones de Economia Politica' no es nadie. */
    if (/\s(de|del|la|las|el|los|y|en|para|sobre|una|un)\s/i.test(t)) return false;
    return t.split(/\s+/).length <= 4 && /^[A-ZÁÉÍÓÚÑÜ]/.test(t);
  }

  function limpiarBordes(s){
    return (s || '').replace(/^[\s•·*\-–—:.,;]+/, '')
                    .replace(/[\s.,;:–—-]+$/, '')
                    .replace(/\s+/g, ' ').trim();
  }

  /* De un renglon de bibliografia a { autor, anio, titulo }. Se
     intentan los dos formatos frecuentes y, si ninguno cierra, se
     guarda el renglon entero como titulo: es preferible un texto
     sin partir a un autor inventado. */
  function partirReferencia(ref){
    var t = limpiarBordes(ref);
    var m;

    var anio = (t.match(/\b(?:19|20)\d{2}\b/) || [''])[0];

    /* Formato B: Carballeda, Alfredo (2024). Ficha de catedra... */
    m = t.match(/^(.{2,90}?)\s*\(\s*(\d{4})[a-z]?\s*\)\s*[.:,]?\s*(.+)$/);
    if (m && pareceAutor(m[1]))
      return { autor: limpiarBordes(m[1]), anio: m[2], titulo: limpiarBordes(m[3]) };

    /* Formato A: GALEANO, Eduardo. Las venas abiertas..., 2004. */
    m = t.match(/^(.{2,90}?)[.:]\s+(.+?)[,.]?\s*\b((?:19|20)\d{2})\b[.,]?\s*$/);
    if (m && pareceAutor(m[1]))
      return { autor: limpiarBordes(m[1]), anio: m[3], titulo: limpiarBordes(m[2]) };

    /* Ni una ni otra. Hay catedras que ponen el titulo primero y el
       autor al final: ahi el renglon entero es el texto y el año es
       lo unico que se puede rescatar sin adivinar. */
    return { autor: '', anio: anio, titulo: limpiarBordes(t) };
  }

  /* Junta los renglones sueltos de un bloque en referencias enteras. */
  function agruparReferencias(lineas, obligatorio){
    var refs = [], actual = null;
    lineas.forEach(function(l){
      if (esRuido(l)) return;
      if (RE_SECCION.test(l)) return;
      if (inicioDeReferencia(l) || !actual){
        if (actual) refs.push(actual);
        actual = l.trim();
      } else {
        actual += ' ' + l.trim();
      }
    });
    if (actual) refs.push(actual);

    var sueltas = [];
    refs.forEach(function(r){ sueltas = sueltas.concat(despegar(r)); });
    refs = sueltas;

    return refs.map(function(r){
      var p = partirReferencia(r);
      p.obligatorio = obligatorio;
      return p;
    }).filter(function(p){
      /* Menos de 7 letras no es una cita; mas de 300 es un parrafo que
         se colo, no un texto. */
      return p.titulo && p.titulo.length > 6 && p.titulo.length < 300;
    });
  }

  /* De los renglones de UNA unidad a su lista de textos. Se busca
     donde empieza la bibliografia; si la catedra no la anuncia, se
     usa '-Teorico 1' como señal; si tampoco, se toman los renglones
     que parecen referencia. */
  function textosDeUnidad(lineas){
    var textos = [];
    var i = 0, encontro = false;

    while (i < lineas.length){
      var l = lineas[i];

      if (RE_BIBLIO.test(l)){
        encontro = true;
        var obligatorio = !RE_NO_OBLIG.test(l);
        var bloque = [];
        /* Lo que sobra del propio renglon del encabezado, si trae
           el primer texto pegado. */
        var resto = l.replace(RE_BIBLIO, '').replace(/^[\s:.\-–—]*(obligatoria|obligatorio|optativa|optativo|complementaria|ampliatoria|sugerida|de consulta)?[\s:.\-–—]*/i, '');
        if (resto.trim().length > 12) bloque.push(resto);
        i++;
        while (i < lineas.length && !RE_BIBLIO.test(lineas[i])){ bloque.push(lineas[i]); i++; }
        textos = textos.concat(agruparReferencias(bloque, obligatorio));
        continue;
      }

      if (!encontro && RE_SECCION.test(l)){
        encontro = true;
        textos = textos.concat(agruparReferencias(lineas.slice(i + 1), true));
        break;
      }
      i++;
    }

    /* Ni encabezado de bibliografia ni secciones: se rescatan los
       renglones que traen año, que es lo que distingue una cita de
       un parrafo de contenidos. */
    if (!encontro){
      var candidatas = lineas.filter(function(l){
        return /\b(?:19|20)\d{2}\b/.test(l) && l.trim().length > 20;
      });
      if (candidatas.length) textos = agruparReferencias(candidatas, true);
    }
    return textos;
  }

  /* ============================================================
     3. TODO JUNTO
     ============================================================ */

  function desdeTexto(texto, opciones){
    opciones = opciones || {};
    var listaPlanes = opciones.planes || planes();
    var avisos = [];
    /* Los Word exportados a PDF traen espacios de ancho cero pegados a
       las viñetas. No se ven, pero rompen todos los patrones: un
       '-​ Bouchet' deja de parecer una viñeta y la cita se pega a
       la anterior. Se sacan antes de mirar nada. */
    var lineas = (texto || '').replace(/[​‌‍﻿­]/g, '')
                              .replace(/\r/g, '').split('\n');

    /* --- Cabecera: los primeros renglones con contenido --- */
    var cabecera = lineas.slice(0, 45).join('\n');
    var hallazgo = reconocerMateria(cabecera, listaPlanes);
    /* Si en la cabecera no aparecio, se busca en todo el programa:
       algunas catedras ponen el nombre recien en la segunda hoja. */
    if (!hallazgo) hallazgo = reconocerMateria(texto.slice(0, 6000), listaPlanes);

    var codigoTexto = buscarCodigo(cabecera);
    var anio = buscarAnio(cabecera);

    /* --- Unidades --- */
    /* Se ubican todos los encabezados primero. Si el programa tiene
       modulos Y unidades adentro, mandan las unidades: son el corte
       fino, y tomar los dos daria el doble de unidades de las que
       tiene el programa. */
    var enc = [];
    lineas.forEach(function(l, i){
      var m = l.match(RE_UNIDAD);
      if (m) enc.push({ i: i,
                        tipo: normalizar(m[1]).split(' ')[0],
                        etiqueta: limpiarBordes(m[0]),
                        titulo: limpiarBordes(m[3]) });
    });
    if (enc.some(function(e){ return e.tipo === 'unidad'; }))
      enc = enc.filter(function(e){ return e.tipo === 'unidad'; });

    if (enc.length < 2){
      var sueltas = [];
      lineas.forEach(function(l, i){
        var m = l.match(RE_UNIDAD_SUELTA);
        if (m) sueltas.push({ i: i, tipo: 'suelta',
                              etiqueta: limpiarBordes(m[1] + '. ' + m[2]), titulo: limpiarBordes(m[2]) });
      });
      if (sueltas.length >= 2) enc = sueltas;
    }

    var unidades = enc.map(function(e, k){
      var hasta  = (k + 1 < enc.length) ? enc[k + 1].i : lineas.length;
      var cuerpo = lineas.slice(e.i + 1, hasta);
      /* Si el titulo sigue en el renglon de abajo, se lo trae. */
      var titulo = e.etiqueta;
      if (!e.titulo){
        for (var j = 0; j < Math.min(3, cuerpo.length); j++){
          var c = cuerpo[j].trim();
          if (c && !esRuido(c) && !RE_BIBLIO.test(c)){ titulo = titulo + ': ' + limpiarBordes(c); break; }
        }
      }
      return { titulo: titulo, textos: textosDeUnidad(cuerpo) };
    });

    /* --- Cuando la bibliografia no esta repartida por unidad --- */
    /* Muchas catedras ponen los contenidos de cada unidad arriba y UNA
       sola lista de bibliografia al final. Si casi ninguna unidad
       quedo con textos y en cambio hay encabezados de bibliografia
       sueltos, se arma de esa forma: las unidades conservan su titulo
       y la lista va aparte. Colgarle los 95 textos del programa a la
       ultima unidad, que es donde caen por posicion, seria mentir. */
    var bibliografiaGlobal = false;
    var conTexto = unidades.filter(function(u){ return u.textos.length; }).length;

    if (enc.length && conTexto / enc.length < 0.4){
      var globales = [];
      lineas.forEach(function(l, i){
        /* Un encabezado es corto. Un renglon largo que empieza con
           'Bibliografia' es prosa, no un encabezado. */
        if (RE_BIBLIO.test(l) && limpiarBordes(l).length < 70)
          globales.push({ i: i, titulo: limpiarBordes(l) });
      });

      var listas = globales.map(function(g, k){
        var hasta = (k + 1 < globales.length) ? globales[k + 1].i : lineas.length;
        enc.forEach(function(e){ if (e.i > g.i && e.i < hasta) hasta = e.i; });
        return { titulo: g.titulo,
                 textos: agruparReferencias(lineas.slice(g.i + 1, hasta), !RE_NO_OBLIG.test(g.titulo)) };
      }).filter(function(u){ return u.textos.length >= 2; });

      if (listas.length){
        unidades = unidades.map(function(u){ return { titulo: u.titulo, textos: [] }; })
                           .concat(listas);
        bibliografiaGlobal = true;
      }
    }

    /* El indice del principio repite los titulos sin bibliografia.
       Si una unidad quedo vacia y hay otra con el mismo numero que
       si tiene textos, la vacia era del indice. */
    var conTextos = {};
    unidades.forEach(function(u){
      var n = normalizar(u.titulo).slice(0, 30);
      if (u.textos.length) conTextos[n] = true;
    });
    unidades = unidades.filter(function(u){
      if (u.textos.length) return true;
      return !conTextos[normalizar(u.titulo).slice(0, 30)];
    });

    /* --- Avisos: lo que hay que mirar a mano --- */
    if (!hallazgo)          avisos.push('No se reconocio la materia en el plan de estudios.');
    if (!unidades.length)   avisos.push('No se reconocieron unidades.');
    if (bibliografiaGlobal)
      avisos.push('El programa no reparte la bibliografia por unidad: quedo como lista aparte.');
    else {
      var vacias = unidades.filter(function(u){ return !u.textos.length; }).length;
      if (vacias)           avisos.push(vacias + ' unidad' + (vacias === 1 ? '' : 'es') + ' sin textos.');
    }
    if (!anio)              avisos.push('No se reconocio el año del programa.');
    if (hallazgo && codigoTexto && digitos(hallazgo.materia.cod) !== digitos(codigoTexto))
      avisos.push('El codigo del PDF (' + codigoTexto + ') no coincide con el del plan (' + hallazgo.materia.cod + ').');

    return {
      carrera:     hallazgo ? hallazgo.plan.id  : null,
      materia_cod: hallazgo ? hallazgo.materia.cod : (codigoTexto || ''),
      materia:     hallazgo ? hallazgo.materia.nombre : '',
      catedra:     null,
      anio:        anio,
      unidades:    unidades,
      avisos:      avisos,
      crudo:       texto
    };
  }

  function contarTextos(unidades){
    return (unidades || []).reduce(function(s, u){ return s + (u.textos || []).length; }, 0);
  }

  /* Que porcentaje de los textos quedo con autor Y año. Es la señal
     honesta de si la lectura salio bien: la cantidad de textos sola
     puede estar alta y ser puré. Abajo de 50 hay que mirarlo. */
  function calidad(unidades){
    var todos = [];
    (unidades || []).forEach(function(u){ todos = todos.concat(u.textos || []); });
    if (!todos.length) return 0;
    var buenos = todos.filter(function(t){ return t.autor && t.anio; }).length;
    return Math.round(buenos * 100 / todos.length);
  }

  return { desdeTexto: desdeTexto, planes: planes, contarTextos: contarTextos,
           calidad: calidad, normalizar: normalizar };
})();
