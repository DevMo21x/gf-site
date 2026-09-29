/* Mei the cat. */

"use strict";

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
    if (petted === 10) Achievements.unlock("mei");
    Tufo.jealous();
  }

  cat.button.addEventListener("click", pet);
  cat.button.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") cat.mood(["is-twitching"], 900);
  });

  function onPage(page) {
    clearTimeout(hintTimer);
    const token = cat.hush();
    const name = page.dataset.page;
    const line = text.pages[name];
    cat.place(cat.spotFor(side), true).then(() => {
      if (!cat.current(token)) return;
      if (name === "question") {
        cat.lookAtEl($('[data-action="yes"]', page));
        cat.mood(["is-excited"], 2400);
      }
      if (name === "yay") {
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
    say: (line, ms) => { clearTimeout(hintTimer); cat.say(line, ms); }, // she's talked: no need for the hint
    spotFor: (s) => cat.spotFor(s),
    get side() { return side; },
    get rect() { return cat.rect; },
    get x() { return cat.x; },
  };
})();
