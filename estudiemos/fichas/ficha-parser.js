// Parser for the fixed "ficha" text format used by the Fonoaudiología study sheets.
// Sections: 0 PORTADA · 1 QUÉ ES · 2 CÓMO FUNCIONA · 3 CÓMO TE DAS CUENTA · 4 LO QUE HAY QUE ACLARAR

const SPLIT = /(\*\*[^*]+\*\*|`[^`]+`|\(pág[^)]*\))/g;

export function segs(s) {
  if (!s) return [];
  return String(s)
    .split(SPLIT)
    .filter(Boolean)
    .map((t) => {
      if (t.startsWith("**") && t.endsWith("**")) return { k: "b", t: t.slice(2, -2) };
      if (t.startsWith("`") && t.endsWith("`")) return { k: "c", t: t.slice(1, -1).replace(/[[\]]/g, "") };
      if (t.startsWith("(p")) return { k: "r", t: t };
      return { k: "p", t: t };
    });
}

export function paras(s) {
  return String(s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => segs(x));
}

function kv(block) {
  const out = [];
  let key = null;
  let buf = [];
  const flush = () => { if (key) out.push([key, buf.join("\n").trim()]); };
  for (const ln of block) {
    const m = /^-\s+([^:]{2,42}):\s*(.*)$/.exec(ln);
    if (m) { flush(); key = m[1].trim(); buf = m[2] ? [m[2]] : []; }
    else if (key && ln.trim()) buf.push(ln.trim());
  }
  flush();
  return out;
}
const get = (pairs, ...keys) => {
  for (const k of keys) { const hit = pairs.find((p) => p[0] === k); if (hit) return hit[1]; }
  return "";
};

function namedList(text) {
  const items = [];
  for (const raw of String(text).split("\n")) {
    const ln = raw.trim();
    if (!ln) continue;
    const m = /^(?:-|\*|\d+\.)\s*\*\*([^*]+)\*\*\s*:?\s*(.*)$/.exec(ln);
    if (m) items.push({ name: m[1].trim(), text: m[2].trim() });
    else if (items.length) items[items.length - 1].text += " " + ln;
  }
  return items;
}

export function parseFicha(text) {
  const lines = String(text).replace(/\r/g, "").split("\n");
  const secs = {};
  let cur = null;
  for (const ln of lines) {
    const m = /^(\d)\s*·\s*(.+)$/.exec(ln.trim().replace(/^#+\s*/, ""));
    if (m) { cur = m[1]; secs[cur] = []; continue; }
    if (cur !== null) secs[cur].push(ln);
  }

  const p0 = kv(secs["0"] || []);
  const portada = {
    titulo: get(p0, "TÍTULO", "TITULO"),
    subtitulo: get(p0, "SUBTÍTULO", "SUBTITULO"),
    entrada: get(p0, "ENTRADA"),
    materia: get(p0, "MATERIA"),
    pdfs: get(p0, "PDF USADOS")
      .split("\n")
      .map((x) => x.replace(/^[-*\s]+/, "").replace(/-{2,}\s*$/, "").trim())
      .filter(Boolean)
      .join(" · "),
  };

  const p1 = kv(secs["1"] || []);
  const queEs = {
    definicion: get(p1, "DEFINICIÓN", "DEFINICION"),
    confunde: get(p1, "LO QUE MÁS SE CONFUNDE", "LO QUE MAS SE CONFUNDE"),
    piezas: namedList(get(p1, "PIEZAS")),
  };

  const maquinas = [];
  let mBlock = null;
  for (const ln of secs["2"] || []) {
    const h = /^MÁQUINA\s*(\d+)\s*·\s*(.+)$/i.exec(ln.trim().replace(/^#+\s*/, ""));
    if (h) { mBlock = { n: h[1], name: h[2].trim(), lines: [] }; maquinas.push(mBlock); continue; }
    if (mBlock) mBlock.lines.push(ln);
  }
  const machines = maquinas.map((m) => {
    const pr = kv(m.lines);
    const opts = namedList(get(pr, "POR CADA OPCIÓN", "POR CADA OPCION"));
    return {
      n: m.n,
      name: m.name,
      elige: get(pr, "QUÉ SE ELIGE", "QUE SE ELIGE"),
      esquema: get(pr, "ESQUEMA"),
      options: opts,
    };
  });

  const quiz = [];
  let q = null;
  for (const raw of secs["3"] || []) {
    const ln = raw.trim().replace(/^#+\s*/, "");
    if (!ln) continue;
    const qm = /^(\d+)\.\s*(.+)$/.exec(ln);
    const om = /^([A-Z])\)\s*(.+)$/.exec(ln);
    const cm = /^-\s*CORRECTA:\s*([A-Z])/.exec(ln);
    const wm = /^-\s*(?:POR QU[ÉE]|WHY):\s*(.+)$/.exec(ln);
    if (qm) { q = { n: qm[1], text: qm[2], options: [], correct: "", why: "" }; quiz.push(q); }
    else if (!q) continue;
    else if (om) q.options.push({ letter: om[1], text: om[2] });
    else if (cm) q.correct = cm[1];
    else if (wm) q.why = wm[1];
    else if (q.why) q.why += " " + ln;
    else if (q.options.length) q.options[q.options.length - 1].text += " " + ln;
    else q.text += " " + ln;
  }

  const aclarar = namedList((secs["4"] || []).map((l) => l.replace(/^#+\s*/, "")).join("\n"));

  return { portada, queEs, machines, quiz, aclarar };
}
