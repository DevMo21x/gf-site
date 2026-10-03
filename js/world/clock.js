/* The clock in the corner. */

"use strict";

/* ---------- The clock in the corner ---------- */

const Clock = (() => {
  const plate = $("[data-clock]");
  const time = $("[data-clock-time]");
  const ctx = $("[data-clock-icon]").getContext("2d");
  const sun = Pixel.sun();
  const moon = Pixel.moon();
  let current = -1;

  // night: a night memory's own time (content.js story[].night), shown with the moon
  function set(index, night) {
    const key = night || index;
    if (key === current) return;
    const first = current === -1;
    current = key;
    time.textContent = night || CONTENT.hud.times[index] || "";
    ctx.clearRect(0, 0, 9, 9);
    (night || index >= 5 ? moon : sun).paint(ctx);
    // the plate hops when the hour changes
    if (!first && !reducedMotion()) {
      const P = PX();
      plate.animate([
        { transform: "translateY(0)" },
        { transform: `translateY(${-P * 2}px)` },
        { transform: "translateY(0)" },
      ], { duration: 360, easing: "steps(3, end)" });
    }
  }
  return { set };
})();
