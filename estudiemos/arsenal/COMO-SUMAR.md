# Cómo sumar algo al Arsenal

El Arsenal se arma solo a partir de `datos.json`, en esta carpeta. Para
sumar un libro, un artículo, una peli del Cine Club o un disco **no hay
que tocar código**: se copia un bloque, se le cambia todo, y listo.

## 1. Copiá un bloque

Adentro de `"materiales": [ … ]` cada material es un bloque entre llaves.
Copiá uno entero, pegalo abajo del último y cambiale los datos:

```json
{
  "id": "artaud-spinetta",
  "titulo": "Artaud",
  "autoria": "Pescado Rabioso (Luis Alberto Spinetta)",
  "anio": "1973",
  "tipo": "disco",
  "disciplinas": ["cultura-territorio"],
  "fila": "sin-apuro",
  "porque": "Dos o tres oraciones, como se lo dirías a une compa en el pasillo.",
  "dato": "9 temas",
  "boton": { "texto": "Escuchar", "url": "https://…" },
  "sumado": "2026-10-02"
}
```

(Es un ejemplo de la forma, no un material cargado: el link no existe.)

## 2. Los campos

| Campo | ¿Hace falta? | Qué va |
|---|---|---|
| `id` | **sí** | Un nombre corto y único: minúsculas, números y guiones, sin tildes ni espacios. **Una vez publicado no se cambia nunca**: es lo que guarda el teléfono de quien lo marcó para el finde. |
| `titulo` | **sí** | Como figura en la tapa. |
| `porque` | **sí** | «Por qué te lo recomendamos». Es lo que hace a una recomendación: sin esto el bloque no sale. |
| `tipo` | conviene | Uno de los de `"tipos"`, arriba del archivo: `libro`, `articulo`, `revista`, `pelicula`, `corto`, `disco`, `ensayo`. Decide la etiqueta y el color de la portada. |
| `autoria` | conviene | Autora, autor, directora, banda. |
| `anio` | conviene | Entre comillas: `"2005"`. |
| `disciplinas` | conviene | Una o varias de `"disciplinas"`: `["trabajo-social", "cultura-territorio"]`. Decide en qué filtro aparece. En «Todo» sale siempre. |
| `fila` | conviene | Una de `"filas"`: en qué fila va. Sin fila, va a «Más del Arsenal». |
| `boton` | conviene | `{ "texto": "Leer PDF", "url": "https://…" }`. **Sin `boton`, el botón busca el título en el catálogo de las bibliotecas de la UNLP** (el de `"biblioteca"`, arriba del archivo), que es lo que corresponde a un libro que no está en internet. |
| `buscar` | no | Solo para los que no tienen `boton`: qué se busca en el catálogo si el título no alcanza (por ejemplo, el título sin el subtítulo). Sin esto se busca el título. |
| `dato` | no | Lo que ayuda a decidir: `"120 min"`, `"18 páginas"`, `"8 temas"`. |
| `portada` | no | Una imagen de la tapa, guardada en `portadas/`: `"portadas/artaud.webp"`. **Sin portada, la app dibuja una con el título**, así que no hace falta conseguirla. Si la subís: vertical, en `.webp` o `.jpg`, que pese menos de 100 KB. |
| `sumado` | no | La fecha en que se sumó, `"AAAA-MM-DD"`. Durante 14 días sale el sello «Nuevo». |
| `oculto` | no | `true` para sacarlo sin borrarlo (y sin perder las marcas de quien lo guardó). |

## 3. El porqué

Es la parte que importa, y es lo que diferencia al Arsenal de una lista
de Wikipedia. Va como lo dirías en el pasillo:

- **Qué te resuelve**: para qué parcial, para qué práctica, qué se
  entiende mejor después de leerlo o verlo.
- De vos, en plural de la agrupación («te lo pasamos porque…»), con la e.
- Dos o tres oraciones. Sin «imperdible», sin «increíble», sin signos de
  admiración. La guía completa está en `marca/VOZ.md`.
- **No digas que una cátedra lo pide si no lo confirmó la cátedra.**

## 4. Los links: solo legales

El botón lleva a donde el material está **de forma legal y gratuita**:
repositorios de la universidad (SEDICI), revistas de acceso abierto,
CLACSO, CINE.AR PLAY, Canal Encuentro, el canal oficial de quien lo hizo.
**Nada de PDFs pirateados ni subidas de terceros**: el Arsenal lo firma la
agrupación. Si un libro no está en ningún lado legal, no le pongas
`boton`: la app arma sola la búsqueda en la biblioteca.

## 5. Las tres cosas que rompen el archivo

Un JSON no perdona. Si algo de esto pasa, el Arsenal no abre para nadie:

1. **Una coma después del último bloque** (o del último campo de un
   bloque). Entre bloques va coma; después del último, no.
2. **Una coma que falta** entre dos bloques o entre dos campos.
3. **Comillas adentro de un texto.** Para citar, usá las latinas: «así».

## 6. Antes de subirlo, probalo

- En la compu, con la app corriendo, abrí `estudiemos/arsenal/`: si a
  algún bloque le falta algo, arriba sale **un recuadro rojo** que dice
  cuál y qué. Ese recuadro sale **solo en tu compu**, nunca en la app
  publicada.
- En la compu de Máximo, además, `python pruebas-avisos/arsenal.py`
  revisa el archivo entero y dice en qué renglón está el error. Esa
  carpeta **no está en GitHub** (queda fuera del repo a propósito): si
  editás desde GitHub, no la vas a encontrar, y alcanza con el recuadro
  rojo.

## 7. Después de subirlo

Aparece solo, sin tocar nada más: el service worker pide esta carpeta
primero a la red (ver `sw.js`, v82), así que quien entre al Arsenal ve
lo nuevo en esa misma visita. No hace falta subir la versión.

Para agregar **un filtro** (una disciplina), **una fila** o **un tipo**
nuevo, se suma a la lista de arriba del archivo (`"disciplinas"`,
`"filas"`, `"tipos"`) con la misma forma que los que ya están. Tampoco
toca código.
