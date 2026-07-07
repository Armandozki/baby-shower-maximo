/* ============================================================
   BABY SHOWER · MÁXIMO — script.js
   Toda la configuración editable vive en el objeto CONFIG.
   Cambia estos valores y la página se actualiza sola.
   ============================================================ */

const CONFIG = {
  // ---- Datos del evento ----
  babyName: "Máximo",
  eventDateISO: "2026-09-05T16:00:00-04:00", // año-mes-diaTHH:MM:SS (zona horaria Chile continental)
  dateDisplay: "Sábado 5 de Septiembre, 2026",
  timeDisplay: "16:00 hrs.",
  address: "Caleta de Camarones 0680, Maipú, Santiago",

  // ---- Ubicación ----
  // Si dejas googleMapsUrl vacío (""), se genera automáticamente desde "address".
  googleMapsUrl: "",

  // ---- WhatsApp (confirmar asistencia) ----
  // Reemplaza por el número real, con código de país, sin +, espacios ni guiones. Ej: "56912345678"
  whatsappNumber: "56900000000",
  whatsappMessage: "¡Hola! Quiero confirmar mi asistencia al Baby Shower de Máximo 💙",

  // ---- Marca / colores (deben coincidir con las variables CSS en :root) ----
  colorPrimary: "#4f8fa0",
  colorSecondary: "#aed3e4",

  // ---- Imagen principal ----
  // Coloca el archivo original de la invitación en assets/hero.jpg (o cambia esta ruta)
  heroImageSrc: "assets/hero.jpg",

  // ---- Parpadeo del elefante ----
  // Ajusta estos porcentajes para alinear el óvalo de "parpadeo" con los ojos
  // del elefante según el recorte final de tu imagen.
  blink: {
    topPercent: 47,
    leftPercent: 50,
    widthPercent: 14,
    heightPercent: 3.2,
  },
};

/* ============================================================
   UTILIDADES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   1. LINKS DINÁMICOS (WhatsApp / Maps / Calendario)
   ============================================================ */
function buildWhatsAppLink() {
  const text = encodeURIComponent(CONFIG.whatsappMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function buildMapsLink() {
  if (CONFIG.googleMapsUrl && CONFIG.googleMapsUrl.trim() !== "") return CONFIG.googleMapsUrl;
  const q = encodeURIComponent(CONFIG.address);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function buildWazeLink() {
  const q = encodeURIComponent(CONFIG.address);
  return `https://waze.com/ul?q=${q}&navigate=yes`;
}

function pad(n) { return String(n).padStart(2, "0"); }

function toGCalDateString(date) {
  // Google Calendar quiere formato UTC compacto: YYYYMMDDTHHMMSSZ
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildCalendarLink() {
  const start = new Date(CONFIG.eventDateISO);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // duración estimada: 3 horas
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Baby Shower de ${CONFIG.babyName}`,
    dates: `${toGCalDateString(start)}/${toGCalDateString(end)}`,
    details: `Te esperamos para celebrar la llegada de ${CONFIG.babyName}. ¡Confirma tu asistencia!`,
    location: CONFIG.address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function initActionLinks() {
  const waBtn = $("#btn-whatsapp");
  const mapsBtn = $("#btn-maps");
  const wazeBtn = $("#btn-waze");
  const calBtn = $("#btn-calendar");

  if (waBtn) waBtn.href = buildWhatsAppLink();
  if (mapsBtn) mapsBtn.href = buildMapsLink();
  if (wazeBtn) wazeBtn.href = buildWazeLink();
  if (calBtn) {
    calBtn.addEventListener("click", () => {
      window.open(buildCalendarLink(), "_blank", "noopener");
    });
  }

  // Copiar el texto de fecha/hora/dirección desde CONFIG
  const dateEl = $("#info-date");
  const timeEl = $("#info-time");
  const addrEl = $("#info-address");
  const nameEl = $("#baby-name");
  if (dateEl) dateEl.textContent = CONFIG.dateDisplay;
  if (timeEl) timeEl.textContent = CONFIG.timeDisplay;
  if (addrEl) addrEl.textContent = CONFIG.address.replace(", Santiago", "");
  if (nameEl) nameEl.textContent = CONFIG.babyName;

  const heroImg = $("#hero-image");
  if (heroImg) heroImg.src = CONFIG.heroImageSrc;
}

/* ============================================================
   2. CUENTA REGRESIVA
   ============================================================ */
function initCountdown() {
  const target = new Date(CONFIG.eventDateISO).getTime();
  const els = {
    days: $("#cd-days"),
    hours: $("#cd-hours"),
    minutes: $("#cd-minutes"),
    seconds: $("#cd-seconds"),
  };
  if (!els.days) return;

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / 86400000);
    diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const minutes = Math.floor(diff / 60000);
    diff -= minutes * 60000;
    const seconds = Math.floor(diff / 1000);

    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   3. SCROLL SUAVE (Lenis) + GSAP ScrollTrigger
   ============================================================ */
function initSmoothScroll() {
  if (typeof Lenis === "undefined" || prefersReducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    touchMultiplier: 1.1,
  });

  lenis.on("scroll", () => {
    if (window.ScrollTrigger) ScrollTrigger.update();
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

/* ============================================================
   4. PROGRESO DE SCROLL (barra superior)
   ============================================================ */
function initScrollProgress() {
  const bar = $("#scroll-progress-bar");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = h.scrollHeight - h.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = progress + "%";
  }, { passive: true });
}

/* ============================================================
   5. ANIMACIONES DE APARICIÓN (GSAP + ScrollTrigger)
   ============================================================ */
function initRevealAnimations() {
  if (typeof gsap === "undefined") {
    document.documentElement.classList.add("no-js");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const easing = "power3.out";

  // Fade + translateY genérico
  $$(".reveal-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: easing,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Fade sutil (líneas pequeñas, eyebrow)
  $$(".reveal-line").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: easing,
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
    });
  });

  // Scale + fade (underline, ícono final)
  $$(".reveal-scale").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "back.out(1.25)",
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
    });
  });

  // Frase cinematográfica palabra por palabra
  const storyEl = $("[data-split-text]");
  if (storyEl) {
    const words = storyEl.textContent.trim().split(" ");
    storyEl.innerHTML = words
      .map((w) => `<span class="word" style="display:inline-block; opacity:0; transform:translateY(18px) rotate(2deg);">${w}&nbsp;</span>`)
      .join("");

    gsap.to(storyEl.querySelectorAll(".word"), {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.9,
      ease: easing,
      stagger: 0.09,
      scrollTrigger: {
        trigger: storyEl,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }

  // Parallax muy sutil en las nubes del hero al hacer scroll
  $$(".hero-bg .cloud").forEach((cloud, i) => {
    gsap.to(cloud, {
      y: (i % 2 === 0 ? -60 : -30),
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
  });

  // Título / imagen del hero: leve escala + parallax al hacer scroll (efecto "product page")
  gsap.to(".hero-image-wrap", {
    y: 40,
    scale: 0.97,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
}

/* ============================================================
   6. MOVIMIENTOS "VIVOS" — globo flotando, nubes, parpadeo
   ============================================================ */
function initLivingIllustration() {
  if (typeof gsap === "undefined" || prefersReducedMotion) return;

  // Flotación infinita y muy leve del globo/elefante (toda la imagen)
  gsap.to(".hero-image-wrap", {
    y: "+=10",
    rotation: 0.6,
    duration: 4.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });

  // Deriva lenta de las nubes decorativas
  const cloudSpeeds = [38, 46, 55, 50];
  $$(".hero-bg .cloud").forEach((cloud, i) => {
    gsap.to(cloud, {
      x: i % 2 === 0 ? 24 : -24,
      duration: cloudSpeeds[i % cloudSpeeds.length],
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  });

  // Parpadeo ocasional del elefante: un óvalo sutil que "cierra" el ojo brevemente
  const wrap = $(".hero-image-wrap");
  if (!wrap) return;

  const blinkEl = document.createElement("div");
  blinkEl.className = "eye-blink";
  Object.assign(blinkEl.style, {
    position: "absolute",
    top: CONFIG.blink.topPercent + "%",
    left: CONFIG.blink.leftPercent + "%",
    width: CONFIG.blink.widthPercent + "%",
    height: CONFIG.blink.heightPercent + "%",
    transform: "translate(-50%, -50%) scaleY(0)",
    background: "rgba(60, 50, 40, 0.25)",
    borderRadius: "50%",
    pointerEvents: "none",
    mixBlendMode: "multiply",
    filter: "blur(1px)",
  });
  wrap.appendChild(blinkEl);

  function scheduleBlink() {
    const delay = 3.5 + Math.random() * 5; // parpadeos poco frecuentes, nunca mecánicos
    gsap.delayedCall(delay, () => {
      gsap.to(blinkEl, {
        scaleY: 1,
        duration: 0.09,
        ease: "power1.in",
        onComplete: () => {
          gsap.to(blinkEl, { scaleY: 0, duration: 0.14, ease: "power1.out", delay: 0.05 });
        },
      });
      scheduleBlink();
    });
  }
  scheduleBlink();
}

/* ============================================================
   7. PARTÍCULAS SUTILES (polvo / nubes flotando)
   ============================================================ */
function initParticles() {
  const canvas = $("#particles-canvas");
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles;
  let visible = true;

  function resize() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function makeParticles() {
    const count = Math.min(34, Math.floor((window.innerWidth * window.innerHeight) / 45000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.8 + 0.6) * devicePixelRatio,
      speedY: (Math.random() * 0.12 + 0.03) * devicePixelRatio,
      driftX: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
      alpha: Math.random() * 0.35 + 0.15,
    }));
  }

  function draw() {
    if (!visible) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += p.driftX;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
  window.addEventListener("resize", () => { resize(); makeParticles(); });

  resize();
  makeParticles();
  requestAnimationFrame(draw);
}

/* ============================================================
   8. CONFETI SUTIL AL LLEGAR AL FINAL
   ============================================================ */
function initConfetti() {
  const canvas = $("#confetti-canvas");
  const finale = $("#finale");
  if (!canvas || !finale || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, pieces = [], playing = false;
  const colors = [CONFIG.colorSecondary, CONFIG.colorPrimary, "#ffffff"];

  function resize() {
    w = canvas.width = finale.clientWidth * devicePixelRatio;
    h = canvas.height = finale.clientHeight * devicePixelRatio;
    canvas.style.width = finale.clientWidth + "px";
    canvas.style.height = finale.clientHeight + "px";
  }

  function spawn() {
    pieces = Array.from({ length: 46 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.3,
      size: (Math.random() * 5 + 3) * devicePixelRatio,
      speed: (Math.random() * 0.6 + 0.35) * devicePixelRatio,
      drift: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.03,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.4,
    }));
  }

  function loop() {
    if (!playing) return;
    ctx.clearRect(0, 0, w, h);
    let stillFalling = false;
    pieces.forEach((p) => {
      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.spin;
      if (p.y < h + 20) stillFalling = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
      ctx.restore();
    });
    if (stillFalling) {
      requestAnimationFrame(loop);
    } else {
      playing = false;
      ctx.clearRect(0, 0, w, h);
    }
  }

  resize();
  window.addEventListener("resize", resize);

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: finale,
      start: "top 60%",
      once: true,
      onEnter: () => {
        spawn();
        playing = true;
        loop();
      },
    });
  }
}

/* ============================================================
   9. ANIMACIÓN FINAL (brillo/escala en el emoji del elefante)
   ============================================================ */
function initFinaleGlow() {
  if (typeof gsap === "undefined" || prefersReducedMotion) return;
  const emoji = $(".finale-emoji");
  if (!emoji) return;

  ScrollTrigger.create({
    trigger: "#finale",
    start: "top 55%",
    once: true,
    onEnter: () => {
      gsap.fromTo(
        emoji,
        { scale: 0.7, opacity: 0, filter: "brightness(1)" },
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(emoji, {
              filter: "brightness(1.25)",
              duration: 0.9,
              yoyo: true,
              repeat: 1,
              ease: "sine.inOut",
            });
          },
        }
      );
    },
  });
}

/* ============================================================
   10. REPRODUCTOR DE MÚSICA (silenciado por defecto)
   ============================================================ */
function initMusicPlayer() {
  const btn = $("#music-toggle");
  const audio = $("#bg-audio");
  if (!btn || !audio) return null;

  audio.volume = 0.5;

  function setPlayingState(isPlaying) {
    btn.setAttribute("aria-pressed", String(isPlaying));
    btn.setAttribute("aria-label", isPlaying ? "Silenciar música" : "Activar música");
  }

  function play() {
    if (!audio.paused) return Promise.resolve();
    return audio.play().then(() => setPlayingState(true)).catch(() => {
      // No hay archivo de audio en assets/music.mp3 todavía, o el navegador bloqueó la reproducción.
      console.warn("No se pudo reproducir la música. Agrega un archivo en assets/music.mp3.");
    });
  }

  function pause() {
    audio.pause();
    setPlayingState(false);
  }

  btn.addEventListener("click", () => { audio.paused ? play() : pause(); });

  return { play, pause, isPlaying: () => !audio.paused };
}

/* ============================================================
   10.5 FORMULARIO "DESEO PARA MÁXIMO" (Cloudflare Pages Function)
   El envío llega a /api/wish (functions/api/wish.js), que reenvía
   el mensaje directo a Telegram. No requiere servidor propio.
   ============================================================ */
function initWishForm() {
  const form = $("#wish-form");
  const successBox = $("#wish-success");
  const errorBox = $("#wish-error");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (errorBox) errorBox.hidden = true;

    const formData = new FormData(form);

    fetch("/api/wish", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => {
        if (!data || data.ok !== true) throw new Error("server error");
        if (typeof gsap !== "undefined") {
          gsap.to(form, {
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              form.hidden = true;
              if (successBox) {
                successBox.hidden = false;
                requestAnimationFrame(() => successBox.classList.add("is-visible"));
              }
            },
          });
        } else {
          form.hidden = true;
          if (successBox) successBox.hidden = false;
        }
      })
      .catch(() => {
        if (errorBox) errorBox.hidden = false;
      });
  });
}

/* ============================================================
   11. SCROLL CUE (botón de bajar en el hero)
   ============================================================ */
function initScrollCue() {
  const cue = $("#scroll-cue");
  if (!cue) return;
  cue.addEventListener("click", () => {
    const target = $("#story-intro") || $("#name-reveal");
    if (!target) return;
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(target, { duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

/* ============================================================
   12. PORTADA CINEMATOGRÁFICA + VIDEO DE BIENVENIDA
   "Toca para comenzar" → video con sonido a pantalla completa →
   se revela el resto de la invitación (ya animada de fondo).
   ============================================================ */
function initIntroVideo(musicPlayer) {
  const gate = $("#intro-gate");
  const startBtn = $("#intro-gate-btn");
  const videoWrap = $("#intro-video-wrap");
  const video = $("#intro-video");
  const skipBtn = $("#intro-skip-btn");
  const replayBtn = $("#replay-video-btn");
  const controls = $("#intro-video-controls");
  const playBtn = $("#intro-play-btn");
  const muteBtn = $("#intro-mute-btn");
  const volumeSlider = $("#intro-volume");
  const loading = $("#intro-video-loading");
  if (!videoWrap || !video || !skipBtn) return;

  let chromeTimer = null;
  let safetyTimer = null;
  let musicArmed = false;
  let musicWasPlaying = false;

  // La música de fondo arranca recién en la primera interacción DESPUÉS del
  // video, para no competir con su audio. En iOS Safari el evento 'scroll'
  // NO cuenta como gesto del usuario para permitir audio con sonido — solo
  // toques/clics directos sí. Por eso se escuchan varios tipos a la vez y el
  // primero que dispare arranca la música; los demás se limpian solos.
  function armMusicOnScroll() {
    if (musicArmed || !musicPlayer) return;
    musicArmed = true;
    const events = ["touchstart", "pointerdown", "click", "scroll"];
    const start = () => {
      musicPlayer.play();
      events.forEach((ev) => window.removeEventListener(ev, start));
    };
    events.forEach((ev) => window.addEventListener(ev, start, { passive: true }));
  }

  function closeGate() {
    if (!gate) return;
    if (typeof gsap !== "undefined" && !prefersReducedMotion) {
      gsap.to(gate, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => gate.remove() });
    } else {
      gate.remove();
    }
  }

  function setIcon(btn, name) {
    if (!btn) return;
    btn.querySelectorAll("[data-icon]").forEach((el) => { el.hidden = el.dataset.icon !== name; });
  }

  function updatePlayIcon() {
    setIcon(playBtn, video.paused ? "play" : "pause");
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", String(!video.paused));
      playBtn.setAttribute("aria-label", video.paused ? "Reproducir video" : "Pausar video");
    }
  }

  function updateMuteIcon() {
    const isMuted = video.muted || video.volume === 0;
    setIcon(muteBtn, isMuted ? "vol-off" : "vol-on");
    if (muteBtn) {
      muteBtn.setAttribute("aria-pressed", String(isMuted));
      muteBtn.setAttribute("aria-label", isMuted ? "Activar sonido" : "Silenciar");
    }
    if (volumeSlider) volumeSlider.value = isMuted ? 0 : video.volume;
  }

  // El video queda siempre en el DOM (oculto) para poder reabrirlo desde el botón del hero
  function closeVideo() {
    clearTimeout(chromeTimer);
    clearTimeout(safetyTimer);
    videoWrap.classList.remove("is-visible");
    skipBtn.classList.remove("is-visible");
    if (controls) controls.classList.remove("is-visible");
    if (loading) loading.classList.remove("is-visible");
    video.pause();
    setTimeout(() => {
      videoWrap.hidden = true;
      video.currentTime = 0;
    }, 750);
    armMusicOnScroll();
    if (musicWasPlaying && musicPlayer) musicPlayer.play();
  }

  function openVideo() {
    if (musicPlayer) {
      musicWasPlaying = musicPlayer.isPlaying();
      musicPlayer.pause(); // no competir con el audio del video (ej. al reabrirlo desde el hero)
    }
    videoWrap.hidden = false;
    requestAnimationFrame(() => videoWrap.classList.add("is-visible"));

    video.currentTime = 0;
    video.muted = false;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // El navegador bloqueó el audio: seguimos muteados antes que dejar la invitación trabada
        video.muted = true;
        video.play().catch(() => closeVideo());
      });
    }

    skipBtn.classList.remove("is-visible");
    if (controls) controls.classList.remove("is-visible");
    chromeTimer = setTimeout(() => {
      skipBtn.classList.add("is-visible");
      if (controls) controls.classList.add("is-visible");
    }, 1800);
    // Salvavidas: si 'ended' no dispara por algún motivo, no dejar al usuario atrapado
    safetyTimer = setTimeout(closeVideo, 30000);
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => { closeGate(); openVideo(); }, { once: true });
  }
  if (replayBtn) {
    replayBtn.addEventListener("click", openVideo);
  }
  skipBtn.addEventListener("click", closeVideo);
  video.addEventListener("ended", closeVideo);
  video.addEventListener("error", closeVideo);

  if (playBtn) {
    playBtn.addEventListener("click", () => { video.paused ? video.play() : video.pause(); });
  }
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 1;
    });
  }
  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      video.volume = parseFloat(volumeSlider.value);
      video.muted = video.volume === 0;
    });
  }
  video.addEventListener("play", updatePlayIcon);
  video.addEventListener("pause", updatePlayIcon);
  video.addEventListener("volumechange", updateMuteIcon);

  if (loading) {
    video.addEventListener("waiting", () => loading.classList.add("is-visible"));
    video.addEventListener("playing", () => loading.classList.remove("is-visible"));
  }

  document.addEventListener("keydown", (e) => {
    if (videoWrap.hidden) return;
    if (e.key === "Escape") { closeVideo(); return; }
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      video.paused ? video.play() : video.pause();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      video.muted = false;
      video.volume = Math.min(1, video.volume + 0.1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      video.volume = Math.max(0, video.volume - 0.1);
      video.muted = video.volume === 0;
    }
  });
}

/* ============================================================
   13. RED DE SEGURIDAD — si algo falla, el contenido igual aparece
   ============================================================ */
function initSafetyNet() {
  setTimeout(() => {
    $$(".reveal-up, .reveal-line, .reveal-scale").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (parseFloat(style.opacity) === 0) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }, 4000);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const musicPlayer = initMusicPlayer();
  initIntroVideo(musicPlayer);
  initActionLinks();
  initCountdown();
  initScrollProgress();
  initScrollCue();
  initWishForm();

  window.lenisInstance = initSmoothScroll();

  initRevealAnimations();
  initLivingIllustration();
  initConfetti();
  initFinaleGlow();
  initParticles();
  initSafetyNet();
});
