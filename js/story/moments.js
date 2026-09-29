/* The little things she does with her fingers, one per memory. */

"use strict";

/* ---------- Moments: calm his heart, get the jacket back, catch the shawarma ----------
   Each is against the clock and resolves true if she made it in time, false if she was too slow. */

const Moments = (() => {
  const layer = $("[data-moment]");
  const hint = $("[data-moment-hint]");
  const text = CONTENT.moments;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function open(words) {
    layer.replaceChildren(hint);
    hint.textContent = words;
    layer.hidden = false;
    if (!reducedMotion()) animateIn(layer, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "steps(3, end)" });
  }

  function close() {
    return new Promise((resolve) => setTimeout(() => {
      layer.hidden = true;
      layer.replaceChildren(hint);
      resolve();
    }, reducedMotion() ? 200 : 700));
  }

  // a sprite she can tap, placed in the layer at x, y (CSS pixels, layer-relative)
  function thing(item, label, x, y) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `moment__thing item item--${item}`;
    b.setAttribute("aria-label", label);
    b.style.left = Math.round(x) + "px";
    b.style.top = Math.round(y) + "px";
    layer.appendChild(b);
    return b;
  }
  const inLayer = (r) => {
    const l = layer.getBoundingClientRect();
    return { x: r.left - l.left + r.width / 2, y: r.top - l.top };
  };
  const size = () => PX() * 16;

  // the clock: a bar under the hint that drains; out() runs if it empties first
  function clock(seconds, out) {
    const bar = document.createElement("i");
    bar.className = "moment__timer";
    bar.style.setProperty("--time", seconds + "s");
    bar.style.top = hint.offsetTop + hint.offsetHeight + 10 + "px"; // just under the hint, however many lines it takes
    layer.appendChild(bar);
    const timer = setTimeout(out, seconds * 1000);
    return () => { clearTimeout(timer); bar.classList.add("is-stopped"); };
  }

  // At the airport: his heart races; each tap slows it down
  function heart() {
    const t = text.heart;
    open(t.hint);
    const s = size() * 1.5;
    const b = thing("nervous", t.hint, layer.clientWidth / 2 - s / 2, layer.clientHeight * 0.35 - s / 2);
    b.classList.add("moment__heart");
    let left = t.taps;
    b.style.setProperty("--beat", "220ms");
    b.focus({ preventScroll: true });
    return new Promise((resolve) => {
      const stop = clock(t.seconds, () => {
        left = 0;
        b.disabled = true;
        Actors.mo.setFace("shocked");
        Actors.mo.emote("sweat");
        close().then(() => resolve(false));
      });
      b.addEventListener("click", () => {
        if (left <= 0) return;
        left -= 1;
        Music.blip(0.6 + (t.taps - left) * 0.12);
        b.style.setProperty("--beat", 220 + (t.taps - left) * 260 + "ms");
        if (left > 0) return;
        stop();
        b.classList.add("is-calm");
        Actors.mo.setFace("soft");
        close().then(() => resolve(true));
      });
    });
  }

  // On the docks: he takes off his jacket for her, Tufo runs off with it,
  // and she gets it back by catching him (three taps)
  function jacket() {
    const t = text.jacket;
    open(t.hint);
    const s = size();
    const P = PX();
    const from = inLayer(Actors.mo.rect);
    Actors.mo.swapJacket(true);
    Portrait.jacketOff(true);
    const b = thing("jacket", t.hint, from.x - s / 2, from.y - s - P * 4);
    b.classList.add("moment__jacket");
    b.focus({ preventScroll: true });

    return new Promise((resolve) => {
      let raf = 0;
      let runner = null;
      // too slow: Tufo keeps it
      const stop = clock(t.seconds, () => {
        b.remove();
        cancelAnimationFrame(raf);
        if (runner) { runner.remove(); Tufo.stopZoom(); }
        Tufo.say(t.slowTufo, 2200);
        close().then(() => resolve(false));
      });

      // Tufo gets there first, then zooms around the screen with it
      b.addEventListener("click", () => {
        const to = inLayer(Tufo.rect);
        b.style.left = Math.round(to.x - s / 2) + "px";
        b.style.top = Math.round(to.y) + "px";
        b.disabled = true;
        Tufo.say(t.steal, 1800);
        Music.blip(0.5);
        setTimeout(() => { b.remove(); chase(); }, reducedMotion() ? 0 : 420);
      }, { once: true });

      function chase() {
        hint.textContent = t.chase.replace("{n}", t.taps);
        Tufo.zoom();
        // a button that rides on Tufo, with the jacket on his back
        runner = document.createElement("button");
        runner.type = "button";
        runner.className = "moment__thing moment__runner";
        runner.setAttribute("aria-label", t.chase.replace("{n}", t.taps));
        runner.innerHTML = '<i class="item item--jacket" aria-hidden="true"></i>';
        layer.appendChild(runner);
        runner.focus({ preventScroll: true });
        const follow = () => {
          const r = Tufo.rect;
          const l = layer.getBoundingClientRect();
          runner.style.width = Math.round(r.width) + "px";
          runner.style.height = Math.round(r.height) + "px";
          runner.style.transform = `translate3d(${Math.round(r.left - l.left)}px, ${Math.round(r.top - l.top)}px, 0)`;
          raf = requestAnimationFrame(follow);
        };
        follow();

        let left = t.taps;
        runner.addEventListener("click", () => {
          if (left <= 0) return;
          left -= 1;
          Music.blip(1 + (t.taps - left) * 0.2);
          if (left > 0) {
            Tufo.say(t.dodge[t.taps - left - 1] || t.dodge[0], 1200);
            hint.textContent = t.chase.replace("{n}", left);
            return;
          }
          // caught: the jacket goes to her
          stop();
          cancelAnimationFrame(raf);
          Tufo.stopZoom();
          Tufo.say(t.caught, 2200);
          runner.remove();
          const at = inLayer(Tufo.rect);
          const her = inLayer(Actors.gab.rect);
          const j = thing("jacket", t.caught, at.x - s / 2, at.y);
          j.classList.add("moment__jacket");
          j.disabled = true;
          void j.offsetWidth;
          j.style.left = Math.round(her.x - s / 2) + "px";
          j.style.top = Math.round(her.y + P * 10) + "px";
          Music.pickup();
          setTimeout(() => {
            j.remove();
            Actors.gab.swapJacket(true);
            close().then(() => resolve(true));
          }, reducedMotion() ? 0 : 450);
        });
      }
    });
  }

  // At the Airbnb: shawarma bites fall; she catches them before Tufo does
  function shawarma() {
    const t = text.shawarma;
    const goal = t.goal;
    let caught = 0;
    let dropped = 0;
    let done = false;
    const count = () => t.hint.replace("{n}", caught).replace("{total}", goal);
    open(count());
    const s = size();
    return new Promise((resolve) => {
      let timer = 0;
      const finish = (inTime) => {
        if (done) return;
        done = true;
        clearInterval(timer);
        stop();
        $$(".moment__thing", layer).forEach((b) => b.remove());
        if (!inTime) Tufo.say(t.slowTufo, 2200);
        close().then(() => resolve(inTime));
      };
      const stop = clock(t.seconds, () => finish(false));
      const drop = () => {
        if (done) return;
        dropped += 1;
        const x = PX() * 4 + Math.random() * (layer.clientWidth - s - PX() * 8);
        const b = thing("shawarma", t.label, x, 0);
        if (!reducedMotion()) {
          const fall = b.animate([
            { transform: "translateY(0)" },
            { transform: `translateY(${layer.clientHeight - s}px)` },
          ], { duration: 2600, easing: "steps(20, end)", fill: "forwards" });
          fall.onfinish = () => {
            if (!b.isConnected || done) return;
            b.remove();
            Tufo.say(pick(t.stolen), 1200);
            Music.blip(0.5);
          };
        }
        b.addEventListener("click", () => {
          if (done) return;
          b.remove();
          caught += 1;
          hint.textContent = count();
          Music.blip(1 + caught * 0.15);
          if (caught >= goal) finish(true);
        });
      };
      drop();
      // under reduced motion they wait where they appear, so only as many as she needs
      timer = setInterval(() => {
        if (reducedMotion() && dropped >= goal) return clearInterval(timer);
        drop();
      }, 800);
    });
  }

  return { heart, jacket, shawarma };
})();
