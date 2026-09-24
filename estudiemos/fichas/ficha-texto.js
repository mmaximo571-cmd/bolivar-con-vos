/* ============================================================
   LA LÓGICA DE LAS FICHAS DE TEXTO DISEÑADAS (17/9/2026)

   Claude Design dibujó diecisiete de las fichas que llegaron como
   texto de NotebookLM. Las diecisiete traen EXACTAMENTE la misma clase:
   lo único que cambia es el dibujo (el <template> de cada carpeta) y
   qué .txt abre. Por eso la clase vive una sola vez, acá, y cada ficha
   dice su .txt en `window.FICHA_PROPS`.

   Viene tal cual del diseño salvo un renglón, marcado abajo.

   24/9/2026: EL DIBUJO PASA A SER EL DE LA APP. Las diecisiete tenían
   una hoja propia (Archivo, letra de terminal, sin modo oscuro) y se
   salían de la app: sin cabecera, sin barra de abajo. Ahora cargan
   `estilos.css` y `estilos-rediseno.css`, y la plantilla usa sus
   clases. Lo que cambió acá: los estilos sueltos pasan a clases
   (`cls`), los chips dicen `pressed`, y se pintan cabecera y pie.
   Los datos y el parser no se tocaron.
   ============================================================ */

/* La cabecera, el pie y la barra de abajo, como en cualquier pantalla. */
(function(){
  if (typeof htmlCabecera !== 'function') return;
  const cab = document.getElementById('cabecera');
  const pie = document.getElementById('pie');
  if (cab) cab.innerHTML = htmlCabecera();
  if (pie) pie.innerHTML = htmlPie();
  pintarNav('estudiemos');
})();
/* ------------------------------------------------------------
   LO QUE TE FALTA (24/9/2026)

   La portada dice cuántas partes viste, cuántas preguntas tenés bien y
   cuántas te faltan, y el botón te lleva a la próxima sin responder.
   Para eso cada ficha guarda en el teléfono sus respuestas y qué
   partes viste, en su propia clave (`bolivar-ficha-<nombre>`), como
   ya hace el repaso de Psicología. La huella sigue anotando la visita
   y el avance; esto es lo de adentro de la ficha.

   Se guarda también cuántas preguntas tenía: si el texto cambia y
   pasa a tener otra cantidad, las respuestas viejas no sirven y se
   descartan en vez de marcar mal las nuevas.
   ------------------------------------------------------------ */
const PARTES = [
  { id: "que-es", nombre: "Qué es" },
  { id: "como-funciona", nombre: "Cómo funciona" },
  { id: "preguntas", nombre: "Las preguntas" },
  { id: "aclarar", nombre: "Lo que falta aclarar" },
];

class Component extends DCLogic {
  state = { f: null, err: "", sel: {}, ans: {}, vistas: [] };

  clave() {
    return "bolivar-ficha-" + String(this.props.ficha || "").split("/").pop().replace(/\.txt$/, "");
  }
  leerGuardado(n) {
    try {
      const d = JSON.parse(localStorage.getItem(this.clave()) || "null");
      if (d && d.n === n) return d;
    } catch (e) {}
    return null;
  }
  guardar() {
    if (!this.state.f) return;
    try {
      localStorage.setItem(this.clave(), JSON.stringify({
        n: this.state.f.quiz.length, ans: this.state.ans, vistas: this.state.vistas,
      }));
    } catch (e) {}
  }

  /* Una parte cuenta como vista cuando está en pantalla: su título
     pasó por arriba del 60 % y todavía no se fue del todo por arriba.
     Mientras dura un salto de los botones no se mira nada: sin eso,
     «Probate» pasaba por Qué es y Cómo funciona y las daba por vistas.
     Se busca por id en cada vuelta porque cada toque redibuja la ficha
     y los nodos viejos ya no están. */
  mirarPartes() {
    if (!this.state.f || this.saltando) return;
    const limite = innerHeight * 0.6;
    const vistas = new Set(this.state.vistas);
    let cambio = false;
    PARTES.forEach((p, i) => {
      const el = document.getElementById(p.id);
      if (!el || vistas.has(i)) return;
      const r = el.getBoundingClientRect();
      if (r.top < limite && r.bottom > 0) { vistas.add(i); cambio = true; }
    });
    if (!cambio) return;
    this.setState({ vistas: Array.from(vistas).sort() });
    this.guardar();
  }

  /* Ir a una parte o a una pregunta. El foco va al primer botón de la
     pregunta, para quien usa teclado o lector de pantalla. */
  ir(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearTimeout(this.finSalto);
    this.saltando = true;
    this.finSalto = setTimeout(() => { this.saltando = false; this.mirarPartes(); }, quieto ? 50 : 1200);
    el.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
    const boton = el.querySelector(".ft-opcion");
    if (boton) boton.focus({ preventScroll: true });
  }

  componentDidMount() {
    this.load();
    let espera = null;
    addEventListener("scroll", () => {
      if (espera) return;
      espera = setTimeout(() => { espera = null; this.mirarPartes(); }, 250);
    }, { passive: true });
  }
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
      const f = mod.parseFicha(texto);
      const g = this.leerGuardado(f.quiz.length);
      this.setState({ f, err: "", sel: {}, ans: (g && g.ans) || {}, vistas: (g && g.vistas) || [] });
    } catch (e) {
      this.setState({ err: "Error al cargar la ficha: " + (e && e.message ? e.message : e) });
    }
  }

  renderVals() {
    const refs = this.props.showRefs !== false;
    const why = this.props.revealWhy !== false;
    const f = this.state.f;
    if (!f) return { err: this.state.err, loading: !this.state.err, listo: false };
    const { segs, paras } = this.mod;
    /* Negrita, [FALTA] y la cita de página, con los colores de la app:
       así se dan vuelta solos en oscuro. */
    const SS = {
      b: { fontWeight: 700 },
      c: { fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: "var(--superficie-2)", color: "var(--ambar)", padding: "1px 6px", borderRadius: "6px", whiteSpace: "nowrap" },
      r: { fontSize: "12px", color: "var(--texto-suave)", whiteSpace: "nowrap" },
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
          pressed: (this.state.sel[mi] || 0) === oi ? "true" : "false",
          onClick: () => this.setState((s) => ({ sel: Object.assign({}, s.sel, { [mi]: oi }) })),
        })),
      };
    });

    const quiz = f.quiz.map((q, qi) => {
      const picked = this.state.ans[qi];
      const done = !!picked;
      return {
        n: q.n,
        id: "pregunta-" + (qi + 1),
        text: q.text,
        answered: done && why,
        verdict: picked === q.correct ? "Correcto" : "Revisá esto",
        verdictCls: picked === q.correct ? "bien" : "mal",
        whyRt: rich(q.why),
        options: q.options.map((o) => ({
          letter: o.letter,
          text: o.text,
          cls: !done ? "" : o.letter === q.correct ? "bien" : o.letter === picked ? "mal" : "apagada",
          disabled: done ? "true" : "false",
          onClick: () => {
            if (this.state.ans[qi]) return;
            this.setState((s) => ({ ans: Object.assign({}, s.ans, { [qi]: o.letter }) }));
            this.guardar();
          },
        })),
      };
    });

    const answered = Object.keys(this.state.ans).length;
    const right = f.quiz.filter((q, i) => this.state.ans[i] === q.correct).length;
    const total = f.quiz.length;
    const faltan = total - answered;
    const mal = answered - right;

    /* El botón principal: lo que más te sirve hacer ahora. */
    const primeraSin = f.quiz.findIndex((q, i) => !this.state.ans[i]);
    const primeraMal = f.quiz.findIndex((q, i) => this.state.ans[i] && this.state.ans[i] !== q.correct);
    let accion;
    if (!total) accion = null;
    else if (faltan === total) accion = { txt: "Probate con las " + total + " preguntas", ir: "pregunta-1" };
    else if (faltan > 0) accion = { txt: faltan === 1 ? "Te falta 1 pregunta" : "Seguí con las " + faltan + " que faltan", ir: "pregunta-" + (primeraSin + 1) };
    else if (mal > 0) accion = { txt: mal === 1 ? "Mirá por qué erraste 1" : "Mirá por qué erraste " + mal, ir: "pregunta-" + (primeraMal + 1) };
    else accion = { txt: "Volver a hacer las preguntas", ir: "pregunta-1", borrar: true };

    const borrar = () => { this.setState({ ans: {} }); this.guardar(); };
    const noVista = PARTES.findIndex((p, i) => !this.state.vistas.includes(i));

    return {
      err: this.state.err,
      listo: true,
      titulo: f.portada.titulo,
      subtitulo: f.portada.subtitulo,
      entrada: f.portada.entrada,
      /* Las de Anatomo traen la cita del cuadernillo pegada a la materia */
      materia: f.portada.materia.replace(/\s*\([^)]*\)\s*$/, ""),
      pdfs: f.portada.pdfs,
      defParas: P(f.queEs.definicion),
      confundeParas: P(f.queEs.confunde),
      piezas: f.queEs.piezas.map((p, i) => ({ num: String(i + 1).padStart(2, "0"), name: p.name, rt: rich(p.text) })),
      machines,
      quiz,
      progress: answered + " de " + f.quiz.length + " respondidas · " + right + " bien",
      totalQuiz: f.quiz.length,
      pct: (f.quiz.length ? Math.round((right / f.quiz.length) * 100) : 0) + "%",
      pctW: (f.quiz.length ? Math.round((answered / f.quiz.length) * 100) : 0) + "%",
      nPiezas: String(f.queEs.piezas.length).padStart(2, "0"),
      nMachines: String(f.machines.length).padStart(2, "0"),
      nQuiz: String(f.quiz.length).padStart(2, "0"),
      rightTxt: right + "/" + f.quiz.length,
      estado: answered === 0 ? "Sin responder" : answered < f.quiz.length ? "En curso" : "Completa",
      nVistas: this.state.vistas.length + "/" + PARTES.length,
      nBien: right + "/" + total,
      nFaltan: String(faltan),
      hayAccion: !!accion,
      accionTxt: accion ? accion.txt : "",
      accion: () => { if (!accion) return; if (accion.borrar) borrar(); this.ir(accion.ir); },
      hayLeer: noVista >= 0 && noVista !== 2,
      leerTxt: noVista >= 0 ? "Seguir leyendo: " + PARTES[noVista].nombre : "",
      leer: () => { if (noVista >= 0) this.ir(PARTES[noVista].id); },
      hayRespuestas: answered > 0,
      borrar,
      aclarar: f.aclarar.map((a) => ({ name: a.name, rt: rich(a.text) })),
    };
  }
}
