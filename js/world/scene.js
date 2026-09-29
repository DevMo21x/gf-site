/* The farm backdrop: sky and time of day. */

"use strict";

/* ---------- The farm: sky and time of day ---------- */

const Scene = (() => {
  const TIMES = ["dawn", "morning", "noon", "afternoon", "sunset", "night", "festival"];
  const skies = $$("[data-sky]");
  const clouds = $("[data-clouds]");
  const flies = $("[data-flies]");
  const meta = $('meta[name="theme-color"]');
  const moonHit = $("[data-moon]");
  let front = 0;
  let time = TIMES[0];
  let place = "";   // a memory's place (content.js story[].place), or "" for the farm
  // places that happened at another time of day than the clock says
  const PLACE_TIMES = { docks: "night" };

  function paint(canvas) {
    const info = Pixel.scene(canvas, time, PX(), groundH(), place, cssNumber("--stand", 29));
    root.style.setProperty("--sky", info.sky);
    if (meta) meta.content = info.sky;
  }

  function set(index, where = "") {
    const next = PLACE_TIMES[where] || TIMES[Math.min(index, TIMES.length - 1)];
    if (next === time && where === place) return;
    time = next;
    place = where;
    const back = 1 - front;
    paint(skies[back]);
    skies[back].classList.add("is-front");
    skies[front].classList.remove("is-front");
    front = back;
    document.body.dataset.time = time;
    document.body.dataset.place = place;
    placeMoon();
  }

  // an invisible button over the moon, so she can wish on it (same maths as Pixel.scene)
  function placeMoon() {
    const body = Pixel.TIMES[time].body;
    moonHit.hidden = body.kind !== "moon" || (place !== "" && place !== "docks");
    if (moonHit.hidden) return;
    const px = PX();
    const W = Math.ceil(window.innerWidth / px) + 1;
    const H = Math.ceil(window.innerHeight / px) + 1;
    const horizon = H - Math.ceil(groundH() / px) - 4;
    const r = (body.r + 3) * px;
    moonHit.style.width = moonHit.style.height = r * 2 + "px";
    moonHit.style.left = Math.round(body.x * W) * px - r + "px";
    moonHit.style.top = Math.round(body.y * horizon) * px - r + "px";
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
      resizeTimer = setTimeout(() => { paint(skies[front]); placeMoon(); }, 150);
    });
  }

  return { init, set };
})();
