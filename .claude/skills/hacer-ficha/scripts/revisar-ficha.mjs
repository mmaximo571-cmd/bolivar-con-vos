#!/usr/bin/env node
/* ============================================================
   REVISAR UNA FICHA DE TEXTO ANTES DE PUBLICARLA

   node .claude/skills/hacer-ficha/scripts/revisar-ficha.mjs estudiemos/fichas/textos/<id>.txt

   Lee el .txt con el MISMO parser que usa la app (ficha-parser.js), así
   que lo que este script no encuentra, la ficha tampoco lo va a mostrar:
   el parser no avisa, lo que no reconoce simplemente no sale.

   Separa dos cosas:
   - ERROR: la ficha sale rota o con un hueco (falta una sección, una
     pregunta sin respuesta correcta). Sale con código 1.
   - OJO: sale, pero algo no cumple el molde de PROMPT-FICHAS.md (un
     título de cuatro palabras, la correcta siempre en la B). Hay que
     mirarlo, no necesariamente cambiarlo.
   ============================================================ */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, "../../../..");
const { parseFicha } = await import(pathToFileURL(resolve(raiz, "estudiemos/fichas/ficha-parser.js")).href);

const ruta = process.argv[2];
if (!ruta) {
  console.error("Uso: node revisar-ficha.mjs estudiemos/fichas/textos/<id>.txt");
  process.exit(2);
}
const texto = readFileSync(resolve(process.cwd(), ruta), "utf8");
const f = parseFicha(texto);

const errores = [], ojos = [];
const err = (m) => errores.push(m);
const ojo = (m) => ojos.push(m);
const palabras = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const cita = /\(([^)]*\.pdf[^)]*|p[áa]g[^)]*)\)/i;

/* ---------- 0 · PORTADA ---------- */
const p = f.portada;
if (!p.titulo) err("Portada sin TÍTULO.");
else if (palabras(p.titulo) > 2) ojo(`El TÍTULO tiene ${palabras(p.titulo)} palabras («${p.titulo}»); el molde pide dos como máximo, va en letras enormes.`);
if (!p.subtitulo) err("Portada sin SUBTÍTULO.");
if (!p.entrada) ojo("Portada sin ENTRADA.");
if (!p.materia) err("Portada sin MATERIA.");
if (!p.pdfs) ojo("Portada sin PDF USADOS: sin eso no se sabe de dónde sale nada.");

/* ---------- 1 · QUÉ ES ---------- */
const q = f.queEs;
if (!q.definicion) err("«Qué es» sin DEFINICIÓN.");
if (!q.confunde) err("«Qué es» sin LO QUE MÁS SE CONFUNDE (es el recuadro amarillo).");
if (q.piezas.length < 3 || q.piezas.length > 6)
  ojo(`PIEZAS: hay ${q.piezas.length}, el molde pide entre 3 y 6. Si son 0, revisá que cada una sea «- **Nombre**: texto».`);
const piezasSinCita = q.piezas.filter((x) => !cita.test(x.text)).map((x) => x.name);
if (piezasSinCita.length) ojo(`Piezas sin cita de PDF y página: ${piezasSinCita.join(", ")}.`);

/* ---------- 2 · CÓMO FUNCIONA ---------- */
if (!f.machines.length) err("«Cómo funciona» sin máquinas. Cada una arranca con «MÁQUINA N · TÍTULO».");
else if (f.machines.length > 3) ojo(`Hay ${f.machines.length} máquinas; el molde pide dos o tres.`);
f.machines.forEach((m) => {
  if (m.options.length < 2) err(`Máquina ${m.n} («${m.name}»): ${m.options.length} opciones. Cada una va como «- **Nombre**: texto» debajo de POR CADA OPCIÓN.`);
  if (!m.elige) ojo(`Máquina ${m.n}: falta QUÉ SE ELIGE.`);
});

/* ---------- 3 · CÓMO TE DAS CUENTA ---------- */
if (f.quiz.length !== 8) (f.quiz.length ? ojo : err)(`Hay ${f.quiz.length} preguntas; el molde pide ocho.`);
const correctas = [];
f.quiz.forEach((pr) => {
  const letras = pr.options.map((o) => o.letter);
  if (pr.options.length !== 3) err(`Pregunta ${pr.n}: ${pr.options.length} opciones, tienen que ser tres (A, B, C).`);
  if (!pr.correct) err(`Pregunta ${pr.n}: sin «- CORRECTA: X».`);
  else if (!letras.includes(pr.correct)) err(`Pregunta ${pr.n}: la CORRECTA es ${pr.correct} y esa opción no existe.`);
  if (!pr.why) err(`Pregunta ${pr.n}: sin «- POR QUÉ:». Se muestra siempre y es lo que se estudia de esta parte.`);
  correctas.push(pr.correct);
});
/* Si la correcta cae casi siempre en la misma letra, se aprueba sin
   leer. Con ocho, más de cuatro en una letra ya es patrón. */
const cuenta = correctas.reduce((a, l) => ((a[l] = (a[l] || 0) + 1), a), {});
const masRepetida = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0];
if (masRepetida && masRepetida[1] > 4)
  ojo(`La correcta es la ${masRepetida[0]} en ${masRepetida[1]} de ${f.quiz.length} preguntas. Reordená las opciones (sin cambiar su texto) para repartirla.`);
/* Y al revés: si una letra nunca es la correcta, también se aprende
   a descartarla sin leer. */
const nunca = ["A", "B", "C"].filter((l) => !cuenta[l]);
if (f.quiz.length >= 6 && nunca.length)
  ojo(`La ${nunca.join(" y la ")} no ${nunca.length > 1 ? "son" : "es"} la correcta en ninguna pregunta. Repartí las correctas entre A, B y C (con ocho, 3/3/2).`);

/* La otra pista que regala la respuesta: la correcta es la opción más
   larga, porque es la única que se escribió con cuidado y las otras se
   inventaron para rellenar. Por azar pasaría en un tercio; en las 21
   fichas de NotebookLM (7/10/2026) pasaba en la mitad. Con cinco de
   ocho ya es patrón (por azar sale menos de una vez en diez). */
const masLarga = f.quiz.filter((pr) => {
  const largos = pr.options.map((o) => o.text.length);
  const max = Math.max(...largos);
  const c = pr.options.find((o) => o.letter === pr.correct);
  return c && c.text.length === max && largos.filter((l) => l === max).length === 1;
}).map((pr) => pr.n);
if (masLarga.length >= 5)
  ojo(`La correcta es la opción más larga en ${masLarga.length} de ${f.quiz.length} preguntas (${masLarga.join(", ")}): se adivina sin saber. Emparejá el largo de las opciones (ver «Las ocho preguntas» en SKILL.md).`);

/* ---------- 4 · LO QUE HAY QUE ACLARAR ---------- */
if (!f.aclarar.length)
  ojo("«Lo que hay que aclarar» vacío o sin formato «- **Tema**: texto». Que una ficha no lo diga es el único cambio grave según el molde.");

/* ---------- LO QUE QUEDÓ ABIERTO ---------- */
const faltas = (texto.match(/\[FALTA\]/g) || []).length;
const noCoinciden = (texto.match(/no coinciden/gi) || []).length;

/* ---------- EL INFORME ---------- */
console.log(`Ficha: ${p.titulo || "(sin título)"} · ${p.materia || "(sin materia)"}`);
console.log(`  ${q.piezas.length} piezas · ${f.machines.length} máquinas (${f.machines.map((m) => m.options.length).join("/")} opciones) · ${f.quiz.length} preguntas · ${f.aclarar.length} cosas para aclarar`);
console.log(`  Correctas: ${correctas.join(" ") || "-"} · la más larga en ${masLarga.length} de ${f.quiz.length}`);
console.log(`  [FALTA]: ${faltas} · «no coinciden»: ${noCoinciden}`);
if (errores.length) { console.log("\nERROR (la ficha sale rota):"); errores.forEach((m) => console.log("  - " + m)); }
if (ojos.length) { console.log("\nOJO (sale, pero no cumple el molde):"); ojos.forEach((m) => console.log("  - " + m)); }
if (!errores.length && !ojos.length) console.log("\nTodo en orden.");
process.exit(errores.length ? 1 : 0);
