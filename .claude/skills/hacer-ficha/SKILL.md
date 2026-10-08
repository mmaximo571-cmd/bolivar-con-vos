---
name: hacer-ficha
description: >-
  Arma y publica una ficha de estudio nueva en Estudiemos (estudiemos/fichas/) de La Bolívar con vos, desde el texto de NotebookLM, un PDF de cátedra o un export de Claude Design, y la deja registrada en el índice y el buscador. Usala siempre que haya que sumar, cargar, subir o corregir una ficha, un mazo, un repaso o una autoevaluación de una materia (Anatomofisiología, DFOF, Audiología, Psicología, Trabajo Social…), aunque no se diga «ficha»: «pasé por NotebookLM el tema de deglución», «acá está el PDF de la unidad 3 para Estudiemos», «bajé el .dc.html del mazo». También para revisar si una ficha de texto que ya está cumple el molde.
---

# Hacer una ficha de Estudiemos

Una ficha se lee **como si fuera verdad**: alguien la estudia para rendir.
Todo lo que sigue sirve a eso. Un dato inventado con seguridad hace más
daño que un hueco marcado, así que el contenido académico sale de los
PDF de la cátedra o no sale.

El molde del contenido (qué secciones, cuántas piezas, cuántas preguntas,
cómo se escribe) está en `docs/prompts/PROMPT-FICHAS.md`, paso 1. Es la
única fuente: no lo copies acá, leelo de ahí cuando haga falta.

## 1. De dónde viene el contenido

Antes de tocar nada, fijate cuál de los tres es:

**a) Texto de NotebookLM** (pegado en el chat o en un `.txt`). Es el
camino normal: NotebookLM leyó los PDF y cita la página de cada dato.
El contenido **no se reescribe**. Solo se arregla el formato para que el
parser lo lea (títulos, viñetas, `- CORRECTA: X`). Si algo del contenido
te parece mal, se lo decís a la persona; no lo corregís de memoria.

**b) Un PDF** (o varios, del mismo tema). Lo leés vos con Read, por
páginas, y escribís el texto siguiendo el paso 1 de `PROMPT-FICHAS.md`
como si te lo hubieran pegado a vos: solo lo que dicen esos PDF, cada
dato duro con `(archivo.pdf, pág. N)`, `[FALTA]` donde el PDF no alcanza,
«los PDF no coinciden» con las dos versiones. Este texto es un
**borrador**: decile a la persona, con esas palabras, que antes de
publicarlo lo tiene que leer alguien del Equipo de la materia. Citar
bien no es entender, y acá no hubo nadie que lo chequeara.

**c) Un export de Claude Design** (`.dc.html`, o un `.html` de cientos de
KB que dice «Unpacking...»). Es una ficha con diseño propio: mazo, repaso,
línea de tiempo, cuadro. Va por el camino C de abajo.

**Si el tema es grande para una ficha**, proponé el corte antes de
escribir. Mejor tres que se terminan que una que no se lee.

## 2. El nombre

El `id` es corto, en minúsculas, con guiones y sin tildes:
`<materia>-<módulo>-<tema>`, como los que ya están (`anato-3-faringe-laringe`,
`dfof-2-trastornos-del-habla`). Mirá `estudiemos/fichas/textos/` para
seguir la numeración.

**Una vez publicado no se cambia.** Es la clave con la que el teléfono
guarda qué respondió cada persona (`bolivar-ficha-<id>`): cambiarlo
borra el avance de todo el que la empezó.

## 3. Camino A · Ficha de texto (a y b)

1. Guardá el texto en `estudiemos/fichas/textos/<id>.txt`.
2. Revisalo con el mismo parser que usa la app:

   ```
   node .claude/skills/hacer-ficha/scripts/revisar-ficha.mjs estudiemos/fichas/textos/<id>.txt
   ```

   - **ERROR**: la ficha sale rota o con huecos. El parser no avisa
     nada: lo que no reconoce, no lo muestra. Arreglalo antes de seguir.
   - **OJO**: sale, pero no cumple el molde. Miralo uno por uno.
     **La correcta siempre en la misma letra** es el que más aparece:
     NotebookLM tiende a poner la B. Reordená las opciones de cada
     pregunta (el texto de cada opción queda igual) y actualizá
     `- CORRECTA:`. Eso no cambia contenido, así que vale también en el
     camino a. También en una ya publicada: desde el 7/10/2026
     `ficha-texto.js` guarda una huella del orden de las opciones y, si
     no coincide, descarta las respuestas viejas (que son letras) en
     vez de marcarlas mal. Se pierden las respuestas de esa ficha, no
     las partes vistas. Igual hay que subir `VERSION` en `sw.js`: el
     `.txt` sale de lo guardado.

3. **Las ocho preguntas.** Es lo único de la ficha que se usa para
   saber si se sabe, y donde más se nota si el material se entendió.
   Una pregunta que se contesta sin haber estudiado no le sirve a nadie
   y, encima, la deja creer que ya está lista para rendir.

   Leelas de corrido y mirá:
   - **Cada opción incorrecta es un error que alguien comete de
     verdad**, no relleno. La mejor sale de LO QUE MÁS SE CONFUNDE o de
     dos piezas que se parecen: quien la elige te está mostrando qué
     confundió. Una absurda (el reflejo de Moro como respuesta a cómo se
     diagnostica un trastorno del habla) regala la pregunta.
   - **Las tres se parecen en forma**: largo parecido, la misma
     estructura gramatical, el mismo nivel de detalle. Si la correcta es
     la única larga y precisa, se adivina; el revisor lo marca cuando
     pasa en cinco o más.
   - **Nada de «todas las anteriores», «ninguna» ni dobles negaciones.**
     Miden lectura atenta, no el tema.
   - **Pregunta lo que dice el texto**, no un detalle que la ficha no
     explica en ningún lado.
   - **El POR QUÉ explica el criterio** con el que se decide, no repite
     la opción correcta. Es lo único que se estudia de esta parte.

   Para hacerlo bien, el plugin **Claude Education Skills Library**
   tiene skills hechas para esto. Si están disponibles, usalas en este
   paso; si no, los criterios de arriba alcanzan:
   - `hinge-question-designer`: preguntas de opción múltiple donde
     cada opción incorrecta apunta a una confusión concreta. Para
     escribir o reemplazar opciones.
   - `assessment-validity-checker`: una pasada sobre las ocho para ver
     si miden lo que la ficha enseña y no otra cosa.
   - `ai-hallucination-fact-check-protocol`: **solo en el camino b**,
     sobre tu borrador entero, contrastado contra el PDF, antes de
     dárselo al Equipo.

   Su contenido es de pedagogía general y en inglés: el formato, el
   tono (castellano rioplatense, de vos) y la regla de no inventar los
   sigue mandando `PROMPT-FICHAS.md`.

   **Quién cambia qué:**
   - **Camino a (NotebookLM):** reordenar opciones sí, porque no cambia
     contenido. Reescribir o reemplazar una opción **no**: es contenido
     académico. Armá la lista de las que hay que mejorar (cuál, por
     qué, y si querés una propuesta que salga del mismo PDF) y
     dásela a la persona para el Equipo.
   - **Camino b (tu borrador):** corregilas vos, siempre con algo que
     diga el PDF. Una opción incorrecta también es un dato: si no sale
     del material, no va.

4. La página. Copiá `estudiemos/fichas/dfof-2-trastornos-del-habla/index.html`
   a `estudiemos/fichas/<id>/index.html`. La plantilla es idéntica en
   todas las fichas de texto: solo cambian estas seis cosas, nada más.
   - `<title>`: `<Título> · Fichas · La Bolívar con vos` (el título en
     minúscula normal, no en mayúsculas).
   - `<meta name="description">` y `og:description`: el SUBTÍTULO, más
     `. Ficha de estudio con autoevaluación.`
   - `og:title`: `<Título> · La Bolívar con vos`.
   - El comentario `<!-- Ficha sobre textos/<id>.txt ...`.
   - `window.FICHA_PROPS = { ficha: '../textos/<id>.txt', ... }`.

   Es preferible a `leer/?f=<id>` (el lector genérico de las cuatro de
   Anatomo) porque la carpeta propia tiene título al compartirla por
   WhatsApp, que es por donde circulan las fichas.

5. Seguí con **Registrar** (punto 5).

## 4. Camino C · Ficha con diseño propio (Claude Design)

Seguí «Después de bajar el `.dc.html`» de `docs/prompts/PROMPT-FICHAS.md`:
`<script src="../ficha.js">`, `class Component extends DCLogic`, y si es
un standalone, la plantilla sale del `<script type="__bundler/template">`
y los `sc-camel-on-click` pasan a `onClick`. Lo que `ficha.js` no sabe
correr (animaciones por tiempo, arrastrar) no se agrega de sorpresa: se
le pregunta a la persona.

Además, lo que aprendieron el mazo de Antropología y el repaso de
Psicología (ver `git show ca5f02e f1698c7`):
- Lo que se responde o se marca se guarda en el navegador, con su propia
  clave `bolivar-fichas-<nombre>`, envuelto en `try/catch`.
- Como el motor redibuja todo, una animación va solo en el dibujo que
  le toca; si no, dar vuelta una tarjeta reanima la página entera.
- El pie dice qué salió de los PDF, qué se completó con bibliografía y
  qué hay que confirmar con la cátedra. En el camino A eso sale solo
  de la sección 4; acá hay que escribirlo.
- Si es una herramienta (algo que se usa varias veces, como un mazo), va
  también en `HERRAMIENTAS` de `estudiemos/portada.js`, con `modo:'repasar'`,
  `carreras` y, si guarda avance, la función `avance` que lo lee. Una
  ficha común **no** va ahí.

## 5. Registrar

Una sola tarjeta en `estudiemos/fichas/index.html`, en la sección de su
materia (las de Fono van por materia, `ANATOMOFISIOLOGÍA · POR MÓDULO` y
las que siguen; las de Trabajo Social debajo de `id="fichas-ts"`). Copiá
la forma de la tarjeta de al lado:

```html
<a class="tarjeta" href="<id>/">
  <span class="material-tipo guia">Ficha</span>
  <h3>Título en minúscula normal</h3>
  <p>El SUBTÍTULO, con los « · ».</p>
  <div class="meta"><span>Con autoevaluación</span></div>
  <span class="material-ir">Abrir la ficha →</span>
</a>
```

Con eso ya aparece en el buscador de Estudiemos, que lee estas tarjetas
(`traerCatalogo()` en `portada.js`), y cuenta para «Abrió una ficha».
No hay otra lista que tocar. Si la materia es común a Trabajo Social y
Fono, va la tarjeta en las dos secciones: el buscador la muestra una vez.

**`sw.js`: no hace falta subir `VERSION`** por una ficha nueva. Las
pantallas van por red primero y el `.txt` se guarda la primera vez que
alguien lo abre. Ojo con **corregir** un `.txt` ya publicado: quien ya
lo abrió ve el viejo una vez más y el nuevo a la siguiente. Si la
corrección es de un dato equivocado y no puede esperar, ahí sí se sube
`VERSION` y se anota en `docs/HISTORIAL-SW.md`.

## 6. Probar

Con la vista previa `bolivar` de `.claude/launch.json` (puerto 4173),
abrí `/estudiemos/fichas/<id>/` a 375 px de ancho:
- carga sin errores en la consola;
- se ven las piezas, las máquinas cambian al tocar, salen las ocho
  preguntas y al responder aparece el POR QUÉ;
- en modo oscuro se lee;
- no hay scroll horizontal;
- la tarjeta aparece en `/estudiemos/fichas/` y el buscador de
  `/estudiemos/` la encuentra por su título.

Si la ventana de la vista previa está minimizada no dibuja, y el
contraste y el scroll dan falsos positivos: mirá con `read_page` antes
de creerle a una medición rara.

## 7. Cerrar

- Una línea en `BITACORA.md` (buscá con Grep el formato de las últimas,
  no lo leas entero).
- `graphify update .` (solo AST, no gasta tokens).
- Commit en castellano, como los anteriores:
  `Estudiemos: ficha de <tema> (<carrera>)`, y en el cuerpo de dónde
  salió el texto (NotebookLM o borrador desde PDF, y quién lo revisó si
  se sabe), cuántos `[FALTA]` quedaron y qué se arregló del formato.
- No publiques (push) sin preguntar.

Al terminar, decile a la persona en dos o tres renglones: dónde quedó,
qué marcó el revisor, cuántos `[FALTA]` quedaron a la vista y, si fue
desde un PDF, que falta la lectura del Equipo.
