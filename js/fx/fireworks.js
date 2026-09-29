/* Fireworks over the festival. */

"use strict";

/* ---------- Fireworks over the festival ---------- */

const Fireworks = (() => {
  const canvas = $("[data-fireworks]");
  const ctx = canvas.getContext("2d");
  const COLORS = ["#ff6b6b", "#ffd84a", "#6bd0ff", "#9bff7a", "#ff9df0", "#fff3d1"];
  const END = 16000;
  let raf = 0;

  // Patches of sky no box covers, in art pixels: bursts aim there so they are seen
  function openSky(px) {
    const boxes = $$(".page:not([hidden]) :is(.achievement, .frame, .meter, .dialog), .hud > *")
      .map((el) => el.getBoundingClientRect());
    const floor = window.innerHeight - groundH();
    const R = 10 * px;
    const spots = [];
    for (let y = R; y < floor - R; y += R / 2) {
      for (let x = R; x < window.innerWidth - R; x += R / 2) {
        const hit = boxes.some((b) => x - R < b.right && x + R > b.left && y - R < b.bottom && y + R > b.top);
        if (!hit) spots.push({ x: x / px, y: y / px });
      }
    }
    return spots;
  }

  // a few spots, as far apart as possible
  function spread(spots, n) {
    const picked = [];
    while (picked.length < n && spots.length) {
      let best = spots[0];
      let bestD = -1;
      for (const s of spots) {
        const d = picked.length ? Math.min(...picked.map((p) => Math.hypot(p.x - s.x, p.y - s.y))) : -s.y;
        if (d > bestD) { bestD = d; best = s; }
      }
      picked.push(best);
    }
    return picked;
  }

  function burst(sparks, r, speed = 16 + Math.random() * 10) {
    const n = 22 + Math.floor(Math.random() * 12);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const s = speed * (0.75 + Math.random() * 0.35);
      sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, age: 0, life: 1.1 + Math.random() * 0.6, color: r.color });
    }
  }

  function drawSparks(sparks, dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt;
      if (s.age > s.life) { sparks.splice(i, 1); continue; }
      s.vy += 20 * dt;
      s.vx *= 0.985;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.age > s.life * 0.65 && Math.random() < 0.5) continue; // crackle as it dies
      const big = s.age < s.life * 0.4 ? 2 : 1;
      ctx.fillStyle = s.age < 0.12 ? "#ffffff" : s.color;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), big, big);
    }
  }

  // One big burst on the grass, at x, y in CSS pixels (Mohaimen, exploding)
  function boom(x, y) {
    cancelAnimationFrame(raf);
    const size = artSize();
    fitCanvas(canvas, size);
    const { W, H, px } = size;
    const at = { x: x / px, y: y / px };
    const sparks = [];
    [["#fff3d1", 10], ["#ffd84a", 18], ["#ff6b6b", 26], ["#ff9df0", 34]].forEach(([color, speed]) => burst(sparks, { ...at, color }, speed));
    if (reducedMotion()) {
      sparks.forEach((s) => { ctx.fillStyle = s.color; ctx.fillRect(Math.round(s.x + s.vx / 3), Math.round(s.y + s.vy / 3), 1, 1); });
      setTimeout(() => { canvas.width = canvas.height = 0; }, 1500);
      return;
    }
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      drawSparks(sparks, dt);
      if (sparks.length) raf = requestAnimationFrame(frame);
      else { canvas.width = canvas.height = 0; raf = 0; }
    };
    raf = requestAnimationFrame(frame);
  }

  // with reduced motion the festival still gets its fireworks, frozen mid-burst
  function still(W, H, spots) {
    const bursts = spots.length
      ? spread(spots, 3).map((s, i) => [s.x / W, s.y / H, i * 2])
      : [[0.22, 0.14, 0], [0.74, 0.1, 2], [0.52, 0.26, 4]];
    bursts.forEach(([fx, fy, c]) => {
      const x = Math.round(W * fx);
      const y = Math.round(H * fy);
      [[9, 18, COLORS[c]], [5, 12, COLORS[c + 1]]].forEach(([r, n, color]) => {
        ctx.fillStyle = color;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2;
          ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
        }
      });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, 1, 1);
    });
  }

  function run() {
    cancelAnimationFrame(raf);
    const size = artSize();
    fitCanvas(canvas, size);
    const { W, H, px } = size;
    const spots = openSky(px);
    if (reducedMotion()) { still(W, H, spots); return; }
    const launchY = H - Math.ceil(groundH() / px) - 6;
    const rockets = [];
    const sparks = [];
    const start = performance.now();
    let last = start;
    let nextLaunch = start + 150;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now - start;
      if (t < END && now >= nextLaunch) {
        const aim = spots.length ? spots[Math.floor(Math.random() * spots.length)] : null;
        rockets.push({
          x: aim ? aim.x : W * (0.12 + Math.random() * 0.76),
          y: launchY,
          vy: -(60 + Math.random() * 30),
          top: aim ? aim.y : H * (0.06 + Math.random() * 0.26),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
        nextLaunch = now + (t < 6000 ? 380 + Math.random() * 380 : 1100 + Math.random() * 1200);
      }

      ctx.clearRect(0, 0, W, H);
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * dt;
        ctx.fillStyle = "#fff3d1";
        ctx.fillRect(Math.round(r.x), Math.round(r.y), 1, 2);
        ctx.fillStyle = "#f6c23e88";
        ctx.fillRect(Math.round(r.x), Math.round(r.y) + 2, 1, 2);
        if (r.y <= r.top) { rockets.splice(i, 1); burst(sparks, r); }
      }
      drawSparks(sparks, dt);

      if (t < END || rockets.length || sparks.length) {
        raf = requestAnimationFrame(frame);
      } else {
        canvas.width = canvas.height = 0;
        raf = 0;
      }
    };
    raf = requestAnimationFrame(frame);
  }

  return { run, boom };
})();
