/* The screen-filling flower burst after Play. */

"use strict";

/* ---------- A screen full of pixel flowers ---------- */

const Lilies = (() => {
  const canvas = $("[data-lilies]");
  const ctx = canvas.getContext("2d");
  const SCALE = 2;       // each flower is drawn at 2x its art size
  const STAGE = 170;     // ms per growth stage: bud, half open, open
  let flowers = null;
  let leaves = null;
  let raf = 0;

  function prepare() {
    if (flowers) return;
    flowers = Array.from({ length: Pixel.FLOWER_COUNT }, (_, v) => [0, 1, 2].map((s) => Pixel.flower(v, s).canvas()));
    leaves = [0, 1, 2].map((i) => Pixel.leafSprite(i).canvas());
  }

  function release() {
    canvas.width = canvas.height = 0; // hand the GPU memory back
    canvas.classList.remove("is-fading");
  }

  // Returns the ms at which the screen is fully covered
  function bloom(origin) {
    prepare();
    cancelAnimationFrame(raf);
    canvas.classList.remove("is-fading", "is-quick");
    const size = artSize();
    fitCanvas(canvas, size);
    const { W, H, px } = size;
    ctx.imageSmoothingEnabled = false;

    const ox = origin.x / px;
    const oy = origin.y / px;
    const fw = 15 * SCALE;
    const lw = 13 * SCALE;
    const step = 13;
    const maxDist = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
    const blooms = [];
    const greens = [];
    for (let row = 0, y = -step / 2; y < H + step; y += step, row++) {
      for (let x = -step / 2 + (row % 2) * (step / 2); x < W + step; x += step) {
        const jx = x + (Math.random() - 0.5) * step * 0.6;
        const jy = y + (Math.random() - 0.5) * step * 0.6;
        const dist = Math.hypot(jx - ox, jy - oy) / maxDist;
        blooms.push({
          x: Math.round(jx - fw / 2),
          y: Math.round(jy - fw / 2),
          delay: dist * 1300 + Math.random() * 250,
          v: Math.floor(Math.random() * flowers.length),
        });
        if (Math.random() < 0.5) {
          greens.push({
            x: Math.round(jx - lw / 2 + (Math.random() - 0.5) * step),
            y: Math.round(jy - lw / 2 + (Math.random() - 0.5) * step),
            delay: dist * 1100,
            s: Math.floor(Math.random() * leaves.length),
          });
        }
      }
    }
    blooms.sort((a, b) => a.y - b.y);
    const covered = Math.max(...blooms.map((b) => b.delay)) + STAGE * 3;
    const reduced = reducedMotion();

    const fadeOut = (after) => {
      setTimeout(() => {
        canvas.classList.add("is-fading");
        setTimeout(release, reduced ? 700 : 1900);
      }, after);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const l of greens) {
        if (t < l.delay) continue;
        ctx.drawImage(leaves[l.s], l.x, l.y, lw, lw);
      }
      for (const b of blooms) {
        const p = t - b.delay;
        if (p < 0) continue;
        ctx.drawImage(flowers[b.v][Math.min(2, Math.floor(p / STAGE))], b.x, b.y, fw, fw);
      }
    };

    if (reduced) {
      draw(Infinity);
      canvas.classList.add("is-quick");
      fadeOut(1500);
      return 500;
    }

    const start = performance.now();
    const frame = (now) => {
      const t = now - start;
      draw(t);
      if (t < covered) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        fadeOut(450);
      }
    };
    raf = requestAnimationFrame(frame);
    return covered;
  }

  // Draw the sprites while she's still reading the intro, so the tap is instant
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
  setTimeout(() => idle(prepare, { timeout: 800 }), 2200);

  return { bloom };
})();
