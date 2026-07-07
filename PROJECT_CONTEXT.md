# Contexto del proyecto — Baby Shower Máximo

> Este archivo se mantiene actualizado automáticamente cada vez que tomamos una decisión importante sobre el proyecto. Es la fuente de verdad sobre el estado actual (no sobre el histórico — para eso está `git log`).

Última actualización: 2026-07-07 (pase de diseño Disney/Pixar en curso)

## Qué es

Invitación web animada de una sola página para el baby shower de **Máximo** (Sábado 5 de Septiembre, 2026, 16:00 hrs, Caleta de Camarones 0680, Maipú, Santiago). Incluye countdown, reveal del nombre, confirmación de asistencia por WhatsApp, botón de ubicación (Google Maps), botón de agregar a calendario, formulario de "deseo para Máximo", reproductor de música de fondo y animaciones GSAP/Lenis con acentos ilustrados estilo acuarela (elefante bebé, globos, globo aerostático).

## Infraestructura y despliegue (ACTUAL — reemplaza cualquier referencia a Netlify)

- **Hosting: Cloudflare Pages** (Netlify ya NO se usa como plataforma principal).
- **Dominio:** `bienvenidomaximo.uk`
- **Repositorio principal:** GitHub — `Armandozki/baby-shower-maximo` (rama `main`)
- **CI/CD:** cada push a `main` dispara un deploy automático en Cloudflare Pages.
- **Formulario "Escribe tu deseo para Máximo":**
  - Ya no usa Netlify Forms.
  - Ahora usa una **Cloudflare Pages Function**: [functions/api/wish.js](functions/api/wish.js)
  - Reenvía el mensaje directo a **Telegram** vía `sendMessage` de la Bot API.
  - Variables de entorno `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` ya están configuradas en Cloudflare Pages (Production y Preview).
  - El front-end (`script.js` → `initWishForm`) hace `fetch("/api/wish", { method: "POST" })`, consistente con la function actual.

### Restos de la migración desde Netlify (pendiente decidir si se eliminan)

Estos archivos quedaron del setup anterior y ya no están en uso, pero siguen en el repo:
- [netlify.toml](netlify.toml) — config de build/headers para Netlify.
- [netlify/functions/notify-telegram.js](netlify/functions/notify-telegram.js) — versión anterior del webhook de Telegram, pensada para Netlify Forms outgoing webhooks. Reemplazada por `functions/api/wish.js`.

No se han borrado todavía porque no se ha confirmado explícitamente que deban eliminarse — quedan documentados aquí para no perder el hilo.

## Estado visual/diseño

- Paleta actual: azul/celeste saturado, no pastel (`--color-primary: #0e7c9e`, `--color-secondary: #4fc1e0` — actualizado 2026-07-07 a pedido del usuario, antes eran tonos mucho más suaves/pastel), fondo casi blanco, sombras suaves, tipografía Fraunces (display) + Poppins (body).
- Se corrigió un bug de **z-index** que ocultaba las decoraciones SVG (elefante, globos, estrellas, etc.) detrás del fondo de otras secciones. Fix: cada `<section>` usa `isolation: isolate` para crear su propio contexto de apilamiento, y `.decor` usa `z-index: -1` relativo a esa sección (ver `styles.css`, commit `cbc8615`).
- Animaciones vivas ya implementadas: oreja del elefante moviéndose, parpadeo, flotación de globos/nubes, parallax sutil en el hero, confeti en la sección final, reveal de texto palabra por palabra.

## Assets

La carpeta `assets/` ya existe en el repo:
- `assets/hero.jpg` — miniatura 9:16 (501×888) tomada del primer frame del video de bienvenida (globos celestes + banderines + "Baby Shower Máximo"). Recomprimida de PNG (530KB) a JPEG q82 (52KB, -90%) para no golpear el LCP en datos móviles. Reemplazó el placeholder; si llegara a faltar, sigue existiendo el fallback CSS (`.hero-fallback`).
- `assets/video-bienvenida.mp4` — video de bienvenida (Kling 3.0, ~15s, elefante bajando en globo aerostático, saluda, habla, señala la info del evento, se despide, nubes/globos cubren pantalla). **Ya integrado**: reemplazó el preloader — ver sección siguiente.
- `assets/music.mp3` — Mozart, "Naturaleza para Calmar" con sonidos de pajaritos (15 min, loop). Reemplazó el mantra "Om Mani Padme Hum" inicial. No arranca sola con el botón: al cerrar el video de bienvenida se arma un listener de interacción único (toque/click/scroll — `armMusicOnScroll` en `initIntroVideo`) que la enciende en la primera interacción del usuario, para no competir con el audio del video. Se pausa sola si la pestaña pasa a segundo plano (Page Visibility API) y retoma al volver. El botón de música sigue disponible para pausar/reanudar a mano.

## Video de bienvenida (integrado)

Reemplaza el antiguo preloader (`#preloader` fue eliminado). Flujo:
1. Al cargar, se ve `#intro-gate` — pantalla "Toca para comenzar" con el globo aerostático y un botón con pulso sutil (evita el bloqueo de autoplay con audio de los navegadores).
2. Al tocar, se cierra el gate y se muestra `#intro-video-wrap` a pantalla completa (`object-fit: contain`, para no recortar el video) reproduciendo `assets/video-bienvenida.mp4` con sonido.
3. Aparece un botón "Cerrar ✕" a los ~1.8s. Al terminar el video (`ended`), al tocar "Cerrar", o con Escape, se desvanece y se revela el resto de la invitación (que ya se animó de fondo mientras tanto).
4. El video **no se destruye** al cerrarse — queda pausado y oculto en el DOM. Hay un botón ▶ circular sobre la imagen del hero (`#replay-video-btn`, esquina inferior derecha de `.hero-image-wrap`) para volver a verlo cuando quieran, sin recargar la página.
5. Toda la lógica vive en `initIntroVideo()` en `script.js`; los estilos en la sección "PORTADA CINEMATOGRÁFICA" / "VIDEO DE BIENVENIDA" de `styles.css`.

## Dirección de diseño (foco actual)

A partir de ahora el trabajo se concentra **solo en mejorar el diseño visual**, apuntando a una experiencia premium inspirada en Disney/Pixar, manteniendo el estilo de acuarela ya establecido (no un cambio de identidad, sino una elevación de la ejecución visual actual: iluminación, profundidad, textura, pulido de animaciones e ilustraciones).

Se acordó abordarlo como **un pase completo de estilo global** (no sección por sección), sin referencias visuales externas — criterio propio guiado por "Disney/Pixar + acuarela premium".

### Primer pase de diseño aplicado (2026-07-07)

Cambios ya hechos en [styles.css](styles.css) e [index.html](index.html):
- Nuevas variables de color cálidas (`--color-gold`, `--color-gold-soft`, `--color-blush`, `--color-paper`, `--color-primary-deep`) que se suman a la paleta celeste/teal original — **no se tocaron** `--color-primary`/`--color-secondary` para mantener sincronía con `CONFIG.colorPrimary`/`colorSecondary` en `script.js` (usados por el canvas de confeti).
- Sombras "pintadas" con tinte de color en vez de gris plano (`--shadow-soft`, `--shadow-card`, `--shadow-btn`, `--shadow-glow-gold`).
- Textura de grano de papel muy sutil aplicada globalmente (`body::before`, SVG noise data-uri, `mix-blend-mode: overlay`) para un acabado más "acuarela impresa" que digital plano.
- Fondos de sección con lavados radiales de color (celeste + dorado) en vez de bloques de color plano, simulando manchas de acuarela.
- Títulos (`hero-title`, `name-reveal-title`) con degradado tipo texto + drop-shadow para dar profundidad pintada.
- Botones con brillo tipo "cristal pintado" (barrido de luz al hacer hover) y sombra más rica.
- Tarjetas (countdown, info-card, wish form/success) con fondo degradado tipo papel y ligera rotación alternada en las tarjetas del countdown (efecto "sticker" hecho a mano).
- Los SVG decorativos (corazón, estrella, globos, luna, banderines, elefante, globo aerostático) pasaron de `fill` plano a degradados radiales (`grad-celeste`, `grad-teal`) definidos una sola vez en el `<defs>` del sprite — les da volumen "pintado" en vez de verse como iconos vectoriales planos.
- Nuevo acento: `decor-sparkle` (destello dorado de 4 puntas, con degradado `grad-gold`) + animación `decor-twinkle`, agregado en `name-reveal` y `finale` como toque de "polvo mágico" Disney.

Pendiente de validar visualmente en navegador (no se pudo verificar con captura automatizada en esta sesión — se abrió el archivo localmente para revisión manual del usuario).

## Decisiones registradas

| Fecha | Decisión |
|---|---|
| 2026-07-07 | Migración de Netlify a Cloudflare Pages como plataforma de hosting/despliegue principal. |
| 2026-07-07 | Dominio definitivo: `bienvenidomaximo.uk`. |
| 2026-07-07 | Formulario de deseos migrado de Netlify Forms a Cloudflare Pages Function (`functions/api/wish.js`) → Telegram. |
| 2026-07-07 | Fix de z-index en decoraciones (`isolation: isolate` por sección). |
| 2026-07-07 | Video de bienvenida producido en Kling 3.0 (pendiente de integrar). |
| 2026-07-07 | Foco de trabajo: solo diseño visual, dirección Disney/Pixar + acuarela. |
| 2026-07-07 | Persona de trabajo adoptada: Director Creativo Digital (elegancia, restricción, movimiento físico) para todo el trabajo visual — ver brief del usuario. |
| 2026-07-07 | Sombras suavizadas (~25-35% menos alpha) y tilt del countdown reducido de ±1.1° a ±0.6°; rebote de reveal-scale de `back.out(1.6)` a `back.out(1.25)`. |
| 2026-07-07 | Video de bienvenida integrado: reemplaza el preloader con flujo "toca para comenzar" → video con sonido → reveal. Botón ▶ en el hero para volver a verlo. |
| 2026-07-07 | `assets/hero.png` agregado: miniatura 9:16 del primer frame del video (globos + banderines + texto). `.hero-image-wrap` pasó de aspect-ratio 3:4 a 9:16 para no recortarla. |
| 2026-07-07 | Usuario pidió usar 4 imágenes de stock (depositphotos) como fondo/decoración. 3 de 4 tenían marca de agua o eran vector genérico plano (conflicto con la dirección de diseño) → en vez de usarlas, se recreó la idea en el sistema SVG propio: textura de corazones dispersos (`--texture-hearts`, aplicada vía `section::after` en TODAS las secciones como fondo general) + racimos de globos añadidos en `rsvp` y `finale` + elefante replicado (tamaño nuevo `decor-elephant-sm`) en `info`. Cero assets externos con licencia dudosa. |
| 2026-07-07 | Botón "Abrir en Waze" agregado junto a "Abrir en Google Maps" en la sección `location` (`buildWazeLink()` en `script.js`). |
| 2026-07-07 | Pase de optimización móvil (foco: la mayoría entra desde celular): `hero.png`→`hero.jpg` (-90% peso, 530KB→52KB), fix de zoom automático iOS en inputs del formulario (min 16px), botones del reproductor de video subidos a 44px (mínimo táctil), slider de volumen oculto bajo 480px (se prioriza el botón de mute + volumen físico del equipo), `-webkit-tap-highlight-color: transparent` global, `env(safe-area-inset-bottom)` en el reproductor de música, spinner de carga en el video para conexiones lentas. |
