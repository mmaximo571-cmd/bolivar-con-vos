# Las capas de base del mapa de riesgo

Acá van los GeoJSON que la pantalla `mapa/` pinta como «Información de
base». La app los pide recién cuando alguien prende la capa, así que un
archivo que todavía no está no rompe nada: el renglón dice «Todavía no está
cargada en la app».

## Los cinco archivos

| Archivo | Capa | Geometría | Qué propiedades mira |
|---|---|---|---|
| `hidrico.geojson` | Cursos de agua | líneas | `nombre`, `descripcion` |
| `peligrosidad.geojson` | Peligrosidad de inundación | polígonos | `peligrosidad` (Alta o Media) y `localidad` |
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
| `hidrico.geojson` | OpenStreetMap (ODbL) | Overpass API: `waterway` = river, stream, canal, drain. 824 líneas: arroyos, canales, desagües y ríos |
| `peligrosidad.geojson` | ADA (Autoridad del Agua) | Los **21 mapas de peligrosidad de La Plata** de `riesgohidrico.ada.gba.gov.ar`, uno por localidad más el de Berisso (cuenca Maldonado-Garibaldi). Cada uno es un Google My Maps: se bajan como KML con `https://www.google.com/maps/d/kml?mid=<id>&forcekml=1`. Los datos de base son del Plan de reducción de riesgo por inundaciones (convenio UNLP–Municipalidad, 2019). **Ensenada no está** en esta serie |
| `industrial.geojson` | OpenStreetMap (ODbL) | `landuse=industrial`, caminos y relaciones. 81 zonas |
| `contencion.geojson` | OpenStreetMap (ODbL) | `amenity` = hospital (63), clinic (79, «Centro de salud»), fire_station (14) y `leisure=sports_centre` **solo con nombre** (74). Los gimnasios sin nombre quedaron afuera: casi siempre son privados |
| `renabap.geojson` | RENABAP 2020, Ministerio de Desarrollo Social | WFS del geoportal de Obras Públicas (`geonode:renabap2020_smz`). 190 barrios: La Plata, Berisso y Ensenada (se sacaron Berazategui y Florencio Varela, que caen en el rectángulo). **El servidor devuelve los acentos rotos**; 26 nombres se repusieron con una tabla, sin ninguno dudoso |
| `movilidad.geojson` | — | **No existe.** No hay dato público de corredores seguros: se dibujan (por ejemplo en geojson.io) |

El rectángulo de las descargas de OpenStreetMap y RENABAP fue sur -35.12,
oeste -58.20, norte -34.76, este -57.72. Después la app corrió el sur a
-35.25 por el mapa de peligrosidad: **en esa franja (Etcheverry y el sur
rural) todavía no hay arroyos, industria ni salud**; se trae rehaciendo
esas descargas con -35.25. OpenStreetMap cambia
todo el tiempo: rehacer la descarga cada tanto trae lo que se sumó.

## Los scripts, en `herramientas/`

Son de PowerShell y están para **rehacer** cualquier capa, no para correr
en la app. Se corren desde una carpeta aparte donde estén las descargas
crudas (que no van al repositorio, pesan decenas de MB).

| Archivo | Qué hace |
|---|---|
| `convertir.ps1` | Pasa a GeoJSON las descargas de Overpass (`o1..o3.json`) y de RENABAP (`rb.json`) |
| `ada.ps1` | Junta los 21 KML de la ADA (`k01..k21.kml`) en un solo GeoJSON crudo |
| `unir.ps1` | De ese crudo saca `peligrosidad.geojson`: se queda con alta y media, pega las manzanas que se tocan y simplifica los bordes (~5 m). Tarda unos 10 minutos |
| `mapas-ada.txt` | Los 21 mapas de la ADA con su `mid`, localidad, cuencas y cuántos polígonos tiene cada uno |

**Ojo con los acentos:** PowerShell 5.1 lee los `.ps1` como ANSI. Si un
script se edita y se guarda sin la marca UTF-8 (BOM), escribe «MartÃ­n»
adentro de los datos. Ya pasó dos veces.

**`peligrosidad.geojson` todavía no está** (17/9/2026). La fusión quedó a
mitad de camino: se corrió `ada.ps1` (42.427 polígonos) y `unir.ps1` iba
por la mitad. Hay que correr `unir.ps1` entero y dejar el resultado acá
con ese nombre.

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
