# Graph Report - bolivar-con-vos  (2026-10-07)

## Corpus Check
- 88 files · ~324,496 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .css 25, (none) 5, .geojson 4)

## Summary
- 992 nodes · 1502 edges · 111 communities (69 shown, 42 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 96 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `69366c77`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- La carrera se elige una vez (bolivar-carrera-v2)
- Pantalla Mi año (carrera)
- tabla-anotados.sql
- Pantalla Info útil (trámites y FAQ)
- app.js
- avisanos.js
- pintarFinal (preparación de final)
- leer-programa.js
- Mi perfil (mi/index.html)
- manifest.json
- pintarNav
- arsenal.js
- portada.js
- htmlNovedades
- leer.js
- esc
- ficha.js
- pantallaMiCuenta
- tabla-avisanos.sql
- tabla-registro.sql
- fecha-al-calendario.js
- riesgo.js
- PROMPT-FONOTECA.md
- Component
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
- Pantalla El Consejo Directivo
- tabla-respaldos.sql
- tabla-riesgo.sql
- pintarAccesos
- pintarKit
- Chat y botón «Avisanos»
- public.pagina_quienes
- public.programas
- voy.js
- leer-analitico.js
- El molde para pedirle diseño a una IA
- tabla-guia.sql
- abrirFicha / cerrarFicha (detalle de trámite)
- Bitácora · La Bolívar con vos
- tabla-quienes.sql
- anotar
- capas.js
- tabla-consejo.sql
- Cómo sumar algo al Arsenal
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
- session-start.sh
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
- parciales.js
- rangoLindo
- tabla-publicaciones.sql
- public.campana_leidas
- vistaProgramas (programas de materias)
- ref_jsr_supabase
- public.publicaciones
- congreso.js
- tabla-congreso.sql
- sesionActual
- leer-aviso.js
- compartido.js
- Curaduría y lluvia de ideas sin Claude
- tabla-mi-ano.sql

## God Nodes (most connected - your core abstractions)
1. `Pantalla Mi año (carrera)` - 19 edges
2. `Pantalla Inicio` - 17 edges
3. `pintarNav()` - 14 edges
4. `pintar()` - 12 edges
5. `desdeTexto()` - 11 edges
6. `Component` - 10 edges
7. `pasar()` - 10 edges
8. `Mi perfil (mi/index.html)` - 10 edges
9. `htmlNovedades()` - 9 edges
10. `arrancar()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `1. Carga fácil de paros y grupos de estudio` --references--> `linea()`  [INFERRED]
  docs/PROPUESTAS.md → estudiemos/fichas/leer.js
- `4. Época de parciales en Estudiemos` --references--> `terminar()`  [INFERRED]
  docs/PROPUESTAS.md → estudiemos/pomodoro.js
- `4. Época de parciales en Estudiemos` --references--> `anotarHito()`  [INFERRED]
  docs/PROPUESTAS.md → app.js
- `3. Calendario y avisos: que se revisen todos los días` --references--> `guardarCopiaCursada()`  [INFERRED]
  docs/PROPUESTAS.md → app.js
- `Pantalla Fonoteca (práctica de audiogramas)` --calls--> `pintarNav()`  [EXTRACTED]
  estudiemos/fonoteca/index.html → app.js

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

## Communities (111 total, 42 thin omitted)

### Community 0 - "La carrera se elige una vez (bolivar-carrera-v2)"
Cohesion: 0.14
Nodes (14): Versión 2.0 de AI Studio (React + Tailwind), La carrera se elige una vez (bolivar-carrera-v2), Congelamiento de código (16-17/9), El embudo del 21 (hitos y origen de Instagram), Lanzamiento 21 de septiembre (Día del Estudiante), El plan de estudios se imprime, no se publica en PDF, anotar(): registro de visitas, búsquedas y errores, Riel deslizable de herramientas de Estudiemos (+6 more)

### Community 1 - "Pantalla Mi año (carrera)"
Cohesion: 0.16
Nodes (16): Pantalla Agenda (Fechas y novedades), Tema claro/oscuro (localStorage bolivar-tema), Pantalla Mi año (carrera), Vista plan (Mi año), estilos.css, Pantalla Glosario universitario, icono(), iconoDeCategoria() (+8 more)

### Community 2 - "tabla-anotados.sql"
Cohesion: 0.27
Nodes (9): anotados_suscripcion_idx, public.anotable(), public.anotados, public.anotados_contacto, public.anotados_totales, public.anotados_totales_calc(), public.anotarme(), public.avisos_suscripciones (+1 more)

### Community 3 - "Pantalla Info útil (trámites y FAQ)"
Cohesion: 0.18
Nodes (13): anotarBusqueda(), normalizar(), parametro(), Pantalla Cátedras, vistaCatedras, vistaCategorias, vistaFaq (editor de preguntas frecuentes), vistaTramites (editor de trámites) (+5 more)

### Community 4 - "app.js"
Cohesion: 0.07
Nodes (28): avisarMostrandoGuardado(), avisarNoSePudoActualizar(), AVISOS_POR_DEFECTO, cajaDelAviso(), CARRERAS_APP, cuentaGuardada(), cuentaParaLaCampana(), desdeCuando() (+20 more)

### Community 5 - "avisanos.js"
Cohesion: 0.21
Nodes (21): abrir(), buscar(), cerrar(), comoSeEscribe(), contactosDe(), decir(), enlaceDe(), fichaHTML() (+13 more)

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
Cohesion: 0.09
Nodes (21): background_color, description, display, icons, id, lang, name, orientation (+13 more)

### Community 10 - "pintarNav"
Cohesion: 0.14
Nodes (18): anotarCarreraApp(), aplicarTema(), carreraActual(), carreraElegidaApp(), leerCarreraGuardada(), marcarTitulos(), menosMovimiento(), pintarAvisanos() (+10 more)

### Community 11 - "arsenal.js"
Cohesion: 0.18
Nodes (23): alFiltrar(), alMarcar(), armar(), arrancar(), avisar(), errorDeJSON(), esDeAfuera(), esNuevo() (+15 more)

### Community 12 - "portada.js"
Cohesion: 0.18
Nodes (20): buscar(), carrera(), carreraDeMateria(), deQuien(), duracion(), estado(), hace(), icono_() (+12 more)

### Community 13 - "htmlNovedades"
Cohesion: 0.17
Nodes (18): abrir(), alarmaDeMesa(), armarBandeja(), arrancar(), avisoDeBandeja(), avisoLeido(), categoriaDePublicacion(), cuandoEnBandeja() (+10 more)

### Community 14 - "leer.js"
Cohesion: 0.15
Nodes (18): guardarCopiaCursada(), 1. Carga fácil de paros y grupos de estudio, 2. Anotarse a un grupo de estudio, 3. Calendario y avisos: que se revisen todos los días, Cómo se anota, Descartadas, Las propuestas, N. Título corto (+10 more)

### Community 15 - "esc"
Cohesion: 0.18
Nodes (12): anotarQueSeVio(), errorEnCastellano(), esc(), escMulti(), esiOS(), explicarError(), htmlPie(), invitarAInstalar() (+4 more)

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
Cohesion: 0.19
Nodes (21): archivoICS(), bajarICS(), detalleDelEvento(), doblarRenglon(), escaparICS(), eventoICS(), horaNumeros(), htmlAgendarlo() (+13 more)

### Community 21 - "riesgo.js"
Cohesion: 0.07
Nodes (45): abrir(), aFila(), armarCapaBase(), armarMapa(), base(), bloquearDetras(), cambiarEstadoBase(), cargarBase() (+37 more)

### Community 22 - "PROMPT-FONOTECA.md"
Cohesion: 0.12
Nodes (16): Dónde vive, El navegador de Instagram, El orden, y por qué cada solapa tiene que poder salir sola, El volumen, si hay tonos, La Fonoteca: el simulador de práctica audiológica, La regla que va antes que todas, Lo que no se negocia, en todas las solapas, Nada copiado (+8 more)

### Community 23 - "Component"
Cohesion: 0.09
Nodes (18): crearMarcas(), avisar(), escribir(), leer(), poner(), tiene(), vacio(), get() (+10 more)

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
Cohesion: 0.19
Nodes (14): apagar(), armarTodo(), arrancar(), bucle(), Capa(), deLienzo(), esDeNoche(), marcarMedicion() (+6 more)

### Community 35 - "El Trayecto Optativo: qué tiene que decir la pantalla"
Cohesion: 0.29
Nodes (6): Cómo tiene que verse (lo que no se negocia), Dónde va a entrar, para que salga del tamaño correcto, El Trayecto Optativo: qué tiene que decir la pantalla, Las seis preguntas que la pantalla tiene que contestar, Lo que sabemos, y es poco, Por qué existe esta pantalla

### Community 36 - "tabla-organizador.sql"
Cohesion: 0.43
Nodes (5): preparaciones_unico_idx, programas_unico_idx, public.preparaciones, public.programas, auth.users

### Community 38 - "Pantalla El Consejo Directivo"
Cohesion: 0.09
Nodes (29): Pantalla Anatomofisiología (guía de materia), bloqueModelo / sinFechas, conPaciencia(), guardarEnMemoria(), memoriaDe(), armarPosteos() (embed IG diferido), Conquistas con posteo (CONQUISTAS, v70), htmlConquistas() (línea por año) (+21 more)

### Community 40 - "tabla-riesgo.sql"
Cohesion: 0.47
Nodes (4): public.reportes_riesgo, reportes_riesgo_autor_idx, reportes_riesgo_estado_idx, auth.users

### Community 46 - "voy.js"
Cohesion: 0.25
Nodes (9): CATEGORIAS_CON_VOY, dejarContacto(), guardarVoy(), leerVoy(), limpiarVoy(), marcarVoy(), marcaVoy(), timbreDelTelefono() (+1 more)

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
Cohesion: 0.20
Nodes (11): anotar(), anotarError(), anotarHito(), avisarQueNoArranca(), contarVisita(), deDondeVino(), esPrueba(), programarVisita() (+3 more)

### Community 55 - "capas.js"
Cohesion: 0.67
Nodes (3): capaRiesgo(), CAPAS_RIESGO, nombreCategoriaRiesgo()

### Community 56 - "tabla-consejo.sql"
Cohesion: 0.50
Nodes (3): al_tocar_consejo, public.pagina_consejo, public.tocar_quienes

### Community 57 - "Cómo sumar algo al Arsenal"
Cohesion: 0.22
Nodes (8): 1. Copiá un bloque, 2. Los campos, 3. El porqué, 4. Los links: solo legales, 5. Las tres cosas que rompen el archivo, 6. Antes de subirlo, probalo, 7. Después de subirlo, Cómo sumar algo al Arsenal

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
Cohesion: 0.15
Nodes (13): ref_npm_web_push_3_6_7, atender(), Aviso, avisosDeEventos(), avisosDeFinales(), avisosDeMesas(), Canal, CANAL_DE (+5 more)

### Community 71 - "tabla-avisos.sql"
Cohesion: 0.19
Nodes (8): public.marcar_cuando_se_aviso, avisos_pases_creado_idx, avisos_suscripciones_usuario_idx, public.avisos_enviados, public.avisos_pases, public.avisos_suscripciones, publicaciones_avisar_at, auth.users

### Community 73 - "tarjeta-avance.js"
Cohesion: 0.52
Nodes (6): aBlob(), compartir(), dibujar(), esperarLaFuente(), tamanoQueEntra(), tramaDePuntos()

### Community 74 - "prenderAvisos"
Cohesion: 0.25
Nodes (9): apagarAvisos(), clavePublicaEnBytes(), guardarElTimbre(), guardarGustosDeAvisos(), gustosDeAvisos(), prenderAvisos(), seBancanLosAvisos(), suscripcionDeEsteTelefono() (+1 more)

### Community 76 - "pomodoro.js"
Cohesion: 0.27
Nodes (17): abrir(), arrancar(), cambiarPreset(), despertar(), despertarAudio(), guardar(), hoyEs(), latir() (+9 more)

### Community 77 - "huella.js"
Cohesion: 0.83
Nodes (3): anotar(), escribir(), leer()

### Community 78 - "tabla-buzon.sql"
Cohesion: 0.14
Nodes (13): public.buzon_al_moderar, public.perfiles, buzon_al_moderar, public.buzon_categorias, public.buzon_pedidos, public.buzon_totales, public.buzon_totales_calc(), public.es_comunicacion() (+5 more)

### Community 91 - "parciales.js"
Cohesion: 0.48
Nodes (6): atajos(), carrera(), contarGrupos(), guardar(), leer(), pintar()

### Community 95 - "rangoLindo"
Cohesion: 1.00
Nodes (3): fechaLinda(), partesFecha(), rangoLindo()

### Community 99 - "tabla-publicaciones.sql"
Cohesion: 0.31
Nodes (6): public.marcas_de_publicacion, public.publicaciones, publicaciones_avisos_idx, publicaciones_creado_por_idx, publicaciones_marcas, publicaciones_pendientes_idx

### Community 101 - "vistaProgramas (programas de materias)"
Cohesion: 0.33
Nodes (6): PLANES (PLAN_TS, PLAN_TGCR, PLAN_FONO), leerPrograma (lib/leer-programa.js), textoDelPdf, vistaProgramas (programas de materias), vistaProgramasPDF (carga masiva desde PDF), Tabla/bucket Supabase programas

### Community 104 - "congreso.js"
Cohesion: 0.12
Nodes (32): abrirHoja(), abrirLoQuePideElEnlace(), ahoraEnLaPlata(), cargarMuro(), cerrarHoja(), diaLindo(), estadoDe(), etiquetaEstado() (+24 more)

### Community 105 - "tabla-congreso.sql"
Cohesion: 0.21
Nodes (14): public.tocar_congreso_mesa, al_tocar_congreso_mesa, congreso_interv_eje_idx, congreso_interv_marca_idx, congreso_interv_mesa_idx, congreso_mesas_fecha_idx, congreso_votos_marca_idx, public.congreso_apoyar() (+6 more)

### Community 106 - "sesionActual"
Cohesion: 0.33
Nodes (6): esDelEquipo(), sesionActual(), Pantalla Panel (administración del equipo), panel() arranque y control de sesión, Tabla Supabase guardados, botonGuardar (guardados del usuario)

### Community 107 - "leer-aviso.js"
Cohesion: 0.29
Nodes (16): aISO(), bajarGritos(), buscarFecha(), buscarHora(), buscarLugar(), conAnio(), fechaValida(), leerAviso() (+8 more)

### Community 109 - "Curaduría y lluvia de ideas sin Claude"
Cohesion: 0.22
Nodes (8): 1. El cargador: lo que va antes de todo pedido, 2. Molde de curaduría, 3. Molde de lluvia de ideas, 4. Cómo vuelve a Claude en quince líneas, 5. Lo que Gemini hace mal acá, siempre, 6. Con qué más se puede seguir cuando no hay tokens, 7. Lo que no se delega, ni acá ni en ningún lado, Curaduría y lluvia de ideas sin Claude

## Knowledge Gaps
- **178 isolated node(s):** `session-start.sh script`, `__hitosDeEstaVisita`, `MESES`, `MESES_LARGO`, `NOMBRE_SECCION` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 319 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Pantalla Inicio` connect `Pantalla Mi año (carrera)` to `movimiento.js`, `app.js`, `Detalle de publicación (?id=)`, `Pantalla El Consejo Directivo`, `Mi perfil (mi/index.html)`, `manifest.json`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `pedido()` connect `riesgo.js` to `Pantalla El Consejo Directivo`, `fondo-red.js`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `Vercel Web Analytics (/_vercel/insights/script.js, v72)` connect `Pantalla El Consejo Directivo` to `Pantalla Mi año (carrera)`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `__hitosDeEstaVisita`, `MESES` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `La carrera se elige una vez (bolivar-carrera-v2)` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06827880512091039 - nodes in this community are weakly interconnected._
- **Should `manifest.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._