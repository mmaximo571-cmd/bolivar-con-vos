/* ============================================================
   CONFIGURACION · La Bolivar con vos
   Estos datos son publicos: pueden estar a la vista sin riesgo.
   La clave secreta (sb_secret_...) NUNCA va aca.
   ============================================================ */
window.BOLIVAR_CONFIG = {
  url:     "https://kcgewgelfgyndbszfdep.supabase.co",
  anonKey: "sb_publishable_MRysI6z1UU6FX9IB-_ni9A_Poj3L11B",

  /* La mitad publica de la llave de los avisos al celular. Va al aire
     a proposito: es la que el navegador necesita para armar la
     suscripcion, y sin la otra mitad no sirve para mandar nada.
     La otra mitad (la privada) vive en los secretos de Supabase, y es
     lo unico con lo que se puede tocar el timbre de un telefono. */
  avisosClavePublica: "BCznNWlNVfrVv14HU6cmt7dXblfgnroRR9esOb2NpUd7hKcfWpFfREXRZ0VIYZOm-iVSDD8p8POEL3PEu_9xykk"
};
