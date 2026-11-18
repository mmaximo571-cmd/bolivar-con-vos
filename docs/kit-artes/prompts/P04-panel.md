# Sesión 4 · El panel del equipo

El panel va antes que las pantallas públicas por una razón práctica:
sin panel, el contenido se carga a mano en el tablero de Supabase y las
pantallas se prueban con datos de mentira. Con panel, la agrupación
empieza a cargar contenido real mientras se arma lo demás.

## Antes

La primera cuenta del equipo creada y con rol `equipo` (sesión 3).

## El prompt

```
TAREA: Sesión 4. panel/index.html: el equipo entra con su cuenta y
carga, edita, despublica y borra publicaciones, trámites, preguntas
frecuentes, categorías y el «Quiénes somos».

LEÉ PRIMERO:
- docs/kit/02-datos-y-permisos.md, «Tener cuenta no es ser del equipo»
- Los sql/tabla-*.sql de este repositorio (para las columnas reales)
- docs/kit/prompts/plantilla-pantalla.md

MIRÁ EN LA REFERENCIA, por tramos. panel/index.html pesa 198 KB:
NUNCA ENTERO. Con grep -n, solo:
- pintarCabeza, aviso, htmlIndice y abrirIndice (la navegación del
  panel por solapas)
- vistaAgenda y formularioPublicacion
- vistaTramites, formularioTramite, pintarPasos y leerPasos (los pasos
  como lista editable)
- vistaFaq y formularioFaq

HACÉ:
1. El panel usa lib/supabase.js (necesita sesión que se renueve).
2. Si no hay sesión: formulario de entrada. Si hay sesión pero el rol
   no es equipo: «Esta cuenta no es del equipo» y nada más. Nunca
   mostrar los formularios a quien no es del equipo, aunque igual la
   base lo frenaría.
3. Una solapa por tabla. Cada una: lista con lo publicado y lo
   despublicado (marcado distinto), botón nuevo, editar, despublicar,
   borrar con confirmación.
4. Los errores de la base se muestran tal cual (acá sirve el mensaje
   técnico: lo lee el equipo).
5. Un campo vacío que la pantalla pública no debe mostrar (Cuándo,
   Dónde de un trámite) se guarda null, no ''.

NO:
- No traigas solapas de la referencia que no tengan tabla acá.
- No agregues subida de archivos todavía (las imágenes, por enlace).

TERMINADO CUANDO: con la cuenta del equipo se crea, edita, despublica
y borra en las cinco solapas; con una cuenta de estudiante no se ve
ningún formulario; y probado a 375px (el equipo carga desde el
teléfono).
```

## Después

Darle el panel a la agrupación para que empiece a cargar: los diez
trámites, las diez preguntas y las fechas del cuatrimestre. Lo van a
necesitar las sesiones 5 a 7.
