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
    let lifting = false;    // both arms up, holding a memory's item over his head
    let holding = false;    // the bouquet held out in front of him
    let jacket = false;     // since the docks the jacket is hers: she wears it, he doesn't

    function draw() {
      const rest = seated ? { arm: "eat", sit: true, look: kind === "gab" ? -1 : 1 } : {};
      const p = Object.assign({ eyes: "open", mouth: "smile", look: 1, arm: "down" }, rest, FACES[face]);
      if (seated) p.sit = true;
      if (holding) p.arm = "hold";
      p.jacket = jacket;
      if (lifting) Object.assign(p, { arm: "up", eyes: "happy", mouth: "open" });
      if (blink > 0 && p.eyes === "open") p.eyes = "blink";
      if (talking && tick % 2 === 0) p.mouth = "open";
      const key = [p.eyes, p.mouth, p.look, p.arm, p.blush, p.sweat, p.sit, p.jacket].join();
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

    // Hold an item up over the head, with sparkles; resolves with the item (still showing) after ms
    function holdUp(item, ms = 1100) {
      const P = PX();
      const r = $("canvas", wrap).getBoundingClientRect();
      const x = Math.round(r.left + r.width / 2 - P * 8);
      const y = Math.round(r.top - P * 18);
      const el = document.createElement("div");
      el.className = "held";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = `<i class="item item--${item}"></i><i class="sparkle"></i><i class="sparkle"></i><i class="sparkle"></i>`;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      document.body.appendChild(el);
      lifting = true;
      draw();
      if (!reducedMotion()) {
        el.animate([
          { opacity: 0, transform: `translate3d(${x}px, ${y + P * 10}px, 0)` },
          { opacity: 1, transform: `translate3d(${x}px, ${y - P * 2}px, 0)`, offset: 0.6 },
          { opacity: 1, transform: `translate3d(${x}px, ${y}px, 0)` },
        ], { duration: 360, easing: "steps(4, end)" });
      }
      return new Promise((resolve) => setTimeout(() => {
        lifting = false;
        draw();
        resolve(el);
      }, reducedMotion() ? 0 : ms));
    }

    function hold(on) {
      holding = on;
      wrap.classList.toggle("is-holding", on);
      draw();
    }

    function swapJacket(on) {
      jacket = on;
      if (kind === "mo") Portrait.jacketOff(on); // the dialogue portrait too
      draw();
    }

    function sit(on) {
      seated = on;
      wrap.classList.toggle("is-sitting", on);
      draw();
    }

    draw();
    return {
      setFace, emote, jump, sit, holdUp, hold, swapJacket,
      talk(on) { talking = on; draw(); },
      get rect() { return $("canvas", wrap).getBoundingClientRect(); },
    };
  }

  const gab = make("gab");
  const mo = make("mo");

  // Double-tap him (or press him with the keyboard): a kiss. One tap only gets a "…"
  const kissBtn = $("[data-kiss]");
  const kiss = CONTENT.eggs.kiss;
  kissBtn.setAttribute("aria-label", kiss.label);
  let lastTap = 0;
  let lastKiss = -Infinity;
  let tapTimer = 0;
  kissBtn.addEventListener("click", (e) => {
    const now = performance.now();
    const double = e.detail === 0 || now - lastTap < 350; // detail 0: a key, not a finger
    lastTap = now;
    clearTimeout(tapTimer);
    if (!double) { tapTimer = setTimeout(() => mo.emote("dots", 1000), 360); return; }
    lastTap = 0;
    if (now - lastKiss < 3000) return;
    lastKiss = now;
    mo.setFace("shocked", 500);
    setTimeout(() => mo.setFace("blush", 3000), 500);
    Portrait.set("blush", 3500);
    gab.emote("heart");
    mo.jump();
    Music.chime();
    Mei.say(kiss.mei, 2200);
    setTimeout(() => Tufo.say(kiss.tufo, 1800), 1200);
    Achievements.unlock("kiss");
  });

  // No ran away again: he panics a little more each time
  function onDodge(n) {
    const face = n % 3 === 1 ? "shocked" : "nervous";
    Portrait.set(face, 900);
    mo.setFace(face, 900);
    if (n === 1 || n % 4 === 0) mo.emote("sweat");
  }

  // She said yes
  function celebrate() {
    mo.hold(false); // she took the flowers
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
