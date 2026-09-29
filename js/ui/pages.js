/* Pages and the choreography between them. */

"use strict";

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

  $$(".logo, .frame", page).forEach((el, i) => {
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

  $$(".achievement, .meter:not(.meter--talk), .dialog:not(.credits__box)", page).forEach((el, i) => {
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

  $$(".dialog__actions, .answers, .menu, .signoff", page).forEach((el, i) => {
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
  const pages = {};
  $$("[data-page]").forEach((page) => { pages[page.dataset.page] = page; });
  let current = "title";
  let busy = false;

  function show(name, onShown) {
    const to = pages[name];
    if (busy || name === current || !to) return;
    busy = true;

    const from = pages[current];
    from.inert = true;
    const leaving = depart(from);

    setTimeout(() => {
      to.hidden = false;
      to.inert = false;
      current = name;
      arrive(to);
      Mei.onPage(to);
      Tufo.onPage(to);

      const focus = $("[data-talk], h1, h2", to);
      if (focus) focus.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "auto" });

      if (onShown) onShown(to);
    }, reducedMotion() ? 80 : 260);

    leaving.then(() => {
      from.hidden = true;
      from.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      busy = false;
    });
  }

  function init() {
    Object.values(pages).forEach((page) => {
      if (page !== pages.title) page.inert = true;
    });
    Clock.set(0);

    // wait for the fonts and the photo (max 700ms) so the entrance
    // starts on a clean frame instead of fighting the first paint
    const title = pages.title;
    const img = $("img", title);
    title.style.opacity = "0";
    const assets = Promise.all([
      document.fonts ? document.fonts.ready : null,
      img && img.decode ? img.decode().catch(() => {}) : null,
    ]);
    const cap = new Promise((r) => setTimeout(r, 700));
    Promise.race([assets, cap]).then(() => requestAnimationFrame(() => {
      title.style.opacity = "";
      arrive(title);
    }));
  }

  return { init, show, get current() { return current; } };
})();
