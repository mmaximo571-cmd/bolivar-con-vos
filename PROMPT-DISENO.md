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
> - `var(--fondo)` fondo de pantalla, un blanco apenas cálido ·
>   `var(--superficie)` fondo de tarjeta · `var(--superficie-2)` fondo
>   suave adentro de una tarjeta (paneles, filas agrupadas)
> - `var(--texto)` texto · `var(--texto-suave)` texto secundario
> - `var(--linea)` bordes y separadores. `var(--tinta-borde)` ya **no es
>   negro**: es el mismo beige que la línea. Nunca lo uses de fondo.
> - `var(--amarillo)` `#F9E830`, el color de marca
> - `var(--sobre-color)` el texto que va ENCIMA del amarillo
> - `var(--negro)` y `var(--sobre-negro)` para un bloque de mucho peso
>   (la cabecera, un banner) y su texto
> - `var(--celeste)` `#0195B1`, sólo para el foco del teclado
> - `var(--rojo)` `#B52625`, sólo para alertas
> - Etiquetas de línea editorial, en pastel plano: `var(--et-frente)`
>   `var(--et-gremial)` `var(--et-info)` `var(--et-saberes)`
>
> **El amarillo es poco y por eso se ve.** Una sola acción principal
> amarilla por pantalla. Además sólo puede ir en lo que marca «esto está
> elegido» o «esto es hoy»: el chip activo, el día elegido del
> calendario. Si hay dos botones amarillos, ninguno es el principal. Todo
> lo demás va en `var(--superficie)` con borde `var(--linea)`.
>
> **Tipografía: dos voces.** `var(--fuente-titulo)` es Archivo Black,
> sólo para títulos de pantalla y marca. Todo lo demás es Roboto:
> `var(--fuente-texto)`, `var(--fuente-sub)` y `var(--fuente-datos)`
> apuntan las tres a Roboto, y los datos se distinguen por tamaño, peso
> y cifras tabulares, no por otra fuente. **No cargues Montserrat ni
> Roboto Mono** (la única excepción es la portada de Estudiemos, que usa
> Roboto Mono para sus datos). Los títulos de tarjeta no van en mayúsculas.
> Tamaños: `--letra-mini` 12px, `--letra-chica` 13, `--letra-nota` 14,
> `--letra-densa` 15, `--letra-base` 16, `--letra-guia` 18, `--letra-sub`
> 21, `--letra-titulo` 30. **Nada de píxeles sueltos.**
>
> **Formas:** `var(--radio)` 14px, `var(--radio-chico)` 10px,
> `var(--radio-grande)` 20px, `var(--radio-pastilla)` 99px.
> **Sombras, dos y nada más:** `var(--sombra-1)` es el reposo de una
> tarjeta (baja y casi invisible) y `var(--sombra-2)` es lo que se
> levanta (el calendario, un banner, la tarjeta señalada). Nada de
> sombra dura corrida ni de borde negro alrededor de cada tarjeta: eso
> era el diseño anterior. Lo impreso queda sólo en la trama de puntos
> de la cabecera y en el negro pleno como ancla.
>
> **Clases que ya existen: reusalas en vez de inventar.**
> `.envoltura` `.titulo-pantalla` `.bajada` `.titulo-seccion` `.buscador`
> `.chips` `.chip` `.lista` `.tarjeta` `.etiqueta` `.vacio` `.letra-chica`
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
están medidos y anotados en `estilos.css` y `estilos-rediseno.css`. Un color nuevo hay que volver
a medirlo, y midiendo mal da «ok» casi siempre.

---

## Después de pegar lo que salga

1. Abrirlo con el servidor de prueba y mirarlo en 375px de ancho.
2. Mirarlo también en oscuro (el menú ☰ → oscuro).
3. **El CSS nuevo va en `estilos-rediseno.css`, no en `estilos.css`.**
   Se carga después y manda sobre las tarjetas: una regla escrita en
   `estilos.css` puede no ganar nunca (pasó el 19/9 con las placas de
   Instagram).
4. **Si tocaste `estilos.css`, `estilos-rediseno.css`, `app.js`, `iconos.js` o `config.js`, hay que
   subir el número de versión en `sw.js`** y anotar por qué. Son los
   archivos del armazón: sin subirlo, quien ya tiene la app instalada
   recibe el HTML nuevo con el CSS viejo.

Las pantallas sueltas (`.html`) no necesitan versión nueva: van por red
primero.
