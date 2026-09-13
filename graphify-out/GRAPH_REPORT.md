# Graph Report - graphify-web-dba33b  (2026-09-13)

## Corpus Check
- 54 files · ~229,291 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 409 nodes · 594 edges · 52 communities (29 shown, 14 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.84)
- Token cost: 349,538 input · 0 output

## Community Hubs (Navigation)
- Documentación y decisiones
- Pantallas y plan de estudios
- Navegación y Estudiemos
- Pantallas institucionales
- Núcleo app.js: tema y errores
- Avisanos: consultas y contactos
- Publicaciones y agenda
- Lector de programas PDF
- Sesión y panel del equipo
- Manifest PWA
- Registro de visitas e hitos
- Alertas de mesa de examen
- Exportar eventos a calendario
- Calendario mensual
- Cátedras y búsqueda
- Invitar a instalar la app
- Fichas de estudio
- Mi cuenta
- Tabla de consultas (Avisanos)
- Tabla de sucesos (registro)
- Respaldos con código
- Avisos de guardado
- Organizador de preparaciones
- Lanzamiento del 21
- Animaciones de entrada
- Página Quiénes somos (SQL)
- Fonoteca: audiogramas
- Página Consejo (SQL)
- Guía por materia (SQL)
- vistaAvisanos (contactos y consultas)
- sw.js
- Sección Instagram (posteos_ig)
- vistaAgenda (publicaciones)
- vistaRegistro (resumen de uso)
- tabla-materiales.sql
- pintar() (cuenta de las 120 horas por ár
- pintarAccesos
- pintarKit
- Chat y botón «Avisanos»
- public.pagina_quienes
- public.programas
- public.publicaciones
- abrirFicha / cerrarFicha (detalle de trá

## God Nodes (most connected - your core abstractions)
1. `Pantalla Mi año (carrera)` - 19 edges
2. `Pantalla Inicio` - 16 edges
3. `pintarNav()` - 14 edges
4. `Mi perfil (mi/index.html)` - 12 edges
5. `desdeTexto()` - 11 edges
6. `esc()` - 10 edges
7. `La Fonoteca: simulador de práctica audiológica` - 9 edges
8. `Pantalla Agenda (Fechas y novedades)` - 9 edges
9. `Pantalla Info útil (trámites y FAQ)` - 9 edges
10. `anotar()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Pantalla Info útil (trámites y FAQ)` --calls--> `parametro()`  [EXTRACTED]
  tramites/index.html → app.js
- `Pantalla Info útil (trámites y FAQ)` --calls--> `normalizar()`  [EXTRACTED]
  tramites/index.html → app.js
- `Pantalla Fonoteca (práctica de audiogramas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/fonoteca/index.html → app.js
- `Pantalla Glosario universitario` --calls--> `pintarNav()`  [EXTRACTED]
  glosario/index.html → app.js
- `Pantalla Info útil (trámites y FAQ)` --calls--> `pintarNav()`  [EXTRACTED]
  tramites/index.html → app.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Moldes para traer diseño de IA en el idioma de la app** — prompt_diseno, prompt_fichas, prompt_trayecto, prompt_fonoteca, entrada_leeme [EXTRACTED 1.00]
- **Las cuatro solapas de la Fonoteca** — prompt_fonoteca_audiometria_ptp, prompt_fonoteca_grbas, prompt_fonoteca_fonetica_rioplatense, prompt_fonoteca_anquiloglosia [EXTRACTED 1.00]
- **Decisiones tomadas por el navegador de Instagram** — bitacora_navegador_instagram, bitacora_movimiento_js, bitacora_explicarerror, bitacora_service_worker_version, bitacora_lanzamiento_21_septiembre [INFERRED 0.85]
- **Flujo de respaldo de la trayectoria con código** — carrera_index_persistir, carrera_index_subirrespaldo, carrera_index_pintarrespaldo, carrera_index_pedircodigo, rpc_respaldos [EXTRACTED 1.00]
- **Preparación de final (Estudiemos)** — carrera_index_pintarfinal, carrera_index_vistanueva, carrera_index_vistapreparacion, carrera_index_pomodoro, tabla_preparaciones, tabla_programas [INFERRED 0.85]
- **Pantallas que muestran publicaciones de la agenda** — tabla_publicaciones, index_proximodelaagenda, index_calendario_mes, agenda_index_traer, agenda_index_detalle_publicacion, carrera_index_vistanueva [INFERRED 0.85]
- **El Panel edita el contenido que leen las pantallas públicas** — panel_index, tramites_index, quienes_index, consejo_index, anatomo_index, catedras_index, estudiemos_index [INFERRED 0.95]
- **Lectura con memoria local y paciencia** — app_memoriade, app_conpaciencia, app_guardarenmemoria, quienes_index, consejo_index, anatomo_index, catedras_index, tramites_index, estudiemos_index [EXTRACTED 1.00]
- **Herramientas de Estudiemos** — estudiemos_index, estudiemos_fichas_index, estudiemos_fonoteca_index, anatomo_index [EXTRACTED 1.00]

## Communities (52 total, 14 thin omitted)

### Community 0 - "Documentación y decisiones"
Cohesion: 0.05
Nodes (53): Bitácora · La Bolívar con vos, Versión 2.0 de AI Studio (React + Tailwind), La carrera se elige una vez (bolivar-carrera-v2), Dónde vive cada cosa (fuente única del ahora), explicarError() / errores en castellano, Glosario (texto en el HTML, tres puertas), movimiento.js (entrarAlLlegar, encenderAlBajar), Webview de Instagram como navegador real (+45 more)

### Community 1 - "Pantallas y plan de estudios"
Cohesion: 0.08
Nodes (31): Pantalla Agenda (Fechas y novedades), localStorage bolivar-carrera-resumen, Tema claro/oscuro (localStorage bolivar-tema), Pantalla Mi año (carrera), abrirDialogo (asistente de carga por pasos), elegirCarrera, marcar (cambiar estado de materia), pedirCodigo (recuperar respaldo) (+23 more)

### Community 2 - "Navegación y Estudiemos"
Cohesion: 0.10
Nodes (24): carreraActual(), marcarTitulos(), menosMovimiento(), pintarAvisanos(), esconderGlobo(), mostrarGlobo(), pintarNav(), abrir() (+16 more)

### Community 3 - "Pantallas institucionales"
Cohesion: 0.11
Nodes (23): Pantalla Anatomofisiología (guía de materia), bloqueModelo / sinFechas, conPaciencia(), guardarEnMemoria(), memoriaDe(), Pantalla El Consejo Directivo, subirFoto / achicarFoto (storage fotos), vistaCategorias (+15 more)

### Community 4 - "Núcleo app.js: tema y errores"
Cohesion: 0.11
Nodes (17): aplicarTema(), CARRERAS_APP, errorEnCastellano(), explicarError(), __hitosDeEstaVisita, INDICE_PIE, MESES, MESES_LARGO (+9 more)

### Community 5 - "Avisanos: consultas y contactos"
Cohesion: 0.20
Nodes (21): abrir(), buscar(), cerrar(), comoSeEscribe(), contactosDe(), decir(), enlaceDe(), fichaHTML() (+13 more)

### Community 6 - "Publicaciones y agenda"
Cohesion: 0.10
Nodes (21): Detalle de publicación (?id=), dibujar (agenda agrupada por mes), montarCal (calendario), pintarBajarTodo, refrescarAlVolver, traer (publicaciones), guardarPrep, pintarFinal (preparación de final) (+13 more)

### Community 7 - "Lector de programas PDF"
Cohesion: 0.24
Nodes (15): agruparReferencias(), buscarAnio(), buscarCodigo(), desdeTexto(), despegar(), digitos(), esRuido(), inicioDeReferencia() (+7 more)

### Community 8 - "Sesión y panel del equipo"
Cohesion: 0.14
Nodes (12): esDelEquipo(), sesionActual(), abrirHoja (ficha de materia), cargarCatedras, buscar (buscador de trámites, FAQ y cátedras), pedirCatedras, Pantalla Panel (administración del equipo), panel() arranque y control de sesión (+4 more)

### Community 9 - "Manifest PWA"
Cohesion: 0.15
Nodes (12): background_color, description, display, icons, id, lang, name, orientation (+4 more)

### Community 10 - "Registro de visitas e hitos"
Cohesion: 0.18
Nodes (12): anotar(), anotarCarreraApp(), anotarError(), anotarHito(), avisarQueNoArranca(), carreraElegidaApp(), contarVisita(), deDondeVino() (+4 more)

### Community 11 - "Alertas de mesa de examen"
Cohesion: 0.24
Nodes (10): alarmaDeMesa(), esc(), escMulti(), hoyISO(), htmlAgendarlo(), htmlPie(), idDeLaAlertaVisible(), referencia() (+2 more)

### Community 12 - "Exportar eventos a calendario"
Cohesion: 0.29
Nodes (10): archivoICS(), detalleDelEvento(), doblarRenglon(), escaparICS(), eventoICS(), horaNumeros(), isoVecino(), puntasDelEvento() (+2 more)

### Community 13 - "Calendario mensual"
Cohesion: 0.33
Nodes (10): armarISO(), caeEnElDia(), fechaLinda(), montarCalendario(), dibujar(), elegir(), irAlMes(), publicacionesDe() (+2 more)

### Community 14 - "Cátedras y búsqueda"
Cohesion: 0.25
Nodes (8): anotarBusqueda(), bajarICS(), nombreDeArchivo(), normalizar(), parametro(), Pantalla Cátedras, vistaCatedras, Tabla Supabase catedras

### Community 15 - "Invitar a instalar la app"
Cohesion: 0.33
Nodes (6): anotarQueSeVio(), esiOS(), invitarAInstalar(), seDijoQueNo(), sePuedeInvitarAInstalar(), yaEstaInstalada()

### Community 16 - "Fichas de estudio"
Cohesion: 0.57
Nodes (6): dibujar(), leer(), pasar(), rellenar(), setState(), soloAgujero()

### Community 17 - "Mi cuenta"
Cohesion: 0.29
Nodes (3): pantallaMiCuenta(), pintarAfuera(), refrescar()

### Community 18 - "Tabla de consultas (Avisanos)"
Cohesion: 0.40
Nodes (5): public.freno_consultas, freno_consultas, public.consultas, public.contactos, public.freno_consultas()

### Community 19 - "Tabla de sucesos (registro)"
Cohesion: 0.40
Nodes (4): public.freno_sucesos, freno_sucesos, public.freno_sucesos(), public.sucesos

### Community 21 - "Avisos de guardado"
Cohesion: 0.50
Nodes (5): avisarMostrandoGuardado(), avisarNoSePudoActualizar(), cajaDelAviso(), desdeCuando(), ponerAviso()

### Community 22 - "Organizador de preparaciones"
Cohesion: 0.50
Nodes (3): auth.users, public.preparaciones, public.programas

### Community 23 - "Lanzamiento del 21"
Cohesion: 0.40
Nodes (5): Congelamiento de código (16-17/9), El embudo del 21 (hitos y origen de Instagram), Lanzamiento 21 de septiembre (Día del Estudiante), anotar(): registro de visitas, búsquedas y errores, Vercel (bolivar-con-vos.vercel.app, publica con push a main)

### Community 24 - "Animaciones de entrada"
Cohesion: 0.60
Nodes (3): claveDeEntrada(), entrarAlLlegar(), revisar()

### Community 25 - "Página Quiénes somos (SQL)"
Cohesion: 0.40
Nodes (3): al_tocar_quienes, public.pagina_quienes, public.tocar_quienes

### Community 26 - "Fonoteca: audiogramas"
Cohesion: 0.50
Nodes (4): CASOS (audiogramas clínicos con diagnóstico escrito), devolucion / revision (corrección de respuestas), svgAudiograma, tipoCalculado (PTP, GAP y tipo de hipoacusia)

### Community 28 - "Página Consejo (SQL)"
Cohesion: 0.50
Nodes (3): al_tocar_consejo, public.pagina_consejo, public.tocar_quienes

### Community 29 - "Guía por materia (SQL)"
Cohesion: 0.50
Nodes (3): al_tocar_guia, public.guia_materia, public.tocar_quienes

### Community 30 - "vistaAvisanos (contactos y consultas)"
Cohesion: 0.67
Nodes (3): vistaAvisanos (contactos y consultas), Tabla Supabase consultas, Tabla Supabase contactos

## Knowledge Gaps
- **80 isolated node(s):** `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO`, `NOMBRE_SECCION`, `NOMBRE_LINEA` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 130 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pantalla Inicio` connect `Pantallas y plan de estudios` to `Documentación y decisiones`, `Núcleo app.js: tema y errores`, `Publicaciones y agenda`, `Sesión y panel del equipo`, `Manifest PWA`, `Animaciones de entrada`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `Pantalla Mi año (carrera)` connect `Pantallas y plan de estudios` to `Documentación y decisiones`, `Navegación y Estudiemos`, `Núcleo app.js: tema y errores`, `Publicaciones y agenda`, `Cátedras y búsqueda`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `Mi perfil (mi/index.html)` connect `Documentación y decisiones` to `Sesión y panel del equipo`, `Pantallas y plan de estudios`, `Publicaciones y agenda`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Documentación y decisiones` be split into smaller, more focused modules?**
  _Cohesion score 0.05370101596516691 - nodes in this community are weakly interconnected._
- **Should `Pantallas y plan de estudios` be split into smaller, more focused modules?**
  _Cohesion score 0.07539118065433854 - nodes in this community are weakly interconnected._
- **Should `Navegación y Estudiemos` be split into smaller, more focused modules?**
  _Cohesion score 0.09782608695652174 - nodes in this community are weakly interconnected._