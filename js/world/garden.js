/* The seed she plants at dawn, growing a little every few hours. */

"use strict";

/* ---------- The garden: one seed, planted at dawn, in bloom when he asks ---------- */

const Garden = (() => {
  const canvas = $("[data-garden]");
  const ctx = canvas.getContext("2d");
  const variant = CONTENT.garden.variant;
  let stage = -1; // -1: not planted yet

  function draw(next, pop) {
    if (next === stage) return;
    stage = next;
    canvas.hidden = stage < 0;
    if (stage < 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Pixel.plant(stage, variant).paint(ctx);
    if (!pop || reducedMotion()) return;
    animateIn(canvas, [
      { transform: "scale(1, .8)" },
      { transform: "scale(1, 1.12)", offset: 0.6 },
      { transform: "none" },
    ], { duration: 360, easing: "steps(4, end)" });
  }

  return {
    plant: () => { draw(0, true); Music.pickup(); },
    // later in the day, taller (it only ever grows)
    grow: (n) => { if (stage >= 0) draw(Math.max(stage, Math.min(n, 3)), true); },
    // right before he asks: it opens, then it's in full bloom
    bloom() {
      if (stage < 0) return;
      draw(4, true);
      setTimeout(() => { draw(5, true); Music.chime(); }, reducedMotion() ? 0 : 700);
    },
    reset: () => draw(-1),
  };
})();
