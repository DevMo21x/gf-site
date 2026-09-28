/* ==========================================================================
   ✏️  EDIT THE WORDS HERE
   Everything she reads lives in this one object.
   Wrap a word in *asterisks* to make it red, e.g. "*angel*".
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
    title: "Sand person *achievement unlocked*",
    body: "Got the girl. Now the real mistakes begin.",
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

  // The clock in the corner: one day on the farm, a little later on every page
  hud: {
    day: "Sat.",
    times: ["6:10am", "9:00am", "12:30pm", "3:40pm", "6:50pm", "10:20pm", "11:50pm"],
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
      6: "achievement unlocked!",
    },
    dodge: ["hehe, nope", "that button's shy", "try the big one"],
    startled: "eep!",
  },

  // Tufo the cat: white, pink-eyed, mean. Everything he says.
  tufo: {
    label: "Tufo the cat. He does not like being touched.",
    intro: "I'm Tufo. I don't do cute.",
    hello: "don't. touch. me.",
    hiss: ["hsssss", "back OFF", "I bite. hard."],
    swat: ["*swat*", "no touching", "that was a warning"],
    ignore: "I'm ignoring you now",
    rude: ["your hands are cold", "mid petting, honestly", "I was here first", "don't look at me", "go pet the other one"],
    allow: "…fine. ONE pet.",
    allowAfter: "okay that's enough",
    jealous: ["why does SHE get pets", "ew. affection.", "Mei is a suck-up"],
    hissAtMei: "hsss. MY human.",
    knock: "oops. not sorry.",
    knockLove: "oops. it fell.",
    // things he says when a page opens (by page number, starting at 0)
    pages: {
      1: "he was SO nervous. pathetic.",
      3: "and nobody saved me any",
      4: "eh. I'm funnier",
      5: "press No. I dare you.",
      6: "ugh. fine. welcome, I guess",
    },
    dodge: ["HA. coward button", "even No is scared of you", "just press it. oh wait."],
    // when he chases Mei around (like he does at home)
    chase: {
      start: ["zoomies.", "RUN, Mei.", "tag. you're it."],
      end: ["that's cardio.", "she started it", "I let her win"],
      meiStart: "not again!!",
      meiEnd: "he does this EVERY day",
    },
  },

  progress: "Page {n} of {total}",

  // Background music. Swap the file in /audio and change src to use another song.
  music: {
    src: "audio/gymnopedie.m4a",
    volume: 1,     // 0–1 (the file itself is already mixed soft; iPhones ignore this and play at 1)
    startAt: 0,    // seconds into the song to begin from
    credit: "Music: Gymnopédie No. 1 by Erik Satie, performed by Michael Laucke (public domain)",
  },
};

/* ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = () => reducedMotionQuery.matches;
  const root = document.documentElement;
  const cssNumber = (name, fallback) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || fallback;
  const PX = () => cssNumber("--px", 3);          // one art pixel, in CSS pixels
  const groundH = () => cssNumber("--ground-h", 100);
  const artSize = () => {
    const px = PX();
    return { px, W: Math.ceil(window.innerWidth / px) + 1, H: Math.ceil(window.innerHeight / px) + 1 };
  };
  const fitCanvas = (canvas, { px, W, H }) => {
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W * px + "px";
    canvas.style.height = H * px + "px";
  };

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

  /* ---------- Typewriter dialogue ---------- */

  const Typer = (() => {
    const SPEED = 26; // ms per letter
    const runs = new Map();

    function wrapLetters(node) {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 1) { wrapLetters(child); return; }
        if (child.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent) {
          if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
          const span = document.createElement("span");
          span.className = "ch";
          span.textContent = ch;
          frag.appendChild(span);
        }
        node.replaceChild(frag, child);
      });
    }

    // the sentence is read aloud whole; the letters are only for eyes
    function prepare(el) {
      const html = el.innerHTML;
      el.innerHTML = `<span class="visually-hidden">${html}</span><span class="typed" aria-hidden="true">${html}</span>`;
      wrapLetters($(".typed", el));
    }

    function stop(el) {
      const run = runs.get(el);
      if (!run) return;
      clearTimeout(run.timer);
      cancelAnimationFrame(run.raf);
      runs.delete(el);
    }

    function finish(el) {
      stop(el);
      el.classList.add("is-typed");
      const box = el.closest("[data-dialog]");
      if (box) box.classList.add("has-typed");
    }

    // returns when (ms from now) the last letter lands
    function play(el, delay = 0) {
      stop(el);
      const chars = $$(".typed .ch", el);
      if (reducedMotion() || !chars.length) { finish(el); return 0; }
      const run = { timer: 0, raf: 0 };
      runs.set(el, run);
      let shown = 0;
      run.timer = setTimeout(() => {
        const t0 = performance.now();
        const step = (now) => {
          const due = Math.min(chars.length, Math.floor((now - t0) / SPEED) + 1);
          while (shown < due) {
            chars[shown].classList.add("on");
            if (shown % 3 === 0) Music.blip();
            shown += 1;
          }
          if (shown < chars.length) run.raf = requestAnimationFrame(step);
          else finish(el);
        };
        run.raf = requestAnimationFrame(step);
      }, delay);
      return delay + chars.length * SPEED;
    }

    // a tap on a dialogue box finishes its sentences at once
    document.addEventListener("click", (e) => {
      const box = e.target.closest("[data-dialog]");
      if (box && !e.target.closest("button")) $$("[data-type], .love__text", box).forEach(finish);
    });

    return { prepare, play, finish };
  })();

  function renderContent() {
    $$("[data-text]").forEach((el) => {
      const value = lookup(el.dataset.text);
      if (typeof value === "string") el.innerHTML = format(value);
    });
    // headings arrive word by word; screen readers get the whole line
    $$(".dialog__title, .question__ask, .achievement__title").forEach((el) => {
      const text = el.textContent;
      splitWords(el);
      el.insertAdjacentHTML("afterbegin", `<span class="visually-hidden">${escapeHTML(text)}</span>`);
    });
    $$("[data-type]").forEach(Typer.prepare);
    $$("[data-photo]").forEach((img) => {
      const photo = CONTENT.photos[img.dataset.photo];
      if (!photo) return;
      img.alt = photo.alt;
      // photos for later pages wait, so the first photo gets the whole connection
      if (img.hasAttribute("data-late")) img.dataset.src = photo.src;
      else img.src = photo.src;
    });
    document.title = CONTENT.pageTitle;
  }

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

  /* ---------- The clock in the corner ---------- */

  const Clock = (() => {
    const time = $("[data-clock-time]");
    const ctx = $("[data-clock-icon]").getContext("2d");
    const sun = Pixel.sun();
    const moon = Pixel.moon();

    function set(index) {
      time.textContent = CONTENT.hud.times[index] || "";
      (index >= 5 ? moon : sun).paint(ctx);
    }
    return { set };
  })();

  /* ---------- The crop (progress) ---------- */

  const Plant = (() => {
    const holder = $("[data-plant]");
    const canvas = $("[data-plant-canvas]");
    const ctx = canvas.getContext("2d");
    const stages = Array.from({ length: 7 }, (_, i) => Pixel.crop(i));
    let current = -1;

    function set(stage, total) {
      holder.setAttribute(
        "aria-label",
        CONTENT.progress.replace("{n}", stage + 1).replace("{total}", total)
      );
      const s = Math.min(stages.length - 1, Math.round((stage / Math.max(1, total - 1)) * (stages.length - 1)));
      if (s === current) return;
      const first = current < 0;
      current = s;
      stages[s].paint(ctx);
      if (!first && !reducedMotion()) {
        const P = PX();
        canvas.animate([
          { transform: "translateY(0)" },
          { transform: `translateY(${-P * 3}px)` },
          { transform: "translateY(0)" },
        ], { duration: 360, easing: "steps(3, end)" });
      }
    }

    return { set };
  })();

  /* ---------- Pages & choreography ---------- */

  const animate = (el, frames, opts) =>
    el && el.animate ? el.animate(frames, Object.assign({ fill: "both" }, opts)) : null;

  // entrance animations hand the element back to its stylesheet when done
  const animateIn = (el, frames, opts) => {
    const a = animate(el, frames, opts);
    if (a) a.onfinish = () => a.cancel();
    return a;
  };

  // Everything moves in whole pixel steps, like the game: frames drop in,
  // boxes pop open, words appear, then the dialogue types itself out.
  function arrive(page) {
    const typed = $$("[data-type]", page);
    if (reducedMotion()) {
      animateIn(page, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear" });
      typed.forEach(Typer.finish);
      return 200;
    }
    const P = PX();

    animateIn(page, [{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "steps(2, end)" });

    $$(".frame", page).forEach((el, i) => {
      animateIn(el, [
        { opacity: 0, transform: `translateY(${-P * 14}px)` },
        { opacity: 1, transform: `translateY(${P * 2}px)`, offset: 0.7 },
        { opacity: 1, transform: "none" },
      ], { duration: 520, delay: 60 + i * 120, easing: "steps(6, end)" });
    });

    $$(".found", page).forEach((el) => {
      animateIn(el, [
        { opacity: 0, transform: `translateY(${P * 12}px) scale(.5)` },
        { opacity: 1, transform: `translateY(${-P * 5}px) scale(1.1)`, offset: 0.6 },
        { opacity: 1, transform: "none" },
      ], { duration: 560, delay: 260, easing: "steps(6, end)" });
    });

    $$(".achievement, .meter, .dialog", page).forEach((el, i) => {
      animateIn(el, [
        { opacity: 0, transform: "scale(.9)" },
        { opacity: 1, transform: "scale(1.02)", offset: 0.6 },
        { opacity: 1, transform: "none" },
      ], { duration: 300, delay: 80 + i * 100, easing: "steps(3, end)" });
    });

    const words = $$(".wi", page);
    const wordStart = 260;
    words.forEach((w, i) => {
      animateIn(w, [
        { opacity: 0, transform: `translateY(${P * 2}px)` },
        { opacity: 1, transform: "none" },
      ], { duration: 160, delay: wordStart + i * 50, easing: "steps(2, end)" });
    });
    const afterWords = wordStart + words.length * 50 + 120;

    typed.forEach((el) => Typer.play(el, afterWords));

    $$(".dialog__actions, .answers, .btn--begin, .signoff", page).forEach((el, i) => {
      animateIn(el, [
        { opacity: 0, transform: `translateY(${P * 3}px)` },
        { opacity: 1, transform: "none" },
      ], { duration: 240, delay: afterWords + 120 + i * 90, easing: "steps(3, end)" });
    });

    return afterWords + 400;
  }

  function depart(page) {
    const a = reducedMotion()
      ? animate(page, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "linear" })
      : animate(page, [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "scale(.96)" },
      ], { duration: 240, easing: "steps(3, end)" });
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
      Scene.set(next);
      Clock.set(next);

      setTimeout(() => {
        to.hidden = false;
        to.inert = false;
        index = next;
        Plant.set(index, pages.length);
        arrive(to);
        Mei.onPage(index, to);
        Tufo.onPage(index, to);

        const heading = $("h1, h2", to);
        if (heading) heading.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "auto" });

        if (onShown) onShown(to);
      }, reducedMotion() ? 80 : 260);

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
      Clock.set(0);

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

  /* ---------- Things I love about you: the heart meter fills ---------- */

  const Loves = (() => {
    const list = $("[data-loves]");
    const button = $('[data-action="reveal"]');
    const label = $("[data-reveal-label]");
    const hearts = $$("[data-meter] i");
    let shown = 0;
    let filled = 0;

    const done = () => shown >= CONTENT.loves.items.length;

    function updateLabel() {
      const { revealButton, moreButton, doneButton } = CONTENT.loves;
      label.textContent = done() ? doneButton : shown === 0 ? revealButton : moreButton;
    }

    function fillTo(n) {
      const from = filled;
      filled = n;
      for (let i = from; i < n; i++) {
        const heart = hearts[i];
        setTimeout(() => {
          heart.classList.add("is-full", "is-new");
          Music.blip(2);
          setTimeout(() => heart.classList.remove("is-new"), 450);
        }, reducedMotion() ? 0 : 200 + (i - from) * 120);
      }
    }

    function reveal() {
      if (done()) {
        Pages.next();
        return;
      }
      const li = document.createElement("li");
      li.className = "is-new";
      li.innerHTML = '<span class="love__text">' + format(CONTENT.loves.items[shown]) + "</span>";
      list.appendChild(li);
      const text = $(".love__text", li);
      Typer.prepare(text);
      Typer.play(text, 60);
      fillTo(Math.round(((shown + 1) / CONTENT.loves.items.length) * hearts.length));
      Tufo.onLove(li, shown);
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
    const clock = $("[data-clock]");
    const question = $(".question");
    const questionBox = $(".dialog--question");
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
      // stay above the grass, where the cats and their speech bubbles live
      const maxY = Math.max(MARGIN, Math.min(vh - bh - MARGIN, vh - groundH() - bh));

      const avoid = [
        inflate(yesTargetRect(), 18),
        inflate(soundToggle.getBoundingClientRect(), 10),
        inflate(clock.getBoundingClientRect(), 10),
        inflate(Mei.rect, 8),
        inflate(Tufo.rect, 8),
      ];
      const prefer = [inflate(question.getBoundingClientRect(), 6)]; // try not to cover the question
      // never park on the question box's wooden border: fully inside it or clear of it
      const frame = questionBox.getBoundingClientRect();
      const outer = inflate(frame, 8);
      const inner = inflate(frame, -(PX() * 7 + 8));
      const onBorder = (r) => overlaps(r, outer) &&
        !(r.left >= inner.left && r.right <= inner.right && r.top >= inner.top && r.bottom <= inner.bottom);
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
        if (avoid.some((a) => overlaps(rect, a)) || onBorder(rect)) continue;
        let score = Math.hypot(x - pos.x, y - pos.y);
        if (overlaps(rect, current)) score -= 10000;
        if (near && overlaps(rect, near)) score -= 5000;
        if (prefer.some((a) => overlaps(rect, a))) score -= 2000;
        if (score > 0) return { x, y };
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
      if (best) return best;

      // Fallback: a viewport corner clear of Yes (and, if possible, of everything else)
      const box = (c) => ({ left: c.x, top: c.y, right: c.x + bw, bottom: c.y + bh });
      const corners = [
        { x: MARGIN, y: MARGIN + 60 },
        { x: maxX, y: maxY },
        { x: MARGIN, y: maxY },
        { x: maxX, y: MARGIN + 60 },
      ].filter((c) => !overlaps(box(c), inflate(yesTargetRect(), 18)));
      const clean = corners.filter((c) => !avoid.some((a) => overlaps(box(c), a)) && !onBorder(box(c)));
      const pool = clean.length ? clean : corners;
      return pool[Math.floor(Math.random() * pool.length)] || { x: MARGIN, y: MARGIN + 60 };
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
      Tufo.onDodge();
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

  /* ---------- Music ----------
     The background track is a real recording (see CONTENT.music), played
     from a local file. Little sound effects (harp, chime, text blips, the
     cats) are made live with Web Audio, tuned to the track's key. */

  const Music = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const TRACK = CONTENT.music;
    const SFX_VOLUME = 0.1;
    const KEY = -3; // the flourishes were written in F; Gymnopédie No. 1 is in D
    const mtof = (m) => 440 * Math.pow(2, (m + KEY - 69) / 12);

    // The song plays through a plain <audio> element, never through Web Audio:
    // iPhones mute Web Audio when the silent switch is on, and browsers silence
    // media routed through Web Audio when the page is opened from disk.
    const audio = new Audio();
    // don't compete with the first photo and fonts: start buffering once the page has loaded
    audio.preload = "none";
    audio.src = TRACK.src;
    audio.loop = true;
    const preloadSong = () => { audio.preload = "auto"; };
    if (document.readyState === "complete") setTimeout(preloadSong, 300);
    else window.addEventListener("load", () => setTimeout(preloadSong, 300), { once: true });
    audio.setAttribute("playsinline", "");
    audio.volume = 0;
    audio.addEventListener("error", () => {
      console.warn("Music file could not be loaded:", TRACK.src, audio.error && audio.error.code);
    });

    let ctx = null;
    let master, sfx, reverbIn;
    let muted = false;
    let started = false;
    let fadeRaf = 0;

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
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);

      sfx = ctx.createGain();
      sfx.gain.value = SFX_VOLUME;
      sfx.connect(master);

      reverbIn = ctx.createGain();
      const verb = ctx.createConvolver();
      // filled a moment later so the tap itself stays instant
      setTimeout(() => { verb.buffer = impulse(3.2, 6); }, 120);
      const wet = ctx.createGain();
      wet.gain.value = 0.5;
      reverbIn.connect(verb);
      verb.connect(wet);
      wet.connect(sfx);
    }

    function setSession() {
      try {
        // "playback" keeps sound on with the iPhone silent switch on (Safari 17+)
        if (navigator.audioSession) navigator.audioSession.type = "playback";
      } catch (_) { /* not supported */ }
    }

    function fadeElement(to, ms) {
      cancelAnimationFrame(fadeRaf);
      const from = audio.volume;
      const t0 = performance.now();
      const step = (now) => {
        // rAF's timestamp can land a hair before t0: clamp, or a negative volume throws
        const p = Math.min(1, Math.max(0, (now - t0) / ms));
        audio.volume = Math.min(1, Math.max(0, from + (to - from) * p));
        if (p < 1) fadeRaf = requestAnimationFrame(step);
      };
      fadeRaf = requestAnimationFrame(step);
    }

    function playSong() {
      audio.muted = muted;
      const playing = audio.play();
      if (playing && playing.then) {
        playing.then(() => fadeElement(TRACK.volume, 3000)).catch((err) => {
          // blocked (rare): try again on her next tap anywhere
          console.warn("Music was blocked, retrying on next tap:", err && err.name);
          started = false;
          document.addEventListener("pointerup", start, { once: true });
        });
      } else {
        fadeElement(TRACK.volume, 3000);
      }
    }

    // Called from the "Tap to begin" tap: browsers only allow sound after one
    function start() {
      setSession();
      if (AC && !ctx) build();
      if (ctx && ctx.state === "suspended") ctx.resume();
      if (started) return;
      started = true;
      if (TRACK.startAt) audio.currentTime = TRACK.startAt;
      playSong();
    }

    function setMuted(value) {
      muted = value;
      audio.muted = muted;
      if (!ctx) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.setTargetAtTime(muted ? 0 : 1, now, muted ? 0.12 : 0.4);
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
      bus.connect(sfx);
      const send = ctx.createGain();
      send.gain.value = 0.8;
      bus.connect(send);
      send.connect(reverbIn);
      return bus;
    }

    // A harp glissando as the flowers open
    function gliss() {
      if (!ctx || muted) return;
      const bus = sendBus(0.5);
      const scale = [53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89];
      const t0 = ctx.currentTime + 0.03;
      scale.forEach((note, i) => pluck(note, t0 + i * 0.048, 0.18 + i * 0.012, bus));
      [65, 69, 72, 77].forEach((note) => pluck(note, t0 + scale.length * 0.048 + 0.1, 0.14, bus));
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

    // The little square-wave blip under typing text, in the song's key
    const BLIPS = [77, 79, 81, 84, 86];
    let lastBlip = 0;
    function blip(octave = 1) {
      if (!ctx || muted || !started || ctx.state !== "running") return;
      const t = ctx.currentTime;
      if (t - lastBlip < 0.045) return;
      lastBlip = t;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = mtof(BLIPS[Math.floor(Math.random() * BLIPS.length)]) * octave;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(g);
      g.connect(sfx);
      osc.start(t);
      osc.stop(t + 0.06);
    }

    // pause while the phone is locked / tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        audio.pause();
        if (ctx) ctx.suspend();
      } else {
        if (started) audio.play().catch(() => {});
        if (ctx) ctx.resume();
      }
    });

    // Build the effects graph early (on finger-down) so the tap itself stays light
    function warm() {
      setSession();
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

    // Tufo's hiss: a burst of filtered noise
    function hiss() {
      warm();
      if (!ctx || muted) return;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime + 0.02;
      const len = Math.floor(ctx.sampleRate * 0.8);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 2200;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(4200, t);
      bp.frequency.linearRampToValueAtTime(5600, t + 0.6);
      bp.Q.value = 0.8;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
      amp.gain.setValueAtTime(0.9, t + 0.35);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      src.connect(hp);
      hp.connect(bp);
      bp.connect(amp);
      amp.connect(sendBus(2.2));
      src.start(t);
      src.stop(t + 0.8);
    }

    return { warm, start, setMuted, gliss, chime, blip, meow, purr, hiss, get muted() { return muted; } };
  })();

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

    // A little way off to one side of the crop, never at the far edge of a big screen
    function spotFor(side) {
      const vw = document.documentElement.clientWidth;
      const w = width();
      const reach = Math.min(vw / 2 - w / 2 - 12, 250);
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
      wrap, button, width, spotFor, place, face, say, hush, current, mood, hearts, lookAt, lookAtEl, pick,
      get x() { return x; },
      get rect() { return button.getBoundingClientRect(); },
    };
  }

  const sideFor = (index) => (index % 2 === 0 ? "left" : "right");
  const otherSide = (side) => (side === "left" ? "right" : "left");

  /* ---------- Mei: sweet, follows you everywhere ---------- */

  const Mei = (() => {
    const cat = makeCat("mei");
    const text = CONTENT.mei;
    cat.button.setAttribute("aria-label", text.label);
    let side = "left";
    let petted = 0;
    let hintTimer = 0;
    const memo = {};

    const REACTIONS = [
      () => { cat.mood(["is-happy", "is-purring"], 1600); Music.purr(); cat.hearts(5); cat.say(text.purr); },
      () => { cat.mood(["is-meowing", "is-jumping"], 700); Music.meow(1); cat.hearts(2); cat.say(cat.pick(text.lines, memo)); },
      () => { cat.mood(["is-happy", "is-twitching"], 1300); cat.say(text.blink); },
      () => { cat.mood(["is-meowing", "is-excited"], 900); Music.meow(1.25); cat.say(cat.pick(text.lines, memo)); },
    ];

    function pet() {
      clearTimeout(hintTimer);
      if (petted === 0) {
        cat.mood(["is-meowing", "is-jumping"], 700);
        Music.meow(1.1);
        cat.hearts(3);
        cat.say(text.hello, 3000);
      } else {
        REACTIONS[(petted - 1) % REACTIONS.length]();
      }
      petted += 1;
      Tufo.jealous();
    }

    cat.button.addEventListener("click", pet);
    cat.button.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") cat.mood(["is-twitching"], 900);
    });

    function onPage(index, page) {
      clearTimeout(hintTimer);
      const token = cat.hush();
      side = sideFor(index);
      const line = text.pages[index];
      cat.place(cat.spotFor(side), true).then(() => {
        if (!cat.current(token)) return;
        if (page.matches(".page--question")) {
          cat.lookAtEl($('[data-action="yes"]', page));
          cat.mood(["is-excited"], 2400);
        }
        if (page.matches(".page--yay")) {
          cat.mood(["is-happy", "is-jumping", "is-excited"], 700);
          cat.hearts(8);
          setTimeout(() => { cat.mood(["is-happy", "is-jumping"], 700); cat.hearts(5); }, 750);
        }
        if (line) setTimeout(() => { if (cat.current(token)) cat.say(line, 3200); }, 250);
      });
    }

    let dodges = 0;
    function onDodge() {
      dodges += 1;
      if (dodges === 1 || dodges % 4 === 0) {
        cat.mood(["is-meowing", "is-twitching"], 800);
        cat.say(text.dodge[Math.floor(dodges / 4) % text.dodge.length], 2000);
      }
    }

    // Tufo hissed at her
    function startle() {
      cat.mood(["is-startled", "is-meowing"], 600);
      Music.meow(1.45);
      cat.say(text.startled, 1600);
    }

    function init() {
      cat.place(-cat.width() - 20, false);
      setTimeout(() => {
        cat.place(cat.spotFor("left"), true).then(() => {
          hintTimer = setTimeout(() => { if (!petted) cat.say(text.hint, 3200); }, 3500);
        });
      }, 1400);
      window.addEventListener("resize", () => cat.place(cat.spotFor(side), false));
    }

    // Being chased by her brother: run somewhere, leaping over him partway
    function run(target, pace, leapAt) {
      if (leapAt != null) setTimeout(() => cat.mood(["is-jumping", "is-meowing"], 620), leapAt);
      return cat.place(target, true, pace);
    }

    return {
      init, onPage, onDodge, startle, run,
      say: (line, ms) => cat.say(line, ms),
      spotFor: (s) => cat.spotFor(s),
      get side() { return side; },
      get rect() { return cat.rect; },
      get x() { return cat.x; },
    };
  })();

  /* ---------- Tufo: white, pink-eyed, and mean about it ---------- */

  const Tufo = (() => {
    const cat = makeCat("tufo");
    const text = CONTENT.tufo;
    cat.button.setAttribute("aria-label", text.label);
    let side = "right";
    let touched = 0;
    let lastJealous = 0;
    let introTimer = 0;
    let chaseTimer = 0;
    let chasing = false;
    let chases = 0;
    let pageToken = 0;
    const memo = {};

    // Like at home: he goes after his sister, she leaps over him and bolts, he follows
    function chase() {
      if (chasing || reducedMotion()) return;
      chasing = true;
      chases += 1;
      const token = pageToken;
      const alive = () => token === pageToken;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const meiHome = Mei.side;
      const far = otherSide(meiHome);
      const RUN = 2.6;   // his pace (ms per px, lower = faster)
      const FLEE = 2.2;  // hers

      cat.mood(["is-excited", "is-meowing"], 700);
      Music.meow(0.8);
      cat.say(cat.pick(text.chase.start, memo), 1600);

      const lap = async (toSide) => {
        const target = Mei.spotFor(toSide);
        // he charges at her, stopping just short on his side…
        const approach = Mei.x > cat.x ? 1 : -1;
        const charge = cat.place(Mei.x - approach * 64, true, RUN);
        await wait(380);
        if (!alive()) return false;
        // …she leaps over him and bolts to the other side
        const dist = Math.abs(target - Mei.x);
        const fleeing = Mei.run(target, FLEE, Math.max(120, Math.min(dist * FLEE * 0.35, 520)));
        await charge;
        if (!alive()) return false;
        await wait(120);
        // …then turns around and follows, stopping just short of her again
        const follow = target > cat.x ? 1 : -1;
        await cat.place(target - follow * 62, true, RUN);
        await fleeing;
        return alive();
      };

      (async () => {
        await wait(500);
        if (alive() && await lap(far)) {
          Mei.say(text.chase.meiStart, 1600);
          await wait(350);
          if (alive() && await lap(meiHome)) {
            await wait(300);
            cat.mood(["is-happy"], 2200);
            cat.say(cat.pick(text.chase.end, memo), 2400);
            await wait(900);
            if (alive()) Mei.say(text.chase.meiEnd, 2600);
            await wait(700);
            if (alive()) await cat.place(cat.spotFor(side), true, 8); // strolls back like nothing happened
          }
        }
        chasing = false;
      })();
    }

    const hiss = (line) => {
      cat.mood(["is-hissing", "is-meowing"], 900);
      Music.hiss();
      cat.say(line || cat.pick(text.hiss, memo), 2000);
    };
    const swat = (line) => {
      cat.mood(["is-swatting"], 600);
      Music.meow(0.7);
      if (line) cat.say(line, 2000);
    };

    // Knock something a little crooked, on purpose
    function knock(el, line) {
      if (!el) return;
      swat();
      const dir = cat.x > el.getBoundingClientRect().left ? -1 : 1;
      el.animate(reducedMotion()
        ? [{ rotate: "0deg" }, { rotate: `${dir * 1.6}deg`, translate: `${dir * 3}px 1px` }]
        : [
          { rotate: "0deg", translate: "0 0" },
          { rotate: `${dir * 4}deg`, translate: `${dir * 10}px 2px`, offset: 0.25 },
          { rotate: `${dir * -1}deg`, translate: `${dir * 2}px 0`, offset: 0.55 },
          { rotate: `${dir * 1.6}deg`, translate: `${dir * 3}px 1px` },
        ], { duration: 700, delay: 180, easing: "steps(5, end)", fill: "forwards" });
      if (line) {
        const token = cat.hush();
        setTimeout(() => { if (cat.current(token)) cat.say(line, 2400); }, 500);
      }
    }

    const REACTIONS = [
      () => hiss(),
      () => swat(cat.pick(text.swat, memo)),
      () => {
        cat.face(!cat.wrap.classList.contains("is-facing-right")); // turns his back
        cat.mood(["is-happy"], 1800);
        cat.say(text.ignore, 2200);
      },
      () => { cat.mood(["is-twitching"], 900); Music.meow(0.72); cat.say(cat.pick(text.rude, memo), 2400); },
    ];

    function touch() {
      clearTimeout(introTimer);
      touched += 1;
      if (touched === 1) {
        hiss(text.hello);
      } else if (touched % 6 === 0) {
        // allows exactly one pet… then swats the love away
        cat.mood(["is-happy", "is-purring"], 1100);
        Music.purr();
        const [heart] = cat.hearts(1);
        cat.say(text.allow, 1400);
        setTimeout(() => {
          swat(text.allowAfter);
          if (heart && heart.isConnected) heart.remove();
        }, 1000);
      } else {
        REACTIONS[(touched - 2) % REACTIONS.length]();
      }
    }

    cat.button.addEventListener("click", touch);
    cat.button.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") cat.mood(["is-hissing"], 500);
    });

    // Someone petted Mei
    function jealous() {
      const now = performance.now();
      if (now - lastJealous < 6000 || Math.random() > 0.45) return;
      lastJealous = now;
      setTimeout(() => {
        const page = document.querySelector(".page:not([hidden])");
        if (Math.random() < 0.3 && !(page && page.matches(".page--question"))) {
          chase();
        } else if (Math.random() < 0.5) {
          cat.face(Mei.x > cat.x);
          hiss(text.hissAtMei);
          setTimeout(() => Mei.startle(), 250);
        } else {
          cat.mood(["is-twitching"], 900);
          cat.say(cat.pick(text.jealous, memo), 2400);
        }
      }, 900);
    }

    function onPage(index, page) {
      clearTimeout(introTimer);
      clearTimeout(chaseTimer);
      pageToken += 1;
      chasing = false;
      const token = cat.hush();
      side = otherSide(sideFor(index));
      const line = text.pages[index];
      // follows… reluctantly: later and slower than Mei
      setTimeout(() => {
        if (!cat.current(token)) return;
        cat.place(cat.spotFor(side), true, 8).then(() => {
          if (!cat.current(token)) return;
          if (page.matches(".page--question")) cat.lookAtEl($("[data-no]"));
          if (index === 2) {
            knock($(".dialog", page), text.knock);
            return;
          }
          if (page.matches(".page--yay")) {
            cat.mood(["is-happy"], 2600);
            setTimeout(() => cat.hearts(1), 1400);
          }
          if (line) setTimeout(() => { if (cat.current(token)) cat.say(line, 3000); }, 900);
          // on the memory and love pages he sometimes goes after Mei (always the first time)
          if (index >= 1 && index <= 4 && chases < 4 && (chases === 0 || Math.random() < 0.4)) {
            const mine = pageToken;
            chaseTimer = setTimeout(() => { if (mine === pageToken) chase(); }, 5200 + Math.random() * 2500);
          }
        });
      }, reducedMotion() ? 0 : 600);
    }

    // A love-list item was revealed: he swats the second one crooked
    function onLove(li, i) {
      if (i === 1) setTimeout(() => knock(li, text.knockLove), 500);
    }

    let dodges = 0;
    function onDodge() {
      dodges += 1;
      if (dodges === 2 || (dodges > 2 && dodges % 4 === 2)) {
        cat.mood(["is-happy"], 1200);
        cat.say(text.dodge[Math.floor(dodges / 4) % text.dodge.length], 2200);
      }
    }

    function init() {
      cat.place(document.documentElement.clientWidth + 20, false);
      setTimeout(() => {
        cat.place(cat.spotFor("right"), true, 8).then(() => {
          introTimer = setTimeout(() => { if (!touched) cat.say(text.intro, 3000); }, 5200);
        });
      }, 2600);
      window.addEventListener("resize", () => cat.place(cat.spotFor(side), false));
    }

    return { init, onPage, onLove, onDodge, jealous, get rect() { return cat.rect; } };
  })();

  /* ---------- Sound toggle ---------- */

  (() => {
    const button = $("[data-sound-toggle]");
    const label = $("[data-sound-label]");
    const sync = () => {
      button.setAttribute("aria-pressed", String(Music.muted));
      label.textContent = Music.muted ? CONTENT.sound.unmute : CONTENT.sound.mute;
      button.title = label.textContent + " · " + CONTENT.music.credit;
    };
    button.addEventListener("click", () => {
      Music.setMuted(!Music.muted);
      sync();
    });
    sync();
  })();

  /* ---------- Falling hearts & confetti ---------- */

  const Petals = (() => {
    const canvas = $("[data-petals]");
    const ctx = canvas.getContext("2d");
    const heart = Pixel.heartSmall().canvas();
    const COLORS = ["#e0304e", "#f6c23e", "#7fcdf2", "#8fd05a", "#f58aa8", "#fff3d1", "#b79af0"];
    const DURATION = 7000;
    const SPAWN_FOR = 4800;
    let raf = 0;
    let size = null;

    function make(W, H, burst) {
      return {
        heart: Math.random() < 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        x: Math.random() * W,
        y: burst ? -Math.random() * H * 0.6 : -8,
        vy: 12 + Math.random() * 16,
        sway: 2 + Math.random() * 4,
        swaySpeed: 1 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 3 + Math.random() * 4,
      };
    }

    function run() {
      if (reducedMotion()) return;
      cancelAnimationFrame(raf);
      size = artSize();
      fitCanvas(canvas, size);
      const { W, H } = size;
      const count = Math.round(Math.min(90, Math.max(50, W / 2)));
      const bits = Array.from({ length: Math.round(count * 0.35) }, () => make(W, H, true));
      const spawnRate = (count * 0.65) / SPAWN_FOR;
      let spawned = 0;
      const start = performance.now();
      let last = start;

      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const elapsed = now - start;
        const due = Math.min(count * 0.65, elapsed * spawnRate);
        while (spawned < due) { bits.push(make(W, H, false)); spawned += 1; }

        const fade = elapsed > DURATION - 900 ? Math.max(0, (DURATION - elapsed) / 900) : 1;
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = Math.ceil(fade * 4) / 4; // fades in steps too

        for (const p of bits) {
          p.y += p.vy * dt;
          p.phase += p.swaySpeed * dt;
          p.flip += p.flipSpeed * dt;
          if (p.y > H + 8) continue;
          const x = Math.round(p.x + Math.sin(p.phase) * p.sway);
          const y = Math.round(p.y);
          if (p.heart) {
            ctx.drawImage(heart, x, y);
          } else {
            const wide = Math.cos(p.flip) > 0;
            ctx.fillStyle = p.color;
            ctx.fillRect(x, y, wide ? 2 : 1, wide ? 1 : 2);
          }
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

    return { run };
  })();

  /* ---------- Fireworks over the festival ---------- */

  const Fireworks = (() => {
    const canvas = $("[data-fireworks]");
    const ctx = canvas.getContext("2d");
    const COLORS = ["#ff6b6b", "#ffd84a", "#6bd0ff", "#9bff7a", "#ff9df0", "#fff3d1"];
    const END = 16000;
    let raf = 0;

    // Patches of sky no box covers, in art pixels: bursts aim there so they are seen
    function openSky(px) {
      const boxes = $$(".page:not([hidden]) :is(.achievement, .frame, .meter, .dialog), .hud > *")
        .map((el) => el.getBoundingClientRect());
      const floor = window.innerHeight - groundH();
      const R = 10 * px;
      const spots = [];
      for (let y = R; y < floor - R; y += R / 2) {
        for (let x = R; x < window.innerWidth - R; x += R / 2) {
          const hit = boxes.some((b) => x - R < b.right && x + R > b.left && y - R < b.bottom && y + R > b.top);
          if (!hit) spots.push({ x: x / px, y: y / px });
        }
      }
      return spots;
    }

    // a few spots, as far apart as possible
    function spread(spots, n) {
      const picked = [];
      while (picked.length < n && spots.length) {
        let best = spots[0];
        let bestD = -1;
        for (const s of spots) {
          const d = picked.length ? Math.min(...picked.map((p) => Math.hypot(p.x - s.x, p.y - s.y))) : -s.y;
          if (d > bestD) { bestD = d; best = s; }
        }
        picked.push(best);
      }
      return picked;
    }

    // with reduced motion the festival still gets its fireworks, frozen mid-burst
    function still(W, H, spots) {
      const bursts = spots.length
        ? spread(spots, 3).map((s, i) => [s.x / W, s.y / H, i * 2])
        : [[0.22, 0.14, 0], [0.74, 0.1, 2], [0.52, 0.26, 4]];
      bursts.forEach(([fx, fy, c]) => {
        const x = Math.round(W * fx);
        const y = Math.round(H * fy);
        [[9, 18, COLORS[c]], [5, 12, COLORS[c + 1]]].forEach(([r, n, color]) => {
          ctx.fillStyle = color;
          for (let k = 0; k < n; k++) {
            const a = (k / n) * Math.PI * 2;
            ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
          }
        });
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, 1, 1);
      });
    }

    function run() {
      cancelAnimationFrame(raf);
      const size = artSize();
      fitCanvas(canvas, size);
      const { W, H, px } = size;
      const spots = openSky(px);
      if (reducedMotion()) { still(W, H, spots); return; }
      const launchY = H - Math.ceil(groundH() / px) - 6;
      const rockets = [];
      const sparks = [];
      const start = performance.now();
      let last = start;
      let nextLaunch = start + 150;

      const burst = (r) => {
        const n = 22 + Math.floor(Math.random() * 12);
        const speed = 16 + Math.random() * 10;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2;
          const s = speed * (0.75 + Math.random() * 0.35);
          sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, age: 0, life: 1.1 + Math.random() * 0.6, color: r.color });
        }
      };

      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const t = now - start;
        if (t < END && now >= nextLaunch) {
          const aim = spots.length ? spots[Math.floor(Math.random() * spots.length)] : null;
          rockets.push({
            x: aim ? aim.x : W * (0.12 + Math.random() * 0.76),
            y: launchY,
            vy: -(60 + Math.random() * 30),
            top: aim ? aim.y : H * (0.06 + Math.random() * 0.26),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
          nextLaunch = now + (t < 6000 ? 380 + Math.random() * 380 : 1100 + Math.random() * 1200);
        }

        ctx.clearRect(0, 0, W, H);
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.y += r.vy * dt;
          ctx.fillStyle = "#fff3d1";
          ctx.fillRect(Math.round(r.x), Math.round(r.y), 1, 2);
          ctx.fillStyle = "#f6c23e88";
          ctx.fillRect(Math.round(r.x), Math.round(r.y) + 2, 1, 2);
          if (r.y <= r.top) { rockets.splice(i, 1); burst(r); }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.age += dt;
          if (s.age > s.life) { sparks.splice(i, 1); continue; }
          s.vy += 20 * dt;
          s.vx *= 0.985;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.age > s.life * 0.65 && Math.random() < 0.5) continue; // crackle as it dies
          const big = s.age < s.life * 0.4 ? 2 : 1;
          ctx.fillStyle = s.age < 0.12 ? "#ffffff" : s.color;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), big, big);
        }

        if (t < END || rockets.length || sparks.length) {
          raf = requestAnimationFrame(frame);
        } else {
          canvas.width = canvas.height = 0;
          raf = 0;
        }
      };
      raf = requestAnimationFrame(frame);
    }

    return { run };
  })();

  /* ---------- A screen full of pixel flowers ---------- */

  const Lilies = (() => {
    const canvas = $("[data-lilies]");
    const ctx = canvas.getContext("2d");
    const SCALE = 2;       // each flower is drawn at 2x its art size
    const STAGE = 170;     // ms per growth stage: bud, half open, open
    let flowers = null;
    let leaves = null;
    let raf = 0;

    function prepare() {
      if (flowers) return;
      flowers = Array.from({ length: Pixel.FLOWER_COUNT }, (_, v) => [0, 1, 2].map((s) => Pixel.flower(v, s).canvas()));
      leaves = [0, 1, 2].map((i) => Pixel.leafSprite(i).canvas());
    }

    function release() {
      canvas.width = canvas.height = 0; // hand the GPU memory back
      canvas.classList.remove("is-fading");
    }

    // Returns the ms at which the screen is fully covered
    function bloom(origin) {
      prepare();
      cancelAnimationFrame(raf);
      canvas.classList.remove("is-fading", "is-quick");
      const size = artSize();
      fitCanvas(canvas, size);
      const { W, H, px } = size;
      ctx.imageSmoothingEnabled = false;

      const ox = origin.x / px;
      const oy = origin.y / px;
      const fw = 15 * SCALE;
      const lw = 13 * SCALE;
      const step = 13;
      const maxDist = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
      const blooms = [];
      const greens = [];
      for (let row = 0, y = -step / 2; y < H + step; y += step, row++) {
        for (let x = -step / 2 + (row % 2) * (step / 2); x < W + step; x += step) {
          const jx = x + (Math.random() - 0.5) * step * 0.6;
          const jy = y + (Math.random() - 0.5) * step * 0.6;
          const dist = Math.hypot(jx - ox, jy - oy) / maxDist;
          blooms.push({
            x: Math.round(jx - fw / 2),
            y: Math.round(jy - fw / 2),
            delay: dist * 1300 + Math.random() * 250,
            v: Math.floor(Math.random() * flowers.length),
          });
          if (Math.random() < 0.5) {
            greens.push({
              x: Math.round(jx - lw / 2 + (Math.random() - 0.5) * step),
              y: Math.round(jy - lw / 2 + (Math.random() - 0.5) * step),
              delay: dist * 1100,
              s: Math.floor(Math.random() * leaves.length),
            });
          }
        }
      }
      blooms.sort((a, b) => a.y - b.y);
      const covered = Math.max(...blooms.map((b) => b.delay)) + STAGE * 3;
      const reduced = reducedMotion();

      const fadeOut = (after) => {
        setTimeout(() => {
          canvas.classList.add("is-fading");
          setTimeout(release, reduced ? 700 : 1900);
        }, after);
      };

      const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        for (const l of greens) {
          if (t < l.delay) continue;
          ctx.drawImage(leaves[l.s], l.x, l.y, lw, lw);
        }
        for (const b of blooms) {
          const p = t - b.delay;
          if (p < 0) continue;
          ctx.drawImage(flowers[b.v][Math.min(2, Math.floor(p / STAGE))], b.x, b.y, fw, fw);
        }
      };

      if (reduced) {
        draw(Infinity);
        canvas.classList.add("is-quick");
        fadeOut(1500);
        return 500;
      }

      const start = performance.now();
      const frame = (now) => {
        const t = now - start;
        draw(t);
        if (t < covered) {
          raf = requestAnimationFrame(frame);
        } else {
          raf = 0;
          fadeOut(450);
        }
      };
      raf = requestAnimationFrame(frame);
      return covered;
    }

    // Draw the sprites while she's still reading the intro, so the tap is instant
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
    setTimeout(() => idle(prepare, { timeout: 800 }), 2200);

    return { bloom };
  })();

  /* ---------- Wiring ---------- */

  Scene.init();
  renderContent();
  Pages.init();
  Mei.init();
  Tufo.init();

  // Later photos start downloading once the page has fully loaded, then get
  // decoded ahead of time so the celebration doesn't hitch
  const loadLatePhotos = () => {
    $$("img[data-late]").forEach((img) => {
      if (!img.dataset.src) return;
      img.src = img.dataset.src;
      delete img.dataset.src;
      if (img.decode) img.decode().catch(() => {});
    });
  };
  if (document.readyState === "complete") setTimeout(loadLatePhotos, 500);
  else window.addEventListener("load", () => setTimeout(loadLatePhotos, 500), { once: true });

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
      // swap pages underneath while the flowers cover everything
      setTimeout(() => Pages.next(), covered + 300);
    } else if (action === "next") {
      Pages.next();
    } else if (action === "yes") {
      Dodge.retire();
      Music.start();
      Music.chime();
      Pages.next(() => {
        Fireworks.run();
        setTimeout(Petals.run, reducedMotion() ? 0 : 250);
      });
    }
  });
})();
