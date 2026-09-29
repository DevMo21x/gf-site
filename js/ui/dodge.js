/* The No button that won't be caught. */

"use strict";

/* ---------- The No button that won't be caught ---------- */

const Dodge = (() => {
  const no = $("[data-no]");
  const yes = $('[data-action="yes"]');
  const slot = $("[data-no-slot]");
  const layer = $("[data-dodge-layer]");
  const soundToggle = $("[data-sound-toggle]");
  const clock = $("[data-clock]");
  const question = $(".question");
  const questionBox = $(".dialog--question");
  const portrait = $(".portrait--question");
  const labels = CONTENT.question.no;

  const MARGIN = 12;
  const MAX_YES = 1.8;
  const SHRINK_AT = 6; // from here it gets smaller every dodge
  const DROP_AT = 10;  // here it gives up, falls on the grass and Tufo sits on it
  let dodges = 0;
  let noScale = 1;
  let tamed = false;
  let yesScale = 1;
  let loose = false;
  let pos = { x: 0, y: 0 };
  let pointer = null;
  let refocusing = false;
  let lastDodge = 0;

  no.textContent = labels[0];

  const viewport = () => {
    const vv = window.visualViewport;
    return {
      w: Math.min(document.documentElement.clientWidth, vv ? vv.width : Infinity),
      h: Math.min(window.innerHeight, vv ? vv.height : Infinity),
    };
  };

  const inflate = (r, by) => ({ left: r.left - by, top: r.top - by, right: r.right + by, bottom: r.bottom + by });
  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Where Yes will be once its grow animation settles
  function yesTargetRect() {
    const r = yes.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const w = yes.offsetWidth * yesScale;
    const h = yes.offsetHeight * yesScale;
    return { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 };
  }

  function detach() {
    const r = no.getBoundingClientRect();
    const hadFocus = document.activeElement === no;
    slot.hidden = true; // Yes gets the row to itself
    pos = { x: r.left, y: r.top };
    no.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${noScale})`;
    no.classList.add("is-loose");
    layer.appendChild(no);
    if (hadFocus) {
      refocusing = true;
      no.focus({ preventScroll: true });
      refocusing = false;
    }
    void no.offsetWidth;
    loose = true;
  }

  function pickSpot() {
    const { w: vw, h: vh } = viewport();
    const bw = no.offsetWidth;
    const bh = no.offsetHeight;
    const maxX = Math.max(MARGIN, vw - bw - MARGIN);
    // stay above the grass, where the cats and their speech bubbles live
    const maxY = Math.max(MARGIN, Math.min(vh - bh - MARGIN, vh - groundH() - bh));

    const avoid = [
      inflate(yesTargetRect(), 18),
      inflate(soundToggle.getBoundingClientRect(), 10),
      inflate(clock.getBoundingClientRect(), 10),
      inflate(Mei.rect, 8),
      inflate(Tufo.rect, 8),
      inflate(portrait.getBoundingClientRect(), 8),
      ...Actors.rects().map((r) => inflate(r, 8)),
    ];
    const prefer = [inflate(question.getBoundingClientRect(), 6)]; // try not to cover the question
    // never park on the question box's wooden border: fully inside it or clear of it
    const frame = questionBox.getBoundingClientRect();
    const outer = inflate(frame, 8);
    const inner = inflate(frame, -(PX() * 7 + 8));
    const onBorder = (r) => overlaps(r, outer) &&
      !(r.left >= inner.left && r.right <= inner.right && r.top >= inner.top && r.bottom <= inner.bottom);
    const current = { left: pos.x, top: pos.y, right: pos.x + bw, bottom: pos.y + bh };
    const reach = Math.max(bw, bh) / 2 + 56;
    const near = pointer
      ? { left: pointer.x - reach, top: pointer.y - reach, right: pointer.x + reach, bottom: pointer.y + reach }
      : null;

    let best = null;
    let bestScore = -Infinity;
    for (let i = 0; i < 90; i++) {
      const x = MARGIN + Math.random() * (maxX - MARGIN);
      const y = MARGIN + Math.random() * (maxY - MARGIN);
      const rect = { left: x, top: y, right: x + bw, bottom: y + bh };
      if (avoid.some((a) => overlaps(rect, a)) || onBorder(rect)) continue;
      let score = Math.hypot(x - pos.x, y - pos.y);
      if (overlaps(rect, current)) score -= 10000;
      if (near && overlaps(rect, near)) score -= 5000;
      if (prefer.some((a) => overlaps(rect, a))) score -= 2000;
      if (score > 0) return { x, y };
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }
    if (best) return best;

    // Fallback: a viewport corner clear of Yes (and, if possible, of everything else)
    const box = (c) => ({ left: c.x, top: c.y, right: c.x + bw, bottom: c.y + bh });
    const corners = [
      { x: MARGIN, y: MARGIN + 60 },
      { x: maxX, y: maxY },
      { x: MARGIN, y: maxY },
      { x: maxX, y: MARGIN + 60 },
    ].filter((c) => !overlaps(box(c), inflate(yesTargetRect(), 18)));
    const clean = corners.filter((c) => !avoid.some((a) => overlaps(box(c), a)) && !onBorder(box(c)));
    const pool = clean.length ? clean : corners;
    return pool[Math.floor(Math.random() * pool.length)] || { x: MARGIN, y: MARGIN + 60 };
  }

  function place(spot) {
    const { w: vw, h: vh } = viewport();
    pos = {
      x: Math.min(Math.max(spot.x, MARGIN), Math.max(MARGIN, vw - no.offsetWidth - MARGIN)),
      y: Math.min(Math.max(spot.y, MARGIN), Math.max(MARGIN, vh - no.offsetHeight - MARGIN)),
    };
    no.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${noScale})`;
  }

  // Out of breath: it drops onto the grass, Tufo sits on it, and it gets up as a Yes
  async function drop() {
    tamed = true;
    noScale = 1;
    no.classList.add("is-dropped");
    const { h: vh } = viewport();
    const acts = Actors.rects();
    let x = pos.x;
    const box = (at) => ({ left: at, top: 0, right: at + no.offsetWidth, bottom: 1 });
    // not on top of Gabrielle and Mohaimen
    acts.forEach((r) => { if (overlaps(box(x), { ...r, top: 0, bottom: 1 })) x = r.right + 16; });
    place({ x, y: vh });
    await Tufo.sitOn(no);
    no.classList.remove("is-dropped");
    no.classList.add("btn--yes");
    no.textContent = CONTENT.question.noBecomesYes;
    no.dataset.action = "yes";
    no.setAttribute("aria-label", CONTENT.question.noBecomesYes);
    Music.chime();
    animate(no, [{ scale: "0.6" }, { scale: "1.2", offset: 0.6 }, { scale: "1" }], { duration: 360, easing: "steps(4, end)" });
    Achievements.unlock("no"); // the only way to catch it: Tufo does
  }

  function dodge(event) {
    if (refocusing || tamed) return;
    if (event && event.cancelable) event.preventDefault();

    // one touch fires pointerenter + pointerdown + touchstart: count it once
    const now = performance.now();
    if (now - lastDodge < 120) return;
    lastDodge = now;

    if (!loose) detach();
    dodges += 1;
    no.textContent = labels[dodges % labels.length];

    yesScale = Math.min(MAX_YES, yesScale * 1.1);
    yes.style.setProperty("--yes-scale", yesScale.toFixed(3));

    if (dodges >= SHRINK_AT) noScale = Math.max(0.6, 1 - (dodges - SHRINK_AT + 1) * 0.1);
    if (dodges >= DROP_AT) { drop(); return; }
    place(pickSpot());
    Mei.onDodge();
    Tufo.onDodge();
    Actors.onDodge(dodges);
  }

  function rememberPointer(e) {
    const t = e.touches ? e.touches[0] : e;
    if (t) pointer = { x: t.clientX, y: t.clientY };
  }

  no.addEventListener("pointerenter", (e) => { rememberPointer(e); dodge(e); });
  no.addEventListener("pointerdown", (e) => { rememberPointer(e); dodge(e); });
  no.addEventListener("touchstart", (e) => { rememberPointer(e); dodge(e); }, { passive: false });
  no.addEventListener("focus", () => { pointer = null; dodge(); });
  no.addEventListener("click", (e) => { e.preventDefault(); dodge(); });
  no.addEventListener("keydown", (e) => {
    if (!tamed && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); dodge(); }
  });
  window.addEventListener("pointermove", rememberPointer, { passive: true });

  // Keep it on screen (and off Yes) when the viewport changes
  function refit() {
    if (!loose) return;
    const { w: vw, h: vh } = viewport();
    const rect = { left: pos.x, top: pos.y, right: pos.x + no.offsetWidth, bottom: pos.y + no.offsetHeight };
    const outside = rect.right > vw - MARGIN || rect.bottom > vh - MARGIN || rect.left < MARGIN || rect.top < MARGIN;
    if (outside || overlaps(rect, inflate(yesTargetRect(), 18))) place(pickSpot());
  }
  window.addEventListener("resize", refit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", refit);

  function retire() {
    no.classList.add("is-gone");
    no.tabIndex = -1;
    no.setAttribute("aria-hidden", "true");
  }

  return { retire };
})();
