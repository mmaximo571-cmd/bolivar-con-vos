# Curaduría y lluvia de ideas sin Claude

`PROMPT-DISENO.md` resuelve un caso: pedir una pantalla. Este resuelve los
otros dos, que son los que aparecen cuando se acaban los tokens a mitad de
semana: **elegir entre cosas que ya existen** (curaduría) y **hacer aparecer
opciones que todavía no existen** (lluvia de ideas).

El problema de fondo es siempre el mismo. Gemini no leyó la bitácora, no sabe
que la fecha no se mueve, no sabe que la facultad es aliada y no antagonista, y
por defecto contesta con entusiasmo de agencia. Sin un cargador adelante, cada
sesión empieza de cero y la mitad del rato se va en desarmar lo que propuso.

---

## 1. El cargador: lo que va antes de todo pedido

Esto **no se escribe cada vez**. Se pega una sola vez como instrucción fija:
en la app de Gemini se hace con un **Gem** nuevo, y en
[aistudio.google.com](https://aistudio.google.com) en el campo *System
instructions*. Si no aparece la opción, el mismo texto pegado arriba del primer
mensaje hace lo mismo, solo que hay que repetirlo al abrir una conversación
nueva.

> Trabajás sobre una app que ya existe: **La Bolívar con vos**, de la
> Agrupación Simón Bolívar, Facultad de Trabajo Social de la UNLP. Es una app
> web mobile-first para estudiantes de tres carreras: Trabajo Social,
> Fonoaudiología y TGCR. Se usa entera sin registrarse.
>
> **Se lanza el lunes 21 de septiembre, Día del Estudiante, con campaña de
> Instagram a 4.213 seguidores. La fecha no se mueve: se mueve el alcance.** El
> congelamiento de funciones nuevas es el domingo 13.
>
> Quien te escribe es Máximo, que hace la app y también consigue el contenido.
> Trabaja en sesiones cortas, solo, desde Windows. **La capacidad se mide en
> medias sesiones, no en semanas.**
>
> **Cosas ya decididas. No las discutas ni las propongas de nuevo:**
> - La facultad es aliada, no antagonista. Nada del texto se apoya en «lo que
>   la facultad no te dice».
> - La app es HTML plano, sin build ni npm. No propongas React, Tailwind,
>   Next.js ni ninguna librería.
> - El público del lanzamiento es el ingresante que llega desde Instagram, con
>   datos escasos y un teléfono lento.
> - La estética es serigrafía: amarillo, negro, tipografía de afiche, borde de
>   tinta. No es material design y no lleva degradés.
>
> **Cómo escribís:** castellano rioplatense, de vos. Sin signos de admiración
> de más, sin «potenciá tu experiencia», sin «revolucioná». Frases cortas.
> Cuando propongas algo, decí también qué se rompe o qué cuesta.
>
> **Si te falta un dato, lo decís. No lo completás.** Nombres de materias,
> fechas de inscripción, requisitos de aprobación y trámites salen de la
> facultad o del Equipo, nunca de vos. Si el ejemplo lo necesita, escribí
> `REVISAR:` y seguí.

Tres Gems alcanzan para todo: **Curaduría**, **Ideas** y **Diseño** (este
último con el molde de `PROMPT-DISENO.md` pegado abajo del cargador).

---

## 2. Molde de curaduría

Curar es elegir y ordenar lo que ya está. Sirve para los 142 mails de las
cátedras, para las nueve fichas de estudio, para el orden de las tarjetas de la
portada, para qué trámite va arriba, para qué entra antes del 13 y qué no.

El error típico es pedir «¿cuál te parece mejor?». Contesta cualquier cosa con
seguridad. La estructura que sí funciona tiene cinco partes, y la tercera es la
que hace la diferencia:

> **1. Qué tengo.** Pego abajo N cosas. Son [qué son y de dónde salieron].
>
> **2. Para qué las quiero.** [Dónde van a estar y quién las va a ver: «en la
> portada, para alguien que entró desde una historia de Instagram y va a
> mirarla seis segundos».]
>
> **3. Con qué criterio se ordenan**, en este orden de importancia:
> 1. [criterio duro, el que manda: «que le sirva a quien todavía no cursó
>    nada»]
> 2. [criterio segundo: «que no dependa de un dato que puede quedar viejo»]
> 3. [criterio tercero: «que se entienda sin haber usado la app antes»]
>
> **4. Qué NO quiero.** No reescribas los textos, no inventes opciones nuevas,
> no me digas que todas son buenas. Elegí.
>
> **5. Cómo lo devolvés.** Una tabla: orden, la cosa, **una línea** de por qué
> está ahí. Abajo, una lista aparte de lo que quedaría afuera, con el motivo.
> Y al final, en una sola línea: **cuál es la decisión más discutible de las
> que tomaste**.
>
> [Acá va el material, pegado.]

Tres cosas que hacen que salga bien:

- **Los criterios ordenados y numerados.** Si van sueltos, Gemini los pesa
  todos igual y devuelve un empate. Numerados, cuando dos criterios chocan
  gana el primero y lo dice.
- **Pedir lo que queda afuera.** Una lista de descartes con motivo es más útil
  que la lista de elegidos: ahí se ve si el criterio se entendió.
- **Pedir la decisión más discutible.** Es lo único que evita las cinco
  respuestas seguidas que suenan todas razonables. Si esa línea te hace ruido,
  ahí está lo que hay que mirar a mano.

**Cuando el material es largo o es tuyo, no lo pegues en el chat.**
[NotebookLM](https://notebooklm.google.com) es gratis y solo contesta con lo
que le subiste: se le cargan los PDF del plan de estudios, `LEEME.md`, la
normativa, y ahí una pregunta sobre correlativas se contesta con la fuente
citada en vez de inventarse. Para el contenido académico —que es el cuello de
botella real— es la herramienta correcta, y es la única que no alucina un
requisito de aprobación.

---

## 3. Molde de lluvia de ideas

Acá el riesgo es el contrario: no que elija mal, sino que devuelva doce ideas
grandiosas y ninguna que entre antes del 13. La estructura pone el freno
adentro del pedido, no después.

> **El problema.** [Una sola frase. «El ingresante entra a la portada y no
> sabe qué es una cursada».]
>
> **Lo que ya hay.** [Qué existe hoy y por qué no alcanza. Si algo se probó y
> se descartó, decilo acá: «el Kit de Inicio de Mi año se mató a propósito
> porque dejaba de aplicarse apenas marcabas una materia».]
>
> **Los límites, que no se negocian:**
> - Entra en **media sesión de trabajo**. Si algo pide dos días, decilo y
>   ponelo igual, marcado.
> - No hay tabla nueva en la base: el congelamiento es el domingo 13.
> - No puede prometer una función que no existe (no se suben archivos, no hay
>   notificaciones).
> - Tiene que funcionar sin conexión o con la conexión de un colectivo.
>
> **Dame 12 ideas.** Numeradas, una línea cada una. Con esta cuota obligatoria:
> - **3 tienen que ser aburridas**: cambiar un texto, mover algo de lugar,
>   borrar algo.
> - **2 tienen que ser imposibles** para el 21, y decir por qué.
> - Las otras 7, entre esos dos extremos.
>
> **De cada una decime:** qué ve la persona, y qué se rompe o qué cuesta.
> **No las ordenes ni me digas cuál te gusta más.** Eso lo hago yo.

Después, en el mismo hilo, la segunda pasada, que es donde se decide:

> De esas 12, agrupá las que en el fondo son la misma idea. Después ordenalas
> por **cuánto cambia para el ingresante que llega el 21 dividido por lo que
> cuesta hacerla**. Explicá la primera y la última. De la primera decime qué
> tendría que ser cierto para que sea mala idea.

Por qué la cuota de aburridas: las tres ideas chicas son las que entran. Sin
la cuota no aparecen nunca, porque «cambiar un texto» no suena a idea. La mitad
de lo que ya está hecho en esta app —el renglón de lo próximo, esconder el 0%,
los tres botones del tema— son exactamente ese tamaño.

Por qué la cuota de imposibles: marca el borde. Si lo imposible que propone es
algo que en realidad se puede hacer en un día, ahí acabás de encontrar la idea
buena.

---

## 4. Cómo vuelve a Claude en quince líneas

Esto es lo que hace que la sesión con Gemini valga la pena en vez de costar el
doble. Si volvés con la conversación entera pegada, la sesión siguiente se paga
leyéndola. Al terminar, último mensaje:

> Cerramos. Escribime el **acta**, máximo 15 líneas, con este formato exacto y
> nada más:
>
> ```
> DECIDIDO: (una línea por decisión tomada, con el motivo en media línea)
> DESCARTADO: (qué quedó afuera y por qué; esto evita volver a proponerlo)
> ABIERTO: (lo que quedó sin decidir y quién lo tiene que contestar)
> PARA CONSTRUIR: (lo que se puede empezar ya, en orden)
> ```

Ese bloque se pega en `BITACORA.md` y con eso arranca la sesión siguiente. Es
el mismo principio por el que existe la bitácora: el trabajo va en sesiones
cortas, y lo que no está escrito se vuelve a pagar en cada arranque.

---

## 5. Lo que Gemini hace mal acá, siempre

Cuatro, y las cuatro se corrigen en el cargador, pero conviene reconocerlas
cuando pasan:

- **Contesta React con Tailwind.** Ya está explicado en `PROMPT-DISENO.md`.
- **Inventa contenido académico** con una seguridad total: correlativas,
  plazos de inscripción, cómo se promociona una materia. Es el error caro,
  porque no se nota leyendo.
- **Sube el tono.** Devuelve «¡Potenciá tu cursada!» en una app cuyo titular es
  «La salida siempre es colectiva».
- **Elige colores y afirma que contrastan.** Los contrastes de esta app están
  medidos y anotados en `estilos.css`, y midiendo mal da «ok» casi siempre.
  Un color nuevo se mide en el navegador, sobre el píxel pintado de verdad, no
  en un conversor de hexadecimales.

---

## 6. Con qué más se puede seguir cuando no hay tokens

Ordenado por lo que sirve **para esta app**, no por lo que suena mejor:

| Herramienta | Para qué sirve acá | Cuidado |
|---|---|---|
| **[AI Studio](https://aistudio.google.com)** | Es el mismo Gemini pero con instrucción fija, contexto largo y sin límite de chat. **Acá van los tres moldes.** Se le pueden adjuntar `BITACORA.md` y `LEEME.md` enteros | Es la versión de desarrollador: guarda todo en Google, no le pegues datos de estudiantes |
| **[NotebookLM](https://notebooklm.google.com)** | Curaduría de contenido propio: planes de estudio, normativa, los trípticos. Contesta **solo** con lo que le subiste y cita la fuente | No inventa, pero tampoco completa: si el PDF no lo dice, no lo sabe. Eso es exactamente lo que querés |
| **[Le Chat](https://chat.mistral.ai)** · **[DeepSeek](https://chat.deepseek.com)** | El reemplazo cuando también se acabó Gemini. Gratis y sin fila. Mismos moldes, mismo cargador | Ninguno sabe nada de la app: el cargador es obligatorio |
| **DevTools del navegador** (F12) | Medir contraste sobre lo que se ve de verdad, ver qué pesa cada archivo, probar en 375px | Es la única medición que vale. Ver `medir-contraste-bien` |
| **[PageSpeed Insights](https://pagespeed.web.dev)** | Poné `bolivar-con-vos.vercel.app` y te dice qué tarda desde un teléfono lento. Pega justo en la llegada desde Instagram | Ignorá las sugerencias de librerías: no hay build |
| **[Squoosh](https://squoosh.app)** | Bajar el peso de las fotos y las placas sin instalar nada | — |
| **Instagram de la agrupación** | La fuente estética real. Las placas nuevas son referencia de diseño antes que cualquier galería | — |

**Lo que conviene no usar, aunque sea lo que más se recomienda:** v0, Lovable,
Bolt y compañía. Todos generan React con Tailwind y componentes propios.
Traducir a mano lo que sacan cuesta más que diseñar la pantalla de cero, que
es la razón por la que existe `PROMPT-DISENO.md`. Sirven para **mirar**, nunca
para copiar código. Si vas a mirar, mirá y después describí con palabras lo que
viste; no pegues el código.

**Figma** está configurado en esta máquina pero sin autorizar, y la
autorización no se puede hacer desde la app de escritorio.

---

## 7. Lo que no se delega, ni acá ni en ningún lado

- **El contenido académico.** Lo pone la cátedra, Alumnado o el Equipo.
- **Los contrastes y los colores nuevos.** Se miden.
- **Prometer una función.** Antes de pedir una pantalla con una acción nueva,
  hay que saber si la acción existe. Ya pasó con «SUBIR MI RESUMEN».
- **Qué entra y qué queda afuera del 13.** La lluvia de ideas ordena; la
  decisión de qué se construye es tuya, porque sos el que sabe cuánto entra en
  una sesión.
