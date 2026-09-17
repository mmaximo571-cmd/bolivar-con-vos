Add-Type -AssemblyName System.Web.Extensions
$ErrorActionPreference = 'Stop'
$geo = Split-Path -Parent $MyInvocation.MyCommand.Path
$salida = Join-Path (Get-Item "C:\Users\Acer\Desktop\M?XIMO\Aplicacion LA BOLIVAR CON VOS\.claude\worktrees\graphify-web-dba33b").FullName "mapa\datos"
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = [int]::MaxValue
$ci = [System.Globalization.CultureInfo]::InvariantCulture
$MAL = [string][char]0xFFFD

function Leer($nombre){ $ser.DeserializeObject([IO.File]::ReadAllText((Join-Path $geo $nombre), [Text.Encoding]::UTF8)) }
function Num($v){ ([math]::Round([double]$v, 5)).ToString('0.#####', $ci) }
function Txt($s){
  if ($null -eq $s) { return 'null' }
  $s = [string]$s
  $s = $s.Replace('\','\\').Replace('"','\"').Replace("`r",' ').Replace("`n",' ').Replace("`t",' ')
  return '"' + $s + '"'
}
function Props($h){
  $partes = @()
  foreach ($k in $h.Keys){ if ($h[$k]) { $partes += (Txt $k) + ':' + (Txt $h[$k]) } }
  return '{' + ($partes -join ',') + '}'
}
# Una lista de [lon,lat] redondeada y sin repetidos seguidos.
function Anillo($puntos){
  $sb = New-Object Text.StringBuilder; $ant = ''; $n = 0
  foreach ($p in $puntos){
    $par = '[' + (Num $p[0]) + ',' + (Num $p[1]) + ']'
    if ($par -ne $ant){ if ($n) { [void]$sb.Append(',') }; [void]$sb.Append($par); $ant = $par; $n++ }
  }
  return @{ texto = '[' + $sb.ToString() + ']'; n = $n }
}
function DeOsm($geom){ ,@($geom | ForEach-Object { ,@($_['lon'], $_['lat']) }) }
function Escribir($archivo, $features){
  $texto = '{"type":"FeatureCollection","features":[' + ($features -join ',') + ']}'
  [IO.File]::WriteAllText((Join-Path $salida $archivo), $texto, (New-Object Text.UTF8Encoding($false)))
  "{0}: {1} elementos, {2:N0} bytes" -f $archivo, $features.Count, (Get-Item (Join-Path $salida $archivo)).Length
}

# ---------- 1. Arroyos y canales ----------
$tipoAgua = @{ river='Río'; stream='Arroyo'; canal='Canal'; drain='Desagüe o zanja' }
$f = @()
foreach ($e in (Leer 'o1.json')['elements']){
  if ($e['type'] -ne 'way' -or -not $e['geometry']) { continue }
  $a = Anillo (DeOsm $e['geometry'])
  if ($a.n -lt 2) { continue }
  $t = $e['tags']
  $f += '{"type":"Feature","properties":' + (Props ([ordered]@{ nombre=$t['name']; descripcion=$tipoAgua[$t['waterway']] })) +
        ',"geometry":{"type":"LineString","coordinates":' + $a.texto + '}}'
}
# La peligrosidad por inundación ya NO va acá: es su propia capa
# (`peligrosidad.geojson`), que arman `ada/ada.ps1` y `ada/unir.ps1`.
if ($false){
$kml = New-Object Xml.XmlDocument
$kml.Load((Join-Path $geo 'gm.kml'))
$ns = New-Object Xml.XmlNamespaceManager($kml.NameTable); $ns.AddNamespace('k', 'http://www.opengis.net/kml/2.2')
$niveles = @{ 'alta'='Alta'; 'media'='Media'; 'baja'='Baja'; 'muy baja a nula'='Muy baja a nula' }
$sinNivel = 0
foreach ($pm in $kml.SelectNodes('//k:Placemark', $ns)){
  $polis = $pm.SelectNodes('.//k:Polygon', $ns)
  if (-not $polis.Count) { continue }
  $dato = @{}; foreach ($d in $pm.SelectNodes('.//k:Data', $ns)){ $dato[$d.GetAttribute('name')] = $d.InnerText.Trim() }
  $nivel = $niveles[([string]$dato['peligrosid']).ToLower()]
  if (-not $nivel) { $sinNivel++; continue }
  $partes = @()
  foreach ($poli in $polis){
    $anillos = @()
    foreach ($c in $poli.SelectNodes('.//k:coordinates', $ns)){
      $pts = @($c.InnerText.Trim() -split '\s+' | Where-Object { $_ } | ForEach-Object { $xy = $_.Split(','); ,@([double]::Parse($xy[0], $ci), [double]::Parse($xy[1], $ci)) })
      if ($pts.Count -ge 4) { $anillos += (Anillo $pts).texto }
    }
    if ($anillos.Count) { $partes += '[' + ($anillos -join ',') + ']' }
  }
  if (-not $partes.Count) { continue }
  $lugar = (@($dato['cuenca'], 'Ángel Etcheverry') | Where-Object { $_ -and $_ -ne 'NULL' }) -join ' · '
  $f += '{"type":"Feature","properties":' + (Props ([ordered]@{ nombre="Peligrosidad de inundación: $($nivel.ToLower())"; peligrosidad=$nivel; descripcion=$lugar })) +
        ',"geometry":{"type":"MultiPolygon","coordinates":[' + ($partes -join ',') + ']}}'
}
}
Escribir 'hidrico.geojson' $f

# ---------- 2. Zonas industriales ----------
$f = @(); $saltados = 0
foreach ($e in (Leer 'o2.json')['elements']){
  $t = $e['tags']; $anillos = @()
  if ($e['type'] -eq 'way' -and $e['geometry']){ $anillos += ,(DeOsm $e['geometry']) }
  elseif ($e['type'] -eq 'relation'){
    foreach ($m in $e['members']){ if ($m['role'] -eq 'outer' -and $m['geometry']) { $anillos += ,(DeOsm $m['geometry']) } }
  }
  $polis = @()
  foreach ($r in $anillos){
    $pri = $r[0]; $ult = $r[$r.Count - 1]
    if ($r.Count -ge 4 -and $pri[0] -eq $ult[0] -and $pri[1] -eq $ult[1]) { $polis += '[' + (Anillo $r).texto + ']' }
    else { $saltados++ }
  }
  if (-not $polis.Count) { continue }
  $nombre = if ($t['name']) { $t['name'] } else { $t['operator'] }
  $f += '{"type":"Feature","properties":' + (Props ([ordered]@{ nombre=$nombre; descripcion='Zona industrial' })) +
        ',"geometry":{"type":"MultiPolygon","coordinates":[' + ($polis -join ',') + ']}}'
}
Escribir 'industrial.geojson' $f
"  (anillos sin cerrar que se saltearon: $saltados)"

# ---------- 3. Redes de contención ----------
$f = @()
foreach ($e in (Leer 'o3.json')['elements']){
  $t = $e['tags']
  $tipo = switch ($true) {
    ($t['amenity'] -eq 'hospital')     { 'Hospital' }
    ($t['amenity'] -eq 'clinic')       { 'Centro de salud' }
    ($t['amenity'] -eq 'fire_station') { 'Bomberos' }
    ($t['leisure'] -eq 'sports_centre' -and $t['name']) { 'Club o centro deportivo' }
    default { $null }
  }
  if (-not $tipo) { continue }
  if ($e['type'] -eq 'node') { $lat = $e['lat']; $lon = $e['lon'] }
  elseif ($e['center']) { $lat = $e['center']['lat']; $lon = $e['center']['lon'] }
  else { continue }
  $dir = (@($t['addr:street'], $t['addr:housenumber']) | Where-Object { $_ }) -join ' '
  $f += '{"type":"Feature","properties":' + (Props ([ordered]@{ nombre=$t['name']; tipo=$tipo; descripcion=$dir })) +
        ',"geometry":{"type":"Point","coordinates":[' + (Num $lon) + ',' + (Num $lat) + ']}}'
}
Escribir 'contencion.geojson' $f

# ---------- 4. RENABAP ----------
# El geoportal devuelve los acentos ya perdidos (U+FFFD). Son pocas
# palabras y ninguna ambigua: se reponen con esta tabla.
$arreglos = [ordered]@{
  "G${MAL}emes"='Güemes'; "Arg${MAL}ello"='Argüello'; "F${MAL}brica"='Fábrica'; "Rinc${MAL}n"='Rincón';
  "Estaci${MAL}n"='Estación'; "Tri${MAL}ngulo"='Triángulo'; "Mart${MAL}nez"='Martínez'; "Mart${MAL}n"='Martín';
  "Porte${MAL}o"='Porteño'; "Extensi${MAL}n"='Extensión'; "Miguel${MAL}n"='Miguelín'; "Nin${MAL}"='Niní';
  "Uni${MAL}n"='Unión'; "Fabi${MAL}n"='Fabián'; "Segu${MAL}"='Seguí'; "Valent${MAL}n"='Valentín';
  "Sebasti${MAL}n"='Sebastián'; "Omb${MAL}"='Ombú'; "V${MAL}a"='Vía'; "N${MAL}stor"='Néstor'; "Zanj${MAL}n"='Zanjón'
}
function Arreglar($s){ $s = [string]$s; foreach ($k in $arreglos.Keys){ $s = $s.Replace($k, $arreglos[$k]) }; return $s }

$f = @(); $rotos = @()
foreach ($e in (Leer 'rb.json')['features']){
  $p = $e['properties']
  if (@('La Plata','Berisso','Ensenada') -notcontains $p['Departamen']) { continue }
  $nombre = Arreglar $p['nombre_bar']
  $clase  = Arreglar $p['clasif_bar']
  if (($nombre + $clase).Contains($MAL)) { $rotos += $nombre }
  $partes = @()
  if ($clase) { $partes += "$clase en $($p['Departamen'])" } else { $partes += $p['Departamen'] }
  if ($p['familias']) { $partes += "$($p['familias']) familias" }
  if ($p['creacion']) { $partes += "desde $($p['creacion'])" }
  $polis = @()
  foreach ($poli in $e['geometry']['coordinates']){
    $anillos = @(); foreach ($r in $poli){ $anillos += (Anillo $r).texto }
    $polis += '[' + ($anillos -join ',') + ']'
  }
  $f += '{"type":"Feature","properties":' + (Props ([ordered]@{ nombre=$nombre; descripcion=($partes -join ' · ') })) +
        ',"geometry":{"type":"MultiPolygon","coordinates":[' + ($polis -join ',') + ']}}'
}
Escribir 'renabap.geojson' $f
"  (nombres que siguen rotos: $($rotos.Count)) $($rotos -join ' | ')"
