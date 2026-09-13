# La Fonoteca: el prompt y las dos etapas

La cuarta herramienta de Estudiemos: **una pantalla donde el sonido se
escucha**. Hoy la app habla de sonido en las fichas —Acufenometría y
SISI— y lo explica **con esquemas dibujados**. No hay un solo archivo de
audio en todo el repositorio ni una línea de Web Audio: esto es lo
primero que va a sonar.

Decidido el 13/9, con Máximo:

| | |
|---|---|
| **Etapa 1 · para el 21** | **Solo tonos que genera el navegador.** Cero archivos, cero permisos, anda sin señal. Entre 5 y 10 sonidos, escritos en el HTML de la pantalla |
| **Etapa 2 · post-21** | Las voces y los casos clínicos, que son archivos grabados. La cátedra tiene una aplicación con material y **hay que preguntar si lo comparten**. Hasta que haya respuesta, esta etapa no se anuncia |

**La etapa 1 no promete la etapa 2.** Es la lección de la tarjeta
«Glosario universitario», que estuvo semanas prometiendo algo que no
existía: la pantalla dice lo que tiene. Si mañana hay voces, se agregan.

---

## Paso 1 · Para pegar en Claude Design

**Antes de esto va el bloque de `PROMPT-DISENO.md`**, el de «Para copiar
y pegar antes de cada pedido». Sin él vuelve React con Tailwind y hay que
traducirlo. Después, esto:

> Necesito **una pantalla sola**: la Fonoteca de una app de estudiantes
> de Fonoaudiología. Es una herramienta para **escuchar** los estímulos
> que se usan en la clínica, y todos los sonidos **los genera el
> navegador con la Web Audio API**: no hay ningún archivo de audio.
>
> **Los nueve sonidos**, en tres grupos:
>
> *Las frecuencias de la audiometría* — un tono puro por cada una:
> **250, 500, 1000, 2000, 4000 y 8000 Hz**. La de 1000 es la de
> referencia y la de 4000 es donde aparece la muesca del trauma
> acústico: las dos llevan esa línea escrita al lado.
>
> *El enmascaramiento* — **ruido blanco**, que es lo que se manda al
> oído que no se está midiendo.
>
> *El estímulo del SISI* — un **tono continuo de 1000 Hz** con **20
> pulsos breves de +1 dB**, en **4 series de 5**, uno cada 5 segundos.
> Este ya está explicado con un esquema en otra pantalla de la app
> (la ficha de Acufenometría y SISI): acá se escucha.
>
> *A qué se parece un acúfeno* — un tono agudo continuo alrededor de
> **4000 Hz** y, como segunda opción, un ruido de banda angosta. No es
> un estímulo de medición: está para que el estudiante **oiga lo que
> escucha su paciente**.
>
> **Cada sonido es una tarjeta** y cada tarjeta tiene cuatro cosas:
>
> 1. **El nombre** y la frecuencia o el dato duro.
> 2. **Un botón de reproducir grande**, que es lo que se toca con el
>    pulgar. Mientras suena, el botón dice que está sonando y cómo
>    parar: nada que empiece y no se pueda cortar.
> 3. **Una línea de qué es y para qué se usa.** En castellano, sin
>    jerga: «la frecuencia de referencia de la audiometría», no «1 kHz
>    tono puro».
> 4. **Un dibujo del sonido.** Una onda, un esquema, algo que se vea.
>    No es decoración: ver abajo.
>
> **Un control de volumen propio en la pantalla**, visible, que arranca
> bajo. Y arriba de todo, antes de la primera tarjeta, **un aviso**:
> que conviene usar auriculares, que el volumen arranca bajo a propósito
> y que no hay que subirlo de golpe.
>
> **Un modo «Reconocer»**, separado del catálogo y no mezclado con él:
> suena una frecuencia al azar y hay que decir cuál era, con la
> respuesta correcta y el por qué, como ya hacen las fichas de estudio
> de esta app. Del catálogo se entra por un botón; no arranca solo.
>
> Lo que **no** quiero: nada de celeste, ningún gráfico que se mueva
> solo, ningún reproductor que arranque al abrir la pantalla, y ningún
> texto que prometa voces o casos clínicos, porque todavía no existen.

## Paso 2 · Lo que no se negocia, y por qué

Esto no es estética: es lo que hace que la pantalla no haga daño y no
mienta. Va escrito acá para que no se pierda entre el diseño y el código.

### El volumen, primero

**Un tono puro de 4000 Hz a todo volumen en auriculares lastima.** La
fonoteca de una carrera de Fonoaudiología es el último lugar donde eso
puede pasar por descuido. Tres cosas, las tres obligatorias:

- **Arranca bajo.** La ganancia inicial es una fracción del máximo, no
  el máximo. El estudiante sube si quiere.
- **Entra y sale con rampa.** Un oscilador que arranca y para de golpe
  hace un *clic* —un transitorio de banda ancha— que es justamente lo
  peor para un oído y además suena a error. Una rampa corta al empezar
  y al terminar.
- **El aviso va antes**, no después del primer tono. Es la misma regla
  que el aviso de «abrilo en el navegador» del plan impreso: se muestra
  **antes** de que el botón se quede mudo, no después.

### Una herramienta de sonido tiene que servir sin sonido

Lo dice la carrera: entre los estudiantes de Fonoaudiología hay gente
con hipoacusia, y va a ser de las primeras en abrir esta pantalla. **Una
tarjeta que solo suena, para esa persona está vacía.** Entonces cada
sonido lleva, siempre:

- **su dibujo** —la onda, el esquema de los pulsos del SISI—, que es
  información y no adorno;
- **su descripción escrita**, que diga cómo es: «agudo, parecido a un
  silbido», «un siseo parejo, como una radio sin señal»;
- **el dato duro a la vista**: la frecuencia en Hz, la cantidad de
  pulsos, la duración.

El modo «Reconocer» es el único que no se puede hacer sin oír, y está
bien: es un ejercicio de oído. Por eso va **separado** del catálogo y no
es la puerta de entrada.

### El navegador de Instagram

Es el navegador real de esta app: el 21 entra casi todo el mundo por
ahí. Dos cosas que ahí se rompen:

- **El sonido no arranca solo.** Los navegadores no dejan que una página
  haga ruido sin que la persona toque algo. Eso no es un problema, es la
  forma: **el `AudioContext` se crea recién cuando se toca el primer
  botón**, no cuando carga la pantalla. Si se crea antes, queda
  suspendido y el primer toque no suena: el clásico «toqué y no pasó
  nada».
- **Si el teléfono está en silencio, igual no suena.** En iPhone sobre
  todo. No hay forma de detectarlo desde la página, así que el aviso de
  arriba lo dice: «si no escuchás nada, mirá el switch de silencio».

### Dónde vive, y qué no toca

- **Pantalla nueva: `estudiemos/fonoteca/`.** Como `glosario/`: el
  contenido va en el HTML de la pantalla, se lee sin señal, y para
  cambiar algo se edita ese archivo.
- **No toca `app.js` ni `estilos.css`.** Por eso **no hace falta subir
  la versión del service worker**: las pantallas se sirven red primero.
  Si termina necesitando estilos en la hoja general, entonces sí, y se
  anota igual que los demás.
- **Y falta decidir una cosa.** Estudiemos tiene **tres** herramientas en
  superficie, y que sean tres fue una decisión del 5/9, no un accidente:
  el amarillo quedó para una sola cosa abajo. Una cuarta tarjeta cambia
  esa fila. Las dos salidas son: cuarta herramienta, o puerta desde
  «Fichas para estudiar», que es de donde viene el tema. **Se decide
  antes de escribir el HTML**, no después.

## Paso 3 · Lo que hace falta de afuera

Una sola cosa, y va en el buzón: **la captura de lo que armaste en AI
Studio**, en `entrada/` como `pantalla-fonoteca.png`, con dos renglones
de qué hace. No el proyecto de React: con ver cómo lo pensaste alcanza
para que esto no reinvente lo que ya decidiste.

Y una pregunta para la cátedra, que abre la etapa 2: **si el material de
audio de la aplicación que usan se puede compartir en la app, y con qué
crédito.** Mientras no haya respuesta, la etapa 2 no se diseña ni se
anuncia.
