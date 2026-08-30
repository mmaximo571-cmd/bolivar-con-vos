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
  const quieto = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (quieto || !('IntersectionObserver' in window)){
    piezas.forEach(p => p.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      /* Una vez que apareció, se deja de mirar: la pieza ya hizo su
         trabajo y no tiene que volver a desaparecer al subir. */
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  piezas.forEach(p => observador.observe(p));
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
