# Sesión 13 · Revisión y lanzamiento

**Todo tiene que estar arriba el día antes.** El service worker sirve
la versión guardada en la primera carga y la nueva en la segunda.

## Antes

- Si hay dominio propio, comprado y a mano el acceso a su DNS.
- Una persona con un iPhone y otra con un Android, para la última
  prueba.

## El prompt

```
TAREA: Sesión 13. La revisión antes de lanzar, pantalla por pantalla,
y el dominio. Esta sesión arregla lo que encuentra si es chico; si es
grande, lo anota y no lo arregla.

LEÉ PRIMERO:
- docs/kit/03-diseno.md, «Las reglas de pantalla»
- BITACORA.md: el cronograma (grep), para saber qué pantallas hay

HACÉ, en cada pantalla publicada, y anotá el resultado en una tabla:
1. 375px y 320px: nada se corta ni se sale de costado.
2. Claro y oscuro: contraste medido sobre lo dibujado, 4,5 mínimo.
3. Todo lo tocable de 48px; foco visible; un h1; «Saltar al contenido».
4. Con la red cortada después de una visita: abre, y no pinta fechas
   viejas como si fueran de hoy.
5. Sin datos (tabla vacía): estado vacío que dice algo, no un hueco.
6. Consola sin errores.
7. Nombre igual en sección, title, og:title y h1.
8. Al menos dos puertas de entrada; ningún callejón.
9. En la base: ningún publicado con REVISAR, EJEMPLO, LOREM o FALTA
   (armá el select que lo busca en todas las tablas de contenido).
10. Corré el script de refs del armazón.
11. Cargá cada pantalla con ?de=prueba desde la dirección publicada y
    fijate que la visita entre al registro.

EL DOMINIO (si hay): dame los pasos para Vercel (Settings → Domains) y
los registros DNS exactos que pide, y después actualizá og:image y
cualquier dirección absoluta. La dirección vieja de vercel.app sigue
andando: no hace falta redirigir nada.

AL FINAL: subí VERSION si se tocó el armazón, anotá en la bitácora
«congelado» con la fecha, y listame lo que quedó pendiente.

TERMINADO CUANDO: la tabla de la revisión está entera, sin rojos en lo
que se puede arreglar en esta sesión, y todo está publicado.
```

## Después: el día antes

- Abrir la app en un iPhone y en un Android **dos veces cada uno**
  (la segunda es la que muestra la versión nueva).
- Instalarla en los dos.
- A partir de acá, **no se sube nada hasta pasado el lanzamiento**
  salvo un error que impida usarla.
