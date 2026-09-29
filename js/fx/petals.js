/* Falling hearts and confetti. */

"use strict";

/* ---------- Falling hearts & confetti ---------- */

const Petals = (() => {
  const canvas = $("[data-petals]");
  const ctx = canvas.getContext("2d");
  const heart = Pixel.heartSmall().canvas();
  const COLORS = ["#e0304e", "#f6c23e", "#7fcdf2", "#8fd05a", "#f58aa8", "#fff3d1", "#b79af0"];
  const DURATION = 7000;
  const SPAWN_FOR = 4800;
  let raf = 0;
  let size = null;

  function make(W, H, burst) {
    return {
      heart: Math.random() < 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.random() * W,
      y: burst ? -Math.random() * H * 0.6 : -8,
      vy: 12 + Math.random() * 16,
      sway: 2 + Math.random() * 4,
      swaySpeed: 1 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 3 + Math.random() * 4,
    };
  }

  function run() {
    if (reducedMotion()) return;
    cancelAnimationFrame(raf);
    size = artSize();
    fitCanvas(canvas, size);
    const { W, H } = size;
    const count = Math.round(Math.min(90, Math.max(50, W / 2)));
    const bits = Array.from({ length: Math.round(count * 0.35) }, () => make(W, H, true));
    const spawnRate = (count * 0.65) / SPAWN_FOR;
    let spawned = 0;
    const start = performance.now();
    let last = start;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - start;
      const due = Math.min(count * 0.65, elapsed * spawnRate);
      while (spawned < due) { bits.push(make(W, H, false)); spawned += 1; }

      const fade = elapsed > DURATION - 900 ? Math.max(0, (DURATION - elapsed) / 900) : 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.ceil(fade * 4) / 4; // fades in steps too

      for (const p of bits) {
        p.y += p.vy * dt;
        p.phase += p.swaySpeed * dt;
        p.flip += p.flipSpeed * dt;
        if (p.y > H + 8) continue;
        const x = Math.round(p.x + Math.sin(p.phase) * p.sway);
        const y = Math.round(p.y);
        if (p.heart) {
          ctx.drawImage(heart, x, y);
        } else {
          const wide = Math.cos(p.flip) > 0;
          ctx.fillStyle = p.color;
          ctx.fillRect(x, y, wide ? 2 : 1, wide ? 1 : 2);
        }
      }

      if (elapsed < DURATION) {
        raf = requestAnimationFrame(frame);
      } else {
        canvas.width = canvas.height = 0; // hand the GPU memory back
        raf = 0;
      }
    };
    raf = requestAnimationFrame(frame);
  }

  return { run };
})();
