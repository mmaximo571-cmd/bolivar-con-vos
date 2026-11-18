# Sesión 1 · Los estilos

## Antes

La ficha tiene que tener llena la sección 4 (estética): color de marca,
texto sobre la marca, acento, tipografía de título y de texto. Si no,
primero `ia-estetica.md` con las placas.

## El prompt

```
TAREA: Sesión 1. Escribir css/tokens.css y los doce archivos de
css/base/, y una página de muestra que los use todos.

LEÉ PRIMERO:
- docs/kit/00-ficha-del-proyecto.md, sección 4 (estética)
- docs/kit/03-diseno.md entero
- docs/kit/01-arquitectura.md, la sección «Los estilos»
- Las placas de docs/kit/referencias/, si están

MIRÁ EN LA REFERENCIA, por tramos:
- css/tokens.css: los NOMBRES de los tokens y cómo se redefinen bajo
  [data-tema="oscuro"]. Los valores no sirven: son de otra agrupación.
- css/base/01-cimientos.css: el reset, «saltar al contenido», el foco
  y el estado apretado.
- Mirá el encabezado de cada uno de los doce de css/base/ para saber
  qué va en cada uno. No los copies: escribí la versión de esta app.

HACÉ:
1. css/tokens.css con los valores de la ficha. El color de marca se
   llama --marca (no --amarillo). Escala de letra de ocho pasos, escala
   de espacio de seis (--e1 4px a --e6 32px), dos sombras (--sombra-1
   reposo, --sombra-2 lo que se levanta), radios y
   tiempos. El modo oscuro bajo [data-tema="oscuro"], una sola copia.
2. Los doce archivos de css/base/, con lo mínimo de cada componente:
   botón, campo, chip, tarjeta, lista, pestañas, la hoja que sube,
   aviso, vacío, error, esqueleto de carga, calendario mensual,
   cabecera, menú, pie. Sin colores ni tamaños escritos a mano.
3. muestra/index.html (no se publica en el menú) con todos los
   componentes, siguiendo docs/kit/prompts/plantilla-pantalla.md. Con
   un botón que cambie data-tema para mirar claro y oscuro.
4. Medí el contraste de texto sobre fondo en claro y en oscuro sobre lo
   dibujado (getComputedStyle), no sobre el CSS. Mínimo 4,5 en texto
   normal. Anotá los números en un comentario de tokens.css.
5. Comprobá que cada variable resuelve: un elemento con
   font-size: var(--letra-mini) que mida 16px quiere decir que la
   variable no existe.

NO:
- No uses degradés, sombras difusas grandes ni la estética de
  plantilla (ver 03-diseno.md).
- No agregues ninguna librería de CSS.
- No crees una hoja que cargue última y pise a las demás.

TERMINADO CUANDO: muestra/ se ve bien a 375px y a 320px, en claro y
oscuro, todo lo tocable mide 48px, el foco se ve, el contraste da 4,5
o más, y ningún archivo de css/ tiene un color fuera de tokens.css
(comprobalo con grep de # y rgb fuera de tokens.css).
```

## Después

Mirar `muestra/` en el teléfono, con alguien de la agrupación al lado.
Es el momento barato para cambiar un color: después hay que volver a
medir todo.
