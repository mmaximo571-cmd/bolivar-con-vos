-- ============================================================
-- LA ALARMA DE INSCRIPCIÓN, POR DATO Y NO POR TÍTULO
--
-- La alarma de la portada es lo más útil que hace la app: la ventana
-- para anotarse a una mesa dura cuatro días, nueve veces al año, y
-- perderla es esperar un mes. Aparece sola desde cinco días antes de
-- que abra hasta que cierra.
--
-- Hasta el 3 de septiembre de 2026 la app adivinaba cuáles eran esas
-- publicaciones con un regex sobre el título: `/^inscripción a la
-- mesa/`. Tres formas de romperlo sin darse cuenta:
--
--   · «Inscripcion a la mesa de septiembre»  (sin tilde) -> no aparece
--   · «Inscripción a mesa de septiembre»     (sin «la») -> no aparece
--   · «Inscripción a la mesa de septiembre 2026» -> aparecía diciendo
--     «la mesa de 2026», porque el mes lo sacaba de la última palabra
--
-- Y lo peor: falla en silencio. Una alarma que no aparece no se ve.
-- El error recién se nota cuando alguien se perdió la mesa.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

alter table public.publicaciones
  add column if not exists alarma  text,
  add column if not exists periodo text;

-- `alarma` tiene cuatro estados y cada uno quiere decir algo distinto:
--
--   null          nadie decidió todavía. La app mira el título, como
--                 antes, así que las publicaciones viejas siguen
--                 andando aunque nunca las toquen.
--   'inscripcion' es la ventana para anotarse a una mesa.
--   'mesa'        es la mesa de examen en sí, que da la fecha del
--                 «La mesa es el …».
--   'ninguna'     alguien la miró y dijo que no tiene que ver con
--                 mesas. La app respeta eso y NO mira el título.
--
-- Ese último estado es el que evita que el panel pregunte lo mismo
-- para siempre: sin él, una publicación con título parecido volvería
-- a pedir decisión cada vez que alguien la edita.
--
-- `periodo` es el nombre de la mesa, en minúscula y solo: septiembre.
-- Es lo que une la inscripción con su mesa.
alter table public.publicaciones drop constraint if exists publicaciones_alarma_valida;
alter table public.publicaciones add constraint publicaciones_alarma_valida
  check (
    alarma is null
    or alarma = 'ninguna'
    or (alarma in ('inscripcion','mesa') and periodo is not null and btrim(periodo) <> '')
  );

-- ============================================================
-- El backfill, desde los títulos que hoy están escritos parejo.
-- Solo toca las que nadie decidió (`alarma is null`), así que correr
-- esto de nuevo no pisa lo que se haya elegido en el panel.
-- ============================================================
update public.publicaciones
   set alarma  = 'inscripcion',
       periodo = lower(btrim(regexp_replace(titulo,
                 '^[Ii]nscripci[oó]n a la mesa de[[:space:]]+', '')))
 where alarma is null
   and titulo ~* '^inscripci[oó]n a la mesa de[[:space:]]+[^[:space:]]';

update public.publicaciones
   set alarma  = 'mesa',
       periodo = lower(btrim(regexp_replace(titulo,
                 '^[Mm]esa de examen de[[:space:]]+', '')))
 where alarma is null
   and titulo ~* '^mesa de examen de[[:space:]]+[^[:space:]]';

create index if not exists publicaciones_alarma_idx
  on public.publicaciones (alarma, fecha_desde);

-- Para comprobar que salió bien (tienen que dar nueve y nueve, con el
-- mismo `periodo` de a pares):
--   select alarma, periodo, fecha_desde, titulo
--     from public.publicaciones where alarma in ('inscripcion','mesa')
--    order by periodo, alarma;
--
-- Y para encontrar una inscripción que quedó sin marcar:
--   select titulo from public.publicaciones
--    where alarma is null and titulo ilike '%mesa%';
