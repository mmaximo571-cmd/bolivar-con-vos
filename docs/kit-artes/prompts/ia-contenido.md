# Sacar el contenido de los documentos oficiales (NotebookLM)

NotebookLM es la herramienta para esto porque **contesta solo con lo que
dicen los documentos que le cargás y cita la página**. Eso es justo lo
que hace falta: que ningún plazo ni requisito salga de la memoria de
una IA.

**Se cargan como fuentes:** el reglamento de la facultad, el calendario
académico, los instructivos de trámites, los planes de estudio. Solo
documentos oficiales.

Cada pedido devuelve texto en un formato fijo, para que Claude Code lo
pase a la base o al HTML sin reescribirlo.

---

## Trámites

```
Con las fuentes cargadas, armá la ficha de este trámite: <NOMBRE>.

Usá SOLO lo que dicen las fuentes. Al final de cada dato, entre
corchetes, la fuente y la página. Si un dato no está en las fuentes,
escribí «NO ESTÁ EN LAS FUENTES» en ese campo; no lo completes.

Formato exacto:

TÍTULO: <cómo lo nombraría un estudiante, no la facultad>
RESUMEN: <una oración: para qué sirve>
CUÁNDO: <fechas o período>
DÓNDE: <lugar o sistema>
QUÉ NECESITÁS:
- <cada requisito>
PASOS:
1. <cada paso, empezando con un verbo, de vos>
OJO: <lo que suele salir mal, solo si las fuentes lo dicen>

Castellano rioplatense, de vos, frases cortas.
```

## Preguntas frecuentes

```
Te paso preguntas reales de estudiantes, con sus palabras. Para cada
una, contestá SOLO con lo que dicen las fuentes, en dos o tres
oraciones, de vos. Citá fuente y página al final. Si las fuentes no la
contestan, escribí «NO ESTÁ EN LAS FUENTES» y no la contestes.

Formato exacto, una por bloque:

PREGUNTA: <tal cual la escribió el estudiante, corregida solo de
ortografía>
RESPUESTA: <…> [fuente, página]

Las preguntas:
<pegar>
```

## Glosario

```
Te paso una lista de palabras que se usan en la facultad. Para cada una,
SOLO con lo que dicen las fuentes:

PALABRA: <…>
EN UNA LÍNEA: <qué es, para alguien que entra a primer año>
DETALLE: <dos o tres oraciones más, si las fuentes dan para eso>
FUENTE: <documento, página>

Si una palabra no aparece en las fuentes, decilo y no la definas.

La lista:
<pegar>
```

## Plan de estudios

```
Del plan de estudios de <CARRERA>, sacá todas las materias, en una
tabla con estas columnas exactas:

código | nombre completo | año | cuatrimestre o anual | horas |
correlativas (códigos) | observaciones (asteriscos, notas al pie)

Tal cual figura en la fuente: no corrijas nombres ni completes
correlativas que no estén escritas. Si una celda no está clara en el
documento, poné «REVISAR» y en observaciones decí qué no se entiende.
```

---

## Después

1. **Alguien de la agrupación lee todo** antes de que entre a la app.
   Lo que dice «NO ESTÁ EN LAS FUENTES» se pregunta en la facultad o se
   deja afuera.
2. Se le pasa a Claude Code tal cual. Claude **no reescribe** el
   contenido: solo lo acomoda al formato de la tabla o del HTML.
3. Las citas de página no se publican, pero se guardan (en un
   comentario o en `docs/fuentes/`): son las que permiten corregir algo
   cuando la facultad cambia un reglamento.
