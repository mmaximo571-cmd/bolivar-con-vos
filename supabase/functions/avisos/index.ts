/* ============================================================
   QUIEN TOCA EL TIMBRE

   Corre en Supabase (Edge Functions), no en el navegador ni en
   Vercel, y es el único lugar donde vive la clave privada de los
   avisos. La despierta el reloj de la base una vez por hora
   (`cron.schedule` al final de `tabla-avisos.sql`).

   Cada vez que corre hace siempre lo mismo:

     1. arma la lista de avisos que HOY corresponden
     2. para cada teléfono suscripto, se fija cuáles de esos avisos
        pidió y todavía no recibió
     3. los manda, y anota que los mandó

   El paso 3 es el que evita el desastre: sin esa anotación, «mañana
   cierra la inscripción» sale una vez por hora durante veinticuatro
   horas. La anotación se hace ANTES de mandar, no después, porque si
   dos relojes se superponen el que llega segundo tiene que rebotar
   contra la clave primaria y no mandar nada.

   HORARIO. No manda nada entre las 21 y las 9 de Argentina. Un
   teléfono que suena a las cuatro de la mañana no vuelve a tener los
   avisos prendidos nunca más, y el aviso que importa —la mesa— se
   pierde con todos los demás.

   Cómo se sube (una vez):
     Supabase -> Edge Functions -> Deploy a new function -> pegar
   Y los secretos, en Edge Functions -> Secrets:
     VAPID_PRIVADA   la clave privada (NO va a git)
     VAPID_PUBLICA   la misma que está en config.js
     VAPID_CONTACTO  mailto:... , un correo del equipo
   ============================================================ */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const URL_BASE = 'https://labolivarconvos.ar';

/* Cuántos teléfonos se atienden en una corrida. El reloj vuelve en una
   hora, así que si alguna vez hay más, la cola se termina sola. */
const TOPE_POR_CORRIDA = 4000;
const DE_A = 20;                    /* cuántos envíos en paralelo */

type Aviso = {
  clave:   string;                  /* el nombre del aviso, no el de la publicación */
  canal:   'mesas' | 'novedades' | 'mis_fechas';
  titulo:  string;
  cuerpo:  string;
  url:     string;
  usuario?: string;                 /* solo los de `mis_fechas` van a una persona */
};

type Suscripcion = {
  id: number; endpoint: string; p256dh: string; auth: string;
  usuario_id: string | null;
  mesas: boolean; novedades: boolean; mis_fechas: boolean;
  fallos: number;
};

/* ------------------------------------------------------------
   LA HORA DE ACÁ

   El servidor piensa en UTC, que en Argentina son tres horas de más.
   Sin esto, «hoy cierra la inscripción» sale el día equivocado para
   todo lo que pase después de las nueve de la noche.
   ------------------------------------------------------------ */
function ahoraEnArgentina(){
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hour12: false
  }).formatToParts(new Date());

  const p = (cual: string) => partes.find(x => x.type === cual)?.value || '';
  return { hoy: `${p('year')}-${p('month')}-${p('day')}`, hora: parseInt(p('hour'), 10) };
}

const enDias = (desde: string, hasta: string) =>
  Math.round((Date.parse(hasta + 'T00:00:00Z') - Date.parse(desde + 'T00:00:00Z')) / 86400000);

const sumarDias = (fecha: string, n: number) =>
  new Date(Date.parse(fecha + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);


/* ------------------------------------------------------------
   1. LA ALARMA DE LAS MESAS

   Es la misma cabeza que `alarmaDeMesa()` en `app.js`, y tiene que
   seguir siéndolo: manda la columna `alarma` del panel, y el título
   solo se mira cuando nadie decidió nada todavía. Si allá cambia la
   regla, acá también.

   Diferencia con la portada: la portada muestra UNA alarma, la más
   próxima. Acá se miran todas, porque puede haber dos mesas en el
   aire y cada una tiene su propio día de cierre.
   ------------------------------------------------------------ */
function avisosDeMesas(publicaciones: any[], hoy: string): Aviso[] {
  const mesDelTitulo = (t: string) => (/ de ([a-záéíóúñ]+)\s*$/i.exec(t || '') || [])[1];
  const rolDe = (p: any) =>
      p.alarma                                          ? (p.alarma === 'ninguna' ? null : p.alarma)
    : /^inscripci[óo]n a la mesa/i.test(p.titulo || '') ? 'inscripcion'
    : /^mesa de examen/i.test(p.titulo || '')           ? 'mesa'
    : null;

  const avisos: Aviso[] = [];

  for (const p of publicaciones || []){
    if (rolDe(p) !== 'inscripcion' || !p.fecha_desde) continue;

    const periodo = (p.periodo || mesDelTitulo(p.titulo) || '').toLowerCase();
    const deQue   = periodo ? ` de ${periodo}` : '';
    const abre    = String(p.fecha_desde).slice(0, 10);
    const cierra  = String(p.fecha_hasta || p.fecha_desde).slice(0, 10);
    const url     = `${URL_BASE}/agenda/?id=${p.id}`;

    /* Un solo aviso por inscripción y por día, y gana el más urgente:
       si hoy abre y hoy cierra (ventana de un día), lo que hay que
       decir es que cierra. */
    let evento = '', titulo = '', cuerpo = '';

    if (hoy === cierra){
      evento = 'cierra-hoy';
      titulo = 'Hoy cierra la inscripción';
      cuerpo = `Es el último día para anotarte a la mesa${deQue}.`;
    } else if (hoy >= abre && enDias(hoy, cierra) === 1){
      evento = 'cierra-manana';
      titulo = 'Mañana cierra la inscripción';
      cuerpo = `Te queda hoy y mañana para anotarte a la mesa${deQue}.`;
    } else if (hoy === abre){
      evento = 'abre-hoy';
      titulo = 'Ya te podés anotar';
      cuerpo = `Abrió la inscripción a la mesa${deQue}.`;
    } else if (enDias(hoy, abre) === 1){
      evento = 'abre-manana';
      titulo = 'Mañana abre la inscripción';
      cuerpo = `Prepará lo que necesites para anotarte a la mesa${deQue}.`;
    } else continue;

    avisos.push({ clave: `mesa:${p.id}:${evento}`, canal: 'mesas', titulo, cuerpo, url });
  }
  return avisos;
}


/* ------------------------------------------------------------
   2. LAS NOVEDADES QUE ALGUIEN DECIDIÓ AVISAR

   Solo las marcadas en el panel, y solo durante las 48 horas
   siguientes a la marca (`avisar_at`). La ventana corta es a
   propósito: una novedad marcada hace tres semanas que le suena a
   quien recién prende los avisos es un aviso que no entiende.
   ------------------------------------------------------------ */
function avisosDeNovedades(publicaciones: any[]): Aviso[] {
  return (publicaciones || []).map(p => ({
    clave:  `novedad:${p.id}`,
    canal:  'novedades' as const,
    titulo: String(p.titulo || 'Hay una novedad'),
    cuerpo: String(p.linea || p.cuerpo || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    url:    `${URL_BASE}/agenda/?id=${p.id}`
  }));
}


/* ------------------------------------------------------------
   3. LAS FECHAS DE CADA QUIEN

   De las preparaciones de final: la fecha de mesa que cargó la
   persona en Estudiemos. Tres avisos y no más —una semana antes, el
   día antes, y el día— porque es la cuenta regresiva que sirve para
   organizarse sin volverse un goteo.

   Estos son los únicos avisos con nombre: van a la suscripción que
   tiene atada esa cuenta, y a ninguna otra.
   ------------------------------------------------------------ */
function avisosDeFinales(preparaciones: any[], hoy: string): Aviso[] {
  const avisos: Aviso[] = [];

  for (const p of preparaciones || []){
    if (!p.mesa_fecha || !p.usuario_id) continue;
    const faltan = enDias(hoy, String(p.mesa_fecha).slice(0, 10));
    const comoSeDice =
      faltan === 7 ? 'es en una semana' :
      faltan === 1 ? 'es mañana'        :
      faltan === 0 ? 'es hoy'           : null;
    if (!comoSeDice) continue;

    avisos.push({
      clave:   `final:${p.id}:${faltan}`,
      canal:   'mis_fechas',
      titulo:  `Tu mesa ${comoSeDice}`,
      cuerpo:  `${p.materia}. Entrá a ver cómo venís con la preparación.`,
      url:     `${URL_BASE}/estudiemos/`,
      usuario: p.usuario_id
    });
  }
  return avisos;
}


/* ============================================================
   LA CORRIDA
   ============================================================ */
Deno.serve(async (pedido) => {
  const clave_servicio = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const autorizacion   = (pedido.headers.get('Authorization') || '').replace('Bearer ', '');

  /* Con la clave anónima no alcanza: la sabe cualquiera que abra la
     app. Esto lo llama el reloj de la base, y el reloj tiene la de
     servicio. */
  if (!clave_servicio || autorizacion !== clave_servicio){
    return new Response('No', { status: 401 });
  }

  const privada  = Deno.env.get('VAPID_PRIVADA')  || '';
  const publica  = Deno.env.get('VAPID_PUBLICA')  || '';
  const contacto = Deno.env.get('VAPID_CONTACTO') || 'mailto:labolivarconvos@gmail.com';
  if (!privada || !publica){
    return Response.json({ error: 'Faltan las claves VAPID en los secretos' }, { status: 500 });
  }
  webpush.setVapidDetails(contacto, publica, privada);

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    clave_servicio,
    { auth: { persistSession: false } }
  );

  const { hoy, hora } = ahoraEnArgentina();
  const url = new URL(pedido.url);
  const aLaFuerza = url.searchParams.get('forzar') === 'si';

  if ((hora < 9 || hora >= 21) && !aLaFuerza){
    return Response.json({ hoy, hora, salteado: 'fuera de horario' });
  }

  /* ---- Qué hay para avisar hoy ---- */
  const avisos: Aviso[] = [];

  const { data: paraMesas } = await sb.from('publicaciones')
    .select('id,titulo,alarma,periodo,fecha_desde,fecha_hasta')
    .eq('publicado', true)
    .gte('fecha_desde', sumarDias(hoy, -30));
  avisos.push(...avisosDeMesas(paraMesas || [], hoy));

  const { data: paraNovedades } = await sb.from('publicaciones')
    .select('id,titulo,linea,cuerpo')
    .eq('publicado', true).eq('avisar', true)
    .gte('avisar_at', new Date(Date.now() - 48 * 3600 * 1000).toISOString());
  avisos.push(...avisosDeNovedades(paraNovedades || []));

  const { data: paraFinales } = await sb.from('preparaciones')
    .select('id,usuario_id,materia,mesa_fecha')
    .gte('mesa_fecha', hoy).lte('mesa_fecha', sumarDias(hoy, 7));
  avisos.push(...avisosDeFinales(paraFinales || [], hoy));

  if (!avisos.length) return Response.json({ hoy, hora, avisos: 0, enviados: 0 });

  /* ---- A quiénes ---- */
  const { data: suscripciones } = await sb.from('avisos_suscripciones')
    .select('id,endpoint,p256dh,auth,usuario_id,mesas,novedades,mis_fechas,fallos')
    .limit(TOPE_POR_CORRIDA);

  let enviados = 0, rebotes = 0, bajas = 0;

  async function atender(s: Suscripcion){
    for (const a of avisos){
      if (!s[a.canal]) continue;                              /* no lo pidió */
      if (a.usuario && a.usuario !== s.usuario_id) continue;   /* no es para esta persona */

      /* Se anota ANTES de mandar. Si la clave ya estaba, este aviso
         ya salió —en esta corrida o en la de hace una hora— y acá se
         termina. Es el freno contra el timbre repetido. */
      const { error: yaEstaba } = await sb.from('avisos_enviados')
        .insert({ suscripcion_id: s.id, clave: a.clave });
      if (yaEstaba) continue;

      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ titulo: a.titulo, cuerpo: a.cuerpo, url: a.url, clave: a.clave }),
          { TTL: 6 * 3600 }
        );
        enviados++;
        if (s.fallos) await sb.from('avisos_suscripciones')
          .update({ fallos: 0, visto_at: new Date().toISOString() }).eq('id', s.id);

      } catch (e: any){
        const estado = e?.statusCode || 0;

        /* 404 y 410 son el navegador diciendo «esta dirección ya no
           existe»: desinstalaron la app, limpiaron el navegador, o
           apagaron los avisos desde el sistema. No hay nada que
           reintentar, y guardar timbres muertos es lo que hace que
           estas tablas crezcan para siempre. */
        if (estado === 404 || estado === 410){
          await sb.from('avisos_suscripciones').delete().eq('id', s.id);
          bajas++;
          return;
        }

        /* Cualquier otra cosa es pasajera: se borra la anotación para
           que el reloj lo intente de nuevo en una hora, y se cuenta
           el rebote. A la tercera seguida, se da de baja. */
        await sb.from('avisos_enviados')
          .delete().eq('suscripcion_id', s.id).eq('clave', a.clave);
        rebotes++;

        if (s.fallos + 1 >= 3){
          await sb.from('avisos_suscripciones').delete().eq('id', s.id);
          bajas++;
          return;
        }
        await sb.from('avisos_suscripciones')
          .update({ fallos: s.fallos + 1 }).eq('id', s.id);
        return;
      }
    }
  }

  /* De a veinte: de a uno tarda demasiado con cuatro mil teléfonos, y
     todos juntos es la forma de que el servicio de push nos corte. */
  const cola = (suscripciones || []) as Suscripcion[];
  for (let i = 0; i < cola.length; i += DE_A){
    await Promise.all(cola.slice(i, i + DE_A).map(atender));
  }

  return Response.json({
    hoy, hora,
    avisos: avisos.length, suscripciones: cola.length,
    enviados, rebotes, bajas
  });
});
