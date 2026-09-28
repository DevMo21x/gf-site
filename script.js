/* ==========================================================================
   ✏️  EDIT THE WORDS HERE
   Everything she reads lives in this one object.
   Wrap a word in *asterisks* to make it italic + terracotta, e.g. "*angel*".
   ========================================================================== */

const CONTENT = {
  pageTitle: "For Gabrielle",

  intro: {
    title: "Hey my sweet beautiful *angel*...",
    body: "I made you a little something. Turn your sound on if you can.",
    button: "Tap to begin",
  },

  memories: [
    {
      title: "The first time I saw you in *person*",
      body: "Our first time meeting in person, and how nervous I was. So, so nervous. Worth every second of it.",
    },
    {
      title: "Me, you, my jacket, and the docks of *Halifax*",
      body: "Our cute, intense little moment over my jacket on the docks of Halifax. I still think about it.",
    },
    {
      title: "Leftover shawarma, *late* at night",
      body: "Eating the leftover shawarma while watching CaseOh late at night. Honestly one of my favourite kinds of night.",
    },
  ],

  nextButton: "Next",

  loves: {
    title: "Things I love about *you*",
    items: [
      "You're the funniest girl I've ever met in my life.",
      "You're kind-hearted, gentle and caring with every living organism around you.",
      "You're thoughtful, and the most beautiful girl on this whole hooooole planet!",
    ],
    revealButton: "Tap to see one",
    moreButton: "Tap for another one",
    doneButton: "Next",
  },

  question: {
    lead: "Gabrielle Doney,",
    title: "Will you be my *girlfriend*?",
    yes: "Yes",
    // The No button cycles through these every time it runs away
    no: ["No", "Are you sure?", "Really?", "Think again", "Nope, try Yes", "Bruh"],
  },

  celebration: {
    title: "Welcome to the *family*.",
    body: "You'll meet all 200 cousins at the next gathering. Name tags not provided.",
    signoff: "Mohaimen, your new owner :)",
  },

  photos: {
    intro: { src: "images/us-cheek.webp", alt: "Gabrielle and Mohaimen cheek to cheek under the trees, smiling" },
    celebration: { src: "images/us-cake.webp", alt: "Gabrielle holding a slice of cake next to Mohaimen doing a peace sign" },
  },

  sound: {
    mute: "Mute music",
    unmute: "Play music",
  },

  // Mei the cat: everything she says
  mei: {
    label: "Mei the cat. Tap to pet her.",
    hint: "psst… you can pet me",
    hello: "hi! I'm Mei",
    purr: "prrrrrr…",
    blink: "*slow blink* (that means I love you)",
    lines: ["mrrp?", "meow!", "Mei approves of you", "again. pet me again.", "you smell like shawarma", "I'm on your side"],
    // things she says when a page opens (by page number, starting at 0)
    pages: {
      1: "ooh, I remember this",
      3: "I would've eaten that shawarma",
      4: "all true, I checked",
      5: "psst… say yes",
      6: "welcome to the family!",
    },
    dodge: ["hehe, nope", "that button's shy", "try the big one"],
  },

  progress: "Page {n} of {total}",
};

/* ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = () => reducedMotionQuery.matches;

  /* ---------- Content ---------- */

  const escapeHTML = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // *word* → <em>word</em>, everything else escaped
  const format = (str) => escapeHTML(str).replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const lookup = (path) =>
    path.split(".").reduce((obj, key) => (obj == null ? undefined : obj[key]), CONTENT);

  function splitWords(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 1) { splitWords(child); return; }
      if (child.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement("span");
        const inner = document.createElement("span");
        outer.className = "w";
        outer.setAttribute("aria-hidden", "true");
        inner.className = "wi";
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      node.replaceChild(frag, child);
    });
  }

  function renderContent() {
    $$("[data-text]").forEach((el) => {
      const value = lookup(el.dataset.text);
      if (typeof value === "string") el.innerHTML = format(value);
    });
    // headings rise word by word from behind a mask
    $$(".display, .card__title, .question__ask").forEach((el) => {
      el.setAttribute("aria-label", el.textContent);
      splitWords(el);
    });
    $$("[data-photo]").forEach((img) => {
      const photo = CONTENT.photos[img.dataset.photo];
      if (!photo) return;
      img.src = photo.src;
      img.alt = photo.alt;
    });
    document.title = CONTENT.pageTitle;
  }

  /* ---------- Plant (progress) ---------- */

  const Plant = (() => {
    const root = $("[data-plant]");
    const leaves = $$("[data-leaf]", root);
    const bud = $(".plant__bud", root);
    const flower = $(".plant__flower", root);

    function set(stage, total) {
      root.dataset.stage = String(stage);
      root.setAttribute(
        "aria-label",
        CONTENT.progress.replace("{n}", stage + 1).replace("{total}", total)
      );
      leaves.forEach((leaf) => leaf.classList.toggle("is-grown", Number(leaf.dataset.leaf) <= stage));
      const blooming = stage >= total - 1;
      bud.classList.toggle("is-grown", stage === total - 2);
      bud.classList.toggle("is-gone", blooming);
      flower.classList.toggle("is-grown", blooming);
    }

    return { set };
  })();

  /* ---------- Pages & choreography ---------- */

  const EASE = {
    out: "cubic-bezier(.16, 1, .3, 1)",      // long, soft landing
    in: "cubic-bezier(.55, 0, .75, .25)",    // lift off
    settle: "cubic-bezier(.34, 1.4, .64, 1)", // tiny overshoot, like paper settling
  };

  const animate = (el, frames, opts) =>
    el && el.animate ? el.animate(frames, Object.assign({ fill: "both" }, opts)) : null;

  // entrance animations hand the element back to its stylesheet when done
  const animateIn = (el, frames, opts) => {
    const a = animate(el, frames, opts);
    if (a) a.onfinish = () => a.cancel();
    return a;
  };

  // Everything on a page arrives in order: the page is set down, the photo is
  // tossed on, the heading rises word by word, then the rest, then the sprigs.
  function arrive(page) {
    if (reducedMotion()) {
      animateIn(page, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear" });
      return 200;
    }

    animateIn(page, [
      { opacity: 0, transform: "translate3d(0, 34px, 0) rotate(1.8deg) scale(1.025)" },
      { opacity: 1, offset: 0.35 },
      { opacity: 1, transform: "none" },
    ], { duration: 1100, easing: EASE.out });

    const print = $(".print", page);
    animateIn(print, [
      { opacity: 0, translate: "46px -38px", rotate: "14deg", scale: "1.12" },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, translate: "0 0", rotate: "0deg", scale: "1" },
    ], { duration: 1300, delay: 120, easing: EASE.settle });

    const words = $$(".wi", page);
    const wordStart = print ? 380 : 220;
    words.forEach((w, i) => {
      animateIn(w, [
        { transform: "translate3d(0, 108%, 0) rotate(5deg)", opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { transform: "none", opacity: 1 },
      ], { duration: 1000, delay: wordStart + i * 55, easing: EASE.out });
    });
    const afterWords = wordStart + words.length * 55;

    $$(".lede, .card__body, .signoff, .answers, [data-action]", page)
      .filter((el) => !el.closest(".answers") || el.matches(".answers"))
      .forEach((el, i) => {
        animateIn(el, [
          { opacity: 0, transform: "translate3d(0, 18px, 0)" },
          { opacity: 1, transform: "none" },
        ], { duration: 900, delay: afterWords + 60 + i * 110, easing: EASE.out });
      });

    $$(".doodle", page).forEach((d, i) => {
      animateIn(d, [
        { opacity: 0, scale: "0.25", rotate: "-38deg" },
        { opacity: 1, scale: "1", rotate: "0deg" },
      ], { duration: 1200, delay: 300 + i * 160, easing: EASE.settle });
    });

    return afterWords + 900;
  }

  // The current page is picked up and slid off the table.
  function depart(page) {
    if (reducedMotion()) {
      const a = animate(page, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "linear" });
      return a ? a.finished.catch(() => {}) : Promise.resolve();
    }
    const a = animate(page, [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translate3d(-4%, -30px, 0) rotate(-3.5deg) scale(.96)" },
    ], { duration: 560, easing: EASE.in });
    return a ? a.finished.catch(() => {}) : Promise.resolve();
  }

  const Pages = (() => {
    const pages = $$("[data-page]").sort((a, b) => a.dataset.page - b.dataset.page);
    let index = 0;
    let busy = false;

    function show(next, onShown) {
      if (busy || next === index || !pages[next]) return;
      busy = true;

      const from = pages[index];
      const to = pages[next];
      from.inert = true;
      const leaving = depart(from);

      setTimeout(() => {
        to.hidden = false;
        to.inert = false;
        index = next;
        Plant.set(index, pages.length);
        arrive(to);
        Mei.onPage(index, to);

        const heading = $("h1, h2", to);
        if (heading) heading.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "auto" });

        if (onShown) onShown(to);
      }, reducedMotion() ? 80 : 300);

      leaving.then(() => {
        from.hidden = true;
        from.getAnimations({ subtree: true }).forEach((a) => a.cancel());
        busy = false;
      });
    }

    function next(onShown) {
      show(index + 1, onShown);
    }

    function init() {
      pages.forEach((page, i) => {
        if (i !== 0) page.inert = true;
      });
      Plant.set(0, pages.length);

      // wait for the fonts and the first photo (max 700ms) so the entrance
      // starts on a clean frame instead of fighting the first paint
      const intro = pages[0];
      const img = $("img", intro);
      intro.style.opacity = "0";
      const assets = Promise.all([
        document.fonts ? document.fonts.ready : null,
        img && img.decode ? img.decode().catch(() => {}) : null,
      ]);
      const cap = new Promise((r) => setTimeout(r, 700));
      Promise.race([assets, cap]).then(() => requestAnimationFrame(() => {
        intro.style.opacity = "";
        arrive(intro);
      }));
    }

    return { init, next, show, get index() { return index; }, get busy() { return busy; } };
  })();

  /* ---------- Things I love about you ---------- */

  const Loves = (() => {
    const list = $("[data-loves]");
    const button = $('[data-action="reveal"]');
    const label = $("[data-reveal-label]");
    let shown = 0;

    const LOVE_ICONS = ["icon-laugh", "icon-ladybug", "icon-planet"];
    const done = () => shown >= CONTENT.loves.items.length;

    function updateLabel() {
      const { revealButton, moreButton, doneButton } = CONTENT.loves;
      label.textContent = done() ? doneButton : shown === 0 ? revealButton : moreButton;
    }

    function reveal() {
      if (done()) {
        Pages.next();
        return;
      }
      const li = document.createElement("li");
      li.className = "is-new";
      const icon = LOVE_ICONS[shown] || "leaf-bullet";
      li.innerHTML =
        '<svg aria-hidden="true" focusable="false"><use href="#' + icon + '"/></svg><span>' +
        format(CONTENT.loves.items[shown]) +
        "</span>";
      list.appendChild(li);
      shown += 1;
      updateLabel();
    }

    button.addEventListener("click", reveal);
    updateLabel();
  })();

  /* ---------- The No button that won't be caught ---------- */

  const Dodge = (() => {
    const no = $("[data-no]");
    const yes = $('[data-action="yes"]');
    const slot = $("[data-no-slot]");
    const layer = $("[data-dodge-layer]");
    const soundToggle = $("[data-sound-toggle]");
    const question = $(".question");
    const labels = CONTENT.question.no;

    const MARGIN = 12;
    const MAX_YES = 1.8;
    let dodges = 0;
    let yesScale = 1;
    let loose = false;
    let pos = { x: 0, y: 0 };
    let pointer = null;
    let refocusing = false;
    let lastDodge = 0;

    no.textContent = labels[0];

    const viewport = () => {
      const vv = window.visualViewport;
      return {
        w: Math.min(document.documentElement.clientWidth, vv ? vv.width : Infinity),
        h: Math.min(window.innerHeight, vv ? vv.height : Infinity),
      };
    };

    const inflate = (r, by) => ({ left: r.left - by, top: r.top - by, right: r.right + by, bottom: r.bottom + by });
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

    // Where Yes will be once its grow animation settles
    function yesTargetRect() {
      const r = yes.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const w = yes.offsetWidth * yesScale;
      const h = yes.offsetHeight * yesScale;
      return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 };
    }

    function detach() {
      const r = no.getBoundingClientRect();
      const hadFocus = document.activeElement === no;
      slot.hidden = true; // Yes gets the row to itself
      pos = { x: r.left, y: r.top };
      no.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      no.classList.add("is-loose");
      layer.appendChild(no);
      if (hadFocus) {
        refocusing = true;
        no.focus({ preventScroll: true });
        refocusing = false;
      }
      void no.offsetWidth;
      loose = true;
    }

    function pickSpot() {
      const { w: vw, h: vh } = viewport();
      const bw = no.offsetWidth;
      const bh = no.offsetHeight;
      const maxX = Math.max(MARGIN, vw - bw - MARGIN);
      const maxY = Math.max(MARGIN, vh - bh - MARGIN);

      const avoid = [inflate(yesTargetRect(), 18), inflate(soundToggle.getBoundingClientRect(), 10), inflate(Mei.rect, 8)];
      const prefer = [inflate(question.getBoundingClientRect(), 6)]; // try not to cover the question
      const current = { left: pos.x, top: pos.y, right: pos.x + bw, bottom: pos.y + bh };
      const reach = Math.max(bw, bh) / 2 + 56;
      const near = pointer
        ? { left: pointer.x - reach, top: pointer.y - reach, right: pointer.x + reach, bottom: pointer.y + reach }
        : null;

      let best = null;
      let bestScore = -Infinity;
      for (let i = 0; i < 90; i++) {
        const x = MARGIN + Math.random() * (maxX - MARGIN);
        const y = MARGIN + Math.random() * (maxY - MARGIN);
        const rect = { left: x, top: y, right: x + bw, bottom: y + bh };
        if (avoid.some((a) => overlaps(rect, a))) continue;
        let score = Math.hypot(x - pos.x, y - pos.y);
        if (overlaps(rect, current)) score -= 10000;
        if (near && overlaps(rect, near)) score -= 5000;
        if (prefer.some((a) => overlaps(rect, a))) score -= 2000;
        if (score > 0) return { x, y };
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
      if (best) return best;

      // Fallback: the viewport corner furthest from Yes
      const y0 = yesTargetRect();
      const corners = [
        { x: MARGIN, y: MARGIN + 60 },
        { x: maxX, y: maxY },
        { x: MARGIN, y: maxY },
        { x: maxX, y: MARGIN + 60 },
      ].filter((c) => !overlaps({ left: c.x, top: c.y, right: c.x + bw, bottom: c.y + bh }, y0));
      return corners[Math.floor(Math.random() * corners.length)] || { x: MARGIN, y: maxY };
    }

    function place(spot) {
      const { w: vw, h: vh } = viewport();
      pos = {
        x: Math.min(Math.max(spot.x, MARGIN), Math.max(MARGIN, vw - no.offsetWidth - MARGIN)),
        y: Math.min(Math.max(spot.y, MARGIN), Math.max(MARGIN, vh - no.offsetHeight - MARGIN)),
      };
      no.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    }

    function dodge(event) {
      if (refocusing) return;
      if (event && event.cancelable) event.preventDefault();

      // one touch fires pointerenter + pointerdown + touchstart: count it once
      const now = performance.now();
      if (now - lastDodge < 120) return;
      lastDodge = now;

      if (!loose) detach();
      dodges += 1;
      no.textContent = labels[dodges % labels.length];

      yesScale = Math.min(MAX_YES, yesScale * 1.1);
      yes.style.setProperty("--yes-scale", yesScale.toFixed(3));

      place(pickSpot());
      Mei.onDodge();
    }

    function rememberPointer(e) {
      const t = e.touches ? e.touches[0] : e;
      if (t) pointer = { x: t.clientX, y: t.clientY };
    }

    no.addEventListener("pointerenter", (e) => { rememberPointer(e); dodge(e); });
    no.addEventListener("pointerdown", (e) => { rememberPointer(e); dodge(e); });
    no.addEventListener("touchstart", (e) => { rememberPointer(e); dodge(e); }, { passive: false });
    no.addEventListener("focus", () => { pointer = null; dodge(); });
    no.addEventListener("click", (e) => { e.preventDefault(); dodge(); });
    no.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dodge(); }
    });
    window.addEventListener("pointermove", rememberPointer, { passive: true });

    // Keep it on screen (and off Yes) when the viewport changes
    function refit() {
      if (!loose) return;
      const { w: vw, h: vh } = viewport();
      const rect = { left: pos.x, top: pos.y, right: pos.x + no.offsetWidth, bottom: pos.y + no.offsetHeight };
      const outside = rect.right > vw - MARGIN || rect.bottom > vh - MARGIN || rect.left < MARGIN || rect.top < MARGIN;
      if (outside || overlaps(rect, inflate(yesTargetRect(), 18))) place(pickSpot());
    }
    window.addEventListener("resize", refit);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", refit);

    function retire() {
      no.classList.add("is-gone");
      no.tabIndex = -1;
      no.setAttribute("aria-hidden", "true");
    }

    return { retire };
  })();

  /* ---------- Music (Web Audio, no files) ----------
     A slow romantic waltz in F major, 3/4 at 72 BPM, 16 bars that loop:
     electric-piano melody, rolling broken chords, a string pad, soft bass,
     all in a generated hall reverb. */

  const Music = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const BPM = 72;
    const BEAT = 60 / BPM;
    const BAR = BEAT * 3;
    const VOLUME = 0.1;
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

    // root = bass note, tones = chord voicing (MIDI)
    const CHORDS = {
      Fmaj7: { root: 41, tones: [53, 57, 60, 64] },
      Am7: { root: 45, tones: [52, 55, 57, 60] },
      Dm7: { root: 38, tones: [53, 57, 60, 62] },
      Bbmaj7: { root: 46, tones: [53, 57, 58, 62] },
      Gm7: { root: 43, tones: [53, 55, 58, 62] },
      Csus: { root: 36, tones: [53, 55, 58, 60] },
      C7: { root: 36, tones: [52, 55, 58, 60] },
    };

    // [chord, beats] and melody [note | null, beats]
    const SONG = [
      [[["Fmaj7", 3]], [[72, 2], [69, 1]]],
      [[["Am7", 3]], [[76, 1.5], [74, 0.5], [72, 1]]],
      [[["Dm7", 3]], [[74, 2], [69, 1]]],
      [[["Bbmaj7", 3]], [[77, 1.5], [76, 0.5], [74, 1]]],
      [[["Gm7", 3]], [[74, 1], [72, 1], [70, 1]]],
      [[["Csus", 1.5], ["C7", 1.5]], [[72, 1.5], [70, 0.5], [67, 1]]],
      [[["Fmaj7", 3]], [[69, 3]]],
      [[["Bbmaj7", 1.5], ["C7", 1.5]], [[70, 1.5], [69, 0.5], [67, 1]]],
      [[["Fmaj7", 3]], [[72, 1], [77, 2]]],
      [[["Am7", 3]], [[76, 1.5], [74, 0.5], [72, 1]]],
      [[["Dm7", 3]], [[74, 1], [76, 1], [77, 1]]],
      [[["Bbmaj7", 3]], [[77, 2], [74, 1]]],
      [[["Gm7", 3]], [[74, 1.5], [72, 0.5], [70, 1]]],
      [[["C7", 3]], [[69, 1], [67, 1], [72, 1]]],
      [[["Fmaj7", 3]], [[72, 1.5], [69, 0.5], [65, 1]]],
      [[["Gm7", 1.5], ["C7", 1.5]], [[67, 3]]],
    ];
    // broken-chord pattern over six eighth notes (index into chord tones)
    const ROLL = [null, 0, 2, 3, 2, 1];

    let ctx = null;
    let master, music, dry, reverbIn, epBus, padBus;
    let muted = false;
    let timer = null;
    let nextBar = 0;
    let bar = 0;

    function impulse(seconds, decay) {
      const rate = ctx.sampleRate;
      const len = Math.floor(rate * seconds);
      const buf = ctx.createBuffer(2, len, rate);
      const pre = Math.floor(rate * 0.025);
      const k = Math.exp(-decay / (len - pre)); // per-sample decay, no pow() in the loop
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        let last = 0;
        let env = 1;
        for (let i = pre; i < len; i++) {
          last = last * 0.55 + (Math.random() * 2 - 1) * 0.45; // darken the tail
          data[i] = last * env;
          env *= k;
        }
      }
      return buf;
    }

    function build() {
      ctx = new AC();

      master = ctx.createGain(); // mute lives here
      master.gain.value = VOLUME;
      master.connect(ctx.destination);

      music = ctx.createGain(); // the 3s fade-in lives here
      music.gain.value = 0;
      music.connect(master);

      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 4200;
      tone.connect(music);

      dry = ctx.createGain();
      dry.connect(tone);

      reverbIn = ctx.createGain();
      const verb = ctx.createConvolver();
      // filled a moment later so the tap itself stays instant
      setTimeout(() => { verb.buffer = impulse(3.2, 6); }, 120);
      const wet = ctx.createGain();
      wet.gain.value = 0.5;
      reverbIn.connect(verb);
      verb.connect(wet);
      wet.connect(tone);

      epBus = ctx.createGain();
      epBus.connect(dry);
      const epSend = ctx.createGain();
      epSend.gain.value = 0.55;
      epBus.connect(epSend);
      epSend.connect(reverbIn);

      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 1100;
      padFilter.Q.value = 0.6;
      padBus = ctx.createGain();
      padBus.connect(padFilter);
      padFilter.connect(dry);
      const padSend = ctx.createGain();
      padSend.gain.value = 0.8;
      padFilter.connect(padSend);
      padSend.connect(reverbIn);
    }

    // Soft electric piano: a sine carrier with a decaying FM "bark", plus a bell tine
    function ep(midi, t, vel, dur, tine = true) {
      const f = mtof(midi);
      const car = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modAmt = ctx.createGain();
      const amp = ctx.createGain();
      car.frequency.value = f;
      mod.frequency.value = f;
      modAmt.gain.setValueAtTime(f * 2.4 * vel, t);
      modAmt.gain.exponentialRampToValueAtTime(f * 0.22 + 1, t + 1.1);
      mod.connect(modAmt);
      modAmt.connect(car.frequency);

      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(vel, t + 0.006);
      amp.gain.exponentialRampToValueAtTime(vel * 0.4, t + 0.55);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 2.2);
      car.connect(amp);
      amp.connect(epBus);
      car.start(t);
      mod.start(t);
      car.stop(t + dur + 2.4);
      mod.stop(t + dur + 2.4);

      if (tine) {
        const bell = ctx.createOscillator();
        const bellAmp = ctx.createGain();
        bell.frequency.value = f * 4;
        bellAmp.gain.setValueAtTime(0.0001, t);
        bellAmp.gain.exponentialRampToValueAtTime(vel * 0.07, t + 0.004);
        bellAmp.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        bell.connect(bellAmp);
        bellAmp.connect(epBus);
        bell.start(t);
        bell.stop(t + 1);
      }
    }

    function strings(tones, t, dur) {
      tones.forEach((note) => {
        [-7, 7].forEach((cents) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.value = mtof(note + 12);
          osc.detune.value = cents;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.018, t + 1.8);
          g.gain.setValueAtTime(0.018, t + dur);
          g.gain.setTargetAtTime(0, t + dur, 0.7);
          osc.connect(g);
          g.connect(padBus);
          osc.start(t);
          osc.stop(t + dur + 4);
        });
      });
    }

    function bass(midi, t, dur) {
      [[midi + 12, "sine", 0.24], [midi, "triangle", 0.12]].forEach(([note, type, peak]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = mtof(note);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
        osc.connect(g);
        g.connect(dry);
        osc.start(t);
        osc.stop(t + dur + 1.3);
      });
    }

    const human = () => (Math.random() - 0.5) * 0.018;

    function scheduleBar(t) {
      const [chords, melody] = SONG[bar % SONG.length];
      const firstPass = bar < SONG.length;

      let beat = 0;
      chords.forEach(([name, beats]) => {
        const chord = CHORDS[name];
        const start = t + beat * BEAT;
        bass(chord.root, start, beats * BEAT);
        strings(chord.tones, start, beats * BEAT);
        beat += beats;
      });

      // rolling eighth-note broken chords
      ROLL.forEach((idx, i) => {
        if (idx === null) return;
        const at = i * 0.5;
        let acc = 0;
        const chord = CHORDS[chords.find(([, b]) => (acc += b) > at)[0]];
        ep(chord.tones[idx] + 12, t + at * BEAT + human(), 0.12 + Math.random() * 0.04, BEAT * 0.9, false);
      });

      // the melody sits out the very first two bars, then sings
      if (!(firstPass && bar < 2)) {
        let m = 0;
        melody.forEach(([note, beats]) => {
          if (note !== null) ep(note, t + m * BEAT + human(), 0.42 + Math.random() * 0.08, beats * BEAT);
          m += beats;
        });
      }
      bar += 1;
    }

    function tick() {
      while (nextBar < ctx.currentTime + 1.5) {
        scheduleBar(nextBar);
        nextBar += BAR;
      }
    }

    function start() {
      if (!AC) return;
      try {
        if (navigator.audioSession) navigator.audioSession.type = "playback"; // plays with the iPhone silent switch on
      } catch (_) { /* not supported */ }

      if (!timer) {
        if (!ctx) build();
        master.gain.value = muted ? 0 : VOLUME;
        const now = ctx.currentTime;
        music.gain.setValueAtTime(0, now);
        music.gain.linearRampToValueAtTime(1, now + 3); // 3s fade in
        nextBar = now + 0.9; // let the harp gliss ring first
        tick();
        timer = setInterval(tick, 200);
      }
      if (ctx.state === "suspended") ctx.resume();
    }

    function setMuted(value) {
      muted = value;
      if (!ctx) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.setTargetAtTime(muted ? 0 : VOLUME, now, muted ? 0.12 : 0.4);
      if (!muted && ctx.state === "suspended") ctx.resume();
    }

    function pluck(midi, t, vel, bus) {
      const f = mtof(midi);
      [[1, "triangle", 1], [2, "sine", 0.3]].forEach(([ratio, type, amt]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = f * ratio;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vel * amt, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
        osc.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(t + 2.3);
      });
    }

    function sendBus(level) {
      const bus = ctx.createGain();
      bus.gain.value = level;
      bus.connect(master);
      const send = ctx.createGain();
      send.gain.value = 0.8;
      bus.connect(send);
      send.connect(reverbIn);
      return bus;
    }

    // A harp glissando as the lilies open
    function gliss() {
      if (!ctx || muted) return;
      const bus = sendBus(0.5);
      const scale = [53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89];
      const t0 = ctx.currentTime + 0.03;
      scale.forEach((note, i) => pluck(note, t0 + i * 0.048, 0.18 + i * 0.012, bus));
      [65, 69, 72, 77].forEach((note) => ep(note, t0 + scale.length * 0.048 + 0.1, 0.22, 2));
    }

    // A brighter bell flourish for "yes"
    function chime() {
      if (!ctx || muted) return;
      const bus = sendBus(0.55);
      const notes = [72, 77, 81, 84, 89, 93, 96];
      const t0 = ctx.currentTime + 0.05;
      notes.forEach((note, i) => {
        const t = t0 + i * 0.085;
        const f = mtof(note);
        [[1, 0.5], [2.01, 0.14], [3.98, 0.05]].forEach(([ratio, amp]) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.frequency.value = f * ratio;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 + (notes.length - i) * 0.08);
          osc.connect(g);
          g.connect(bus);
          osc.start(t);
          osc.stop(t + 2.4);
        });
      });
      const tChord = t0 + notes.length * 0.085;
      [65, 69, 72, 77].forEach((note) => pluck(note, tChord, 0.16, bus));
    }

    // pause while the phone is locked / tab hidden
    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else ctx.resume();
    });

    // Build the audio graph early (on finger-down) so the tap itself stays light
    function warm() {
      if (AC && !ctx) build();
    }

    // Mei's voice: a sawtooth through two vowel formants sliding "mee-ow"
    function meow(pitch = 1) {
      warm();
      if (!ctx || muted) return;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime + 0.02;
      const bus = sendBus(3.2);
      const osc = ctx.createOscillator();
      const vib = ctx.createOscillator();
      const vibAmt = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(560 * pitch, t);
      osc.frequency.linearRampToValueAtTime(860 * pitch, t + 0.14);
      osc.frequency.linearRampToValueAtTime(720 * pitch, t + 0.32);
      osc.frequency.exponentialRampToValueAtTime(440 * pitch, t + 0.58);
      vib.frequency.value = 7;
      vibAmt.gain.value = 10 * pitch;
      vib.connect(vibAmt);
      vibAmt.connect(osc.frequency);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(0.5, t + 0.06);
      amp.gain.linearRampToValueAtTime(0.36, t + 0.36);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
      [[1000, 2000, 1100, 5], [2600, 3300, 2200, 7]].forEach(([a, b, c, q]) => {
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = q;
        f.frequency.setValueAtTime(a * pitch, t);
        f.frequency.linearRampToValueAtTime(b * pitch, t + 0.16);
        f.frequency.exponentialRampToValueAtTime(c * pitch, t + 0.55);
        osc.connect(f);
        f.connect(amp);
      });
      amp.connect(bus);
      osc.start(t);
      vib.start(t);
      osc.stop(t + 0.7);
      vib.stop(t + 0.7);
    }

    // A soft purr: a low buzz pulsing ~24 times a second
    function purr() {
      warm();
      if (!ctx || muted) return;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime + 0.02;
      const bus = sendBus(2.6);
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const pulse = ctx.createGain();
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      const amp = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 52;
      lp.type = "lowpass";
      lp.frequency.value = 420;
      lfo.frequency.value = 24;
      depth.gain.value = 0.5;
      pulse.gain.value = 0.5;
      lfo.connect(depth);
      depth.connect(pulse.gain);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(0.7, t + 0.2);
      amp.gain.setValueAtTime(0.7, t + 1.1);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      osc.connect(lp);
      lp.connect(pulse);
      pulse.connect(amp);
      amp.connect(bus);
      osc.start(t);
      lfo.start(t);
      osc.stop(t + 1.7);
      lfo.stop(t + 1.7);
    }

    return { warm, start, setMuted, gliss, chime, meow, purr, get muted() { return muted; } };
  })();

  /* ---------- Mei, the cat ---------- */

  const Mei = (() => {
    const wrap = $("[data-mei-wrap]");
    const button = $("[data-mei]");
    const bubble = $("[data-mei-bubble]");
    const look = $(".mei__look", wrap);
    const text = CONTENT.mei;
    button.setAttribute("aria-label", text.label);

    let x = -120;
    let side = "left";
    let petted = 0;
    let bubbleTimer = 0;
    let stateTimer = 0;
    let hintTimer = 0;
    let lastLine = -1;

    const width = () => wrap.offsetWidth || 76;

    // She sits a little way off to one side of the plant, never at the far edge of a big screen
    function spotFor(which) {
      const vw = document.documentElement.clientWidth;
      const w = width();
      const reach = Math.min(vw / 2 - w / 2 - 12, 250);
      return vw / 2 - w / 2 + (which === "left" ? -reach : reach);
    }

    function place(target, walk) {
      const facingRight = target > x;
      const dist = Math.abs(target - x);
      wrap.classList.toggle("is-facing-right", facingRight);
      wrap.classList.toggle("is-right", target > document.documentElement.clientWidth / 2);

      if (!walk || reducedMotion() || dist < 4) {
        wrap.style.transition = "none";
        wrap.style.transform = `translate3d(${target}px, 0, 0)`;
        x = target;
        return Promise.resolve();
      }
      const ms = Math.max(700, Math.min(2200, dist * 5.5));
      wrap.classList.add("is-walking");
      wrap.style.transition = `transform ${ms}ms cubic-bezier(.45, .05, .55, .95)`;
      wrap.style.transform = `translate3d(${target}px, 0, 0)`;
      x = target;
      return new Promise((resolve) => setTimeout(() => {
        wrap.classList.remove("is-walking");
        resolve();
      }, ms));
    }

    function say(line, ms = 2600) {
      if (!line) return;
      clearTimeout(bubbleTimer);
      bubble.textContent = line;
      bubble.classList.add("is-showing");
      bubbleTimer = setTimeout(() => bubble.classList.remove("is-showing"), ms);
    }

    function mood(cls, ms) {
      wrap.classList.remove("is-happy", "is-meowing", "is-purring", "is-jumping", "is-twitching", "is-excited");
      void wrap.offsetWidth; // restart the keyframes
      clearTimeout(stateTimer);
      wrap.classList.add(...cls);
      stateTimer = setTimeout(() => wrap.classList.remove(...cls), ms);
    }

    function hearts(n = 4) {
      for (let i = 0; i < n; i++) {
        const h = document.createElement("span");
        h.className = "mei__heart";
        h.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-heart"/></svg>';
        wrap.appendChild(h);
        const dx = (Math.random() - 0.5) * 70;
        const rise = 50 + Math.random() * 40;
        const a = h.animate(reducedMotion()
          ? [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }]
          : [
            { opacity: 0, transform: "translate3d(0, 0, 0) scale(.3)" },
            { opacity: 1, transform: `translate3d(${dx * 0.4}px, ${-rise * 0.4}px, 0) scale(1)`, offset: 0.3 },
            { opacity: 0, transform: `translate3d(${dx}px, ${-rise}px, 0) scale(.8) rotate(${dx / 3}deg)` },
          ], { duration: 1300 + Math.random() * 500, delay: i * 110, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" });
        a.onfinish = () => h.remove();
      }
    }

    // Tap / click: a little rotation of reactions
    const REACTIONS = [
      () => { mood(["is-happy", "is-purring"], 1600); Music.purr(); hearts(5); say(text.purr); },
      () => { mood(["is-meowing", "is-jumping"], 700); Music.meow(1); hearts(2); sayRandom(); },
      () => { mood(["is-happy", "is-twitching"], 1300); say(text.blink); },
      () => { mood(["is-meowing", "is-excited"], 900); Music.meow(1.25); sayRandom(); },
    ];

    function sayRandom() {
      let i;
      do { i = Math.floor(Math.random() * text.lines.length); } while (i === lastLine && text.lines.length > 1);
      lastLine = i;
      say(text.lines[i]);
    }

    function pet() {
      clearTimeout(hintTimer);
      if (petted === 0) {
        mood(["is-meowing", "is-jumping"], 700);
        Music.meow(1.1);
        hearts(3);
        say(text.hello, 3000);
      } else {
        REACTIONS[(petted - 1) % REACTIONS.length]();
      }
      petted += 1;
    }

    button.addEventListener("click", pet);
    button.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") mood(["is-twitching"], 900);
    });

    // Her eyes follow you (or the Yes button, on the question page)
    let eyeRaf = 0;
    let target = null;
    function lookAt(px, py) {
      target = { x: px, y: py };
      if (eyeRaf) return;
      eyeRaf = requestAnimationFrame(() => {
        eyeRaf = 0;
        const r = button.getBoundingClientRect();
        const cx = r.left + r.width * 0.46;
        const cy = r.top + r.height * 0.47;
        const ang = Math.atan2(target.y - cy, target.x - cx);
        const d = Math.min(1, Math.hypot(target.x - cx, target.y - cy) / 200);
        const flip = wrap.classList.contains("is-facing-right") ? -1 : 1;
        look.setAttribute("transform", `translate(${(Math.cos(ang) * 2 * d * flip).toFixed(2)} ${(Math.sin(ang) * 1.6 * d).toFixed(2)})`);
      });
    }
    window.addEventListener("pointermove", (e) => lookAt(e.clientX, e.clientY), { passive: true });

    function lookAtEl(el) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      lookAt(r.left + r.width / 2, r.top + r.height / 2);
    }

    // Follows along: a new spot on every page, sometimes with a comment
    function onPage(index, page) {
      clearTimeout(hintTimer);
      side = index % 2 === 0 ? "left" : "right";
      const line = text.pages[index];
      place(spotFor(side), true).then(() => {
        if (page.matches(".page--question")) {
          lookAtEl($('[data-action="yes"]', page));
          mood(["is-excited"], 2400);
        }
        if (page.matches(".page--yay")) {
          mood(["is-happy", "is-jumping", "is-excited"], 700);
          hearts(8);
          setTimeout(() => { mood(["is-happy", "is-jumping"], 700); hearts(5); }, 750);
        }
        if (line) setTimeout(() => say(line, 3200), 250);
      });
    }

    // When the No button runs, Mei has opinions
    let dodges = 0;
    function onDodge() {
      dodges += 1;
      if (dodges === 1 || dodges % 4 === 0) {
        mood(["is-meowing", "is-twitching"], 800);
        say(text.dodge[Math.floor(dodges / 4) % text.dodge.length], 2000);
      }
    }

    function init() {
      place(-width() - 20, false);
      // she wanders in once the intro has arrived
      setTimeout(() => {
        place(spotFor("left"), true).then(() => {
          hintTimer = setTimeout(() => { if (!petted) say(text.hint, 3200); }, 3500);
        });
      }, 1400);
      window.addEventListener("resize", () => place(spotFor(side), false));
    }

    return { init, onPage, onDodge, get rect() { return button.getBoundingClientRect(); } };
  })();

  /* ---------- Sound toggle ---------- */

  (() => {
    const button = $("[data-sound-toggle]");
    const label = $("[data-sound-label]");
    const sync = () => {
      button.setAttribute("aria-pressed", String(Music.muted));
      label.textContent = Music.muted ? CONTENT.sound.unmute : CONTENT.sound.mute;
      button.title = label.textContent;
    };
    button.addEventListener("click", () => {
      Music.setMuted(!Music.muted);
      sync();
    });
    sync();
  })();

  /* ---------- Falling leaves & petals ---------- */

  const Petals = (() => {
    const canvas = $("[data-petals]");
    const ctx = canvas.getContext("2d");
    const COLORS = {
      leaf: ["#8A9A5B", "#5E6B3A", "#8A9A5B", "#A6B27A"],
      petal: ["#D8A48F", "#C2693F", "#D8A48F", "#E6BCA9"],
    };
    const DURATION = 6000;
    const SPAWN_FOR = 4200;
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(w, burst) {
      const kind = Math.random() < 0.5 ? "leaf" : "petal";
      const palette = COLORS[kind];
      return {
        kind,
        color: palette[Math.floor(Math.random() * palette.length)],
        x: Math.random() * w,
        y: burst ? -20 - Math.random() * window.innerHeight * 0.6 : -24,
        size: (kind === "leaf" ? 9 : 7) + Math.random() * 8,
        vy: 55 + Math.random() * 70,
        sway: 18 + Math.random() * 36,
        swaySpeed: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2.4,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 1.5 + Math.random() * 2.5,
      };
    }

    function drawLeaf(p) {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.6, s * 0.5, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.7, -s * 0.5, 0, -s);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.8);
      ctx.lineTo(0, s * 1.25);
      ctx.strokeStyle = "rgba(74, 53, 38, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawPetal(p) {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(s * 0.9, s * 0.3, s * 0.7, -s * 0.9, 0, -s * 0.7);
      ctx.bezierCurveTo(-s * 0.7, -s * 0.9, -s * 0.9, s * 0.3, 0, s);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    function run() {
      if (reducedMotion()) return;
      cancelAnimationFrame(raf);
      resize();
      const w = window.innerWidth;
      const count = Math.round(Math.min(90, Math.max(50, w / 10)));
      const flakes = Array.from({ length: Math.round(count * 0.35) }, () => make(w, true));
      const spawnRate = (count * 0.65) / SPAWN_FOR; // per ms
      let spawned = 0;
      const start = performance.now();
      let last = start;

      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const elapsed = now - start;

        const due = Math.min(count * 0.65, elapsed * spawnRate);
        while (spawned < due) { flakes.push(make(window.innerWidth, false)); spawned += 1; }

        const fade = elapsed > DURATION - 900 ? Math.max(0, (DURATION - elapsed) / 900) : 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of flakes) {
          p.y += p.vy * dt;
          p.phase += p.swaySpeed * dt;
          p.rot += p.spin * dt;
          p.flip += p.flipSpeed * dt;
          const x = p.x + Math.sin(p.phase) * p.sway;
          if (p.y > window.innerHeight + 30) continue;

          ctx.save();
          ctx.globalAlpha = 0.92 * fade;
          ctx.translate(x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.max(0.18, Math.abs(Math.cos(p.flip))), 1); // tumbling
          if (p.kind === "leaf") drawLeaf(p); else drawPetal(p);
          ctx.restore();
        }

        if (elapsed < DURATION) {
          raf = requestAnimationFrame(frame);
        } else {
          canvas.width = canvas.height = 0; // hand the GPU memory back
          raf = 0;
        }
      };
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", () => { if (raf) resize(); });
    return { run };
  })();

  /* ---------- A screen full of lilies ---------- */

  const Lilies = (() => {
    const canvas = $("[data-lilies]");
    const ctx = canvas.getContext("2d");

    // Petal colours: throat → middle → tip, plus speckles
    const VARIANTS = [
      { throat: "#E4AE97", mid: "#FBF6EC", tip: "#F8EEE2", edge: "#D8A48F", rib: "#D8A48F", speck: "#C2693F" },
      { throat: "#C2693F", mid: "#D8A48F", tip: "#F3DCCF", edge: "#B8704F", rib: "#FBF6EC", speck: "#A9582F" },
      { throat: "#C9CE9E", mid: "#FBF6EC", tip: "#F6E6D8", edge: "#D9C3AE", rib: "#B9C08F", speck: null },
      { throat: "#A9582F", mid: "#CF8565", tip: "#EBB9A2", edge: "#A9582F", rib: "#F3D9CC", speck: "#8C4726" },
      { throat: "#E9C3B2", mid: "#F9EDE3", tip: "#FBF6EC", edge: "#DDB3A0", rib: "#E4AE97", speck: "#C2693F" },
    ];
    const FRAMES = 9;
    const R = 120;            // sprite radius in sprite pixels
    const SIZE = R * 2 + 32;  // room for the shadow
    const MAX_DPR = 1.5;      // a full-screen flourish doesn't need retina fill cost
    let sprites = null;
    let leafSprites = null;
    let raf = 0;
    let ready = false;
    let bake = null;          // settled flowers are painted here once
    let bakeCtx = null;

    // tiny seeded random so each sprite is drawn the same way every time
    const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    function petal(g, len, wid, curl, v, rand) {
      const grad = g.createLinearGradient(0, 0, 0, -len);
      grad.addColorStop(0, v.throat);
      grad.addColorStop(0.42, v.mid);
      grad.addColorStop(1, v.tip);

      g.beginPath();
      g.moveTo(0, 0);
      g.bezierCurveTo(wid * 1.05, -len * 0.22, wid * 0.95, -len * 0.72, curl, -len);
      g.bezierCurveTo(-wid * 0.8, -len * 0.74, -wid * 1.05, -len * 0.24, 0, 0);
      g.fillStyle = grad;
      g.fill();
      g.lineWidth = 1.4;
      g.strokeStyle = v.edge;
      g.globalAlpha = 0.55;
      g.stroke();
      g.globalAlpha = 1;

      // the groove down the middle
      g.beginPath();
      g.moveTo(0, -len * 0.04);
      g.quadraticCurveTo(wid * 0.12, -len * 0.5, curl * 0.8, -len * 0.9);
      g.strokeStyle = v.rib;
      g.lineWidth = 2;
      g.globalAlpha = 0.6;
      g.stroke();
      g.globalAlpha = 1;

      if (v.speck) {
        g.fillStyle = v.speck;
        for (let i = 0; i < 9; i++) {
          const d = len * (0.1 + rand() * 0.36);
          const side = (rand() - 0.5) * wid * 0.9 * (d / (len * 0.5));
          g.globalAlpha = 0.55 + rand() * 0.4;
          g.beginPath();
          g.ellipse(side, -d, 1.6 + rand() * 1.6, 2.2 + rand() * 2, 0, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;
      }
    }

    function drawLily(g, open, v, seed) {
      const rand = seeded(seed);
      const jitter = Array.from({ length: 6 }, () => (rand() - 0.5) * 0.22);
      const curls = Array.from({ length: 6 }, () => (rand() - 0.5) * 16);

      g.save();
      g.translate(SIZE / 2, SIZE / 2);
      g.shadowColor = "rgba(74, 53, 38, 0.28)";
      g.shadowBlur = 11;
      g.shadowOffsetY = 5;

      // outer three behind, inner three on top
      [0, 2, 4, 1, 3, 5].forEach((k) => {
        const outer = k % 2 === 0;
        const len = R * (outer ? 1 : 0.9) * (0.3 + 0.7 * open);
        const wid = len * (outer ? 0.3 : 0.25) * (0.7 + 0.3 * open);
        g.save();
        g.rotate((k / 6) * Math.PI * 2 + jitter[k] + (1 - open) * 0.5);
        if (k === 1) g.shadowColor = "rgba(74, 53, 38, 0.18)";
        petal(g, len, wid, curls[k] * open, v, rand);
        g.restore();
      });
      g.shadowColor = "transparent";

      // stamens and pistil appear as she opens
      if (open > 0.35) {
        const t = (open - 0.35) / 0.65;
        g.lineCap = "round";
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.5 + jitter[i];
          const l = R * 0.46 * t;
          const x = Math.cos(a) * l;
          const y = Math.sin(a) * l;
          g.beginPath();
          g.moveTo(0, 0);
          g.quadraticCurveTo(x * 0.5 + y * 0.12, y * 0.5 - x * 0.12, x, y);
          g.strokeStyle = "#8A9A5B";
          g.lineWidth = 2;
          g.stroke();
          g.save();
          g.translate(x, y);
          g.rotate(a + Math.PI / 2);
          g.fillStyle = "#A9582F";
          g.beginPath();
          g.ellipse(0, 0, 3.4 * t + 1, 8 * t + 1, 0, 0, Math.PI * 2);
          g.fill();
          g.restore();
        }
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(R * 0.18 * t, -R * 0.5 * t);
        g.strokeStyle = "#5E6B3A";
        g.lineWidth = 2.6;
        g.stroke();
        g.fillStyle = "#5E6B3A";
        g.beginPath();
        g.arc(R * 0.18 * t, -R * 0.5 * t, 4.4 * t + 0.5, 0, Math.PI * 2);
        g.fill();
      }

      // soft throat glow
      const glow = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.26);
      glow.addColorStop(0, "rgba(94, 107, 58, 0.35)");
      glow.addColorStop(1, "rgba(94, 107, 58, 0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(0, 0, R * 0.26, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    function drawLeaf(g, color) {
      g.save();
      g.translate(SIZE / 2, SIZE / 2 + R * 0.9);
      g.shadowColor = "rgba(74, 53, 38, 0.22)";
      g.shadowBlur = 10;
      g.shadowOffsetY = 4;
      g.beginPath();
      g.moveTo(0, 0);
      g.bezierCurveTo(R * 0.34, -R * 0.5, R * 0.22, -R * 1.3, 0, -R * 1.8);
      g.bezierCurveTo(-R * 0.22, -R * 1.3, -R * 0.34, -R * 0.5, 0, 0);
      g.fillStyle = color;
      g.fill();
      g.shadowColor = "transparent";
      g.beginPath();
      g.moveTo(0, -R * 0.05);
      g.lineTo(0, -R * 1.7);
      g.strokeStyle = "rgba(251, 246, 236, 0.45)";
      g.lineWidth = 2;
      g.stroke();
      g.restore();
    }

    function makeCanvas() {
      const c = document.createElement("canvas");
      c.width = c.height = SIZE;
      return c;
    }

    function renderVariant(vi) {
      sprites[vi] = Array.from({ length: FRAMES }, (_, f) => {
        const c = makeCanvas();
        const open = f / (FRAMES - 1);
        drawLily(c.getContext("2d"), 0.12 + 0.88 * open, VARIANTS[vi], 97 + vi * 131);
        return c;
      });
    }

    function renderLeaves() {
      leafSprites = ["#8A9A5B", "#5E6B3A", "#A6B27A"].map((color) => {
        const c = makeCanvas();
        drawLeaf(c.getContext("2d"), color);
        return c;
      });
    }

    // One small job per idle slot, so preparing never stutters the intro
    function prepareInChunks() {
      if (sprites) return;
      sprites = new Array(VARIANTS.length);
      const jobs = VARIANTS.map((_, vi) => () => renderVariant(vi)).concat(renderLeaves);
      const idle = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 60));
      const step = () => {
        const job = jobs.shift();
        if (job) job();
        if (jobs.length) idle(step, { timeout: 500 });
        else ready = true;
      };
      idle(step, { timeout: 500 });
    }

    // If she taps before the idle work finished, finish it now
    function prepareNow() {
      if (!sprites) sprites = new Array(VARIANTS.length);
      for (let i = 0; i < VARIANTS.length; i++) if (!sprites[i]) renderVariant(i);
      if (!leafSprites) renderLeaves();
      ready = true;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bake = document.createElement("canvas");
      bake.width = w;
      bake.height = h;
      bakeCtx = bake.getContext("2d");
      bakeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function release() {
      canvas.width = canvas.height = 0; // hand the GPU memory back
      bake = bakeCtx = null;
      canvas.classList.remove("is-fading");
    }

    // Fill the screen on a jittered grid, blooming outward from the tap
    function layout(origin) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const diameter = Math.max(120, Math.min(250, Math.min(w, h) * 0.36));
      const step = diameter * 0.6;
      const cols = Math.ceil((w + step) / step);
      const rows = Math.ceil((h + step) / step);
      const maxDist = Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y));
      const flowers = [];
      const leaves = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c - 0.25 + (r % 2) * 0.5) * step + (Math.random() - 0.5) * step * 0.7;
          const y = (r - 0.2) * step + (Math.random() - 0.5) * step * 0.7;
          const dist = Math.hypot(x - origin.x, y - origin.y) / maxDist;
          const base = {
            x, y,
            delay: dist * 1300 + Math.random() * 300,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.25,
            fadeDelay: 2900 + dist * 700 + Math.random() * 900,
          };
          flowers.push(Object.assign({}, base, {
            size: diameter * (0.72 + Math.random() * 0.5),
            variant: Math.floor(Math.random() * VARIANTS.length),
          }));
          if (Math.random() < 0.55) {
            leaves.push(Object.assign({}, base, {
              x: x + (Math.random() - 0.5) * step,
              y: y + (Math.random() - 0.5) * step,
              size: diameter * (0.6 + Math.random() * 0.4),
              delay: base.delay * 0.8,
              sprite: Math.floor(Math.random() * leafSprites.length),
            }));
          }
        }
      }
      // a scattering of smaller blooms on top for depth
      const extras = Math.round(flowers.length * 0.2);
      for (let i = 0; i < extras; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const dist = Math.hypot(x - origin.x, y - origin.y) / maxDist;
        flowers.push({
          x, y,
          delay: 250 + dist * 1200 + Math.random() * 400,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.3,
          fadeDelay: 2700 + dist * 700 + Math.random() * 900,
          size: diameter * (0.45 + Math.random() * 0.3),
          variant: Math.floor(Math.random() * VARIANTS.length),
        });
      }
      return { flowers, leaves };
    }

    const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const BLOOM = 1100;
    const HOLD = 450;

    function drawSprite(g, img, x, y, size, rot, alpha) {
      if (alpha <= 0.01 || size <= 1) return;
      const s = size * (SIZE / (R * 2));
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      g.globalAlpha = alpha;
      g.setTransform(cos * dpr, sin * dpr, -sin * dpr, cos * dpr, x * dpr, y * dpr);
      g.drawImage(img, -s / 2, -s / 2, s, s);
    }

    // Returns the ms at which the screen is fully covered
    function bloom(origin) {
      if (!ready) prepareNow();
      resize();
      cancelAnimationFrame(raf);
      canvas.classList.remove("is-fading");
      const reduced = reducedMotion();
      const { flowers, leaves } = layout(origin);
      const items = leaves
        .map((l) => Object.assign(l, { img: leafSprites[l.sprite], leaf: true }))
        .concat(flowers.map((f) => Object.assign(f, { frames: sprites[f.variant] })));
      const last = FRAMES - 1;

      const fadeOut = (after) => {
        setTimeout(() => {
          canvas.classList.add("is-fading");
          setTimeout(release, reduced ? 800 : 3000);
        }, after);
      };

      if (reduced) {
        items.forEach((it) => drawSprite(ctx, it.leaf ? it.img : it.frames[last], it.x, it.y, it.size, it.rot, 1));
        canvas.classList.add("is-quick");
        fadeOut(1500);
        return 500;
      }
      canvas.classList.remove("is-quick");

      let active = items.slice();
      const start = performance.now();

      const frame = (now) => {
        const t = now - start;

        // 1. flowers that finished opening are painted once into the bake layer
        const still = [];
        for (const it of active) {
          if ((t - it.delay) / BLOOM < 1) { still.push(it); continue; }
          bakeCtx.globalCompositeOperation = it.leaf ? "destination-over" : "source-over"; // leaves tuck underneath
          drawSprite(bakeCtx, it.leaf ? it.img : it.frames[last], it.x, it.y, it.size, it.rot, 1);
        }
        bakeCtx.globalCompositeOperation = "source-over";
        active = still;

        // 2. one blit for everything settled, then only the flowers still opening
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bake, 0, 0);
        for (const it of active) {
          const p = (t - it.delay) / BLOOM;
          if (p <= 0) continue;
          const img = it.leaf ? it.img : it.frames[Math.min(last, Math.floor(easeOut(p) * last))];
          const rot = it.rot - (1 - easeOut(p)) * 0.9;
          drawSprite(ctx, img, it.x, it.y, it.size * easeOutBack(p), rot, Math.min(1, p * 3));
        }

        if (active.length) {
          raf = requestAnimationFrame(frame);
        } else {
          raf = 0;
          fadeOut(HOLD); // the rest is a compositor-only fade: no more redraws
        }
      };
      raf = requestAnimationFrame(frame);
      return Math.max(...items.map((it) => it.delay)) + BLOOM;
    }

    // Draw the sprites while she's still reading the intro, so the tap is instant
    // start after the intro has finished arriving
    setTimeout(prepareInChunks, 2200);

    return { bloom };
  })();

  /* ---------- Wiring ---------- */

  renderContent();
  Pages.init();
  Mei.init();

  // decode the last photo early so it doesn't hitch the celebration
  setTimeout(() => {
    const img = $('[data-photo="celebration"]');
    if (img && img.decode) img.decode().catch(() => {});
  }, 4000);

  // the engine is built the moment a finger or key goes down on "Tap to begin"
  const beginButton = $('[data-action="begin"]');
  beginButton.addEventListener("pointerdown", () => Music.warm(), { once: true });
  beginButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") Music.warm();
  });

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "begin") {
      if (target.dataset.used) return;
      target.dataset.used = "true";
      Music.start(); // the tap is the permission browsers need
      Music.gliss();
      const r = target.getBoundingClientRect();
      const origin = e.clientX || e.clientY
        ? { x: e.clientX, y: e.clientY }
        : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const covered = Lilies.bloom(origin);
      // swap pages underneath while the lilies cover everything
      setTimeout(() => Pages.next(), covered + 300);
    } else if (action === "next") {
      Pages.next();
    } else if (action === "yes") {
      Dodge.retire();
      Music.start();
      Music.chime();
      Pages.next(() => setTimeout(Petals.run, reducedMotion() ? 0 : 250));
    }
  });
})();
