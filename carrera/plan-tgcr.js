/* ============================================================
   PLAN DE ESTUDIOS · Tecnicatura en Gestión Comunitaria del Riesgo
   FTS UNLP. Transcripto del PDF "plan-TGCR-color-2".

   ESTE ES EL UNICO ARCHIVO QUE HAY QUE TOCAR SI EL PLAN CAMBIA.

   Cada materia:
     cod       codigo tal cual figura en el plan
     nombre    nombre completo
     anio      1 a 3
     dictado   '1c' | '2c'
     correl    codigos de las materias correlativas
     trayecto  TFGR | TFIS | TFEP  (ver la lista de abajo)

   OJO: el PDF de esta carrera NO trae carga horaria. Por eso ninguna
   materia tiene el campo "horas". Si la facultad la publica, se agrega.
   ============================================================ */

window.PLAN_TGCR = {

  id: 'tgcr',
  carrera: 'Tecnicatura en Gestión Comunitaria del Riesgo',
  nombreCorto: 'Gestión del Riesgo',
  facultad: 'Facultad de Trabajo Social · UNLP',
  anios: 3,

  /* Los tres trayectos formativos que ordenan la tecnicatura */
  trayectos: {
    TFGR: 'Trayecto Formativo 1: Gestión del Riesgo',
    TFIS: 'Trayecto Formativo 2: Intervención Social',
    TFEP: 'Trayecto Formativo 3: Educación Popular'
  },

  materias: [

    /* ---------------- PRIMER AÑO ---------------- */
    { cod:'711', nombre:'Estado, territorio y problemática social',
      anio:1, dictado:'1c', correl:[], trayecto:'TFIS' },

    { cod:'712', nombre:'Gestión del riesgo y matrices del desarrollo',
      anio:1, dictado:'1c', correl:[], trayecto:'TFGR' },

    { cod:'713', nombre:'Riesgo, conflictos territoriales y cambio climático',
      anio:1, dictado:'1c', correl:[], trayecto:'TFGR' },

    { cod:'714', nombre:'Dinámicas naturales y eventos extremos en Argentina',
      anio:1, dictado:'1c', correl:[], trayecto:'TFGR' },

    { cod:'715', nombre:'DDHH y territorio',
      anio:1, dictado:'2c', correl:[], trayecto:'TFIS' },

    { cod:'716', nombre:'Planificación y gestión socio-estatal',
      anio:1, dictado:'2c', correl:[], trayecto:'TFIS' },

    { cod:'717', nombre:'Educación Popular y organización comunitaria',
      anio:1, dictado:'2c', correl:[], trayecto:'TFEP' },

    /* ---------------- SEGUNDO AÑO ---------------- */
    { cod:'721', nombre:'Intervención Social I',
      anio:2, dictado:'1c', correl:['711'], trayecto:'TFIS' },

    { cod:'722', nombre:'Gestión del riesgo I',
      anio:2, dictado:'1c', correl:['712'], trayecto:'TFGR' },

    { cod:'723', nombre:'Salud y epidemiología sociocultural',
      anio:2, dictado:'1c', correl:['716'], trayecto:'TFIS' },

    { cod:'724', nombre:'Territorio y estrategias de comunicación',
      anio:2, dictado:'1c', correl:[], trayecto:'TFEP' },

    { cod:'725', nombre:'Gestión del riesgo II',
      anio:2, dictado:'2c', correl:['722'], trayecto:'TFGR' },

    { cod:'726', nombre:'Metodología de la investigación y producción del conocimiento',
      anio:2, dictado:'2c', correl:[], trayecto:'TFIS' },

    { cod:'727', nombre:'Producción de estrategias de comunicación y educación',
      anio:2, dictado:'2c', correl:['724'], trayecto:'TFEP' },

    /* ---------------- TERCER AÑO ---------------- */
    { cod:'731', nombre:'Intervención social II',
      anio:3, dictado:'1c', correl:['721'], trayecto:'TFIS' },

    { cod:'732', nombre:'Seguridad humana y procesos comunitarios',
      anio:3, dictado:'1c', correl:['722'], trayecto:'TFGR' },

    { cod:'733', nombre:'Normativas para la seguridad humana',
      anio:3, dictado:'1c', correl:[], trayecto:'TFGR' },

    { cod:'734', nombre:'Trabajo social en gestión del riesgo',
      anio:3, dictado:'1c', correl:['725'], trayecto:'TFIS' },

    { cod:'735', nombre:'Género e intervención profesional',
      anio:3, dictado:'2c', correl:['711'], trayecto:'TFEP' },

    { cod:'736', nombre:'Gestión sociocultural y procesos colectivos',
      anio:3, dictado:'2c', correl:[], trayecto:'TFEP' },

    { cod:'737', nombre:'Abordaje psicosocial en situaciones complejas',
      anio:3, dictado:'2c', correl:[], trayecto:'TFEP' }
  ],

  requisitos: []
};
