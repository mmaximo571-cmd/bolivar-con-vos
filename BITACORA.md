# Bitácora · La Bolívar con vos

**Este archivo se lee primero, antes de tocar nada y antes de explorar el
repositorio.** Existe para eso: el trabajo va en sesiones cortas, y sin esto
cada sesión vuelve a leerse `LEEME.md` (50 KB) y a mirar la estructura entera.
Con seis arranques por día, eso se paga seis veces.

Si algo de acá quedó viejo, se corrige acá mismo al cerrar la sesión.

---

## Dónde estamos

- **Lanzamiento: lunes 21 de septiembre de 2026**, Día del Estudiante, con
  campaña en Instagram a 4.213 seguidores. **La fecha no se mueve: se mueve el
  alcance.**
- Hoy es **3 de septiembre** y vamos **dos días adelantados**.
- La app ya está viva en `bolivar-con-vos.vercel.app`. Vercel publica solo con
  cada `push` a `main`.
- Plan completo (documento rector):
  https://claude.ai/code/artifact/25f7c752-e67f-465a-bf82-5913218cff95

## Hecho y publicado

| Día | Qué | Commit |
|---|---|---|
| 2/9 | Cerradas las dos escrituras sin cuenta ni freno; azar fuerte en los códigos de respaldo; permisos de perfil corregidos; `TRUNCATE` revocado | `fa09983` |
| 3/9 | La alarma de inscripción sale de un dato (`alarma`/`periodo`) y no de un regex sobre el título | `07c3226` |
| 3/9 | La tipografía sube un punto y toda la app pasa por la escala `--letra-*` | `ef8737d` |
| 3/9 | Cinco pantallas dejan de bajar `lib/supabase.js` (212.718 → 6.357 bytes) | `6c91ada` |
| 3/9 | La app anota visitas, búsquedas y errores; solapa **Registro** en el panel | `6de2ac0` |
| 3/9 | El ícono de la app es el logo y no la «B» que inventaba Android; el service worker sube a `v5` para que los teléfonos ya instalados se enteren | `65968ac` |

## Lo que sigue, en este orden

1. **Guardado entre visitas.** Que las pantallas guarden lo que trajeron, para
   que la segunda entrada sea instantánea. Hoy el service worker se niega a
   propósito para no mostrar fechas viejas: la solución tiene que distinguir
   «viejo pero mientras carga» de «viejo y mentiroso».
2. **«Mi año»: ingresante o avanzado.** La idea más grande de las que entran.
   Es módulo nuevo → **primero las preguntas, no se construye de una.**
3. Buscador de cátedras (lun 7) · Contactos en la página + materias libres de
   Fono (mar 8) · Plan de estudios en PDF (mié 9) · Horarios (jue 10 y vie 11) ·
   Materiales como página web (sáb 12).
4. **Domingo 13: congelamiento.** Última línea de función nueva.

## Decisiones ya tomadas — no volver a discutirlas

- **La facultad es aliada, no antagonista.** Nada del copy se apoya en «lo que
  la facultad no te dice».
- **El agujero de `respaldos` no era un agujero:** RLS sin políticas y funciones
  `SECURITY DEFINER` son el diseño a propósito (patrón de llave). Ya auditado
  entero; lo revisado y sano está anotado en `tabla-seguridad.sql` para no
  volver a auditarlo.
- **La base no frena nada.** No proponer optimizaciones de consultas ni de
  índices: el trabajo está del lado del navegador.
- **Una pantalla que necesita sesión usa `lib/supabase.js`.** El cliente chico
  no renueva el token y una sesión que no se renueva falla en silencio.
- **Nada de tiempo real ni de subir archivos en el cliente chico.**

## Decisiones pendientes — se cierran el domingo 6

1. **¿Quién actualiza los horarios en marzo?** Si hay nombre y apellido, se
   construyen completos (2 días). Si no, sale el cuadro oficial de la facultad
   (medio día) y no puede mentir.
2. **¿Qué muestra la portada el 21?** Ese día la alarma no va a estar: la
   inscripción de septiembre cierra el 10 y la siguiente abre el 9 de noviembre.
3. **¿Fechas conserva el tiempo real?** Si se cambia por «se refresca al
   volver», esa pantalla baja 212 KB. Es sacar una función: no se toca sin que
   Máximo lo diga.
4. **El texto de la pestaña «Plan completo»**, que no entra y se recorta.

## Lo que depende de Máximo

| Qué | Para cuándo |
|---|---|
| Mirar la solapa **Registro** y el campo **«¿Alimenta la alarma?»** en el panel | cuanto antes |
| Prender *Leaked password protection* en supabase.com → Authentication | cuanto antes |
| Los mails de las cátedras | lun 7 |
| Los tres PDFs del plan de estudios (TS, TGCR, Fono) | mié 9 |
| Los PDFs de los materiales de estudio | vie 11 |
| Tres contactos por carrera para Avisanos | mié 16 |

## Cómo se trabaja

- **Una sesión, un objetivo, un commit.** El objetivo se dice antes de empezar.
- **Nada de «revisá toda la app» en una sesión corta.** Las auditorías amplias
  son lo más caro que existe.
- **Archivos grandes, por partes.** `estilos.css` 143 KB, `index.html` 54 KB,
  `LEEME.md` 50 KB, `panel/index.html` 109 KB. Nunca enteros: por selector o por
  pantalla.
- **Se publica con `git push`**, y va derecho a `main` porque es lo que Vercel
  mira. Antes de pushear, comprobar que sea un avance limpio.
- **Ojo el día del lanzamiento:** el service worker sirve la versión guardada en
  la primera carga y la nueva recién en la segunda. **Todo tiene que estar
  arriba el 20, no el 21.**
- Las limitaciones de esta máquina (sin Node, heredocs que se rompen, servidor
  de prueba con `HttpListener`, el panel de vista previa que no corre
  `requestAnimationFrame`) están en la memoria del proyecto, no acá.
