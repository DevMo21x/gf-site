/* Connect the stars: at night she joins them up into a heart. */

"use strict";

/* ---------- Connect the stars ---------- */

const Stars = (() => {
  const layer = $("[data-stars]");
  const canvas = $(".constellation__lines", layer);
  const count = $("[data-stars-count]", layer);
  const text = CONTENT.stars;
  const points = text.points;
  const segments = [];
  layer.setAttribute("aria-label", text.intro);

  // the lines between the stars, one art pixel wide, on the pixel grid
  function draw(color) {
    const P = PX();
    const W = Math.round(layer.clientWidth / P);
    const H = Math.round(layer.clientHeight / P);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    const at = ([x, y]) => [Math.round((x / 100) * (W - 1)), Math.round((y / 100) * (H - 1))];
    segments.forEach(([a, b]) => {
      let [x0, y0] = at(a);
      const [x1, y1] = at(b);
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        ctx.fillRect(x0, y0, 1, 1);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    });
  }
  function line(a, b) {
    segments.push([a, b]);
    draw("#fff3d1");
  }
  const counted = (n) => { count.textContent = text.label.replace("{n}", n).replace("{total}", points.length); };

  // Resolves once every star is joined and the heart has had its moment
  function run() {
    segments.length = 0;
    $$("button", layer).forEach((b) => b.remove());
    layer.classList.remove("is-done");
    layer.hidden = false;
    draw("#fff3d1");
    counted(1);
    document.body.classList.add("is-stargazing");
    let next = 0;
    const stars = points.map(([x, y], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "star";
      b.style.left = x + "%";
      b.style.top = y + "%";
      b.setAttribute("aria-label", text.label.replace("{n}", i + 1).replace("{total}", points.length));
      layer.appendChild(b);
      return b;
    });
    const mark = () => stars.forEach((b, i) => b.classList.toggle("is-next", i === next));
    mark();
    stars[0].focus({ preventScroll: true });
    if (!reducedMotion()) animateIn(layer, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "steps(4, end)" });

    return new Promise((resolve) => {
      stars.forEach((b, i) => b.addEventListener("click", () => {
        if (next >= stars.length) return;
        if (i !== next) {
          // not that one: a little shake toward the right one, no harm done
          Music.blip(0.5);
          if (!reducedMotion()) animateIn(stars[next], [0, -1, 1, 0].map((k) => ({ translate: `calc(-50% + ${k * 3}px) -50%` })), { duration: 240, easing: "steps(4, end)" });
          stars[next].focus({ preventScroll: true });
          return;
        }
        b.classList.add("is-lit");
        Music.blip(1 + next * 0.12);
        if (next > 0) line(points[next - 1], points[next]);
        next += 1;
        counted(Math.min(next + 1, stars.length));
        mark();
        if (next < stars.length) { stars[next].focus({ preventScroll: true }); return; }
        // the last one closes the heart
        segments.push([points[next - 1], points[0]]);
        draw("#f6c23e");
        layer.classList.add("is-done");
        Music.chime();
        Achievements.unlock("stars");
        setTimeout(() => {
          const a = reducedMotion() ? null : animate(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: "steps(4, end)" });
          const done = () => { if (a) a.cancel(); layer.hidden = true; document.body.classList.remove("is-stargazing"); resolve(); };
          if (a) a.onfinish = done; else done();
        }, reducedMotion() ? 900 : 1600);
      }));
    });
  }

  return { run };
})();
