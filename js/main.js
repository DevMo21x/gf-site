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

// Credits and the letter: wooden boxes over the farm; tapping outside one closes it too
const credits = $("[data-credits]");
const letter = $("[data-letter]");
[credits, letter].forEach((box) => box.addEventListener("click", (e) => { if (e.target === box) box.close(); }));
const openBox = (box) => (box.showModal ? box.showModal() : box.setAttribute("open", ""));

// The envelope floats down onto the celebration once the fireworks have had a moment
function showEnvelope() {
  const envelope = $('[data-action="letter"]');
  envelope.hidden = false;
  if (reducedMotion()) return;
  animateIn(envelope, [
    { opacity: 0, transform: `translateY(${-PX() * 30}px) rotate(-6deg)` },
    { opacity: 1, transform: `translateY(${-PX() * 10}px) rotate(4deg)`, offset: 0.5 },
    { opacity: 1, transform: `translateY(${-PX() * 3}px) rotate(-2deg)`, offset: 0.8 },
    { opacity: 1, transform: "none" },
  ], { duration: 1400, easing: "steps(12, end)" });
}

/* ---------- The farm after yes: free play ---------- */

function goFarm() {
  document.body.dataset.scene = "talk";
  Scene.set(6);
  Clock.set(6);
  Actors.sit(false);
  Actors.gab.setFace("happy");
  Actors.mo.setFace("happy");
  Garden.full();
  Pages.show("farm", () => Fireworks.run());
}

// Tap the sky for a firework, or the lily for a little shower of petals
let lastBurst = 0;
document.addEventListener("click", (e) => {
  if (Pages.current !== "farm" || e.target.closest("button, a, dialog, .dialog, .hud, .cat-wrap")) return;
  const g = $("[data-garden]").getBoundingClientRect();
  if (e.clientX >= g.left && e.clientX <= g.right && e.clientY >= g.top && e.clientY <= g.bottom) {
    Petals.run({ density: 0.4 });
    Mei.say(CONTENT.garden.tap, 2400);
    return;
  }
  const now = performance.now();
  if (e.clientY > window.innerHeight - groundH() || now - lastBurst < 600) return;
  lastBurst = now;
  Fireworks.boom(e.clientX, e.clientY);
  Music.blip(1.5);
});

/* ---------- Secrets ---------- */

// Tap the moon: a shooting star, and a wish
let lastWish = 0;
function wish() {
  const now = performance.now();
  if (now - lastWish < 2500) return;
  lastWish = now;
  const r = $("[data-moon]").getBoundingClientRect();
  Fireworks.star(r.left + r.width / 2, r.top + r.height / 2);
  Music.chime();
  Achievements.unlock("moon");
  setTimeout(() => Mei.say(CONTENT.eggs.moon.wish[Math.floor(Math.random() * CONTENT.eggs.moon.wish.length)], 2800), 700);
}

// Type "sand person" anywhere: it rains sand
let typed = "";
let lastSand = -Infinity;
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || !/^[a-z]$/i.test(e.key)) return;
  typed = (typed + e.key.toLowerCase()).slice(-10);
  if (typed !== "sandperson" || performance.now() - lastSand < 10000) return;
  lastSand = performance.now();
  Petals.sand();
  Achievements.unlock("sand");
  Actors.mo.emote("sweat");
  Tufo.say(CONTENT.eggs.sand.tufo, 2600);
  setTimeout(() => Mei.say(CONTENT.eggs.sand.mei, 2400), 1200);
});

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
    Achievements.render();
    openBox(credits);
  } else if (action === "letter") {
    Music.chime();
    openBox(letter);
  } else if (action === "moon") {
    wish();
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
      setTimeout(showEnvelope, reducedMotion() ? 0 : 4000);
    });
  } else if (action === "farm") {
    goFarm();
  } else if (action === "try-again") {
    Boom.reset();
  } else if (action === "replay") {
    window.location.reload();
  }
});
