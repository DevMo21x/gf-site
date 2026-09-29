/* Mohaimen's portrait. */

"use strict";

/* ---------- Mohaimen's portrait (talk box and question box) ---------- */

const Portrait = (() => {
  const ctxs = $$("[data-portrait]").map((c) => c.getContext("2d"));
  const cache = new Map();
  let current = "neutral";
  let timer = 0;

  function paint(expr) {
    let g = cache.get(expr);
    if (!g) {
      g = Pixel.portrait(expr);
      cache.set(expr, g);
    }
    ctxs.forEach((ctx) => g.paint(ctx));
  }

  // ms: flash this face, then go back
  function set(expr, ms) {
    clearTimeout(timer);
    paint(expr);
    if (ms) timer = setTimeout(() => paint(current), ms);
    else current = expr;
  }

  paint(current);
  return { set };
})();
