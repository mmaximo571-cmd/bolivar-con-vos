/* ============================================================
   LEER UNA PLACA  ·  7/10/2026

   La mitad de los paros y las asambleas no llegan como texto sino
   como una placa: una imagen. `lib/leer-aviso.js` lee texto y una
   imagen no, así que esta función se la pasa a Gemini, que la lee y
   devuelve lo mismo que el lector de texto: qué es, el día, la hora,
   el lugar y el asunto, más todo el texto de la placa transcripto.

   Por qué Gemini y no Claude: la agrupación no puede pagar una API
   todos los meses, y Gemini tiene un nivel gratis sin tarjeta que
   alcanza de sobra (cientos de lecturas por día). El proyecto de
   Google donde vive la clave NO tiene facturación, y eso es lo que
   garantiza que nunca cobre: sin cupo, contesta 429 y listo. A
   cambio, en el nivel gratis Google puede usar lo que se le manda
   para mejorar sus productos: por eso solo se manda la placa, que ya
   es pública, y nada de quien la sube.

   Nunca publica nada: devuelve un borrador y `cargar/` lo pone en los
   pasos para que la persona lo revise. Si Gemini se cae, cambia las
   reglas o se acaba el cupo, se carga a mano como siempre.

   Solo la puede usar quien puede cargar (`equipo` o `comunicacion`,
   lo mismo que `puedeCargar()` de app.js): abierta, cualquiera
   gastaría el cupo del día.

   Cómo se sube:
     Supabase -> Edge Functions -> Deploy a new function -> `leer-placa`
   Y en Edge Functions -> Secrets:
     GEMINI_API_KEY  la clave de aistudio.google.com (NO va a git)
     GEMINI_MODELO   opcional: si Google retira los modelos de abajo,
                     se pone acá el nombre del nuevo sin tocar código
   ============================================================ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

/* Se prueban en orden: Google retira modelos seguido, y un nombre
   viejo da 404. Los «lite» son los de más cupo gratis. */
const MODELOS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];

/* Una placa achicada en el teléfono pesa unos 300 KB; esto es el
   techo para que nadie mande una foto de 12 MB por error. */
const TOPE_BASE64 = 4_000_000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function responder(cuerpo: unknown, estado = 200){
  return new Response(JSON.stringify(cuerpo), {
    status: estado, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' }
  });
}

/* El «hoy» de Argentina, no el del servidor: a las 22 de un martes en
   La Plata, en el centro de datos ya es miércoles, y «mañana» caería
   un día tarde. */
function hoyEnArgentina(){
  const partes = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const v = (t: string) => partes.find(p => p.type === t)?.value || '';
  return { iso: `${v('year')}-${v('month')}-${v('day')}`, dia: v('weekday') };
}

const ESQUEMA = {
  type: 'OBJECT',
  properties: {
    que:      { type: 'STRING', enum: ['paro', 'grupo', 'actividad', 'otro'] },
    fecha:    { type: 'STRING', description: 'AAAA-MM-DD, o vacío si la placa no dice el día' },
    relativa: { type: 'STRING', description: 'la palabra de la que salió la fecha si fue relativa («mañana», «este jueves»), o vacío' },
    hora:     { type: 'STRING', description: 'HH:MM en 24 horas, o vacío' },
    lugar:    { type: 'STRING' },
    asunto:   { type: 'STRING' },
    texto:    { type: 'STRING', description: 'todo el texto de la placa, transcripto tal cual' }
  },
  required: ['que', 'fecha', 'relativa', 'hora', 'lugar', 'asunto', 'texto']
};

function instrucciones(hoy: { iso: string, dia: string }){
  return `Esta imagen es una placa de una agrupación estudiantil de la Facultad de Trabajo Social de la UNLP (La Plata, Argentina). Hoy es ${hoy.dia} ${hoy.iso}.

Leé la placa y devolvé:
- que: "paro" si es un paro o medida de fuerza; "grupo" si es un grupo de estudio de una materia; "actividad" si es una asamblea, charla, taller, marcha, clase pública, jornada u otro evento; "otro" si no es ninguna de esas.
- fecha: el día del evento en formato AAAA-MM-DD. Si dice un día de la semana o «mañana», calculalo desde hoy. Si son varios días, el primero. Si no lo dice, vacío.
- relativa: si la fecha salió de una palabra relativa («mañana», «este jueves»), esa palabra; si la placa dice el número del día, vacío.
- hora: la hora de inicio en HH:MM de 24 horas («18 hs» es 18:00, «6 de la tarde» es 18:00). Si no la dice, vacío.
- lugar: dónde es, corto, como lo diría un estudiante («Aula 5», «El hall», «Plaza Moreno»). Si no lo dice, vacío.
- asunto: si es un paro, POR QUÉ es («Contra el recorte de presupuesto», «En defensa de la universidad pública»), sin la palabra «paro»; si la placa no dice por qué, quién para, tal como lo dice («Nodocente», «Docente de ADULP»), sin agregarle «Por» ni inventar un motivo; si es un grupo de estudio, solo el nombre de la materia; si es una actividad, su nombre corto («Asamblea por el boleto estudiantil»). Máximo 80 caracteres, sin emojis, sin mayúsculas sostenidas salvo siglas. Si no se puede saber, vacío.
- texto: todo el texto de la placa, transcripto.

No inventes: lo que la placa no dice va vacío.`;
}

/* Lo que vuelve de Gemini se revisa campo por campo antes de dárselo
   a la pantalla: un modelo puede devolver «18hs» en vez de «18:00», y
   un formato raro rompería el campo de hora del paso 2. */
function sanear(r: Record<string, unknown>){
  const s = (v: unknown, tope = 80) => String(v ?? '').trim().slice(0, tope);
  const que = ['paro', 'grupo', 'actividad'].includes(String(r.que)) ? String(r.que) : null;
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(s(r.fecha)) ? s(r.fecha) : null;
  const hora  = /^([01]\d|2[0-3]):[0-5]\d$/.test(s(r.hora)) ? s(r.hora) : null;
  return {
    que, fecha, hora,
    relativa: fecha ? (s(r.relativa, 30) || null) : null,
    lugar:  s(r.lugar),
    asunto: s(r.asunto),
    texto:  s(r.texto, 2000)
  };
}

Deno.serve(async (pedido) => {
  if (pedido.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (pedido.method !== 'POST') return responder({ error: 'metodo' }, 405);

  /* ¿Quién pide? */
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
                          { auth: { persistSession: false } });
  const jwt = (pedido.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await sb.auth.getUser(jwt);
  if (!user) return responder({ error: 'sin-sesion' }, 401);
  const { data: perfil } = await sb.from('perfiles').select('rol').eq('id', user.id).maybeSingle();
  if (!perfil || !['equipo', 'comunicacion'].includes(perfil.rol)) return responder({ error: 'sin-permiso' }, 403);

  const clave = (Deno.env.get('GEMINI_API_KEY') || '').trim();
  if (!clave) return responder({ error: 'sin-clave' }, 503);

  let cuerpo: { imagen?: string, tipo?: string };
  try { cuerpo = await pedido.json(); } catch { return responder({ error: 'pedido' }, 400); }
  const imagen = String(cuerpo.imagen || '');
  const tipo = String(cuerpo.tipo || 'image/jpeg');
  if (!imagen || imagen.length > TOPE_BASE64 || !/^image\/(jpeg|png|webp)$/.test(tipo)){
    return responder({ error: 'imagen' }, 400);
  }

  const elegido = (Deno.env.get('GEMINI_MODELO') || '').trim();
  const modelos = elegido ? [elegido, ...MODELOS] : MODELOS;
  const pedidoGemini = JSON.stringify({
    contents: [{ parts: [
      { inline_data: { mime_type: tipo, data: imagen } },
      { text: instrucciones(hoyEnArgentina()) }
    ] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: ESQUEMA, temperature: 0 }
  });

  for (const modelo of modelos){
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
        body: pedidoGemini });

    /* Modelo retirado: se prueba el siguiente de la lista. */
    if (r.status === 404) continue;
    /* Sin cupo por hoy. La pantalla lo dice y ofrece pegar el texto. */
    if (r.status === 429) return responder({ error: 'cupo' }, 429);
    if (!r.ok){
      console.error('gemini', modelo, r.status, (await r.text()).slice(0, 300));
      return responder({ error: 'gemini' }, 502);
    }

    const datos = await r.json();
    const texto = datos?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
    try {
      const leido = sanear(JSON.parse(texto));
      /* Sin esto, una lectura que sale bien no deja rastro, y no se
         sabe qué modelo está contestando hasta que alguno falla. */
      console.log('leída con', modelo, leido.que || 'sin clase');
      return responder({ ...leido, modelo });
    } catch {
      console.error('gemini sin JSON', modelo, texto.slice(0, 300));
      return responder({ error: 'gemini' }, 502);
    }
  }
  console.error('ningún modelo respondió', modelos.join(', '));
  return responder({ error: 'modelo' }, 502);
});
