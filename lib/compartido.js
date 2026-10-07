/* ============================================================
   LO QUE LLEGÓ POR «COMPARTIR»  ·  7/10/2026

   Con la app instalada en Android, «La Bolívar» aparece en el menú
   Compartir del teléfono (`share_target` en manifest.json). Lo que se
   comparte —un mensaje de WhatsApp, una placa de la galería— llega
   como un POST a `/compartir`, que ningún servidor atiende: lo ataja
   `sw.js`, lo guarda en la caja `bolivar-compartido` y manda a
   `cargar/?compartido=1`. Esto es lo que las pantallas usan para
   leerlo de ahí.

   Se guarda en una caja y no en la dirección porque una placa no
   entra en una dirección, y porque si hay que entrar con la cuenta
   primero, la recarga del inicio de sesión no lo tiene que perder.

   `leerCompartido()` devuelve `{ texto, placa }` (placa es un File o
   null) o null si no hay nada; `olvidarCompartido()` lo borra. Lo que
   tenga más de media hora no cuenta: es de otro compartir que quedó
   sin usar, y aparecer con eso cargado confundiría.
   ============================================================ */
(function(){
  const CAJA = 'bolivar-compartido';
  const VIGENCIA = 30 * 60 * 1000;

  async function leerCompartido(){
    if (!('caches' in window)) return null;
    try {
      const caja = await caches.open(CAJA);
      const rTexto = await caja.match('/compartido/texto');
      if (!rTexto) return null;
      if (Date.now() - Number(rTexto.headers.get('X-Cuando') || 0) > VIGENCIA){
        await olvidarCompartido();
        return null;
      }
      const texto = (await rTexto.text()).trim();
      const rPlaca = await caja.match('/compartido/placa');
      const placa = rPlaca
        ? new File([await rPlaca.blob()], 'placa', { type: rPlaca.headers.get('Content-Type') || 'image/jpeg' })
        : null;
      return (texto || placa) ? { texto, placa } : null;
    } catch(e){ return null; }
  }

  async function olvidarCompartido(){
    try { await caches.delete(CAJA); } catch(e){}
  }

  /* Saca `?compartido=1` de la dirección: recargar la pantalla después
     no tiene que volver a buscar lo compartido. */
  function limpiarDireccion(){
    const u = new URL(location.href);
    if (!u.searchParams.has('compartido')) return;
    u.searchParams.delete('compartido');
    history.replaceState(null, '', u);
  }

  window.leerCompartido = leerCompartido;
  window.olvidarCompartido = olvidarCompartido;
  window.limpiarDireccionCompartido = limpiarDireccion;
  window.vinoCompartido = () => new URLSearchParams(location.search).has('compartido');
})();
