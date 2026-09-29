/* The dialogue box: his words, her choices. */

"use strict";

/* ---------- The dialogue box: his words, her choices ---------- */

const Dialogue = (() => {
  const box = $("[data-talk]");
  const titleEl = $("[data-talk-title]");
  const textEl = $("[data-talk-text]");
  const reply = $("[data-reply]");
  const choicesEl = $("[data-choices]");
  const nextBtn = $("[data-talk-next]");
  const found = $("[data-found]");
  const foundItem = $("[data-found-item]");
  let waiting = null;   // resolves the current line when she taps on
  let choosing = false;

  // Type a line out; resolves once every letter is showing
  function speak(line) {
    titleEl.hidden = !line.title;
    titleEl.innerHTML = line.title ? format(line.title) : "";
    textEl.classList.remove("is-typed");
    box.classList.remove("has-typed");
    nextBtn.hidden = true;
    textEl.innerHTML = format(line.text);
    Typer.prepare(textEl);
    $(".visually-hidden", textEl).insertAdjacentHTML("afterbegin", `${escapeHTML(CONTENT.mohaimen.name)}: `);
    const face = line.face || "neutral";
    Portrait.set(face);
    Actors.mo.setFace(face);
    Actors.mo.talk(true);
    return new Promise((resolve) => {
      Typer.play(textEl, 120, () => {
        Actors.mo.talk(false);
        resolve();
      });
    });
  }

  // Type a line, then wait for her tap
  async function say(line) {
    await speak(line);
    nextBtn.hidden = false;
    await new Promise((resolve) => { waiting = resolve; });
    Music.blip();
  }

  // Offer her replies (or, with action, one thing to do); resolves with the one she picks
  function ask(options, { action = false } = {}) {
    choosing = true;
    nextBtn.hidden = true;
    // an option is its words, or { label, item } for a gift with its picture
    const buttons = options.map((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn choice";
      b.innerHTML = (o.item ? `<i class="item item--${o.item} choice__item" aria-hidden="true"></i>` : "") +
        `<span>${format(o.label || o)}</span>`;
      b.addEventListener("pointerenter", () => b.focus({ preventScroll: true })); // the cursor follows the pointer
      return b;
    });
    choicesEl.replaceChildren(...buttons);
    reply.classList.toggle("is-action", action);
    reply.hidden = false;
    box.classList.add("is-choosing");
    const P = PX();
    if (!action) {
      animateIn(reply, reducedMotion()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: `translateY(${P * 4}px)` }, { opacity: 1, transform: "none" }],
      { duration: 200, easing: "steps(2, end)" });
    }
    buttons.forEach((b, i) => animateIn(b, reducedMotion()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: `translateY(${P * 2}px)` }, { opacity: 1, transform: "none" }],
    { duration: 200, delay: 120 + i * 80, easing: "steps(2, end)" }));
    buttons[0].focus({ preventScroll: true });
    reply.scrollIntoView({ block: "nearest" }); // on a short phone they can start below the fold

    return new Promise((resolve) => {
      buttons.forEach((b, i) => b.addEventListener("click", () => {
        if (!choosing) return;
        choosing = false;
        reply.hidden = true;
        choicesEl.replaceChildren();
        box.classList.remove("is-choosing");
        box.focus({ preventScroll: true });
        Music.blip(2);
        resolve(i);
      }));
    });
  }

  // arrow keys walk the choices, like a game menu
  choicesEl.addEventListener("keydown", (e) => {
    const buttons = $$("button", choicesEl);
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    buttons[(i + step + buttons.length) % buttons.length].focus();
  });

  // One tap finishes the typing; the next one moves on
  function advance() {
    if (choosing) return;
    if (Typer.busy(textEl)) { Typer.finish(textEl); return; }
    if (waiting) {
      const go = waiting;
      waiting = null;
      nextBtn.hidden = true;
      go();
    }
  }

  // anywhere on the farm counts as a tap, except the cats, the HUD and other buttons
  document.addEventListener("click", (e) => {
    if (Pages.current !== "talk") return;
    if (e.target.closest("button:not([data-talk-next]), a, .hud, .cat-wrap, dialog")) return;
    advance();
  });
  document.addEventListener("keydown", (e) => {
    if (Pages.current !== "talk" || e.repeat || (e.key !== "Enter" && e.key !== " ")) return;
    const el = document.activeElement;
    if (el && el !== box && el.closest("button, a, input, dialog")) return; // buttons press themselves
    e.preventDefault();
    advance();
  });

  // A memory's item: he holds it up over his head, then it drops into the slot on his box
  async function showItem(item) {
    foundItem.className = "item item--" + item;
    Music.pickup();
    if (reducedMotion()) {
      found.hidden = false;
      animateIn(found, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear" });
      return;
    }
    const held = await Actors.mo.holdUp(item);
    const from = held.getBoundingClientRect();
    const to = foundItem.getBoundingClientRect(); // the slot keeps its room while hidden
    const at = (x, y) => `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    const fly = held.animate([
      { transform: at(from.left, from.top) },
      { transform: at((from.left + to.left) / 2, Math.min(from.top, to.top) - PX() * 10), offset: 0.5 },
      { transform: at(to.left, to.top) },
    ], { duration: 480, easing: "steps(6, end)", fill: "forwards" });
    await fly.finished.catch(() => {});
    held.remove();
    found.hidden = false;
    Music.blip(2);
    animateIn(found, [
      { transform: "scale(1)" },
      { transform: "scale(1.15)", offset: 0.5 },
      { transform: "scale(1)" },
    ], { duration: 240, easing: "steps(3, end)" });
  }

  // Between hours the box folds away while the sky changes
  function close() {
    const a = animate(box, reducedMotion()
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }],
    { duration: reducedMotion() ? 140 : 240, easing: "steps(3, end)" });
    if (!found.hidden) animate(found, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "steps(2, end)" });
    reply.hidden = true;
    return a ? a.finished.catch(() => {}) : Promise.resolve();
  }

  function open() {
    box.getAnimations().forEach((a) => a.cancel()); // also straightens anything Tufo knocked over
    // a clean page for the new hour: the last hour's words don't linger while he holds something up
    textEl.replaceChildren();
    titleEl.hidden = true;
    nextBtn.hidden = true;
    found.getAnimations().forEach((a) => a.cancel());
    found.hidden = true;
    animateIn(box, reducedMotion()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
        { opacity: 0, transform: "scale(.9)" },
        { opacity: 1, transform: "scale(1.02)", offset: 0.6 },
        { opacity: 1, transform: "none" },
      ], { duration: reducedMotion() ? 140 : 300, easing: "steps(3, end)" });
  }

  return { speak, say, ask, showItem, close, open };
})();
