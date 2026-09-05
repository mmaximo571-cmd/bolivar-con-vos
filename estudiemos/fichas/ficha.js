/* ============================================================
   EL MOTOR DE LAS FICHAS

   Las fichas de estudio se diseñaron en Claude Design, que las corre
   con su propio andamio: la plantilla trae `<sc-for>`, `<sc-if>` y
   agujeros `{{ asi }}`, y al lado viene una clase con los datos y con
   qué pasa cuando tocás un chip.

   Fuera de Claude Design ese andamio no existe, así que las fichas no
   arrancan. Esto es el andamio, reescrito chiquito: unas ciento
   cincuenta líneas que entienden ese puñado de etiquetas y nada más.

   POR QUÉ UN MOTOR Y NO REESCRIBIR CADA FICHA A MANO. Son ocho fichas
   con ocho máquinas de estado distintas —cartílagos, niveles, lóbulos,
   preguntas—. Reescribirlas de a una es reescribir contenido de
   anatomía ochenta veces, y cada vez es una oportunidad de equivocarse
   en algo que después una estudiante estudia. Así el contenido pasa
   tal cual vino: lo único que cambia es quién lo dibuja.

   Lo que entiende:
     <sc-for list="{{ lista }}" as="x">  repite lo de adentro
     <sc-if value="{{ cosa }}">          lo muestra sólo si es cierto
     {{ camino.al.dato }}                en texto y en atributos
     onClick="{{ handler }}"             engancha la función

   No hay evaluación de expresiones: sólo caminos con puntos, `true`,
   `false` y números. Si algún día una ficha necesita más que eso, se
   agranda acá y no en las ocho.
   ============================================================ */

/* La clase de la que heredan todas las fichas. Cada una define su
   `state`, su `renderVals()` y, si quiere, los tres ganchos de ciclo
   de vida. Es la misma forma que usa Claude Design, para que el código
   de la ficha entre sin tocarle una coma. */
window.DCLogic = class DCLogic {
  setState(parche){
    Object.assign(this.state, parche);
    dibujar(this);
    if (this.componentDidUpdate) this.componentDidUpdate();
  }
};

/* ------------------------------------------------------------
   LEER UN AGUJERO

   `{{ q.opts }}` es un camino, no una expresión. Se busca primero en
   el ámbito del bucle —la `q` de un `sc-for`— y si ahí no está, en lo
   que devolvió `renderVals()`. Ese orden importa: adentro de un bucle,
   la variable del bucle gana.
   ------------------------------------------------------------ */
function soloAgujero(texto){
  const m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(texto || '');
  return m ? m[1] : null;
}

function leer(camino, V, ambito){
  if (camino == null) return undefined;
  if (camino === 'true')  return true;
  if (camino === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(camino)) return Number(camino);

  const partes = camino.split('.');
  let valor = (partes[0] in ambito) ? ambito : V;
  for (const p of partes){
    if (valor == null) return undefined;
    valor = valor[p];
  }
  return valor;
}

/* Un texto puede tener varios agujeros y texto alrededor, como en
   `background:{{ c.bg }};color:{{ c.fg }}`. */
function rellenar(texto, V, ambito){
  return texto.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, camino) => {
    const v = leer(camino.trim(), V, ambito);
    return (v === undefined || v === null) ? '' : String(v);
  });
}

/* ------------------------------------------------------------
   PASAR LA PLANTILLA A NODOS DE VERDAD

   Se clona nodo por nodo en vez de tocar la plantilla: la plantilla
   tiene que quedar intacta para el próximo dibujo.

   El clon es `cloneNode(false)` —superficial— a propósito. Los
   esquemas son SVG, y ahí el nombre de la etiqueta lleva mayúsculas
   que importan (`linearGradient`) y el espacio de nombres también. Un
   `createElement` con el nombre en minúscula deja el dibujo en blanco;
   clonar se trae las dos cosas bien puestas.
   ------------------------------------------------------------ */
function pasar(nodos, V, ambito, cuenta){
  const trozo = document.createDocumentFragment();

  for (const n of nodos){
    /* Texto */
    if (n.nodeType === 3){
      trozo.appendChild(document.createTextNode(rellenar(n.nodeValue, V, ambito)));
      continue;
    }
    /* Los comentarios del diseño no hacen falta en la página */
    if (n.nodeType !== 1) continue;

    const etiqueta = n.localName;

    /* El bucle: por cada elemento de la lista, todo lo de adentro otra
       vez, con la variable del bucle sumada al ámbito. */
    if (etiqueta === 'sc-for'){
      const lista = leer(soloAgujero(n.getAttribute('list')), V, ambito);
      const nombre = n.getAttribute('as') || 'it';
      (Array.isArray(lista) ? lista : []).forEach(item => {
        const dentro = Object.assign({}, ambito);
        dentro[nombre] = item;
        trozo.appendChild(pasar(n.childNodes, V, dentro, cuenta));
      });
      continue;
    }

    /* El condicional: o está entero, o no está. */
    if (etiqueta === 'sc-if'){
      if (leer(soloAgujero(n.getAttribute('value')), V, ambito)){
        trozo.appendChild(pasar(n.childNodes, V, ambito, cuenta));
      }
      continue;
    }

    const el = n.cloneNode(false);

    for (const at of Array.from(n.attributes)){
      /* Pistas para el editor de Claude Design; en la página sobran */
      if (at.name === 'hint-placeholder-count' || at.name === 'hint-placeholder-val'){
        el.removeAttribute(at.name);
        continue;
      }
      if (!at.value.includes('{{')) continue;

      /* El handler. Se saca el atributo ANTES de que el nodo entre a la
         página: si entrara con `onclick="{{ c.go }}"` puesto, el
         navegador intentaría ejecutar eso como código y tiraría error
         en cada clic. */
      if (at.name === 'onclick'){
        const fn = leer(soloAgujero(at.value), V, ambito);
        el.removeAttribute('onclick');
        if (typeof fn === 'function'){
          el.addEventListener('click', ev => { ev.preventDefault(); fn(); });
          /* Para devolverle el foco al mismo botón después de redibujar */
          el.setAttribute('data-foco', String(cuenta.n++));
        }
        continue;
      }

      el.setAttribute(at.name, rellenar(at.value, V, ambito));
    }

    el.appendChild(pasar(n.childNodes, V, ambito, cuenta));
    trozo.appendChild(el);
  }

  return trozo;
}

/* ------------------------------------------------------------
   DIBUJAR

   Se redibuja todo de una. Es una página de estudio, no una planilla:
   el árbol es chico y rehacerlo entero sale más barato que mantener un
   diff, y sobre todo no se desincroniza nunca.

   Lo único que hay que sostener a mano es el foco del teclado. Sin
   esto, quien navega con tabulador toca un chip y el foco se le va al
   principio de la página en cada respuesta.
   ------------------------------------------------------------ */
function dibujar(comp){
  const activo = document.activeElement;
  const foco = activo && activo.getAttribute ? activo.getAttribute('data-foco') : null;

  const V = comp.renderVals();
  const cuenta = { n: 0 };
  const nuevo = pasar(comp._plantilla.content.childNodes, V, {}, cuenta);

  comp._destino.replaceChildren(nuevo);

  if (foco != null){
    const vuelve = comp._destino.querySelector('[data-foco="' + foco + '"]');
    if (vuelve) vuelve.focus();
  }
}

/* ------------------------------------------------------------
   ARRANCAR

   La ficha define `Component`; acá se la enchufa a la plantilla y al
   lugar donde va dibujada.
   ------------------------------------------------------------ */
window.arrancarFicha = function(){
  const plantilla = document.getElementById('plantilla');
  const destino   = document.getElementById('ficha');
  if (!plantilla || !destino || typeof Component !== 'function') return;

  const comp = new Component();
  comp._plantilla = plantilla;
  comp._destino   = destino;

  dibujar(comp);
  if (comp.componentDidMount) comp.componentDidMount();

  /* Las fichas enganchan un IntersectionObserver para que los bloques
     aparezcan al bajar. Si alguien se va de la página, se corta. */
  window.addEventListener('pagehide', () => {
    if (comp.componentWillUnmount) comp.componentWillUnmount();
  });
};
