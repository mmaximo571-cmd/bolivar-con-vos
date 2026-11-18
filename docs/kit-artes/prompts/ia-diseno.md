# El molde para pedirle diseño a una IA

Cuando se le pide una pantalla a Gemini, Claude Design o cualquier otra
sin decirle en qué está hecha la app, contesta **React con Tailwind**.
Traducir eso cuesta más que diseñarlo. Se pega el molde **antes** del
pedido, y lo que sale entra casi sin tocar.

**Hay que completarlo una vez**, después de la sesión 1, con los valores
reales de `css/tokens.css` y las clases que existan. Mientras tanto
sirve igual con los nombres.

---

## Para copiar y pegar antes de cada pedido

> Estás diseñando una pantalla para una app web universitaria argentina,
> mobile-first, que ya existe: <NOMBRE APP>, de <AGRUPACIÓN>, para
> estudiantes de <FACULTAD>. **No propongas React, Tailwind, ni ninguna
> librería.** No hay build ni npm: son archivos `.html` sueltos que se
> abren directo. Entregá **un solo bloque de HTML** para pegar adentro
> de `<main class="envoltura">`, sin `<html>`, `<head>` ni `<body>`.
>
> **Colores: no escribas ninguno a mano.** Usá estas variables CSS, que
> ya existen y se dan vuelta solas en modo oscuro:
>
> - `var(--fondo)` fondo de pantalla · `var(--superficie)` fondo de
>   tarjeta · `var(--superficie-2)` fondo suave adentro de una tarjeta
> - `var(--texto)` texto · `var(--texto-suave)` texto secundario
> - `var(--linea)` bordes y separadores
> - `var(--marca)` <HEX>, el color de la agrupación ·
>   `var(--sobre-color)` el texto que va encima de la marca
> - `var(--negro)` y `var(--sobre-negro)` para un bloque de mucho peso
> - `var(--celeste)` sólo para el foco del teclado (o el que corresponda)
> - `var(--rojo)` sólo para alertas
>
> **La marca es poca y por eso se ve.** Una sola acción principal con
> `--marca` por pantalla, y lo que marca «esto está elegido» o «esto es
> hoy». Si hay dos botones de color marca, ninguno es el principal.
>
> **Tipografía:** `var(--fuente-titulo)` <FAMILIA> sólo para títulos de
> pantalla y marca; todo lo demás `var(--fuente-texto)` <FAMILIA>. No
> cargues otras fuentes. Tamaños, sólo de esta escala:
> `--letra-mini` … `--letra-titulo` (<COMPLETAR CON LOS PX>). **Nada
> de píxeles sueltos.** Espacios, sólo `--e1` (4px) a `--e6` (32px).
>
> **Formas:** `var(--radio)`, `var(--radio-chico)`,
> `var(--radio-pastilla)`. **Dos sombras y nada más:** `var(--sombra-1)`
> reposo, `var(--sombra-2)` lo que se levanta. <AGREGAR LO QUE LA
> AGRUPACIÓN DECIDIÓ QUE NO VA: degradés, bordes, etc.>
>
> **Clases que ya existen: reusalas en vez de inventar.**
> <COMPLETAR después de la sesión 1: .envoltura .titulo-pantalla .bajada
> .titulo-seccion .tarjeta .lista .chip .chips .boton .vacio …>.
> Si hace falta una clase nueva, nombre en castellano y su CSS aparte,
> en otro bloque.
>
> **Obligatorio:**
> - Todo lo tocable, `min-height:48px`, con estado `:active`.
> - Foco visible en todo lo tocable.
> - Las animaciones se apagan con `@media (prefers-reduced-motion:reduce)`.
> - Íconos: `<span data-ico="nombre">emoji</span>`; un script los cambia
>   por el SVG y, si no existe, queda el emoji.
> - Textos en castellano rioplatense, de vos. Sin signos de admiración
>   de más y sin lenguaje de marketing.

---

## Lo que NO hay que pedirle

- **Que invente contenido académico.** Nombres de materias, requisitos,
  fechas: los pone la facultad o la agrupación. Pedile la estructura y
  dejá los textos con `REVISAR:`.
- **Que prometa funciones que no existen.** En la Bolívar salió un botón
  «SUBIR MI RESUMEN» precioso, y la app no recibía archivos.
- **Que decida el color de una alerta o de un estado.** Los contrastes
  están medidos; un color nuevo hay que volver a medirlo.

## Después de pegar lo que salga

1. Se guarda en `docs/disenos/` y se le pasa a Claude Code con
   `P20-pantalla-nueva.md` (o el prompt de la sesión que corresponda).
2. **De lo que devuelve se toma la idea, no el código** si viene con
   fuentes adentro, componentes propios o un archivo enorme.
3. Se mira a 375px y en oscuro antes de publicar.
