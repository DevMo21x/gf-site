/* Mohaimen's portrait. */

"use strict";

/* ---------- Mohaimen's portrait (talk box and question box) ---------- */

const Portrait = (() => {
  const ctxs = $$("[data-portrait]").map((c) => c.getContext("2d"));
  const cache = new Map();
  let current = "neutral";
  let timer = 0;
  let bare = false; // he's given her his jacket

  function paint(expr) {
    const key = expr + bare;
    let g = cache.get(key);
    if (!g) {
      g = Pixel.portrait(expr, bare);
      cache.set(key, g);
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
  // without the jacket once he's given it to her (and back on after a fresh start)
  function jacketOff(on) {
    bare = on;
    paint(current);
  }

  return { set, jacketOff };
})();
