# Graph Report - bolivar-con-vos  (2026-09-27)

## Corpus Check
- 69 files · ~242,062 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 22, (none) 5, .geojson 4)

## Summary
- 765 nodes · 1116 edges · 99 communities (61 shown, 38 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c458a32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- La carrera se elige una vez (bolivar-carrera-v2)
- Pantalla Mi año (carrera)
- Pantalla Info útil (trámites y FAQ)
- Pantalla El Consejo Directivo
- app.js
- portada.js
- pintarFinal (preparación de final)
- leer-programa.js
- Mi perfil (mi/index.html)
- manifest.json
- pintarNav
- esc
- portada.js
- htmlNovedades
- leer.js
- invitarAInstalar
- ficha.js
- pantallaMiCuenta
- tabla-avisanos.sql
- tabla-registro.sql
- fecha-al-calendario.js
- riesgo.js
- PROMPT-FONOTECA.md
- ficha-parser.js
- LEEME · La Bolívar con vos
- Mails de las cátedras · material en crudo
- CASOS (audiogramas clínicos con diagnóstico escrito)
- tabla-cursada.sql
- El molde para armar una ficha de estudio
- vistaAvisanos (contactos y consultas)
- fondo-red.js
- Sección Instagram (posteos_ig)
- vistaAgenda (publicaciones)
- vistaRegistro (resumen de uso)
- El Trayecto Optativo: qué tiene que decir la pantalla
- tabla-organizador.sql
- pintar() (cuenta de las 120 horas por área)
- sesionActual
- tabla-respaldos.sql
- tabla-riesgo.sql
- pintarAccesos
- pintarKit
- Chat y botón «Avisanos»
- public.pagina_quienes
- public.programas
- ponerAviso
- leer-analitico.js
- El molde para pedirle diseño a una IA
- tabla-guia.sql
- abrirFicha / cerrarFicha (detalle de trámite)
- Bitácora · La Bolívar con vos
- tabla-quienes.sql
- anotar
- capas.js
- tabla-consejo.sql
- pintarTema
- capas-base.js
- Las capas de base del mapa de riesgo
- convertir.ps1
- unir.ps1
- Prompt para abrir una sesión de código (17/9 en adelante)
- persistir (guardado local de trayectoria)
- crearCliente
- movimiento.js
- localStorage bolivar-carrera-resumen
- elegirCarrera
- Detalle de publicación (?id=)
- avisos/index.ts
- tabla-avisos.sql
- tarjeta-avance.js
- prenderAvisos
- buscar (buscador de trámites, FAQ y cátedras)
- pomodoro.js
- huella.js
- tabla-buzon.sql
- publicaciones_alarma_idx
- tabla-catedras.sql
- tabla-materiales.sql
- tabla-posteos-ig.sql
- HISTORIAL-SW.md
- Estética serigrafía
- pintarAvisos
- Glosario (texto en el HTML, tres puertas)
- Versión del service worker (sw.js vNN)
- El buscador mira toda la app
- ref_jsr_supabase
- public.publicaciones

## God Nodes (most connected - your core abstractions)
1. `Pantalla Mi año (carrera)` - 19 edges
2. `Pantalla Inicio` - 17 edges
3. `pintarNav()` - 14 edges
4. `pintar()` - 12 edges
5. `desdeTexto()` - 11 edges
6. `pasar()` - 10 edges
7. `Mi perfil (mi/index.html)` - 10 edges
8. `arrancar()` - 9 edges
9. `pedido()` - 9 edges
10. `Prompts para las sesiones hacia las elecciones (24/9 al 6/11)` - 9 edges

## Surprising Connections (you probably didn't know these)
- `esDeOtraCarrera (filtra materiales por plan)` --calls--> `carreraActual()`  [EXTRACTED]
  estudiemos/index.html → app.js
- `Pantalla Fonoteca (práctica de audiogramas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/fonoteca/index.html → app.js
- `Pantalla Estudiemos (landing de herramientas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/index.html → app.js
- `Pantalla Glosario universitario` --calls--> `pintarNav()`  [EXTRACTED]
  glosario/index.html → app.js
- `Pantalla Info útil (trámites y FAQ)` --calls--> `pintarNav()`  [EXTRACTED]
  tramites/index.html → app.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Herramientas de Estudiemos** — estudiemos_index, estudiemos_fichas_index, estudiemos_fonoteca_index, anatomo_index [EXTRACTED 1.00]
- **Lectura con memoria local y paciencia** — app_memoriade, app_conpaciencia, app_guardarenmemoria, quienes_index, consejo_index, anatomo_index, catedras_index, tramites_index, estudiemos_index [EXTRACTED 1.00]
- **Flujo de respaldo de la trayectoria con código** — carrera_index_persistir, carrera_index_subirrespaldo, carrera_index_pintarrespaldo, carrera_index_pedircodigo, rpc_respaldos [EXTRACTED 1.00]
- **Decisiones tomadas por el navegador de Instagram** — bitacora_navegador_instagram, bitacora_movimiento_js, bitacora_explicarerror, bitacora_service_worker_version, bitacora_lanzamiento_21_septiembre [INFERRED 0.85]
- **Preparación de final (Estudiemos)** — carrera_index_pintarfinal, carrera_index_vistanueva, carrera_index_vistapreparacion, carrera_index_pomodoro, tabla_preparaciones, tabla_programas [INFERRED 0.85]
- **Pantallas que muestran publicaciones de la agenda** — tabla_publicaciones, index_proximodelaagenda, index_calendario_mes, agenda_index_traer, agenda_index_detalle_publicacion, carrera_index_vistanueva [INFERRED 0.85]
- **El Panel edita el contenido que leen las pantallas públicas** — panel_index, tramites_index, quienes_index, consejo_index, anatomo_index, catedras_index, estudiemos_index [INFERRED 0.95]

## Communities (99 total, 38 thin omitted)

### Community 0 - "La carrera se elige una vez (bolivar-carrera-v2)"
Cohesion: 0.14
Nodes (14): Versión 2.0 de AI Studio (React + Tailwind), La carrera se elige una vez (bolivar-carrera-v2), Congelamiento de código (16-17/9), El embudo del 21 (hitos y origen de Instagram), Lanzamiento 21 de septiembre (Día del Estudiante), El plan de estudios se imprime, no se publica en PDF, anotar(): registro de visitas, búsquedas y errores, Riel deslizable de herramientas de Estudiemos (+6 more)

### Community 1 - "Pantalla Mi año (carrera)"
Cohesion: 0.20
Nodes (13): Pantalla Agenda (Fechas y novedades), Tema claro/oscuro (localStorage bolivar-tema), Pantalla Mi año (carrera), Vista plan (Mi año), estilos.css, Pantalla Glosario universitario, icono(), iconoDeCategoria() (+5 more)

### Community 2 - "Pantalla Info útil (trámites y FAQ)"
Cohesion: 0.10
Nodes (21): anotarBusqueda(), normalizar(), parametro(), PLANES (PLAN_TS, PLAN_TGCR, PLAN_FONO), Pantalla Cátedras, carreraDeLaPersona, esDeOtraCarrera (filtra materiales por plan), leerPrograma (lib/leer-programa.js) (+13 more)

### Community 3 - "Pantalla El Consejo Directivo"
Cohesion: 0.09
Nodes (29): Pantalla Anatomofisiología (guía de materia), bloqueModelo / sinFechas, conPaciencia(), guardarEnMemoria(), memoriaDe(), armarPosteos() (embed IG diferido), Conquistas con posteo (CONQUISTAS, v70), htmlConquistas() (línea por año) (+21 more)

### Community 4 - "app.js"
Cohesion: 0.09
Nodes (14): AVISOS_POR_DEFECTO, CARRERAS_APP, __hitosDeEstaVisita, htmlCabecera(), htmlCampana(), INDICE_PIE, MESES, MESES_LARGO (+6 more)

### Community 5 - "portada.js"
Cohesion: 0.20
Nodes (22): carrera(), abrir(), buscar(), cerrar(), comoSeEscribe(), contactosDe(), decir(), enlaceDe() (+14 more)

### Community 6 - "pintarFinal (preparación de final)"
Cohesion: 0.18
Nodes (11): guardarPrep, pintarFinal (preparación de final), pintarMapa, Pomodoro de estudio, verPestana (pestañas plan/mapa/todo/final), Vista preparar final (Estudiemos), Vista mapa de correlativas, vistaNueva (nueva preparación) (+3 more)

### Community 7 - "leer-programa.js"
Cohesion: 0.24
Nodes (15): agruparReferencias(), buscarAnio(), buscarCodigo(), desdeTexto(), despegar(), digitos(), esRuido(), inicioDeReferencia() (+7 more)

### Community 8 - "Mi perfil (mi/index.html)"
Cohesion: 0.16
Nodes (15): explicarError() / errores en castellano, movimiento.js (entrarAlLlegar, encenderAlBajar), Webview de Instagram como navegador real, abrirHoja (ficha de materia), cargarCatedras, Bienvenida «La salida siempre es colectiva», mostrarBienvenida (una vez por día de estudio), pintarCuadro (animación de apertura) (+7 more)

### Community 9 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, description, display, icons, id, lang, name, orientation (+4 more)

### Community 10 - "pintarNav"
Cohesion: 0.31
Nodes (9): marcarTitulos(), menosMovimiento(), pintarAvisanos(), esconderGlobo(), mostrarGlobo(), pintarNav(), abrir(), ponerLupa() (+1 more)

### Community 11 - "esc"
Cohesion: 0.22
Nodes (10): alarmaDeMesa(), errorEnCastellano(), esc(), escMulti(), explicarError(), hoyISO(), htmlPie(), idDeLaAlertaVisible() (+2 more)

### Community 12 - "portada.js"
Cohesion: 0.19
Nodes (19): buscar(), carreraDeMateria(), deQuien(), duracion(), estado(), hace(), icono_(), ordenarModos() (+11 more)

### Community 13 - "htmlNovedades"
Cohesion: 0.24
Nodes (10): abrir(), arrancar(), fechaLinda(), htmlNovedades(), leidasNovedades(), novedadLeida(), partesFecha(), pintarCampana() (+2 more)

### Community 14 - "leer.js"
Cohesion: 0.44
Nodes (8): campos(), esc(), leer(), linea(), maquinas(), noEsta(), pintar(), preguntas()

### Community 15 - "invitarAInstalar"
Cohesion: 0.33
Nodes (7): anotarQueSeVio(), esiOS(), invitarAInstalar(), cerrar(), seDijoQueNo(), sePuedeInvitarAInstalar(), yaEstaInstalada()

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

### Community 20 - "fecha-al-calendario.js"
Cohesion: 0.21
Nodes (18): archivoICS(), bajarICS(), detalleDelEvento(), doblarRenglon(), escaparICS(), eventoICS(), horaNumeros(), htmlAgendarlo() (+10 more)

### Community 21 - "riesgo.js"
Cohesion: 0.07
Nodes (46): apagar(), abrir(), aFila(), armarCapaBase(), armarMapa(), base(), bloquearDetras(), cambiarEstadoBase() (+38 more)

### Community 22 - "PROMPT-FONOTECA.md"
Cohesion: 0.12
Nodes (16): Dónde vive, El navegador de Instagram, El orden, y por qué cada solapa tiene que poder salir sola, El volumen, si hay tonos, La Fonoteca: el simulador de práctica audiológica, La regla que va antes que todas, Lo que no se negocia, en todas las solapas, Nada copiado (+8 more)

### Community 23 - "ficha-parser.js"
Cohesion: 0.24
Nodes (7): get(), kv(), namedList(), paras(), parseFicha(), segs(), Component

### Community 24 - "LEEME · La Bolívar con vos"
Cohesion: 0.67
Nodes (3): LEEME · La Bolívar con vos, Agrupación Simón Bolívar (Conducción del CEFTS, FTS-UNLP), Secciones de la app (Inicio, Info útil, Mi año, Estudiemos, Fechas, Perfil, ¿Quiénes somos?)

### Community 25 - "Mails de las cátedras · material en crudo"
Cohesion: 0.12
Nodes (15): 1er año, 1er año, 2do año, 2do año, 3er año, 3er año, 4to año, 4to año (+7 more)

### Community 26 - "CASOS (audiogramas clínicos con diagnóstico escrito)"
Cohesion: 0.50
Nodes (4): CASOS (audiogramas clínicos con diagnóstico escrito), devolucion / revision (corrección de respuestas), svgAudiograma, tipoCalculado (PTP, GAP y tipo de hipoacusia)

### Community 28 - "tabla-cursada.sql"
Cohesion: 0.39
Nodes (7): cursada_celda_idx, falta_materia_idx, public.cursada, public.falta, public.preferencias, auth, auth.users

### Community 29 - "El molde para armar una ficha de estudio"
Cohesion: 0.29
Nodes (6): Después de bajar el `.dc.html`, El molde para armar una ficha de estudio, Lo que no hay que pedirle a ninguno de los dos, Paso 1 · Para pegar en NotebookLM, Paso 2 · Para pegar en Claude Design, Qué hacer con lo que salga

### Community 30 - "vistaAvisanos (contactos y consultas)"
Cohesion: 0.67
Nodes (3): vistaAvisanos (contactos y consultas), Tabla Supabase consultas, Tabla Supabase contactos

### Community 31 - "fondo-red.js"
Cohesion: 0.20
Nodes (13): armarTodo(), arrancar(), bucle(), Capa(), deLienzo(), esDeNoche(), marcarMedicion(), nuevoLienzo() (+5 more)

### Community 35 - "El Trayecto Optativo: qué tiene que decir la pantalla"
Cohesion: 0.29
Nodes (6): Cómo tiene que verse (lo que no se negocia), Dónde va a entrar, para que salga del tamaño correcto, El Trayecto Optativo: qué tiene que decir la pantalla, Las seis preguntas que la pantalla tiene que contestar, Lo que sabemos, y es poco, Por qué existe esta pantalla

### Community 36 - "tabla-organizador.sql"
Cohesion: 0.43
Nodes (5): preparaciones_unico_idx, programas_unico_idx, public.preparaciones, public.programas, auth.users

### Community 38 - "sesionActual"
Cohesion: 0.33
Nodes (6): esDelEquipo(), sesionActual(), Pantalla Panel (administración del equipo), panel() arranque y control de sesión, Tabla Supabase guardados, botonGuardar (guardados del usuario)

### Community 40 - "tabla-riesgo.sql"
Cohesion: 0.47
Nodes (4): public.reportes_riesgo, reportes_riesgo_autor_idx, reportes_riesgo_estado_idx, auth.users

### Community 46 - "ponerAviso"
Cohesion: 0.50
Nodes (5): avisarMostrandoGuardado(), avisarNoSePudoActualizar(), cajaDelAviso(), desdeCuando(), ponerAviso()

### Community 47 - "leer-analitico.js"
Cohesion: 0.31
Nodes (10): carreraDelTexto(), emparejar(), filas(), iso(), leerAnalitico(), normal(), numeros(), parecido() (+2 more)

### Community 48 - "El molde para pedirle diseño a una IA"
Cohesion: 0.40
Nodes (4): Después de pegar lo que salga, El molde para pedirle diseño a una IA, Lo que NO hay que pedirle, Para copiar y pegar antes de cada pedido

### Community 50 - "tabla-guia.sql"
Cohesion: 0.50
Nodes (4): al_tocar_guia, guia_materia_unica_idx, public.guia_materia, public.tocar_quienes

### Community 53 - "tabla-quienes.sql"
Cohesion: 0.40
Nodes (3): al_tocar_quienes, public.pagina_quienes, public.tocar_quienes

### Community 54 - "anotar"
Cohesion: 0.17
Nodes (13): anotar(), anotarCarreraApp(), anotarError(), anotarHito(), avisarQueNoArranca(), carreraActual(), carreraElegidaApp(), contarVisita() (+5 more)

### Community 55 - "capas.js"
Cohesion: 0.67
Nodes (3): capaRiesgo(), CAPAS_RIESGO, nombreCategoriaRiesgo()

### Community 56 - "tabla-consejo.sql"
Cohesion: 0.50
Nodes (3): al_tocar_consejo, public.pagina_consejo, public.tocar_quienes

### Community 57 - "pintarTema"
Cohesion: 0.67
Nodes (3): aplicarTema(), pintarTema(), temaGuardado()

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

### Community 70 - "avisos/index.ts"
Cohesion: 0.22
Nodes (6): ref_npm_web_push_3_6_7, Aviso, avisosDeFinales(), avisosDeMesas(), enDias(), Suscripcion

### Community 71 - "tabla-avisos.sql"
Cohesion: 0.21
Nodes (8): public.marcar_cuando_se_aviso, avisos_pases_creado_idx, avisos_suscripciones_usuario_idx, public.avisos_enviados, public.avisos_pases, public.avisos_suscripciones, publicaciones_avisar_at, auth.users

### Community 73 - "tarjeta-avance.js"
Cohesion: 0.52
Nodes (6): aBlob(), compartir(), dibujar(), esperarLaFuente(), tamanoQueEntra(), tramaDePuntos()

### Community 74 - "prenderAvisos"
Cohesion: 0.29
Nodes (8): apagarAvisos(), clavePublicaEnBytes(), guardarElTimbre(), guardarGustosDeAvisos(), gustosDeAvisos(), prenderAvisos(), seBancanLosAvisos(), suscripcionDeEsteTelefono()

### Community 75 - "buscar (buscador de trámites, FAQ y cátedras)"
Cohesion: 0.67
Nodes (3): buscar (buscador de trámites, FAQ y cátedras), pedirCatedras, Tabla Supabase tramites

### Community 76 - "pomodoro.js"
Cohesion: 0.14
Nodes (26): Bloque común (va siempre), Búsqueda: permanencia y estudio, Fuera del código (para el chat común, no para una sesión de código), Los 15 días (20/10 al 3/11): sin código, Prompts para las sesiones hacia las elecciones (24/9 al 6/11), Semana 1 (28/9 al 4/10): el buzón y la bandeja, Semana 2 (5/10 al 11/10): llegar a más, Semana 3 (12/10 al 18/10): cerrar y probar (+18 more)

### Community 77 - "huella.js"
Cohesion: 0.83
Nodes (3): anotar(), escribir(), leer()

### Community 78 - "tabla-buzon.sql"
Cohesion: 0.14
Nodes (13): public, public.avisos_suscripciones, public.buzon_al_moderar, public.perfiles, buzon_al_moderar, public.buzon_categorias, public.buzon_pedidos, public.buzon_totales (+5 more)

## Knowledge Gaps
- **139 isolated node(s):** `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO`, `NOMBRE_SECCION`, `NOMBRE_LINEA` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 254 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pantalla Inicio` connect `Pantalla Mi año (carrera)` to `movimiento.js`, `Pantalla El Consejo Directivo`, `app.js`, `Detalle de publicación (?id=)`, `Mi perfil (mi/index.html)`, `manifest.json`, `buscar (buscador de trámites, FAQ y cátedras)`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `pedido()` connect `riesgo.js` to `Pantalla El Consejo Directivo`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `Vercel Web Analytics (/_vercel/insights/script.js, v72)` connect `Pantalla El Consejo Directivo` to `Pantalla Mi año (carrera)`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `La carrera se elige una vez (bolivar-carrera-v2)` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Pantalla Info útil (trámites y FAQ)` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Should `Pantalla El Consejo Directivo` be split into smaller, more focused modules?**
  _Cohesion score 0.08602150537634409 - nodes in this community are weakly interconnected._