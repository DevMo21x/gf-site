/* Tufo the cat. */

"use strict";

/* ---------- Tufo: white, pink-eyed, and mean about it ---------- */

const Tufo = (() => {
  const cat = makeCat("tufo");
  const text = CONTENT.tufo;
  cat.button.setAttribute("aria-label", text.label);
  let side = "right";
  let touched = 0;
  let lastJealous = 0;
  let introTimer = 0;
  let chaseTimer = 0;
  let chasing = false;
  let chases = 0;
  let pageToken = 0;
  const memo = {};

  // Like at home: he goes after his sister, she leaps over him and bolts, he follows
  function chase() {
    if (chasing || humping || reducedMotion()) return;
    chasing = true;
    chases += 1;
    const token = pageToken;
    const alive = () => token === pageToken;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const meiHome = Mei.side;
    const far = otherSide(meiHome);
    const RUN = 2.6;   // his pace (ms per px, lower = faster)
    const FLEE = 2.2;  // hers

    cat.mood(["is-excited", "is-meowing"], 700);
    Music.meow(0.8);
    cat.say(cat.pick(text.chase.start, memo), 1600);

    const lap = async (toSide) => {
      const target = Mei.spotFor(toSide);
      // he charges at her, stopping just short on his side…
      const approach = Mei.x > cat.x ? 1 : -1;
      const charge = cat.place(Mei.x - approach * 64, true, RUN);
      await wait(380);
      if (!alive()) return false;
      // …she leaps over him and bolts to the other side
      const dist = Math.abs(target - Mei.x);
      const fleeing = Mei.run(target, FLEE, Math.max(120, Math.min(dist * FLEE * 0.35, 520)));
      await charge;
      if (!alive()) return false;
      await wait(120);
      // …then turns around and follows, stopping just short of her again
      const follow = target > cat.x ? 1 : -1;
      await cat.place(target - follow * 62, true, RUN);
      await fleeing;
      return alive();
    };

    (async () => {
      await wait(500);
      if (alive() && await lap(far)) {
        Mei.say(text.chase.meiStart, 1600);
        await wait(350);
        if (alive() && await lap(meiHome)) {
          await wait(300);
          cat.mood(["is-happy"], 2200);
          cat.say(cat.pick(text.chase.end, memo), 2400);
          await wait(900);
          if (alive()) Mei.say(text.chase.meiEnd, 2600);
          await wait(700);
          if (alive()) await cat.place(cat.spotFor(side), true, 8); // strolls back like nothing happened
        }
      }
      chasing = false;
    })();
  }

  // Now and then he drags out Kevin, his stuffed cat, and gets… busy. Tapping him ends it.
  let humping = false;
  let humps = 0;
  let humpTimer = 0;
  let humpSteps = [];
  function hump() {
    if (humping || chasing) return;
    humping = true;
    humps += 1;
    const token = cat.hush();
    const later = (ms, fn) => humpSteps.push(setTimeout(() => { if (cat.current(token)) fn(); }, ms));
    cat.wrap.classList.add("has-plush");
    cat.say(cat.pick(text.plush.start, memo), 1800);
    later(500, () => { cat.wrap.classList.add("is-humping"); cat.mood(["is-happy"], 3400); });
    later(1500, () => Mei.say(cat.pick(CONTENT.mei.plush, memo), 2200));
    later(2300, () => cat.say(cat.pick(text.plush.during, memo), 1800));
    later(4000, () => {
      cat.wrap.classList.remove("is-humping");
      cat.say(cat.pick(text.plush.end, memo), 2200);
    });
    later(5600, () => stopHump());
  }
  function stopHump(line) {
    humpSteps.forEach(clearTimeout);
    humpSteps = [];
    if (!humping) return false;
    humping = false;
    cat.wrap.classList.remove("is-humping", "has-plush");
    if (line) hiss(line);
    return true;
  }
  // pages and beats: a fresh chance, after whatever was already planned
  function planHump(ms) {
    clearTimeout(humpTimer);
    humpTimer = setTimeout(hump, ms);
  }

  const hiss = (line) => {
    cat.mood(["is-hissing", "is-meowing"], 900);
    Music.hiss();
    cat.say(line || cat.pick(text.hiss, memo), 2000);
  };
  const swat = (line) => {
    cat.mood(["is-swatting"], 600);
    Music.meow(0.7);
    if (line) cat.say(line, 2000);
  };

  // Knock something a little crooked, on purpose
  function knock(el, line) {
    if (!el) return;
    swat();
    const dir = cat.x > el.getBoundingClientRect().left ? -1 : 1;
    el.animate(reducedMotion()
      ? [{ rotate: "0deg" }, { rotate: `${dir * 1.6}deg`, translate: `${dir * 3}px 1px` }]
      : [
        { rotate: "0deg", translate: "0 0" },
        { rotate: `${dir * 4}deg`, translate: `${dir * 10}px 2px`, offset: 0.25 },
        { rotate: `${dir * -1}deg`, translate: `${dir * 2}px 0`, offset: 0.55 },
        { rotate: `${dir * 1.6}deg`, translate: `${dir * 3}px 1px` },
      ], { duration: 700, delay: 180, easing: "steps(5, end)", fill: "forwards" });
    if (line) {
      const token = cat.hush();
      setTimeout(() => { if (cat.current(token)) cat.say(line, 2400); }, 500);
    }
  }

  const REACTIONS = [
    () => hiss(),
    () => swat(cat.pick(text.swat, memo)),
    () => {
      cat.face(!cat.wrap.classList.contains("is-facing-right")); // turns his back
      cat.mood(["is-happy"], 1800);
      cat.say(text.ignore, 2200);
    },
    () => { cat.mood(["is-twitching"], 900); Music.meow(0.72); cat.say(cat.pick(text.rude, memo), 2400); },
  ];

  function touch() {
    clearTimeout(introTimer);
    if (stopHump(cat.pick(text.plush.caught, memo))) return; // walked in on him
    touched += 1;
    if (touched === 1) {
      hiss(text.hello);
    } else if (touched % 6 === 0) {
      // allows exactly one pet… then swats the love away
      cat.mood(["is-happy", "is-purring"], 1100);
      Music.purr();
      const [heart] = cat.hearts(1);
      cat.say(text.allow, 1400);
      Achievements.unlock("tufo");
      setTimeout(() => {
        swat(text.allowAfter);
        if (heart && heart.isConnected) heart.remove();
      }, 1000);
    } else {
      REACTIONS[(touched - 2) % REACTIONS.length]();
    }
  }

  cat.button.addEventListener("click", touch);
  cat.button.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") cat.mood(["is-hissing"], 500);
  });

  // Someone petted Mei
  function jealous() {
    const now = performance.now();
    if (now - lastJealous < 6000 || Math.random() > 0.45) return;
    lastJealous = now;
    setTimeout(() => {
      const page = document.querySelector(".page:not([hidden])");
      if (Math.random() < 0.3 && !(page && page.matches(".page--question"))) {
        chase();
      } else if (Math.random() < 0.5) {
        cat.face(Mei.x > cat.x);
        hiss(text.hissAtMei);
        setTimeout(() => Mei.startle(), 250);
      } else {
        cat.mood(["is-twitching"], 900);
        cat.say(cat.pick(text.jealous, memo), 2400);
      }
    }, 900);
  }

  function onPage(page) {
    clearTimeout(introTimer);
    clearTimeout(chaseTimer);
    clearTimeout(humpTimer);
    stopHump();
    pageToken += 1;
    chasing = false;
    const token = cat.hush();
    const name = page.dataset.page;
    const line = text.pages[name];
    // follows… reluctantly: later and slower than Mei
    setTimeout(() => {
      if (!cat.current(token)) return;
      cat.place(cat.spotFor(side), true, 8).then(() => {
        if (!cat.current(token)) return;
        if (name === "question") cat.lookAtEl($("[data-no]"));
        if (name === "yay") {
          cat.mood(["is-happy"], 2600);
          setTimeout(() => cat.hearts(1), 1400);
        }
        if (line) setTimeout(() => { if (cat.current(token)) cat.say(line, 3000); }, 900);
      });
    }, reducedMotion() ? 0 : 600);
  }

  // A new hour of the talk: on the memory and love beats he sometimes goes after Mei (always the first time)
  function onBeat(index) {
    clearTimeout(chaseTimer);
    if (!chasing) pageToken += 1; // a chase already under way gets to finish, even as the hour changes
    if (index >= 1 && index <= 4 && chases < 4 && (chases === 0 || Math.random() < 0.4)) {
      const mine = pageToken;
      chaseTimer = setTimeout(() => { if (mine === pageToken) chase(); }, 5200 + Math.random() * 2500);
    } else if (humps < 3 && (index >= 2 && humps === 0 || Math.random() < 0.4)) {
      planHump(6000 + Math.random() * 4000);
    }
  }

  // The No button gave up on the grass: he walks over and sits on it, then hops off
  async function sitOn(el) {
    clearTimeout(chaseTimer);
    clearTimeout(humpTimer);
    stopHump();
    chasing = false;
    const token = cat.hush();
    const alive = () => cat.current(token);
    const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 300) : ms));
    const r = el.getBoundingClientRect();
    cat.mood(["is-excited"], 700);
    cat.say(text.sitOnNo.go, 1600);
    await wait(500);
    await cat.place(r.left + r.width / 2 - cat.width() / 2, true, 4.5);
    if (!alive()) return;
    // feet a little way into the top of the button, so he looks sat, not floating
    const floor = cat.rect.bottom;
    cat.wrap.style.setProperty("--perch", Math.max(0, Math.round(floor - el.getBoundingClientRect().top - r.height * 0.3)) + "px");
    cat.wrap.classList.add("is-perched");
    cat.mood(["is-happy", "is-purring"], 2600);
    Music.purr();
    cat.say(text.sitOnNo.sit, 2400);
    setTimeout(() => { if (alive()) Mei.say(CONTENT.mei.sitOnNo, 2200); }, 1200);
    await wait(2800);
    cat.wrap.classList.remove("is-perched");
    if (!alive()) return;
    cat.mood(["is-jumping"], 500);
    cat.say(text.sitOnNo.off, 2400);
    await wait(400);
    cat.place(cat.spotFor(side), true, 8);
  }

  // Zoomies: he runs back and forth across the screen until stopZoom (the jacket moment)
  let zooming = false;
  async function zoom() {
    clearTimeout(chaseTimer);
    zooming = true;
    const vw = () => document.documentElement.clientWidth;
    while (zooming) {
      const target = 8 + Math.random() * (vw() - cat.width() - 16);
      cat.mood(["is-excited"], 600);
      await cat.place(target, true, 2);
      await new Promise((r) => setTimeout(r, reducedMotion() ? 900 : 120 + Math.random() * 280));
    }
  }
  function stopZoom() {
    zooming = false;
    setTimeout(() => cat.place(cat.spotFor(side), true, 8), 900);
  }

  // A line from the story; knock: true means he swats the dialogue box crooked
  function speak(line, knockIt) {
    if (knockIt) knock($("[data-talk]"), line);
    else cat.say(line, 2600);
  }

  let dodges = 0;
  function onDodge() {
    dodges += 1;
    if (dodges === 2 || (dodges > 2 && dodges % 4 === 2)) {
      cat.mood(["is-happy"], 1200);
      cat.say(text.dodge[Math.floor(dodges / 4) % text.dodge.length], 2200);
    }
  }

  function init() {
    cat.place(document.documentElement.clientWidth + 20, false);
    setTimeout(() => {
      cat.place(cat.spotFor("right"), true, 8).then(() => {
        introTimer = setTimeout(() => { if (!touched) cat.say(text.intro, 3000); }, 5200);
        // left alone on the start menu long enough, he gets Kevin out
        planHump(15000);
      });
    }, 2600);
    window.addEventListener("resize", () => cat.place(cat.spotFor(side), false));
  }

  // "Load game" on the title: there are no saves
  const scoff = (line) => { clearTimeout(introTimer); cat.face(false); hiss(line); };

  return { init, onPage, onBeat, onDodge, sitOn, jealous, speak, scoff, zoom, stopZoom, say: (line, ms) => cat.say(line, ms), get rect() { return cat.rect; } };
})();
