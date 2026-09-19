/* ============================================================
   LOS VIDEOS DE UN MINUTO (18/9/2026)

   La lista de lo que se ve en `estudiemos/videos/`. Cada video es un
   archivo que vive en esta misma carpeta y se publica con la app (no
   en Supabase: el plan gratis de Supabase da 5 GB de tráfico por mes,
   unas 600 reproducciones; Vercel da 100 GB).

   Para sumar uno:
     1. El .mp4 a esta carpeta, en vertical (9:16), 720 px de ancho,
        H.264 + AAC. Un minuto así pesa entre 5 y 8 MB. Lo que sale del
        celular pesa diez veces más: hay que achicarlo antes.
     2. La portada, un .jpg del mismo nombre (un cuadro del video, 720
        de ancho). Si no hay, la tarjeta muestra el título en grande.
     3. Un renglón acá abajo. `id` es lo que va en el link para
        compartir (…/videos/#v=el-id): minúsculas y guiones, y no se
        cambia después de publicado, porque rompe los links ya enviados.
        `segundos` es la duración: la tarjeta la muestra antes de
        bajar nada.

   Los que están arriba aparecen primero.

   Esta lista la lee también `estudiemos/index.html`: mientras esté
   vacía, la puerta de los videos no se muestra.
   ============================================================ */
/* Los primeros siete (18/9/2026) vienen de los reels de Instagram de
   la agrupación: ya estaban en 720×1280, H.264, con el índice adelante,
   así que entraron sin achicar. Las portadas son un cuadro de cada uno
   (a los 2 s, donde casi todos tienen el cartel del título). */
window.VIDEOS = [
  { id: 'trabajo-social-1',
    archivo: 'trabajo-social-1.mp4', portada: 'trabajo-social-1.jpg',
    titulo: 'Trabajo Social I en un minuto',
    materia: 'Trabajo Social I', segundos: 67 },
  { id: 'anatomia',
    archivo: 'anatomia.mp4', portada: 'anatomia.jpg',
    titulo: 'Anatomía en un minuto',
    materia: 'Anatomofisiología fonoaudiológica', segundos: 69 },
  { id: 'audiologia-1',
    archivo: 'audiologia.mp4', portada: 'audiologia.jpg',
    titulo: 'Audiología en un minuto: el oído externo',
    materia: 'Audiología y comunicación', segundos: 62 },
  { id: 'audiologia-2',
    archivo: 'audiologia-2.mp4', portada: 'audiologia-2.jpg',
    titulo: 'Audiología en un minuto, parte 2',
    materia: 'Audiología y comunicación', segundos: 50 },
  { id: 'bases-por-donde-arrancar',
    archivo: 'bases.mp4', portada: 'bases.jpg',
    titulo: 'Por dónde arrancar a estudiar Bases: las cortezas',
    materia: 'Bases neuropsicológicas de la comunicación', segundos: 105 },
  { id: 'tamaroff-allegri-2',
    archivo: 'tamaroff-allegri-parte-2.mp4', portada: 'tamaroff-allegri-parte-2.jpg',
    titulo: 'El esquema de Tamaroff y Allegri, parte 2',
    materia: 'Bases neuropsicológicas de la comunicación', segundos: 148 },
  { id: 'afasias-2',
    archivo: 'procesos-parte-2.mp4', portada: 'procesos-parte-2.jpg',
    titulo: 'Afasias en un minuto, parte 2',
    materia: 'Procesos lingüísticos y comunicación', segundos: 94 }
];
