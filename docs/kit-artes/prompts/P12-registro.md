# Sesión 12 · El registro

## El prompt

```
TAREA: Sesión 12. Que la app anote visitas, búsquedas, errores e hitos
en la tabla sucesos, y una solapa «Registro» en el panel para mirarlo.

LEÉ PRIMERO:
- docs/kit/01-arquitectura.md, «El registro»
- sql/tabla-registro.sql de este repositorio (ya creada en la sesión 3)

MIRÁ EN LA REFERENCIA, por tramos:
- app.js: queAparato, esPrueba, anotar, anotarHito, deDondeVino,
  anotarBusqueda (grep -n, solo esas).
- sql/tabla-registro.sql: resumen_registro().
- BITACORA.md de la referencia: grep -n «El embudo» y leé solo esa
  sección.

HACÉ:
1. anotar() con fetch pelado (no db), dentro de try/catch, sin esperar
   respuesta. La visita se anota 2,5 s después de dibujar la pantalla.
2. Errores: como mucho tres por visita y sin repetir.
3. Búsquedas: cuando la persona deja de tipear, no en cada tecla.
4. Hitos (uno por visita y por nombre): eligió carrera, marcó materia,
   instaló (evento appinstalled, no «tocó el botón»), volvió instalada.
5. De dónde vino: el ?de= del link, limpiado (letras, números, guiones,
   40 caracteres) antes de mandarlo.
6. esPrueba(): localhost y archivos abiertos a mano no cuentan. Es una
   lista de lo que NO cuenta.
7. resumen_registro() en la base, que comprueba que quien llama es del
   equipo, y la solapa del panel que lo muestra: visitas por día, de
   dónde vinieron, qué se buscó (lo más buscado sin resultado primero),
   errores, y la proporción de cada hito sobre las visitas.
8. Como app.js cambió: subir VERSION y anotarlo.

NO:
- Ninguna columna de usuario, IP ni nada que una dos visitas.

TERMINADO CUANDO: una visita real (no localhost) aparece en el panel;
una búsqueda sin resultado aparece primera; un error forzado aparece
una sola vez; desde localhost no se anota nada.
```

## Después

Escribir los links de Instagram con `?de=` (por ejemplo
`?de=historia-ingreso`). No hay nada que generar: se escribe a mano.
