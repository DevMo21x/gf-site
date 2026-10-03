/* The story runner: one Saturday, dawn to night. */

"use strict";

/* ---------- The story: one Saturday, dawn to night ---------- */

const Story = (() => {
  const beats = CONTENT.story;
  const NIGHT = 5; // the question comes at night; the festival is saved for her answer
  const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 150) : ms));
  let started = false;
  let over = false; // zero hearts: the day stops where it is and he runs over to her

  // hearts change; at zero the day is over
  function hearts(n) {
    Meter.add(n);
    if (Meter.filled === 0) over = true;
  }

  async function play(l) {
    if (l.mei) { Mei.say(l.mei, 2800); return; }
    if (l.tufo) { Tufo.speak(l.tufo, l.knock); return; }

    if (l.memory != null) {
      const m = CONTENT.memories[l.memory];
      if (m.item) await Dialogue.showItem(m.item);
      const line = { title: m.title, text: m.body, face: l.face };
      await Dialogue.say(line);
      return;
    }

    if (l.mo) {
      await Dialogue.say({ text: l.mo, face: l.face });
      return;
    }

    // she gives him something from her bag; she holds it up, he reacts, the cats have opinions
    if (l.gift) {
      const g = CONTENT.gifts[l.gift];
      await Dialogue.speak({ text: g.ask, face: "nervous" });
      // shuffled, so the one he loves isn't always first
      const options = g.options.slice().sort(() => Math.random() - 0.5);
      const o = options[await Dialogue.ask(options)];
      Music.pickup();
      (await Actors.gab.holdUp(o.item, 900)).remove();
      hearts(o.hearts);
      Actors.mo.emote(o.hearts > 0 ? "heart" : "sweat");
      if (o.tufo) Tufo.speak(o.tufo);
      if (o.mei) setTimeout(() => Mei.say(o.mei, 2600), 700);
      await Dialogue.say({ text: o.reply, face: o.face });
      return;
    }

    // a little thing she does with her fingers, with the box put away
    if (l.moment) {
      const m = CONTENT.moments[l.moment];
      await Dialogue.say({ text: m.ask, face: l.moment === "heart" ? "nervous" : "soft" });
      await Dialogue.close();
      const inTime = await Moments[l.moment]();
      Dialogue.open();
      await wait(320);
      hearts(inTime ? 2 : -1);
      if (inTime) {
        Actors.gab.emote("heart");
        if (m.mei) setTimeout(() => Mei.say(m.mei, 2400), 600);
      } else {
        Actors.mo.emote("sweat");
      }
      await Dialogue.say({ text: inTime ? m.done : m.slow, face: inTime ? "blush" : "shocked" });
      return;
    }

    if (l.plant) {
      const g = CONTENT.garden;
      await Dialogue.say({ text: g.give, face: "soft" });
      await Dialogue.ask([g.plant], { action: true });
      Garden.plant();
      Actors.gab.emote("heart");
      setTimeout(() => Mei.say(g.mei, 2600), 600);
      await Dialogue.say({ text: g.planted, face: "happy" });
      return;
    }

    if (l.stars) {
      const s = CONTENT.stars;
      await Dialogue.say({ text: s.intro, face: "soft" });
      await Dialogue.close();
      await Stars.run();
      Dialogue.open();
      await wait(320);
      Meter.set(Meter.max); // the stars fill whatever hearts are left
      await Dialogue.say({ text: s.done, face: "blush" });
      return;
    }

    if (l.loves) {
      const faces = ["blush", "soft", "happy"];
      const items = CONTENT.loves.items;
      for (let k = 0; k < items.length; k++) {
        Actors.gab.setFace("blush");
        if (k > 0) Actors.gab.emote("heart");
        await Dialogue.say({ text: items[k], face: faces[k % faces.length] });
      }
      Actors.gab.setFace("neutral");
    }
  }

  // A little wooden sign drops in under the clock: where they are now, and when
  const card = $("[data-place-card]");
  let cardTimer = 0;
  function placeCard(place) {
    const name = CONTENT.places[place];
    if (!name) return;
    clearTimeout(cardTimer);
    card.getAnimations().forEach((a) => a.cancel());
    $("[data-place-name]", card).textContent = name;
    $("[data-place-time]", card).textContent = $("[data-clock-time]").textContent;
    card.hidden = false;
    const P = PX();
    animateIn(card, reducedMotion()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
        { transform: `translateY(${-P * 50}px)` },
        { transform: `translateY(${P * 2}px)`, offset: 0.7 },
        { transform: "none" },
      ], { duration: reducedMotion() ? 200 : 560, easing: "steps(6, end)" });
    cardTimer = setTimeout(() => {
      const a = animate(card, reducedMotion()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ transform: "none" }, { transform: `translateY(${-P * 70}px)` }],
      { duration: 420, easing: "steps(5, end)" });
      const done = () => { card.hidden = true; if (a) a.cancel(); };
      if (a) a.finished.then(done, done); else done();
    }, 2600);
  }

  async function beat(i) {
    const hour = Math.min(i, NIGHT);
    Tufo.onBeat(i);
    if (i > 0) {
      await Dialogue.close();
      Scene.set(hour, beats[i].place);
      Actors.sit(beats[i].place === "airbnb");
      Clock.set(hour, beats[i].night);
      if (beats[i].place) placeCard(beats[i].place);
      Garden.grow(i - 2); // it grows while they're away; she sees it again at sunset
      Actors.mo.setFace("neutral");
      await wait(1200);
      Dialogue.open();
      await wait(320);
    }
    for (const line of beats[i].lines) {
      if (over) return;
      await play(line);
    }
  }

  async function start() {
    if (started) return;
    started = true;
    for (let i = 0; i < beats.length && !over; i++) await beat(i);
    if (over) { Boom.run(); return; }
    // ten hearts, and he finally asks
    Scene.set(NIGHT);
    Actors.sit(false);
    Clock.set(NIGHT);
    Garden.bloom();
    await Dialogue.say({ text: CONTENT.garden.bloom, face: "blush" });
    await Dialogue.say({ text: CONTENT.ending, face: "soft" });
    // he holds the bouquet up, then out to her, and keeps holding it while he asks
    Music.pickup();
    (await Actors.mo.holdUp("bouquet")).remove();
    Actors.mo.hold(true);
    await Dialogue.say({ text: CONTENT.bouquet.give, face: "blush" });
    Actors.mo.setFace("soft");
    Actors.gab.emote("exclaim");
    await wait(1100);
    Portrait.set("soft");
    Pages.show("question");
  }

  // After the explosion: a fresh morning, a fresh Mohaimen (in his jacket again)
  async function restart() {
    started = false;
    over = false;
    Garden.reset();
    Meter.set(CONTENT.heartsAtStart, true);
    Scene.set(0);
    Actors.sit(false);
    Actors.mo.hold(false);
    Actors.mo.swapJacket(false);
    Actors.gab.swapJacket(false);
    Clock.set(0);
    Actors.mo.setFace("neutral");
    Actors.gab.setFace("neutral");
    await wait(900);
    Dialogue.open();
    await wait(320);
    start();
  }

  return { start, restart };
})();
