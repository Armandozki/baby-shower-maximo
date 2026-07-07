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

- Paleta actual: celeste/teal derivada del arte original (`--color-primary: #4f8fa0`, `--color-secondary: #aed3e4`), fondo casi blanco, sombras suaves, tipografía Fraunces (display) + Poppins (body).
- Se corrigió un bug de **z-index** que ocultaba las decoraciones SVG (elefante, globos, estrellas, etc.) detrás del fondo de otras secciones. Fix: cada `<section>` usa `isolation: isolate` para crear su propio contexto de apilamiento, y `.decor` usa `z-index: -1` relativo a esa sección (ver `styles.css`, commit `cbc8615`).
- Animaciones vivas ya implementadas: oreja del elefante moviéndose, parpadeo, flotación de globos/nubes, parallax sutil en el hero, confeti en la sección final, reveal de texto palabra por palabra.

## Assets pendientes de integrar

La carpeta `assets/` **todavía no existe en el repo**. Referencias en el código que la esperan:
- `assets/hero.png` — imagen principal de la invitación (hero). Si falta, hay un fallback CSS (`.hero-fallback`) que se activa solo con un ilustración simplificada.
- `assets/music.mp3` — música de fondo opcional (el botón de música falla silenciosamente si no existe).
- **Video de bienvenida (nuevo, terminado en Kling 3.0):** el elefante baja en un globo aerostático, saluda, habla, señala la información del evento, se despide, y luego nubes/globos cubren la pantalla para dar paso al resto de la invitación. **Aún no está integrado en el sitio** — no hay `<video>` ni lógica en `index.html`/`script.js` que lo reproduzca todavía. Es un candidato claro para reemplazar o complementar el preloader/hero actual.

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
