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

  function set(index) {
    if (index === current) return;
    const first = current < 0;
    current = index;
    time.textContent = CONTENT.hud.times[index] || "";
    ctx.clearRect(0, 0, 9, 9);
    (index >= 5 ? moon : sun).paint(ctx);
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
