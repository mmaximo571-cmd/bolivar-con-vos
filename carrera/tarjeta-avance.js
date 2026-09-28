/* ============================================================
   LA TARJETA PARA HISTORIAS  ·  «voy X de Y materias»

   Arma una imagen de 1080x1920 —la medida de una historia de
   Instagram— con el avance de la carrera, y la comparte con
   `navigator.share`. Donde compartir no exista, la baja como archivo
   y la persona la sube a mano.

   POR QUÉ EXISTE. Es la única pieza de alcance que es código: cada
   estudiante que comparte su avance hace circular LA HERRAMIENTA, no
   a la agrupación. Lo que se ve es «voy 12 de 31» y la dirección de
   la app; el logo va chico abajo. Si pareciera una placa de campaña,
   nadie la sube.

   TRES REGLAS QUE VIENEN DE CÓMO FALLA ESTO EN UN TELÉFONO

   1. LA TIPOGRAFÍA SE ESPERA. Un canvas dibuja con la fuente que
      tiene en ese instante: si Archivo Black todavía está bajando,
      sale todo en la fuente de sistema y la tarjeta no es de la app.
      Se espera con `document.fonts.load`, y si no llega en dos
      segundos se dibuja igual con la de sistema: una tarjeta con otra
      tipografía es mejor que un botón que no hace nada.

   2. EL NÚMERO MANDA SOBRE EL TAMAÑO. «voy 8 de 9» y «voy 12 de 42»
      no miden lo mismo, y el texto no puede irse del borde: el cuerpo
      se calcula midiendo con `measureText` y bajando el tamaño hasta
      que entre.

   3. `navigator.share` CON ARCHIVOS NO ESTÁ EN TODAS PARTES. Se
      pregunta con `canShare({files})`, que es lo único que dice la
      verdad: hay navegadores con `share` y sin archivos. Si no se
      puede, se descarga.

   No usa ninguna librería: es `canvas` y nada más.
   ============================================================ */
(function(){
  'use strict';

  var ANCHO = 1080, ALTO = 1920;

  /* Los colores de marca, los mismos de `css/tokens.css`. Van escritos y
     no leídos del CSS a propósito: la tarjeta es siempre la misma, de
     día y de noche, porque termina en la historia de alguien y no en
     la pantalla de la app. */
  var TINTA    = '#1A1A1A';
  var AMARILLO = '#F9E830';
  var CELESTE  = '#0195B1';
  var PAPEL    = '#FDF9C5';

  var TITULO = '"Archivo Black", "Arial Black", system-ui, sans-serif';
  var TEXTO  = 'Roboto, system-ui, sans-serif';

  var LINK = 'https://labolivarconvos.ar/?de=historia-avance';

  /* ------------------------------------------------------------
     Esperar la tipografía. `document.fonts` no está en navegadores
     viejos: ahí se sigue de largo.
     ------------------------------------------------------------ */
  function esperarLaFuente(){
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var cargas = Promise.all([
      document.fonts.load('400 160px "Archivo Black"'),
      document.fonts.load('700 40px Roboto')
    ]);
    return Promise.race([
      cargas,
      new Promise(function(listo){ setTimeout(listo, 2000); })
    ]).catch(function(){});
  }

  /* El tamaño más grande con el que el texto entra en `limite`. La
     fuente puede venir con peso adelante: si trae `%%`, ahí va el
     tamaño (`'700 %% Roboto'`); si no, se arma como `Npx familia`. */
  function tamanoQueEntra(ctx, texto, fuente, desde, hasta, limite){
    var paso = Math.max(2, Math.round((desde - hasta) / 40));
    for (var t = desde; t > hasta; t -= paso){
      ctx.font = fuente.indexOf('%%') >= 0
        ? fuente.replace('%%', t + 'px')
        : t + 'px ' + fuente;
      if (ctx.measureText(texto).width <= limite) return t;
    }
    return hasta;
  }

  /* La trama de puntos del fondo de la app (`fondo-red.js`), quieta.
     Es lo que hace que la tarjeta se vea de acá y no de una plantilla. */
  function tramaDePuntos(ctx){
    ctx.fillStyle = 'rgba(249, 232, 48, 0.13)';
    for (var y = 70; y < ALTO; y += 38){
      for (var x = 70; x < ANCHO; x += 38){
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ------------------------------------------------------------
     DIBUJAR

     `datos` = { aprobadas, total, carrera, cursando, cursadas }
     ------------------------------------------------------------ */
  function dibujar(lienzo, datos){
    var ctx = lienzo.getContext('2d');
    var margen = 96, anchoUtil = ANCHO - margen * 2;

    lienzo.width = ANCHO; lienzo.height = ALTO;

    ctx.fillStyle = TINTA;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    tramaDePuntos(ctx);

    /* La ceja de arriba. El espaciado se pone ANTES de medir: en los
       navegadores que lo soportan, `measureText` lo cuenta, y medir sin
       él daba un nombre de carrera que se iba del borde. */
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = AMARILLO;
    ctx.letterSpacing = '4px';
    var ceja = (datos.carrera || 'Mi carrera').toUpperCase();
    var tCeja = tamanoQueEntra(ctx, ceja, '700 %% ' + TEXTO, 34, 18, anchoUtil);
    ctx.font = '700 ' + tCeja + 'px ' + TEXTO;
    ctx.fillText(ceja, margen, 300);
    ctx.letterSpacing = '0px';

    /* EL NÚMERO, que es de lo que se trata la tarjeta */
    var voy = 'VOY ' + datos.aprobadas;
    var de  = 'DE ' + datos.total;

    /* LAS DOS LÍNEAS MIDEN LO MISMO. Medidas por separado, «VOY 8» y
       «DE 42» salían de distinto tamaño —una tipografía distinta por
       renglón— y el segundo renglón, calculado con el alto del
       primero, se le subía encima. Manda la más chica de las dos. */
    var cuerpo = Math.min(
      tamanoQueEntra(ctx, voy, TITULO, 260, 120, anchoUtil),
      tamanoQueEntra(ctx, de,  TITULO, 260, 120, anchoUtil));

    ctx.fillStyle = PAPEL;
    ctx.font = cuerpo + 'px ' + TITULO;
    ctx.fillText(voy, margen, 560);

    ctx.fillStyle = AMARILLO;
    ctx.fillText(de, margen, 560 + cuerpo * 0.95);

    ctx.fillStyle = PAPEL;
    ctx.font = '700 56px ' + TEXTO;
    ctx.fillText('materias aprobadas', margen, 560 + cuerpo * 0.95 + 110);

    /* La barra, que es el mismo dibujo que la de la app */
    var y = 560 + cuerpo * 0.95 + 210;
    var pct = datos.total ? datos.aprobadas / datos.total : 0;
    ctx.fillStyle = 'rgba(253, 249, 197, 0.22)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(margen, y, anchoUtil, 26, 13);
    else ctx.rect(margen, y, anchoUtil, 26);
    ctx.fill();

    ctx.fillStyle = AMARILLO;
    ctx.beginPath();
    var largo = Math.max(26, anchoUtil * pct);
    if (ctx.roundRect) ctx.roundRect(margen, y, largo, 26, 13);
    else ctx.rect(margen, y, largo, 26);
    ctx.fill();

    ctx.fillStyle = PAPEL;
    ctx.font = '400 40px ' + TEXTO;
    ctx.fillText(Math.round(pct * 100) + '% de la carrera', margen, y + 86);

    /* Lo que está en curso, solo si hay algo que decir. Un renglón con
       un cero adentro ocupa lo mismo que uno con información. */
    var abajo = y + 170;
    if (datos.cursando){
      ctx.fillStyle = CELESTE;
      ctx.font = '700 40px ' + TEXTO;
      ctx.fillText('+ ' + datos.cursando +
        (datos.cursando === 1 ? ' cursando ahora' : ' cursando ahora'), margen, abajo);
      abajo += 62;
    }
    if (datos.cursadas){
      ctx.fillStyle = CELESTE;
      ctx.font = '700 40px ' + TEXTO;
      ctx.fillText('+ ' + datos.cursadas +
        (datos.cursadas === 1 ? ' esperando el final' : ' esperando el final'), margen, abajo);
    }

    /* El pie: la marca chica y la dirección, que es para qué se
       comparte. La dirección se lee sola, sin el `?de=`, que viaja en
       el texto de lo compartido y no dibujado. */
    ctx.fillStyle = AMARILLO;
    ctx.font = '120px ' + TITULO;
    var tMarca = tamanoQueEntra(ctx, 'LA BOLÍVAR', TITULO, 120, 60, anchoUtil);
    ctx.font = tMarca + 'px ' + TITULO;
    ctx.fillText('LA BOLÍVAR', margen, ALTO - 300);
    ctx.fillStyle = PAPEL;
    ctx.fillText('CON VOS', margen, ALTO - 300 + tMarca * 0.95);

    ctx.fillStyle = AMARILLO;
    ctx.font = '700 44px ' + TEXTO;
    ctx.fillText('labolivarconvos.ar', margen, ALTO - 130);

    ctx.fillStyle = 'rgba(253, 249, 197, 0.65)';
    ctx.font = '400 34px ' + TEXTO;
    ctx.fillText('Tu carrera, materia por materia', margen, ALTO - 78);

    return lienzo;
  }

  /* ------------------------------------------------------------
     COMPARTIR

     Devuelve cómo salió, para que quien la llama tenga algo que
     decirle a la persona: 'compartida', 'descargada' o 'no-se-pudo'.
     ------------------------------------------------------------ */
  function aBlob(lienzo){
    return new Promise(function(listo){
      if (lienzo.toBlob) lienzo.toBlob(listo, 'image/png');
      else listo(null);
    });
  }

  async function compartir(datos){
    var lienzo = document.createElement('canvas');
    await esperarLaFuente();
    dibujar(lienzo, datos);

    var blob = await aBlob(lienzo);
    if (!blob) return 'no-se-pudo';

    var nombre = 'mi-avance-' + datos.aprobadas + '-de-' + datos.total + '.png';
    var texto = 'Voy ' + datos.aprobadas + ' de ' + datos.total + ' materias. ' + LINK;

    /* `canShare({files})` es la única pregunta que sirve: hay
       navegadores con `share` que no aceptan archivos, y ahí `share`
       tira un error después de que la persona tocó el botón. */
    try {
      if (navigator.canShare && navigator.share){
        var archivo = new File([blob], nombre, { type:'image/png' });
        if (navigator.canShare({ files:[archivo] })){
          await navigator.share({ files:[archivo], text: texto });
          return 'compartida';
        }
      }
    } catch(e){
      /* Si la persona cierra el menú de compartir, el navegador tira
         `AbortError`. No es un error que haya que contarle: ya sabe
         que lo cerró. */
      if (e && e.name === 'AbortError') return 'compartida';
    }

    try {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      return 'descargada';
    } catch(e){ return 'no-se-pudo'; }
  }

  window.tarjetaDeAvance = { dibujar: dibujar, compartir: compartir, medida: [ANCHO, ALTO] };
})();
