$ErrorActionPreference = 'Stop'
$raiz = (Get-Item "C:\Users\Acer\Desktop\M?XIMO\Aplicacion LA BOLIVAR CON VOS\.claude\worktrees\graphify-web-dba33b").FullName
$entrada = Join-Path $raiz "mapa\datos\_ada-crudo.json"
$salida  = Join-Path $raiz "mapa\datos\_ada-unido.json"
$ci = [System.Globalization.CultureInfo]::InvariantCulture
$reloj = [Diagnostics.Stopwatch]::StartNew()

# ---------------------------------------------------------------
# Une los poligonos vecinos del mismo nivel cancelando los bordes
# que comparten: si el borde A->B esta en una manzana y B->A en la
# de al lado, es interno y no va al contorno. Lo que queda se vuelve
# a coser en anillos.
# ---------------------------------------------------------------
$txt = [IO.File]::ReadAllText($entrada)
$trozos = $txt -split '\{"type":"Feature"'
$txt = $null
"leidos {0} trozos" -f ($trozos.Count - 1)

$grupos = @{}   # "nivel|localidad" -> lista de anillos (cada uno, array de puntos "x,y")
$nSaltados = 0
foreach ($t in $trozos){
  if ($t.Length -lt 40) { continue }
  $mN = [regex]::Match($t, '"peligrosidad":"([^"]*)"'); $mL = [regex]::Match($t, '"localidad":"([^"]*)"')
  if (-not $mN.Success) { continue }
  $nivel = $mN.Groups[1].Value
  # Solo alta y media. «Baja» son 27.208 manzanas y «muy baja a nula»
  # otras 4.329: juntas son la mayor parte del partido y multiplican por
  # cuatro el peso del archivo, para decir «acá el agua no llega tan
  # lejos». Lo que importa en una recorrida es dónde SÍ llega.
  if ($nivel -ne 'Alta' -and $nivel -ne 'Media') { $nSaltados++; continue }
  $clave = $nivel + '|' + $mL.Groups[1].Value
  if (-not $grupos.ContainsKey($clave)) { $grupos[$clave] = New-Object Collections.ArrayList }
  # Un anillo es una lista de puntos: [[x,y],[x,y],...]. El corchete de
  # afuera (el que agrupa anillos) no entra porque adentro tiene otro
  # corchete, y el patron no lo admite.
  foreach ($anillo in [regex]::Matches($t, '\[(?:\[[^\[\]]*\],?)+\]')){
    $pts = @()
    foreach ($p in [regex]::Matches($anillo.Value, '\[(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\]')){
      $pts += ($p.Groups[1].Value + ',' + $p.Groups[2].Value)
    }
    if ($pts.Count -ge 4) { [void]$grupos[$clave].Add($pts) }
  }
}
"grupos: {0} · anillos leidos · saltados (muy baja a nula): {1} · {2:N0} s" -f $grupos.Count, $nSaltados, $reloj.Elapsed.TotalSeconds

# OJO: una función que devuelve @(x, y) llega desarmada al que la llama,
# y entonces `$a[0]` no es un número sino la lista entera. Por eso acá los
# puntos se parten a mano, con dos variables sueltas y nada de arrays.
function X($s){ return [double]::Parse($s.Substring(0, $s.IndexOf(',')), $ci) }
function Y($s){ return [double]::Parse($s.Substring($s.IndexOf(',') + 1), $ci) }

# Area con signo, para saber si un anillo es contorno o agujero
function Area($anillo){
  $s = 0.0
  for ($i = 0; $i -lt $anillo.Count - 1; $i++){
    $ax = X $anillo[$i]; $ay = Y $anillo[$i]; $bx = X $anillo[$i + 1]; $by = Y $anillo[$i + 1]
    $s += ($ax * $by - $bx * $ay)
  }
  return $s / 2
}
function Dentro($px, $py, $anillo){
  $dentro = $false
  for ($i = 0; $i -lt $anillo.Count - 1; $i++){
    $ax = X $anillo[$i]; $ay = Y $anillo[$i]; $bx = X $anillo[$i + 1]; $by = Y $anillo[$i + 1]
    if ((($ay -gt $py) -ne ($by -gt $py)) -and
        ($px -lt ($bx - $ax) * ($py - $ay) / ($by - $ay) + $ax)) { $dentro = -not $dentro }
  }
  return $dentro
}
# Douglas-Peucker sobre el anillo ya unido (tolerancia ~2 m)
function Simplificar($anillo, $tol){
  if ($anillo.Count -lt 8) { return $anillo }
  $xs = New-Object 'double[]' $anillo.Count
  $ys = New-Object 'double[]' $anillo.Count
  for ($i = 0; $i -lt $anillo.Count; $i++){ $xs[$i] = X $anillo[$i]; $ys[$i] = Y $anillo[$i] }
  $n = $anillo.Count
  $marca = New-Object 'bool[]' $n
  $marca[0] = $true; $marca[$n - 1] = $true
  $pila = New-Object Collections.Stack
  $pila.Push((New-Object 'int[]' 2))
  $primerPar = $pila.Peek(); $primerPar[0] = 0; $primerPar[1] = $n - 1
  while ($pila.Count){
    $par = $pila.Pop(); $i = $par[0]; $j = $par[1]
    if ($j - $i -lt 2) { continue }
    $ax = $xs[$i]; $ay = $ys[$i]; $bx = $xs[$j]; $by = $ys[$j]
    $dx = $bx - $ax; $dy = $by - $ay; $largo = [math]::Sqrt($dx * $dx + $dy * $dy)
    $peor = -1.0; $k = -1
    for ($m = $i + 1; $m -lt $j; $m++){
      $d = if ($largo -eq 0) { [math]::Sqrt([math]::Pow($xs[$m] - $ax, 2) + [math]::Pow($ys[$m] - $ay, 2)) }
           else { [math]::Abs($dy * $xs[$m] - $dx * $ys[$m] + $bx * $ay - $by * $ax) / $largo }
      if ($d -gt $peor) { $peor = $d; $k = $m }
    }
    if ($peor -gt $tol){
      $marca[$k] = $true
      $p1 = New-Object 'int[]' 2; $p1[0] = $i; $p1[1] = $k; $pila.Push($p1)
      $p2 = New-Object 'int[]' 2; $p2[0] = $k; $p2[1] = $j; $pila.Push($p2)
    }
  }
  $salida = @()
  for ($i = 0; $i -lt $n; $i++){ if ($marca[$i]) { $salida += $anillo[$i] } }
  if ($salida.Count -lt 4) { return $anillo }
  return $salida
}

$escritor = New-Object IO.StreamWriter($salida, $false, (New-Object Text.UTF8Encoding($false)))
$escritor.Write('{"type":"FeatureCollection","features":[')
$primero = $true; $totalAnillos = 0; $totalVert = 0

foreach ($clave in ($grupos.Keys | Sort-Object)){
 try {
  $partes = $clave.Split('|'); $nivel = $partes[0]; $localidad = $partes[1]
  # 1. cancelar bordes compartidos
  $bordes = New-Object 'Collections.Generic.Dictionary[string,byte]'
  foreach ($anillo in $grupos[$clave]){
    for ($i = 0; $i -lt $anillo.Count - 1; $i++){
      $a = $anillo[$i]; $b = $anillo[$i + 1]
      if ($a -eq $b) { continue }
      $rev = $b + '>' + $a
      if ($bordes.ContainsKey($rev)) { [void]$bordes.Remove($rev) }
      else { $bordes[$a + '>' + $b] = 1 }
    }
  }
  # 2. coser lo que quedo
  $desde = New-Object 'Collections.Generic.Dictionary[string,Collections.Generic.List[string]]'
  foreach ($b in $bordes.Keys){
    $p = $b.Split('>')
    if (-not $desde.ContainsKey($p[0])) { $desde[$p[0]] = New-Object 'Collections.Generic.List[string]' }
    $desde[$p[0]].Add($p[1])
  }
  $anillosUnidos = @()
  foreach ($inicio in @($desde.Keys)){
    while ($desde.ContainsKey($inicio) -and $desde[$inicio].Count){
      $anillo = @($inicio); $actual = $inicio; $corte = 0
      while ($true){
        if (-not $desde.ContainsKey($actual) -or -not $desde[$actual].Count) { $anillo = $null; break }
        $siguiente = $desde[$actual][0]; $desde[$actual].RemoveAt(0)
        $anillo += $siguiente; $actual = $siguiente
        if ($actual -eq $inicio) { break }
        if (++$corte -gt 200000) { $anillo = $null; break }
      }
      if ($anillo -and $anillo.Count -ge 4) { $anillosUnidos += ,$anillo }
    }
  }
  if (-not $anillosUnidos.Count) { continue }
  # 3. contornos y agujeros
  $contornos = @(); $agujeros = @()
  foreach ($a in $anillosUnidos){
    # ~5 m: una manzana sigue siendo una manzana y se van los vértices
    # que a esta escala nadie ve.
    $s = Simplificar $a 0.00005
    if ((Area $a) -ge 0) { $contornos += ,$s } else { $agujeros += ,$s }
  }
  if (-not $contornos.Count) { $contornos = $agujeros; $agujeros = @() }
  $polis = @()
  foreach ($c in $contornos){
    $mios = @()
    foreach ($h in $agujeros){ if (Dentro (X $h[0]) (Y $h[0]) $c) { $mios += ,$h } }
    # `@($c)` desarma el anillo en puntos sueltos y cada punto termina
    # siendo un anillo de uno. Con la coma adelante entra entero.
    $lista = @(,$c) + $mios
    $polis += '[' + (($lista | ForEach-Object { '[' + (($_ | ForEach-Object { '[' + $_ + ']' }) -join ',') + ']' }) -join ',') + ']'
    $totalAnillos += $lista.Count
    foreach ($r in $lista) { $totalVert += $r.Count }
  }
  if (-not $primero) { $escritor.Write(',') }; $primero = $false
  $escritor.Write('{"type":"Feature","properties":{"peligrosidad":"' + $nivel + '","localidad":"' + $localidad +
                  '"},"geometry":{"type":"MultiPolygon","coordinates":[' + ($polis -join ',') + ']}}')
  "  ok {0} · {1} contornos" -f $clave, $contornos.Count
 } catch {
  "FALLO en {0} · linea {1}: {2}" -f $clave, $_.InvocationInfo.ScriptLineNumber, $_.Exception.Message
  break
 }
}
$escritor.Write(']}'); $escritor.Close()
"listo: {0} zonas, {1:N0} anillos, {2:N0} vertices, {3:N0} bytes, {4:N0} s" -f `
  $grupos.Count, $totalAnillos, $totalVert, (Get-Item $salida).Length, $reloj.Elapsed.TotalSeconds
