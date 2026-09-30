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

type Canal = 'mesas' | 'novedades' | 'mis_fechas' | 'paros' | 'grupos' | 'actividades';

type Aviso = {
  clave:   string;                  /* el nombre del aviso, no el de la publicación */
  canal:   Canal;
  titulo:  string;
  cuerpo:  string;
  url:     string;
  usuario?: string;                 /* solo los de `mis_fechas` van a una persona */
  materia?: string;                 /* solo los grupos: a quién le interesa */
  /* Claves que se dan por mandadas junto con esta. «Hoy: paro» ya
     dice todo lo que decía «nuevo paro», y no tiene que sonar después. */
  tambien?: string[];
  /* Solo a quien ya recibió algo de esta publicación. Es el aviso de
     cambio: «cambió de aula» no le sirve a quien nunca supo el aula. */
  soloSiTuvo?: number;
  /* La publicación de la que habla, en los avisos de eventos. Con esto
     se sabe quién marcó «Voy» (sección 4 y `anotados`). */
  pub?: number;
};

type Suscripcion = {
  id: number; endpoint: string; p256dh: string; auth: string;
  usuario_id: string | null;
  mesas: boolean; novedades: boolean; mis_fechas: boolean;
  paros: boolean; grupos: boolean; actividades: boolean;
  materias: string[] | null;
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
  /* Los eventos avisan solos por su canal (sección 4). Si además
     alguien les marcó `avisar`, sonarían dos veces. */
  return (publicaciones || [])
    .filter(p => !CANAL_DE[p.categoria])
    .map(p => ({
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


/* ------------------------------------------------------------
   4. LOS PAROS, LOS GRUPOS DE ESTUDIO Y LAS ACTIVIDADES

   Avisan solos, sin que nadie marque nada (propuesta 3, 30/9/2026).
   Tres momentos, y ninguno más:

     nueva    en las 24 horas después de publicarse. Lo publicado a
              la noche sale a las 9, cuando el reloj vuelve a mandar.
     hoy      a la mañana del día en que empieza, con hora y lugar.
     cambio   si cambió el día, la hora o el lugar, o se suspendió.
              Solo a quien ya tenía uno de los dos anteriores.

   Los tres se pisan con cuidado para que nada suene dos veces:
   publicado hoy para hoy es un solo «Hoy: …», y publicado y corregido
   antes de que salga el primero es un solo aviso, ya corregido.

   Las `fecha` (calendario académico) no avisan por acá: son decenas y
   se cargan de a muchas. Los comunicados siguen con la marca manual.
   ------------------------------------------------------------ */
const CANAL_DE: Record<string, Canal> = {
  paro: 'paros', grupo: 'grupos', actividad: 'actividades'
};

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/* «hoy», «mañana», «el jueves» o «el 14/10», como lo diría alguien. */
function cuandoEs(fecha: string, hoy: string){
  const faltan = enDias(hoy, fecha);
  if (faltan === 0) return 'hoy';
  if (faltan === 1) return 'mañana';
  const [, m, d] = fecha.split('-').map(Number);
  if (faltan > 1 && faltan < 7) return `el ${DIAS[new Date(fecha + 'T12:00:00Z').getUTCDay()]} ${d}`;
  return `el ${d}/${m}`;
}

/* Sin tildes ni mayúsculas: «Trabajo social I» y «Trabajo Social I»
   son la misma materia, y la persona no tiene por qué escribirla igual
   que quien cargó el grupo. */
function normalizar(t: string){
  return String(t || '').normalize('NFD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

function avisosDeEventos(publicaciones: any[], hoy: string, ahora: number): Aviso[] {
  const avisos: Aviso[] = [];
  const DIA = 24 * 3600 * 1000;
  const reciente = (t: string | null) => !!t && ahora - Date.parse(t) < DIA;

  for (const p of publicaciones || []){
    const canal = CANAL_DE[p.categoria];
    if (!canal) continue;

    const desde = p.fecha_desde ? String(p.fecha_desde).slice(0, 10) : '';
    const hasta = String(p.fecha_hasta || p.fecha_desde || '').slice(0, 10);
    /* Lo que ya pasó no avisa nada, ni siquiera que se suspendió. */
    if (hasta && hasta < hoy) continue;

    const titulo = String(p.titulo || '').trim();
    const donde  = [p.hora, p.lugar].filter(Boolean).join(' · ');
    const url    = `${URL_BASE}/agenda/?id=${p.id}`;
    const base   = { canal, url, materia: p.materia || undefined, pub: p.id as number };

    const esHoy    = !p.suspendido && desde === hoy;
    const esNueva  = !p.suspendido && reciente(p.publicado_at);
    const esCambio = reciente(p.cambiado_at);
    const claveCambio = esCambio ? `pub:${p.id}:cambio:${Date.parse(p.cambiado_at)}` : '';
    const conCambio = esCambio ? [claveCambio] : [];

    const conMayuscula = (t: string) => t ? t[0].toUpperCase() + t.slice(1) : '';

    if (esHoy){
      avisos.push({ ...base,
        clave:   `pub:${p.id}:hoy:${hoy}`,
        /* «Hoy: Paro: …» se lee mal; «Hoy hay paro: …» se lee bien. */
        titulo:  /^paro:/i.test(titulo)
                   ? titulo.replace(/^paro:\s*/i, 'Hoy hay paro: ')
                   : `Hoy: ${titulo}`,
        cuerpo:  donde || 'Tocá para ver los detalles.',
        tambien: [`pub:${p.id}:nueva`, ...conCambio]
      });
    } else if (esNueva){
      const cuando = desde ? cuandoEs(desde, hoy) : '';
      avisos.push({ ...base,
        clave:   `pub:${p.id}:nueva`,
        titulo,
        cuerpo:  [conMayuscula(cuando), donde]
                   .filter(Boolean).join(' · ') || 'Tocá para ver los detalles.',
        tambien: conCambio
      });
    }

    /* Va DESPUÉS de los otros dos: a quien le toca el de arriba recibe
       la versión corregida y este ya figura como mandado. */
    if (esCambio){
      avisos.push({ ...base,
        clave:      claveCambio,
        titulo:     p.suspendido ? `Se suspendió: ${titulo}` : `Cambió: ${titulo}`,
        cuerpo:     p.suspendido
                      ? 'Ya no se hace. Tocá para ver si hay novedades.'
                      : [desde && conMayuscula(cuandoEs(desde, hoy)), donde]
                          .filter(Boolean).join(' · ') || 'Tocá para ver qué cambió.',
        soloSiTuvo: p.id
      });
    }
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

  /* `.trim()` porque pegar un secreto en el panel se lleva puesto un
     salto de línea sin que se vea, y web-push no perdona un byte de
     más. */
  const privada  = (Deno.env.get('VAPID_PRIVADA')  || '').trim();
  const publica  = (Deno.env.get('VAPID_PUBLICA')  || '').trim();
  if (!privada || !publica){
    return Response.json({ error: 'Faltan las claves VAPID en los secretos' }, { status: 500 });
  }

  /* El contacto tiene que ser una dirección (`mailto:` o `https:`).
     Un correo pelado hace que web-push rechace la corrida entera, acá
     mismo, sin mandar un solo aviso. Pasó de verdad: el 27/9 el
     secreto estaba cargado sin el `mailto:` y por eso no salía nada,
     mientras todo lo demás parecía andar bien. Se completa en vez de
     fallar: un secreto mal escrito no tiene que apagar el timbre de
     toda la facultad. */
  const comoVino = Deno.env.get('VAPID_CONTACTO') || 'labolivarconvos@gmail.com';
  const contacto = /^(mailto:|https?:)/i.test(comoVino) ? comoVino : `mailto:${comoVino}`;

  /* Si las claves no son el par que espera web-push, la corrida se cae
     acá y desde afuera se ve un 500 pelado, que no dice nada. Se
     contesta el porqué con los LARGOS y no con las claves: el largo
     alcanza para darse cuenta (la privada tiene 43 caracteres y la
     pública 87) y no cuenta nada que no se pueda contar. */
  try {
    webpush.setVapidDetails(contacto, publica, privada);
  } catch (e: any){
    return Response.json({
      error:            'Las claves VAPID de los secretos no sirven',
      dice:             String(e?.message || e),
      largo_privada:    privada.length,
      largo_publica:    publica.length,
      son_la_misma:     privada === publica,
      publica_empieza:  publica.slice(0, 8)
    }, { status: 500 });
  }

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
    .select('id,titulo,linea,cuerpo,categoria')
    .eq('publicado', true).eq('avisar', true)
    .gte('avisar_at', new Date(Date.now() - 48 * 3600 * 1000).toISOString());
  avisos.push(...avisosDeNovedades(paraNovedades || []));

  const { data: paraFinales } = await sb.from('preparaciones')
    .select('id,usuario_id,materia,mesa_fecha')
    .gte('mesa_fecha', hoy).lte('mesa_fecha', sumarDias(hoy, 7));
  avisos.push(...avisosDeFinales(paraFinales || [], hoy));

  /* Lo publicado o cambiado en el último día, y lo que empieza hoy. */
  const haceUnDia = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: paraEventos } = await sb.from('publicaciones')
    .select('id,titulo,categoria,materia,fecha_desde,fecha_hasta,hora,lugar,suspendido,publicado_at,cambiado_at')
    .eq('publicado', true)
    .in('categoria', Object.keys(CANAL_DE))
    .or(`publicado_at.gte."${haceUnDia}",cambiado_at.gte."${haceUnDia}",fecha_desde.eq.${hoy}`);
  avisos.push(...avisosDeEventos(paraEventos || [], hoy, Date.now()));

  if (!avisos.length) return Response.json({ hoy, hora, avisos: 0, enviados: 0 });

  /* ---- A quiénes ---- */
  const { data: suscripciones } = await sb.from('avisos_suscripciones')
    .select('id,endpoint,p256dh,auth,usuario_id,mesas,novedades,mis_fechas,paros,grupos,actividades,materias,fallos')
    .limit(TOPE_POR_CORRIDA);
  const cola = (suscripciones || []) as Suscripcion[];

  /* Las materias de cada quien: las que eligió en la tarjeta de avisos
     y, si tiene cuenta, las de su cursada. Solo se buscan si hay algún
     grupo para avisar. Quien no tiene ninguna recibe todos los grupos:
     no saber qué cursa no es motivo para no avisarle. */
  const materiasDe = new Map<number, Set<string>>();
  if (avisos.some(a => a.canal === 'grupos' && a.materia)){
    const cuentas = [...new Set(cola.map(s => s.usuario_id).filter(Boolean))] as string[];
    const deCursada = new Map<string, string[]>();
    for (let i = 0; i < cuentas.length; i += 200){
      const { data } = await sb.from('cursada')
        .select('usuario_id,materia').in('usuario_id', cuentas.slice(i, i + 200));
      for (const c of data || []){
        const l = deCursada.get(c.usuario_id) || [];
        l.push(c.materia);
        deCursada.set(c.usuario_id, l);
      }
    }
    for (const s of cola){
      const todas = [...(s.materias || []), ...(s.usuario_id ? deCursada.get(s.usuario_id) || [] : [])];
      materiasDe.set(s.id, new Set(todas.map(normalizar).filter(Boolean)));
    }
  }

  /* Quién marcó «Voy» en cada evento (tanda 3, 30/9/2026). A esa
     persona le llegan el aviso del día y el de cambio de ESE evento
     aunque tenga la categoría apagada o el grupo no sea de sus
     materias: dijo que va, y «cambió de aula» es justo lo que le hace
     falta saber. Solo cuentan las marcas atadas a un teléfono con los
     avisos prendidos (`suscripcion_id`); las demás son solo número. */
  const voy = new Set<string>();
  const conVoy = [...new Set(avisos.map(a => a.pub).filter(Boolean))] as number[];
  if (conVoy.length){
    const { data } = await sb.from('anotados')
      .select('publicacion_id,suscripcion_id')
      .in('publicacion_id', conVoy).not('suscripcion_id', 'is', null);
    for (const v of data || []) voy.add(`${v.suscripcion_id}|${v.publicacion_id}`);
  }

  /* Quién ya recibió algo de cada publicación con aviso de cambio. */
  const tuvo = new Set<string>();
  const conCambio = [...new Set(avisos.map(a => a.soloSiTuvo).filter(Boolean))] as number[];
  for (const id of conCambio){
    const { data } = await sb.from('avisos_enviados')
      .select('suscripcion_id,clave').like('clave', `pub:${id}:%`);
    for (const e of data || []){
      if (/^pub:\d+:(nueva|hoy:)/.test(e.clave)) tuvo.add(`${e.suscripcion_id}|${id}`);
    }
  }

  let enviados = 0, rebotes = 0, bajas = 0;

  async function atender(s: Suscripcion){
    for (const a of avisos){
      const va = !!a.pub && voy.has(`${s.id}|${a.pub}`);    /* marcó «Voy» */
      if (!s[a.canal] && !va) continue;                       /* no lo pidió */
      if (a.usuario && a.usuario !== s.usuario_id) continue;   /* no es para esta persona */
      if (a.soloSiTuvo && !va && !tuvo.has(`${s.id}|${a.soloSiTuvo}`)) continue;
      if (a.canal === 'grupos' && a.materia && !va){
        const suyas = materiasDe.get(s.id);
        if (suyas && suyas.size && !suyas.has(normalizar(a.materia))) continue;
      }

      /* Se anota ANTES de mandar. Si la clave ya estaba, este aviso
         ya salió —en esta corrida o en la de hace una hora— y acá se
         termina. Es el freno contra el timbre repetido. */
      const { error: yaEstaba } = await sb.from('avisos_enviados')
        .insert({ suscripcion_id: s.id, clave: a.clave });
      if (yaEstaba) continue;

      /* Las que este aviso ya cubre. Si alguna estaba, no importa:
         `upsert` con `ignoreDuplicates` no se queja. */
      if (a.tambien && a.tambien.length){
        await sb.from('avisos_enviados').upsert(
          a.tambien.map(clave => ({ suscripcion_id: s.id, clave })),
          { onConflict: 'suscripcion_id,clave', ignoreDuplicates: true });
      }

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
  for (let i = 0; i < cola.length; i += DE_A){
    await Promise.all(cola.slice(i, i + DE_A).map(atender));
  }

  return Response.json({
    hoy, hora,
    avisos: avisos.length, suscripciones: cola.length,
    enviados, rebotes, bajas
  });
});
