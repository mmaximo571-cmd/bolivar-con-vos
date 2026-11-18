# Las pantallas

Tres listas: lo que la Bolívar tiene y se repite, lo que la Bolívar
tiene y **no** se trae, y lo que podría ser propio de Artes. La última
lista son propuestas: **la agrupación elige**, y cada una vale solo si
alguien de la agrupación la va a mantener.

**La regla para elegir:** una pantalla que nadie actualiza es peor que
no tenerla. Una fecha vieja hace que alguien se pierda una mesa; un
contacto viejo hace que alguien escriba al vacío.

---

## 1. El núcleo: se hace en este orden

Con estas siete la app ya sirve. Son las que la Bolívar tuvo en su
lanzamiento.

| Pantalla | Carpeta | Qué hace | Datos | Referencia en la Bolívar |
|---|---|---|---|---|
| **Inicio** | `/` | Cabecera, secciones, buscador, «lo próximo», accesos, novedades, calendario chico | `categorias`, `publicaciones` | `index.html` (136 KB: por tramos) |
| **Info útil** | `tramites/` | Trámites paso a paso y preguntas frecuentes | `tramites`, `faq` | `tramites/index.html` |
| **Fechas** | `agenda/` | Calendario, fechas académicas, eventos, novedades; pasar una fecha al calendario del celular | `publicaciones` | `agenda/`, `lib/fecha-al-calendario.js` |
| **Mi año** | `carrera/` | El plan de estudios, qué materias cursé, qué puedo cursar (correlativas), el promedio | El plan va en un `.js` (ver abajo); lo de cada estudiante, en el teléfono | `carrera/` |
| **Perfil** | `mi/` | Cuenta **opcional**: entrar, crear, borrar mi cuenta, el tema | `perfiles` | `mi/index.html` |
| **Quiénes somos** | `quienes/` | La agrupación, editable desde el panel | `pagina_quienes` | `quienes/` |
| **Panel** | `panel/` | Donde el equipo carga todo. Solo rol `equipo` | todas | `panel/index.html` (198 KB: **nunca entero**) |

**La app se usa entera sin registrarse.** La cuenta sirve para guardar
cosas entre teléfonos, nada más, y eso se dice en el perfil.

**El plan de estudios va en el código, no en Supabase.** Es el
reglamento: cambia una vez cada muchos años, y así se lee sin señal. Lo
mismo con el glosario.

**Mi año guarda en el teléfono primero.** Quien no tiene cuenta igual
marca sus materias; si después crea cuenta, se sube. Se pregunta al
entrar si es ingresante o ya cursa, y se muestra distinto.

---

## 2. Lo que se suma después del lanzamiento

| Pantalla | Qué hace | Cuándo vale la pena |
|---|---|---|
| **Glosario** (`glosario/`) | Las palabras raras de la facultad, respuesta corta arriba, detalle abajo. Una dirección por palabra (`#promocion`) | Siempre: es barato y el buscador lo usa |
| **Cátedras** (`catedras/`) | A quién escribirle en cada materia | Si la facultad publica los mails |
| **Dónde curso** (`donde-curso/`) | Aula, día y horario de cada comisión | Si la facultad publica los horarios a tiempo |
| **Estudiemos** (`estudiemos/`) | Material de los grupos de estudio, por materia | Si hay grupos de estudio que produzcan material |
| **Avisanos** (botón flotante) | Un chat que contesta con el FAQ y, si no alcanza, deriva a una persona por WhatsApp | Si hay **dos personas por carrera** que contesten |
| **Decilo** (`decilo/`) | Buzón anónimo de pedidos y propuestas, con respuestas públicas | Si el centro tiene quien conteste y modere (rol `comunicacion`) |
| **Cómo llegar** (`llegar/`) | Cómo llegar a la sede en transporte público | Si hay más de una sede o queda lejos |
| **Espacios** (`espacios/`) | Buffet, fotocopiadora, lo autogestionado | Si existen |
| **Salud mental y género** (`salud-mental/`) | Derechos, servicios gratuitos, a quién recurrir | Siempre, con datos confirmados por las áreas de la universidad |
| **Ingreso** (`ingreso/`) y **Primeros pasos** | Cómo anotarse, y la app paso a paso | Antes de cada ingreso |
| **Feriazo** (`feriazo/`) | Emprendimientos de estudiantes, docentes y no docentes, con la carga por la propia gente y revisión del equipo | **En Artes, muy probable**: ver abajo |
| **Avisos al celular** | Notificaciones con la app cerrada: inscripciones, novedades marcadas | Última fase. Cuatro piezas, y si falta una nadie se entera |

---

## 3. Lo que NO se trae

Son de la Bolívar, de Trabajo Social o de Fonoaudiología:

- **Anatomofisiología, el visor 3D, la Fonoteca, las fichas de
  Fonoaudiología**: material de una materia de otra facultad. Lo que sí
  se trae es la **idea**: una herramienta de estudio hecha a medida de
  una materia difícil, armada con la cátedra. En Artes podría ser otra
  cosa (ver abajo).
- **Trayecto optativo, Mapa de riesgo, Congreso, Consejo**: específicas
  de esa facultad y ese año.
- **La «línea» editorial** (`frente`, `gremial`, `info`, `saberes`): son
  las categorías de la Bolívar.
- **El «Asistente Simón»** que venía en un prototipo: un chat con ocho
  `if` de palabras clave que prometía conversación y contestaba un FAQ.
  El buscador hace lo mismo sin prometer de más.

---

## 4. Propuestas propias de Artes

**Ninguna de estas existe hasta que la agrupación confirme que hay de
qué.** Por ejemplo: no se arma una pantalla de préstamo de equipos sin
saber si la facultad presta equipos, cómo y a quién.

| Propuesta | Qué resolvería | Qué hace falta saber antes |
|---|---|---|
| **Muestras y funciones** | Dónde y cuándo se ve lo que hacen estudiantes: muestras de cierre, conciertos, funciones, proyecciones. Es la versión de Artes de «Fechas», y probablemente lo que más se comparta | Quién carga cada fecha. Puede ir como un `tipo` más en `publicaciones` en vez de pantalla aparte |
| **Convocatorias** | Becas, concursos, residencias, salones, llamados a muestras, con fecha de cierre y alarma | De dónde salen (la facultad, la universidad, afuera) y quién las revisa. Una convocatoria vencida publicada hace daño |
| **Vidriera** | Obras y trabajos de estudiantes, con crédito y enlace a su portfolio o Instagram. El Feriazo de la Bolívar ya resuelve la carga por la propia gente con revisión del equipo | Permiso explícito de cada persona. Qué pasa con obra de menores o con contenido sensible |
| **Feria de emprendimientos** | Lo mismo que el Feriazo: quién vende qué (ilustración, cerámica, serigrafía, encuadernación) | Si la agrupación ya hace ferias |
| **Materiales** | Dónde comprar, descuentos acordados, qué pide cada cátedra al empezar | Si hay acuerdos con comercios; las listas de materiales por cátedra |
| **Talleres y salas** | Qué aulas-taller hay, horarios de uso libre, cómo reservar una sala de ensayo o un espacio | Si existe un sistema de reserva; si no, alcanza con horarios |
| **Préstamo de equipos** | Qué se presta (cámaras, luces, instrumentos), dónde, con qué requisitos | Si existe y quién lo gestiona |
| **Herramienta de estudio de una materia** | El equivalente a la Fonoteca: algo interactivo hecho con la cátedra para una materia que cuesta (historia del arte con línea de tiempo, armonía, color, lo que sea) | Una cátedra dispuesta a revisar el contenido. El contenido académico sale de la cátedra, nunca de la IA |

**Para decidir cuáles,** se le puede pasar esta tabla junto con
`00-ficha-del-proyecto.md` a una IA con `prompts/ia-curaduria.md`: no
para que invente, sino para que ordene con los criterios que da la
agrupación.

---

## Lo que tiene cada pantalla, sin excepción

- El esqueleto de `prompts/plantilla-pantalla.md`: `<head>` con los
  metadatos para compartir, el script del tema, las hojas en orden,
  `#cabecera`, `<main>` con su `h1`, y los scripts al final.
- Su nombre igual en la sección, el `<title>`, el `og:title` y el `h1`.
- Un estado vacío que dice algo («todavía no cargamos fechas para este
  mes»), un esqueleto mientras carga y un error que se entiende.
- Probada a 375 px, en claro y en oscuro, con la red cortada.
