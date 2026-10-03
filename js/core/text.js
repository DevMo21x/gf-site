/* Text: CONTENT lookup, *red* markup, typewriter, filling the page from content.js. */

"use strict";

/* ---------- Content ---------- */

const escapeHTML = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// *word* becomes emphasis, <3 becomes the pixel heart, everything else is escaped
const format = (str) => escapeHTML(str)
  .replace(/\*([^*]+)\*/g, "<em>$1</em>")
  .replace(/&lt;3/g, '<i class="signoff__heart" aria-hidden="true"></i>');

const lookup = (path) =>
  path.split(".").reduce((obj, key) => obj?.[key], CONTENT);

// every text node under node is swapped for what fn(its text) returns
function eachText(node, fn) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === 1) eachText(child, fn);
    else if (child.nodeType === 3) node.replaceChild(fn(child.textContent), child);
  });
}

function splitWords(node) {
  eachText(node, (text) => {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
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
    return frag;
  });
}

/* ---------- Typewriter dialogue ---------- */

const Typer = (() => {
  const SPEED = 26; // ms per letter
  const runs = new Map();

  function wrapLetters(node) {
    eachText(node, (text) => {
      const frag = document.createDocumentFragment();
      for (const ch of text) {
        if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = ch;
        frag.appendChild(span);
      }
      return frag;
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
    if (!run) return null;
    clearTimeout(run.timer);
    cancelAnimationFrame(run.raf);
    runs.delete(el);
    return run;
  }

  function finish(el) {
    const run = stop(el);
    el.classList.add("is-typed");
    const box = el.closest("[data-dialog]");
    if (box) box.classList.add("has-typed");
    if (run && run.onDone) run.onDone();
  }

  const busy = (el) => runs.has(el);

  // returns when (ms from now) the last letter lands; onDone runs when it does (or is tapped through)
  function play(el, delay = 0, onDone) {
    stop(el);
    const chars = $$(".typed .ch", el);
    if (reducedMotion() || !chars.length) { finish(el); if (onDone) onDone(); return 0; }
    const run = { timer: 0, raf: 0, onDone };
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

  // a tap on a dialogue box finishes its sentences at once (the talk box handles its own taps)
  document.addEventListener("click", (e) => {
    const box = e.target.closest("[data-dialog]");
    if (box && !box.hasAttribute("data-talk") && !e.target.closest("button")) $$("[data-type]", box).forEach(finish);
  });

  return { prepare, play, finish, busy };
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
  $("[data-letter-body]").innerHTML = CONTENT.letter.body.map((p) => `<p>${format(p)}</p>`).join("");
  $("[data-moon]").setAttribute("aria-label", CONTENT.eggs.moon.label);
  $("[data-credits-list]").innerHTML = CONTENT.title.creditsLines.map((line) => `<li>${format(line)}</li>`).join("");
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
