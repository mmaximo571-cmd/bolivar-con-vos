# La Fonoteca: el simulador de práctica audiológica

Reescrito el 13/9, con el diseño que Máximo armó en AI Studio, el TP de
la cátedra y los aportes de la profesional de Fonoaudiología. **Lo que
había escrito a la mañana quedó viejo**: esto no es una colección de
sonidos, es un **entrenador para leer audiogramas**. El generador de
tonos es una parte chica.

Cuatro solapas, decididas por Máximo para el 21:

| | Qué es | De qué depende |
|---|---|---|
| **1 · Audiometría tonal y PTP** | leer un audiograma y diagnosticar cada oído | de nada: se dibuja y se calcula |
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

1. **Audiometría.** Es la que pidió la profesional, la que no depende de
   material de nadie y la que sostiene sola la herramienta.
2. **El generador de tonos** adentro de esa misma solapa.
3. **Anquiloglosia.** No necesita audio; necesita esquemas.
4. **GRBAS** y **Fonética**, las dos últimas, porque las dos esperan
   grabaciones.

---

# Solapa 1 · Audiometría tonal y PTP

## Paso 1 · Para pegar en Claude Design

**Antes va el bloque de `PROMPT-DISENO.md`.** Después, esto:

> Necesito **una pantalla sola**: un entrenador para aprender a leer
> audiogramas, para estudiantes de Fonoaudiología. La pantalla muestra
> un audiograma dibujado, la persona lo interpreta, y recién después ve
> si acertó.
>
> **El gráfico.** Eje horizontal, las frecuencias en Hz: **125, 250,
> 500, 1000, 2000, 4000 y 8000**. Eje vertical, el nivel de audición en
> dB HL de **–10 arriba hasta 120 abajo**, de 10 en 10: **más abajo es
> peor**, y esa es la primera cosa que confunde a quien recién empieza.
> Cuadrícula fina, fondo claro, el gráfico tiene que leerse en un
> celular de 375 px de ancho.
>
> **Los cuatro trazados, con estos símbolos exactos:**
>
> | | Oído derecho | Oído izquierdo |
> |---|---|---|
> | Vía aérea | **círculo rojo sin relleno** `○` | **cruz azul** `✕` |
> | Vía ósea | **`<` roja** | **`>` azul** |
>
> Tres cosas que no son obvias y que hay que respetar:
>
> - **Los símbolos de vía aérea van sobre el eje vertical** de cada
>   frecuencia, y **se unen con una línea** del color del oído.
> - **Los de vía ósea van al costado del eje, no encima**: la `<` roja
>   del oído derecho se dibuja a la **izquierda** del eje de esa
>   frecuencia, y la `>` azul del izquierdo a la **derecha**. Aunque
>   parezca al revés, es así. **La vía ósea no se une con línea.**
> - **La vía ósea existe solo entre 250 y 4000 Hz.** En 125 y en 8000 no
>   se dibuja nada: no es que falte el dato, es que no se mide.
>
> **El PTP**, arriba del gráfico o al costado, uno por oído: el
> **promedio tonal de 500, 1000 y 2000 Hz** de la vía aérea, en dB HL,
> con un decimal.
>
> **Seis casos**, que se eligen con botones arriba del gráfico: dos de
> hipoacusia conductiva, dos de neurosensorial y dos de mixta, con
> distinto grado y distinta forma de caída, para que no se resuelvan de
> memoria. Cada caso trae además una **historia clínica corta** al
> costado: edad, motivo de consulta y otoscopia.
>
> **Cómo se resuelve.** Debajo del gráfico, la persona elige el
> diagnóstico **de cada oído por separado** —normal, conductiva,
> neurosensorial o mixta— y el **grado**. Recién cuando marca, aparece
> la devolución: si acertó o no, y **las características del audiograma
> que tiene delante**, una por una: cómo está la vía aérea, cómo la
> ósea, si hay GAP y de cuánto, en qué frecuencias, y el grado de cada
> oído con el número. La devolución es lo que enseña: no alcanza con
> «correcto».
>
> Lo que **no** quiero: nada de celeste, ningún puntaje ni ranking,
> ninguna animación que tape el gráfico, y que **la respuesta no se vea
> antes de contestar** (nada de `title` ni de texto escondido que se
> lea tocando).

## Paso 2 · Las reglas clínicas, para la devolución

Esto lo pasó Máximo y sale del material de la facultad. **Va tal cual:
no se redondea ni se reinterpreta.**

**Los grados de hipoacusia**, por oído:

| dB | Grado |
|---|---|
| 0 a 20 | audición normal |
| 21 a 40 | hipoacusia **leve** |
| 41 a 60 | hipoacusia **moderada** |
| 61 a 90 | hipoacusia **severa** |
| más de 91 | hipoacusia **profunda** |

**Los tres tipos**, que es lo que la persona tiene que aprender a
distinguir:

- **Conductiva** — vía aérea descendida (el `○` o la `✕`), **vía ósea
  conservada** (la `<` o la `>`), y **GAP de 20 dB o más** entre aérea y
  ósea.
- **Neurosensorial** — vía aérea descendida y **vía ósea descendida
  acompañándola**. Puede tener caída en agudos o en graves.
- **Mixta** — aérea y ósea descendidas, **y además GAP de 20 dB** entre
  las dos en algunas frecuencias.

**El GAP es el concepto que decide todo**, así que la devolución lo dice
con el número y en qué frecuencias aparece, no como etiqueta.

## Paso 3 · Los seis casos

**Los invento acá siguiendo esas reglas y los revisa la profesional
antes de publicarse.** Cada caso se le pasa como: los cuatro trazados
frecuencia por frecuencia, el diagnóstico de cada oído, el grado y el
PTP. Ninguno se sube sin ese visto.

**Para después, cuando ella lo diga:** el TP de la cátedra pide una
segunda capa que hoy no está —predecir qué darían el **Rinne** (por oído,
en 125, 250, 500 y 1000) y el **Weber** (a qué lado lateraliza, en las
mismas frecuencias)—. Ella dijo «quizás más adelante»: queda anotado y
no entra en la primera versión.

## Paso 4 · El tablero de referencia, y qué se toma de él

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
