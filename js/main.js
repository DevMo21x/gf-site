/* Boot: wires everything together. Loaded last. */

"use strict";

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

// the engine is built the moment a finger or key goes down on "Play"
const playButton = $('[data-action="play"]');
playButton.addEventListener("pointerdown", () => Music.warm(), { once: true });
playButton.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") Music.warm();
});

// Credits: a wooden box over the farm; tapping outside it closes it too
const credits = $("[data-credits]");
credits.addEventListener("click", (e) => { if (e.target === credits) credits.close(); });

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "play") {
    if (target.dataset.used) return;
    target.dataset.used = "true";
    Music.start(); // the tap is the permission browsers need
    Music.gliss();
    const r = target.getBoundingClientRect();
    const origin = e.clientX || e.clientY
      ? { x: e.clientX, y: e.clientY }
      : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const covered = Lilies.bloom(origin);
    // swap to the farm underneath while the flowers cover everything
    setTimeout(() => {
      document.body.dataset.scene = "talk";
      Pages.show("talk", () => setTimeout(Story.start, reducedMotion() ? 200 : 1300));
    }, covered + 300);
  } else if (action === "load") {
    Tufo.scoff(CONTENT.title.loadJoke.tufo);
    setTimeout(() => Mei.say(CONTENT.title.loadJoke.mei, 2400), 1100);
  } else if (action === "credits") {
    if (credits.showModal) credits.showModal();
    else credits.setAttribute("open", "");
  } else if (action === "yes") {
    Dodge.retire();
    Music.start();
    Music.chime();
    Scene.set(6);
    Clock.set(6);
    Actors.celebrate();
    Pages.show("yay", () => {
      Fireworks.run();
      setTimeout(Petals.run, reducedMotion() ? 0 : 250);
    });
  } else if (action === "try-again") {
    Boom.reset();
  } else if (action === "replay") {
    window.location.reload();
  }
});
