/* ============================================================
   PLAN DE ESTUDIOS · Licenciatura en Trabajo Social · FTS UNLP
   Transcripto del PDF "Plan de estudios TS".

   ESTE ES EL UNICO ARCHIVO QUE HAY QUE TOCAR SI EL PLAN CAMBIA.
   No usa Supabase: viaja con la app y funciona sin internet.

   Cada materia:
     cod          codigo tal cual figura en el plan
     nombre       nombre completo
     anio         1 a 5
     dictado      'anual' | '1c' | '2c' | 'libre'
     horas        carga horaria
     correl       codigos de las materias correlativas
     marcada      true si en el plan aparece con asterisco (*)
   ============================================================ */

window.PLAN_TS = {

  id: 'ts',
  carrera: 'Licenciatura en Trabajo Social',
  nombreCorto: 'Trabajo Social',
  facultad: 'Facultad de Trabajo Social · UNLP',
  anios: 5,

  /* Que significa el asterisco (*) del plan. Cuando lo confirmen con la
     facultad, cambien este texto y listo: se actualiza en toda la pantalla. */
  /* Esto lo lee el estudiante, así que está escrito para el estudiante:
     decimos lo que sabemos y también lo que no. */
  notaAsterisco: 'En el plan de estudios estas materias figuran con un ' +
                 'asterisco (*). Todavía no tenemos confirmado qué condición ' +
                 'indica: si te toca alguna, preguntá en Alumnado.',

  materias: [

    /* ---------------- PRIMER AÑO ---------------- */
    { cod:'211 A', nombre:'Trabajo Social I',
      anio:1, dictado:'anual', horas:240, correl:[] },

    { cod:'214', nombre:'Historia Social de América Latina y Argentina',
      anio:1, dictado:'anual', horas:128, correl:[] },

    { cod:'215 A', nombre:'Introducción a la Teoría Social',
      anio:1, dictado:'1c', horas:64, correl:[] },

    { cod:'213', nombre:'Epistemología de las Ciencias Sociales',
      anio:1, dictado:'1c', horas:64, correl:[] },

    { cod:'211 B', nombre:'Configuración de los Problemas Sociales',
      anio:1, dictado:'2c', horas:64, correl:[] },

    { cod:'212 A', nombre:'Introducción a la Filosofía',
      anio:1, dictado:'2c', horas:64, correl:[] },

    /* ---------------- SEGUNDO AÑO ---------------- */
    { cod:'221', nombre:'Trabajo Social II',
      anio:2, dictado:'anual', horas:320, correl:['211 A'] },

    { cod:'225', nombre:'Teoría Social',
      anio:2, dictado:'anual', horas:128, correl:['215 A'] },

    { cod:'222', nombre:'Investigación Social I',
      anio:2, dictado:'1c', horas:96, correl:['213'] },

    { cod:'215 B', nombre:'Teoría de las culturas y antropologías de las sociedades contemporáneas',
      anio:2, dictado:'2c', horas:96, correl:['215 A'] },

    { cod:'223', nombre:'Introducción a la Psicología',
      anio:2, dictado:'2c', horas:64, correl:[], marcada:true },

    { cod:'226', nombre:'Teoría del Estado',
      anio:2, dictado:'2c', horas:64, correl:[], marcada:true },

    { cod:'227', nombre:'Economía Política',
      anio:2, dictado:'2c', horas:64, correl:['214'], marcada:true },

    /* ---------------- TERCER AÑO ---------------- */
    { cod:'231', nombre:'Trabajo Social III',
      anio:3, dictado:'anual', horas:320, correl:['221','211 B','225'] },

    { cod:'234', nombre:'Conformación de la Estructura Social Argentina',
      anio:3, dictado:'anual', horas:128, correl:['211 B','225'] },

    { cod:'242', nombre:'Política Social',
      anio:3, dictado:'anual', horas:128, correl:['214','226'] },

    { cod:'237', nombre:'Trabajo Social y Sujetos Colectivos',
      anio:3, dictado:'1c', horas:64, correl:['214','227'], marcada:true },

    { cod:'224', nombre:'Perspectivas antropológicas para la intervención social',
      anio:3, dictado:'1c', horas:96, correl:['215 B'] },

    { cod:'232', nombre:'Investigación Social II',
      anio:3, dictado:'2c', horas:96, correl:['222'] },

    /* ---------------- CUARTO AÑO ---------------- */
    { cod:'241', nombre:'Trabajo Social IV',
      anio:4, dictado:'anual', horas:320, correl:['231','232','227','223'] },

    { cod:'243', nombre:'Trabajo Social y Análisis Institucional',
      anio:4, dictado:'anual', horas:128, correl:['221','223'] },

    { cod:'233', nombre:'Psicología del desarrollo y la Subjetividad',
      anio:4, dictado:'1c', horas:64, correl:['223'], marcada:true },

    { cod:'244', nombre:'Teoría y Práctica de la Educación',
      anio:4, dictado:'1c', horas:64, correl:['224'], marcada:true },

    { cod:'235', nombre:'Derecho de infancia, familia y cuestión penal',
      anio:4, dictado:'1c', horas:64, correl:['226'], marcada:true },

    { cod:'245', nombre:'Teoría del Derecho y Derecho Social',
      anio:4, dictado:'1c', horas:96, correl:['226'] },

    { cod:'253', nombre:'Salud Colectiva',
      anio:4, dictado:'2c', horas:64, correl:['224'], marcada:true },

    /* ---------------- QUINTO AÑO ---------------- */
    { cod:'251', nombre:'Trabajo Social V',
      anio:5, dictado:'anual', horas:320, correl:['241','242','237'] },

    { cod:'252', nombre:'Políticas Públicas: Planificación y Gestión',
      anio:5, dictado:'anual', horas:128, correl:['234','242'] },

    { cod:'212 B', nombre:'Filosofía Social',
      anio:5, dictado:'1c', horas:64, correl:['212 A'], marcada:true },

    { cod:'254', nombre:'Debate contemporáneo y Trabajo Social',
      anio:5, dictado:'1c', horas:64, correl:['241'], marcada:true },

    { cod:'255', nombre:'Trayecto optativo',
      anio:5, dictado:'libre', horas:120, correl:[] }
  ],

  /* Requisito que no es una materia con cursada, pero hay que cumplirlo */
  requisitos: [
    { cod:'IDIOMA', nombre:'Certificación de idioma' }
  ]
};
