# Las capas de base del mapa de riesgo

Acá van los GeoJSON que la pantalla `mapa/` pinta como «Información de
base». La app los pide recién cuando alguien prende la capa, así que un
archivo que todavía no está no rompe nada: el renglón dice «Todavía no está
cargada en la app».

## Los cinco archivos

| Archivo | Capa | Geometría | Qué propiedades mira |
|---|---|---|---|
| `hidrico.geojson` | Riesgo hídrico | líneas (arroyos, canales) y polígonos (zonas inundables), juntos | `nombre`, `descripcion` |
| `industrial.geojson` | Riesgo industrial | polígonos | `nombre`, `descripcion` |
| `renabap.geojson` | Hábitat · RENABAP | polígonos | `nombre` (o `nombre_barrio`), `descripcion` |
| `contencion.geojson` | Redes de contención | puntos | `nombre`, `descripcion` y **`tipo`** |
| `movilidad.geojson` | Movilidad | líneas | `nombre`, `descripcion` |

Los nombres de archivo son los de `mapa/capas-base.js`. Si cambia uno, se
cambia ahí.

**El `tipo` de Redes de contención** decide el color del punto. Se compara
sin tildes ni mayúsculas y por pedazo de palabra: «Hospital», «CAPS» y
«Salita» son salud; «Club» es club; «Bomberos» es bomberos. Lo demás sale
gris y la ficha muestra el tipo tal cual.

**Para el nombre** se prueban, en orden: `nombre`, `Nombre`, `NOMBRE`,
`name`, `nombre_barrio`, `barrio`, `NOMBRE_BAR`, `nam`, `fna`. No hace falta
renombrar las columnas de la fuente si ya se llaman así.

## De dónde salieron los que están (17/9/2026)

| Archivo | Fuente | Cómo |
|---|---|---|
| `hidrico.geojson` | OpenStreetMap (ODbL) | Overpass API: `waterway` = river, stream, canal, drain. 794 líneas: 430 arroyos, 108 canales, 243 desagües, 13 ríos. **Sin zonas inundables**: no hay un archivo público verificado; lo que publican Municipio y Provincia son imágenes o PDF |
| `industrial.geojson` | OpenStreetMap (ODbL) | `landuse=industrial`, caminos y relaciones. 81 zonas |
| `contencion.geojson` | OpenStreetMap (ODbL) | `amenity` = hospital (63), clinic (79, «Centro de salud»), fire_station (14) y `leisure=sports_centre` **solo con nombre** (74). Los gimnasios sin nombre quedaron afuera: casi siempre son privados |
| `renabap.geojson` | RENABAP 2020, Ministerio de Desarrollo Social | WFS del geoportal de Obras Públicas (`geonode:renabap2020_smz`). 190 barrios: La Plata, Berisso y Ensenada (se sacaron Berazategui y Florencio Varela, que caen en el rectángulo). **El servidor devuelve los acentos rotos**; 26 nombres se repusieron con una tabla, sin ninguno dudoso |
| `movilidad.geojson` | — | **No existe.** No hay dato público de corredores seguros: se dibujan (por ejemplo en geojson.io) |

El rectángulo usado en las cuatro descargas es el de la app:
sur -35.12, oeste -58.20, norte -34.76, este -57.72. OpenStreetMap cambia
todo el tiempo: rehacer la descarga cada tanto trae lo que se sumó.

## Tres reglas antes de dejar un archivo acá

1. **Latitud y longitud (WGS84, EPSG:4326).** Muchos organismos de la
   provincia publican en POSGAR (metros). La app se da cuenta y dice «El
   archivo no está en latitud y longitud», pero no lo convierte.
2. **Livianos.** Se bajan con los datos del teléfono, en el barrio. Que
   cada uno pese **menos de 500 KB**: simplificar las formas y bajar los
   decimales a cinco (un metro) no se nota en el mapa y divide el peso.
3. **Con la fuente anotada.** En `mapa/capas-base.js`, cada capa tiene
   `fuente:''`. Se completa con el organismo y el año: sale en cada ficha.

Con [mapshaper](https://mapshaper.org) (anda en el navegador, sin
instalar nada) las tres cosas son una línea en su consola:

```
-proj wgs84 -simplify 15% keep-shapes -o format=geojson precision=0.00001
```

Recortar a La Plata, Berisso y Ensenada antes de exportar también ahorra
mucho: un archivo nacional de RENABAP son miles de barrios que acá no se
ven.
