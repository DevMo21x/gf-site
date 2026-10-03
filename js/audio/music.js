/* Background track and Web Audio sound effects. */

"use strict";

/* ---------- Music ----------
   The background track is a real recording (see CONTENT.music), played
   from a local file. Little sound effects (harp, chime, text blips, the
   cats) are made live with Web Audio, tuned to the track's key. */

const Music = (() => {
  const TRACK = CONTENT.music;
  const SFX_VOLUME = 0.1;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // The song plays through a plain <audio> element, never through Web Audio:
  // iPhones mute Web Audio when the silent switch is on, and browsers silence
  // media routed through Web Audio when the page is opened from disk.
  const audio = new Audio();
  // don't compete with the first photo and fonts: start buffering once the page has loaded
  audio.preload = "none";
  audio.src = TRACK.src;
  audio.loop = true;
  window.addEventListener("load", () => setTimeout(() => { audio.preload = "auto"; }, 300), { once: true });
  audio.setAttribute("playsinline", "");
  audio.volume = 0;
  audio.addEventListener("error", () => {
    console.warn("Music file could not be loaded:", TRACK.src, audio.error?.code);
  });

  let ctx = null;
  let master, sfx, reverbIn;
  let muted = false;
  let started = false;
  let fadeRaf = 0;

  function impulse(seconds, decay) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    const pre = Math.floor(rate * 0.025);
    const k = Math.exp(-decay / (len - pre)); // per-sample decay, no pow() in the loop
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      let last = 0;
      let env = 1;
      for (let i = pre; i < len; i++) {
        last = last * 0.55 + (Math.random() * 2 - 1) * 0.45; // darken the tail
        data[i] = last * env;
        env *= k;
      }
    }
    return buf;
  }

  function build() {
    ctx = new AudioContext();

    master = ctx.createGain(); // mute lives here
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);

    sfx = ctx.createGain();
    sfx.gain.value = SFX_VOLUME;
    sfx.connect(master);

    reverbIn = ctx.createGain();
    const verb = ctx.createConvolver();
    // filled a moment later so the tap itself stays instant
    setTimeout(() => { verb.buffer = impulse(3.2, 6); }, 120);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    reverbIn.connect(verb);
    verb.connect(wet);
    wet.connect(sfx);
  }

  function setSession() {
    try {
      // "playback" keeps sound on with the iPhone silent switch on (Safari 17+)
      if (navigator.audioSession) navigator.audioSession.type = "playback";
    } catch (_) { /* not supported */ }
  }

  function fadeElement(to, ms) {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume;
    const t0 = performance.now();
    const step = (now) => {
      // rAF's timestamp can land a hair before t0: clamp, or a negative volume throws
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * p));
      if (p < 1) fadeRaf = requestAnimationFrame(step);
    };
    fadeRaf = requestAnimationFrame(step);
  }

  function playSong() {
    audio.muted = muted;
    audio.play().then(() => fadeElement(TRACK.volume, 3000)).catch((err) => {
      // blocked (rare): try again on her next tap anywhere
      console.warn("Music was blocked, retrying on next tap:", err?.name);
      started = false;
      document.addEventListener("pointerup", start, { once: true });
    });
  }

  // Called on her first tap or key anywhere: browsers only allow sound after one
  function start() {
    setSession();
    if (!ctx) build();
    if (ctx && ctx.state === "suspended") ctx.resume();
    if (started) return;
    started = true;
    if (TRACK.startAt) audio.currentTime = TRACK.startAt;
    playSong();
  }

  function setMuted(value) {
    muted = value;
    audio.muted = muted;
    if (!ctx) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.setTargetAtTime(muted ? 0 : 1, now, muted ? 0.12 : 0.4);
    if (!muted && ctx.state === "suspended") ctx.resume();
  }

  function pluck(midi, t, vel, bus) {
    const f = mtof(midi);
    [[1, "triangle", 1], [2, "sine", 0.3]].forEach(([ratio, type, amt]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f * ratio;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vel * amt, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      osc.connect(g);
      g.connect(bus);
      osc.start(t);
      osc.stop(t + 2.3);
    });
  }

  function sendBus(level) {
    const bus = ctx.createGain();
    bus.gain.value = level;
    bus.connect(sfx);
    const send = ctx.createGain();
    send.gain.value = 0.8;
    bus.connect(send);
    send.connect(reverbIn);
    return bus;
  }

  // A harp glissando as the flowers open
  function gliss() {
    if (!ctx || muted) return;
    const bus = sendBus(0.5);
    const scale = [53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89];
    const t0 = ctx.currentTime + 0.03;
    scale.forEach((note, i) => pluck(note, t0 + i * 0.048, 0.18 + i * 0.012, bus));
    [65, 69, 72, 77].forEach((note) => pluck(note, t0 + scale.length * 0.048 + 0.1, 0.14, bus));
  }

  // A brighter bell flourish for "yes"
  function chime() {
    if (!ctx || muted) return;
    const bus = sendBus(0.55);
    const notes = [72, 77, 81, 84, 89, 93, 96];
    const t0 = ctx.currentTime + 0.05;
    notes.forEach((note, i) => {
      const t = t0 + i * 0.085;
      const f = mtof(note);
      [[1, 0.5], [2.01, 0.14], [3.98, 0.05]].forEach(([ratio, amp]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = f * ratio;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 + (notes.length - i) * 0.08);
        osc.connect(g);
        g.connect(bus);
        osc.start(t);
        osc.stop(t + 2.4);
      });
    });
    const tChord = t0 + notes.length * 0.085;
    [65, 69, 72, 77].forEach((note) => pluck(note, tChord, 0.16, bus));
  }

  // A quick rising pluck when a memory item pops up
  function pickup() {
    if (!ctx || muted) return;
    const bus = sendBus(0.45);
    const t0 = ctx.currentTime + 0.02;
    [72, 77, 81, 84].forEach((note, i) => pluck(note, t0 + i * 0.07, 0.2, bus));
  }

  // The little square-wave blip under typing text, in the song's key
  const BLIPS = [77, 79, 81, 84, 86];
  let lastBlip = 0;
  function blip(octave = 1) {
    if (!ctx || muted || !started || ctx.state !== "running") return;
    const t = ctx.currentTime;
    if (t - lastBlip < 0.045) return;
    lastBlip = t;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = mtof(BLIPS[Math.floor(Math.random() * BLIPS.length)]) * octave;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g);
    g.connect(sfx);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Music belongs on the title screen too. Try right away (allowed if she has
  // played before); otherwise the first touch, click or key anywhere starts it.
  // Browsers never allow sound before that first gesture on a new visit.
  audio.play().then(() => {
    if (started) return;
    started = true;
    audio.muted = muted;
    fadeElement(TRACK.volume, 3000);
  }).catch(() => {
    if (started) return;
    audio.pause();
    // every event a browser counts as a gesture: iPhones only accept touchend
    ["pointerdown", "pointerup", "touchend", "mousedown", "click", "keydown"].forEach((type) =>
      document.addEventListener(type, start, { once: true }));
  });

  // pause while the phone is locked / tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      audio.pause();
      if (ctx) ctx.suspend();
    } else {
      if (started) audio.play().catch(() => {});
      if (ctx) ctx.resume();
    }
  });

  // Build the effects graph early (on finger-down) so the tap itself stays light
  function warm() {
    setSession();
    if (!ctx) build();
  }

  // Mei's voice: a sawtooth through two vowel formants sliding "mee-ow"
  function meow(pitch = 1) {
    warm();
    if (!ctx || muted) return;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime + 0.02;
    const bus = sendBus(3.2);
    const osc = ctx.createOscillator();
    const vib = ctx.createOscillator();
    const vibAmt = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(560 * pitch, t);
    osc.frequency.linearRampToValueAtTime(860 * pitch, t + 0.14);
    osc.frequency.linearRampToValueAtTime(720 * pitch, t + 0.32);
    osc.frequency.exponentialRampToValueAtTime(440 * pitch, t + 0.58);
    vib.frequency.value = 7;
    vibAmt.gain.value = 10 * pitch;
    vib.connect(vibAmt);
    vibAmt.connect(osc.frequency);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.5, t + 0.06);
    amp.gain.linearRampToValueAtTime(0.36, t + 0.36);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    [[1000, 2000, 1100, 5], [2600, 3300, 2200, 7]].forEach(([a, b, c, q]) => {
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = q;
      f.frequency.setValueAtTime(a * pitch, t);
      f.frequency.linearRampToValueAtTime(b * pitch, t + 0.16);
      f.frequency.exponentialRampToValueAtTime(c * pitch, t + 0.55);
      osc.connect(f);
      f.connect(amp);
    });
    amp.connect(bus);
    osc.start(t);
    vib.start(t);
    osc.stop(t + 0.7);
    vib.stop(t + 0.7);
  }

  // A soft purr: a low buzz pulsing ~24 times a second
  function purr() {
    warm();
    if (!ctx || muted) return;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime + 0.02;
    const bus = sendBus(2.6);
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const pulse = ctx.createGain();
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    const amp = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 52;
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lfo.frequency.value = 24;
    depth.gain.value = 0.5;
    pulse.gain.value = 0.5;
    lfo.connect(depth);
    depth.connect(pulse.gain);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.7, t + 0.2);
    amp.gain.setValueAtTime(0.7, t + 1.1);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    osc.connect(lp);
    lp.connect(pulse);
    pulse.connect(amp);
    amp.connect(bus);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 1.7);
    lfo.stop(t + 1.7);
  }

  // Tufo's hiss: a burst of filtered noise
  function hiss() {
    warm();
    if (!ctx || muted) return;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime + 0.02;
    const len = Math.floor(ctx.sampleRate * 0.8);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2200;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(4200, t);
    bp.frequency.linearRampToValueAtTime(5600, t + 0.6);
    bp.Q.value = 0.8;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
    amp.gain.setValueAtTime(0.9, t + 0.35);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    src.connect(hp);
    hp.connect(bp);
    bp.connect(amp);
    amp.connect(sendBus(2.2));
    src.start(t);
    src.stop(t + 0.8);
  }

  return { warm, start, setMuted, gliss, chime, pickup, blip, meow, purr, hiss, get muted() { return muted; } };
})();
