-- ============================================================
-- LA COPIA DE RESPALDO DE «MI AÑO», SIN CUENTA
--
-- Todo Mi año vive en el teléfono. En iPhone, si alguien no abre la
-- app por unos días, el navegador puede borrar ese guardado solo. O
-- sea: se puede perder el año entero de progreso. Nadie vuelve a una
-- app que le borró lo que cargó.
--
-- Esto lo arregla sin pedir mail ni nombre. La app genera un código y
-- ese código ES la única llave. No hay usuario, no hay contraseña, y
-- no hay forma de saber de quién es cada respaldo.
--
-- Lo que se guarda son estados de materias, notas y fechas. Nada que
-- identifique a nadie.
--
-- IMPORTANTE: la tabla NO se toca directo desde la app. Si tuviera una
-- política de lectura abierta, cualquiera podría pedir la lista entera
-- y bajarse todos los respaldos. Se entra sólo por las tres funciones
-- de abajo, que exigen el código.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

create table if not exists public.respaldos (
  codigo         text primary key,
  datos          jsonb not null,
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

alter table public.respaldos enable row level security;
-- Sin políticas: nadie llega por la puerta de adelante. A propósito.

revoke all on public.respaldos from anon, authenticated;

-- Alfabeto sin caracteres que se confunden al copiar a mano: sin 0/O,
-- sin 1/I/L. Quedan 31, y el código tiene 12: son 31^12 combinaciones,
-- o sea que adivinar uno no es una opción.
--
-- El azar tiene que ser fuerte. `random()` no lo es: es previsible, y
-- las sesiones de Postgres se reusan entre visitantes, así que quien
-- pide muchos códigos podría llegar a adivinar el de otra persona. Y
-- con el código de alguien se le lee el año entero. `gen_random_uuid()`
-- usa el azar del sistema operativo.
create or replace function public.codigo_nuevo()
returns text language plpgsql
set search_path = public as $$
declare
  alfabeto constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  crudo    bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  c text := '';
  i int;
begin
  for i in 0..11 loop
    c := c || substr(alfabeto, 1 + (get_byte(crudo, i) % 31), 1);
  end loop;
  -- En grupos de cuatro: se lee y se dicta mejor.
  return substr(c,1,4) || '-' || substr(c,5,4) || '-' || substr(c,9,4);
end $$;

-- Crea un respaldo y devuelve el código. Reintenta si sale repetido.
create or replace function public.crear_respaldo(p_datos jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  c text;
  intentos int := 0;
  recientes int;
begin
  -- Tres frenos, porque esta función la puede llamar cualquiera sin
  -- cuenta: que sea un objeto, que no pese más de 100 KB, y que no
  -- entren más de diez por minuto. Sin esto, alguien manda un JSON
  -- enorme en un bucle y llena la base; y si la base se llena no se
  -- cae el respaldo, se cae la app entera.
  if jsonb_typeof(p_datos) <> 'object' then
    raise exception 'El respaldo tiene que ser un objeto.' using errcode = '22023';
  end if;
  if pg_column_size(p_datos) > 100000 then
    raise exception 'El respaldo es demasiado grande.' using errcode = '54000';
  end if;
  select count(*) into recientes
    from public.respaldos where creado_at > now() - interval '1 minute';
  if recientes >= 10 then
    raise exception 'Se están creando demasiados respaldos juntos.' using errcode = '54000';
  end if;

  loop
    c := public.codigo_nuevo();
    begin
      insert into public.respaldos (codigo, datos) values (c, p_datos);
      return c;
    exception when unique_violation then
      intentos := intentos + 1;
      if intentos > 5 then raise exception 'No se pudo generar un código'; end if;
    end;
  end loop;
end $$;

-- Pisa el respaldo de ese código con lo que hay ahora en el teléfono.
-- Devuelve false si el código no existe, para que la app lo pueda decir
-- en vez de dejar a alguien creyendo que tiene copia.
create or replace function public.guardar_respaldo(p_codigo text, p_datos jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  tocadas int;
begin
  -- El mismo tope que al crear: el código es la llave de quien lo
  -- tenga, y sin tope quien conoce uno puede engordarlo hasta llenar
  -- la base.
  if jsonb_typeof(p_datos) <> 'object' then
    raise exception 'El respaldo tiene que ser un objeto.' using errcode = '22023';
  end if;
  if pg_column_size(p_datos) > 100000 then
    raise exception 'El respaldo es demasiado grande.' using errcode = '54000';
  end if;

  update public.respaldos
     set datos = p_datos, actualizado_at = now()
   where codigo = upper(trim(p_codigo));
  get diagnostics tocadas = row_count;
  return tocadas > 0;
end $$;

-- Devuelve el año guardado con ese código, o null si no existe.
create or replace function public.traer_respaldo(p_codigo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  d jsonb;
begin
  select datos into d from public.respaldos
   where codigo = upper(trim(p_codigo));
  return d;
end $$;

-- El generador de códigos no se llama desde afuera: sólo lo usa
-- crear_respaldo. Si fuera público, se podría usar para tantear.
revoke all on function public.codigo_nuevo() from public, anon, authenticated;
grant execute on function public.crear_respaldo(jsonb)          to anon, authenticated;
grant execute on function public.guardar_respaldo(text, jsonb)  to anon, authenticated;
grant execute on function public.traer_respaldo(text)           to anon, authenticated;
