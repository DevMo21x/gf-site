/* Gabrielle and Mohaimen on the grass. */

"use strict";

/* ---------- Gabrielle and Mohaimen, standing on the grass ---------- */

// what each face does to their whole-body sprite
const FACES = {
  neutral: {},
  nervous: { mouth: "flat", sweat: true, arm: "head", look: 0 },
  happy: { eyes: "happy", mouth: "open" },
  blush: { eyes: "happy", blush: true },
  soft: { blush: true },
  shocked: { eyes: "wide", mouth: "o", look: 0 },
  cheer: { eyes: "happy", mouth: "open", arm: "up", blush: true },
};

const Actors = (() => {
  function make(kind) {
    const wrap = $(`[data-actor="${kind}"]`);
    const ctx = $("[data-actor-canvas]", wrap).getContext("2d");
    const emoteEl = $("[data-emote]", wrap);
    const cache = new Map();
    let base = "neutral";   // the face they settle back into
    let face = base;
    let talking = false;
    let blink = 0;
    let tick = 0;
    let last = "";
    let faceTimer = 0;
    let emoteTimer = 0;
    let seated = false;     // on the Airbnb bed, shawarma in hand, eyes on the TV

    function draw() {
      const rest = seated ? { arm: "eat", sit: true, look: kind === "gab" ? -1 : 1 } : {};
      const p = Object.assign({ eyes: "open", mouth: "smile", look: 1, arm: "down" }, rest, FACES[face]);
      if (seated) p.sit = true;
      if (blink > 0 && p.eyes === "open") p.eyes = "blink";
      if (talking && tick % 2 === 0) p.mouth = "open";
      const key = [p.eyes, p.mouth, p.look, p.arm, p.blush, p.sweat, p.sit].join();
      if (key === last) return;
      last = key;
      let g = cache.get(key);
      if (!g) {
        g = Pixel.person(kind, p);
        cache.set(key, g);
      }
      g.paint(ctx);
    }

    // a slow heartbeat: blinks, and a mouth that moves while his words type out
    function loop() {
      tick += 1;
      if (blink > 0) blink -= 1;
      else if (Math.random() < 0.025) blink = 2;
      draw();
      setTimeout(loop, document.hidden ? 600 : 110);
    }
    setTimeout(loop, 110);

    // ms: show this face for a moment, then go back to the one before
    function setFace(next, ms) {
      clearTimeout(faceTimer);
      if (!FACES[next]) next = "neutral";
      face = next;
      wrap.dataset.face = next;
      if (ms) faceTimer = setTimeout(() => { face = base; wrap.dataset.face = base; draw(); }, ms);
      else base = next;
      draw();
    }

    function emote(kind, ms = 1600) {
      clearTimeout(emoteTimer);
      emoteEl.dataset.kind = kind;
      emoteEl.classList.remove("is-showing");
      void emoteEl.offsetWidth; // restart the pop
      emoteEl.classList.add("is-showing");
      Music.blip(1.5);
      emoteTimer = setTimeout(() => emoteEl.classList.remove("is-showing"), ms);
    }

    function jump() {
      wrap.classList.remove("is-jumping");
      void wrap.offsetWidth;
      wrap.classList.add("is-jumping");
      setTimeout(() => wrap.classList.remove("is-jumping"), 620);
    }

    function sit(on) {
      seated = on;
      wrap.classList.toggle("is-sitting", on);
      draw();
    }

    draw();
    return {
      setFace, emote, jump, sit,
      talk(on) { talking = on; draw(); },
      get rect() { return $("canvas", wrap).getBoundingClientRect(); },
    };
  }

  const gab = make("gab");
  const mo = make("mo");

  // No ran away again: he panics a little more each time
  function onDodge(n) {
    const face = n % 3 === 1 ? "shocked" : "nervous";
    Portrait.set(face, 900);
    mo.setFace(face, 900);
    if (n === 1 || n % 4 === 0) mo.emote("sweat");
  }

  // She said yes
  function celebrate() {
    Portrait.set("happy");
    mo.setFace("cheer");
    gab.setFace("cheer");
    gab.emote("heart", 2400);
    [0, 700, 1400].forEach((t, i) => setTimeout(() => {
      mo.jump();
      setTimeout(() => gab.jump(), 160);
      if (i === 1) mo.emote("heart", 2400);
    }, reducedMotion() ? 0 : t));
  }

  // In the Airbnb they sit on the bed; everywhere else they stand
  const sit = (on) => { gab.sit(on); mo.sit(on); };

  return { gab, mo, sit, onDodge, celebrate, rects: () => [gab.rect, mo.rect] };
})();
