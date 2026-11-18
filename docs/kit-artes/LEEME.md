# Kit para armar la app de una agrupación de Artes

Esto sirve para levantar, en un proyecto nuevo, una app como La Bolívar
con vos para una agrupación de una facultad de Artes. No es una copia de
la app: es el **cómo se armó**, ordenado para repetirlo sin repetir los
errores.

La Bolívar tardó unas diez semanas en llegar a lo que es. Más de la mitad
de ese tiempo se fue en cosas que se aprendieron sobre la marcha (el
service worker que servía CSS viejo, el cliente de datos de 212 KB, los
permisos de Supabase a medio abrir, un `estilos.css` de 162 KB que hubo
que partir). Este kit las pone al principio.

---

## Qué hay acá

| Archivo | Para qué | Quién lo usa |
|---|---|---|
| `00-ficha-del-proyecto.md` | Los datos de la agrupación nueva. **Se llena primero** y el resto lo lee | La agrupación |
| `01-arquitectura.md` | Cómo está hecha la app por dentro y por qué así | Claude Code, y quien programe |
| `02-datos-y-permisos.md` | Supabase: tablas, roles, los candados | Claude Code |
| `03-diseno.md` | Cómo sacar la estética de la agrupación y las reglas que no se discuten | Claude Code y las IA de diseño |
| `04-pantallas.md` | Qué pantallas hay, cuáles sirven en Artes, cuáles no y cuáles son nuevas | La agrupación decide; Claude arma |
| `05-plan-de-sesiones.md` | El orden de trabajo, sesión por sesión, con qué cuenta como terminado | Quien dirige el proyecto |
| `plantillas/` | `CLAUDE.md` y `BITACORA.md` para el repositorio nuevo | Se copian en la sesión 0 |
| `prompts/` | Un prompt por sesión de código, más los de diseño y contenido | Se pegan tal cual |

---

## Cómo se usa

1. **La agrupación llena `00-ficha-del-proyecto.md`.** Sin eso no se
   empieza: la mitad de los prompts tienen huecos que salen de ahí. Lo
   que no se sepa queda escrito como `FALTA:` y no se inventa.
2. **Se crea el repositorio nuevo** (GitHub, vacío) y el proyecto de
   Supabase. Los pasos están en `prompts/00-arranque.md`.
3. **Se copia esta carpeta entera** adentro del repositorio nuevo, en
   `docs/kit/`. Así cada sesión de Claude la tiene a mano sin pegarla.
4. **Se trabaja una sesión por prompt**, en el orden de
   `05-plan-de-sesiones.md`. Cada prompt dice qué leer, qué no leer, qué
   hacer y cuándo está terminado.
5. Al terminar cada sesión se anota una línea en `BITACORA.md` del
   proyecto nuevo. Eso es lo que permite que la sesión siguiente arranque
   sin releer todo.

---

## El repositorio de referencia

Los prompts nombran archivos de La Bolívar
(`mmaximo571-cmd/bolivar-con-vos`) para que Claude mire **cómo** se
resolvió algo antes de escribirlo de nuevo. La regla es la misma en
todos:

- **Se lee el tramo, no el archivo.** `app.js` tiene 2.300 líneas y el
  panel 198 KB. Cada prompt dice qué función o qué sección mirar.
- **Se toma la idea y la estructura, no el contenido.** Nada de Trabajo
  Social, de la UNLP o de la Bolívar puede terminar en la app nueva: ni
  textos, ni nombres de materias, ni colores, ni el logo.
- **El código de infraestructura sí se puede traer casi entero**: el
  cliente chico de datos (`lib/datos.js`), el esqueleto del service
  worker, las utilidades de fechas y de escape. Ahí se adapta el nombre
  de las llaves y nada más. Escribirlo de nuevo es pagar dos veces por
  lo mismo y volver a cometer los errores que ya se arreglaron.

En una sesión de Claude Code en la nube, el repositorio de referencia se
suma a la sesión en modo lectura. En una computadora, alcanza con
clonarlo al lado.

---

## Lo que este kit NO decide

- **El nombre de la app, los colores, el logo y el tono.** Salen de la
  agrupación y de su Instagram (ver `03-diseno.md`).
- **Qué carreras hay, cómo se llaman las materias, cuáles son
  correlativas, qué trámites existen y en qué fechas.** Salen de la
  facultad. Un dato inventado es peor que un dato ausente: la persona se
  lo cree y se pierde la inscripción.
- **Qué pantallas propias de Artes se hacen.** `04-pantallas.md` propone;
  la agrupación elige.
