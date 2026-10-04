/* ============================================================
   LAS MARCAS DEL ARSENAL: «Para el finde» y «Me sirvió» (30/9/2026)

   Viven SOLO en este teléfono, en localStorage, y es a propósito: la
   app se usa entera sin cuenta, y marcar un libro para el sábado no
   puede ser la excusa para pedir una. Lo que se marca acá no viaja a
   ningún lado y no lo ve nadie más.

   Es un gestor chico, sin librería, pensado como un «hook»:

     const marcas = crearMarcas('bolivar-arsenal', ['finde', 'sirvio']);
     marcas.tiene('finde', id)       ¿está marcado?
     marcas.alternar('finde', id)    lo marca o lo desmarca; devuelve cómo quedó
     marcas.lista('finde')           los ids, el último marcado primero
     marcas.alCambiar(fn)            avisa cada cambio, también los de otra pestaña;
                                     devuelve la función para dejar de escuchar
     marcas.seGuarda()               false si el navegador no deja guardar

   CÓMO SE GUARDA. Una sola llave, con la versión adentro:
     { "v":1, "finde": { "<id>": <cuándo> }, "sirvio": { "<id>": <cuándo> } }
   «Cuándo» es la hora en milisegundos: sirve para ordenar la lista del
   finde con lo último arriba, que es lo que se busca primero.

   SE GUARDA EL ID, NO EL MATERIAL. Si alguien de la agrupación corrige
   el título o el link en datos.json, lo guardado muestra lo corregido.
   Y si un material se saca del JSON, su marca queda dormida acá sin
   molestar: si vuelve, vuelve marcado. Por eso el `id` de un material
   no se cambia nunca (ver COMO-SUMAR.md).

   SI EL NAVEGADOR NO DEJA GUARDAR (Safari en modo privado viejo, la
   memoria llena), la marca igual se ve durante la visita —se lleva en
   memoria— y `seGuarda()` pasa a false para que la pantalla lo diga.
   Mentir que quedó guardado es peor que decir que no se pudo.
   ============================================================ */
function crearMarcas(clave, tipos){
  const oyentes = new Set();
  let sePuedeGuardar = true;

  function vacio(){
    const e = { v: 1 };
    tipos.forEach(t => { e[t] = {}; });
    return e;
  }

  /* Se lee con desconfianza: lo guardado lo pudo tocar una versión
     vieja de la pantalla, una extensión o alguien a mano desde la
     consola. Se rescata lo que tenga forma de marca y se tira el resto,
     en vez de romper la pantalla por una llave rara. */
  function leer(){
    const e = vacio();
    let g = null;
    try { g = JSON.parse(localStorage.getItem(clave) || 'null'); }
    catch(err){ return e; }
    if (!g || typeof g !== 'object') return e;
    tipos.forEach(t => {
      const m = g[t];
      if (!m || typeof m !== 'object' || Array.isArray(m)) return;
      Object.keys(m).forEach(id => {
        const cuando = Number(m[id]);
        if (id && isFinite(cuando)) e[t][id] = cuando;
      });
    });
    return e;
  }

  function escribir(){
    try {
      localStorage.setItem(clave, JSON.stringify(estado));
      sePuedeGuardar = true;
    } catch(err){
      sePuedeGuardar = false;
    }
  }

  function avisar(cambio){
    oyentes.forEach(fn => {
      /* Un oyente que falla no les corta el aviso a los demás. */
      try { fn(cambio); } catch(err){ console.error(err); }
    });
  }

  let estado = leer();

  /* Otra pestaña con el Arsenal abierto marcó algo: `storage` llega
     solo a las OTRAS pestañas, nunca a la que escribió. La llave en
     null es un `localStorage.clear()`: también cuenta. */
  window.addEventListener('storage', ev => {
    if (ev.key !== null && ev.key !== clave) return;
    estado = leer();
    avisar({ deOtraPestana: true });
  });

  function tiene(tipo, id){
    return !!(estado[tipo] && estado[tipo][id]);
  }

  function poner(tipo, id, marcado){
    if (!estado[tipo] || !id) return false;
    if (marcado === tiene(tipo, id)) return marcado;
    if (marcado) estado[tipo][id] = Date.now();
    else delete estado[tipo][id];
    escribir();
    avisar({ tipo, id, marcado, guardado: sePuedeGuardar });
    return marcado;
  }

  return {
    tiene,
    poner,
    alternar: (tipo, id) => poner(tipo, id, !tiene(tipo, id)),
    lista: tipo => Object.keys(estado[tipo] || {})
      .sort((a, b) => estado[tipo][b] - estado[tipo][a]),
    alCambiar(fn){
      oyentes.add(fn);
      return () => oyentes.delete(fn);
    },
    seGuarda: () => sePuedeGuardar
  };
}
