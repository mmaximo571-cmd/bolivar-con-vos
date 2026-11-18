# El esqueleto de una pantalla

Lo citan los prompts de cada pantalla. Todas las pantallas empiezan
igual; lo que cambia es el `<main>` y, si tiene, su hoja propia.

Referencia: `glosario/index.html` de la Bolívar, las primeras 60 líneas
y las últimas 25.

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NOMBRE DE LA PANTALLA · NOMBRE DE LA APP</title>
<meta name="description" content="Qué hay acá, en una oración, para Google.">
<meta name="theme-color" content="COLOR DE MARCA">

<!-- Las fuentes: solo las familias y pesos que el CSS usa de verdad.
     Cada peso de más es un archivo que no se comprime. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=…&display=swap" rel="stylesheet">

<link rel="icon" type="image/png" sizes="32x32" href="../imagenes/icono-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="../imagenes/icono-192.png">
<link rel="apple-touch-icon" href="../imagenes/icono-apple.png">
<link rel="manifest" href="../manifest.json">

<!-- Cómo se ve cuando alguien comparte el link por WhatsApp o Instagram -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="NOMBRE DE LA APP">
<meta property="og:title" content="NOMBRE DE LA PANTALLA · NOMBRE DE LA APP">
<meta property="og:description" content="…">
<meta property="og:image" content="https://DOMINIO/imagenes/compartir.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="../css/base/01-cimientos.css">
<!-- … 02 a 12, en orden … -->
<link rel="stylesheet" href="../css/base/12-movimiento.css">
<!-- <link rel="stylesheet" href="../css/pantallas/SU-HOJA.css"> si tiene -->

<!-- EL TEMA, ANTES DE DIBUJAR NADA. Acá y no en app.js: app.js carga
     al final del cuerpo y la pantalla arrancaría clara y saltaría. -->
<script>
(function(){try{
  var g = localStorage.getItem('PREFIJO-tema') || 'auto';
  var oscuro = g === 'oscuro' || (g === 'auto' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro';
}catch(e){ document.documentElement.dataset.tema = 'claro'; }})();
</script>
</head>
<body>

<!-- app.js dibuja acá la cabecera, y adelante de todo el enlace
     «Saltar al contenido» (en la Bolívar, htmlCabecera()). -->
<div id="cabecera"></div>

<main id="contenido" class="envoltura">
  <h1 class="titulo-pantalla">NOMBRE DE LA PANTALLA</h1>
  <p class="bajada">Para qué sirve, en una oración.</p>
  <!-- … -->
</main>

<script>window.RAIZ = '../';</script>
<script src="../config.js"></script>
<script src="../lib/datos.js"></script>   <!-- o lib/supabase.js si hay cuenta -->
<script src="../iconos.js"></script>
<script src="../app.js"></script>
<script>
  /* Lo propio de esta pantalla */
</script>
</body>
</html>
```

**El nombre de la pantalla es el mismo en cuatro lugares:** la entrada
en `SECCIONES` de `app.js`, el `<title>`, el `og:title` y el `<h1>`.

**Al agregar una pantalla nueva:** sumarla al índice del pie
(`INDICE_PIE` en `app.js`), al buscador si corresponde, y darle al
menos dos puertas de entrada desde otras pantallas.
