-- ============================================================
-- BORRAR MI CUENTA
--
-- Quien se crea una cuenta tiene que poder deshacerla desde la app, sin
-- escribirle a nadie y sin esperar que alguien del equipo se acuerde.
-- Es lo mínimo, y además es lo que hace que la nota de la pantalla de
-- registro —«esto guardamos, así se borra»— no sea una promesa vacía.
--
-- POR QUÉ HACE FALTA UNA FUNCIÓN Y NO ALCANZA UN DELETE. La app entra
-- con la clave pública, y con esa clave NADIE puede tocar `auth.users`:
-- borrar usuarios es cosa de la clave secreta, que vive sólo en el
-- tablero de Supabase y nunca en el teléfono de nadie. Así que hace
-- falta una función que corra con permisos prestados.
--
-- Es el mismo patrón de llave que `respaldos`: la puerta está cerrada y
-- se entra por una función que sabe exactamente qué deja hacer. Acá lo
-- único que deja hacer es borrarte a VOS. El `auth.uid()` lo pone
-- Supabase leyendo el token de la sesión, no el que llama: no hay forma
-- de pedirle que borre a otro, porque el id de la víctima no es un
-- parámetro. No lo es a propósito.
--
-- Lo que se va con la cuenta: el perfil, los trámites guardados y las
-- preparaciones de finales. Las tres tablas apuntan a `auth.users` con
-- `on delete cascade`, así que se limpian solas. Se comprobó el 5/9 y
-- está listado abajo, al final, para poder volver a comprobarlo.
--
-- Lo que NO se va, porque no es de nadie: los `sucesos` del registro no
-- tienen columna de usuario —nunca la tuvieron— y los `respaldos` se
-- guardan por código, sin dueño. No hay nada que borrar ahí porque no
-- hay nada atado a una persona.
--
-- Cómo se corre:
--   supabase.com -> proyecto "La Bolivar con vos" -> SQL Editor
--   -> New query -> pegar todo esto -> Run
--
-- Se puede correr más de una vez sin romper nada.
-- ============================================================

create or replace function public.borrar_mi_cuenta()
returns void
language plpgsql
security definer
-- El `search_path` fijo no es adorno: sin él, alguien que pudiera crear
-- una tabla `users` en otro esquema podría hacer que esta función mire
-- la suya en vez de la de Supabase.
set search_path = public, auth, pg_temp
as $$
begin
  -- Sin sesión abierta no hay a quién borrar. Sale con un error claro
  -- en vez de no hacer nada en silencio, que es peor: la pantalla
  -- diría «listo» sin haber borrado.
  if auth.uid() is null then
    raise exception 'Hay que tener la sesión abierta para borrar la cuenta.'
      using errcode = '28000';
  end if;

  -- Y esto es todo. El resto lo hacen las tres claves foráneas.
  delete from auth.users where id = auth.uid();
end;
$$;

-- ---------- Quién puede llamarla ----------
-- Nadie, salvo alguien con la sesión abierta. `anon` no: una cuenta sin
-- sesión no tiene nada que borrar, y dejarla llamar es dejar una puerta
-- que no lleva a ningún lado pero igual se puede golpear.
revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;

-- ============================================================
-- Para comprobar que las tres tablas siguen limpiándose solas.
-- Tienen que dar las tres CASCADE. Si alguna dice NO ACTION, se rompió
-- algo y borrar la cuenta va a dejar datos sueltos:
--
--   select c.conrelid::regclass::text as tabla,
--          case c.confdeltype when 'c' then 'CASCADE' else 'OJO: ' || c.confdeltype end
--     from pg_constraint c
--    where c.contype = 'f' and c.confrelid = 'auth.users'::regclass
--      and c.conrelid::regclass::text in ('perfiles','guardados','preparaciones');
-- ============================================================
