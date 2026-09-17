# Graph Report - graphify-web-dba33b  (2026-09-17)

## Corpus Check
- 47 files · ~150,081 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 515 nodes · 756 edges · 60 communities (34 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b9bdc729`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- La Fonoteca: simulador de práctica audiológica
- Pantalla Mi año (carrera)
- Pantalla Cátedras
- Pantalla Info útil (trámites y FAQ)
- app.js
- avisanos.js
- Detalle de publicación (?id=)
- leer-programa.js
- Mi perfil (mi/index.html)
- manifest.json
- pintarNav
- esc
- eventoICS
- montarCalendario
- leer.js
- invitarAInstalar
- ficha.js
- pantallaMiCuenta
- tabla-avisanos.sql
- tabla-registro.sql
- tabla-respaldos.sql
- riesgo.js
- tabla-organizador.sql
- ficha-parser.js
- LEEME · La Bolívar con vos
- tabla-quienes.sql
- CASOS (audiogramas clínicos con diagnóstico escrito)
- tabla-consejo.sql
- tabla-guia.sql
- vistaAvisanos (contactos y consultas)
- sw.js
- Sección Instagram (posteos_ig)
- vistaAgenda (publicaciones)
- vistaRegistro (resumen de uso)
- tabla-materiales.sql
- pintar() (cuenta de las 120 horas por área)
- pintarAccesos
- pintarKit
- Chat y botón «Avisanos»
- public.pagina_quienes
- public.programas
- public.publicaciones
- abrirFicha / cerrarFicha (detalle de trámite)
- Bitácora · La Bolívar con vos
- Prompt para abrir una sesión de código (17/9 en adelante)
- anotar
- capas.js
- vistaProgramas (programas de materias)
- tabla-riesgo.sql
- capas-base.js
- Las capas de base del mapa de riesgo

## God Nodes (most connected - your core abstractions)
1. `Pantalla Mi año (carrera)` - 19 edges
2. `Pantalla Inicio` - 16 edges
3. `pintarNav()` - 14 edges
4. `desdeTexto()` - 11 edges
5. `esc()` - 10 edges
6. `Mi perfil (mi/index.html)` - 10 edges
7. `Pantalla Agenda (Fechas y novedades)` - 9 edges
8. `Pantalla Info útil (trámites y FAQ)` - 9 edges
9. `anotar()` - 8 edges
10. `eventoICS()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Pantalla Fonoteca (práctica de audiogramas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/fonoteca/index.html → app.js
- `Pantalla Info útil (trámites y FAQ)` --calls--> `parametro()`  [EXTRACTED]
  tramites/index.html → app.js
- `Pantalla Info útil (trámites y FAQ)` --calls--> `normalizar()`  [EXTRACTED]
  tramites/index.html → app.js
- `Pantalla Estudiemos (landing de herramientas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/index.html → app.js
- `Pantalla Glosario universitario` --calls--> `pintarNav()`  [EXTRACTED]
  glosario/index.html → app.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Herramientas de Estudiemos** — estudiemos_index, estudiemos_fichas_index, estudiemos_fonoteca_index, anatomo_index [EXTRACTED 1.00]
- **Lectura con memoria local y paciencia** — app_memoriade, app_conpaciencia, app_guardarenmemoria, quienes_index, consejo_index, anatomo_index, catedras_index, tramites_index, estudiemos_index [EXTRACTED 1.00]
- **Moldes para traer diseño de IA en el idioma de la app** — prompt_diseno, prompt_fichas, prompt_trayecto, prompt_fonoteca, entrada_leeme [EXTRACTED 1.00]
- **Flujo de respaldo de la trayectoria con código** — carrera_index_persistir, carrera_index_subirrespaldo, carrera_index_pintarrespaldo, carrera_index_pedircodigo, rpc_respaldos [EXTRACTED 1.00]
- **Las cuatro solapas de la Fonoteca** — prompt_fonoteca_audiometria_ptp, prompt_fonoteca_grbas, prompt_fonoteca_fonetica_rioplatense, prompt_fonoteca_anquiloglosia [EXTRACTED 1.00]
- **Decisiones tomadas por el navegador de Instagram** — bitacora_navegador_instagram, bitacora_movimiento_js, bitacora_explicarerror, bitacora_service_worker_version, bitacora_lanzamiento_21_septiembre [INFERRED 0.85]
- **Preparación de final (Estudiemos)** — carrera_index_pintarfinal, carrera_index_vistanueva, carrera_index_vistapreparacion, carrera_index_pomodoro, tabla_preparaciones, tabla_programas [INFERRED 0.85]
- **Pantallas que muestran publicaciones de la agenda** — tabla_publicaciones, index_proximodelaagenda, index_calendario_mes, agenda_index_traer, agenda_index_detalle_publicacion, carrera_index_vistanueva [INFERRED 0.85]
- **El Panel edita el contenido que leen las pantallas públicas** — panel_index, tramites_index, quienes_index, consejo_index, anatomo_index, catedras_index, estudiemos_index [INFERRED 0.95]

## Communities (60 total, 17 thin omitted)

### Community 0 - "La Fonoteca: simulador de práctica audiológica"
Cohesion: 0.06
Nodes (34): Versión 2.0 de AI Studio (React + Tailwind), La carrera se elige una vez (bolivar-carrera-v2), Congelamiento de código (16-17/9), El embudo del 21 (hitos y origen de Instagram), Lanzamiento 21 de septiembre (Día del Estudiante), El plan de estudios se imprime, no se publica en PDF, anotar(): registro de visitas, búsquedas y errores, Riel deslizable de herramientas de Estudiemos (+26 more)

### Community 1 - "Pantalla Mi año (carrera)"
Cohesion: 0.07
Nodes (34): Pantalla Agenda (Fechas y novedades), localStorage bolivar-carrera-resumen, Tema claro/oscuro (localStorage bolivar-tema), Pantalla Mi año (carrera), abrirDialogo (asistente de carga por pasos), elegirCarrera, marcar (cambiar estado de materia), pedirCodigo (recuperar respaldo) (+26 more)

### Community 2 - "Pantalla Cátedras"
Cohesion: 0.15
Nodes (13): anotarBusqueda(), bajarICS(), carreraActual(), carreraElegidaApp(), leerCarreraGuardada(), nombreDeArchivo(), normalizar(), parametro() (+5 more)

### Community 3 - "Pantalla Info útil (trámites y FAQ)"
Cohesion: 0.09
Nodes (29): Pantalla Anatomofisiología (guía de materia), bloqueModelo / sinFechas, conPaciencia(), guardarEnMemoria(), memoriaDe(), Pantalla El Consejo Directivo, Pantalla Fichas de estudio, Pantalla Fonoteca (práctica de audiogramas) (+21 more)

### Community 4 - "app.js"
Cohesion: 0.10
Nodes (22): aplicarTema(), avisarMostrandoGuardado(), avisarNoSePudoActualizar(), cajaDelAviso(), CARRERAS_APP, desdeCuando(), errorEnCastellano(), explicarError() (+14 more)

### Community 5 - "avisanos.js"
Cohesion: 0.20
Nodes (21): abrir(), buscar(), cerrar(), comoSeEscribe(), contactosDe(), decir(), enlaceDe(), fichaHTML() (+13 more)

### Community 6 - "Detalle de publicación (?id=)"
Cohesion: 0.10
Nodes (21): Detalle de publicación (?id=), dibujar (agenda agrupada por mes), montarCal (calendario), pintarBajarTodo, refrescarAlVolver, traer (publicaciones), guardarPrep, pintarFinal (preparación de final) (+13 more)

### Community 7 - "leer-programa.js"
Cohesion: 0.24
Nodes (15): agruparReferencias(), buscarAnio(), buscarCodigo(), desdeTexto(), despegar(), digitos(), esRuido(), inicioDeReferencia() (+7 more)

### Community 8 - "Mi perfil (mi/index.html)"
Cohesion: 0.07
Nodes (31): esDelEquipo(), sesionActual(), explicarError() / errores en castellano, Glosario (texto en el HTML, tres puertas), movimiento.js (entrarAlLlegar, encenderAlBajar), Webview de Instagram como navegador real, Versión del service worker (sw.js vNN), abrirHoja (ficha de materia) (+23 more)

### Community 9 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, description, display, icons, id, lang, name, orientation (+4 more)

### Community 10 - "pintarNav"
Cohesion: 0.31
Nodes (9): marcarTitulos(), menosMovimiento(), pintarAvisanos(), esconderGlobo(), mostrarGlobo(), pintarNav(), abrir(), ponerLupa() (+1 more)

### Community 11 - "esc"
Cohesion: 0.24
Nodes (10): alarmaDeMesa(), esc(), escMulti(), hoyISO(), htmlAgendarlo(), htmlPie(), idDeLaAlertaVisible(), referencia() (+2 more)

### Community 12 - "eventoICS"
Cohesion: 0.29
Nodes (10): archivoICS(), detalleDelEvento(), doblarRenglon(), escaparICS(), eventoICS(), horaNumeros(), isoVecino(), puntasDelEvento() (+2 more)

### Community 13 - "montarCalendario"
Cohesion: 0.33
Nodes (10): armarISO(), caeEnElDia(), fechaLinda(), montarCalendario(), dibujar(), elegir(), irAlMes(), publicacionesDe() (+2 more)

### Community 14 - "leer.js"
Cohesion: 0.44
Nodes (8): campos(), esc(), leer(), linea(), maquinas(), noEsta(), pintar(), preguntas()

### Community 15 - "invitarAInstalar"
Cohesion: 0.33
Nodes (6): anotarQueSeVio(), esiOS(), invitarAInstalar(), seDijoQueNo(), sePuedeInvitarAInstalar(), yaEstaInstalada()

### Community 16 - "ficha.js"
Cohesion: 0.38
Nodes (10): aDom(), createElement(), dibujar(), esRico(), estiloTexto(), leer(), pasar(), rellenar() (+2 more)

### Community 17 - "pantallaMiCuenta"
Cohesion: 0.29
Nodes (3): pantallaMiCuenta(), pintarAfuera(), refrescar()

### Community 18 - "tabla-avisanos.sql"
Cohesion: 0.40
Nodes (5): public.freno_consultas, freno_consultas, public.consultas, public.contactos, public.freno_consultas()

### Community 19 - "tabla-registro.sql"
Cohesion: 0.40
Nodes (4): public.freno_sucesos, freno_sucesos, public.freno_sucesos(), public.sucesos

### Community 21 - "riesgo.js"
Cohesion: 0.07
Nodes (44): abrir(), aFila(), armarCapaBase(), armarMapa(), base(), bloquearDetras(), cambiarEstadoBase(), cargarBase() (+36 more)

### Community 22 - "tabla-organizador.sql"
Cohesion: 0.50
Nodes (3): public.preparaciones, public.programas, auth.users

### Community 23 - "ficha-parser.js"
Cohesion: 0.24
Nodes (7): get(), kv(), namedList(), paras(), parseFicha(), segs(), Component

### Community 24 - "LEEME · La Bolívar con vos"
Cohesion: 0.67
Nodes (3): LEEME · La Bolívar con vos, Agrupación Simón Bolívar (Conducción del CEFTS, FTS-UNLP), Secciones de la app (Inicio, Info útil, Mi año, Estudiemos, Fechas, Perfil, ¿Quiénes somos?)

### Community 25 - "tabla-quienes.sql"
Cohesion: 0.40
Nodes (3): al_tocar_quienes, public.pagina_quienes, public.tocar_quienes

### Community 26 - "CASOS (audiogramas clínicos con diagnóstico escrito)"
Cohesion: 0.50
Nodes (4): CASOS (audiogramas clínicos con diagnóstico escrito), devolucion / revision (corrección de respuestas), svgAudiograma, tipoCalculado (PTP, GAP y tipo de hipoacusia)

### Community 28 - "tabla-consejo.sql"
Cohesion: 0.50
Nodes (3): al_tocar_consejo, public.pagina_consejo, public.tocar_quienes

### Community 29 - "tabla-guia.sql"
Cohesion: 0.50
Nodes (3): al_tocar_guia, public.guia_materia, public.tocar_quienes

### Community 30 - "vistaAvisanos (contactos y consultas)"
Cohesion: 0.67
Nodes (3): vistaAvisanos (contactos y consultas), Tabla Supabase consultas, Tabla Supabase contactos

### Community 54 - "anotar"
Cohesion: 0.22
Nodes (10): anotar(), anotarCarreraApp(), anotarError(), anotarHito(), avisarQueNoArranca(), contarVisita(), deDondeVino(), esPrueba() (+2 more)

### Community 55 - "capas.js"
Cohesion: 0.67
Nodes (3): capaRiesgo(), CAPAS_RIESGO, nombreCategoriaRiesgo()

### Community 56 - "vistaProgramas (programas de materias)"
Cohesion: 0.33
Nodes (6): PLANES (PLAN_TS, PLAN_TGCR, PLAN_FONO), leerPrograma (lib/leer-programa.js), textoDelPdf, vistaProgramas (programas de materias), vistaProgramasPDF (carga masiva desde PDF), Tabla/bucket Supabase programas

### Community 58 - "capas-base.js"
Cohesion: 0.22
Nodes (5): CAMPOS_DESCRIPCION, CAMPOS_NOMBRE, CAPAS_BASE, sinTildes(), tipoDePunto()

### Community 59 - "Las capas de base del mapa de riesgo"
Cohesion: 0.50
Nodes (3): Las capas de base del mapa de riesgo, Los cinco archivos, Tres reglas antes de dejar un archivo acá

## Knowledge Gaps
- **92 isolated node(s):** `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO`, `NOMBRE_SECCION`, `NOMBRE_LINEA` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 162 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pantalla Inicio` connect `Pantalla Mi año (carrera)` to `Mi perfil (mi/index.html)`, `manifest.json`, `app.js`, `Detalle de publicación (?id=)`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Pantalla Mi año (carrera)` connect `Pantalla Mi año (carrera)` to `Pantalla Cátedras`, `Pantalla Info útil (trámites y FAQ)`, `app.js`, `Detalle de publicación (?id=)`, `Mi perfil (mi/index.html)`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `Trayecto Optativo (trayecto/index.html)` connect `Mi perfil (mi/index.html)` to `Pantalla Info útil (trámites y FAQ)`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `La Fonoteca: simulador de práctica audiológica` be split into smaller, more focused modules?**
  _Cohesion score 0.06417112299465241 - nodes in this community are weakly interconnected._
- **Should `Pantalla Mi año (carrera)` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `Pantalla Info útil (trámites y FAQ)` be split into smaller, more focused modules?**
  _Cohesion score 0.08620689655172414 - nodes in this community are weakly interconnected._