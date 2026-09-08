# El molde para armar una ficha de estudio

Una ficha sale de dos herramientas, y cada una hace **una sola** cosa:

1. **NotebookLM** lee los PDF y ordena el contenido. Es el único de los
   dos que leyó el material y que puede citar de dónde sale cada dato.
2. **Claude Design** lo dibuja. No leyó ningún PDF: lo que no esté en
   el texto que le pegues, no existe.

Si se mezclan, pasa lo peor de los dos lados: NotebookLM entrega algo
que parece diseño y no lo es, y Claude Design completa contenido de
anatomía que nadie chequeó. **Una ficha por vez**, y en este orden.

Las ocho que ya están (`estudiemos/fichas/`) salieron así.

---

## Paso 1 · Para pegar en NotebookLM

Antes: que en el cuaderno estén **solo los PDF de este tema**. Con
material de otras materias adentro, las citas se ensucian y aparecen
datos que no son de acá.

> Sos parte del equipo que arma material de estudio para estudiantes de
> la Facultad de Trabajo Social de la UNLP. Trabajás **solo** con los
> PDF de este cuaderno.
>
> Voy a armar una ficha de estudio sobre: **[TEMA]**.
>
> No la diseñes y no escribas HTML. Lo que necesito es el contenido
> ordenado, para dibujarlo después.
>
> **La regla que va antes que todas las demás.** Esto lo estudia
> alguien para rendir. Si el PDF no lo dice, **no lo completes con lo
> que sepas**: escribí `[FALTA]` y seguí. Un dato inventado con
> seguridad hace más daño que un hueco marcado. Si dos PDF no dicen lo
> mismo, escribí «los PDF no coinciden» y mostrá las dos versiones sin
> elegir. Al lado de cada dato duro —nombres, cantidades,
> clasificaciones— poné entre paréntesis de qué PDF y qué página sale.
>
> **Si el tema es demasiado grande para una sola ficha**, decímelo
> antes de empezar y proponeme en cuántas cortarlo y con qué criterio.
> Mejor tres fichas que se terminan que una que no se lee.
>
> Devolveme exactamente este formato, con estos títulos:
>
> **0 · PORTADA**
> - TÍTULO: dos palabras como máximo. Va a ir en letras enormes.
> - SUBTÍTULO: tres o cuatro sustantivos separados por « · ».
> - ENTRADA: dos renglones que digan qué se lleva alguien si lee esto.
> - MATERIA: el nombre completo como figura en el plan.
> - PDF USADOS: la lista.
>
> **1 · QUÉ ES**
> - DEFINICIÓN: dos o tres oraciones cortas. Sin rodeos previos.
> - LO QUE MÁS SE CONFUNDE: **una sola** idea, la que el PDF marca,
>   subraya o repite. Va a ir sola en un recuadro amarillo, así que
>   tiene que ser la que más se rinde mal.
> - PIEZAS: entre 3 y 6. Cada una: NOMBRE — una oración de qué es.
>
> **2 · CÓMO FUNCIONA**
> Dos o tres «máquinas». Una máquina es una fila de botones: se toca
> uno y cambia lo que se muestra abajo. Para cada una:
> - MÁQUINA N · TÍTULO
> - QUÉ SE ELIGE: (por ejemplo, «el grupo de cartílagos»)
> - BOTONES: las opciones, nombradas como las nombra el PDF.
> - POR CADA OPCIÓN: nombre, una línea de qué es, y **qué la distingue
>   de las otras** —esto último es lo que hace que la máquina sirva
>   para algo.
> - ESQUEMA: qué habría que ver dibujado (formas simples, qué va
>   arriba y qué abajo, qué aparece de a uno y qué de a dos). Si el PDF
>   no alcanza para dibujarlo sin inventar, escribí «sin esquema».
>
> **3 · CÓMO TE DAS CUENTA**
> Ocho preguntas de opción múltiple, tres opciones cada una, una sola
> correcta.
> - Que no se contesten por descarte ni por sentido común: las tres
>   opciones tienen que sonar posibles para alguien que leyó por arriba.
> - Al menos tres tienen que apuntar a LO QUE MÁS SE CONFUNDE del
>   punto 1.
> - Por pregunta:
>   PREGUNTA / A) B) C) / CORRECTA: / POR QUÉ: dos renglones.
> - El POR QUÉ **no repite** la opción correcta: explica el criterio
>   con el que se decide. Se muestra siempre, se acierte o no, y es lo
>   único que la persona estudia de esta parte.
>
> **4 · LO QUE HAY QUE ACLARAR**
> - Todo lo que marcaste `[FALTA]`, junto.
> - Todo lo que los PDF no coinciden.
> - Qué conviene confirmar con la cátedra.
> Escribilo para que lo lea una estudiante, no como notas internas:
> esto se publica al pie de la ficha.
>
> **Cómo escribir todo lo anterior**
> - Castellano rioplatense, de vos.
> - Oraciones cortas. Si una idea entra en diez palabras, no uses
>   veinte.
> - Nada de «es importante destacar», «cabe mencionar», «en el
>   fascinante mundo de».
> - Negrita solo para lo que de verdad es un término, nunca para
>   decorar.
> - Los términos técnicos, con el nombre completo la primera vez.

### Qué hacer con lo que salga

Antes de pasar al paso 2:

- **Los `[FALTA]` son deuda, no relleno.** O los completa el Equipo con
  bibliografía —y entonces se anota que se completaron— o quedan
  escritos en la ficha. Las dos cosas son honestas. Taparlos, no.
- **Leer las ocho preguntas de corrido.** Es donde más se nota si
  entendió el material o lo parafraseó.
- Que lo mire alguien del Equipo de la materia. NotebookLM cita, pero
  citar bien no es entender.

---

## Paso 2 · Para pegar en Claude Design

Después del texto del paso 1, ya revisado. La ficha es una **página
suelta**: no usa la hoja de estilos de la app, se dibuja sola.

> Diseñá una página web de una sola columna, mobile-first, para
> estudiantes universitarias argentinas. Es material de estudio, no una
> landing de venta: no hay nada que comprar y nadie se tiene que
> registrar.
>
> **Se lee bajando**, en cuatro tramos a pantalla completa: portada,
> «01 QUÉ ES», «02 CÓMO FUNCIONA», «03 CÓMO TE DAS CUENTA», y un cierre.
> Cada tramo arranca con un rótulo chiquito en monoespaciada
> (`PLIEGUE 01`) y un título enorme en Archivo Black, en mayúsculas.
>
> **La estética es serigrafía, no material design.** Cada pieza lleva
> borde de 1px del color de la tinta y una sombra dura de `2px 2px 0`
> **sin desenfoque**, radio 10px. Nada de degradados, nada de sombras
> blandas, nada de vidrio.
>
> **Los colores, en variables CSS, exactamente estos:**
> `--bg:#FFFFFF · --paper:#FDFCF7 · --tx:#1A1A1A · --mut:#3A3A3A ·
> --stroke:#1A1A1A · --yellow:#F9E830 · --onyel:#1A1A1A ·
> --red:#B52625 · --line:#0195B1`
> y el modo oscuro en `html[data-tema="oscuro"]`:
> `--bg:#151412 · --paper:#22201D · --tx:#FDFCF7 · --mut:#D8D3C8 ·
> --stroke:#FDFCF7 · --red:#FF9D8F · --line:#5AD8F0`
>
> **El amarillo aparece dos veces en toda la página** y en ningún lado
> más: el recuadro de «lo que más se confunde» y el marcador de la
> autoevaluación. Si hay tres cosas amarillas, ninguna es la
> importante.
>
> **Tipografías:** Archivo Black para los títulos, Montserrat 700/800
> para botones y rótulos, Roboto para el cuerpo, Roboto Mono para
> numeración y epígrafes.
>
> **Las máquinas del tramo 02** son lo único interactivo: una fila de
> botones tipo píldora; al tocar uno cambia el esquema SVG y el detalle
> de abajo. Los esquemas son **diagramas, no atlas**: formas simples,
> trazo de 1,8px, y un epígrafe en monoespaciada que aclare
> «ESQUEMA · NO A ESCALA».
>
> **La autoevaluación** son ocho tarjetas: pregunta, tres opciones
> apiladas, y al elegir aparece un recuadro «POR QUÉ» con borde
> izquierdo amarillo. **El porqué se muestra siempre, se acierte o no**,
> y la opción correcta queda marcada aunque la persona haya errado. No
> hay puntaje que felicite ni que rete.
>
> **Obligatorio:**
> - Todo lo tocable, mínimo 48px de alto, y `aria-pressed` en los
>   botones que quedan elegidos.
> - Foco visible: `outline:3px solid var(--line)`.
> - Todo lo que aparece al bajar tiene que verse igual con
>   `@media (prefers-reduced-motion:reduce)` y al imprimir.
> - Castellano rioplatense, de vos. Sin signos de admiración de más.
>
> El contenido es exactamente este, no lo amplíes ni lo completes:
>
> [acá va, tal cual, lo que devolvió NotebookLM]

---

## Después de bajar el `.dc.html`

1. Guardarlo como `estudiemos/fichas/<nombre-corto>/index.html`.
2. Al final, antes del bloque de la clase, tiene que estar
   `<script src="../ficha.js"></script>`, y la clase se tiene que
   llamar `class Component extends DCLogic`. Ese archivo es el andamio
   de Claude Design reescrito chiquito: sin él la ficha no arranca
   fuera de Claude Design. Está explicado arriba de todo en
   [ficha.js](estudiemos/fichas/ficha.js).
3. Sumar la tarjeta en [estudiemos/fichas/index.html](estudiemos/fichas/index.html),
   con el tipo (`Ficha` o `Tríptico`) y, si tiene, «Con autoevaluación».
4. En el pie, la aclaración del punto 4 de NotebookLM: qué salió de las
   placas, qué se completó con bibliografía y qué hay que confirmar con
   la cátedra. Las fichas que ya están lo dicen; que esta no lo diga
   sería el único cambio grave.
5. **No hace falta subir el número de `sw.js`**: las pantallas sueltas
   van por red primero. Solo si de paso se tocó `estilos.css`, `app.js`,
   `iconos.js` o `config.js`.

---

## Lo que no hay que pedirle a ninguno de los dos

**Que decida contenido académico.** Si hace falta un dato que el PDF no
tiene, lo pone la cátedra o el Equipo. Lo dice el LEEME y vale doble
acá: una ficha de estudio se lee como si fuera verdad.

**Que invente una interacción que `ficha.js` no sabe correr.** Entiende
listas (`sc-for`), condiciones (`sc-if`), agujeros `{{ asi }}` y clics
que cambian el estado. No hay animaciones por tiempo, ni arrastrar, ni
gráficos que se calculen solos. Si una ficha necesita más, se agranda
el motor a propósito, no de sorpresa.

**Que escriba el texto de la portada de la app.** Las fichas viven en
`estudiemos/fichas/`; cómo se anuncian afuera es otra decisión.
