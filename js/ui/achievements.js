/* Achievements: little Stardew-style toasts for the secrets, counted in Credits. */

"use strict";

/* ---------- Achievements: toasts now, a tally in Credits ---------- */

const Achievements = (() => {
  const text = CONTENT.achievements;
  const ids = Object.keys(text.list);
  const KEY = "gab-achievements";
  const toast = $("[data-toast]");
  const toastTitle = $("[data-toast-title]");
  const grand = $("[data-toast-grand]");
  const queue = [];
  let showing = false;
  let complete = false; // the last secret just landed: the golden moment plays after its toast

  // saved in the browser so "Play again" (a reload) keeps them; private windows just forget
  let got = new Set();
  try { got = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch (e) { /* nothing saved */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...got])); } catch (e) { /* in memory only */ } };

  function next() {
    if (!showing && !queue.length && complete) { complete = false; celebrate(); return; }
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
    if (got.size === ids.length) complete = true;
    queue.push(id);
    next();
  }

  // Every secret found: a gold banner, gold falling, fireworks, and everyone reacts
  function celebrate() {
    const c = text.complete;
    const still = reducedMotion();
    const onFarm = document.body.dataset.scene !== "title";
    $("[data-grand-line]").textContent = c.line.replace("{n}", got.size).replace("{total}", ids.length);
    grand.hidden = false;
    const P = PX();
    animateIn(grand, still
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
        { opacity: 0, transform: `translateY(${-P * 20}px) scale(.9)` },
        { opacity: 1, transform: `translateY(${P * 3}px) scale(1.04)`, offset: 0.7 },
        { opacity: 1, transform: "none" },
      ], { duration: still ? 200 : 560, easing: "steps(6, end)" });
    Music.gliss();
    [300, 600].forEach((t) => setTimeout(Music.chime, t));
    if (!still) {
      Petals.run({ colors: ["#f6c23e", "#fff0a0", "#b8801c", "#fff3d1", "#e0304e"], hearts: 0.5, density: 0.8 });
      if (onFarm) Fireworks.run();
    }
    if (onFarm) {
      Actors.gab.emote("heart", 2400);
      if (!still) setTimeout(() => { Actors.mo.jump(); setTimeout(Actors.gab.jump, 160); }, 400);
    }
    setTimeout(() => Mei.say(c.mei, 2800), 900);
    setTimeout(() => Tufo.say(c.tufo, 2400), 2400);
    setTimeout(() => {
      const a = animate(grand, [{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: "steps(3, end)" });
      const done = () => { if (a) a.cancel(); grand.hidden = true; };
      if (a) a.onfinish = done; else done();
    }, 4600);
  }

  // the tally at the bottom of Credits
  function render() {
    const count = $("[data-achievements-count]");
    count.textContent = text.found.replace("{n}", got.size).replace("{total}", ids.length);
    count.classList.toggle("is-complete", got.size === ids.length);
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
