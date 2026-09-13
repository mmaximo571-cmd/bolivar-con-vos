# La Fonoteca: el simulador de práctica audiológica

Escrito el 13/9 con el diseño que Máximo armó en AI Studio, el TP de la
cátedra y los aportes de la profesional de Fonoaudiología. **No es una
colección de sonidos: es un entrenador para leer audiogramas**, y el
generador de tonos es una parte chica.

**Este archivo se corrigió dos veces el mismo día**, y conviene saber por
qué antes de leerlo: a la mañana describía una fonoteca de sonidos, que
era otra cosa; a la tarde, cuando llegó el material, pasó a ser la
especificación del entrenador; y a la noche, cuando **la pantalla ya
estaba escrita y publicada**, el Paso 1 dejó de ser «cómo armarla» y pasó
a ser **cómo rediseñarla**. Lo que queda acá es lo último.

Cuatro solapas, decididas por Máximo para el 21:

| | Qué es | De qué depende |
|---|---|---|
| **1 · Audiometría tonal y PTP** | leer un audiograma y diagnosticar cada oído | ✅ hecha, escondida hasta el visto de la profesional |
| **2 · Foniatría y escala GRBAS** | ponerle grado a una voz | **de grabaciones que todavía no hay** |
| **3 · Fonética clínica rioplatense** | pares mínimos y puntos de articulación | **de grabaciones que todavía no hay** |
| **4 · Anquiloglosia** | clasificar el frenillo lingual | de fotos o esquemas |

---

## La regla que va antes que todas

**Esto lo estudia alguien para rendir, y es clínico.** Un audiograma mal
clasificado no es un error de diseño: le enseña mal a una persona que
después va a diagnosticar. Entonces:

- **Ningún caso se publica sin el visto de la profesional de fono.** Se
  le pasan los seis dibujados, con el diagnóstico y el porqué de cada
  uno, y se publica lo que ella confirme. Lo que no llegue a revisarse a
  tiempo, no sale.
- **Los audiogramas son propios, distintos a los ocho del TP.** Lo pidió
  ella y además corresponde: el TP y sus gráficos son material de la
  cátedra. Del TP tomamos **la estructura del ejercicio**, no los casos.
- **Lo que no sepamos se escribe como `[FALTA]`** y no se completa con
  lo que la IA crea saber. Misma regla que `PROMPT-FICHAS.md`.

## El orden, y por qué cada solapa tiene que poder salir sola

Quedan tres días de código hasta el congelamiento del 16 o 17. **Las
cuatro solapas son cuatro herramientas distintas**, y es probable que no
entren las cuatro. Por eso se arman en este orden y **cada una se publica
completa o no aparece**: una solapa vacía o a medias en una app que abren
4.213 personas es peor que una solapa menos.

1. ~~**Audiometría.**~~ ✅ **Hecha el 13/9**, sin Claude Design. Los seis
   casos andan y el chequeo automático les da bien a los seis, pero
   **están con `aprobado:false` y la tarjeta de Estudiemos escondida**
   hasta que la profesional confirme. Lo que queda de esta solapa es el
   rediseño (Paso 1) y el visto (Paso 2).
2. **El generador de tonos** adentro de esa misma solapa. **Es lo único
   de la Fonoteca que todavía no existe en ninguna forma.**
3. **Anquiloglosia.** No necesita audio; necesita esquemas.
4. **GRBAS** y **Fonética**, las dos últimas, porque las dos esperan
   grabaciones.

---

# Solapa 1 · Audiometría tonal y PTP

**La pantalla ya existe.** Se escribió el 13/9 sin Claude Design, está en
`estudiemos/fonoteca/`, tiene los seis casos andando y el chequeo
automático les da bien a los seis. **Entonces esto no es un prompt para
armarla: es un prompt para rediseñarla.**

La diferencia importa. El contenido —los seis casos, los números, los
diagnósticos, las reglas clínicas— **ya está decidido y no se toca**. Lo
que se le pide a Claude Design es **cómo se ve**: el gráfico, las
tarjetas, la devolución, la jerarquía de la pantalla.

## Paso 1 · El prompt, para copiar y pegar

**Antes va el bloque de `PROMPT-DISENO.md`**, el de «Para copiar y pegar
antes de cada pedido». Sin él vuelve React con Tailwind. Después, esto:

---

> Te paso una pantalla que **ya funciona** y quiero que la rediseñes. Es
> un entrenador para aprender a leer audiogramas, para estudiantes de
> Fonoaudiología de una facultad argentina: se mira un audiograma, se
> diagnostica cada oído, y recién después aparece la devolución.
>
> **Regla primera: no cambies ningún dato clínico.** Ni los umbrales, ni
> los diagnósticos, ni los grados, ni las reglas. Son de la cátedra y
> están para revisar por una profesional. Si algo te parece mal, decilo
> aparte, no lo corrijas en el diseño.
>
> ### Lo que hay, en orden
>
> 1. **Seis botones de caso**, «Caso 1» a «Caso 6».
> 2. **La historia clínica**: edad, motivo de consulta y otoscopia.
> 3. **El audiograma**, que es el corazón de la pantalla.
> 4. **El PTP de cada oído**, con el rótulo «PTP · promedio tonal
>    500-1k-2k Hz».
> 5. **Una tabla plegada** con todos los valores.
> 6. **Tu diagnóstico**: por cada oído, tipo (normal · conductiva ·
>    neurosensorial · mixta) y grado (leve · moderada · severa ·
>    profunda). Cuatro grupos de opciones.
> 7. **Un botón «Ver la devolución»**, y la devolución debajo.
> 8. Al pie, una nota que dice que los casos los inventamos nosotros
>    siguiendo las reglas de la cátedra.
>
> ### El audiograma, que es lo que más necesita diseño
>
> Está hecho en **SVG inline** y tiene que leerse en un celular de
> **375 px de ancho**. Hoy entra pero está apretado: ahí es donde más
> podés ayudar.
>
> - **Eje horizontal**, las frecuencias a distancia igual entre sí:
>   **125, 250, 500, 1000, 2000, 4000, 8000 Hz**.
> - **Eje vertical**, de **–10 arriba a 120 abajo**, marcas cada 10.
>   **Más abajo es peor**, y eso es lo primero que confunde a quien
>   recién empieza: que el dibujo lo deje claro.
> - **Cuatro trazados** con estos símbolos, que son convención clínica y
>   no decisión de diseño:
>
> | | Oído derecho | Oído izquierdo |
> |---|---|---|
> | Vía aérea | **círculo rojo sin relleno** `○` | **cruz azul** `✕` |
> | Vía ósea | **`<` roja** | **`>` azul** |
>
> Tres cosas que **no se pueden cambiar** aunque queden raras:
>
> 1. Los símbolos de **vía aérea van sobre el eje** de cada frecuencia y
>    **se unen con una línea**.
> 2. Los de **vía ósea van al costado, no encima**: la `<` roja **a la
>    izquierda** del eje, la `>` azul **a la derecha**. Aunque parezca al
>    revés, es así.
> 3. La **vía ósea existe solo entre 250 y 4000 Hz**. En 125 y 8000 no se
>    dibuja nada: no falta el dato, no se mide.
>
> **El rojo y el azul son los únicos colores a mano de esta pantalla.**
> Que se distingan en modo oscuro, y que **no sean lo único** que separa
> un oído del otro: el símbolo ya los diferencia, y hay estudiantes que
> no distinguen esos dos colores. La referencia de arriba lo dice con
> palabras.
>
> **Un caso de verdad para que dibujes sobre algo real** (caso 1, nene de
> 6 años, otitis media serosa del oído derecho), en dB HL:
>
> | | 125 | 250 | 500 | 1k | 2k | 4k | 8k |
> |---|---|---|---|---|---|---|---|
> | OD aérea | 35 | 35 | 30 | 35 | 30 | 25 | 25 |
> | OD ósea | — | 10 | 5 | 10 | 10 | 10 | — |
> | OI aérea | 15 | 10 | 10 | 15 | 10 | 10 | 15 |
> | OI ósea | — | 10 | 5 | 10 | 10 | 5 | — |
>
> ### Las cuatro cosas que quiero que resuelvas mejor
>
> 1. **Que el gráfico respire en 375 px.** Es lo que se mira, y hoy
>    compite con todo lo demás.
> 2. **Que se entienda que abajo es peor** sin tener que explicarlo.
> 3. **Que elegir tipo y grado de cada oído no se sienta un formulario.**
>    Son cuatro grupos de opciones y hoy son cuatro filas de botones.
> 4. **Que la devolución se lea como una explicación y no como una
>    corrección.** Es la parte que enseña: dice cómo está cada vía, si
>    hay GAP y de cuántos dB, en qué frecuencias, y por qué es ese tipo
>    y no otro.
>
> ### Lo que NO quiero
>
> Nada de celeste salvo el foco del teclado. Ningún puntaje, ninguna
> racha, ningún ranking: no es un juego, es material de estudio. Ninguna
> animación que tape el gráfico. Nada que muestre la respuesta antes de
> contestar: ni `title`, ni texto escondido con `opacity`, ni nada que se
> vea manteniendo apretado. Y nada de «¡Muy bien!».

---

## Paso 2 · La planilla para la profesional

**Los seis casos están publicados con `aprobado:false` y la tarjeta de
Estudiemos está escondida hasta que ella confirme.** Los mira en
`bolivar-con-vos.vercel.app/estudiemos/fonoteca/?revision`, donde cada
caso muestra el diagnóstico escrito y el chequeo automático.

Esto es lo que hay que mandarle. **Los seis dan «el cálculo coincide»**,
o sea que los números y el diagnóstico escrito no se contradicen entre
sí; lo que falta es que alguien de la carrera diga que además están bien.

| Caso | Cuadro | OD | OI | PTP OD | PTP OI |
|---|---|---|---|---|---|
| 1 | nene de 6 años, resfríos y tímpano opaco | **conductiva leve** | normal | 31,7 | 11,7 |
| 2 | 34 años, entiende mejor en lugares ruidosos | normal | **conductiva moderada** | 10,0 | 45,0 |
| 3 | 72 años, oye pero no entiende | **neurosensorial leve** | **neurosensorial leve** | 28,3 | 31,7 |
| 4 | 45 años, vértigo y acúfeno de un lado | **neurosensorial moderada** | normal | 48,3 | 8,3 |
| 5 | 58 años, otitis de chico y treinta años de taller | **mixta moderada** | **neurosensorial leve** | 58,3 | 33,3 |
| 6 | 40 años, supuración con mal olor | normal | **mixta severa** | 11,7 | 78,3 |

**Las tres preguntas concretas, que son las que hacen falta y no
«¿está bien?»:**

1. **¿El grado se saca del PTP o de otra cosa?** La pantalla lo saca del
   PTP, y eso decide los seis. En el caso 3 el PTP da 28,3 y 31,7 —o sea
   «leve»— habiendo 60 y 65 dB de caída en 4000: **el promedio no ve la
   caída en agudos.** Si en la cátedra eso se llama de otra manera, el
   caso 3 es el que hay que corregir.
2. **¿Dónde está el corte de «vía ósea conservada»?** La pantalla mide el
   promedio de la ósea en 500, 1000 y 2000 y usa 20 dB. En el caso 2 la
   ósea llega a 20 en 2000: está adentro por un pelo.
3. **¿El GAP también se mide sobre 500, 1000 y 2000?** Así está hecho.
   Si la cátedra lo mira frecuencia por frecuencia, cambia qué casos son
   mixtos.

**Y una cosa que decide ella y no nosotros:** los seis son casos
*limpios*, de manual, sin sutilezas —ni muesca de Carhart, ni umbrales
que no responden, ni asimetrías raras—. Es a propósito, porque se aprende
con casos limpios. Si prefiere que alguno tenga una complicación real, se
cambia antes de publicar y no después.

## Paso 3 · El tablero de referencia, y qué se toma de él

La profesional pasó **`audsim.com/audgenJS/audgenjs.html`** (AudGen
0.6.3, de audstudent.com) como la dinámica a replicar. Mirado el 13/9,
esto es lo que hay que saber:

- **No es un ejercicio: es un generador para docentes.** Tiene un panel
  por oído y cada uno con **cuatro filas** —Air, Bone, **Mask Air, Mask
  Bone**—, cada una con «Display / Edit / Reset», edición por tabla y un
  botón de guardar. Sirve para *armar* audiogramas, no para resolverlos.
- **Eso aclara qué son los «otros signos» que ella menciona: el
  enmascaramiento.** Las dos filas que nosotros no vamos a dibujar
  todavía son justamente las enmascaradas. Cuando se sumen, se suman
  como dos trazados más por oído, con sus propios símbolos.
- **De ahí se toma la forma del gráfico** —la escala de –10 a 120, las
  líneas punteadas de las interoctavas (750, 1500, 3000, 6000), el
  tamaño de los símbolos— porque es la convención que los estudiantes ya
  van a ver en la cátedra. **No se toma ni el código ni los gráficos.**

**Y deja a la vista una diferencia que hay que decidir.** Ella pidió
«armar audiogramas», que en ese tablero significa **editarlos**. Nuestra
primera versión no edita: trae **seis casos escritos en el HTML**, y
sumar el séptimo es agregar una línea de números —siete umbrales de vía
aérea y cinco de ósea, por oído— sin tocar el dibujo ni la lógica. O sea
que ella puede pedir casos nuevos mandando los números, pero **no
cargarlos sola**. Un editor como el de AudGen es la versión post-21 de
ese pedido, y conviene decírselo así para que no espere otra cosa.

---

# Solapa 2 · Foniatría y escala GRBAS

**Esta solapa tiene una dependencia que hay que mirar de frente: GRBAS
es una evaluación perceptual.** Se escucha una voz y se le pone un
número de 0 a 3 en cada una de las cinco letras. **Sin grabaciones no
hay ejercicio**, y las grabaciones son justo lo que estamos esperando de
la cátedra.

Dos salidas honestas, y hay que elegir una:

- **Que sea una pantalla de referencia**, no un entrenador: qué mide
  cada letra, qué significa cada grado, y cómo se anota una evaluación.
  Eso se puede escribir hoy y es útil igual.
- **Que espere las voces** y salga después del 21, completa.

**Lo que no se puede es una solapa que diga «escuchá la voz» y no tenga
ninguna.** Es la tarjeta del glosario otra vez.

---

# Solapa 3 · Fonética clínica rioplatense

Mismo problema y misma decisión: **los pares mínimos se escuchan.**
Lo que sí se puede armar sin audio es la parte visual —el cuadro de
puntos y modos de articulación, y qué distingue a la variedad
rioplatense—, y dejar la discriminación auditiva para cuando haya
material. `[FALTA]` el contenido: acá no hay nada escrito todavía.

---

# Solapa 4 · Anquiloglosia

La única de las tres restantes que **no depende de audio**: se clasifica
mirando. Necesita esquemas o fotos del frenillo lingual y el criterio
con el que se gradúa. `[FALTA]` de dónde salen esas imágenes y qué
clasificación usa la cátedra — **eso se pregunta antes de diseñar**, no
después.

---

# Lo que no se negocia, en todas las solapas

### El volumen, si hay tonos

El generador de tonos va adentro de la solapa de audiometría: las mismas
frecuencias del gráfico, para escuchar lo que se está leyendo.

**Un tono puro a todo volumen en auriculares lastima**, y la app de una
carrera de Fonoaudiología es el último lugar donde eso puede pasar por
descuido. Arranca **bajo**; entra y sale con **rampa corta**, porque un
oscilador que corta de golpe hace un clic de banda ancha; y el aviso de
auriculares va **antes** del primer tono, no después.

### Tiene que servir sin sonido

En la carrera hay estudiantes con hipoacusia y van a estar entre los
primeros en abrir esto. La solapa de audiometría **ya cumple**: es toda
visual. Lo que se agrega —los tonos— es un extra, nunca el único camino,
y cada uno lleva su frecuencia escrita al lado.

### El navegador de Instagram

Es el navegador real de esta app. El `AudioContext` se crea **al tocar
el primer botón**, no al cargar la pantalla: si se crea antes queda
suspendido y el primer toque no suena. Y si el teléfono está en
silencio no suena igual, sin forma de detectarlo desde la página: lo
dice el aviso.

### Nada copiado

Los audiogramas del TP llevan la marca de agua de una herramienta de
afuera, y el link que pasó la profesional es de otra persona. **De ahí se
toma la dinámica, no los gráficos ni el código** — la misma regla que se
usó con la versión 2.0 de AI Studio.

---

# Dónde vive

- **Pantalla nueva: `estudiemos/fonoteca/`**, como `glosario/`: los
  casos van en el HTML, se lee sin señal, y para cambiar algo se edita
  ese archivo.
- **No toca `app.js` ni `estilos.css`**, así que no hace falta subir la
  versión del service worker. Si termina necesitando estilos en la hoja
  general, entonces sí.
- ~~**Falta decidir la puerta.**~~ **Decidido el 13/9: es la cuarta
  tarjeta de Estudiemos.** Está escrita y **escondida** (`hidden`) hasta
  que la profesional apruebe el primer caso.
- **Hecho el 13/9, sin Claude Design** (lo decidió Máximo): la solapa 1
  con los seis casos, todos con `aprobado:false`. La profesional los mira
  en `estudiemos/fonoteca/?revision`, que muestra el diagnóstico escrito,
  los números y un chequeo automático. Dos cosas quedaron marcadas
  `[A CONFIRMAR]` en el código: qué pasa con el PTP entre 90 y 91, y que
  «ósea conservada» y «GAP» se miden sobre 500, 1000 y 2000 Hz.
  **Falta el generador de tonos** (parte 2).
