# El Trayecto Optativo: qué tiene que decir la pantalla

Esto no es un molde: es **el contenido de una pantalla sola**, la del
Trayecto Optativo, para diseñarla con Claude Design.

El molde sigue siendo `PROMPT-DISENO.md`. **Primero se pega el bloque de
«Para copiar y pegar antes de cada pedido»**, y después lo de acá abajo.
Sin eso vuelve React con Tailwind y hay que traducirlo.

---

## Por qué existe esta pantalla

El Trayecto Optativo **no es una materia**. En el plan figura como una
—código `255`, 120 horas, 5.º año— y la app lo dibuja como una, porque
el mapa de correlativas dibuja materias. Pero no se cursa ni se rinde:
**son actividades que se acreditan**.

O sea que el estudiante que llega a 5.º año ve un casillero que dice
«Trayecto optativo» y no tiene dónde averiguar qué hacer con él. La app
no lo explica en ninguna parte. **Eso es lo que arregla esta pantalla.**

## Lo que sabemos, y es poco

| Dato | Valor |
|---|---|
| Código | `255` |
| Horas | 120 |
| Año | 5.º |
| Cómo figura en el plan | «libre» (no es cursada ni final) |
| Qué es en realidad | actividades que se acreditan |

**Todo lo demás es `[FALTA]`.** Va la misma regla que en
`PROMPT-FICHAS.md` y por el mismo motivo: esto lo lee alguien para
resolver un trámite de su carrera. **Si no lo sabemos, la pantalla
escribe que no lo sabemos y manda a Alumnado.** Un requisito inventado
con seguridad le hace perder a alguien un cuatrimestre.

## Las seis preguntas que la pantalla tiene que contestar

En este orden, que es el orden en que le aparecen al estudiante:

1. **¿Qué es?** Una línea. No «según la Res. N.º…»: qué es, en
   castellano.
2. **¿Cuándo me toca?** Si son 120 horas de 5.º año, ¿se puede empezar a
   juntar antes? `[FALTA]`
3. **¿Qué actividades cuentan?** La lista. Seminarios, congresos,
   voluntariados, ayudantías, publicaciones, cursos de otra facultad:
   `[FALTA]` cuáles sí y cuáles no.
4. **¿Cuántas horas vale cada una?** `[FALTA]` — es la pregunta que
   todos hacen y la más difícil de contestar de memoria.
5. **¿Cómo se acredita?** Dónde se presenta, con qué papel, en qué
   ventanilla, en qué fechas. `[FALTA]`
6. **¿A quién le pregunto?** Esto sí lo tenemos: Alumnado, y el CEFTS.
   Va siempre, incluso cuando los otros cinco estén completos: es la
   salida para lo que la pantalla no previó.

## Cómo tiene que verse (lo que no se negocia)

- **Se lee sin señal.** Igual que el glosario: el texto va en el HTML de
  la pantalla, no en Supabase. Es reglamento, no cambia de un mes al
  otro, y se consulta en el pasillo antes de entrar a Alumnado.
- **Cada pregunta con su respuesta corta arriba** y el detalle abajo.
  Así quedó el glosario y funciona: se barre de un vistazo.
- **Lo que falta se ve que falta.** Un renglón que diga «esto todavía no
  lo tenemos confirmado, preguntá en Alumnado» vale más que una
  respuesta linda y dudosa.
- **Nada de celeste.** No es color de marca.

## Dónde va a entrar, para que salga del tamaño correcto

Es una pantalla propia —`trayecto/`—, del mismo tipo que `glosario/`:
no es una sección, se llega por una tarjeta. Va a tener **tres puertas**,
que es lo que aprendimos con el glosario cuando tuvo una sola:

1. una ficha en **Info útil**,
2. el **índice del pie**, que está en las doce pantallas,
3. y **el casillero del plan en «Mi año»**, que es donde la pregunta
   aparece de verdad.

Esa parte —las tres puertas y el HTML final— es trabajo de esta máquina.
Lo que hace falta traer de afuera es **el contenido y el dibujo**: el
`.dc.html` bajado a mano, que el MCP de Claude Design no está autorizado
en esta app de escritorio.
