# La Bolívar con vos

App de la Agrupación Simón Bolívar (Conducción del CEFTS) para estudiantes de la
Facultad de Trabajo Social, UNLP.

---

## Qué hace

| Pantalla | Archivo | Para qué |
|---|---|---|
| Inicio | `index.html` | Buscador grande, categorías, próximas fechas, novedades |
| Trámites | `tramites/index.html` | Guía paso a paso + preguntas frecuentes |
| Cursadas | `carrera/index.html` | Organizador de cursadas según el plan de estudios |
| Agenda | `agenda/index.html` | Fechas, comunicados y actividades. Se actualiza sola |
| Mi cuenta | `mi/index.html` | Cuenta **opcional** del estudiante, para guardar trámites |
| Panel | `panel/index.html` | Donde el equipo carga y edita todo |

**La app se usa entera sin registrarse.** La cuenta solo sirve para guardar trámites.

---

## Los archivos

```
config.js            ← dirección y clave pública de Supabase
estilos.css          ← PANEL DE CONTROL ESTETICO: colores y tipografías, todo arriba
app.js               ← funciones compartidas (cabecera, barra de abajo, fechas)
favicon.svg          ← ícono de la pestaña
index.html
tramites/index.html
carrera/index.html   ← organizador de cursadas
carrera/plan.js      ← PLAN: Licenciatura en Trabajo Social
carrera/plan-tgcr.js ← PLAN: Tecnicatura en Gestión Comunitaria del Riesgo
carrera/plan-fono.js ← PLAN: Licenciatura en Fonoaudiología
agenda/index.html
mi/index.html
panel/index.html
LEEME.md             ← este archivo
```

**Para cambiar un color de toda la app:** abrí `estilos.css` y tocá una sola línea
en el bloque `PANEL DE CONTROL ESTETICO` de arriba de todo.

---

## El organizador de cursadas

Es la única pantalla que **no usa Supabase**: el plan de estudios está escrito en
`carrera/plan.js` y viaja con la app, así que funciona sin internet y sin cuenta.
Lo que marca cada estudiante se guarda **solo en su teléfono** (`localStorage`),
no se sube a ningún lado y nadie del equipo lo ve.

**Para corregir el plan** (una correlativa, un nombre, una carga horaria) se toca
`carrera/plan.js` y nada más. Cada materia tiene:

| Campo | Qué es |
|---|---|
| `cod` | El código tal cual figura en el plan (`211 A`, `242`…) |
| `dictado` | `anual`, `1c`, `2c` o `libre` |
| `correl` | Los códigos de sus correlativas |
| `marcada` | `true` si en el plan aparece con asterisco (*) |

La regla que aplica, tal como funciona la cursada:

- **Promocionar** una materia habilita a **promocionar** la que le sigue.
- **Aprobar solo la cursada** habilita a **cursar** la que le sigue, pero no a
  promocionarla: primero hay que rendir el final.

### Los tres planes cargados

| Carrera | Archivo | Variable | Materias |
|---|---|---|---|
| Licenciatura en Trabajo Social | `carrera/plan.js` | `PLAN_TS` | 31 |
| Tecnicatura en Gestión Comunitaria del Riesgo | `carrera/plan-tgcr.js` | `PLAN_TGCR` | 21 |
| Licenciatura en Fonoaudiología | `carrera/plan-fono.js` | `PLAN_FONO` | 42 |

Los tres tienen la misma forma, salvo dos diferencias que vienen de los planes
mismos y **no** son un descuido:

- **Trabajo Social y Gestión del Riesgo** traen **una sola** columna de
  correlativas, en el campo `correl`. Ahí vale la regla general de arriba.
- **Fonoaudiología** trae **dos** columnas —«CURSADA» y «FINAL / PROMOCIÓN»— así
  que sus materias usan `paraCursar` y `paraFinal` en lugar de `correl`.
- Los PDF de Gestión del Riesgo y de Fonoaudiología **no publican carga
  horaria**, así que esas materias no tienen el campo `horas`.

Arriba de la pantalla hay tres botones para elegir carrera. **Cada carrera guarda
lo suyo por separado** en el teléfono: marcar materias en una no toca a las otras,
y el botón «Empezar de nuevo» borra solo la que estás mirando.

Quien ya venía usando la app tenía sus materias de Trabajo Social guardadas en el
formato viejo. No se pierde nada: la primera vez que abre la pantalla nueva, eso
pasa solo a Trabajo Social.

Cuando una carrera no tiene algo, la sección desaparece en vez de quedar vacía:
Gestión del Riesgo no muestra el filtro «Anuales» porque no tiene materias
anuales, y ni ella ni Fonoaudiología muestran «Otros requisitos» ni la nota del
asterisco, porque son cosas del plan de Trabajo Social.

---

## Los dos candados de Supabase

Esto ya está resuelto, pero conviene entenderlo si algún día algo falla con un
error `42501 permission denied`:

- **GRANT** decide si un rol puede tocar una tabla.
- **RLS** decide qué filas puede ver o modificar.

Hay que abrir los dos. Si solo se escriben las políticas RLS, no funciona nada.

---

## Cómo funcionan los permisos

Acá hay una diferencia importante con la app del buffet.

En el buffet, "tener cuenta" = "ser del centro de estudiantes". Acá **no**:
cualquier estudiante puede crearse una cuenta. Por eso los permisos **no** se basan
en estar logueado, sino en la tabla `perfiles`, que tiene una columna `rol`:

- `estudiante` — es el rol que se asigna **solo** al registrarse. Puede leer lo
  publicado y guardar sus propios trámites. Nada más.
- `equipo` — se asigna **a mano** desde Supabase. Es el único que puede crear,
  editar y borrar contenido.

Está probado: una cuenta de estudiante que intenta editar o borrar un trámite
afecta **0 filas**, y si intenta cambiarse el rol a `equipo` recibe un error.

---

## Dar de alta a alguien del equipo

1. Entrá a **supabase.com** → proyecto **La Bolivar con vos**.
2. Menú de la izquierda → **Authentication** → **Users** → botón **Add user** →
   **Create new user**.
3. Escribí el correo y una contraseña. **Marcá la casilla `Auto Confirm User`.**
4. Menú de la izquierda → **SQL Editor** → **New query**, pegá esto cambiando el
   correo, y apretá **Run**:

```sql
update public.perfiles set rol = 'equipo'
where id = (select id from auth.users where email = 'elcorreo@ejemplo.com');
```

5. Esa persona ya puede entrar a `/panel/`.

**Para sacarle el permiso a alguien:** el mismo SQL pero con `rol = 'estudiante'`.

---

## Las tablas

| Tabla | Qué guarda |
|---|---|
| `perfiles` | Quién es cada usuario y su rol (`estudiante` / `equipo`) |
| `categorias` | Los cuadraditos de la pantalla de inicio |
| `tramites` | Cada trámite, con sus pasos en la columna `pasos` |
| `faq` | Preguntas frecuentes |
| `publicaciones` | Agenda y novedades |
| `guardados` | Qué trámite guardó cada estudiante (privado) |

---

## Avisos

- **El proyecto gratuito de Supabase se pausa** tras varios días sin actividad.
  Se reactiva desde el panel con **Restore project** y no se pierde nada.
- **El contenido cargado es de ejemplo.** Todo lo que dice `REVISAR` hay que
  reemplazarlo por información verificada con la facultad.
