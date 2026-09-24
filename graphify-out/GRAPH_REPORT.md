# Graph Report - bolivar-con-vos  (2026-09-24)

## Corpus Check
- 63 files · ~228,743 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 5, .css 4, .geojson 4)

## Summary
- 718 nodes · 1109 edges · 83 communities (54 shown, 29 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0f6863f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- La Fonoteca: simulador de práctica audiológica
- Pantalla Mi año (carrera)
- Pantalla Cátedras
- Pantalla Info útil (trámites y FAQ)
- app.js
- avisanos.js
- pintarFinal (preparación de final)
- leer-programa.js
- Mi perfil (mi/index.html)
- manifest.json
- pintarNav
- esc
- eventoICS
- htmlNovedades
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
- fondo-red.js
- tabla-posteos-ig.sql
- vistaAgenda (publicaciones)
- vistaRegistro (resumen de uso)
- tabla-materiales.sql
- pintar() (cuenta de las 120 horas por área)
- pintarAccesos
- pintarKit
- Chat y botón «Avisanos»
- public.pagina_quienes
- public.programas
- publicaciones_alarma_idx
- leer-analitico.js
- abrirFicha / cerrarFicha (detalle de trámite)
- Bitácora · La Bolívar con vos
- Prompt para abrir una sesión de código (17/9 en adelante)
- anotar
- capas.js
- vistaProgramas (programas de materias)
- tabla-riesgo.sql
- capas-base.js
- Las capas de base del mapa de riesgo
- convertir.ps1
- unir.ps1
- tabla-cursada.sql
- persistir (guardado local de trayectoria)
- crearCliente
- movimiento.js
- localStorage bolivar-carrera-resumen
- elegirCarrera
- Detalle de publicación (?id=)
- index.ts
- tabla-avisos.sql
- portada.js
- pintarAvisos
- public.publicaciones
- pomodoro.js
- huella.js
- tabla-buzon.sql
- Prompts para las sesiones hacia las elecciones (24/9 al 6/11)
- iconos.js
- ref_jsr_supabase_supabase_js_2

## God Nodes (most connected - your core abstractions)
1. `Pantalla Mi año (carrera)` - 19 edges
2. `Pantalla Inicio` - 17 edges
3. `pintarNav()` - 14 edges
4. `pintarAvisos()` - 14 edges
5. `esc()` - 12 edges
6. `pintar()` - 12 edges
7. `desdeTexto()` - 11 edges
8. `pasar()` - 10 edges
9. `Mi perfil (mi/index.html)` - 10 edges
10. `arrancar()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Pantalla Info útil (trámites y FAQ)` --calls--> `parametro()`  [EXTRACTED]
  tramites/index.html → app.js
- `Pantalla Info útil (trámites y FAQ)` --calls--> `normalizar()`  [EXTRACTED]
  tramites/index.html → app.js
- `Pantalla Fonoteca (práctica de audiogramas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/fonoteca/index.html → app.js
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

## Communities (83 total, 29 thin omitted)

### Community 0 - "La Fonoteca: simulador de práctica audiológica"
Cohesion: 0.06
Nodes (34): Versión 2.0 de AI Studio (React + Tailwind), La carrera se elige una vez (bolivar-carrera-v2), Congelamiento de código (16-17/9), El embudo del 21 (hitos y origen de Instagram), Lanzamiento 21 de septiembre (Día del Estudiante), anotar(): registro de visitas, búsquedas y errores, Riel deslizable de herramientas de Estudiemos, Vercel (bolivar-con-vos.vercel.app, publica con push a main) (+26 more)

### Community 1 - "Pantalla Mi año (carrera)"
Cohesion: 0.23
Nodes (11): Pantalla Agenda (Fechas y novedades), Tema claro/oscuro (localStorage bolivar-tema), Pantalla Mi año (carrera), Vista plan (Mi año), estilos.css, Pantalla Glosario universitario, Pantalla Inicio, lib/supabase.js (cliente Supabase completo) (+3 more)

### Community 2 - "Pantalla Cátedras"
Cohesion: 0.15
Nodes (13): anotarBusqueda(), bajarICS(), carreraActual(), carreraElegidaApp(), leerCarreraGuardada(), nombreDeArchivo(), normalizar(), parametro() (+5 more)

### Community 3 - "Pantalla Info útil (trámites y FAQ)"
Cohesion: 0.07
Nodes (34): Pantalla Anatomofisiología (guía de materia), bloqueModelo / sinFechas, conPaciencia(), guardarEnMemoria(), memoriaDe(), armarPosteos() (embed IG diferido), Conquistas con posteo (CONQUISTAS, v70), htmlConquistas() (línea por año) (+26 more)

### Community 4 - "app.js"
Cohesion: 0.08
Nodes (22): avisarMostrandoGuardado(), avisarNoSePudoActualizar(), AVISOS_POR_DEFECTO, cajaDelAviso(), CARRERAS_APP, desdeCuando(), errorEnCastellano(), explicarError() (+14 more)

### Community 5 - "avisanos.js"
Cohesion: 0.20
Nodes (22): carrera(), abrir(), buscar(), cerrar(), comoSeEscribe(), contactosDe(), decir(), enlaceDe() (+14 more)

### Community 6 - "pintarFinal (preparación de final)"
Cohesion: 0.18
Nodes (11): guardarPrep, pintarFinal (preparación de final), pintarMapa, Pomodoro de estudio, verPestana (pestañas plan/mapa/todo/final), Vista preparar final (Estudiemos), Vista mapa de correlativas, vistaNueva (nueva preparación) (+3 more)

### Community 7 - "leer-programa.js"
Cohesion: 0.24
Nodes (15): agruparReferencias(), buscarAnio(), buscarCodigo(), desdeTexto(), despegar(), digitos(), esRuido(), inicioDeReferencia() (+7 more)

### Community 8 - "Mi perfil (mi/index.html)"
Cohesion: 0.07
Nodes (34): esDelEquipo(), sesionActual(), explicarError() / errores en castellano, Glosario (texto en el HTML, tres puertas), movimiento.js (entrarAlLlegar, encenderAlBajar), Webview de Instagram como navegador real, El plan de estudios se imprime, no se publica en PDF, Versión del service worker (sw.js vNN) (+26 more)

### Community 9 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, description, display, icons, id, lang, name, orientation (+4 more)

### Community 10 - "pintarNav"
Cohesion: 0.21
Nodes (12): aplicarTema(), marcarTitulos(), menosMovimiento(), pintarAvisanos(), esconderGlobo(), mostrarGlobo(), pintarNav(), abrir() (+4 more)

### Community 11 - "esc"
Cohesion: 0.18
Nodes (17): alarmaDeMesa(), armarISO(), caeEnElDia(), esc(), escMulti(), hoyISO(), htmlAgendarlo(), htmlPie() (+9 more)

### Community 12 - "eventoICS"
Cohesion: 0.29
Nodes (10): archivoICS(), detalleDelEvento(), doblarRenglon(), escaparICS(), eventoICS(), horaNumeros(), isoVecino(), puntasDelEvento() (+2 more)

### Community 13 - "htmlNovedades"
Cohesion: 0.24
Nodes (10): abrir(), arrancar(), fechaLinda(), htmlNovedades(), leidasNovedades(), novedadLeida(), partesFecha(), pintarCampana() (+2 more)

### Community 14 - "leer.js"
Cohesion: 0.44
Nodes (8): campos(), esc(), leer(), linea(), maquinas(), noEsta(), pintar(), preguntas()

### Community 15 - "invitarAInstalar"
Cohesion: 0.40
Nodes (6): anotarQueSeVio(), esiOS(), invitarAInstalar(), cerrar(), seDijoQueNo(), sePuedeInvitarAInstalar()

### Community 16 - "ficha.js"
Cohesion: 0.38
Nodes (10): aDom(), createElement(), dibujar(), esRico(), estiloTexto(), leer(), pasar(), rellenar() (+2 more)

### Community 17 - "pantallaMiCuenta"
Cohesion: 0.29
Nodes (3): pantallaMiCuenta(), pintarAfuera(), refrescar()

### Community 18 - "tabla-avisanos.sql"
Cohesion: 0.36
Nodes (7): public.freno_consultas, consultas_pendientes_idx, contactos_carrera_idx, freno_consultas, public.consultas, public.contactos, public.freno_consultas()

### Community 19 - "tabla-registro.sql"
Cohesion: 0.36
Nodes (6): public.freno_sucesos, freno_sucesos, public.freno_sucesos(), public.sucesos, sucesos_fecha_idx, sucesos_tipo_idx

### Community 21 - "riesgo.js"
Cohesion: 0.07
Nodes (44): abrir(), aFila(), armarCapaBase(), armarMapa(), base(), bloquearDetras(), cambiarEstadoBase(), cargarBase() (+36 more)

### Community 22 - "tabla-organizador.sql"
Cohesion: 0.43
Nodes (5): preparaciones_unico_idx, programas_unico_idx, public.preparaciones, public.programas, auth.users

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
Nodes (4): al_tocar_guia, guia_materia_unica_idx, public.guia_materia, public.tocar_quienes

### Community 30 - "vistaAvisanos (contactos y consultas)"
Cohesion: 0.67
Nodes (3): vistaAvisanos (contactos y consultas), Tabla Supabase consultas, Tabla Supabase contactos

### Community 31 - "fondo-red.js"
Cohesion: 0.19
Nodes (14): apagar(), armarTodo(), arrancar(), bucle(), Capa(), deLienzo(), esDeNoche(), marcarMedicion() (+6 more)

### Community 32 - "tabla-posteos-ig.sql"
Cohesion: 0.67
Nodes (3): Sección Instagram (posteos_ig), posteos_ig_publicado_idx, public.posteos_ig

### Community 47 - "leer-analitico.js"
Cohesion: 0.31
Nodes (10): carreraDelTexto(), emparejar(), filas(), iso(), leerAnalitico(), normal(), numeros(), parecido() (+2 more)

### Community 54 - "anotar"
Cohesion: 0.20
Nodes (11): anotar(), anotarCarreraApp(), anotarError(), anotarHito(), avisarQueNoArranca(), contarVisita(), deDondeVino(), esPrueba() (+3 more)

### Community 55 - "capas.js"
Cohesion: 0.67
Nodes (3): capaRiesgo(), CAPAS_RIESGO, nombreCategoriaRiesgo()

### Community 56 - "vistaProgramas (programas de materias)"
Cohesion: 0.33
Nodes (6): PLANES (PLAN_TS, PLAN_TGCR, PLAN_FONO), leerPrograma (lib/leer-programa.js), textoDelPdf, vistaProgramas (programas de materias), vistaProgramasPDF (carga masiva desde PDF), Tabla/bucket Supabase programas

### Community 57 - "tabla-riesgo.sql"
Cohesion: 0.47
Nodes (4): public.reportes_riesgo, reportes_riesgo_autor_idx, reportes_riesgo_estado_idx, auth.users

### Community 58 - "capas-base.js"
Cohesion: 0.22
Nodes (5): CAMPOS_DESCRIPCION, CAMPOS_NOMBRE, CAPAS_BASE, sinTildes(), tipoDePunto()

### Community 59 - "Las capas de base del mapa de riesgo"
Cohesion: 0.33
Nodes (5): De dónde salieron los que están (17/9/2026), Las capas de base del mapa de riesgo, Los cinco archivos, Los scripts, en `herramientas/`, Tres reglas antes de dejar un archivo acá

### Community 60 - "convertir.ps1"
Cohesion: 0.28
Nodes (4): Anillo(), Num(), Props(), Txt()

### Community 61 - "unir.ps1"
Cohesion: 0.73
Nodes (5): Area(), Dentro(), Simplificar(), X(), Y()

### Community 63 - "tabla-cursada.sql"
Cohesion: 0.39
Nodes (7): cursada_celda_idx, falta_materia_idx, public.cursada, public.falta, public.preferencias, auth, auth.users

### Community 64 - "persistir (guardado local de trayectoria)"
Cohesion: 0.25
Nodes (8): marcar (cambiar estado de materia), pedirCodigo (recuperar respaldo), persistir (guardado local de trayectoria), pintarRespaldo, Respaldo con código, subirRespaldo, Mi año guardado en el teléfono (local-first), RPC crear_respaldo / guardar_respaldo / traer_respaldo

### Community 65 - "crearCliente"
Cohesion: 0.60
Nodes (4): crearCliente(), consulta(), guardia(), pedir()

### Community 66 - "movimiento.js"
Cohesion: 0.60
Nodes (3): claveDeEntrada(), entrarAlLlegar(), revisar()

### Community 67 - "localStorage bolivar-carrera-resumen"
Cohesion: 0.50
Nodes (4): localStorage bolivar-carrera-resumen, pintarProgreso, pintarTodo, pintarMiCursada

### Community 69 - "Detalle de publicación (?id=)"
Cohesion: 0.24
Nodes (10): Detalle de publicación (?id=), dibujar (agenda agrupada por mes), montarCal (calendario), pintarBajarTodo, refrescarAlVolver, traer (publicaciones), Calendario del mes (Inicio), pintarFilaCarrera (+2 more)

### Community 70 - "index.ts"
Cohesion: 0.20
Nodes (7): ref_jsr_supabase, ref_npm_web_push_3_6_7, Aviso, avisosDeFinales(), avisosDeMesas(), enDias(), Suscripcion

### Community 71 - "tabla-avisos.sql"
Cohesion: 0.24
Nodes (6): public.marcar_cuando_se_aviso, avisos_suscripciones_usuario_idx, public.avisos_enviados, public.avisos_suscripciones, publicaciones_avisar_at, auth.users

### Community 73 - "portada.js"
Cohesion: 0.19
Nodes (19): buscar(), carreraDeMateria(), deQuien(), duracion(), estado(), hace(), icono_(), ordenarModos() (+11 more)

### Community 74 - "pintarAvisos"
Cohesion: 0.42
Nodes (9): apagarAvisos(), clavePublicaEnBytes(), guardarElTimbre(), guardarGustosDeAvisos(), gustosDeAvisos(), pintarAvisos(), prenderAvisos(), seBancanLosAvisos() (+1 more)

### Community 76 - "pomodoro.js"
Cohesion: 0.25
Nodes (18): abrir(), arrancar(), cambiarPreset(), despertar(), despertarAudio(), guardar(), hoyEs(), latir() (+10 more)

### Community 77 - "huella.js"
Cohesion: 0.83
Nodes (3): anotar(), escribir(), leer()

### Community 78 - "tabla-buzon.sql"
Cohesion: 0.14
Nodes (13): public, public.avisos_suscripciones, public.buzon_al_moderar, public.perfiles, buzon_al_moderar, public.buzon_categorias, public.buzon_pedidos, public.buzon_totales (+5 more)

### Community 79 - "Prompts para las sesiones hacia las elecciones (24/9 al 6/11)"
Cohesion: 0.25
Nodes (7): Bloque común (va siempre), Fuera del código (para el chat común, no para una sesión de código), Los 15 días (20/10 al 3/11): sin código, Prompts para las sesiones hacia las elecciones (24/9 al 6/11), Semana 1 (28/9 al 4/10): el buzón y la bandeja, Semana 2 (5/10 al 11/10): llegar a más, Semana 3 (12/10 al 18/10): cerrar y probar

## Knowledge Gaps
- **100 isolated node(s):** `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO`, `NOMBRE_SECCION`, `NOMBRE_LINEA` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 208 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pantalla Inicio` connect `Pantalla Mi año (carrera)` to `movimiento.js`, `Pantalla Info útil (trámites y FAQ)`, `app.js`, `Detalle de publicación (?id=)`, `Mi perfil (mi/index.html)`, `manifest.json`, `iconos.js`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `Vercel Web Analytics (/_vercel/insights/script.js, v72)` connect `Pantalla Info útil (trámites y FAQ)` to `Pantalla Mi año (carrera)`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `pedido()` connect `riesgo.js` to `Pantalla Info útil (trámites y FAQ)`, `fondo-red.js`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **What connects `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `La Fonoteca: simulador de práctica audiológica` be split into smaller, more focused modules?**
  _Cohesion score 0.06417112299465241 - nodes in this community are weakly interconnected._
- **Should `Pantalla Info útil (trámites y FAQ)` be split into smaller, more focused modules?**
  _Cohesion score 0.07301587301587302 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._