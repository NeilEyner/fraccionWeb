/**
 * MATEMATICAS AVENTURA — script.js
 * Lucide init · Eventos táctiles · Quiz interactivo
 * Usa pointerdown para respuesta inmediata en tablets
 */
"use strict";

/* ════════════════════════════════════════════
   INICIALIZACIÓN GLOBAL
════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  // Renderizar todos los iconos Lucide
  if (window.lucide) lucide.createIcons();

  bindPointerButtons();
  initPageSpecific();
  preventZoom();
});

/* ════════════════════════════════════════════
   BINDS TÁCTILES GLOBALES
════════════════════════════════════════════ */
function bindPointerButtons() {
  // Botón Volver al mapa
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sinkEffect(backBtn);
    });
  }

  // Links de mapa (paradas del camino)
  document.querySelectorAll(".map-node").forEach((node) => {
    node.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sinkEffect(node, () => {
        const href = node.getAttribute("href");
        if (href) window.location.href = href;
      });
    });
  });

  // Tarjetas de juegos como links
  document.querySelectorAll(".game-card[data-href]").forEach((card) => {
    card.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sinkEffect(card, () => {
        window.open(card.dataset.href, "_blank", "noopener,noreferrer");
      });
    });
  });

  // Items de enlaces de juego
  document.querySelectorAll(".game-link-item[data-href]").forEach((item) => {
    item.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sinkEffect(item, () => {
        window.open(item.dataset.href, "_blank", "noopener,noreferrer");
      });
    });
  });
}

/* Efecto hundimiento visual al presionar */
function sinkEffect(el, callback) {
  el.classList.add("btn-pressed");
  setTimeout(() => {
    el.classList.remove("btn-pressed");
    if (callback) callback();
  }, 140);
}

/* ════════════════════════════════════════════
   LÓGICA ESPECÍFICA POR PÁGINA
════════════════════════════════════════════ */
function initPageSpecific() {
  const body = document.body;
  if (body.classList.contains("page-ejercicios")) initQuiz();
  if (body.classList.contains("page-juegos"))     initJuegos();
}

/* ════════════════════════════════════════════
   QUIZ INTERACTIVO (ejercicios.html)
════════════════════════════════════════════ */
const QUESTIONS = {
  sumas: [
    { q: "3 + 5 = ?",   opts: [6, 7, 8, 9],   ans: 8  },
    { q: "12 + 7 = ?",  opts: [17,18,19,20],   ans: 19 },
    { q: "6 + 6 = ?",   opts: [10,11,12,13],   ans: 12 },
    { q: "9 + 4 = ?",   opts: [11,12,13,14],   ans: 13 },
    { q: "15 + 3 = ?",  opts: [16,17,18,19],   ans: 18 },
  ],
  restas: [
    { q: "10 - 4 = ?",  opts: [4, 5, 6, 7],    ans: 6  },
    { q: "15 - 8 = ?",  opts: [5, 6, 7, 8],    ans: 7  },
    { q: "9 - 3 = ?",   opts: [4, 5, 6, 7],    ans: 6  },
    { q: "20 - 7 = ?",  opts: [11,12,13,14],   ans: 13 },
    { q: "14 - 5 = ?",  opts: [7, 8, 9, 10],   ans: 9  },
  ],
  fracciones: [
    { q: "1/2 de 10 = ?",  opts: [3, 4, 5, 6],  ans: 5 },
    { q: "1/4 de 8 = ?",   opts: [1, 2, 3, 4],  ans: 2 },
    { q: "1/3 de 9 = ?",   opts: [2, 3, 4, 5],  ans: 3 },
    { q: "2/4 = ?/2",      opts: [1, 2, 3, 4],  ans: 1 },
    { q: "3/6 es igual a 1/?", opts: [2, 3, 4, 6], ans: 2 },
  ],
};

let quizState = {
  topic:   "sumas",
  index:   0,
  score:   0,
  answered: false,
};

function initQuiz() {
  // Selector de tema
  document.querySelectorAll(".topic-tab").forEach((tab) => {
    tab.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      document.querySelectorAll(".topic-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      quizState.topic   = tab.dataset.topic;
      quizState.index   = 0;
      quizState.score   = 0;
      quizState.answered = false;
      showQuestion();
      hideResult();
    });
  });

  // Botón siguiente pregunta
  const btnNext = document.getElementById("btnNextQ");
  if (btnNext) {
    btnNext.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sinkEffect(btnNext, nextQuestion);
    });
  }

  // Botón reiniciar
  const btnRestart = document.getElementById("btnRestart");
  if (btnRestart) {
    btnRestart.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      sinkEffect(btnRestart, () => {
        quizState.index  = 0;
        quizState.score  = 0;
        quizState.answered = false;
        hideResult();
        showQuestion();
      });
    });
  }

  showQuestion();
}

function showQuestion() {
  const qs    = QUESTIONS[quizState.topic];
  const total = qs.length;
  const idx   = quizState.index;

  if (idx >= total) { showResult(); return; }

  const q = qs[idx];

  // Progreso
  const fill  = document.getElementById("qpFill");
  const label = document.getElementById("qpLabel");
  if (fill)  fill.style.width = `${((idx) / total) * 100}%`;
  if (label) label.textContent = `${idx + 1} / ${total}`;

  // Número y texto de pregunta
  const numEl  = document.getElementById("questionNum");
  const textEl = document.getElementById("questionText");
  if (numEl)  numEl.textContent  = `Pregunta ${idx + 1}`;
  if (textEl) textEl.textContent = q.q;

  // Opciones
  const btns = document.querySelectorAll(".answer-btn");
  btns.forEach((btn, i) => {
    btn.textContent = q.opts[i];
    btn.classList.remove("correct", "wrong");
    btn.disabled = false;
    btn.style.animation = "";

    btn.addEventListener("pointerdown", onAnswerDown, { once: true });
  });

  // Ocultar feedback y siguiente
  const fb   = document.getElementById("feedbackBar");
  const next = document.getElementById("btnNextQ");
  if (fb)   { fb.classList.remove("show","fb-correct","fb-wrong"); fb.innerHTML = ""; }
  if (next) next.classList.remove("show");

  quizState.answered = false;
}

function onAnswerDown(e) {
  e.preventDefault();
  if (quizState.answered) return;
  quizState.answered = true;

  const btn     = e.currentTarget;
  const qs      = QUESTIONS[quizState.topic];
  const correct = qs[quizState.index].ans;
  const chosen  = parseInt(btn.textContent, 10);
  const isRight = chosen === correct;

  // Desactivar todos los botones
  document.querySelectorAll(".answer-btn").forEach(b => b.disabled = true);

  // Marcar correcto/incorrecto
  if (isRight) {
    btn.classList.add("correct");
    quizState.score++;
  } else {
    btn.classList.add("wrong");
    // Mostrar respuesta correcta
    document.querySelectorAll(".answer-btn").forEach(b => {
      if (parseInt(b.textContent, 10) === correct) b.classList.add("correct");
    });
  }

  showFeedback(isRight);

  // Mostrar botón siguiente
  const next = document.getElementById("btnNextQ");
  if (next) {
    setTimeout(() => {
      next.classList.add("show");
      if (window.lucide) lucide.createIcons();
    }, 400);
  }
}

function showFeedback(correct) {
  const fb = document.getElementById("feedbackBar");
  if (!fb) return;

  if (correct) {
    fb.className = "feedback-bar fb-correct";
    fb.innerHTML = `<i data-lucide="check-circle-2"></i><span>Excelente. Eso es correcto.</span>`;
  } else {
    const ans = QUESTIONS[quizState.topic][quizState.index].ans;
    fb.className = "feedback-bar fb-wrong";
    fb.innerHTML = `<i data-lucide="x-circle"></i><span>Casi. La respuesta era ${ans}.</span>`;
  }
  if (window.lucide) lucide.createIcons();
  requestAnimationFrame(() => fb.classList.add("show"));
}

function nextQuestion() {
  quizState.index++;
  showQuestion();
}

function showResult() {
  const qc = document.getElementById("quizContent");
  const rs = document.getElementById("resultScreen");
  if (qc) qc.style.display = "none";
  if (rs) {
    rs.classList.add("show");
    const total = QUESTIONS[quizState.topic].length;
    const scoreEl = document.getElementById("resultScore");
    const msgEl   = document.getElementById("resultMsg");
    if (scoreEl) scoreEl.textContent = `${quizState.score} / ${total}`;
    if (msgEl) {
      const pct = quizState.score / total;
      msgEl.textContent =
        pct >= 0.8 ? "Muy bien. Sigues aprendiendo muy rapido." :
        pct >= 0.6 ? "Bien hecho. Sigue practicando para mejorar." :
                     "Sigue intentando. Puedes hacerlo mejor.";
    }
    if (window.lucide) lucide.createIcons();
  }
}

function hideResult() {
  const qc = document.getElementById("quizContent");
  const rs = document.getElementById("resultScreen");
  if (qc) qc.style.display = "";
  if (rs) rs.classList.remove("show");
}

/* ════════════════════════════════════════════
   JUEGOS — abrir URL externa
════════════════════════════════════════════ */
function initJuegos() {
  // Los game-card con data-href se manejan en bindPointerButtons
  // Los game-link-item también
}

/* ════════════════════════════════════════════
   PREVENCIÓN ZOOM EN TABLETS
════════════════════════════════════════════ */
function preventZoom() {
  document.addEventListener("touchmove", (e) => {
    if (e.touches.length > 1 && e.cancelable) e.preventDefault();
  }, { passive: false });

  let lastTap = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTap < 280) { e.preventDefault(); }
    lastTap = now;
  }, { passive: false });
}
