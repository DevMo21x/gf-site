/* Zero hearts: the explosion and reset. */

"use strict";

/* ---------- Zero hearts: he runs to her and they both blow up ---------- */

const Boom = (() => {
  const box = $("[data-boom]");
  const mo = $('[data-actor="mo"]');
  const gab = $('[data-actor="gab"]');
  const text = CONTENT.boom;
  box.addEventListener("cancel", (e) => e.preventDefault()); // only Try again gets him back

  async function run() {
    await Dialogue.say({ text: text.rush, face: "shocked" });
    Achievements.unlock("boom");
    await Dialogue.close();
    const from = Actors.mo.rect;
    const to = Actors.gab.rect;
    if (!reducedMotion()) {
      const dx = to.left + to.width * 0.6 - from.left;
      const P = PX();
      await animate(mo, [
        { transform: "none" },
        { transform: `translate(${dx * 0.5}px, ${-P * 4}px)` },
        { transform: `translateX(${dx}px)` },
      ], { duration: 650, easing: "steps(8, end)" }).finished.catch(() => {});
    }
    // he lands on her, so the blast takes them both
    const r = Actors.mo.rect;
    const g = Actors.gab.rect;
    mo.classList.add("is-gone");
    gab.classList.add("is-gone");
    Fireworks.boom((r.left + r.right + g.left + g.right) / 4, (r.top + r.bottom + g.top + g.bottom) / 4);
    Music.blip(0.25);
    if (!reducedMotion()) {
      const P = PX();
      animateIn($(".actors"), [0, -1, 1, -1, 1, 0].map((k) => ({ transform: `translate(${k * P * 2}px, ${-k * P}px)` })),
        { duration: 420, easing: "steps(6, end)" });
    }
    setTimeout(() => Tufo.speak(text.tufo), 700);
    await new Promise((r) => setTimeout(r, reducedMotion() ? 300 : 1400));
    if (box.showModal) box.showModal();
    else box.setAttribute("open", "");
  }

  function reset() {
    box.close();
    mo.getAnimations().forEach((a) => a.cancel());
    mo.classList.remove("is-gone");
    gab.classList.remove("is-gone");
    Story.restart();
  }

  return { run, reset };
})();
