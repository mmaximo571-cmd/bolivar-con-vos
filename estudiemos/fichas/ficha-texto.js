/* ============================================================
   LA LÓGICA DE LAS FICHAS DE TEXTO DISEÑADAS (17/9/2026)

   Claude Design dibujó diecisiete de las fichas que llegaron como
   texto de NotebookLM. Las diecisiete traen EXACTAMENTE la misma clase:
   lo único que cambia es el dibujo (el <template> de cada carpeta) y
   qué .txt abre. Por eso la clase vive una sola vez, acá, y cada ficha
   dice su .txt en `window.FICHA_PROPS`.

   Viene tal cual del diseño salvo un renglón, marcado abajo.
   ============================================================ */
class Component extends DCLogic {
  state = { f: null, err: "", sel: {}, ans: {} };

  componentDidMount() { this.load(); }
  componentDidUpdate(prev) { if (prev.ficha !== this.props.ficha) this.load(); }

  async load() {
    const path = this.props.ficha || "uploads/ficha-modulo-1-embriologia-general-a470208e.txt";
    try {
      const [mod, res] = await Promise.all([import("./ficha-parser.js"), fetch(path)]);
      if (!res.ok) throw new Error("No se pudo leer " + path);
      this.mod = mod;
      /* LO ÚNICO AGREGADO. Las fichas de Anatomo citan «(CUADERNILLO X.pdf, pág. 82)»
         y el parser solo reconoce «(pág. 82)» como cita: sin esto el nombre del PDF
         entero quedaba metido en el texto, en letra normal. */
      const texto = (await res.text()).replace(/\(([^()]*?\.pdf),\s*(p[áa]gs?\.[^)]*)\)/gi, "($2)");
      this.setState({ f: mod.parseFicha(texto), err: "", sel: {}, ans: {} });
    } catch (e) {
      this.setState({ err: "Error al cargar la ficha: " + (e && e.message ? e.message : e) });
    }
  }

  renderVals() {
    const refs = this.props.showRefs !== false;
    const why = this.props.revealWhy !== false;
    const f = this.state.f;
    if (!f) return { err: this.state.err, loading: true, materia: "", titulo: "", subtitulo: "", entrada: "", pdfs: "", progress: "", pct: "0%", pctW: "0%", nPiezas: "—", nMachines: "—", nQuiz: "—", rightTxt: "—", estado: "Cargando" };
    const { segs, paras } = this.mod;
    const SS = {
      b: { fontWeight: 800 },
      c: { fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "11px", letterSpacing: ".08em", background: "var(--color-accent)", color: "var(--color-bg)", padding: "1px 5px", whiteSpace: "nowrap" },
      r: { fontSize: "11px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" },
      p: null,
    };
    const el = (arr) =>
      React.createElement(
        "span",
        null,
        (arr || [])
          .filter((s) => refs || s.k !== "r")
          .map((s, i) =>
            s.k === "p" ? s.t : React.createElement("span", { key: i, style: SS[s.k] }, s.k === "r" ? " " + s.t : s.t)
          )
      );
    const rich = (s) => el(segs(s));
    const P = (s) => paras(s).map((a) => ({ rt: el(a) }));

    const machines = f.machines.map((m, mi) => {
      const active = m.options[this.state.sel[mi] || 0] || { name: "", text: "" };
      return {
        n: m.n,
        name: m.name,
        eligeRt: rich(m.elige),
        esquemaRt: rich(m.esquema),
        activeName: active.name,
        activeRt: rich(active.text),
        buttons: m.options.map((o, oi) => ({
          label: o.name,
          cls: (this.state.sel[mi] || 0) === oi ? "btn-primary" : "btn-secondary",
          onClick: () => this.setState((s) => ({ sel: Object.assign({}, s.sel, { [mi]: oi }) })),
        })),
      };
    });

    const optStyle = (state) => {
      const base = {
        display: "flex", gap: "12px", alignItems: "flex-start", width: "100%",
        minHeight: "48px", padding: "12px 14px", cursor: "pointer",
        border: "1px solid var(--color-divider)", background: "transparent",
        color: "var(--color-text)", fontFamily: "var(--font-body)", borderRadius: "0",
      };
      if (state === "correct") return Object.assign(base, { background: "var(--color-text)", color: "var(--color-bg)", borderColor: "var(--color-text)" });
      if (state === "wrong") return Object.assign(base, { background: "var(--color-accent-200)", borderColor: "var(--color-accent)", borderWidth: "2px" });
      if (state === "dim") return Object.assign(base, { opacity: 0.45, cursor: "default" });
      return base;
    };

    const quiz = f.quiz.map((q, qi) => {
      const picked = this.state.ans[qi];
      const done = !!picked;
      return {
        n: q.n,
        text: q.text,
        answered: done && why,
        verdict: picked === q.correct ? "Correcto" : "Revisá esto",
        verdictCls: picked === q.correct ? "tag-neutral" : "tag-accent",
        whyRt: rich(q.why),
        options: q.options.map((o) => ({
          letter: o.letter,
          text: o.text,
          style: optStyle(!done ? "" : o.letter === q.correct ? "correct" : o.letter === picked ? "wrong" : "dim"),
          onClick: () => { if (!this.state.ans[qi]) this.setState((s) => ({ ans: Object.assign({}, s.ans, { [qi]: o.letter }) })); },
        })),
      };
    });

    const answered = Object.keys(this.state.ans).length;
    const right = f.quiz.filter((q, i) => this.state.ans[i] === q.correct).length;

    return {
      err: this.state.err,
      titulo: f.portada.titulo,
      subtitulo: f.portada.subtitulo,
      entrada: f.portada.entrada,
      materia: f.portada.materia,
      pdfs: f.portada.pdfs,
      defParas: P(f.queEs.definicion),
      confundeParas: P(f.queEs.confunde),
      piezas: f.queEs.piezas.map((p, i) => ({ num: String(i + 1).padStart(2, "0"), name: p.name, rt: rich(p.text) })),
      machines,
      quiz,
      progress: answered + "/" + f.quiz.length + " · " + right + " correctas",
      pct: (f.quiz.length ? Math.round((right / f.quiz.length) * 100) : 0) + "%",
      pctW: (f.quiz.length ? Math.round((answered / f.quiz.length) * 100) : 0) + "%",
      nPiezas: String(f.queEs.piezas.length).padStart(2, "0"),
      nMachines: String(f.machines.length).padStart(2, "0"),
      nQuiz: String(f.quiz.length).padStart(2, "0"),
      rightTxt: right + "/" + f.quiz.length,
      estado: answered === 0 ? "Sin responder" : answered < f.quiz.length ? "En curso" : "Completa",
      aclarar: f.aclarar.map((a) => ({ name: a.name, rt: rich(a.text) })),
    };
  }
}
