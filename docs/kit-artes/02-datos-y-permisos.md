# Los datos y los permisos (Supabase)

---

## Lo que hay que entender antes de escribir una tabla

### Los dos candados, y el tercero que no se ve

- **GRANT** decide si un rol (`anon`, `authenticated`) puede tocar una
  tabla.
- **RLS** decide qué filas puede ver o modificar.

**Hay que abrir los dos.** Si solo se escriben las políticas RLS no
funciona nada y el error es `42501 permission denied`, que confunde
porque las políticas están bien.

**El tercero:** RLS filtra fila por fila, así que no mira `TRUNCATE`
(vacía la tabla de un saque). Supabase lo concede a todo el mundo por
defecto. Se revoca el primer día, junto con `TRIGGER` y `REFERENCES`.

### Tener cuenta no es ser del equipo

Cualquier estudiante puede crearse una cuenta. Por eso los permisos **no**
se basan en «está logueado» sino en la tabla `perfiles`, columna `rol`:

| Rol | Cómo se obtiene | Qué puede |
|---|---|---|
| `estudiante` | Solo, al registrarse (un disparador) | Leer lo publicado y guardar lo suyo |
| `equipo` | A mano, desde Supabase | Crear, editar y borrar contenido |
| `comunicacion` | A mano | Moderar el buzón y cargar novedades, nada más |

Probado en la Bolívar: una cuenta de estudiante que intenta editar
afecta 0 filas, y si intenta cambiarse el rol recibe un error.

**El rol se cuida con un disparador, no con una política que lea
`perfiles`.** La política que leía `perfiles` desde adentro de
`perfiles` daba «infinite recursion» y no dejaba editar nada.

### Lo que RLS tampoco hace: frenar el caudal

Una política dice quién puede escribir, no cuántas veces por minuto.
**Toda puerta que escribe sin cuenta** (el registro, las consultas
anónimas, el buzón) lleva un disparador que cuenta lo último y frena.
La base gratis tiene 500 MB, y llenarla no rompe esa función: rompe la
app entera.

### Funciones `security definer`

Cuando una función tiene que leer más de lo que puede quien la llama
(un resumen para el panel, el patrón de «llave» de los respaldos), va
`security definer` **y** `set search_path = public` (o `''`), y se le
revoca la ejecución a `public` y `anon`. Sin `search_path` fijo, quien
la llama puede hacerla trabajar sobre una tabla suya.

### No se optimiza la base

En la Bolívar se decidió no proponer índices ni optimizar consultas: con
estos volúmenes la base no frena nada. El trabajo de rendimiento está del
lado del navegador (peso del JS, fuentes, service worker).

---

## La primera migración: perfiles, roles y seguridad

Va en `sql/tabla-perfiles.sql` y `sql/tabla-seguridad.sql`. Lo que sigue
es la plantilla; Claude la escribe completa y la **ensaya antes de
dejarla puesta** (ver «Cómo se ensaya un SQL», abajo).

```sql
-- PERFILES: uno por cuenta, con su rol.
create table if not exists public.perfiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  rol       text not null default 'estudiante'
            check (rol in ('estudiante', 'equipo', 'comunicacion')),
  creado_at timestamptz not null default now()
);
alter table public.perfiles enable row level security;

-- ¿Quien llama es del equipo? security definer para que las políticas
-- de otras tablas puedan preguntarlo sin chocar con RLS de perfiles.
create or replace function public.es_equipo()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles
                 where id = (select auth.uid()) and rol = 'equipo');
$$;
revoke all on function public.es_equipo() from public, anon;
grant execute on function public.es_equipo() to authenticated;

-- Cada cuenta nueva nace estudiante. Nadie la crea a mano.
create or replace function public.al_crear_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, rol) values (new.id, 'estudiante')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.al_crear_usuario();

-- Permisos de perfiles: cada quien ve el suyo; el equipo ve todos.
grant select, update on public.perfiles to authenticated;
create policy "perfiles cada quien ve el suyo" on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()) or public.es_equipo());
create policy "perfiles cada quien edita el suyo" on public.perfiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- El rol no se cambia desde la app (desde supabase.com sí).
-- Copiar `cuidar_rol()` y su disparador de sql/tabla-seguridad.sql
-- de la Bolívar.

-- El candado que RLS no mira.
revoke truncate, trigger, references on all tables in schema public
  from anon, authenticated;
```

## La plantilla de una tabla de contenido

Toda tabla que carga el equipo y lee todo el mundo sigue el mismo molde.
Tiene `publicado` para poder despublicar sin borrar:

```sql
create table if not exists public.EJEMPLO (
  id         bigint generated by default as identity primary key,
  titulo     text not null,
  -- … columnas propias …
  orden      int  not null default 0,
  publicado  boolean not null default true,
  creado_at  timestamptz not null default now()
);
alter table public.EJEMPLO enable row level security;

grant select on public.EJEMPLO to anon, authenticated;
grant insert, update, delete on public.EJEMPLO to authenticated;
revoke insert, update, delete on public.EJEMPLO from anon;

create policy "EJEMPLO se lee lo publicado" on public.EJEMPLO
  for select to anon, authenticated using (publicado);
create policy "EJEMPLO el equipo ve todo" on public.EJEMPLO
  for select to authenticated using (public.es_equipo());
create policy "EJEMPLO el equipo escribe" on public.EJEMPLO
  for all to authenticated
  using (public.es_equipo()) with check (public.es_equipo());
```

Cuando una columna solo admite ciertos valores, va un `check`. Y si la
misma lista vive también en el JavaScript, **el archivo SQL y el JS se
nombran mutuamente en un comentario**: si se agrega un valor en uno y no
en el otro, la base rechaza el guardado y el panel no dice por qué.

Las tablas privadas de cada estudiante (lo que guardó, su cursada) usan
políticas por usuario, **no por rol**: ni el equipo ve lo de otra
persona.

```sql
create policy "GUARDADOS cada quien lo suyo" on public.GUARDADOS
  for all to authenticated
  using (usuario = (select auth.uid())) with check (usuario = (select auth.uid()));
```

---

## Las tablas de la Bolívar, y cuáles sirven en Artes

Las primeras tablas de la Bolívar se crearon a mano en el tablero y no
tienen archivo en `sql/`. **En el proyecto nuevo, todas tienen archivo
desde el principio**: es lo que permite rehacer la base si hace falta y
lo que el grafo de código puede leer.

| Tabla | Qué guarda | Archivo de referencia | En Artes |
|---|---|---|---|
| `perfiles` | Rol de cada cuenta | `tabla-seguridad.sql` | Sí, día uno |
| `categorias` | Los accesos del inicio | (sin archivo, igual que `tramites`) | Sí |
| `tramites` | Cada trámite, con los pasos en una columna `pasos` | (se creó en el tablero; no hay archivo, se escribe de cero) | Sí |
| `faq` | Preguntas frecuentes | (sin archivo) | Sí |
| `publicaciones` | Fechas, eventos y novedades. `tipo`: `novedad`, `evento`, `fecha` | `tabla-publicaciones.sql` | Sí, es el corazón |
| `materiales` | Material de estudio por materia | `tabla-materiales.sql` | Si hay grupos de estudio |
| `guardados` | Qué trámite guardó cada estudiante | (sin archivo) | Si hay cuentas |
| `sucesos` | El registro (visitas, búsquedas, errores, hitos) | `tabla-registro.sql` | Sí, con el freno |
| `pagina_quienes` | El texto del «Quiénes somos», editable | `tabla-quienes.sql` | Sí |
| `programas` / `preparaciones` | Programa de cada materia y el plan de final de cada estudiante | `tabla-organizador.sql` | Más adelante |
| `catedras` | Contactos de las cátedras | `tabla-catedras.sql` | Si la facultad los publica |
| `buzon_*` | El buzón «Decilo» | `tabla-buzon.sql` | Si hay quien conteste |
| `feriazo` | Emprendimientos de la comunidad | `tabla-feriazo.sql` | **Muy probable en Artes** (ver `04-pantallas.md`) |
| `avisos_suscripciones` | Los avisos al celular | `tabla-avisos.sql` | Última fase |

`publicaciones` lleva en la Bolívar una columna `linea` (`frente`,
`gremial`, `info`, `saberes`) que es la línea editorial de la
agrupación. **Esas cuatro palabras son de la Bolívar**: la agrupación
nueva define las suyas o no usa la columna.

---

## Lo que no se hace con SQL: dos interruptores del tablero

En supabase.com → **Authentication** → **Sign In / Providers** →
**Email**:

1. **Prenderlo.** Mientras esté apagado no entra nadie, ni el equipo.
2. **«Confirm email»: recomendado apagado.** El correo gratis de
   Supabase tiene un tope de unos pocos por hora: en un día de
   inscripción, veinte personas se quedan afuera. La cuenta no da acceso
   a nada sensible y el rol arranca en `estudiante`, así que una casilla
   falsa no cuesta nada.

La pantalla de perfil tiene que andar con las dos formas: si está
prendido, decir «te mandamos un correo a tal dirección»; si no, entrar
derecho.

## Dar de alta a alguien del equipo

1. Authentication → Users → **Add user** → **Create new user**, con
   **Auto Confirm User** marcado.
2. SQL Editor:

```sql
update public.perfiles set rol = 'equipo'
where id = (select id from auth.users where email = 'elcorreo@ejemplo.com');
```

Para sacarlo, lo mismo con `'estudiante'`.

---

## Cómo se ensaya un SQL sin dejarlo puesto

Con el conector de Supabase (o en el SQL Editor):

1. Se manda envuelto en `begin; … rollback;`, con un bloque
   `do $$ … $$` adentro que haga `raise exception` si algo no cumple
   (por ejemplo: que una cuenta de estudiante no pueda escribir).
2. Después, un `select` que confirme que no quedó nada.
3. Recién ahí se corre de verdad.

**El orden importa cuando una pantalla depende de una columna nueva:**
primero el SQL, después el código. En la Bolívar el panel empezó a
mandar una columna que todavía no existía y durante ese rato no se pudo
guardar **ninguna** publicación.

## Lo que el conector de Supabase no puede

Authentication (los interruptores de arriba, SMTP, la dirección del
sitio) y los secretos de Edge Functions. Eso lo hace una persona en el
tablero; el prompt de la sesión lo tiene que decir con pasos.

## Lo que nunca va en un archivo

La clave secreta (`sb_secret_…`) ni la clave privada de los avisos. La
**publicable** (`sb_publishable_…`) sí va, en `config.js`: es pública a
propósito y sin ella la app no se conecta.
