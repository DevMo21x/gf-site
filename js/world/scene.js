/* The farm backdrop: sky and time of day. */

"use strict";

/* ---------- The farm: sky and time of day ---------- */

const Scene = (() => {
  const TIMES = ["dawn", "morning", "noon", "afternoon", "sunset", "night", "festival"];
  const skies = $$("[data-sky]");
  const clouds = $("[data-clouds]");
  const flies = $("[data-flies]");
  const meta = $('meta[name="theme-color"]');
  let front = 0;
  let time = TIMES[0];

  function paint(canvas) {
    const info = Pixel.scene(canvas, time, PX(), groundH());
    root.style.setProperty("--sky", info.sky);
    if (meta) meta.content = info.sky;
  }

  function set(index) {
    const next = TIMES[Math.min(index, TIMES.length - 1)];
    if (next === time) return;
    time = next;
    const back = 1 - front;
    paint(skies[back]);
    skies[back].classList.add("is-front");
    skies[front].classList.remove("is-front");
    front = back;
    document.body.dataset.time = time;
  }

  function makeClouds() {
    const px = PX();
    [0.07, 0.19, 0.31].forEach((top, i) => {
      const g = Pixel.cloud(i);
      const el = document.createElement("i");
      el.className = "cloud";
      el.style.top = top * 100 + "%";
      el.style.width = g.w * px + "px";
      el.style.height = g.h * px + "px";
      el.style.backgroundImage = `url("${g.url()}")`;
      const dur = 120 + i * 45;
      el.style.setProperty("--dur", dur + "s");
      el.style.setProperty("--delay", -(dur * (0.15 + i * 0.3)) + "s");
      clouds.appendChild(el);
    });
  }

  function makeFlies() {
    const rand = Pixel.seeded(11);
    for (let i = 0; i < 9; i++) {
      const el = document.createElement("i");
      el.className = "fly";
      el.style.setProperty("--x", (4 + rand() * 88).toFixed(1) + "%");
      el.style.setProperty("--y", (38 + rand() * 44).toFixed(1) + "%");
      el.style.setProperty("--d", (3 + rand() * 4).toFixed(1) + "s");
      el.style.animationDelay = (-rand() * 6).toFixed(1) + "s";
      flies.appendChild(el);
    }
  }

  let resizeTimer = 0;
  function init() {
    paint(skies[0]);
    document.body.dataset.time = time;
    makeClouds();
    makeFlies();
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => paint(skies[front]), 150);
    });
  }

  return { init, set };
})();
