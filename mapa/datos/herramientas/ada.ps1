$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$salida = Join-Path (Get-Item "C:\Users\Acer\Desktop\M?XIMO\Aplicacion LA BOLIVAR CON VOS\.claude\worktrees\graphify-web-dba33b").FullName "mapa\datos\_ada-crudo.json"
$ci = [System.Globalization.CultureInfo]::InvariantCulture
$niveles = @{ 'alta'='Alta'; 'media'='Media'; 'baja'='Baja'; 'muy baja a nula'='Muy baja a nula' }

function Txt($s){ '"' + ([string]$s).Replace('\','\\').Replace('"','\"') + '"' }
function Anillo([string]$texto){
  $sb = New-Object Text.StringBuilder; $ant = ''; $n = 0
  foreach ($tupla in ($texto.Trim() -split '\s+')){
    if (-not $tupla) { continue }
    $xy = $tupla.Split(',')
    $par = '[' + ([math]::Round([double]::Parse($xy[0], $ci), 5)).ToString('0.#####', $ci) + ',' +
                 ([math]::Round([double]::Parse($xy[1], $ci), 5)).ToString('0.#####', $ci) + ']'
    if ($par -ne $ant){ if ($n) { [void]$sb.Append(',') }; [void]$sb.Append($par); $ant = $par; $n++ }
  }
  if ($n -lt 4) { return $null }
  return '[' + $sb.ToString() + ']'
}

$escritor = New-Object IO.StreamWriter($salida, $false, (New-Object Text.UTF8Encoding($false)))
$escritor.Write('{"type":"FeatureCollection","features":[')
$primero = $true; $total = 0; $sinNivel = 0

foreach ($archivo in (Get-ChildItem -Path $dir -Filter 'k*.kml' | Sort-Object Name)){
  $kml = New-Object Xml.XmlDocument
  $kml.Load($archivo.FullName)
  $ns = New-Object Xml.XmlNamespaceManager($kml.NameTable); $ns.AddNamespace('k', 'http://www.opengis.net/kml/2.2')
  $localidad = $kml.SelectSingleNode('/k:kml/k:Document/k:name', $ns).InnerText.Trim()
  $localidad = ($localidad -replace '\s+', ' ') -replace '^Angel Echeverry$', 'Ángel Etcheverry'
  $cuenta = 0
  foreach ($pm in $kml.SelectNodes('//k:Placemark', $ns)){
    $dato = @{}; foreach ($d in $pm.SelectNodes('.//k:Data', $ns)){ $dato[$d.GetAttribute('name')] = $d.InnerText.Trim() }
    $crudo = if ($dato['peligrosidad']) { $dato['peligrosidad'] } else { $dato['peligrosid'] }
    $nivel = $niveles[([string]$crudo).ToLower()]
    if (-not $nivel) { if ($pm.SelectNodes('.//k:Polygon', $ns).Count) { $sinNivel++ }; continue }
    $cuenca = if ($dato['cuenca'] -and $dato['cuenca'] -ne 'NULL') { $dato['cuenca'] } else { '' }
    foreach ($poli in $pm.SelectNodes('.//k:Polygon', $ns)){
      $anillos = @()
      foreach ($c in $poli.SelectNodes('./k:outerBoundaryIs//k:coordinates | ./k:innerBoundaryIs//k:coordinates', $ns)){
        $a = Anillo $c.InnerText
        if ($a) { $anillos += $a }
      }
      if (-not $anillos.Count) { continue }
      if (-not $primero) { $escritor.Write(',') }; $primero = $false
      $escritor.Write('{"type":"Feature","properties":{"peligrosidad":' + (Txt $nivel) + ',"localidad":' + (Txt $localidad) +
                      ',"cuenca":' + (Txt $cuenca) + '},"geometry":{"type":"Polygon","coordinates":[' + ($anillos -join ',') + ']}}')
      $cuenta++; $total++
    }
  }
  "{0} {1}: {2} poligonos" -f $archivo.Name, $localidad, $cuenta
}
$escritor.Write(']}'); $escritor.Close()
"TOTAL {0} poligonos, sin nivel {1}, {2:N0} bytes" -f $total, $sinNivel, (Get-Item $salida).Length
