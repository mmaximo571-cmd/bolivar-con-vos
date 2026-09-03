/* ============================================================
   EL CLIENTE CHICO  ·  para las pantallas que solo leen

   POR QUÉ EXISTE

   Una visita a Inicio bajaba 135,7 KB de código para mostrar
   4,6 KB de datos, y 56,4 KB de eso era la librería de Supabase.
   Seis de las diez pantallas la usaban SOLO para leer datos
   públicos: sin cuenta, sin subir archivos, sin nada de lo que
   esa librería sabe hacer.

   Y del otro lado del cable no hay nada raro: la base es
   PostgREST, que es una API HTTP común. Leer una tabla es pedir
   una URL. Esto hace exactamente eso, con `fetch`.

   La forma de llamarlo es la misma que la de la librería grande
   —db.from('tabla').select('*').eq('publicado', true)— justamente
   para no tener que reescribir las pantallas. Cambia el archivo
   que se carga arriba, y nada más.

   LO QUE ESTE CLIENTE NO HACE

     · Iniciar sesión, y sobre todo RENOVARLA. El token dura una
       hora y la librería grande lo renueva sola. Esto no.
     · Subir archivos.
     · Escuchar cambios en vivo.

   Por eso «Info útil», «Mi año», «Perfil» y el panel siguen con
   la librería grande: las dos primeras guardan cosas de la
   persona que inició sesión, y una sesión que no se renueva falla
   EN SILENCIO. Eso es lo peor que puede pasar, así que acá no se
   agrega a medias: la pantalla que necesite sesión usa la grande.

   Cualquier método que no esté implementado TIRA UN ERROR con
   nombre y apellido, en vez de devolver `undefined` y romper tres
   pantallas más adelante.
   ============================================================ */
(function(){
  'use strict';

  function crearCliente(url, clave){
    var raiz = String(url).replace(/\/+$/, '') + '/rest/v1/';
    var cabeceras = {
      apikey: clave,
      Authorization: 'Bearer ' + clave,
      Accept: 'application/json'
    };

    /* Todo lo que sale de acá tiene la forma {data, error}, que es
       la que espera toda la app. Nunca tira una excepción: si no
       hay red, el error viaja adentro del objeto, como cuando lo
       devolvía la librería grande. */
    function pedir(camino, opciones){
      return fetch(raiz + camino, opciones).then(function(r){
        return r.text().then(function(texto){
          var cuerpo = null;
          if (texto) { try { cuerpo = JSON.parse(texto); } catch(e){ cuerpo = null; } }
          if (!r.ok){
            return { data:null, error:{
              message: (cuerpo && (cuerpo.message || cuerpo.hint)) || ('Error ' + r.status),
              code:    (cuerpo && cuerpo.code) || String(r.status),
              details: (cuerpo && cuerpo.details) || null
            }};
          }
          return { data: cuerpo, error:null };
        });
      }).catch(function(e){
        return { data:null, error:{
          message: 'No se pudo conectar con la base. ' + (e && e.message ? e.message : ''),
          code: 'sin-red', details: null
        }};
      });
    }

    /* El guardia: si una pantalla llama a algo que acá no está,
       que se entere ahora y con un mensaje que diga qué hacer. */
    function guardia(objeto, donde){
      if (typeof Proxy !== 'function') return objeto;
      return new Proxy(objeto, {
        get: function(destino, prop){
          if (typeof prop === 'symbol' || (prop in destino)) return destino[prop];
          throw new Error(
            'El cliente chico de datos no tiene «' + String(prop) + '» ' + donde + '. ' +
            'O se agrega en lib/datos.js, o esta pantalla vuelve a lib/supabase.js.');
        }
      });
    }

    function consulta(tabla){
      var filtros = [], ordenes = [];
      var columnas = '*', tope = null, unaSola = false;
      var atado;

      function direccion(){
        var p = ['select=' + encodeURIComponent(columnas)].concat(filtros);
        if (ordenes.length) p.push('order=' + ordenes.join(','));
        if (tope !== null)  p.push('limit=' + tope);
        return tabla + '?' + p.join('&');
      }

      var q = {
        select: function(c){ columnas = c || '*'; return atado; },

        eq: function(col, val){
          filtros.push(encodeURIComponent(col) + '=eq.' + encodeURIComponent(val));
          return atado;
        },

        /* Se puede encadenar: .order('materia').order('orden') sale
           como order=materia.asc,orden.asc, que es como lo entiende
           PostgREST. El orden en que se llaman es el que vale. */
        order: function(col, o){
          ordenes.push(encodeURIComponent(col) + '.' +
            (o && o.ascending === false ? 'desc' : 'asc'));
          return atado;
        },

        limit: function(n){ tope = n; return atado; },

        /* Devuelve el objeto o null, nunca una lista de uno. */
        maybeSingle: function(){ unaSola = true; return atado; },

        insert: function(fila){
          /* `return=minimal` no es un detalle de estilo: sin cuenta
             NO se puede LEER la tabla `consultas`, así que pedirle a
             la base que devuelva la fila recién insertada haría
             fallar el insert entero. */
          return pedir(tabla, {
            method: 'POST',
            headers: Object.assign({}, cabeceras, {
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            }),
            body: JSON.stringify(Array.isArray(fila) ? fila : [fila])
          });
        },

        /* Esto es lo que hace que `await db.from(...)` funcione. */
        then: function(cumplir, fallar){
          return pedir(direccion(), { headers: cabeceras }).then(function(r){
            if (r.error) return r;
            var d = r.data;
            if (unaSola) d = (Array.isArray(d) && d.length) ? d[0] : null;
            return { data: d, error: null };
          }).then(cumplir, fallar);
        }
      };

      atado = guardia(q, 'para leer una tabla');
      return atado;
    }

    return guardia({
      from: function(tabla){ return consulta(tabla); },
      rpc: function(nombre, argumentos){
        return pedir('rpc/' + nombre, {
          method: 'POST',
          headers: Object.assign({}, cabeceras, { 'Content-Type': 'application/json' }),
          body: JSON.stringify(argumentos || {})
        });
      }
    }, 'en el cliente');
  }

  window.datosBolivar = { crearCliente: crearCliente };
})();
