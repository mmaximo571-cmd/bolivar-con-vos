/* ============================================================
   PLAN DE ESTUDIOS · Profesorado en Trabajo Social · FTS UNLP
   Transcripto del PDF "plan PTS color" que publica la facultad
   (trabajosocial.unlp.edu.ar, subido el 22/10/2026), el 11/11/2026.

   ESTE ES EL UNICO ARCHIVO QUE HAY QUE TOCAR SI EL PLAN CAMBIA.

   UNA CARRERA DE MI AÑO, PERO TRABAJO SOCIAL PARA EL RESTO DE LA APP.
   Los dos primeros años son los de la Licenciatura, materia por
   materia, y de ahí para arriba comparte casi todo: las mismas
   cátedras, los mismos programas, las mismas fichas. Por eso
   `carreraApp` dice 'ts': Mi año lo muestra como plan propio, y para
   la base (cátedras, programas, preparaciones), el inicio y el menú
   es Trabajo Social. Lo marcado también se comparte con la
   Licenciatura: los códigos son los mismos, y quien hace las dos no
   tiene que marcar dos veces.

   Cada materia:
     cod          codigo tal cual figura en el plan
     nombre       nombre completo (en las que comparte con la
                  Licenciatura, el de plan.js: el PDF las abrevia)
     anio         1 a 5
     dictado      'anual' | '1c' | '2c' | 'libre'
     correl       codigos de las materias correlativas
     paraCursar / paraFinal   solo donde el plan dice «cursada 221»:
                  pide la cursada de Trabajo Social II, no el final
     marcada      true si en el plan aparece con asterisco (*)
     trayecto     TFDE | TFG | TFP | TFPPD (ver la lista de abajo)

   OJO: el PDF NO trae carga horaria, igual que el de la Tecnicatura.
   Por eso ninguna materia tiene «horas», tampoco las que comparte con
   la Licenciatura: no se copian de otro plan sin que la facultad lo diga.
   ============================================================ */

window.PLAN_PROF = {

  id: 'prof',
  carreraApp: 'ts',
  carrera: 'Profesorado en Trabajo Social',
  nombreCorto: 'Profesorado en TS',
  facultad: 'Facultad de Trabajo Social · UNLP',
  anios: 5,

  /* La referencia al pie de cada hoja del PDF dice «* Replica
     cuatrimestre». Se cita tal cual y se manda a confirmar: es la
     explicación de la facultad, pero no dice en qué cuatrimestre abre
     cada una en cada año. */
  notaAsterisco: 'Estas materias llevan un asterisco (*) en el plan, que la ' +
                 'facultad explica como «replica cuatrimestre»: se vuelven a ' +
                 'dictar en el otro cuatrimestre. Antes de inscribirte, ' +
                 'confirmá en Alumnos cuándo se abre cada una.',

  /* Los cuatro trayectos, como los nombra la referencia del plan */
  trayectos: {
    TFDE:  'Trayecto de Formación Disciplinar Específica',
    TFG:   'Trayecto de Formación General',
    TFP:   'Trayecto de Formación Pedagógica',
    TFPPD: 'Formación en la Práctica Profesional Docente'
  },

  materias: [

    /* ---------------- PRIMER AÑO ----------------
       Igual a la Licenciatura. */
    { cod:'211 A', nombre:'Trabajo Social I',
      anio:1, dictado:'anual', correl:[], trayecto:'TFDE' },

    { cod:'214', nombre:'Historia Social de América Latina y Argentina',
      anio:1, dictado:'anual', correl:[], trayecto:'TFG' },

    { cod:'215 A', nombre:'Introducción a la Teoría Social',
      anio:1, dictado:'1c', correl:[], trayecto:'TFG' },

    { cod:'213', nombre:'Epistemología de las Ciencias Sociales',
      anio:1, dictado:'1c', correl:[], trayecto:'TFG' },

    { cod:'211 B', nombre:'Configuración de los Problemas Sociales',
      anio:1, dictado:'2c', correl:[], trayecto:'TFDE' },

    { cod:'212 A', nombre:'Introducción a la Filosofía',
      anio:1, dictado:'2c', correl:[], trayecto:'TFG' },

    /* ---------------- SEGUNDO AÑO ----------------
       Igual a la Licenciatura. */
    { cod:'221', nombre:'Trabajo Social II',
      anio:2, dictado:'anual', correl:['211 A'], trayecto:'TFDE' },

    { cod:'225', nombre:'Teoría Social',
      anio:2, dictado:'anual', correl:['215 A'], trayecto:'TFG' },

    { cod:'222', nombre:'Investigación Social I',
      anio:2, dictado:'1c', correl:['213'], trayecto:'TFDE' },

    { cod:'215 B', nombre:'Teoría de las culturas y antropologías de las sociedades contemporáneas',
      anio:2, dictado:'2c', correl:['215 A'], trayecto:'TFG' },

    { cod:'223', nombre:'Introducción a la Psicología',
      anio:2, dictado:'2c', correl:[], marcada:true, trayecto:'TFP' },

    { cod:'226', nombre:'Teoría del Estado',
      anio:2, dictado:'2c', correl:[], marcada:true, trayecto:'TFG' },

    { cod:'227', nombre:'Economía Política',
      anio:2, dictado:'2c', correl:['214'], marcada:true, trayecto:'TFG' },

    /* ---------------- TERCER AÑO ----------------
       Las de la Licenciatura y tres propias del Profesorado (321, 331
       y 332), que piden solo la cursada de Trabajo Social II. */
    { cod:'231', nombre:'Trabajo Social III',
      anio:3, dictado:'anual', correl:['221','211 B','225'], trayecto:'TFDE' },

    { cod:'234', nombre:'Conformación de la Estructura Social Argentina',
      anio:3, dictado:'anual', correl:['211 B','225'], trayecto:'TFG' },

    { cod:'242', nombre:'Política Social',
      anio:3, dictado:'anual', correl:['214','226'], trayecto:'TFG' },

    { cod:'237', nombre:'Trabajo Social y Sujetos Colectivos',
      anio:3, dictado:'1c', correl:['214','227'], marcada:true, trayecto:'TFDE' },

    { cod:'224', nombre:'Perspectivas antropológicas para la intervención social',
      anio:3, dictado:'1c', correl:['215 B'], trayecto:'TFP' },

    { cod:'232', nombre:'Investigación Social II',
      anio:3, dictado:'2c', correl:['222'], trayecto:'TFDE' },

    { cod:'321', nombre:'Seminario Perspectivas de Género en la Intervención Profesional',
      anio:3, dictado:'1c', paraCursar:['221'], paraFinal:[], marcada:true, trayecto:'TFP' },

    { cod:'331', nombre:'Fundamentos de la Educación',
      anio:3, dictado:'1c', paraCursar:['221'], paraFinal:[], marcada:true, trayecto:'TFP' },

    { cod:'332', nombre:'Política e Instituciones Educativas',
      anio:3, dictado:'1c', paraCursar:['221'], paraFinal:[], marcada:true, trayecto:'TFP' },

    /* ---------------- CUARTO AÑO ---------------- */

    /* OJO: el PDF del Profesorado pide «321, 232, 227 y 223» para
       Trabajo Social IV. La Licenciatura pide 231 (Trabajo Social III)
       en lugar de 321, y 231 y 321 se parecen demasiado como para
       descartar un error de tipeo. Se deja como lo publicó la
       facultad hasta que Alumnos lo confirme. */
    { cod:'241', nombre:'Trabajo Social IV',
      anio:4, dictado:'anual', correl:['321','232','227','223'], trayecto:'TFDE' },

    { cod:'243', nombre:'Trabajo Social y Análisis Institucional',
      anio:4, dictado:'anual', correl:['221','223'], trayecto:'TFDE' },

    { cod:'233', nombre:'Psicología del desarrollo y la Subjetividad',
      anio:4, dictado:'1c', correl:['223'], marcada:true, trayecto:'TFP' },

    { cod:'244', nombre:'Teoría y Práctica de la Educación',
      anio:4, dictado:'1c', correl:['224'], marcada:true, trayecto:'TFP' },

    { cod:'235', nombre:'Derecho de infancia, familia y cuestión penal',
      anio:4, dictado:'1c', correl:['226'], marcada:true, trayecto:'TFG' },

    { cod:'245', nombre:'Teoría del Derecho y Derecho Social',
      anio:4, dictado:'1c', correl:['226'], trayecto:'TFG' },

    { cod:'253', nombre:'Salud Colectiva',
      anio:4, dictado:'2c', correl:['224'], marcada:true, trayecto:'TFG' },

    { cod:'342', nombre:'Didáctica de las Ciencias Sociales y el Trabajo Social',
      anio:4, dictado:'1c', correl:['332'], marcada:true, trayecto:'TFPPD' },

    { cod:'343', nombre:'Diseño y Planeamiento del Currículo',
      anio:4, dictado:'1c', correl:['332'], marcada:true, trayecto:'TFPPD' },

    /* ---------------- QUINTO AÑO ---------------- */
    { cod:'251', nombre:'Trabajo Social V',
      anio:5, dictado:'anual', correl:['241','242','237'], trayecto:'TFDE' },

    { cod:'252', nombre:'Políticas Públicas: Planificación y Gestión',
      anio:5, dictado:'anual', correl:['234','242'], trayecto:'TFDE' },

    { cod:'212 B', nombre:'Filosofía Social',
      anio:5, dictado:'1c', correl:['212 A'], marcada:true, trayecto:'TFG' },

    { cod:'254', nombre:'Debate contemporáneo y Trabajo Social',
      anio:5, dictado:'1c', correl:['241'], marcada:true, trayecto:'TFDE' },

    { cod:'322', nombre:'Seminario de Educación en Entornos Virtuales',
      anio:5, dictado:'1c', correl:['331','332'], marcada:true, trayecto:'TFP' },

    { cod:'341', nombre:'Prácticas Educativas en Perspectiva de Inclusión',
      anio:5, dictado:'1c', correl:['244'], marcada:true, trayecto:'TFP' },

    { cod:'351', nombre:'Prácticas de la Enseñanza',
      anio:5, dictado:'1c', correl:['342'], marcada:true, trayecto:'TFPPD' },

    /* «Otros requisitos: Trabajo Final», al pie del quinto año. Va como
       materia y no como requisito (los requisitos de esta pantalla son
       una casilla atada al idioma de la Licenciatura) y sin código,
       porque el plan no le pone uno. Tampoco dice qué pide antes. */
    { cod:'TF', nombre:'Trabajo Final',
      anio:5, dictado:'libre', correl:[] }
  ]
};
