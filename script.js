/**
 * FRACCIONES DIVERTIDAS — script.js
 * Navegación por pantallas · Indicadores táctiles
 * Usa pointerdown para respuesta inmediata en tablets
 */

"use strict";

/* ═══════════════════════════════════════════
   CONFIGURACIÓN
═══════════════════════════════════════════ */
const TOTAL_SCREENS = 4;

const state = {
  current: 0,
  transitioning: false,
};

/* ═══════════════════════════════════════════
   REFERENCIAS DOM
═══════════════════════════════════════════ */
const screens       = document.querySelectorAll(".screen");
const progressFill  = document.getElementById("progressFill");
const progressDots  = document.getElementById("progressDots");

/* ═══════════════════════════════════════════
   INICIALIZACIÓN
═══════════════════════════════════════════ */
function init() {
  // Inicializar Lucide icons
  if (window.lucide) lucide.createIcons();

  buildProgressDots();
  updateProgress();
  bindNavButtons();
  bindKeyboard();
}

/* ═══════════════════════════════════════════
   BARRA DE PROGRESO
═══════════════════════════════════════════ */
function buildProgressDots() {
  progressDots.innerHTML = "";
  for (let i = 0; i < TOTAL_SCREENS; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.setAttribute("aria-hidden", "true");
    progressDots.appendChild(dot);
  }
}

function updateProgress() {
  const pct = ((state.current) / (TOTAL_SCREENS - 1)) * 100;
  progressFill.style.width = `${pct}%`;

  const dots = progressDots.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("done",   i < state.current);
    dot.classList.toggle("active", i === state.current);
  });
}

/* ═══════════════════════════════════════════
   NAVEGACIÓN ENTRE PANTALLAS
═══════════════════════════════════════════ */
function goTo(targetIndex) {
  if (state.transitioning) return;
  if (targetIndex < 0 || targetIndex >= TOTAL_SCREENS) return;
  if (targetIndex === state.current) return;

  state.transitioning = true;

  const current = screens[state.current];
  const target  = screens[targetIndex];
  const goingForward = targetIndex > state.current;

  // Animar salida de la pantalla actual
  current.classList.add("exit-left");
  current.classList.remove("active");

  // Preparar la pantalla destino (fuera de vista)
  target.style.transform = goingForward ? "translateX(60px)" : "translateX(-60px)";
  target.style.opacity   = "0";

  // Pequeño retraso para que el CSS de salida se aplique antes de mostrar la entrada
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.style.transition = "none";
      target.style.transform  = goingForward ? "translateX(60px)" : "translateX(-60px)";
      target.style.opacity    = "0";
      target.classList.add("active");

      requestAnimationFrame(() => {
        target.style.transition = "";
        target.style.transform  = "translateX(0)";
        target.style.opacity    = "1";
      });

      // Limpiar después de la transición
      setTimeout(() => {
        current.classList.remove("exit-left");
        current.style.transform = "";
        current.style.opacity   = "";
        state.current           = targetIndex;
        state.transitioning     = false;
        updateProgress();

        // Re-renderizar los iconos lucide en la nueva pantalla
        if (window.lucide) lucide.createIcons();
      }, 380);
    });
  });
}

function next() { goTo(state.current + 1); }
function back() { goTo(state.current - 1); }

/* ═══════════════════════════════════════════
   EFECTO VISUAL AL PRESIONAR BOTONES
═══════════════════════════════════════════ */
function rippleEffect(btn) {
  btn.style.transform = "translateY(4px) scale(0.97)";
  setTimeout(() => {
    btn.style.transform = "";
  }, 140);
}

/* ═══════════════════════════════════════════
   BINDING DE BOTONES — pointerdown para
   respuesta inmediata en pantallas táctiles
═══════════════════════════════════════════ */
function bindBtn(id, handler) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    rippleEffect(el);
    handler();
  });

  // Fallback para teclado (accesibilidad)
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      rippleEffect(el);
      handler();
    }
  });
}

function bindNavButtons() {
  bindBtn("btnStart",   next);
  bindBtn("btn1Back",   back);
  bindBtn("btn1Next",   next);
  bindBtn("btn2Back",   back);
  bindBtn("btn2Next",   next);
  bindBtn("btn3Back",   back);
  bindBtn("btnRestart", () => goTo(0));

  // Tarjetas de juegos — efecto de presión táctil
  document.querySelectorAll(".game-card").forEach(card => {
    card.addEventListener("pointerdown", () => {
      card.style.transform = "translateY(4px)";
      card.style.boxShadow = "0 1px 0 rgba(0,0,0,0.1)";
    });
    card.addEventListener("pointerup", () => {
      setTimeout(() => {
        card.style.transform = "";
        card.style.boxShadow = "";
      }, 180);
    });
    card.addEventListener("pointercancel", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });
}

/* ═══════════════════════════════════════════
   NAVEGACIÓN CON TECLADO (accesibilidad)
═══════════════════════════════════════════ */
function bindKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   back();
  });
}

/* ═══════════════════════════════════════════
   PREVENCIÓN DEL SCROLL/ZOOM EN TABLETS
═══════════════════════════════════════════ */
document.addEventListener("touchmove", (e) => {
  if (e.cancelable) e.preventDefault();
}, { passive: false });

// Evitar zoom con doble toque
let lastTap = 0;
document.addEventListener("touchend", (e) => {
  const now = Date.now();
  if (now - lastTap < 300) e.preventDefault();
  lastTap = now;
}, { passive: false });

/* ═══════════════════════════════════════════
   LANZAR
═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", init);
