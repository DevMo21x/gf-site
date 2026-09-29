/* Connect the stars: at night she joins them up into a heart. */

"use strict";

/* ---------- Connect the stars ---------- */

const Stars = (() => {
  const layer = $("[data-stars]");
  const svg = $("svg", layer);
  const text = CONTENT.stars;
  const points = text.points;
  layer.setAttribute("aria-label", text.intro);

  function line(a, b) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    [["x1", a[0]], ["y1", a[1]], ["x2", b[0]], ["y2", b[1]]].forEach(([k, v]) => l.setAttribute(k, v));
    svg.appendChild(l);
  }

  // Resolves once every star is joined and the heart has had its moment
  function run() {
    svg.replaceChildren();
    $$("button", layer).forEach((b) => b.remove());
    layer.classList.remove("is-done");
    layer.hidden = false;
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
        mark();
        if (next < stars.length) { stars[next].focus({ preventScroll: true }); return; }
        // the last one closes the heart
        line(points[next - 1], points[0]);
        layer.classList.add("is-done");
        Music.chime();
        Achievements.unlock("stars");
        setTimeout(() => {
          const a = reducedMotion() ? null : animate(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: "steps(4, end)" });
          const done = () => { if (a) a.cancel(); layer.hidden = true; resolve(); };
          if (a) a.onfinish = done; else done();
        }, reducedMotion() ? 900 : 1600);
      }));
    });
  }

  return { run };
})();
