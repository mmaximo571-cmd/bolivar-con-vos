# Evaluación de la app y plan hacia 2027

**Hecha el domingo 8/11/2026**, dos días después de las elecciones, con
los números leídos de Supabase ese mismo día (no estimados). El plan que
sale de acá está resumido arriba de todo en `BITACORA.md`, en «Hacia el
ingreso 2027», y esa sección es la que manda. Este archivo es el
respaldo: el porqué de cada decisión.

Dos objetivos, fijados por Máximo:

1. **De acá a febrero: que la app le sirva a quien entra en 2027.**
2. **Un esquema de trabajo para que en 2027 la app sea la más completa
   de la UNLP.** El salto de escala.

---

## En una página

**La app tiene una base fiel y un techo bajo.** Casi 1.000 teléfonos
eligieron carrera (38 % del padrón), y unas 400 veces por semana alguien
la vuelve a abrir desde la pantalla de inicio del celular. Eso, dos
meses después del lanzamiento y sin picos de Instagram, es lo mejor que
tiene. Pero desde el 28/9 entran unas 40 personas nuevas por semana, los
avisos están clavados en 112 teléfonos y lo que depende de que alguien
del equipo haga algo todos los días (contestar, cargar, avisar) se cortó.

**Lo que hay que mirar primero, en este orden:**

1. **La inscripción a la UNLP abre mañana, lunes 9/11, y la lista del
   grupo de ingresantes no está abierta**: `sql/tabla-ingresantes.sql`
   nunca se corrió. El formulario dice «escribinos por Instagram».
2. **Decilo tiene dos pedidos sin contestar**, del 21 y del 25/10. La
   promesa era 48 h y van 14 y 18 días.
3. **El calendario se termina el 18/12.** No hay ni una fecha de 2027
   cargada, y desde el 27/8 no se cargó ninguna fecha nueva.
4. **No se sabe qué publicación trae gente**: de 17.637 visitas, 12
   llegaron con `?de=`.

**El salto de escala no es sumar pantallas: es completar las que hay.**
Seis pantallas se llevan el 86 % de las visitas. La app ya tiene 23, y
once de ellas tuvieron menos de 35 visitas en el último mes. «La más
completa de la UNLP» se puede medir: que cada una de las 94 materias de
las tres carreras tenga programa, cátedra, guía y material. Hoy el
programa está en 44, la cátedra en 76 y la guía en **1**.

---

## 1. Lo que dice el registro

### El alcance

| Qué | Total | Últimos 30 días | Comentario |
|---|---|---|---|
| Visitas | 17.637 (desde el 31/8) | 4.609 (~150 por día) | estable desde octubre |
| «Eligió carrera» (≈ teléfonos) | **951** | 165 | 38 % del padrón de 2.500; la meta de 1.000 quedó cerca |
| «Volvió instalada» | 4.807 | 1.743 | **la señal más fuerte**: ~400 vueltas por semana |
| «Instaló» | 121 | 21 | |
| Cuentas | 578 | 56 nuevas | 1 con rol `comunicacion`, ninguna otra del equipo |
| Mi año guardado en la cuenta | 169 | 152 actualizados | la gente que usa la app en serio |
| Avisos prendidos | **112** | 20 nuevos | la meta era 130; no crece |
| Avisos entregados | 616 | | casi todos paros |

**Las semanas, en visitas:** 8.752 la del lanzamiento (21/9); después
1.539, 1.188, 1.012, 1.195, 1.285 y 784 (la de las elecciones, hasta
hoy). **«Eligió carrera» por semana:** 631 el lanzamiento; después 55,
40, 44, 39, 50, 24. La app sostiene a quien ya la tiene, pero suma poca
gente nueva fuera de los empujones de Instagram.

### Qué se usa

Visitas de los últimos 30 días por pantalla:

| Pantalla | Visitas | | Pantalla | Visitas |
|---|---|---|---|---|
| Inicio | 1.759 | | Ingreso 2027 | 31 |
| Mi año (`carrera/`) | 777 | | Arsenal | 25 |
| Mi perfil (`mi/`) | 494 | | Glosario | 20 |
| Info útil (`tramites/`) | 373 | | Decilo | 18 |
| Estudiemos | 288 | | Salud mental | 16 |
| Fechas (`agenda/`) | 268 | | Feriazo, Primeros pasos | 15 c/u |
| Fichas (índice) | 84 | | Quiénes, Dónde curso | 14 c/u |
| Cátedras | 80 | | Mapa de riesgo | 13 |
| Congreso | 78 | | Videos | 12 |
| Mis parciales | 62 | | Consejo, Cómo llegar | 4 c/u |
| Espacios | 43 | | | |
| Trayecto | 39 | | | |
| Anatomo | 35 | | | |

Las seis primeras suman 3.959 de 4.609: **el 86 %**. Ingreso, Primeros
pasos y Cómo llegar tienen pocas visitas porque son para un público que
todavía no llegó; el resto de la cola larga no tiene esa excusa.

### Qué se busca

El buscador anotó 139 búsquedas. Lo que más se repite, juntando las
escritas a medias:

- **Materias, para estudiar:** Filosofía (5), Configuración de los
  problemas sociales (2), Bases (5), Teorías, Historia, Psicología del
  desarrollo, Sujetos colectivos, fonética; y «Resumen», «Ficha», «Plan».
- **Contactos:** mail o mails (6), cátedra (2).
- **Lugares y trámites:** Hospital (5), Boleto (2), mesas (3), Horarios
  (2), Promo, Libres, Promedio, Formulario, biblioteca.
- **Lo que no existe en la app:** Verano (2), Tif y Trabajo integrador,
  Menú.

**Lo que dice:** la gente entra a buscar **material de la materia que
está cursando**, y muchas de esas materias no lo tienen (ver la
cobertura, abajo). Y hay dos huecos con nombre: el **trabajo final**
(TIF) y el **verano** (qué pasa entre diciembre y marzo).

### Escuchar y responder

| | Cuánto | Estado |
|---|---|---|
| Decilo | 2 pedidos (21/10 y 25/10, los dos de Fono, «Cursada y estudio») | **los dos en «recibido», sin primera respuesta** |
| Avisanos | 11 consultas en total | ninguna en los últimos 30 días |
| Novedades cargadas | 2 en total | la última, el 22/9 |
| Fechas cargadas | 45 | la última carga, el 27/8 |
| Eventos | 7 | la última carga, el 11/10 |

La meta del 10/10 era «una novedad con aviso por semana» y «todos los
pedidos contestados en menos de 48 h». No se cumplió ninguna de las dos.
**No es un problema de código**: el buzón, la bandeja y los avisos al
autor andan desde el 15/10. Es que hay **una sola persona** con el rol
de comunicación.

### Lo que no se puede medir

- **De dónde viene la gente.** `deDondeVino()` funciona (se probó con
  `prueba-captura`), pero de 17.637 visitas solo 12 llegaron con `?de=`.
  Los links de Instagram, del mail de noviembre y de Decilo se publicaron
  sin etiqueta, o no se publicaron. Sin eso no se puede decir qué
  posteo trajo gente y cuál no.
- **Si a alguien le sirvió.** No hay ninguna señal de «esto me sirvió»
  en las fichas, los trámites ni las respuestas de Decilo.

### Errores

59 en 30 días. Unos 45 vienen del navegador de Instagram y 9 son cargas
cortadas: ruido conocido. **Quedan cuatro propios y chicos** (8 casos):
`pintarAvisos is not defined` en `mi/` (3), `LUGAR_POR_DEFECTO` declarada
dos veces en el inicio (2, probablemente una versión vieja guardada:
en el código de hoy se carga una sola vez), `reading 'materias'` en
`carrera/` (2) y `vigilarAparicion is not defined` en Espacios y Salud
mental (1 c/u). Una sesión corta los cierra.

### Seguridad

El asesor de Supabase no marca nada nuevo: las advertencias son las
funciones `security definer` que se llaman sin cuenta (a propósito: el
buzón, los avisos, el respaldo, «Me anoto»), las tablas con RLS y sin
políticas (a propósito: solo se tocan por funciones) y la protección de
contraseñas filtradas (es de plan Pro, cerrado el 5/9). Antes de abrir
la lista de ingresantes, que guarda **nombre, número de WhatsApp y
localidad de gente que todavía no empezó la facultad**, conviene una revisión de seguridad como la que
se hizo con Decilo.

---

## 2. Qué anda

- **La vuelta.** ~400 aperturas por semana desde la pantalla de inicio
  del celular, sin campaña. La gente que la instaló la usa.
- **Mi año** es la segunda pantalla y la razón de volver: 169 personas
  la guardaron en su cuenta y 152 la tocaron este mes. 1.067 «marcó
  materia».
- **Los avisos, cuando hay qué avisar.** 616 entregados. Los paros
  avisan solos y es lo único que llegó con regularidad.
- **Estudiemos crece:** «abrió una ficha» pasó de 24 a 75 en el último
  mes, Mis parciales arrancó con 62 visitas, «prendió época de
  parciales» 23.
- **La base técnica.** HTML sin compilar, la base partida en doce hojas,
  el grafo para no gastar tokens, las pruebas de orden de CSS y de
  referencias. Una persona con Claude puede mantener 23 pantallas, y
  eso no es poco.
- **El modo ingreso ya está hecho** (v98, 24/10): «¿Empezás la facu en
  2027?», Ingreso con las fechas de la resolución 964-26, Primeros
  pasos, los recorridos guiados, Cómo llegar y la solapa Ingresantes del
  panel. Falta encenderlo, no construirlo.

## 3. Qué no anda

1. **Lo que depende de una persona todos los días se cae.** Decilo sin
   contestar, novedades paradas desde septiembre, calendario sin cargar
   desde agosto. Es el riesgo más grande del salto de escala: cada
   pantalla nueva que pide mantenimiento diario empeora esto.
2. **El material está desparejo.** Fonoaudiología tiene unas 28 fichas;
   Trabajo Social, la carrera con más ingresantes (392 en 2024), tiene
   unas 5; la Tecnicatura, ninguna. La guía de la materia
   (`guia_materia`) está hecha para una sola materia de las 94.
3. **La cola larga.** Once pantallas con menos de 35 visitas al mes.
   Algunas esperan su momento (Ingreso, Primeros pasos, Cómo llegar);
   otras (Consejo, Mapa, Quiénes, Dónde curso) no lo tienen a la vista.
   Cada una es una pantalla que alguien tiene que mantener al día.
4. **Lo que se construyó y no se encendió:** `ingresantes` sin la tabla,
   Feriazo con 0 emprendimientos, «Me anoto» con 0 anotados,
   `materiales` con 0 filas, el mapa con 1 reporte. No es un error de
   código: es que no hubo quién lo empuje después del commit.
5. **Se mide la visita y no el resultado.** No se sabe de dónde viene la
   gente ni si encontró lo que buscaba.

---

## 4. Lo urgente: esta semana (9 al 15/11)

| Qué | Por qué ahora | Quién |
|---|---|---|
| **Correr `sql/tabla-ingresantes.sql`**, con una revisión de seguridad corta antes, y dar de alta en el panel (rol `equipo`) a quien vaya a armar el grupo | la inscripción abre el 9/11 y cierra el 11/12: es el mes en que la gente busca | Máximo (o Claude con el conector, si lo autoriza) |
| **Contestar los dos pedidos de Decilo** y decidir quién más recibe el rol `comunicacion` | 14 y 18 días sin respuesta en un tablero público | Comunicación |
| **Novedad con aviso: inscripción a la mesa de noviembre** (9 al 12/11) y a la de diciembre (7 al 10/12) | son las fechas que ya están cargadas y es el momento de los finales acumulados | Comunicación |
| **Sacar lo de las elecciones** que haya quedado vigente (la ficha «Cómo se vota», si se publicó) | se dijo «se saca después del 6/11» | Comunicación |
| **Una regla para todo link que se publique: lleva `?de=`** | sin eso, el plan de ingreso no se puede evaluar | Comunicación |

---

## 5. Objetivo 1: que la app le sirva a quien entra en 2027

### Para quién

En 2024 entraron **755 personas** a la FTS: 392 a Trabajo Social, 324 a
Fonoaudiología y unas 39 a la Tecnicatura (anuario UNLP). El **70 % es
primera generación universitaria**, contra 56 % en la UNLP. La
permanencia en primer año fue de 77 %. Es el público para el que una
app de estudiantes hace más diferencia, y es gente que **todavía no
conoce a nadie de la agrupación**.

### El recorrido, mes por mes

| Momento | Qué necesita quien entra | Qué tiene la app | Qué falta |
|---|---|---|---|
| **Noviembre - 11/12**: inscripción UNLP | saber cómo anotarse, qué papeles, que no se le pase | Ingreso (fechas, papeles que se tildan, pasos, casos raros) | **la tabla del grupo**; lo propio de la FTS (formulario, mail, curso de ingreso) cuando se publique |
| **Diciembre - enero**: la espera | no perder el hilo, conocer a otros, saber qué viene | Primeros pasos, el grupo de WhatsApp | **«Tu verano»**: qué pasa del 11/12 a marzo, en una sola pantalla o ficha; los avisos prendidos desde el grupo |
| **Febrero**: curso de ingreso (a confirmar) y mesas | dónde, cuándo, cómo llegar, qué leer | Cómo llegar, el glosario | **las fechas de 2027 en Fechas**, el curso de ingreso cargado como evento, material del curso si la FTS lo publica |
| **Marzo**: primer cuatrimestre | horarios, comisiones, cómo se aprueba cada materia, el SIU | Mi año (vista de ingresante), Info útil, Cátedras | **la guía de cada materia de primer año** (23 materias), horarios 2027, inscripción a cursadas |
| **Abril - julio**: los primeros parciales | estudiar, no quedar libre, no estar solo | Estudiemos, asistencia, Mis parciales, grupos de estudio | **fichas de primer año de TS y de la Tecnicatura** |

### Lo que hay que hacer

**1. Encender lo que ya está** (semana del 9/11). La tabla, el alta de
quien arma el grupo, y una publicación de Instagram que lleve a
`ingreso/?de=…`. Es lo único que no se puede correr para después.

**2. La guía de cada materia de primer año** (diciembre). 23 materias:
6 de Trabajo Social, 10 de Fono y 7 de la Tecnicatura. Ya existe la
tabla `guia_materia` con los campos justos (bajada, equipo, contacto,
módulos, fechas clave, prácticos, cómo se aprueba) y una sola cargada.
**No es código, es contenido**: lo pueden escribir estudiantes de
segundo año, uno por materia, con lo que les hubiera servido saber. Es
la tarea ideal para la gente nueva que se incorpora a fin de año.

**3. Una ficha de estudio por materia de primer año** (diciembre a
febrero), empezando por las que más se buscan y no tienen nada:
**Introducción a la Filosofía** (las dos carreras), **Configuración de
los problemas sociales**, **Trabajo Social I** e **Introducción a la
Teoría Social**. El molde y la skill `hacer-ficha` ya están.

**4. El calendario 2027** (enero, en cuanto la FTS publique el suyo).
Mesas de febrero y marzo, inscripción a cursadas, inicio de clases,
curso de ingreso. Cargadas con `alarma` y `periodo`, para que avisen
solas. Sin esto, Fechas y el inicio quedan vacíos a partir del 19/12.

**5. «Tu verano»** (diciembre, una sesión). Lo que pasa entre el cierre
de la inscripción y marzo, dicho para alguien que nunca pisó la
facultad: el curso de ingreso, qué hacer con los papeles que faltan,
cómo llegar, el grupo, qué instalar. Dos personas buscaron «Verano».

**6. Lo propio de la FTS en Ingreso** (cuando salga). La dirección del
formulario, el mail de consultas y el curso de ingreso. Hoy está vacío
a propósito: las guías viejas no sirven.

### Metas al 28/2/2027

| | Hoy | Meta | Cómo se lee |
|---|---|---|---|
| Anotados en el grupo de ingresantes | 0 (sin tabla) | **300** | 4 de cada 10 de una cohorte de ~750 |
| «Soy ingresante» en el inicio | 6 | **400** | `sucesos`, hito `soy-ingresante` |
| Avisos prendidos | 112 | **250** | el grupo es el mejor momento para pedirlos |
| Materias de primer año con guía | 1 de 23 | **23 de 23** | `guia_materia` publicada |
| Fechas de 2027 cargadas | 0 | **todo el primer cuatrimestre** | antes del 15/2 |
| Pedidos de Decilo contestados en menos de 48 h | 0 de 2 | **todos** | `primera_respuesta_at` |
| Links publicados con `?de=` | casi ninguno | **todos** | panel, solapa Registro |

---

## 6. Objetivo 2: el salto de escala

### Qué quiere decir «la más completa»

Si se mide en pantallas, la app ya es grande y suma problemas. **Se
propone medirla en cobertura**: para cada materia de las tres carreras,
que estén las cinco piezas que un estudiante necesita.

| Pieza | Dónde vive | TS (31) | Fono (42) | TGCR (21) | Total (94) |
|---|---|---|---|---|---|
| Programa | `programas` | 18 | 16 | 10 | **44 (47 %)** |
| Contacto de la cátedra | `catedras` | 30 | 34 | 12 | **76 (81 %)** |
| Guía de la materia | `guia_materia` | 0 | 1 | 0 | **1 (1 %)** |
| Ficha o material de estudio | `estudiemos/fichas/` | ~5 | ~28 | 0 | **a contar materia por materia** |
| Fechas (parciales, mesas) | `publicaciones` | generales | generales | generales | por materia, casi nada |

(Las 94 materias son las de `carrera/plan*.js`, optativas incluidas.
Las fichas se cuentan por tema, no por materia: el número exacto sale
de cruzar el índice de fichas con los planes, y es la primera tarea de
la línea de contenido.)

**La meta para fin de 2027: las 94 materias con programa, cátedra y
guía; todas las de primer y segundo año con material.** Es una meta que
se puede mostrar («todas las materias de la FTS en una app») y que se
mide sola con una consulta.

### El esquema de trabajo: cinco líneas

**1. Equipo: de una persona a células.** Hoy el contenido, la
comunicación y el código pasan por Máximo y por una persona de
comunicación. El salto pide repartir:

| Célula | Qué hace | Cuántas personas | Herramienta |
|---|---|---|---|
| Comunicación y escucha | contesta Decilo en 48 h, carga novedades con aviso, etiqueta los links | 2 o 3, con turnos | panel, rol `comunicacion` |
| Contenido por carrera | una persona referente por carrera: guías, programas, cátedras, fechas de su carrera | 3 (una por carrera) | panel, rol `equipo` |
| Estudiemos | arma fichas con el molde; consigue el visto de la cátedra cuando hace falta | 2 a 4, puede ser gente de años avanzados | NotebookLM, `hacer-ficha` |
| Ingreso | el grupo de WhatsApp, recibir a quien entra | 2 | solapa Ingresantes |
| Código | Máximo con Claude | 1 | este repositorio |

Los contactos que se incorporan a fin de año (bitácora, 13/9) son la
cantera natural. **Cada célula tiene una meta en la tabla de cobertura**,
no una lista de tareas.

**2. Contenido: cada cosa con dueño y con fecha de vencimiento.** Lo que
se carga una vez y queda viejo (horarios 2026, calendario 2026, «Beca
Progresar» repetida dos veces en Info útil) es lo que hace que la app
deje de ser confiable. Cada pieza tiene que tener quién la revisa y
cuándo. Un repaso por cuatrimestre, en marzo y en agosto, antes de las
inscripciones.

**3. Producto: consolidar antes que sumar.** Una regla para 2027:
**no se abre una pantalla nueva sin una célula que la mantenga y una
meta que la mida.** Con las once pantallas de la cola larga, en marzo
se decide una por una: se queda (con dueño), se junta con otra, o se
apaga. Las de ingreso se miden recién en abril. El esfuerzo de código
va a lo que ya se usa: Mi año, Estudiemos, Fechas y la vista de
ingresante.

**4. Datos: un informe por mes, de diez minutos.** Lo que se leyó para
esta evaluación se puede leer siempre igual: alcance, vuelta, avisos,
Decilo, búsquedas, errores y la tabla de cobertura. Conviene que el
panel lo muestre armado (ya existe la solapa Registro y la función
`resumen_registro()`), y que se mire el primer lunes de cada mes. Dos
cosas que faltan medir: **de dónde viene la gente** (que todo link lleve
`?de=`) y **si le sirvió** (un «¿te sirvió?» de un toque en guías,
fichas y trámites).

**5. Técnica: que no dependa de una sola persona.** La arquitectura
aguanta 2027 sin cambios grandes. Lo que falta es que alguien que no
sea Máximo pueda publicar una corrección chica sin romper nada:
- correr `refs.py` y `orden-css.py` solos en cada push (una acción de
  GitHub, sin cambiar cómo se publica);
- que el panel avise cuando una tabla que una pantalla espera no existe
  (lo que pasó con `ingresantes`);
- cerrar los cuatro errores propios del registro.

### Una decisión abierta: ¿solo la FTS?

«La más completa de toda la UNLP» se puede leer de dos maneras:

- **Más honda en la FTS**: las tres carreras completas, de punta a
  punta. Es lo que se propone acá.
- **Más ancha**: llevar la app a otras facultades.

**Se recomienda la primera para 2027.** La segunda multiplica la carga
de contenido (que es justo lo que hoy no alcanza), y la app vive de que
el equipo conoce la facultad. Si en algún momento se quiere ir a otra
facultad, lo que hay que preparar es que las carreras salgan de un
dato y no del código; eso se puede ir haciendo sin decidirlo ahora.

---

## 7. Cronograma de acá a febrero

| Tramo | Fechas | Qué | Código |
|---|---|---|---|
| **Encender** | 9 al 15/11 | Tabla de ingresantes (con revisión), Decilo al día, novedades de las mesas, regla del `?de=`, sacar lo de las elecciones | una sesión: revisión de seguridad y los cuatro errores |
| **La inscripción** | 16/11 al 11/12 | Empuje a ingresantes en Instagram con links etiquetados; armar el grupo; convocar a quien escriba las guías de primer año; mesas de noviembre y diciembre (finales acumulados) | una sesión: el informe del mes en el panel |
| **Contenido de primer año** | 12/12 al 31/12 | Las 23 guías; «Tu verano»; las primeras fichas de TS y la Tecnicatura | una sesión: «Tu verano» y el «¿te sirvió?» |
| **Receso** | enero | Fichas; armar las células; la tabla de cobertura completa; el calendario 2027 si la FTS lo publica | una sesión: chequeos automáticos en GitHub |
| **Febrero** | 1/2 al 28/2 | Calendario 2027 cargado antes del 15/2; curso de ingreso y mesas como eventos; horarios 2027; repaso de todo lo vencido | una sesión: lo que pida el curso de ingreso |
| **Marzo** | | Arranca la cursada. Primera revisión de la cola larga y de las metas | |

**Cinco sesiones de código en cuatro meses.** El resto es contenido y
gente, a propósito: es lo que está faltando.

---

## 8. Lo que necesita a Máximo

1. **Correr `sql/tabla-ingresantes.sql`**, o autorizar a Claude a
   correrlo con el conector, después de la revisión de seguridad.
2. **Quién más recibe el rol `comunicacion`**, para que Decilo no
   dependa de una persona.
3. **Quiénes son las tres personas referentes por carrera** y quiénes
   arman fichas, de la gente que se incorpora a fin de año.
4. **Confirmar la lectura de «la más completa»**: honda en la FTS, como
   se propone, o ancha.
5. **Pasar lo que publique la FTS** sobre el ingreso 2027 y el
   calendario académico 2027, apenas salga.
