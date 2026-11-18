# Sesión 0 · El arranque

## Antes (lo hace una persona, unos 20 minutos)

1. **GitHub:** crear un repositorio vacío, por ejemplo `nombre-app`.
2. **Supabase:** crear un proyecto nuevo (región São Paulo, la más
   cercana). Anotar la URL del proyecto y la clave **publicable**
   (Project Settings → API Keys). **La secreta no se copia a ningún
   lado.**
3. **Vercel:** «Add New Project» → importar el repositorio de GitHub.
   Sin framework, sin comando de build, carpeta raíz la del repositorio.
   Desde ahí cada push a `main` se publica solo.
4. Copiar esta carpeta `kit-artes/` entera a `docs/kit/` del repositorio
   nuevo, con la ficha ya llena.

## El prompt

```
TAREA: Sesión 0 del proyecto. Dejar el repositorio listo para trabajar.

LEÉ PRIMERO, en este orden:
- docs/kit/LEEME.md
- docs/kit/00-ficha-del-proyecto.md (los datos de esta agrupación)
- docs/kit/05-plan-de-sesiones.md (solo la tabla «Hasta el lanzamiento»)

HACÉ:
1. Copiá docs/kit/plantillas/CLAUDE.md a la raíz como CLAUDE.md y
   reemplazá cada {{…}} con lo de la ficha. Lo que la ficha tenga como
   FALTA:, dejalo como FALTA:.
2. Copiá docs/kit/plantillas/BITACORA.md a la raíz y llenalo igual.
3. Creá docs/HISTORIAL-SW.md con un encabezado y una tabla vacía
   (número, fecha, por qué).
4. Creá la estructura de carpetas de docs/kit/01-arquitectura.md,
   «Las carpetas», con un .gitkeep donde haga falta. No escribas
   todavía CSS ni JS.
5. Creá config.js con la URL y la clave publicable de Supabase que te
   paso abajo, y un comentario que diga por qué la clave publicable va
   en el repositorio y la secreta no.
6. Creá .gitignore (sistema, editores, temporales) y .vercelignore con
   docs/ adentro, para que la carpeta de documentación no se publique.
7. Un index.html mínimo que diga el nombre de la app, para comprobar
   que Vercel publica.

NO:
- No escribas estilos, app.js ni pantallas: eso es de las sesiones 1 y 2.
- No completes ningún FALTA: con algo parecido.

TERMINADO CUANDO: el push a main se ve publicado en la dirección de
Vercel, y CLAUDE.md no tiene ningún {{…}} sin reemplazar.

DATOS:
URL de Supabase: <pegar>
Clave publicable: <pegar>
Dirección de Vercel: <pegar>
```

## Después

- Abrir la dirección de Vercel en el teléfono.
- Si la sesión es en la nube, conviene pedirle a Claude que guarde la
  instalación de herramientas (por ejemplo un servidor local) en la
  configuración del entorno, para no repetirla cada sesión.
