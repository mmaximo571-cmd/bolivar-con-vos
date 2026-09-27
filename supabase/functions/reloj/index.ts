/* ============================================================
   EL RELOJ

   Lo llama `cron.schedule` una vez por hora (ver «EL RELOJ» al final
   de `tabla-avisos.sql`) y su único trabajo es despertar a `avisos`.

   Existe por una razón sola. `avisos` pide la clave de servicio, y la
   clave de servicio NO puede quedar escrita en `cron.job`, que es una
   tabla que se puede leer: quien la lea puede escribir en toda la
   base. Entonces la base se identifica de otra forma, con un PASE de
   un solo uso que ella misma anota en `avisos_pases`, y esta función
   —que sí tiene la clave de servicio, porque Supabase la pone sola en
   los secretos de toda función— es la que se la pasa a `avisos`.

   Un pase vale cinco minutos y se borra al usarlo: si alguien lo
   repite, ya no está, y adivinarlo son 256 bits al azar.

   También se la puede llamar a mano con la clave de servicio, igual
   que a `avisos`.

   Cómo se sube (una vez):
     Supabase -> Edge Functions -> Deploy a new function -> pegar
   No necesita ningún secreto propio.
   ============================================================ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (pedido) => {
  const clave_servicio = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const base           = Deno.env.get('SUPABASE_URL') || '';
  const autorizacion   = (pedido.headers.get('Authorization') || '').replace('Bearer ', '');
  const pase           = pedido.headers.get('x-pase-del-reloj') || '';

  if (!clave_servicio || !base){
    return Response.json(
      { error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en los secretos' },
      { status: 500 });
  }

  /* Dos caminos, y la clave anónima no es ninguno de los dos: la sabe
     cualquiera que abra la app. */
  let autorizado = autorizacion === clave_servicio;

  if (!autorizado){
    if (!pase) return new Response('No', { status: 401 });

    const sb = createClient(base, clave_servicio, { auth: { persistSession: false } });

    /* Se borra al leerlo, en un solo viaje: si la borrada no devuelve
       ninguna fila, el pase no existía o ya se usó. */
    const { data: vale, error: falla } = await sb.from('avisos_pases')
      .delete()
      .eq('pase', pase)
      .gt('creado_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .select('pase');

    /* Un error de la base NO es un pase inválido, y contestar 401 acá
       mandaría a buscar el problema al reloj cuando está en la base. */
    if (falla){
      return Response.json(
        { error: 'No se pudo comprobar el pase del reloj', dice: falla.message },
        { status: 500 });
    }

    autorizado = !!(vale && vale.length);
  }

  if (!autorizado) return new Response('No', { status: 401 });

  /* `?forzar=si` es lo único que cambia una corrida: saltea el horario
     de 9 a 21. Se pasa tal cual para poder probar de noche. */
  const forzar = new URL(pedido.url).searchParams.get('forzar') === 'si' ? '?forzar=si' : '';

  const r = await fetch(`${base}/functions/v1/avisos${forzar}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clave_servicio}` },
    body:    '{}'
  });

  /* Se devuelve lo que contestó `avisos`, sin tocarlo: es lo que queda
     guardado en `net._http_response` y es lo único que se mira para
     saber si una corrida sirvió. */
  return new Response(await r.text(), {
    status:  r.status,
    headers: { 'Content-Type': r.headers.get('Content-Type') || 'text/plain' }
  });
});
