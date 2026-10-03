/* Shared cat machinery: sprites, speech bubbles, moods. */

"use strict";

/* ---------- The cats: pixel sprites driven by their mood classes ---------- */

function catSprite(wrap, canvas, kind) {
  const ctx = canvas.getContext("2d");
  const cache = new Map();
  const has = (c) => wrap.classList.contains(c);
  let look = 0;
  let tail = 0;
  let blink = 0;
  let step = 0;
  let twitch = 0;
  let tick = 0;
  let swat = [];
  let wasSwatting = false;
  let last = "";

  function pose() {
    const hissing = has("is-hissing");
    let eyes = "open";
    if (has("is-happy") || has("is-purring")) eyes = "happy";
    else if (has("is-startled")) eyes = "wide";
    else if (blink > 0) eyes = "blink";
    return {
      eyes,
      look,
      mouth: hissing ? "hiss" : has("is-meowing") ? "meow" : "closed",
      ears: hissing ? "back" : has("is-twitching") && twitch ? "twitch" : "up",
      tail,
      paw: swat.length ? swat[0] : 0,
      step: has("is-walking") ? step : -1,
    };
  }

  function draw() {
    const p = pose();
    const key = [p.eyes, p.look, p.mouth, p.ears, p.tail, p.paw, p.step].join();
    if (key === last) return;
    last = key;
    let g = cache.get(key);
    if (!g) {
      g = Pixel.cat(kind, p);
      cache.set(key, g);
    }
    g.paint(ctx);
  }

  // a slow heartbeat: tail swishes, blinks, walking feet
  function loop() {
    tick += 1;
    const walking = has("is-walking");
    if (!reducedMotion()) {
      if (walking || has("is-excited")) tail = tick % 2;
      else if (kind === "mei") { if (tick % 9 === 0) tail ^= 1; }
      else { const ph = tick % 28; tail = ph === 18 || ph === 20 ? 1 : 0; } // Tufo: irritated flicks
      step = walking ? tick % 2 : 0;
    }
    if (blink > 0) blink -= 1;
    else if (Math.random() < (kind === "mei" ? 0.03 : 0.014)) blink = 2;
    twitch = has("is-twitching") ? (tick >> 1) % 2 : 0;
    if (swat.length) swat.shift();
    draw();
    setTimeout(loop, document.hidden ? 600 : 100);
  }
  setTimeout(loop, 100);

  new MutationObserver(() => {
    const swatting = has("is-swatting");
    if (swatting && !wasSwatting) swat = [1, 2, 2, 2, 1];
    wasSwatting = swatting;
    draw();
  }).observe(wrap, { attributes: true, attributeFilter: ["class"] });

  draw();
  return { look(v) { if (v !== look) { look = v; draw(); } } };
}

// On a phone the two speech bubbles would overlap, so the cats take turns
const Chatter = { until: 0 };

function makeCat(name) {
  const wrap = $(`[data-cat="${name}"]`);
  const button = $("[data-cat-button]", wrap);
  const bubble = $("[data-cat-bubble]", wrap);
  const sprite = catSprite(wrap, $("[data-cat-canvas]", wrap), name);
  const STATES = ["is-happy", "is-meowing", "is-purring", "is-jumping", "is-twitching", "is-excited", "is-hissing", "is-swatting", "is-startled"];

  let x = -140;
  let bubbleTimer = 0;
  let speakTimer = 0;
  let stateTimer = 0;
  let page = 0; // bumps on every page change so stale lines never play late

  const width = () => wrap.offsetWidth || 78;

  // A little way off to one side of the middle, never at the far edge of a big screen;
  // once Gabrielle and Mohaimen stand there, far enough out that a bubble won't cover them
  function spotFor(side) {
    const vw = document.documentElement.clientWidth;
    const w = width();
    const reach = Math.min(vw / 2 - w / 2 - 12, document.body.dataset.scene === "title" ? 250 : 340);
    return vw / 2 - w / 2 + (side === "left" ? -reach : reach);
  }

  function face(right) {
    wrap.classList.toggle("is-facing-right", right);
  }

  function place(target, walk, pace = 5.5) {
    const vw = document.documentElement.clientWidth;
    target = Math.max(8, Math.min(vw - width() - 8, target)); // never off screen
    const dist = Math.abs(target - x);
    face(target > x);
    wrap.classList.toggle("is-right", target > document.documentElement.clientWidth / 2);

    if (!walk || reducedMotion() || dist < 4) {
      wrap.style.transition = "none";
      wrap.style.transform = `translate3d(${target}px, 0, 0)`;
      x = target;
      return Promise.resolve();
    }
    const running = pace < 4;
    const ms = Math.max(running ? 420 : 700, Math.min(2600, dist * pace));
    wrap.classList.add("is-walking");
    wrap.classList.toggle("is-running", running);
    wrap.style.transition = `transform ${ms}ms linear`;
    wrap.style.transform = `translate3d(${target}px, 0, 0)`;
    x = target;
    return new Promise((resolve) => setTimeout(() => {
      wrap.classList.remove("is-walking", "is-running");
      resolve();
    }, ms));
  }

  function say(line, ms = 2600) {
    if (!line) return;
    const now = performance.now();
    const narrow = document.documentElement.clientWidth < 700;
    const wait = narrow && Chatter.until > now && Chatter.owner !== name ? Chatter.until - now + 150 : 0;
    Chatter.until = now + wait + ms;
    Chatter.owner = name;
    clearTimeout(speakTimer);
    speakTimer = setTimeout(() => {
      clearTimeout(bubbleTimer);
      // open the bubble toward the middle of the screen, from where the cat is (or is heading)
      wrap.classList.toggle("is-right", x + width() / 2 > document.documentElement.clientWidth / 2);
      bubble.textContent = line;
      bubble.classList.add("is-showing");
      bubbleTimer = setTimeout(() => bubble.classList.remove("is-showing"), ms);
    }, wait);
  }

  // new page: drop anything queued or showing, and hand out a fresh token
  function hush() {
    clearTimeout(speakTimer);
    clearTimeout(bubbleTimer);
    bubble.classList.remove("is-showing");
    if (Chatter.owner === name) Chatter.until = 0;
    page += 1;
    return page;
  }
  const current = (token) => token === page;

  function mood(cls, ms) {
    wrap.classList.remove(...STATES);
    void wrap.offsetWidth; // restart the keyframes
    clearTimeout(stateTimer);
    wrap.classList.add(...cls);
    stateTimer = setTimeout(() => wrap.classList.remove(...cls), ms);
  }

  function hearts(n = 4) {
    const made = [];
    const P = PX();
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = "cat__heart";
      wrap.appendChild(h);
      // whole-pixel drift, stepped like the rest of the world
      const dx = Math.round(((Math.random() - 0.5) * 70) / P) * P;
      const rise = Math.round((50 + Math.random() * 40) / P) * P;
      const a = h.animate(reducedMotion()
        ? [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }]
        : [
          { opacity: 0, transform: "translate3d(0, 0, 0)" },
          { opacity: 1, transform: `translate3d(${dx * 0.4}px, ${-rise * 0.4}px, 0)`, offset: 0.3 },
          { opacity: 0, transform: `translate3d(${dx}px, ${-rise}px, 0)` },
        ], { duration: 1300 + Math.random() * 500, delay: i * 110, easing: "steps(10, end)", fill: "both" });
      a.onfinish = () => h.remove();
      made.push(h);
    }
    return made;
  }

  // Eyes follow the pointer, one pixel at a time
  let eyeRaf = 0;
  let target = null;
  function lookAt(px, py) {
    target = { x: px, y: py };
    if (eyeRaf) return;
    eyeRaf = requestAnimationFrame(() => {
      eyeRaf = 0;
      const r = button.getBoundingClientRect();
      const dx = target.x - (r.left + r.width * 0.46);
      const flip = wrap.classList.contains("is-facing-right") ? -1 : 1;
      sprite.look(Math.abs(dx) < 40 ? 0 : Math.sign(dx) * flip);
    });
  }
  window.addEventListener("pointermove", (e) => lookAt(e.clientX, e.clientY), { passive: true });

  function lookAtEl(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    lookAt(r.left + r.width / 2, r.top + r.height / 2);
  }

  const pick = (list, avoid) => {
    if (!Array.isArray(list)) return list;
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (i === avoid.last && list.length > 1);
    avoid.last = i;
    return list[i];
  };

  return {
    wrap, button, width, spotFor, place, face, say, hush, current, mood, hearts, lookAtEl, pick,
    get x() { return x; },
    get rect() { return button.getBoundingClientRect(); },
  };
}

const otherSide = (side) => (side === "left" ? "right" : "left");
