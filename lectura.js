/* ============================================================
   LA APARICIÓN AL DESPLAZAR

   Lo usan las dos pantallas que se leen: «¿Quiénes somos?» y «El
   Consejo Directivo».

   POR QUÉ ASÍ Y NO CON UNA LIBRERÍA. Esto son veinte renglones y cero
   descargas. Las librerías de animación al desplazar pesan entre 15 y
   60 KB y suelen escuchar el evento de scroll, que se dispara decenas
   de veces por segundo. El IntersectionObserver lo hace el navegador
   por su cuenta y avisa una sola vez.

   Y solo se animan DOS propiedades: opacity y transform. Son las dos
   que la placa de video resuelve sola, sin obligar al teléfono a
   recalcular la página en cada cuadro. Animar altura, márgenes o top
   es lo que hace que una pantalla se trabe en un celular viejo.
   ============================================================ */
function vigilarAparicion(){
  const piezas = document.querySelectorAll('.aparece');
  if (!piezas.length) return;

  /* Quien pidió menos movimiento ve todo en su lugar, sin transición.
     El CSS ya lo contempla; esto evita además el trabajo del observador. */
  if (!('IntersectionObserver' in window)){
    piezas.forEach(p => p.classList.add('visible'));
    return;
  }

  /* EL ESCALONADO SE CALCULA ACÁ Y NO EN EL CSS.

     Antes eran tres reglas con :nth-child(2), (3) y (4). El problema es
     que :nth-child cuenta TODOS los hermanos, no solo los que se
     animan: en la pantalla del Consejo los .aparece están intercalados
     con elementos que no lo son, así que el retardo de «segundo» le
     tocaba a una pieza que en la lista de aparecidos era la quinta. Y
     de la cuarta en adelante ninguna tenía retardo, o sea que la quinta
     salía junto con la primera y el escalonado se cortaba a la mitad.

     Acá se cuenta lo que hay que contar: las piezas que entran JUNTAS,
     en la misma pantallada. El contador se reinicia cuando pasa un rato
     sin que aparezca nada nuevo, porque dos piezas que se ven con diez
     segundos de diferencia no son un grupo: la segunda tiene que salir
     enseguida, no esperar su turno en una fila que arrancó hace rato.

     70 ms entre una y otra. Más que eso y la última se siente
     abandonada; menos, y no se lee como orden sino como ruido. Tope de
     tres pasos: nadie percibe el cuarto y sí percibe la espera. */
  const PASO = 70, TOPE = 3, CORTE = 400;
  let enTanda = 0, ultima = -Infinity;

  const observador = new IntersectionObserver((entradas, obs) => {
    /* Ordenadas como están en la página, no como las trajo el
       observador: si no, el escalonado puede ir de abajo hacia arriba. */
    const llegan = entradas
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!llegan.length) return;

    const ahora = performance.now();
    if (ahora - ultima > CORTE) enTanda = 0;
    ultima = ahora;

    llegan.forEach(e => {
      const espera = Math.min(enTanda, TOPE) * PASO;
      if (espera) e.target.style.transitionDelay = espera + 'ms';
      e.target.classList.add('visible');
      enTanda++;
      /* Una vez que apareció, se deja de mirar: la pieza ya hizo su
         trabajo y no tiene que volver a desaparecer al subir. */
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  piezas.forEach(p => observador.observe(p));

  /* RED DE SEGURIDAD: QUE NUNCA QUEDE LA PANTALLA EN BLANCO.

     Todo el texto de «¿Quiénes somos?» y del Consejo arranca en
     opacidad cero y depende de que el observador avise. Casi siempre
     avisa. Pero el observador necesita que el navegador esté DIBUJANDO
     la página, y hay situaciones donde no dibuja: una pestaña abierta
     en segundo plano que nunca se trae al frente, un teléfono que
     descarta la pestaña por memoria y la restaura, un navegador viejo
     con el observador a medias. En cualquiera de esos casos la pantalla
     no se veía «sin animación»: se veía VACÍA. Dos pantallas enteras de
     texto que no existen.

     Un párrafo que no aparece es infinitamente peor que un párrafo que
     aparece sin gracia. Así que al segundo y medio, si el observador no
     reportó ni una sola pieza, se muestran todas de una y se corta el
     asunto. Cuando el observador funciona —que es lo normal— este
     temporizador no hace nada, porque para entonces ya hay piezas
     visibles. */
  setTimeout(() => {
    if (document.querySelector('.aparece.visible')) return;
    piezas.forEach(p => { p.style.transitionDelay = '0s'; p.classList.add('visible'); });
  }, 1500);
}

/* ============================================================
   EL TITULAR

   Lo escribe la agrupación desde el panel, así que necesita una forma
   de decir dónde corta el renglón y qué palabra va resaltada sin tener
   que escribir HTML:

     Esta app es|la parte *chica*

   La barra corta el renglón. Lo que va entre asteriscos sale en el
   color de acento. Todo lo demás se escapa, así que aunque alguien
   pegue una etiqueta HTML no pasa nada.
   ============================================================ */
function titularHTML(texto){
  return esc(String(texto || ''))
    .split('|')
    .map(linea => linea.replace(/\*([^*]+)\*/g, '<em>$1</em>'))
    .join('<br>');
}

/* ============================================================
   LA FOTO DE UN BLOQUE

   Hay dos formas de que una foto llegue a estas pantallas:

     · subida desde el panel, que queda en el depósito de Supabase y
       trae la dirección entera en «url». Es la forma de ahora.
     · dejada a mano en la carpeta /imagenes/, que trae solo el nombre
       del archivo. Quedan las viejas andando.

   Devuelve la dirección o cadena vacía si ese bloque no tiene foto.
   ============================================================ */
function fotoDe(img, raiz){
  if (!img) return '';
  if (img.url && /^https?:\/\//i.test(img.url)) return img.url;
  if (img.archivo) return (raiz || '../') + 'imagenes/' + img.archivo;
  return '';
}
