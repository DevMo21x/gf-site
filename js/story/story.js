/* The story runner: one Saturday, dawn to night. */

"use strict";

/* ---------- The story: one Saturday, dawn to night ---------- */

const Story = (() => {
  const beats = CONTENT.story;
  const quiz = CONTENT.quiz;
  const questions = beats.flatMap((b) => b.lines).filter((l) => l.quiz);
  const NIGHT = 5; // the question comes at night; the festival is saved for her answer
  const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 150) : ms));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const missed = new Set(); // questions she got wrong, asked again after the last beat
  let started = false;
  let over = false;         // zero hearts or ten: the story stops where it is

  async function play(l) {
    if (l.mei) { Mei.say(l.mei, 2800); return; }
    if (l.tufo) { Tufo.speak(l.tufo, l.knock); return; }

    if (l.memory != null) {
      const m = CONTENT.memories[l.memory];
      if (m.item) Dialogue.showItem(m.item);
      const line = { title: m.title, text: m.body, face: l.face };
      await Dialogue.say(line);
      return;
    }

    if (l.mo) {
      await Dialogue.say({ text: l.mo, face: l.face });
      return;
    }

    if (l.quiz) {
      await Dialogue.speak({ text: l.quiz, face: "nervous" });
      const order = l.answers.map((_, k) => k).sort(() => Math.random() - 0.5);
      const right = order[await Dialogue.ask(order.map((k) => l.answers[k]))] === l.correct;
      Meter.add(right ? 1 : -1);
      over = Meter.filled === 0 || Meter.filled === Meter.max;
      if (right) {
        missed.delete(l);
        Actors.gab.emote("heart");
        Actors.gab.setFace("happy", 1600);
      } else {
        missed.add(l);
        Actors.mo.emote("sweat");
        Actors.gab.setFace("shocked", 1600);
        Tufo.speak(pick(quiz.tufo));
      }
      const reply = right ? l.right || pick(quiz.right) : l.wrong || pick(quiz.wrong);
      await Dialogue.say({ text: reply, face: right ? "happy" : "shocked" });
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

  async function beat(i) {
    const hour = Math.min(i, NIGHT);
    Tufo.onBeat(i);
    if (i > 0) {
      await Dialogue.close();
      Scene.set(hour, beats[i].place);
      Actors.sit(beats[i].place === "airbnb");
      Clock.set(hour);
      Actors.mo.setFace("neutral");
      await wait(1200);
      Dialogue.open();
      await wait(320);
    }
    const lines = beats[i].lines;
    for (let k = 0; k < lines.length && !over; k++) await play(lines[k]);
  }

  async function start() {
    if (started) return;
    started = true;
    for (let i = 0; i < beats.length && !over; i++) await beat(i);
    // the day is done but the hearts aren't: the ones she missed come back
    // (every question, if she has since fixed them all)
    while (!over) {
      await Dialogue.say({ text: quiz.retry, face: "soft" });
      await play(missed.size ? missed.values().next().value : pick(questions));
    }
    if (Meter.filled === 0) { Boom.run(); return; }
    // ten hearts, and he finally asks
    Scene.set(NIGHT);
    Actors.sit(false);
    Clock.set(NIGHT);
    await Dialogue.say({ text: quiz.full, face: "soft" });
    Dialogue.showItem("bouquet");
    await Dialogue.say({ text: CONTENT.bouquet.give, face: "blush" });
    Actors.mo.setFace("soft");
    Actors.gab.emote("exclaim");
    await wait(1100);
    Portrait.set("soft");
    Pages.show("question");
  }

  // After the explosion: a fresh morning, a fresh Mohaimen
  async function restart() {
    started = false;
    over = false;
    missed.clear();
    Meter.set(quiz.start, true);
    Scene.set(0);
    Actors.sit(false);
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
