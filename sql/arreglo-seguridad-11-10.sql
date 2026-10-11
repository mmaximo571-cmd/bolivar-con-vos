-- ============================================================
-- ARREGLO DE SEGURIDAD  ·  11/10/2026
--
-- Sale de la revisión de seguridad del 11/10: el revisor de Supabase,
-- las políticas leídas una por una y una prueba haciendo de atacante
-- (sin cuenta y con cuenta de estudiante, dentro de una transacción que
-- se deshizo). No apareció ninguna fuga. Estos son los tres detalles que
-- quedaron.
--
--   1. PERFILES. La regla «editás tu perfil sin tocarte el rol» leía la
--      misma tabla `perfiles` desde adentro de su política, y Postgres
--      la cortaba con «infinite recursion» (42P17). Resultado: nadie
--      podía editar su perfil, ni el nombre. Subirse el rol estaba
--      frenado, pero por el error y no por la regla. Si alguien
--      arreglaba la recursión a las apuradas, se abría la puerta.
--      Ahora la política solo dice «tu fila», y el rol lo cuida un
--      disparador. Una política ve solo la fila NUEVA; el disparador ve
--      la vieja y la nueva, que es lo que hace falta para comparar.
--      Es el mismo patrón que `cuidar_creado_por()`.
--
--   2. PREPARACIONES. La política de editar no tenía `with check`. Se
--      podía cambiar el `usuario_id` y pasarle una preparación a otra
--      cuenta.
--
--   3. SUCESOS. Sin cuenta se podían mandar `creado_at` e `id` a mano.
--      Con una fecha vieja la fila esquivaba el freno de 600 por minuto,
--      porque el freno cuenta solo lo del último minuto. Además ensuciaba
--      el pasado del registro. Con un `id` adelantado se le robaban los
--      números a las filas que venían y el registro empezaba a fallar.
--      Ahora solo se pueden mandar las cuatro columnas que manda
--      `anotar()` en app.js, y la fecha la pone la base.
--      El tope de 600 se deja: el pico real fue 56 por minuto (11/10).
--
--   4. CONSULTAS (Avisanos). El mismo agujero que sucesos, con su freno
--      de 20 por minuto. Ahora solo se mandan las tres columnas que
--      manda avisanos.js.
--
-- Los mismos cambios quedaron escritos en tabla-seguridad.sql,
-- tabla-organizador.sql, tabla-registro.sql, tabla-avisanos.sql y
-- arreglo-rls-rendimiento.sql.
-- Así, si se vuelve a correr alguno de esos, no se pierde el arreglo.
--
-- Cómo se corre:
--   supabase.com -> proyecto -> SQL Editor -> New query -> pegar -> Run
-- Se puede correr más de una vez sin romper nada.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Perfiles: la política sin recursión, y el rol con disparador
-- ------------------------------------------------------------

alter policy "perfiles cada quien edita el suyo, sin tocarse el rol" on public.perfiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Nadie fuera del equipo se cambia el rol. Sin sesión (supabase.com, la
-- clave de servicio) no se frena: así se sigue ascendiendo a alguien.
create or replace function public.cuidar_rol()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.rol is distinct from old.rol then
    if auth.uid() is not null then
      if not public.es_equipo() then
        raise exception 'El rol no se cambia desde la app.'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists perfiles_cuidar_rol on public.perfiles;
create trigger perfiles_cuidar_rol
  before update of rol on public.perfiles
  for each row execute function public.cuidar_rol();


-- ------------------------------------------------------------
-- 2. Preparaciones: la de editar, con with check
-- ------------------------------------------------------------

alter policy "cada uno edita la suya" on public.preparaciones
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));


-- ------------------------------------------------------------
-- 3. Sucesos: solo las cuatro columnas, y la fecha la pone la base
-- ------------------------------------------------------------

revoke insert on public.sucesos from anon, authenticated;
grant insert (tipo, pantalla, detalle, dispositivo) on public.sucesos to anon, authenticated;

-- Por si algún día vuelve el permiso ancho: el freno pisa la fecha.
create or replace function public.freno_sucesos()
returns trigger language plpgsql security definer set search_path = public as $$
declare ultimos int;
begin
  new.creado_at := now();

  select count(*) into ultimos
    from public.sucesos where creado_at > now() - interval '1 minute';
  if ultimos >= 600 then
    raise exception 'Demasiados sucesos por minuto.' using errcode = '54000';
  end if;

  if random() < 0.001 then
    delete from public.sucesos where creado_at < now() - interval '90 days';
  end if;

  return new;
end $$;

revoke all on function public.freno_sucesos() from public, anon, authenticated;


-- ------------------------------------------------------------
-- 4. Consultas: solo las tres columnas, y la fecha la pone la base
-- ------------------------------------------------------------

revoke insert on public.consultas from anon, authenticated;
grant insert (texto, carrera, pantalla) on public.consultas to anon, authenticated;

create or replace function public.freno_consultas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ultimas int;
begin
  -- La fecha la pone la base, nunca quien pregunta.
  new.creado_at := now();

  select count(*) into ultimas
    from public.consultas where creado_at > now() - interval '1 minute';
  if ultimas >= 20 then
    raise exception 'Llegaron demasiadas consultas juntas.' using errcode = '54000';
  end if;

  -- Y la misma pregunta repetida, que es lo que hace un botón trabado.
  if exists (select 1 from public.consultas
              where texto = new.texto
                and creado_at > now() - interval '10 minutes') then
    raise exception 'Esa consulta ya llegó recién.' using errcode = '54000';
  end if;

  return new;
end $$;

revoke all on function public.freno_consultas() from public, anon, authenticated;
