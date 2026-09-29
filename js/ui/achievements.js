/* Achievements: little Stardew-style toasts for the secrets, counted in Credits. */

"use strict";

/* ---------- Achievements: toasts now, a tally in Credits ---------- */

const Achievements = (() => {
  const text = CONTENT.achievements;
  const ids = Object.keys(text.list);
  const KEY = "gab-achievements";
  const toast = $("[data-toast]");
  const toastTitle = $("[data-toast-title]");
  const queue = [];
  let showing = false;

  // saved in the browser so "Play again" (a reload) keeps them; private windows just forget
  let got = new Set();
  try { got = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch (e) { /* nothing saved */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...got])); } catch (e) { /* in memory only */ } };

  function next() {
    if (showing || !queue.length) return;
    showing = true;
    toastTitle.innerHTML = format(text.list[queue.shift()].title);
    toast.hidden = false;
    Music.chime();
    const P = PX();
    animateIn(toast, reducedMotion()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
        { opacity: 0, transform: `translateY(${-P * 12}px)` },
        { opacity: 1, transform: `translateY(${P * 2}px)`, offset: 0.7 },
        { opacity: 1, transform: "none" },
      ], { duration: 420, easing: "steps(5, end)" });
    setTimeout(() => {
      const a = animate(toast, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "steps(3, end)" });
      const done = () => { if (a) a.cancel(); toast.hidden = true; showing = false; setTimeout(next, 200); };
      if (a) a.onfinish = done; else done();
    }, 2800);
  }

  function unlock(id) {
    if (got.has(id) || !text.list[id]) return;
    got.add(id);
    save();
    queue.push(id);
    next();
  }

  // the tally at the bottom of Credits
  function render() {
    $("[data-achievements-count]").textContent = text.found.replace("{n}", got.size).replace("{total}", ids.length);
    $("[data-achievements-list]").innerHTML = ids.map((id) => {
      const a = text.list[id];
      return got.has(id)
        ? `<li class="is-got">${format(a.title)}</li>`
        : `<li>${escapeHTML(text.locked)} <small>${format(a.hint)}</small></li>`;
    }).join("");
  }

  $("[data-toast-label]").textContent = text.toast;
  return { unlock, render };
})();
