# El plan de sesiones

Una sesión es una tarea, un commit y una línea en la bitácora. **El
objetivo se dice antes de empezar.** Nada de «revisá toda la app» en una
sesión corta: las auditorías amplias son lo más caro que existe.

Cada sesión tiene su prompt en `prompts/`, listo para pegar. Los prompts
asumen que el kit está copiado en `docs/kit/` del repositorio nuevo y que
`CLAUDE.md` ya existe (sesión 0).

---

## Antes de la primera sesión (personas, no código)

- [ ] `00-ficha-del-proyecto.md` lleno, con `FALTA:` donde no se sepa.
- [ ] Diez placas de Instagram en `docs/kit/referencias/`.
- [ ] La estética descrita con `prompts/ia-estetica.md` y las cinco
      decisiones anotadas en la ficha (sección 4).
- [ ] Cuenta de GitHub, de Vercel y de Supabase (las tres gratis).

---

## Hasta el lanzamiento

| # | Sesión | Prompt | Terminado cuando | Necesita de la agrupación |
|---|---|---|---|---|
| 0 | Arranque: repositorio, Vercel, Supabase, `CLAUDE.md`, bitácora | `P00-arranque.md` | `algo.vercel.app` muestra una página y el push publica solo | La ficha |
| 1 | Los estilos: tokens y los doce de la base | `P01-estilos.md` | Una página de muestra con todos los componentes, en claro y oscuro, a 375 px | Las cinco decisiones de estética |
| 2 | `app.js` y el cliente de datos | `P02-nucleo.md` | Una pantalla vacía con cabecera, secciones, menú, tema, pie y error legible si falta Supabase | Nombre de las secciones |
| 3 | La base: perfiles, seguridad y tablas de contenido | `P03-base.md` | Los `sql/tabla-*.sql` corridos y ensayados: anónimo lee lo publicado, estudiante no escribe, equipo sí | Quién es del equipo (un correo) |
| 4 | El panel del equipo | `P04-panel.md` | El equipo entra y carga, edita, despublica y borra publicaciones, trámites, preguntas y accesos | Un primer lote de contenido real |
| 5 | Inicio | `P05-inicio.md` | Con datos reales, en 375 px, claro y oscuro | Fotos o ilustraciones con permiso |
| 6 | Info útil y el buscador | `P06-info-util.md` | Buscar una palabra de un trámite, de una pregunta o de una fecha lleva al lugar exacto | Diez trámites y diez preguntas, confirmados |
| 7 | Fechas | `P07-fechas.md` | El calendario con las fechas del año; una fecha pasa al calendario del celular (Google e `.ics`) | El calendario académico |
| 8 | Mi año | `P08-mi-ano.md` | Marcar materias, ver qué se puede cursar, el promedio; sin cuenta | Los planes de estudio con correlativas |
| 9 | Perfil y la cuenta | `P09-perfil.md` | Crear, entrar, salir, borrar mi cuenta; lo de Mi año se sube al crear cuenta | Decidir «Confirm email» |
| 10 | Quiénes somos y Glosario | `P10-quienes-glosario.md` | Los dos publicados con texto real | Los textos |
| 11 | Instalable y sin señal | `P11-sin-senal.md` | Se instala en Android; sin red abre lo visto; `VERSION` y su historial | El ícono en vector |
| 12 | El registro | `P12-registro.md` | El panel muestra visitas, búsquedas, errores e hitos; las pruebas no cuentan | Los links de Instagram con `?de=` |
| 13 | Revisión y lanzamiento | `P13-lanzamiento.md` | La lista de `P13` en verde, dominio andando, todo arriba **el día antes** | El dominio, si hay |

**Por qué el día antes:** el service worker sirve la versión guardada en
la primera carga y la nueva recién en la segunda. Lo que se sube el día
del lanzamiento no lo ve quien ya entró.

**Si el tiempo no alcanza, se mueve el alcance, no la fecha.** Lo que
sale primero es la 10 (el glosario puede esperar) y la 12 se achica a
solo visitas y errores. La 3, la 11 y la 13 no se saltean nunca.

---

## Después del lanzamiento

Una pantalla de `04-pantallas.md` por sesión, con
`prompts/P20-pantalla-nueva.md`. El orden lo decide la agrupación
mirando **lo que la gente busca** en el registro: es la lista de lo que
falta, escrita por los estudiantes.

Para cualquier otra tarea, `prompts/sesion.md`.

Los avisos al celular van al final de todo y con
`prompts/P30-avisos.md`: son cuatro piezas (interruptor, suscripción
guardada, un reloj que despierta cada hora, una función que manda) y si
falta una, la persona prende el interruptor y no recibe nada sin que
nadie se entere.

---

## Cómo se trabaja, todas las sesiones

- **Se publica lo que se probó corriendo, no lo que se leyó.** Servidor
  local, la pantalla abierta, consola mirada. Lo que no se puede abrir
  (el panel sin entrar, por ejemplo) se prueba copiando la función a un
  archivo aparte y corriéndola en Node con un `document` y un `db` de
  mentira.
- **Lo que no se pudo verificar se commitea, se avisa y no se sube.**
- **Si se tocó algo del armazón, se sube `VERSION`** y se anota en
  `docs/HISTORIAL-SW.md`.
- **Una línea en la bitácora** con el día, qué quedó y el commit.
- **La respuesta final de cada sesión:** qué quedó, qué se probó y qué
  falta. Nada más.
