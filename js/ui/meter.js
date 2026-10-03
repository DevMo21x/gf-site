/* Friendship hearts meter. */

"use strict";

/* ---------- Friendship hearts: gifts and moments fill them, misses break them ---------- */

const Meter = (() => {
  const meter = $("[data-meter]");
  const hearts = $$("i", meter);
  let filled = 0;

  function label() {
    meter.setAttribute("aria-label", CONTENT.hearts.replace("{n}", filled));
  }

  function set(n, quiet) {
    n = Math.max(0, Math.min(hearts.length, n));
    const from = filled;
    filled = n;
    label();
    hearts.forEach((heart, i) => {
      heart.classList.remove("is-new", "is-lost");
      heart.classList.toggle("is-full", i < (quiet ? n : Math.min(from, n)));
    });
    if (quiet) return;
    // the plaque it hangs on jolts when a heart changes
    meter.classList.remove("is-jolted");
    void meter.offsetWidth;
    if (n !== from) meter.classList.add("is-jolted");
    for (let i = from; i < n; i++) {
      const heart = hearts[i];
      setTimeout(() => {
        heart.classList.add("is-full", "is-new");
        Music.blip(2);
        setTimeout(() => heart.classList.remove("is-new"), 450);
      }, reducedMotion() ? 0 : 200 + (i - from) * 120);
    }
    for (let i = n; i < from; i++) {
      hearts[i].classList.add("is-lost");
      Music.blip(0.5);
      setTimeout(() => hearts[i].classList.remove("is-lost"), 450);
    }
  }

  set(CONTENT.heartsAtStart, true);
  return { set, add: (n) => set(filled + n), get filled() { return filled; }, get max() { return hearts.length; } };
})();
