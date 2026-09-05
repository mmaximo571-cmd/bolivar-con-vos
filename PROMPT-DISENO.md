# El molde para pedirle diseño a una IA

Este archivo existe por una razón concreta: cuando se le pide una pantalla
a Gemini (o a cualquiera) sin decirle en qué está hecha la app, contesta
**React con Tailwind**. Es lo que contesta siempre, porque es lo que hay
en internet. Y esta app no es eso: es HTML plano, sin build, sin Node.

Traducir cada componente a mano cuesta más que diseñarlo. Así que el
trabajo se hace una vez: se le pega el molde de abajo **antes** del pedido,
y lo que sale entra en la app casi sin tocar.

---

## Para copiar y pegar antes de cada pedido

> Estás diseñando una pantalla para una app web universitaria argentina,
> mobile-first, que ya existe. **No propongas React, Tailwind, ni ninguna
> librería.** No hay build ni npm: son archivos `.html` sueltos que se
> abren directo. Entregá **un solo bloque de HTML** para pegar adentro de
> `<main class="envoltura">`, sin `<html>`, `<head>` ni `<body>`.
>
> **Colores: no escribas ninguno a mano.** Usá estas variables CSS, que ya
> existen y se dan vuelta solas en modo oscuro:
>
> - `var(--fondo)` fondo de pantalla · `var(--superficie)` fondo de tarjeta
> - `var(--texto)` texto · `var(--texto-suave)` texto secundario
> - `var(--linea)` bordes suaves · `var(--tinta-borde)` bordes marcados
> - `var(--amarillo)` `#F9E830`, el color de marca
> - `var(--sobre-color)` el texto que va ENCIMA del amarillo
> - `var(--celeste)` `#0195B1`, sólo para el foco del teclado
> - `var(--rojo)` `#B52625`, sólo para alertas
>
> **El amarillo aparece UNA sola vez por pantalla**, en la acción principal.
> Si hay dos cosas amarillas, ninguna es la principal. Todo lo demás va en
> `var(--superficie)` con borde `var(--linea)`.
>
> **Tipografía**, también en variables:
> `var(--fuente-titulo)` Archivo Black · `var(--fuente-sub)` Montserrat ·
> `var(--fuente-texto)` Roboto · `var(--fuente-datos)` Roboto Mono.
> Tamaños: `--letra-mini` 12px, `--letra-chica` 13, `--letra-nota` 14,
> `--letra-densa` 15, `--letra-base` 16, `--letra-guia` 18, `--letra-sub`
> 21, `--letra-titulo` 30. **Nada de píxeles sueltos.**
>
> **Formas:** `var(--radio)` 10px, `var(--radio-chico)` 6px,
> `var(--radio-pastilla)` 99px, `var(--sombra)` que es una sombra dura
> `2px 2px 0`, sin desenfoque. La app es serigrafía, no material design.
>
> **Clases que ya existen: reusalas en vez de inventar.**
> `.envoltura` `.titulo-pantalla` `.bajada` `.titulo-seccion` `.buscador`
> `.chips` `.chip` `.lista` `.tarjeta` `.vacio` `.letra-chica`
> `.aviso-transcripcion`. Si hace falta una clase nueva, ponele nombre en
> castellano y entregá su CSS aparte, en un bloque separado.
>
> **Obligatorio:**
> - Todo lo tocable, `min-height:48px`.
> - Foco visible en todo lo tocable, en `var(--celeste)`.
> - Las animaciones se apagan con `@media (prefers-reduced-motion:reduce)`.
> - Los íconos son `<span data-ico="nombre">emoji</span>`: un script los
>   cambia por el SVG y, si no existe, queda el emoji.
> - Textos en castellano rioplatense, de vos. Sin signos de admiración
>   de más y sin lenguaje de marketing.

---

## Lo que NO hay que pedirle

**Que invente contenido académico.** Si el diseño necesita el nombre de
los cartílagos o cómo se aprueba una materia, eso lo pone la cátedra o el
Equipo, no la IA. Pedile la estructura y dejá los textos con `LOREM` o
con `REVISAR:`, que es lo que ya se usa en las filas de ejemplo.

**Que prometa funciones que no existen.** Pasó con el botón «SUBIR MI
RESUMEN»: se ve muy bien, pero la app no recibe archivos. Antes de pedir
una pantalla con una acción nueva, hay que saber si la acción existe.

**Que decida el color de una alerta o de un estado.** Los contrastes ya
están medidos y anotados en `estilos.css`. Un color nuevo hay que volver
a medirlo, y midiendo mal da «ok» casi siempre.

---

## Después de pegar lo que salga

1. Abrirlo con el servidor de prueba y mirarlo en 375px de ancho.
2. Mirarlo también en oscuro (el menú ☰ → oscuro).
3. **Si tocaste `estilos.css`, `app.js`, `iconos.js` o `config.js`, hay que
   subir el número de versión en `sw.js`** y anotar por qué. Son los
   archivos del armazón: sin subirlo, quien ya tiene la app instalada
   recibe el HTML nuevo con el CSS viejo.

Las pantallas sueltas (`.html`) no necesitan versión nueva: van por red
primero.
