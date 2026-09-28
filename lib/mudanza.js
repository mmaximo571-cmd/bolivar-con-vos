/* ============================================================
   LA BOLIVAR CON VOS · LA MUDANZA A labolivarconvos.ar

   Vivia arriba de app.js. Salio aca el 27/9/2026: son 130 lineas que
   no dependen de nada del resto de la app y que ya casi nadie ejecuta
   —solo quien llegue todavia por la direccion vieja—, pero estaban en
   lo primero que uno abre cada vez que toca app.js.

   Se carga ANTES de app.js, como estaba: se ejecuta sola al leerse y
   tiene que decidir la mudanza antes de que arranque la app.
   ============================================================ */

/* ------------------------------------------------------------
   LA MUDANZA A labolivarconvos.ar (18/9/2026)

   Hay redes —la de un proveedor entero, a veces— que bloquean todo
   lo que termina en `.vercel.app`: la app aparecía «sin conexión» y
   con los logos rotos. Por eso la dirección pasó a ser nuestra.

   El problema de mudarse: el teléfono guarda lo de cada dirección por
   separado. Para el navegador, labolivarconvos.ar es OTRA app, y
   quien llegara ahí de golpe no tendría su plan marcado, ni su
   carrera, ni el código de respaldo. Así que la dirección vieja no
   redirige a secas: primero empaqueta lo guardado y lo lleva.

   · Viaja en el # del link, que nunca sale del teléfono: ni Vercel ni
     nadie en el medio lo ve.
   · NO viaja la sesión de la cuenta (esa se vuelve a iniciar), ni las
     copias de pantallas (`bolivar-guardado-*`, se rehacen solas), ni
     el «ya te invitamos a instalarla»: justamente hay que instalarla
     de nuevo, desde la dirección nueva.
   · Del otro lado solo se escribe lo que NO existe todavía: si alguien
     ya usó la dirección nueva, lo de ella gana.
   · Se recibe UNA vez, y solo si la visita viene de la dirección vieja.
     Esto es lo importante: el código de respaldo es la llave de la
     copia en el servidor. Si cualquier link pudiera traer datos,
     alguien podría plantarle a otra persona SU código, y el plan de
     esa persona se respaldaría en la cuenta de quien armó el link. El
     referrer de una redirección no lo puede falsificar un tercero.
   · Antes de irse, se prueba que la dirección nueva conteste. Si no
     —DNS todavía sin propagar, sin señal—, la persona se queda acá
     con la app andando, y se prueba de nuevo en la próxima pantalla.
   ------------------------------------------------------------ */
const DOMINIO_VIEJO = 'bolivar-con-vos.vercel.app';
const DOMINIO_NUEVO = 'labolivarconvos.ar';
const LLAVE_MUDANZA = 'bolivar-mudanza-recibida';

function seMuda(k){
  return !!k && k.indexOf('bolivar-') === 0 &&
    k.indexOf('bolivar-guardado-') !== 0 &&
    k !== 'bolivar-instalar-visto' && k !== LLAVE_MUDANZA;
}

/* base64 del JSON, con los tres caracteres que un link no quiere
   cambiados. El escape/unescape es para las tildes, que atob y btoa
   no entienden; anda en todos los Android viejos que abren esto. */
function empaquetar(obj){
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function desempaquetar(txt){
  const b = txt.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(escape(atob(b))));
}

(function mudarse(){
  if (location.hostname !== DOMINIO_VIEJO) return;

  const paquete = {};
  try {
    for (let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if (seMuda(k)) paquete[k] = localStorage.getItem(k);
    }
  } catch(e){}

  /* El # propio de la pantalla (#finales, #promocion) viaja aparte,
     para devolverlo tal cual del otro lado. */
  const destino = 'https://' + DOMINIO_NUEVO + location.pathname + location.search +
    '#mudanza=' + empaquetar(paquete) +
    (location.hash ? '&ir=' + encodeURIComponent(location.hash) : '');

  let listo = false;
  const tarde = setTimeout(function(){ listo = true; }, 6000);
  fetch('https://' + DOMINIO_NUEVO + '/imagenes/icono-32.png?mudanza=' + Date.now(),
        { mode:'no-cors', cache:'no-store' })
    .then(function(){
      clearTimeout(tarde);
      if (listo) return;             /* tardó demasiado: ya está leyendo */
      location.replace(destino);
    })
    .catch(function(){ clearTimeout(tarde); /* no contesta: se queda acá */ });
})();

(function recibirMudanza(){
  if (location.hash.indexOf('#mudanza=') !== 0) return;

  const partes = new URLSearchParams(location.hash.slice(1));
  const ir = partes.get('ir') || '';
  const vieneDeLaVieja = document.referrer.indexOf('https://' + DOMINIO_VIEJO + '/') === 0;

  try {
    if (location.hostname === DOMINIO_NUEVO && vieneDeLaVieja &&
        !localStorage.getItem(LLAVE_MUDANZA)){
      const paquete = desempaquetar(partes.get('mudanza') || '');
      Object.keys(paquete).forEach(function(k){
        if (seMuda(k) && typeof paquete[k] === 'string' && localStorage.getItem(k) === null)
          localStorage.setItem(k, paquete[k]);
      });
      localStorage.setItem(LLAVE_MUDANZA, new Date().toISOString());
      window.__recienMudada = true;
    }
  } catch(e){}

  /* Sacar el paquete de la barra de direcciones y del historial ANTES
     de que la pantalla lea el #: queda la dirección limpia, con su #
     original si tenía. */
  history.replaceState(null, '', location.pathname + location.search + ir);
  if (ir) window.addEventListener('load', function(){
    const destino = document.getElementById(decodeURIComponent(ir.slice(1)));
    if (destino) destino.scrollIntoView();
  });
  if (window.__recienMudada)
    document.addEventListener('DOMContentLoaded', pintarAvisoMudanza);
})();

function pintarAvisoMudanza(){
  const instalada = window.matchMedia &&
    window.matchMedia('(display-mode: standalone)').matches;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="aviso-mudanza" id="aviso-mudanza" role="status">
      <div class="aviso-mudanza-texto">
        <strong>Nos mudamos a labolivarconvos.ar</strong>
        <span>Trajimos lo que tenías guardado.${instalada ? '' :
          ' Si tenías la app en la pantalla de inicio, borrá el ícono viejo y volvé a agregarla desde acá.'}
          Si tenías cuenta, volvé a entrar.</span>
      </div>
      <button type="button" class="aviso-mudanza-cerrar" id="cerrar-aviso-mudanza"
              aria-label="Cerrar el aviso de la mudanza">✕</button>
    </div>`);
  document.getElementById('cerrar-aviso-mudanza').addEventListener('click', function(){
    const caja = document.getElementById('aviso-mudanza');
    if (caja) caja.remove();
  });
}
