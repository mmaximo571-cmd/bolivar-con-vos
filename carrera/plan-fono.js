/* ============================================================
   PLAN DE ESTUDIOS · Licenciatura en Fonoaudiología
   FTS UNLP. Transcripto del PDF "plan de estudios fono".

   ESTE ES EL UNICO ARCHIVO QUE HAY QUE TOCAR SI EL PLAN CAMBIA.

   OJO, ESTE PLAN ES DISTINTO A LOS OTROS DOS.
   El cuadro trae DOS columnas de correlativas, no una:

     "CURSADA"           -> lo que necesitás con la CURSADA APROBADA
                            para poder CURSAR esta materia.
     "FINAL / PROMOCIÓN" -> lo que necesitás con el FINAL APROBADO
                            para poder RENDIR EL FINAL o PROMOCIONAR esta materia.

   Por eso acá cada materia tiene dos listas en vez de una:
     paraCursar  y  paraFinal
   Un guion (-) en el cuadro se transcribe como lista vacía: [].

   En Trabajo Social y en Gestión del Riesgo el cuadro trae una sola
   columna, y ahí vale la regla general: la misma lista sirve para las
   dos cosas (cursada aprobada habilita a cursar, final aprobado habilita
   a promocionar).

   Cada materia:
     cod         codigo tal cual figura en el plan
     nombre      nombre completo
     anio        1 a 5
     dictado     'anual' | '1c' | '2c'
     paraCursar  codigos que necesitás con la cursada aprobada
     paraFinal   codigos que necesitás con el final aprobado.
                 Puede ser la palabra 'todas-1-a-4' (la usa el Trabajo
                 Integrador Final, que pide todas las materias de 1° a 4°).

   OJO: el PDF de esta carrera NO trae carga horaria. Por eso ninguna
   materia tiene el campo "horas". Si la facultad la publica, se agrega.
   ============================================================ */

window.PLAN_FONO = {

  id: 'fono',
  carrera: 'Licenciatura en Fonoaudiología',
  nombreCorto: 'Fonoaudiología',
  facultad: 'Facultad de Trabajo Social · UNLP',
  anios: 5,

  /* Estas materias tienen el mismo codigo y el mismo nombre que en el plan
     de Trabajo Social: son materias compartidas entre las dos carreras. */
  compartidasConTrabajoSocial: ['223', '212 A', '215 B', '253', '244', '233'],

  /* Las cuatro materias que en el cuadro ocupan las dos columnas de
     cuatrimestre, o sea que se dictan todo el año. Conviene confirmarlo. */
  notaAnuales: 'REVISAR: 821, 841, 842 y 852 figuran cruzando los dos ' +
               'cuatrimestres del cuadro, así que las cargamos como anuales.',

  materias: [

    /* ---------------- PRIMER AÑO ---------------- */
    { cod:'811', nombre:'Ontología del lenguaje y la comunicación humana',
      anio:1, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'812', nombre:'Fundamentos de la fonoaudiología',
      anio:1, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'813', nombre:'Epistemología',
      anio:1, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'814', nombre:'Anatomofisiología fonoaudiológica',
      anio:1, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'815', nombre:'Acústica',
      anio:1, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'223', nombre:'Introducción a la psicología',
      anio:1, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'816', nombre:'Bases neuropsicológicas de la comunicación',
      anio:1, dictado:'2c', paraCursar:[], paraFinal:[] },

    { cod:'817', nombre:'Lingüística',
      anio:1, dictado:'2c', paraCursar:[], paraFinal:[] },

    { cod:'818', nombre:'Sociología',
      anio:1, dictado:'2c', paraCursar:[], paraFinal:[] },

    { cod:'212 A', nombre:'Introducción a la filosofía',
      anio:1, dictado:'2c', paraCursar:[], paraFinal:[] },

    /* ---------------- SEGUNDO AÑO ---------------- */
    { cod:'821', nombre:'Procesos lingüísticos y comunicación',
      anio:2, dictado:'anual', paraCursar:['811','812','816'], paraFinal:[] },

    { cod:'822', nombre:'Función fonatoria y comunicación',
      anio:2, dictado:'1c', paraCursar:['812','814','816'], paraFinal:[] },

    { cod:'823', nombre:'Teoría de la comunicación',
      anio:2, dictado:'1c', paraCursar:[], paraFinal:[] },

    { cod:'824', nombre:'Audiología y comunicación',
      anio:2, dictado:'1c', paraCursar:['812','814','815'], paraFinal:[] },

    { cod:'825', nombre:'Desarrollo de la función oral faríngea',
      anio:2, dictado:'1c', paraCursar:['812','814','816'], paraFinal:[] },

    { cod:'826', nombre:'Fonética y fonología',
      anio:2, dictado:'1c', paraCursar:['817'], paraFinal:[] },

    { cod:'827', nombre:'Metodología de la investigación',
      anio:2, dictado:'2c', paraCursar:['813'], paraFinal:['813'] },

    { cod:'828', nombre:'Acciones y prácticas en audiología',
      anio:2, dictado:'2c', paraCursar:['824'], paraFinal:[] },

    { cod:'829', nombre:'Acciones para la salud fonoestomatológica',
      anio:2, dictado:'2c', paraCursar:['825'], paraFinal:[] },

    { cod:'215 B', nombre:'Teorías de las culturas y antropología de las sociedades contemporáneas',
      anio:2, dictado:'2c', paraCursar:[], paraFinal:['818'] },

    /* ---------------- TERCER AÑO ---------------- */
    { cod:'512', nombre:'Salud fonatoria',
      anio:3, dictado:'1c', paraCursar:['822','823'], paraFinal:[] },

    { cod:'532', nombre:'Lenguaje infantil e intervención fonoaudiológica',
      anio:3, dictado:'1c', paraCursar:['821'], paraFinal:[] },

    { cod:'523', nombre:'Abordaje terapéutico del sistema vestibular',
      anio:3, dictado:'1c', paraCursar:['824'], paraFinal:[] },

    { cod:'253', nombre:'Salud colectiva',
      anio:3, dictado:'1c', paraCursar:['215 B'], paraFinal:[] },

    { cod:'831', nombre:'Introducción al análisis de la estructura social argentina',
      anio:3, dictado:'1c', paraCursar:['818'], paraFinal:['818'] },

    { cod:'832', nombre:'Fonoaudiología, derechos humanos y género',
      anio:3, dictado:'2c', paraCursar:['812','818'], paraFinal:[] },

    { cod:'513', nombre:'Intervención del lenguaje en población adulta',
      anio:3, dictado:'2c', paraCursar:['821'], paraFinal:[] },

    { cod:'514', nombre:'Promoción y prevención en audiología',
      anio:3, dictado:'2c', paraCursar:['828','523'], paraFinal:[] },

    { cod:'244', nombre:'Teoría y práctica de la educación',
      anio:3, dictado:'2c', paraCursar:['215 B'], paraFinal:[] },

    { cod:'233', nombre:'Psicología del desarrollo y la subjetividad',
      anio:3, dictado:'2c', paraCursar:['223'], paraFinal:['223'] },

    { cod:'833', nombre:'Taller de metodología I',
      anio:3, dictado:'2c', paraCursar:['827'], paraFinal:[] },

    /* ---------------- CUARTO AÑO ---------------- */
    { cod:'841', nombre:'Campos de intervención profesional - práctica territorial',
      anio:4, dictado:'anual',
      paraCursar:['829','512','532','513','514'],
      paraFinal: ['829','512','532','513','514'] },

    { cod:'842', nombre:'Voz y habla de la comunicación y el trabajo',
      anio:4, dictado:'anual', paraCursar:['832','512'], paraFinal:[] },

    { cod:'843', nombre:'Política social',
      anio:4, dictado:'1c', paraCursar:['831'], paraFinal:[] },

    { cod:'844', nombre:'Fonoaudiología en ámbitos educativos',
      anio:4, dictado:'1c', paraCursar:['244','832'], paraFinal:['244'] },

    { cod:'845', nombre:'Fonoaudiología en perspectivas comunitarias',
      anio:4, dictado:'1c', paraCursar:['831','832','253'], paraFinal:['831','832'] },

    { cod:'846', nombre:'Fonoaudiología en atención primaria de la salud',
      anio:4, dictado:'2c', paraCursar:['233','253'], paraFinal:['233','832'] },

    { cod:'521', nombre:'Intervención de la deglución en la población adulta',
      anio:4, dictado:'2c', paraCursar:['825'], paraFinal:[] },

    { cod:'847', nombre:'Gestión y políticas públicas',
      anio:4, dictado:'2c', paraCursar:['843'], paraFinal:[] },

    { cod:'848', nombre:'Taller de metodología II',
      anio:4, dictado:'2c', paraCursar:['833'], paraFinal:[] },

    /* ---------------- QUINTO AÑO ---------------- */
    { cod:'852', nombre:'Trabajo integrador final',
      anio:5, dictado:'anual',
      paraCursar:['827','833','848','841'], paraFinal:'todas-1-a-4' },

    { cod:'851', nombre:'Ética y deontología',
      anio:5, dictado:'1c', paraCursar:['832'], paraFinal:[] }
  ],

  requisitos: []
};
