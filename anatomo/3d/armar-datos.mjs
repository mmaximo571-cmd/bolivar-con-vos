/* ============================================================
   ARMAR LOS DATOS DEL VISOR 3D (17/11/2026)

   No corre en el teléfono: es la receta con la que se hicieron los
   `datos/<vista>.bin`. Hace falta solo si cambia `piezas.js` (otra
   pieza, otra vista) o si BodyParts3D saca una versión nueva.

   De dónde sale la geometría: el repositorio ashemag/human-atlas
   trae BodyParts3D 4.0 ya convertido (metros, eje Y arriba,
   2234 mallas) en `public/models/`. Se usa eso y no el archivo
   original de la DBCLS porque el original son 2234 OBJ sueltos en
   milímetros; el convertido es el mismo modelo, con licencia CC BY 4.0
   igual que la fuente.

     git clone --depth 1 https://github.com/ashemag/human-atlas
     npm install meshoptimizer@1.2.0        (en cualquier carpeta)
     node anatomo/3d/armar-datos.mjs ../human-atlas

   Lo corre Node desde la carpeta donde se instaló meshoptimizer, o
   con NODE_PATH apuntando a su node_modules.

   El formato, pensado para que el visor lo lea sin librerías:
     uint32 largo de la cabecera · cabecera JSON · relleno a 4
     por cada pieza, en el orden de la cabecera:
       posiciones Int16 ×3 (centradas y escaladas a ±32767)
       normales   Int8  ×3
       índices    Uint16
     cada bloque relleno a 4 bytes.
   Int16 en lugar de Float32 achica a la mitad sin que se note: en
   la vista más grande, un paso de la grilla es menos de 0,01 mm.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const atlas = process.argv[2];
if (!atlas) { console.error('Falta la carpeta de human-atlas.'); process.exit(1); }

const requerir = createRequire(path.join(process.cwd(), 'x.js'));
const { MeshoptSimplifier } = await import(pathToFileURL(requerir.resolve('meshoptimizer')));
await MeshoptSimplifier.ready;

const aqui = path.dirname(new URL(import.meta.url).pathname);
await import(pathToFileURL(path.join(aqui, 'piezas.js')));
const { VISTAS } = globalThis.PIEZAS3D;

const dirModelos = path.join(atlas, 'public', 'models');
const manifiesto = JSON.parse(fs.readFileSync(path.join(dirModelos, 'atlas.json'), 'utf8'));
const trozos = manifiesto.chunks.map(c => fs.readFileSync(path.join(dirModelos, c.url.split('/').pop())));

/* El atlas tiene dos mallas repetidas idénticas (el cricoides y el
   hioides aparecen en dos sistemas). Se queda la primera. */
const vistas = new Set();
const partes = manifiesto.parts.filter(p => {
  const k = p.name.toLowerCase() + '|' + p.vertexCount + '|' + p.bounds.flat().map(x => x.toFixed(4)).join(',');
  if (vistas.has(k)) return false;
  vistas.add(k); return true;
});

function coincide(nombre, patron){
  const n = nombre.toLowerCase();
  if (patron.startsWith('/')){
    const fin = patron.lastIndexOf('/');
    return new RegExp(patron.slice(1, fin), patron.slice(fin + 1)).test(nombre);
  }
  const x = patron.toLowerCase();
  return n === x || n === 'left ' + x || n === 'right ' + x;
}

/* Las mallas muy pesadas (los intercostales pasan de 36.000 vértices)
   se simplifican hasta unos 3500: en una pantalla de teléfono no se
   nota, y son la mitad del peso de la vista de respiración. */
const TOPE_VERTICES = 3500;

function leerMalla(p){
  const b = trozos[p.chunk];
  let pos = new Float32Array(b.buffer, b.byteOffset + p.positions, p.vertexCount * 3);
  let nor = new Int16Array(b.buffer, b.byteOffset + p.normals, p.vertexCount * 3);
  let ind = new Uint32Array(b.buffer, b.byteOffset + p.indices, p.indexCount);
  if (p.vertexCount > TOPE_VERTICES){
    const meta = Math.max(96, Math.floor(p.indexCount * TOPE_VERTICES / p.vertexCount / 3) * 3);
    let [simple] = MeshoptSimplifier.simplify(ind, pos, 3, meta, 0.02);
    /* Los intercostales son láminas finas con costuras: el simplificador
       normal se frena en 20.000 triángulos. El «desprolijo» no respeta
       la topología, y en una lámina eso no se ve. */
    if (simple.length > meta * 1.5)
      [simple] = MeshoptSimplifier.simplifySloppy(ind, pos, 3, null, meta, 0.02);
    const [mapa, cuantos] = MeshoptSimplifier.compactMesh(simple);
    const p2 = new Float32Array(cuantos * 3), n2 = new Int16Array(cuantos * 3);
    for (let viejo = 0; viejo < mapa.length; viejo++){
      const nuevo = mapa[viejo]; if (nuevo === 0xffffffff) continue;
      p2.set(pos.subarray(viejo * 3, viejo * 3 + 3), nuevo * 3);
      n2.set(nor.subarray(viejo * 3, viejo * 3 + 3), nuevo * 3);
    }
    pos = p2; nor = n2; ind = simple;
  }
  return { pos, nor, ind };
}

const salida = path.join(aqui, 'datos');
fs.mkdirSync(salida, { recursive: true });

for (const [clave, vista] of Object.entries(VISTAS)){
  const piezas = [];
  for (const [id, def] of Object.entries(vista.piezas)){
    const mallas = partes.filter(p => def.mallas.some(m => coincide(p.name, m)));
    if (!mallas.length) throw new Error(`${clave}/${id}: ninguna malla para ${def.mallas.join(', ')}`);
    const leidas = mallas.map(leerMalla);
    const v = leidas.reduce((s, m) => s + m.pos.length / 3, 0);
    if (v > 65535) throw new Error(`${clave}/${id}: ${v} vértices no entran en Uint16`);
    const pos = new Float32Array(v * 3), nor = new Int8Array(v * 3);
    const ind = new Uint16Array(leidas.reduce((s, m) => s + m.ind.length, 0));
    let ov = 0, oi = 0;
    for (const m of leidas){
      pos.set(m.pos, ov * 3);
      for (let k = 0; k < m.nor.length; k++) nor[ov * 3 + k] = Math.round(m.nor[k] / 32767 * 127);
      for (let k = 0; k < m.ind.length; k++) ind[oi + k] = m.ind[k] + ov;
      ov += m.pos.length / 3; oi += m.ind.length;
    }
    piezas.push({ id, def, pos, nor, ind, mallas: mallas.map(m => m.name) });
  }

  /* Centro y escala de toda la vista; la caja de encuadre, solo de lo
     que cuenta para la cámara. */
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const emin = [Infinity, Infinity, Infinity], emax = [-Infinity, -Infinity, -Infinity];
  for (const p of piezas) for (let k = 0; k < p.pos.length; k++){
    const a = k % 3, x = p.pos[k];
    if (x < min[a]) min[a] = x; if (x > max[a]) max[a] = x;
    if (p.def.encuadre !== false){ if (x < emin[a]) emin[a] = x; if (x > emax[a]) emax[a] = x; }
  }
  const centro = min.map((x, a) => (x + max[a]) / 2);
  const escala = Math.max(...max.map((x, a) => (x - min[a]) / 2)) * 1.0001;
  const redondo = x => Math.round(x * 1e5) / 1e5;

  const cabecera = {
    v: 1, fuente: manifiesto.version, centro: centro.map(redondo), escala: redondo(escala),
    caja: [emin.map((x, a) => redondo((x - centro[a]) / escala)), emax.map((x, a) => redondo((x - centro[a]) / escala))],
    piezas: piezas.map(p => ({ id: p.id, v: p.pos.length / 3, i: p.ind.length }))
  };

  const bloques = [];
  let largo = 0;
  const sumar = buf => { bloques.push(buf); largo += buf.length; const r = (4 - largo % 4) % 4; if (r){ bloques.push(Buffer.alloc(r)); largo += r; } };
  const json = Buffer.from(JSON.stringify(cabecera));
  const cuenta = Buffer.alloc(4); cuenta.writeUInt32LE(json.length);
  sumar(cuenta); sumar(json);
  for (const p of piezas){
    const q = new Int16Array(p.pos.length);
    for (let k = 0; k < q.length; k++) q[k] = Math.round((p.pos[k] - centro[k % 3]) / escala * 32767);
    sumar(Buffer.from(q.buffer)); sumar(Buffer.from(p.nor.buffer)); sumar(Buffer.from(p.ind.buffer));
  }
  const archivo = path.join(salida, clave + '.bin');
  fs.writeFileSync(archivo, Buffer.concat(bloques));
  const tri = piezas.reduce((s, p) => s + p.ind.length / 3, 0);
  console.log(`${clave}: ${piezas.length} piezas, ${piezas.reduce((s, p) => s + p.mallas.length, 0)} mallas, ${tri} triángulos, ${(largo / 1024).toFixed(0)} KB`);
  if (process.env.DETALLE) for (const p of piezas) console.log('  ', p.id, p.pos.length / 3, p.mallas.join(' · '));
}
