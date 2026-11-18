# El diseño

Dos partes: **cómo se encuentra la estética** (que es de la agrupación,
no de la Bolívar) y **las reglas que no dependen de la estética** (que
se traen tal cual porque costaron errores).

---

## Parte 1: la estética sale del Instagram

La Bolívar no eligió su aspecto en abstracto. La mayoría de la gente
conocía a la agrupación por sus placas de Instagram, y la app tenía que
parecer **de la misma mano**. Se miraron las placas y se sacó un
lenguaje: fondo amarillo, tipografía de afiche enorme, negro pleno como
ancla, el rojo como acento chico. Ese lenguaje se tradujo a cuatro o
cinco decisiones, cada una con su porqué:

| Qué | Decisión en la Bolívar | Por qué |
|---|---|---|
| El papel | `--superficie` apenas cálido, no blanco puro | Un blanco puro sobre amarillo parecía pegado encima |
| La tipografía de título | Archivo Black, un solo grosor | Pesa como los títulos de las placas |
| El color de marca | Poco, y por eso se ve | Una sola acción amarilla por pantalla |
| El celeste | Solo para el foco del teclado | En las placas no aparece nunca |

**En Artes se hace el mismo trabajo, no se copia el resultado.** El
procedimiento:

1. Juntar diez placas de la agrupación (`docs/kit/referencias/`).
2. Pasárselas a una IA de diseño con `prompts/ia-estetica.md`: que
   describa el lenguaje (qué colores, qué tipografía, qué textura, qué
   jerarquía) **y nada más**. No que proponga una app.
3. Con eso, la agrupación decide cinco cosas: color de marca, color de
   texto sobre la marca, acento, tipografía de título, tipografía de
   texto. Van a `00-ficha-del-proyecto.md`.
4. Recién ahí se escribe `css/tokens.css` (sesión 1).

**Una advertencia específica de Artes:** la gente que va a usar la app
estudia diseño, ilustración, música, cine, teatro. Va a notar una
tipografía mal elegida y una grilla que no cierra. Eso juega a favor
(es un público que valora lo cuidado) y en contra (lo genérico se nota
más). Dos consecuencias prácticas:

- **No usar la estética de plantilla** (degradés violetas, tarjetas
  flotando con sombra difusa, íconos de librería sin tratar). Es lo que
  sale por defecto de cualquier IA.
- **Mostrar el trabajo de estudiantes** puede ser la identidad visual
  misma (portadas, ilustraciones, fotos de muestras), **con permiso y con
  crédito**. Eso pesa más que cualquier color.

### Los tokens: los nombres sí se traen

Los **valores** son de la agrupación nueva. Los **nombres** se traen de
`css/tokens.css` de la Bolívar, porque nombran funciones y no colores, y
así los prompts de diseño sirven igual:

- Superficies: `--fondo`, `--superficie`, `--superficie-2`
- Texto: `--texto`, `--texto-suave`, `--sobre-color` (encima del color
  de marca), `--sobre-negro`
- Líneas: `--linea`, `--linea-negro`
- Marca y estados: `--negro`, `--rojo` (alertas), `--celeste` (foco),
  `--aviso-ok`, `--aviso-error`
- Letra: `--fuente-titulo`, `--fuente-texto`, `--fuente-datos`, y la
  escala `--letra-mini` … `--letra-titulo`
- Espacio: `--e1` (4 px) … `--e6` (32 px)
- Forma: `--radio`, `--radio-chico`, `--radio-pastilla`
- Sombra: `--sombra-1` (reposo) y `--sombra-2` (lo que se levanta), y nada más
- Tiempo: `--t-toque`, `--t-chico`, `--t-medio`, `--t-hoja`

En la Bolívar el color de marca se llama `--amarillo`. **En la app nueva
se llama `--marca`**: si el color de la agrupación es verde, un token
`--amarillo` que pinta verde es una trampa.

---

## Parte 2: las reglas que se traen tal cual

### Las cuatro reglas del sistema

1. **Un color se llama por lo que hace, no por cómo se ve.**
   `--texto-suave`, no `--gris`: de noche deja de ser gris. **Ningún
   color escrito a mano fuera de `tokens.css`.**
2. **La letra sale de la escala.** Ocho pasos. La Bolívar llegó a tener
   28 tamaños distintos, ocho con medio píxel. Si hace falta uno que no
   está, casi siempre sirve el de al lado.
3. **El espacio sale de la escala.** Seis pasos. En la Bolívar esto
   quedó sin migrar y había 27 valores; acá se respeta desde el día uno.
4. **Lo que se toca tiene estado apretado (`:active`).** Un celular no
   tiene «pasar por encima»: `:hover` no se dispara nunca. `:active` es
   la única devolución táctil. Con «menos movimiento», en vez de moverse
   se apaga.

### Las reglas de pantalla

- **Todo lo tocable mide 48 px de alto como mínimo.** Si se ve más chico
  (los puntos de un carrusel), se agranda el área con un `::before`.
- **Foco visible en todo lo tocable.**
- **Cada pantalla tiene un `h1`**, y el enlace «Saltar al contenido» es
  el primer elemento.
- **Nada tapa el contenido.** El botón flotante se aparta al bajar; el
  pie deja aire abajo.
- **El contraste se mide sobre lo dibujado, no se estima sobre el CSS.**
  En claro y en oscuro. Un color nuevo se vuelve a medir.
- **Las animaciones se apagan** con `prefers-reduced-motion`.
- **Se prueba a 375 px de ancho** (y se mira que no se rompa en 320).
- **Nada de «REVISAR» ni «EJEMPLO» publicado.** Si un texto no está
  listo, se despublica. Mejor «esto todavía lo estamos escribiendo» que
  una pantalla llena de notas internas.
- **No se inventan plazos ni reglas de la facultad.** Un campo sin
  confirmar queda vacío y la pantalla no lo muestra.

### Los textos

- Castellano rioplatense, de vos. Si la agrupación usa lenguaje
  inclusivo en sus placas, la app también, y de la misma forma.
- Sin signos de admiración de más, sin «potenciá tu experiencia».
- **Los errores dicen qué pasó y qué hacer**, no el mensaje técnico.
- **Los botones dicen lo que hacen** («Pasalo a tu calendario»), no
  «Aceptar».
- **No prometer lo que no existe.** Si la cuenta no da acceso a nada
  más, la bienvenida no lo insinúa.

### La navegación

La Bolívar probó una barra abajo, la sacó (ganó 64 px por pantalla), y
terminó con las secciones en una fila arriba, debajo de la cabecera, más
un menú lateral y un índice de todas las pantallas en el pie. La regla
que quedó: **toda pantalla tiene al menos dos puertas de entrada y
ninguna es un callejón**. El glosario llegó a tener una sola entrada y
una salida a una pantalla que no volvía; nadie lo encontraba.

---

## Cómo se usa una IA de diseño sin que conteste React

Cuando se le pide una pantalla a Gemini, Claude Design o cualquier otra
sin decirle en qué está hecha la app, contesta **React con Tailwind**.
Traducir eso a mano cuesta más que diseñarlo. El molde para pegar antes
de cada pedido está en `prompts/ia-diseno.md`.

**De lo que devuelve se toma la idea, no el código.** En la Bolívar,
Claude Design devolvió un archivo de 928 KB con las fuentes adentro; de
ahí entraron cuatro decisiones de diseño, reescritas con las clases y
los tokens de la app.
