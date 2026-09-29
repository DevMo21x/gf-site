/* ==========================================================================
   Pixel art for the farm. Every sprite, frame and backdrop is drawn here
   from code, once, so the site ships with no image files but the photos.
   ========================================================================== */

(() => {
  "use strict";

  /* ---------- Palette ---------- */

  const K = "#3b1d0b";           // outline and ink
  const WOOD = { hi: "#e8a04e", hi2: "#c97a35", mid: "#b0602a", grain: "#96501f", dk: "#7a3b12" };
  const PARCH = "#fbe4a8";
  const PARCH_SH = "#efcd84";
  const RED = "#e0304e";
  const RED_HI = "#ff8a9c";
  const GOLD = "#f6c23e";
  const GOLD_HI = "#fff0a0";
  const GOLD_DK = "#b8801c";
  const CREAM = "#fff3d1";
  const LEAF = "#5ea83e";
  const LEAF_DK = "#3d7a2c";
  const LEAF_HI = "#8fd05a";

  /* ---------- A tiny pixel grid ---------- */

  const rgbaCache = new Map();
  function rgba(hex) {
    let v = rgbaCache.get(hex);
    if (!v) {
      const n = hex.slice(1);
      v = [
        parseInt(n.slice(0, 2), 16),
        parseInt(n.slice(2, 4), 16),
        parseInt(n.slice(4, 6), 16),
        n.length === 8 ? parseInt(n.slice(6, 8), 16) : 255,
      ];
      rgbaCache.set(hex, v);
    }
    return v;
  }

  class Grid {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.d = new Array(w * h).fill(null);
    }
    has(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    get(x, y) { return this.has(x, y) ? this.d[y * this.w + x] : null; }
    set(x, y, c) {
      x = Math.round(x);
      y = Math.round(y);
      if (this.has(x, y)) this.d[y * this.w + x] = c;
      return this;
    }
    px(list, c) { list.forEach(([x, y]) => this.set(x, y, c)); return this; }
    rect(x, y, w, h, c) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
      return this;
    }
    // a pixel is in when its centre is: pixel (i, j) sits at (i, j)
    ellipse(cx, cy, rx, ry, c, rot = 0) {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const R = Math.ceil(Math.max(rx, ry)) + 1;
      for (let j = Math.floor(cy - R); j <= Math.ceil(cy + R); j++) {
        for (let i = Math.floor(cx - R); i <= Math.ceil(cx + R); i++) {
          const dx = i - cx;
          const dy = j - cy;
          const u = (dx * cos + dy * sin) / rx;
          const v = (-dx * sin + dy * cos) / ry;
          if (u * u + v * v <= 1) this.set(i, j, c);
        }
      }
      return this;
    }
    poly(pts, c) {
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      for (let j = Math.floor(Math.min(...ys)); j <= Math.ceil(Math.max(...ys)); j++) {
        for (let i = Math.floor(Math.min(...xs)); i <= Math.ceil(Math.max(...xs)); i++) {
          let inside = false;
          for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
            const [xa, ya] = pts[a];
            const [xb, yb] = pts[b];
            if ((ya > j) !== (yb > j) && i < ((xb - xa) * (j - ya)) / (yb - ya) + xa) inside = !inside;
          }
          if (inside) this.set(i, j, c);
        }
      }
      return this;
    }
    line(x0, y0, x1, y1, c, thick = 1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.rect(x0, y0, thick, thick, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
      return this;
    }
    // every empty pixel that touches a filled one (4-way) becomes outline
    outline(c) {
      const add = [];
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (this.get(x, y)) continue;
          if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
        }
      }
      return this.px(add, c);
    }
    // recolour filled pixels that satisfy a test
    tint(test, c) {
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const v = this.get(x, y);
          if (v && test(x, y, v)) this.set(x, y, c);
        }
      }
      return this;
    }
    paint(ctx, ox = 0, oy = 0) {
      const img = ctx.createImageData(this.w, this.h);
      for (let i = 0; i < this.d.length; i++) {
        const c = this.d[i];
        if (!c) continue;
        const [r, g, b, a] = rgba(c);
        img.data[i * 4] = r;
        img.data[i * 4 + 1] = g;
        img.data[i * 4 + 2] = b;
        img.data[i * 4 + 3] = a;
      }
      ctx.putImageData(img, ox, oy);
    }
    canvas() {
      const cv = document.createElement("canvas");
      cv.width = this.w;
      cv.height = this.h;
      this.paint(cv.getContext("2d"));
      return cv;
    }
    url() { return this.canvas().toDataURL("image/png"); }
  }

  // Draw a grid from rows of characters and a legend
  function fromRows(rows, legend) {
    const g = new Grid(Math.max(...rows.map((r) => r.length)), rows.length);
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = legend[row[x]];
        if (c) g.set(x, y, c);
      }
    });
    return g;
  }

  /* ---------- Frames (9-slice, for border-image) ---------- */

  function frame(size, colorAt) {
    const g = new Grid(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = Math.min(x, size - 1 - x);
        const dy = Math.min(y, size - 1 - y);
        if (dx + dy <= 1) continue; // stepped corner
        let ring = Math.min(dx, dy);
        if (dx <= 2 && dy <= 2) ring = Math.max(0, dx + dy - 2);
        const vertical = dy < dx;
        const side = vertical ? (y < size / 2 ? "top" : "bottom") : (x < size / 2 ? "left" : "right");
        const tl = side === "top" || side === "left";
        const c = colorAt(ring, tl, vertical ? x : y, side);
        if (c) g.set(x, y, c);
      }
    }
    return g;
  }

  const FRAMES = {
    // the dialogue box: thick wood around parchment (slice 7)
    dialog: () => frame(18, (ring, tl, along) => {
      switch (ring) {
        case 0: return K;
        case 1: return tl ? WOOD.hi : WOOD.dk;
        case 2: return WOOD.mid;
        case 3: return along % 4 === 1 ? WOOD.grain : WOOD.mid;
        case 4: return tl ? WOOD.dk : WOOD.hi2;
        case 5: return K;
        case 6: return tl ? PARCH_SH : PARCH;
        default: return PARCH;
      }
    }),
    // a gold one, for the achievement (slice 6)
    gold: () => frame(16, (ring, tl, along) => {
      switch (ring) {
        case 0: return K;
        case 1: return tl ? GOLD_HI : GOLD_DK;
        case 2: return GOLD;
        case 3: return along % 4 === 1 ? "#e0a52a" : GOLD;
        case 4: return K;
        case 5: return tl ? PARCH_SH : PARCH;
        default: return PARCH;
      }
    }),
    // picture frame: wood only, open in the middle (slice 5)
    photo: () => frame(14, (ring, tl, along) => {
      switch (ring) {
        case 0: return K;
        case 1: return tl ? WOOD.hi : WOOD.dk;
        case 2: return WOOD.mid;
        case 3: return along % 3 === 1 ? WOOD.grain : WOOD.mid;
        case 4: return K;
        default: return null;
      }
    }),
    // small wooden plate: HUD, name plaque, heart meter (slice 4)
    plate: () => frame(12, (ring, tl) => {
      switch (ring) {
        case 0: return K;
        case 1: return tl ? WOOD.hi : WOOD.dk;
        case 2: return WOOD.mid;
        case 3: return K;
        default: return PARCH;
      }
    }),
    // inventory slot (slice 3)
    slot: () => frame(10, (ring, tl) => {
      switch (ring) {
        case 0: return WOOD.dk;
        case 1: return tl ? "#c7843c" : "#fff1c9";
        case 2: return tl ? "#e7b667" : "#f4d496";
        default: return "#f4d496";
      }
    }),
    // speech bubble (slice 3)
    bubble: () => frame(8, (ring) => (ring === 0 ? K : "#fffdf6")),
    // the title sign: dark planks with a nail in every corner (slice 6)
    sign: () => {
      const g = frame(20, (ring, tl, along, side) => {
        switch (ring) {
          case 0: return K;
          case 1: return tl ? WOOD.hi : WOOD.dk;
          case 2: return tl ? WOOD.hi2 : WOOD.mid;
          default: return null;
        }
      });
      // planks run sideways; a seam every 8 rows, grain here and there
      for (let y = 3; y < 17; y++) {
        for (let x = 3; x < 17; x++) {
          const seam = y % 8 === 5;
          const grain = !seam && (x * 3 + y * 5) % 11 === 0;
          g.set(x, y, seam ? WOOD.dk : grain ? "#8a4418" : "#9a4e1c");
        }
      }
      [[4, 4], [15, 4], [4, 15], [15, 15]].forEach(([x, y]) => g.set(x, y, "#f2c46a").set(x + 1, y + 1, WOOD.dk));
      return g;
    },
    // Mohaimen's portrait: a light slot with a sky-warm backdrop (slice 3)
    portrait: () => frame(10, (ring, tl) => {
      switch (ring) {
        case 0: return WOOD.dk;
        case 1: return tl ? "#c7843c" : "#fff1c9";
        case 2: return tl ? "#e7b667" : "#f4d496";
        default: return "#f4d496";
      }
    }),
  };

  // raised buttons (slice 3)
  const button = (face, hi, dk) => frame(10, (ring, tl, along, side) => {
    if (ring === 0) return K;
    if (ring === 1) return side === "top" ? hi : side === "bottom" ? dk : face;
    return face;
  });
  const BUTTONS = {
    wood: () => button("#a3521d", "#e0913f", "#5e2a0c"),
    woodHi: () => button("#bb6427", "#f2b35c", "#6b300d"),
    red: () => button("#cf2f4a", "#ff8a9a", "#7e1427"),
    redHi: () => button("#e0405a", "#ffa3b0", "#8c1c30"),
    parch: () => button("#f5d58c", "#fff1c9", "#c99a4a"),
    parchHi: () => button("#fbe4a8", "#fffaf0", "#d6a95a"),
  };

  /* ---------- Small sprites ---------- */

  const HEART_ROWS = [
    ".KK...KK.",
    "KRRK.KRRK",
    "KRHRKRRRK",
    "KRRRRRRRK",
    ".KRRRRRK.",
    "..KRRRK..",
    "...KRK...",
    "....K....",
  ];
  const SPRITES = {
    heart: () => fromRows(HEART_ROWS, { K, R: RED, H: RED_HI }),
    heartEmpty: () => fromRows(HEART_ROWS, { K, R: "#d9b574", H: "#e7c98a" }),
    heartSmall: () => fromRows([
      ".KK.KK.",
      "KRHKRRK",
      "KRRRRRK",
      ".KRRRK.",
      "..KRK..",
      "...K...",
    ], { K, R: RED, H: RED_HI }),
    // Tufo's stuffed cat (Kevin): faded lavender, one stitched-X eye, one button eye
    plush: () => fromRows([
      ".K...K..........",
      "KLK.KLK.........",
      "KLLKLLK......KK.",
      "KXLLLBK.....KLK.",
      "KLLNLLLKKKKKLK..",
      ".KLLLLLLLLLLLK..",
      "..KLLSLLLLSLLK..",
      "..KLLLSLLLLLLK..",
      "..KLLLLLLLLLLK..",
      "..KLLKLLLLKLLK..",
      "..KLK.KKKK.KLK..",
      "..KK........KK..",
    ], { K, L: "#c9a6d6", X: "#5a3d6b", B: "#2b1d16", N: "#eba7ab", S: "#a27fb3" }),
    more: () => fromRows([
      "KKKKKKK",
      ".KRRRK.",
      "..KRK..",
      "...K...",
    ], { K, R: RED }),
    next: () => fromRows([
      "W...",
      "WW..",
      "WWW.",
      "WWWW",
      "WWW.",
      "WW..",
      "W...",
    ], { W: CREAM }),
    hand: () => fromRows([
      "..KKK......",
      ".KWWWKKKKK.",
      "KWWWWWWWWWK",
      "KWWWWKKKKK.",
      "KWWWWWK....",
      "KWWWWWK....",
      ".KWWWK.....",
      "..KKK......",
    ], { K, W: "#ffffff" }),
    soundOn: () => fromRows([
      "...W......",
      "..WW...W..",
      "WWWW.W..W.",
      "WWWW..W.W.",
      "WWWW..W.W.",
      "WWWW.W..W.",
      "..WW...W..",
      "...W......",
    ], { W: CREAM }),
    soundOff: () => fromRows([
      "...W......",
      "..WW......",
      "WWWW.W...W",
      "WWWW..W.W.",
      "WWWW...W..",
      "WWWW..W.W.",
      "..WW.W...W",
      "...W......",
    ], { W: CREAM }),
    sun: () => fromRows([
      "....Y....",
      ".Y.....Y.",
      "...OOO...",
      "..OYYYO..",
      "Y.OYWYO.Y",
      "..OYYYO..",
      "...OOO...",
      ".Y.....Y.",
      "....Y....",
    ], { Y: "#f6b81e", O: "#e0701e", W: "#fff3b0" }),
    moon: () => fromRows([
      "..KKK....",
      ".KYYYK...",
      "KYYYK....",
      "KYSK.....",
      "KYYK.....",
      "KYSK.....",
      "KYYYK....",
      ".KYYYK...",
      "..KKK....",
    ], { K, Y: "#f4ecc2", S: "#d8cd98" }),
    star: () => fromRows([
      ".....K.....",
      "....KYK....",
      "....KYK....",
      "KKKKYYYKKKK",
      ".KYYYHYYYK.",
      "..KYYYYYK..",
      "..KYYYYYK..",
      ".KYYYKYYYK.",
      ".KYYK.KYYK.",
      "KYKK...KKYK",
      "KK.......KK",
    ], { K, Y: GOLD, H: GOLD_HI }),
    sparkle: () => fromRows([
      "..Y..",
      "..Y..",
      "YYWYY",
      "..Y..",
      "..Y..",
    ], { Y: GOLD, W: "#ffffff" }),
    tail: () => fromRows([
      "KWWWWWK",
      ".KWWWK.",
      "..KWK..",
      "...K...",
    ], { K, W: "#fffdf6" }),
    // one twist of rope; it tiles down from the top of the screen
    rope: () => fromRows([
      "KTK",
      "KTK",
      "KtK",
      "KtK",
    ], { K, T: "#d9b574", t: "#a9803e" }),
  };

  /* ---------- Items found in the memories ---------- */

  const ITEMS = {
    // a nervous little heart: wobbly mouth, a sweat drop beside it
    nervous: () => fromRows([
      "................",
      "..............K.",
      ".............KBK",
      ".............KWK",
      "..KKK...KKK..KBK",
      ".KRRRK.KRRRK..K.",
      ".KRHRRKRRRRK....",
      ".KRRRRRRRRRK....",
      ".KRRKRRRKRRK....",
      ".KRRRRRRRRRK....",
      "..KRKRKRKRK.....",
      "...KRKRKRK......",
      "....KRRRK.......",
      ".....KRK........",
      "......K.........",
      "................",
    ], { K, R: RED, H: RED_HI, B: "#9ad8f5", W: "#ffffff" }),
    // his white sherpa jacket, open over a black shirt (the docks of Halifax)
    jacket: () => fromRows([
      "................",
      "....KKK..KKK....",
      "...KFFFKKFFFK...",
      "..KFFFFBBFFFFK..",
      ".KFFFFSBBSFFFFK.",
      "KFFKFFSBBSFFKFFK",
      "KFFKFFFBBFFFKFFK",
      "KFFKFFFBBFRFKFFK",
      "KFFKFFFBBFFFKFFK",
      "KFFKFFSBBSFFKFFK",
      "KSSKFFFBBFFFKSSK",
      "KFFKFSSBBSSFKFFK",
      ".KKKFFFBBFFFKKK.",
      "...KFFFBBFFFK...",
      "...KSSSBBSSSK...",
      "...KKKKKKKKKK...",
    ], { K, F: "#f3ecdc", S: "#d3c6aa", B: "#2a1f1c", R: RED }),
    // leftover shawarma in its foil, late at night
    shawarma: () => fromRows([
      "................",
      ".....KKKKK......",
      "...KKGRGMGKK....",
      "..KGMRGMRGMGK...",
      "..KTGMGRGMGTK...",
      "..KTTtTTtTTTK...",
      "..KtTTTtTTTtK...",
      "...KtTTTTTtK....",
      "...KWWWWWWWK....",
      "...KWwWWWwWK....",
      "....KWWWwWK.....",
      "....KwWWWwK.....",
      "....KWWwWWK.....",
      ".....KWWWK......",
      ".....KwWwK......",
      "......KKK.......",
    ], { K, G: "#6fb04a", R: "#d9433b", M: "#9a5a2e", T: "#e9c98a", t: "#c9a060", W: "#dfe3ea", w: "#9aa0ab" }),
    // the bouquet he gives her before he asks: pink and white flowers, paper, a red bow
    bouquet: () => fromRows([
      "....KK...KK.....",
      "...KPPK.KWWK....",
      "..KPYPPKWYWWKK..",
      "..KPPPKKWWWKPPK.",
      "...KKKLKKKKPYPK.",
      "..KLLKLKWWKPPPK.",
      "..KLWWKLWYWKKK..",
      "...KWYWKWWWKLK..",
      "...KKCCCCCCKLK..",
      "....KCCcCCCKK...",
      ".....KCCcCK.....",
      "....KRRKRRK.....",
      ".....KKRKK......",
      "......KCcK......",
      "......KCcK......",
      ".......KK.......",
    ], { K, P: "#f58aa8", Y: "#fbd24e", W: "#fbf6ec", L: LEAF, C: CREAM, c: PARCH_SH, R: RED }),
  };

  /* ---------- Gabrielle and Mohaimen, standing on the farm ---------- */

  // pose: { eyes: open|blink|happy|wide, look: -1..1, mouth: smile|flat|open|o,
  //         blush, sweat, arm: down|head|up|eat, sit }
  // sit: seated on the edge of the Airbnb bed; arm "eat": holding a shawarma wrap at the chest
  // Both are drawn facing the viewer; the page mirrors Mohaimen so they face each other.
  const GAB = {
    skin: "#f5cfae", skinSh: "#e2ad8c", hair: "#b8814a", hairSh: "#8e5c30", hairHi: "#d9a45f",
    hat: "#5b5860", hatSh: "#45424a", hatHi: "#78747d", coat: "#7a4a2a", coatSh: "#5f3720", coatHi: "#9a6238",
    top: "#2a2226", lace: "#6a5560", jeans: "#4a6390", jeansSh: "#36496e", knee: "#6a83b0", shoe: "#3a2a24",
  };
  const MO = {
    skin: "#c98f68", skinSh: "#ae734f", hair: "#2b1a13", hairHi: "#4d3226", beard: "#3d2519",
    coat: "#f3ecdc", coatSh: "#d3c6aa", coatDot: "#e4dac4", shirt: "#262022",
    jeans: "#353c4a", jeansSh: "#272c37", knee: "#4f5868", shoe: "#ece6da", sole: "#bdb4a6",
  };
  const WRAP = { bread: "#e9c98a", breadSh: "#c9a060", foil: "#dfe3ea", foilSh: "#9aa0ab", lettuce: "#6fb04a", sauce: "#d9433b" };
  const EYE = "#2b1d16";
  const MOUTH = "#a8433b";
  const LIP = "#7a2e28";   // a closed mouth: darker than an open one
  const BLUSH = "#f09a9a";
  const SWEAT = "#9ad8f5";

  function person(kind, p) {
    const mo = kind === "mo";
    const C = mo ? MO : GAB;
    const g = new Grid(22, 42);
    const arm = p.arm || "down";

    // arms first, so the body sits over their shoulders
    const sleeve = C.coat;
    if (arm === "up") {
      g.line(5, 25, 2, 17, sleeve, 2).line(16, 25, 19, 17, sleeve, 2);
      g.ellipse(2.5, 15.5, 1.3, 1.3, C.skin).ellipse(19.5, 15.5, 1.3, 1.3, C.skin);
    } else {
      g.rect(mo ? 2 : 3, 23, mo ? 3 : 2, 8, sleeve);
      g.rect(mo ? 2 : 3, 31, 2, 2, C.skin);
      if (arm === "head") {
        g.line(17, 25, 19, 17, sleeve, 3);
        g.ellipse(18.5, 14.5, 1.6, 1.6, C.skin);
      } else if (arm === "eat") {
        g.rect(17, 23, mo ? 3 : 2, 5, sleeve); // the forearm and the wrap go on over the body, below
      } else {
        g.rect(17, 23, mo ? 3 : 2, 8, sleeve);
        g.rect(mo ? 18 : 17, 31, 2, 2, C.skin);
      }
    }

    // legs and shoes; seated, the thighs come toward us and the shins hang down
    if (p.sit) g.rect(5, 32, 5, 3, C.jeans).rect(12, 32, 5, 3, C.jeans).rect(6, 35, 4, 4, C.jeans).rect(12, 35, 4, 4, C.jeans);
    else g.rect(6, 32, 4, 7, C.jeans).rect(12, 32, 4, 7, C.jeans);
    if (mo) g.rect(5, 38, 5, 2, C.shoe).rect(12, 38, 5, 2, C.shoe);
    else g.rect(6, 38, 4, 2, C.shoe).rect(12, 38, 4, 2, C.shoe);

    // body
    if (mo) {
      g.ellipse(10.5, 24, 7.6, 2.6, C.coat);
      g.rect(4, 24, 14, 9, C.coat);
    } else {
      g.ellipse(10.5, 23.4, 6.2, 2, C.coat);
      g.rect(5, 23, 12, 10, C.coat);
    }
    g.rect(9, 21, 4, 3, C.skin); // neck

    // head
    if (mo) {
      g.ellipse(10.5, 9.5, 7.8, 6.2, C.hair);
      [[3.8, 11, 2.6], [4.2, 7, 2.8], [6.8, 3.9, 2.8], [10.5, 2.8, 2.9], [14.2, 3.9, 2.8], [16.8, 7, 2.8], [17.2, 11, 2.6]]
        .forEach(([x, y, r]) => g.ellipse(x, y, r, r, C.hair));
      g.ellipse(10.5, 15.4, 5.5, 5.5, C.skin);
      [[6.2, 10.6], [10.5, 10.1], [14.8, 10.6]].forEach(([x, y]) => g.ellipse(x, y, 1.9, 1.5, C.hair));
    } else {
      // long hair behind, falling over both shoulders
      g.ellipse(10.5, 16, 7.4, 6.4, C.hair);
      g.rect(4, 17, 3, 10, C.hair).rect(15, 17, 3, 10, C.hair);
      g.ellipse(10.5, 15.8, 5.4, 5, C.skin);
      g.rect(5, 13, 12, 1, C.hair).px([[5, 14], [6, 14], [15, 14], [16, 14], [5, 15], [16, 15]], C.hair);
      // the grey bucket hat
      g.ellipse(10.5, 8.4, 6, 3.6, C.hat);
      g.ellipse(10.5, 11.3, 9, 1.7, C.hat);
    }

    g.outline(K);

    // ---- details over the outline ----
    const L = Math.max(-1, Math.min(1, p.look == null ? 1 : p.look));
    const eyeY = mo ? 14 : 16;
    const ex = [7 + L, 13 + L];
    if (p.eyes === "blink") {
      ex.forEach((x) => g.rect(x, eyeY + 1, 2, 1, EYE));
    } else if (p.eyes === "happy") {
      ex.forEach((x) => g.rect(x, eyeY, 2, 1, EYE).set(x - 1, eyeY + 1, EYE).set(x + 2, eyeY + 1, EYE));
    } else if (p.eyes === "wide") {
      ex.forEach((x) => g.rect(x, eyeY - 1, 2, 3, EYE).set(x, eyeY - 1, "#ffffff"));
    } else {
      ex.forEach((x) => g.rect(x, eyeY, 2, 2, EYE).set(x, eyeY, "#ffffff"));
    }

    if (mo) {
      // a short beard along the jaw, moustache, then the mouth inside it
      g.rect(7, 19, 8, 2, C.beard).rect(9, 21, 4, 1, C.beard).rect(9, 18, 4, 1, C.beard);
      g.set(6, 18, C.beard).set(15, 18, C.beard);
    }
    const mY = 19;
    const lip = mo ? LIP : MOUTH;
    if (p.mouth === "open") g.rect(10, mY, 2, 2, MOUTH);
    else if (p.mouth === "o") g.rect(10, mY, 2, 2, EYE);
    else if (p.mouth === "flat") g.px([[9, mY], [10, mY + 1], [11, mY], [12, mY + 1]], lip);
    else if (mo) g.rect(9, mY, 4, 1, lip).set(9, mY, C.skin).set(12, mY, C.skin).rect(10, mY, 2, 1, lip);
    else g.rect(10, mY, 2, 1, MOUTH).set(9, mY - 1, MOUTH).set(12, mY - 1, MOUTH);

    if (p.blush) g.px([[6, eyeY + 2], [7, eyeY + 2], [14, eyeY + 2], [15, eyeY + 2]], BLUSH);

    if (mo) {
      g.rect(6, 12, 3, 1, C.hair).rect(13, 12, 3, 1, C.hair);           // thick brows
      g.set(10, 16, C.skinSh).set(10, 17, C.skinSh);                    // nose
      g.px([[5, 8], [8, 5], [12, 4], [15, 6], [4, 12], [17, 12]], C.hairHi); // curls catching light
      // sherpa texture and the open jacket over a black shirt
      g.rect(8, 22, 6, 10, C.shirt);
      g.px([[5, 25], [6, 28], [5, 30], [16, 25], [15, 28], [16, 30], [3, 26], [18, 27]], C.coatDot);
      g.rect(4, 32, 14, 1, C.coatSh).rect(7, 23, 1, 9, C.coatSh).rect(14, 23, 1, 9, C.coatSh);
      g.rect(6, 36, 4, 1, C.jeansSh).rect(12, 36, 4, 1, C.jeansSh);
      g.rect(5, 39, 5, 1, C.sole).rect(12, 39, 5, 1, C.sole);
    } else {
      g.px([[4, 11], [5, 10], [8, 9], [12, 8]], C.hatHi);              // hat catches the sun
      g.rect(3, 12, 16, 1, C.hatSh);                                    // under the brim
      g.px([[5, 17], [16, 17], [4, 20], [17, 21]], C.hairSh);
      g.px([[5, 22], [16, 23], [6, 25]], C.hairHi);
      g.set(10, 18, C.skinSh);                                          // nose
      // leather jacket open over a black lace top, a little gold necklace
      g.rect(9, 23, 4, 9, C.top);
      g.px([[9, 23], [11, 23], [10, 24], [12, 24]], C.lace);
      g.set(10, 25, GOLD).set(11, 25, GOLD);
      g.rect(8, 23, 1, 9, C.coatHi).rect(13, 23, 1, 9, C.coatSh);
      g.rect(5, 32, 12, 1, C.coatSh);
      g.px([[6, 24], [7, 27]], C.coatHi);
      g.rect(8, 33, 1, 5, C.jeansSh).rect(14, 33, 1, 5, C.jeansSh);
    }

    if (p.sit) g.rect(5, 32, 5, 1, C.knee).rect(12, 32, 5, 1, C.knee).rect(5, 35, 5, 1, K).rect(12, 35, 5, 1, K);

    if (arm === "eat") {
      // forearm across to the chest, hand round a shawarma wrap in foil
      g.rect(12, 26, 7, 4, K).rect(13, 27, 6, 2, sleeve);
      g.rect(9, 21, 5, 9, K);
      g.rect(10, 22, 3, 3, WRAP.bread).set(10, 22, WRAP.lettuce).set(11, 22, WRAP.sauce).set(12, 22, WRAP.lettuce);
      g.rect(12, 23, 1, 2, WRAP.breadSh);
      g.rect(10, 25, 3, 4, WRAP.foil).rect(12, 25, 1, 4, WRAP.foilSh);
      g.rect(12, 27, 2, 2, C.skin);
    }

    if (p.sweat) g.px([[3, 9], [3, 10], [2, 11], [3, 11]], SWEAT).set(2, 10, K).set(4, 10, K).set(4, 11, K);
    return g;
  }

  /* ---------- Mohaimen's portrait, for the dialogue box ---------- */

  // expr: neutral | nervous | happy | blush | soft | shocked
  function portrait(expr) {
    const C = MO;
    const g = new Grid(36, 36);

    // shoulders: the white sherpa collar over a black shirt
    g.ellipse(18, 36, 17, 7.5, C.coat);
    g.rect(15, 27, 6, 4, C.skinSh); // neck
    // the curls
    g.ellipse(18, 12, 12.4, 9.6, C.hair);
    [[6.6, 16], [5.8, 10.8], [8.2, 6], [12.6, 3], [18, 2.2], [23.4, 3], [27.8, 6], [30.2, 10.8], [29.4, 16], [7.4, 20], [28.6, 20]]
      .forEach(([x, y]) => g.ellipse(x, y, 3.5, 3.5, C.hair));
    // ears and face
    g.ellipse(8.4, 20.5, 1.8, 2.6, C.skin).ellipse(27.6, 20.5, 1.8, 2.6, C.skin);
    g.ellipse(18, 20, 8.6, 9, C.skin);
    // curls falling over the forehead
    [[11.5, 11.8], [15.5, 11], [20, 11], [24.4, 11.8]].forEach(([x, y]) => g.ellipse(x, y, 2.4, 2, C.hair));
    g.outline(K);

    // shade on the far side of the face
    g.tint((x, y, v) => v === C.skin && (x >= 25 || y >= 27), C.skinSh);
    g.px([[8, 7], [12, 4], [17, 3], [22, 3], [27, 6], [30, 11], [6, 13], [11, 10], [19, 9]], C.hairHi);

    const shirt = [[15, 31], [16, 31], [17, 31], [18, 31], [19, 31], [20, 31], [21, 31]];
    g.px(shirt, C.shirt);
    g.rect(16, 32, 5, 4, C.shirt);
    g.px([[6, 33], [9, 31], [11, 34], [26, 31], [28, 34], [24, 33], [4, 35], [31, 35]], C.coatDot);
    g.px([[13, 31], [14, 32], [22, 32], [23, 31]], C.coatSh);

    const W = "#ffffff";

    // eyes: 3×3 with a glint, or shut, or wide
    const eye = (x, kind, look = 0) => {
      if (kind === "happy") { g.rect(x, 19, 3, 1, EYE).set(x - 1, 20, EYE).set(x + 3, 20, EYE); return; }
      if (kind === "soft") { g.rect(x - 1, 19, 5, 1, EYE); g.rect(x, 20, 3, 1, EYE); return; }
      if (kind === "wide") { g.rect(x - 1, 17, 5, 5, W); g.rect(x + 1 + look, 18, 2, 2, EYE); g.rect(x - 1, 17, 5, 1, EYE); return; }
      g.rect(x, 18, 3, 3, EYE);
      g.set(x + look, 18, W);
    };

    switch (expr) {
      case "nervous":
        g.rect(11, 14, 5, 1, C.hair).rect(21, 14, 5, 1, C.hair).set(15, 13, C.hair).set(21, 13, C.hair);
        eye(12, "open", 2); eye(22, "open", 2);
        g.px([[15, 26], [16, 25], [17, 26], [18, 25], [19, 26], [20, 25], [21, 26]], LIP);
        g.px([[28, 13], [28, 14], [27, 15], [28, 15], [29, 15], [28, 16]], SWEAT).set(29, 14, K).set(27, 14, K);
        break;
      case "happy":
        g.rect(11, 15, 5, 1, C.hair).rect(21, 15, 5, 1, C.hair);
        eye(12, "happy"); eye(22, "happy");
        g.rect(15, 25, 7, 2, MOUTH).rect(15, 25, 7, 1, W).set(15, 26, EYE).set(21, 26, EYE).rect(16, 27, 5, 1, MOUTH);
        g.px([[10, 22], [11, 22], [25, 22], [26, 22]], BLUSH);
        break;
      case "blush":
        g.rect(11, 15, 5, 1, C.hair).rect(21, 15, 5, 1, C.hair);
        eye(12, "soft"); eye(22, "soft");
        g.px([[15, 25], [16, 26], [17, 26], [18, 26], [19, 26], [20, 26], [21, 25]], LIP);
        g.rect(9, 22, 4, 1, BLUSH).rect(24, 22, 4, 1, BLUSH).rect(10, 23, 2, 1, BLUSH).rect(25, 23, 2, 1, BLUSH);
        break;
      case "soft":
        g.rect(11, 15, 5, 1, C.hair).rect(21, 15, 5, 1, C.hair);
        eye(12, "open", 1); eye(22, "open", 1);
        g.px([[16, 25], [17, 26], [18, 26], [19, 26], [20, 25]], LIP);
        g.px([[10, 22], [11, 22], [25, 22], [26, 22]], BLUSH);
        break;
      case "shocked":
        g.rect(11, 13, 5, 1, C.hair).rect(21, 13, 5, 1, C.hair);
        eye(12, "wide", 0); eye(22, "wide", 0);
        g.rect(17, 25, 3, 3, EYE).set(18, 26, MOUTH);
        g.px([[28, 13], [28, 14], [27, 15], [28, 15], [29, 15], [28, 16]], SWEAT).set(29, 14, K).set(27, 14, K);
        break;
      default:
        g.rect(11, 15, 5, 1, C.hair).rect(21, 15, 5, 1, C.hair);
        eye(12, "open", 1); eye(22, "open", 1);
        g.px([[15, 25], [16, 26], [17, 26], [18, 26], [19, 26], [20, 26], [21, 25]], LIP);
    }

    // moustache and a short beard that follows the jaw
    const stubble = "#8f5e42";
    for (let y = 22; y < 30; y++) {
      for (let x = 9; x < 28; x++) {
        const v = g.get(x, y);
        if (v !== C.skin && v !== C.skinSh) continue;
        const jaw = y >= 27 || (y >= 24 && (x <= 12 || x >= 24));
        if (jaw) g.set(x, y, y >= 28 || x <= 10 || x >= 26 ? C.beard : stubble);
      }
    }
    if (expr !== "happy" && expr !== "shocked") g.rect(15, 24, 7, 1, C.beard).set(14, 25, C.beard).set(22, 25, C.beard);
    else g.px([[14, 24], [15, 24], [21, 24], [22, 24]], C.beard);
    // nose
    g.px([[18, 21], [18, 22], [17, 23], [19, 23]], C.skinSh);
    return g;
  }

  /* ---------- Emotes that pop over their heads ---------- */

  const EMOTE_TOP = ".KKKKKKKKKKK.";
  const EMOTE_TAIL = [".KKKWKKKKKKK.", "...KWK.......", "...KK........"];
  const emote = (rows, legend) => fromRows([EMOTE_TOP, ...rows, ...EMOTE_TAIL], Object.assign({ K, W: "#fffdf6" }, legend));
  const EMOTES = {
    heart: () => emote([
      "KWWWWWWWWWWWK",
      "KWWWRRWRRWWWK",
      "KWWRRHRRRRWWK",
      "KWWRRRRRRRWWK",
      "KWWWRRRRRWWWK",
      "KWWWWRRRWWWWK",
      "KWWWWWRWWWWWK",
      "KWWWWWWWWWWWK",
    ], { R: RED, H: RED_HI }),
    exclaim: () => emote([
      "KWWWWWKWWWWWK",
      "KWWWWKRKWWWWK",
      "KWWWWKRKWWWWK",
      "KWWWWKRKWWWWK",
      "KWWWWWKWWWWWK",
      "KWWWWKRKWWWWK",
      "KWWWWWKWWWWWK",
      "KWWWWWWWWWWWK",
    ], { R: RED }),
    dots: () => emote([
      "KWWWWWWWWWWWK",
      "KWWWWWWWWWWWK",
      "KWWWWWWWWWWWK",
      "KWWKKWKKWKKWK",
      "KWWKKWKKWKKWK",
      "KWWWWWWWWWWWK",
      "KWWWWWWWWWWWK",
      "KWWWWWWWWWWWK",
    ], {}),
    sweat: () => emote([
      "KWWWWWWWWWWWK",
      "KWWWWWBWWWWWK",
      "KWWWWBBWWWWWK",
      "KWWWBBHBWWWWK",
      "KWWWBBBBWWWWK",
      "KWWWBBBBWWWWK",
      "KWWWWBBWWWWWK",
      "KWWWWWWWWWWWK",
    ], { B: "#4a9fd6", H: "#cdeefc" }),
    note: () => emote([
      "KWWWWWWWWWWWK",
      "KWWWWWKKKKWWK",
      "KWWWWWKWWKWWK",
      "KWWWWWKWWKWWK",
      "KWWWWWKWWKWWK",
      "KWWWKKKWKKKWK",
      "KWWWKKKWKKKWK",
      "KWWWWWWWWWWWK",
    ], {}),
  };

  /* ---------- Flowers for the burst ---------- */

  const FLOWER_COLORS = [
    { petal: "#fbf6ec", shade: "#e9c9d6", center: "#f6a93b" }, // white lily
    { petal: "#f58aa8", shade: "#d9557a", center: "#fbd24e" }, // pink
    { petal: "#ffd84a", shade: "#e8a92a", center: "#8a4a1c" }, // sunflower
    { petal: "#b79af0", shade: "#8a6ad8", center: "#fff1a8" }, // sweet pea
    { petal: "#7fcdf2", shade: "#4a9fd6", center: "#fffdf6" }, // blue jazz
    { petal: "#ff9d7a", shade: "#e2694a", center: "#fff1a8" }, // coral
  ];

  function flower(variant, stage) {
    const v = FLOWER_COLORS[variant % FLOWER_COLORS.length];
    const g = new Grid(15, 15);
    const c = 7;
    if (stage === 0) {
      g.line(7, 12, 7, 9, LEAF);
      g.ellipse(7, 7, 1.3, 2, v.petal);
      g.outline(K);
      g.px([[6, 9], [8, 9]], LEAF_DK);
      g.set(7, 8, v.shade);
      return g;
    }
    const n = stage === 1 ? 4 : 6;
    const r = stage === 1 ? 2.2 : 3.6;
    const s = stage === 1 ? 1.6 : 2.2;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (stage === 1 ? Math.PI / 4 : 0);
      g.ellipse(c + Math.cos(a) * r, c + Math.sin(a) * r, s, s, v.petal);
    }
    g.ellipse(c, c, stage === 1 ? 1.2 : 1.7, stage === 1 ? 1.2 : 1.7, v.center);
    g.outline(K);
    if (stage === 2) {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + 0.5;
        g.set(c + Math.cos(a) * 2.6, c + Math.sin(a) * 2.6, v.shade);
      }
      g.set(c - 1, c - 1, "#ffffff");
    }
    return g;
  }

  function leafSprite(i) {
    const g = new Grid(13, 13);
    const col = [LEAF, LEAF_DK, "#7cbf4a"][i % 3];
    g.ellipse(6, 6, 5.4, 2.2, col, -0.7 + i * 0.6);
    g.outline(K);
    g.line(3, 9, 9, 3, i === 1 ? LEAF : LEAF_HI);
    return g;
  }

  function cloud(i) {
    const shapes = [
      [[8, 8, 7, 4], [16, 6, 8, 5.4], [25, 8, 6, 4]],
      [[7, 6, 6, 3.6], [14, 5, 6, 4.4]],
      [[9, 7, 8, 4], [19, 6, 7, 4.6], [27, 8, 5, 3.4], [34, 8, 4, 3]],
    ][i % 3];
    const w = Math.ceil(Math.max(...shapes.map((s) => s[0] + s[2]))) + 1;
    const g = new Grid(w, 13);
    shapes.forEach(([x, y, rx, ry]) => g.ellipse(x, y, rx, ry, "#ffffff"));
    g.tint((x, y) => y >= 9, "#dce9f6");
    return g;
  }

  /* ---------- The cats ---------- */

  // pose: { eyes: open|blink|happy|wide, look: -1..1, mouth: closed|meow|hiss,
  //         ears: up|back|twitch, tail: 0|1, paw: 0|1|2, step: -1|0|1 }
  function cat(kind, p) {
    const tufo = kind === "tufo";
    const coat = tufo ? "#fbf8f2" : "#a39c95";
    const stripe = "#6f6862";
    const white = "#fbf5ea";
    const pink = tufo ? "#eba7ab" : "#e8a0a0";
    const eye = "#2b1d16";
    const mouthRed = "#b8433b";
    const g = new Grid(26, 23);

    // tail (behind)
    const TAILS = [
      [[17, 18], [18, 18], [19, 17], [20, 16], [21, 15], [21, 14], [22, 13], [22, 12], [21, 11]],
      [[17, 18], [18, 18], [19, 17], [20, 17], [21, 16], [22, 15], [23, 14], [23, 13], [24, 12]],
    ];
    const tail = TAILS[p.tail || 0];
    tail.forEach(([x, y]) => g.rect(x, y, 2, 2, coat));

    // body and head
    g.ellipse(11.5, 16, 6.4, 4.6, coat);
    g.ellipse(11.5, 8.5, 7.6, 5.9, coat);

    // ears
    const EARS = {
      up: [[[4.6, 7], [6, 0.8], [10.2, 3.4]], [[18.4, 7], [17, 0.8], [12.8, 3.4]]],
      back: [[[5, 6], [0.8, 3], [8.6, 3.2]], [[18, 6], [22.2, 3], [14.4, 3.2]]],
      twitch: [[[4.6, 7], [6, 0.8], [10.2, 3.4]], [[18.4, 7], [20.4, 2], [12.8, 3.4]]],
    };
    const ears = EARS[p.ears] || EARS.up;
    ears.forEach((tri) => g.poly(tri, coat));

    if (tufo) {
      g.px([[11, 2], [12, 2], [12, 1], [13, 1]], coat);          // the tuft he is proud of
      g.px([[3, 10], [3, 11], [4, 12], [20, 10], [20, 11], [19, 12]], coat); // cheek fluff
    }

    // paws (and a raised paw for swatting)
    const step = p.step == null ? -1 : p.step;
    const lpY = step === 0 ? 19.4 : 20.2;
    const rpY = step === 1 ? 19.4 : 20.2;
    const pawCol = tufo ? coat : white;
    g.ellipse(9.3, lpY, 1.9, 1.2, pawCol);
    if (p.paw === 1) {
      g.line(15, 15, 18, 13, coat, 2);
      g.ellipse(19.6, 12.4, 1.6, 1.4, pawCol);
    } else if (p.paw === 2) {
      g.line(15, 14, 20, 11, coat, 2);
      g.ellipse(21.6, 10.2, 1.6, 1.4, pawCol);
    } else {
      g.ellipse(13.7, rpY, 1.9, 1.2, pawCol);
    }

    g.outline(K);

    // ear insides
    const inner = p.ears === "back"
      ? [[[5.6, 4.6], [3, 3.4], [7.4, 3.6]], [[17.4, 4.6], [20, 3.4], [15.6, 3.6]]]
      : [[[6.2, 5], [6.4, 2.6], [8.6, 3.8]], [[16.8, 5], [p.ears === "twitch" ? 18.6 : 16.6, 2.6], [14.4, 3.8]]];
    inner.forEach((tri) => g.poly(tri, pink));

    const L = Math.max(-1, Math.min(1, p.look || 0));

    if (!tufo) {
      // Mei: grey tabby with a white blaze, bib and paws
      const blaze = { 6: [11, 12], 7: [11, 12], 8: [10, 13], 9: [10, 13], 10: [9, 14], 11: [8, 15], 12: [8, 15], 13: [9, 14], 14: [10, 13] };
      Object.entries(blaze).forEach(([y, [a, b]]) => g.rect(a, +y, b - a + 1, 1, white));
      g.px([[9, 4], [9, 5], [14, 4], [14, 5], [11, 4], [12, 4]], stripe);
      g.px([[4, 9], [5, 9], [18, 9], [19, 9], [5, 11], [18, 11]], stripe);
      g.ellipse(11.5, 17.4, 2.6, 3, white);
      g.px([[6, 17], [6, 18], [17, 17], [17, 18]], stripe);
      tail.forEach(([x, y], i) => { if (i % 2 === 1 || i === tail.length - 1) g.rect(x, y, 2, 2, stripe); });
      g.rect(6, 14, 12, 1, "#d9672e");                       // orange collar
      g.rect(11, 15, 2, 2, "#6fa04a");                       // green heart tag
      g.px([[6, 12], [7, 12], [16, 12], [17, 12]], "#eeb0a4"); // blush

      if (p.eyes === "blink") {
        g.rect(7, 10, 2, 1, eye).rect(15, 10, 2, 1, eye);
      } else if (p.eyes === "happy") {
        g.px([[6, 10], [7, 9], [8, 9], [9, 10], [14, 10], [15, 9], [16, 9], [17, 10]], eye);
      } else if (p.eyes === "wide") {
        g.rect(6 + L, 7, 3, 4, eye).rect(15 + L, 7, 3, 4, eye);
        g.px([[6 + L, 7], [7 + L, 8], [15 + L, 7], [16 + L, 8]], "#ffffff");
      } else {
        g.rect(7 + L, 8, 2, 3, eye).rect(15 + L, 8, 2, 3, eye);
        g.px([[7 + L, 8], [15 + L, 8]], "#ffffff");
      }
      g.px([[11, 11], [12, 11]], pink);
    } else {
      // Tufo: white, pink-rimmed pale eyes, half-lidded and smug
      g.ellipse(11.5, 18.2, 3.8, 2, "#e8e1d4");
      g.px([[5, 12], [6, 12], [17, 12], [18, 12]], "#f4c4c4");
      g.rect(6, 14, 12, 1, "#4f7a3a");                       // spiked collar
      g.px([[7, 14], [10, 14], [13, 14], [16, 14]], "#efe6c8");
      const green = "#c9d49a";
      const rim = "#e48f98";
      if (p.eyes === "blink") {
        g.rect(6, 10, 3, 1, K).rect(15, 10, 3, 1, K);
        g.rect(6, 11, 3, 1, rim).rect(15, 11, 3, 1, rim);
      } else if (p.eyes === "happy") {
        g.px([[6, 10], [7, 11], [8, 10], [15, 10], [16, 11], [17, 10]], K);
      } else if (p.eyes === "wide") {
        g.rect(6, 8, 3, 3, green).rect(15, 8, 3, 3, green);
        g.px([[7 + L, 9], [7 + L, 10], [16 + L, 9], [16 + L, 10]], eye);
        g.rect(6, 11, 3, 1, rim).rect(15, 11, 3, 1, rim);
      } else {
        g.rect(6, 9, 3, 1, K).rect(15, 9, 3, 1, K);          // the heavy lids
        g.rect(6, 10, 3, 1, green).rect(15, 10, 3, 1, green);
        g.px([[7 + L, 10], [16 + L, 10]], eye);
        g.rect(6, 11, 3, 1, rim).rect(15, 11, 3, 1, rim);
      }
      g.px([[11, 12], [12, 12]], pink);
    }

    // mouth
    const mY = tufo ? 13 : 12;
    if (p.mouth === "hiss") {
      g.rect(10, mY, 4, 2, mouthRed);
      g.px([[10, mY], [13, mY]], "#ffffff");
    } else if (p.mouth === "meow") {
      g.rect(11, mY, 2, 2, mouthRed);
    } else if (tufo) {
      g.px([[11, 13], [12, 13], [13, 12]], K);               // smirk
    } else {
      g.px([[11, 12], [12, 12]], K);
    }
    return g;
  }

  /* ---------- The farm backdrop, one per time of day ---------- */

  const TIMES = {
    dawn: {
      sky: ["#5a78c8", "#8497d8", "#c3a2cf", "#f2b8a4", "#fde0b0"],
      body: { kind: "sun", x: 0.8, y: 0.84, r: 7, c: "#ffcf6a", core: "#fff3b8" },
      far: "#7c9fa0", near: "#4f8a4a", tree: "#2f6b3a", treeHi: "#4f8f45",
      grass: "#6aa84a", grassDk: "#4f8b3a", fence: "#b07a44", fenceDk: "#6b4220", soil: "#8a5a2b", flowers: true,
    },
    morning: {
      sky: ["#4a90e2", "#5ea0ea", "#78b4f2", "#98caf7", "#bfe2fc"],
      body: { kind: "sun", x: 0.2, y: 0.36, r: 7, c: "#ffd76a", core: "#fff6c8" },
      far: "#86b86c", near: "#5c9e44", tree: "#3a7a35", treeHi: "#5c9c46",
      grass: "#78b84a", grassDk: "#5a9a3a", fence: "#bf8248", fenceDk: "#74461f", soil: "#8a5a2b", flowers: true, clouds: true,
    },
    noon: {
      sky: ["#3a86e0", "#4c95e8", "#63a8ef", "#82bdf5", "#aad6fb"],
      body: { kind: "sun", x: 0.52, y: 0.12, r: 8, c: "#ffe07a", core: "#fffbe0" },
      far: "#8cc070", near: "#62a646", tree: "#3d8038", treeHi: "#62a64a",
      grass: "#7cc04c", grassDk: "#5ea03c", fence: "#c4884c", fenceDk: "#784a22", soil: "#8f5d2d", flowers: true, clouds: true,
    },
    afternoon: {
      sky: ["#4a86d8", "#6a9ee0", "#94b8e2", "#e6cf9c", "#f6dba6"],
      body: { kind: "sun", x: 0.76, y: 0.42, r: 8, c: "#ffc95a", core: "#fff0b8" },
      far: "#90b068", near: "#6a9c42", tree: "#44763a", treeHi: "#6a9a48",
      grass: "#80b448", grassDk: "#62953a", fence: "#c4884c", fenceDk: "#784a22", soil: "#8f5d2d", flowers: true, clouds: true,
    },
    sunset: {
      sky: ["#2e2f73", "#5a3f88", "#a8508a", "#e8795a", "#f8ae5a"],
      body: { kind: "sun", x: 0.3, y: 0.97, r: 12, c: "#ff9a3c", core: "#ffd27a" },
      far: "#7a5a78", near: "#4f5e3c", tree: "#2e3d2a", treeHi: "#465a36",
      grass: "#5f7c3a", grassDk: "#48602d", fence: "#8c5530", fenceDk: "#4f2c16", soil: "#6e4526", flowers: true,
    },
    night: {
      sky: ["#0b0f2e", "#10173f", "#16204f", "#1d295f", "#26346f"],
      body: { kind: "moon", x: 0.78, y: 0.2, r: 6 },
      far: "#20305a", near: "#1a3a3c", tree: "#10262a", treeHi: "#1e3a3a",
      grass: "#24493a", grassDk: "#1a3a2e", fence: "#48404e", fenceDk: "#262030", soil: "#3a2a26", stars: true,
    },
    festival: {
      sky: ["#0d0b2e", "#18123f", "#261a52", "#34205e", "#44286a"],
      body: { kind: "moon", x: 0.2, y: 0.18, r: 6 },
      far: "#2a2a5a", near: "#1c3a40", tree: "#10262a", treeHi: "#1e3a3a",
      grass: "#26503c", grassDk: "#1b3f30", fence: "#55464e", fenceDk: "#2a2030", soil: "#3a2a26", stars: true, lights: true,
    },
  };

  const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // groundCss: how tall the grass strip is, in CSS pixels
  /* ---------- The memory places: where each memory happened ---------- */

  // a 3×5 pixel font, just the letters the signs need
  const FONT = {
    A: ["010", "101", "111", "101", "101"], R: ["110", "101", "110", "101", "101"],
    I: ["111", "010", "010", "010", "111"], V: ["101", "101", "101", "101", "010"],
    L: ["100", "100", "100", "100", "111"], S: ["011", "100", "010", "001", "110"],
    H: ["101", "101", "111", "101", "101"], F: ["111", "100", "110", "100", "100"],
    X: ["101", "101", "010", "101", "101"],
  };
  const textWidth = (str) => str.length * 4 - 1;
  function sign(fill, str, x, y, c) {
    [...str].forEach((ch, i) => {
      (FONT[ch] || []).forEach((row, j) => {
        [...row].forEach((on, k) => { if (on === "1") fill(c, x + i * 4 + k, y + j); });
      });
    });
  }

  // a soft round light: solid in the middle, dithered toward the edge
  function glow(fill, cx, cy, r, c) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d = Math.hypot(x, y) / r;
        if (d > 1 || (d > 0.6 && (x + y) % 2)) continue;
        fill(c, cx + x, cy + y);
      }
    }
  }

  // Each drawer paints over the sky and returns the colour for the browser bar (null keeps the sky's).
  // ground: where the back wall meets the floor; base: the row their feet stand on; mid: the column between them.
  const PLACES = {
    // The arrivals hall where they first met: a glass wall onto the tarmac
    airport({ fill, W, H, ground, rand }) {
      const sill = ground - 12;
      const winTop = 12;
      // outside: the tarmac, a taxi line and a plane at the gate
      fill("#8a8f99", 0, sill - 16, W, 16);
      fill("#a3a8b2", 0, sill - 16, W, 1);
      for (let x = 2; x < W; x += 10) fill("#e8d36a", x, sill - 6, 5, 1);
      // a plane at the gate, twice the size on a wide screen; x, y in plane pixels from its centre
      const z = W > 300 ? 2 : 1;
      const pcx = Math.round(W * 0.62);
      const pcy = sill - 4;
      const plane = (c, x, y, w = 1, h = 1) => fill(c, pcx + x * z, pcy + y * z, w * z, h * z);
      plane("#6c7280", -40, -4, 18, 4);                         // jet bridge
      plane("#555b69", -40, 0, 18, 1);
      plane("#f2f4f8", -22, -5, 44, 6);                         // fuselage
      plane("#dfe3ea", -22, 0, 44, 1);
      plane("#f2f4f8", 22, -4, 3, 4);                           // nose
      plane("#f2f4f8", 25, -3, 1, 2);
      plane("#2b3140", 21, -4, 2, 1);                           // cockpit
      plane("#f2f4f8", -22, -12, 5, 7);                         // tail
      plane("#e0304e", -22, -12, 5, 3);
      plane("#c9ced8", -6, -1, 16, 2);                          // wing
      for (let x = -16; x < 18; x += 3) plane("#6bb0ff", x, -3);
      plane("#e0304e", -20, -2, 40, 1);                         // stripe
      plane("#2b3140", -12, 1, 2, 2);                           // wheels
      plane("#2b3140", 14, 1, 2, 2);
      // another one taking off, far away
      const ox = Math.round(W * 0.2);
      const oy = Math.round(sill * 0.45);
      for (let k = 0; k < 9; k++) fill("#f2f4f8", ox + k, oy - Math.floor(k / 3));
      fill("#f2f4f8", ox, oy - 3, 1, 3);
      fill("#f2f4f8", ox + 3, oy, 3, 1);

      // the hall: a light wall with tall windows cut into it
      const WALL = "#d9dde6";
      const FRAME = "#5d6474";
      const n = Math.max(2, Math.floor(W / 46));
      const pillar = 6;
      const ww = Math.floor((W - (n + 1) * pillar) / n);
      fill(WALL, 0, 0, W, winTop);
      fill(WALL, 0, sill, W, ground - sill);
      for (let i = 0; i <= n; i++) fill(WALL, i * (ww + pillar), winTop, pillar, sill - winTop);
      fill(WALL, n * (ww + pillar), winTop, W, sill - winTop);
      for (let i = 0; i < n; i++) {
        const x = pillar + i * (ww + pillar);
        fill(FRAME, x - 1, winTop - 1, ww + 2, 1);
        fill(FRAME, x - 1, sill, ww + 2, 1);
        fill(FRAME, x - 1, winTop, 1, sill - winTop);
        fill(FRAME, x + ww, winTop, 1, sill - winTop);
        fill("#8a91a1", x + Math.floor(ww / 2), winTop, 1, sill - winTop);
        fill("#8a91a1", x, winTop + Math.floor((sill - winTop) / 3), ww, 1);
        for (let k = 0; k < 6; k++) fill("#ffffff50", x + 3 + k, winTop + 12 - k); // glare
      }
      // ceiling lights
      fill("#b9bfcc", 0, winTop - 2, W, 1);
      for (let x = 6; x < W; x += 16) fill("#fffbe0", x, 3, 6, 2);

      // the arrivals sign, hanging from the ceiling
      const label = "ARRIVALS";
      const sw = textWidth(label) + 10;
      const sx = Math.max(3, Math.round(W * 0.26 - sw / 2));
      fill(FRAME, sx + 3, 0, 1, 16);
      fill(FRAME, sx + sw - 4, 0, 1, 16);
      fill("#2b3140", sx, 16, sw, 9);
      sign(fill, label, sx + 2, 18, "#ffd84a");
      fill("#ffd84a", sx + sw - 6, 20, 3, 1);                   // arrow
      fill("#ffd84a", sx + sw - 5, 19, 1, 3);

      // the flight board
      const bx = Math.min(W - 32, Math.round(W * 0.8));
      fill("#1d2230", bx, 16, 26, 17);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) fill(rand() < 0.7 ? "#ffd84a" : "#9bff7a", bx + 2 + c * 5, 19 + r * 3, rand() < 0.5 ? 3 : 4, 1);
      }

      // floor tiles
      fill("#c9ccd4", 0, ground, W, H - ground);
      for (let y = ground + 4; y < H; y += 8) fill("#b3b7c1", 0, y, W, 1);
      for (let y = ground, row = 0; y < H; y += 8, row++) {
        for (let x = (row % 2) * 8; x < W; x += 16) fill("#b3b7c1", x, y, 1, 8);
      }
      fill(FRAME, 0, ground, W, 1);

      // a row of blue seats on the left, a plant and a suitcase on the right
      const seats = Math.max(2, Math.min(5, Math.floor((W * 0.3) / 10)));
      for (let i = 0; i < seats; i++) {
        const x = 4 + i * 10;
        fill("#3f6fb5", x, ground - 8, 8, 5);
        fill("#2f558c", x, ground - 3, 8, 2);
        fill("#555b69", x + 1, ground - 1, 1, 2);
        fill("#555b69", x + 6, ground - 1, 1, 2);
      }
      const plant = W - 10;
      fill(WOOD.mid, plant - 3, ground - 6, 7, 6);
      [[0, -12], [-3, -10], [3, -10], [-2, -15], [2, -14]].forEach(([dx, dy]) => fill(LEAF, plant + dx - 1, ground + dy, 3, 4));
      const bag = W - 24;
      fill("#e0304e", bag, ground - 9, 8, 9);
      fill("#a8243c", bag, ground - 1, 8, 1);
      fill("#2b3140", bag + 3, ground - 12, 1, 3);
      fill("#2b3140", bag + 3, ground - 12, 3, 1);
      fill("#2b3140", bag + 5, ground - 12, 1, 3);
      return WALL;
    },

    // The Halifax waterfront at night: the harbour, Dartmouth's lights across it, the boardwalk.
    // Always drawn at night (Scene forces it): that's when it happened.
    docks({ fill, W, H, ground, horizon, rand, glowAt, moon }) {
      const shore = horizon - 10;
      // Dartmouth, dark across the water, windows still lit
      for (let x = 0; x < W; x++) {
        const top = Math.round(shore - 3 - 2 * Math.sin(x * 0.06 + 1) - Math.sin(x * 0.17));
        fill("#1c2b3e", x, top, 1, shore - top + 2);
      }
      for (let x = 3; x < W - 4; x += 5 + Math.floor(rand() * 6)) {
        const h = 2 + Math.floor(rand() * 2);
        fill("#2e3a52", x, shore - 3 - h, 3, h + 1);
        fill("#171f30", x, shore - 4 - h, 3, 1);
        if (rand() < 0.7) fill(rand() < 0.8 ? "#ffd84a" : "#ffb08a", x + 1, shore - 2 - h);
      }
      // the harbour, dark, with the moon laid across it
      const bands = ["#1f3563", "#1b2f59", "#172a4f", "#132444"];
      const bandH = Math.max(1, (ground - shore) / bands.length);
      bands.forEach((c, i) => fill(c, 0, Math.round(shore + i * bandH), W, Math.ceil(bandH) + 1));
      for (let y = shore + 2; y < ground; y += 2) {
        const w = 2 + Math.floor(rand() * 5);
        fill(rand() < 0.5 ? "#f4ecc2" : "#c9c4a0", moon.x - Math.floor(w / 2) + Math.round((rand() - 0.5) * 3), y, w, 1);
      }
      for (let i = 0; i < (W * (ground - shore)) / 70; i++) {
        fill("#5a78b0", Math.floor(rand() * W), shore + 2 + Math.floor(rand() * (ground - shore - 3)), 2, 1);
      }
      // a cruise ship in port, far across, every porthole lit
      const cx = Math.round(W * 0.5);
      fill("#c9cbd6", cx - 18, shore - 4, 36, 4);
      fill("#2a3550", cx - 18, shore - 1, 36, 1);
      fill("#c9cbd6", cx - 12, shore - 7, 24, 3);
      for (let x = cx - 16; x < cx + 17; x += 2) fill("#ffd84a", x, shore - 3);
      for (let x = cx - 11; x < cx + 12; x += 3) fill("#fff0a0", x, shore - 6);
      fill("#e0304e", cx + 4, shore - 10, 3, 3);
      // Georges Island, its lighthouse awake
      const ix = Math.round(W * 0.28);
      fill("#1c2b3e", ix - 7, shore + 1, 14, 2);
      fill("#1c2b3e", ix - 4, shore, 8, 1);
      glowAt(ix, shore - 9, 6, "#fff0a040");
      fill("#dcd6c0", ix - 1, shore - 7, 3, 7);
      fill("#c8243f", ix - 1, shore - 5, 3, 1);
      fill("#c8243f", ix - 1, shore - 8, 3, 1);
      fill("#fff0a0", ix, shore - 9);
      // the red tugboat, running lights on
      const tx = Math.round(W * 0.74);
      const ty = Math.round(shore + (ground - shore) * 0.4);
      fill("#a01d33", tx - 9, ty, 18, 3);
      fill("#10101a", tx - 9, ty + 3, 18, 1);
      fill("#c9cbd6", tx - 4, ty - 4, 8, 4);
      fill("#ffd84a", tx - 2, ty - 3);
      fill("#ffd84a", tx + 1, ty - 3);
      fill("#10101a", tx - 1, ty - 8, 3, 4);
      fill("#9bff7a", tx + 8, ty - 1);
      fill("#ff6b6b", tx - 9, ty - 1);

      // a wooden boat tied up by the boardwalk, a lantern on its bow
      const rw = W > 200 ? 30 : 22;
      // left of the two of them on a wide screen; on a phone there's only room to their right
      const signEnd = 6 + textWidth("HALIFAX") + 10;
      let rx = Math.round(W / 2 - 34 - rw - 10);
      if (rx < signEnd) rx = Math.min(W - rw - 2, Math.round(W / 2 + 30));
      const ry = ground - 3;
      glowAt(rx + rw - 3, ry - 9, 7, "#ffd48a30");
      fill("#10101a", rx - 1, ry - 6, rw + 2, 1);               // gunwale outline
      fill("#6e4526", rx, ry - 5, rw, 2);                       // gunwale
      fill("#8a5530", rx + 1, ry - 3, rw - 2, 2);               // hull planks
      fill("#6e4526", rx + 2, ry - 1, rw - 4, 1);
      fill("#10101a", rx + 3, ry, rw - 6, 1);                   // keel line in the water
      fill("#10101a", rx - 1, ry - 5, 1, 2);
      fill("#10101a", rx + rw, ry - 5, 1, 2);
      fill("#4a2d18", rx + Math.floor(rw * 0.35), ry - 7, 2, 2); // seats
      fill("#4a2d18", rx + Math.floor(rw * 0.65), ry - 7, 2, 2);
      fill("#2b1a13", rx + rw - 3, ry - 14, 1, 8);               // lantern pole
      fill("#10101a", rx + rw - 4, ry - 15, 3, 1);
      fill("#ffd84a", rx + rw - 4, ry - 14, 3, 2);
      for (let k = 0; k < rw; k += 3) fill("#5a78b0", rx + k, ry + 1, 2, 1); // ripples
      for (let k = 0; k < 8; k++) fill("#c9a06a", rx - 1 - k, ry - 5 + Math.floor(k / 3)); // rope to the dock

      // the boardwalk, moonlit
      fill("#5a3d28", 0, ground, W, H - ground);
      for (let y = ground + 3, row = 0; y < H; y += 4, row++) {
        fill("#452d1d", 0, y, W, 1);
        for (let x = (row * 7) % 19; x < W; x += 19) fill("#452d1d", x, y - 3, 1, 3);
      }
      fill("#3a2616", 0, ground, W, 2);
      // bollards with a rope sagging between them
      const posts = [];
      for (let x = 5; x < W; x += 22) posts.push(x);
      posts.forEach((x, i) => {
        const next = posts[i + 1];
        if (next) {
          for (let k = 0; k <= next - x; k++) {
            fill("#9a8060", x + 1 + k, ground - 5 + Math.round(Math.sin((k / (next - x)) * Math.PI) * 3));
          }
        }
        fill("#1d2230", x, ground - 6, 3, 7);
        fill("#3a3f4a", x, ground - 6, 3, 1);
      });
      // lamp posts, lit
      [W - 12, Math.round(W / 2 + 60)].filter((x, i) => i === 0 || x < W - 30).forEach((lx) => {
        glowAt(lx, ground - 28, 14, "#ffd48a22");
        glowAt(lx, ground - 28, 7, "#ffd48a33");
        fill("#10101a", lx, ground - 26, 1, 26);
        fill("#10101a", lx - 2, ground - 29, 5, 3);
        fill("#fff0a0", lx - 1, ground - 28, 3, 1);
      });
      // the sign
      const label = "HALIFAX";
      const sw = textWidth(label) + 6;
      const sx = 6;
      fill("#3a2616", sx + 3, ground - 14, 2, 14);
      fill("#3a2616", sx + sw - 5, ground - 14, 2, 14);
      fill("#7a4a2a", sx, ground - 22, sw, 9);
      fill("#4a2d18", sx, ground - 14, sw, 1);
      sign(fill, label, sx + 3, ground - 20, "#f4ecc2");
      return null;
    },

    // The Airbnb, late at night: the bed, the TV, the shawarma
    airbnb({ fill, W, H, ground, rand, base, mid }) {
      const WALL = "#5e4452";
      fill(WALL, 0, 0, W, ground);
      for (let x = 0; x < W; x += 8) fill("#664a59", x, 0, 3, ground);
      // fairy lights along the top of the wall
      const warm = ["#ffd84a", "#ffb08a", "#fff0a0", "#ff9df0"];
      for (let x = 1, i = 0; x < W; x += 5, i++) {
        const y = 7 + Math.round(Math.sin(((x % 30) / 30) * Math.PI) * 3);
        fill(warm[i % warm.length] + "40", x - 1, y - 1, 3, 3);
        fill("#2a2030", x, y - 1);
        fill(warm[i % warm.length], x, y);
      }
      // the window: night outside, the city still awake (a late-night memory, whatever the clock says)
      const wx = Math.round(W * 0.8);
      const ww = Math.max(8, Math.min(26, W - wx - 5));
      const wy = 16;
      const wh = Math.max(16, ground - 30 - wy);
      fill("#10173f", wx, wy, ww, wh);
      for (let i = 0; i < (ww * wh) / 30; i++) fill(rand() < 0.3 ? "#fff3b0" : "#dfe6ff", wx + Math.floor(rand() * ww), wy + Math.floor(rand() * wh * 0.5));
      for (let x = wx; x < wx + ww; x += 4 + Math.floor(rand() * 3)) {
        const h = 5 + Math.floor(rand() * Math.min(12, wh * 0.6));
        const bw = Math.min(4, wx + ww - x);
        fill("#1d2340", x, wy + wh - h, bw, h);
        for (let k = 0; k < h / 3; k++) if (rand() < 0.5) fill("#ffd84a", x + 1 + Math.floor(rand() * Math.max(1, bw - 2)), wy + wh - h + 1 + k * 3);
      }
      fill(WOOD.dk, wx - 1, wy - 1, ww + 2, 1);
      fill(WOOD.dk, wx - 1, wy + wh, ww + 2, 2);
      fill(WOOD.dk, wx - 1, wy, 1, wh);
      fill(WOOD.dk, wx + ww, wy, 1, wh);
      fill(WOOD.dk, wx + Math.floor(ww / 2), wy, 1, wh);
      fill("#8a2a3e", wx - 4, wy - 2, 4, wh + 5);               // curtains
      fill("#8a2a3e", wx + ww + 1, wy - 2, 4, wh + 5);

      // the floor and a rug
      fill("#6e4a34", 0, ground, W, H - ground);
      for (let y = ground + 3; y < H; y += 4) fill("#5a3a28", 0, y, W, 1);
      fill("#3f2a33", 0, ground, W, 2);
      fill("#8a5a6e", mid - 46, base - 5, 92, 6);
      fill("#a66e85", mid - 44, base - 4, 88, 1);

      // the TV on a dresser, glowing blue
      const dx = Math.max(3, Math.round(mid - 84));
      glow(fill, dx + 13, ground - 19, 22, "#6bb0ff14");
      fill(WOOD.mid, dx, ground - 10, 26, 12);
      fill(WOOD.dk, dx, ground + 1, 26, 1);
      fill(WOOD.dk, dx + 12, ground - 10, 1, 11);
      fill(GOLD, dx + 5, ground - 5, 2, 1);
      fill(GOLD, dx + 19, ground - 5, 2, 1);
      fill("#1a1a22", dx + 1, ground - 27, 24, 17);
      fill("#3a6fd0", dx + 2, ground - 26, 22, 14);
      fill("#5a8fe8", dx + 2, ground - 26, 22, 3);
      fill("#1a1a22", dx + 12, ground - 10, 2, 1);
      // a streamer mid-rant: headset, big grin, red hoodie
      fill("#2b1a13", dx + 10, ground - 23, 5, 2);
      fill("#f5cfae", dx + 10, ground - 22, 5, 5);
      fill("#1a1a22", dx + 9, ground - 21, 1, 3);
      fill("#1a1a22", dx + 15, ground - 21, 1, 3);
      fill("#a8433b", dx + 11, ground - 18, 3, 1);
      fill("#e0304e", dx + 8, ground - 16, 9, 4);

      // the bed, right behind the two of them: they sit on its edge
      const top = base - 11;
      const bw = 76;
      const bx = Math.round(mid - bw / 2);
      fill(WOOD.dk, bx - 1, top - 26, bw + 2, 26);             // headboard
      fill(WOOD.mid, bx + 1, top - 24, bw - 2, 22);
      fill(WOOD.hi2, bx + 1, top - 24, bw - 2, 2);
      fill("#fbf6ec", bx + 3, top - 7, 20, 6);                  // pillows
      fill("#fbf6ec", bx + bw - 23, top - 7, 20, 6);
      fill("#dcd3c0", bx + 3, top - 2, 20, 1);
      fill("#dcd3c0", bx + bw - 23, top - 2, 20, 1);
      fill("#b7465f", bx, top, bw, 5);                          // blanket
      fill("#d45f7a", bx, top, bw, 1);
      for (let x = bx + 3; x < bx + bw; x += 6) fill("#9a3a50", x, top + 2, 2, 2);
      fill("#9a3a50", bx, top + 5, bw, 3);                      // hanging over the side
      fill(WOOD.dk, bx, top + 8, bw, 3);                        // frame
      fill(WOOD.dk, bx + 1, top + 11, 2, base - top - 11);      // legs
      fill(WOOD.dk, bx + bw - 3, top + 11, 2, base - top - 11);

      // nightstand and lamp, the warmest thing in the room
      const nx = Math.min(W - 14, bx + bw + 3);
      glow(fill, nx + 6, top - 12, 26, "#ffd48a18");
      glow(fill, nx + 6, top - 12, 14, "#ffd48a28");
      fill(WOOD.mid, nx, top - 2, 12, base - top + 2);
      fill(WOOD.dk, nx, top - 2, 12, 1);
      fill(GOLD, nx + 5, top + 4, 2, 1);
      fill(WOOD.dk, nx + 5, top - 8, 2, 6);
      fill("#ffe7a8", nx + 1, top - 16, 10, 8);
      fill(GOLD, nx + 1, top - 9, 10, 1);

      // the takeaway bag on the floor, already raided
      const tx = Math.max(dx + 28, bx - 12);
      if (tx + 9 < mid - 28) { // only where it won't sit on Gabrielle's feet
        fill("#c9a06a", tx, base - 10, 9, 10);
        fill("#a8814f", tx, base - 10, 9, 1);
        fill("#e0304e", tx + 3, base - 6, 3, 3);
      }
      return WALL;
    },
  };

  // place: one of PLACES, or none for the farm; stand: how far up the screen the two of them stand, in art pixels
  function scene(canvas, time, px, groundCss, place, stand = 29) {
    const T = TIMES[time] || TIMES.morning;
    const W = Math.ceil(window.innerWidth / px) + 1;
    const H = Math.ceil(window.innerHeight / px) + 1;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W * px + "px";
    canvas.style.height = H * px + "px";
    const ctx = canvas.getContext("2d");
    const fill = (c, x, y, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const ground = H - Math.ceil(groundCss / px);
    const horizon = ground - 4;

    // sky in bands, dithered where they meet
    const bands = T.sky.length;
    const bandH = horizon / bands;
    for (let b = 0; b < bands; b++) {
      const y0 = Math.round(b * bandH);
      const y1 = Math.round((b + 1) * bandH);
      fill(T.sky[b], 0, y0, W, y1 - y0);
      if (b < bands - 1) {
        for (let y = y1 - 2; y < y1; y++) {
          for (let x = (y % 2); x < W; x += 2) fill(T.sky[b + 1], x, y);
        }
        for (let x = (y1 % 2) + 1; x < W; x += 4) fill(T.sky[b], x, y1);
      }
    }
    fill(T.sky[bands - 1], 0, Math.round(horizon), W, ground - Math.round(horizon));

    const rand = seeded(7);

    if (T.stars) {
      for (let i = 0; i < (W * horizon) / 70; i++) {
        const x = Math.floor(rand() * W);
        const y = Math.floor(rand() * horizon * 0.8);
        const big = rand() < 0.1;
        const c = rand() < 0.3 ? "#fff3b0" : "#dfe6ff";
        fill(c, x, y);
        if (big) { fill(c, x - 1, y); fill(c, x + 1, y); fill(c, x, y - 1); fill(c, x, y + 1); }
      }
    }

    // sun or moon
    const bx = Math.round(T.body.x * W);
    const by = Math.round(T.body.y * horizon);
    const r = T.body.r;
    const disc = new Grid(r * 2 + 3, r * 2 + 3);
    if (T.body.kind === "sun") {
      disc.ellipse(r + 1, r + 1, r, r, T.body.c);
      disc.ellipse(r + 1 - r * 0.25, r + 1 - r * 0.25, r * 0.55, r * 0.55, T.body.core);
    } else {
      disc.ellipse(r + 1, r + 1, r, r, "#f4ecc2");
      disc.ellipse(r + 3.4, r - 0.6, r * 0.85, r * 0.85, null);
      disc.px([[r - 2, r + 2], [r - 1, r + 4], [r - 3, r - 1]], "#d8cd98");
    }
    const discCanvas = disc.canvas();
    ctx.drawImage(discCanvas, bx - r - 1, by - r - 1);

    const drawPlace = place && PLACES[place];
    if (drawPlace) {
      const bar = drawPlace({
        fill, W, H, ground, horizon, rand,
        glowAt: (x, y, r, c) => glow(fill, x, y, r, c),
        moon: { x: bx, y: by },
        base: Math.round(window.innerHeight / px - stand),
        mid: Math.round(window.innerWidth / px / 2),
      });
      return { W, H, ground, sky: bar || T.sky[0] };
    }

    // far hills
    const ridge = (x, base, amp, f1, f2, ph) =>
      Math.round(base - amp * (0.6 * Math.sin(x * f1 + ph) + 0.4 * Math.sin(x * f2 + ph * 2.3)));
    for (let x = 0; x < W; x++) {
      const top = ridge(x, horizon - 14, 7, 0.045, 0.11, 1.3);
      fill(T.far, x, top, 1, ground - top);
    }
    // near hills with a few round trees
    const nearTop = [];
    for (let x = 0; x < W; x++) {
      const top = ridge(x, ground - 5, 5, 0.07, 0.16, 4.1);
      nearTop[x] = top;
      fill(T.near, x, top, 1, ground - top);
    }
    const trees = new Grid(W, H);
    for (let x = 6; x < W - 4; x += 11 + Math.floor(rand() * 9)) {
      const t = nearTop[x];
      const s = 2.6 + rand() * 1.6;
      trees.rect(x, t - 3, 1, 4, T.fenceDk);
      trees.ellipse(x, t - 3 - s, s, s * 1.1, T.tree);
    }
    const treeLine = T.stars ? "#0a171a" : "#24401f";
    trees.outline(treeLine);
    trees.tint((x, y, v) => v === T.tree && trees.get(x - 1, y - 1) === treeLine, T.treeHi);
    ctx.drawImage(trees.canvas(), 0, 0);

    // grass
    fill(T.grass, 0, ground, W, H - ground);
    for (let i = 0; i < W * (H - ground) / 14; i++) {
      const x = Math.floor(rand() * W);
      const y = ground + 2 + Math.floor(rand() * (H - ground - 2));
      fill(T.grassDk, x, y);
      fill(T.grassDk, x - 1, y + 1);
      fill(T.grassDk, x + 1, y + 1);
    }
    fill(T.grassDk, 0, ground, W, 1);

    if (T.flowers) {
      const cols = ["#fbf6ec", "#f58aa8", "#ffd84a", "#b79af0"];
      for (let i = 0; i < W / 5; i++) {
        const x = Math.floor(rand() * W);
        const y = ground + 3 + Math.floor(rand() * (H - ground - 5));
        fill(cols[i % cols.length], x, y);
      }
    }

    // fence along the back of the yard
    const railY = [ground - 6, ground - 3];
    railY.forEach((y) => { fill(T.fence, 0, y, W, 2); fill(T.fenceDk, 0, y + 2, W, 1); });
    for (let x = 3; x < W; x += 12) {
      fill(T.fence, x, ground - 9, 2, 10);
      fill(T.fenceDk, x + 2, ground - 8, 1, 9);
      fill(T.fenceDk, x, ground - 9, 2, 1);
    }

    if (T.lights) {
      const bulbs = ["#ff6b6b", "#ffd84a", "#6bd0ff", "#9bff7a", "#ff9df0"];
      for (let x = 1, i = 0; x < W; x += 4, i++) {
        const sag = Math.round(Math.sin(((x % 24) / 24) * Math.PI) * 2);
        const y = ground - 11 + sag;
        fill("#2a2030", x, y - 1);
        fill(bulbs[i % bulbs.length], x, y);
        fill(bulbs[i % bulbs.length] + "55", x - 1, y);
        fill(bulbs[i % bulbs.length] + "55", x + 1, y);
        fill(bulbs[i % bulbs.length] + "55", x, y + 1);
      }
      // paper lanterns hanging from the string
      for (let x = 10, i = 0; x < W - 4; x += 22, i++) {
        const sag = Math.round(Math.sin(((x % 24) / 24) * Math.PI) * 2);
        const y = ground - 10 + sag;
        const body = i % 2 ? "#f6c23e" : "#e2503c";
        const glow = i % 2 ? "#fff0a0" : "#ffb08a";
        fill("#2a2030", x + 1, y, 1, 2);
        fill(glow + "40", x - 1, y + 1, 5, 7);
        fill("#2a2030", x, y + 2, 3, 1);
        fill(body, x, y + 3, 3, 4);
        fill(glow, x + 1, y + 4, 1, 2);
        fill("#2a2030", x, y + 7, 3, 1);
      }
      // lantern posts out in the yard, where the grass stays in view
      for (let i = 0, n = Math.max(3, Math.round(W / 40)); i < n; i++) {
        const x = Math.round(((i + 0.5) / n) * W);
        if (Math.abs(x - W / 2) < 30) continue; // leave the two of them clear
        const y = ground + 3 + (i % 2) * 3;
        const body = i % 2 ? "#e2503c" : "#f6c23e";
        const glow = i % 2 ? "#ffb08a" : "#fff0a0";
        fill(glow + "30", x - 2, y - 1, 7, 8);
        fill("#2a2030", x + 1, y + 6, 1, 7);
        fill("#2a2030", x, y, 3, 1);
        fill(body, x, y + 1, 3, 4);
        fill(glow, x + 1, y + 2, 1, 2);
        fill("#2a2030", x, y + 5, 3, 1);
      }
    }

    return { W, H, ground, sky: T.sky[0] };
  }

  /* ---------- Hand everything to the page ---------- */

  const url = (g) => `url("${g.url()}")`;

  function install() {
    const root = document.documentElement.style;
    const set = (name, g) => root.setProperty(name, url(g));
    set("--img-frame", FRAMES.dialog());
    set("--img-frame-gold", FRAMES.gold());
    set("--img-photo", FRAMES.photo());
    set("--img-plate", FRAMES.plate());
    set("--img-slot", FRAMES.slot());
    set("--img-bubble", FRAMES.bubble());
    set("--img-sign", FRAMES.sign());
    set("--img-portrait", FRAMES.portrait());
    Object.entries(BUTTONS).forEach(([name, make]) => set("--img-btn-" + name, make()));
    Object.entries(SPRITES).forEach(([name, make]) => set("--img-" + name, make()));
    Object.entries(ITEMS).forEach(([name, make]) => set("--img-item-" + name, make()));
    Object.entries(EMOTES).forEach(([name, make]) => set("--img-emote-" + name, make()));
    set("--img-flower-lily", flower(0, 2));
    set("--img-flower-pink", flower(1, 2));
    set("--img-flower-sun", flower(2, 2));
    set("--img-leaf", leafSprite(0));
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = SPRITES.heart().url();
    document.documentElement.classList.add("px-ready");
  }

  window.Pixel = {
    Grid, fromRows, cat, person, portrait, flower, leafSprite, cloud, scene, seeded,
    heart: () => SPRITES.heart(),
    heartSmall: () => SPRITES.heartSmall(),
    sun: () => SPRITES.sun(),
    moon: () => SPRITES.moon(),
    FLOWER_COUNT: FLOWER_COLORS.length,
    TIMES,
  };

  install();
})();
