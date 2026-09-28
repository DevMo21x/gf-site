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
  };

  /* ---------- The crop that grows one stage per page ---------- */

  function crop(stage) {
    const g = new Grid(18, 26);
    const soil = "#8a5a2b";
    const soilDk = "#6b4220";
    g.ellipse(9, 23, 7.6, 2.2, soil);
    const top = [21, 19, 16, 13, 11, 9, 9][stage];
    if (stage >= 1) g.line(9, 21, 9, top, LEAF);
    const leaf = (y, dir, s = 1) => g.ellipse(9 + dir * (2 * s), y, 1.9 * s, 0.9 * s, LEAF, dir * -0.5);
    if (stage === 1) { g.set(8, 19, LEAF); g.set(10, 19, LEAF); }
    if (stage >= 2) { leaf(19, -1); leaf(19, 1); }
    if (stage >= 3) { leaf(16, -1, 1.2); leaf(15, 1, 1.2); }
    if (stage >= 4) { leaf(12.5, -1, 1.1); leaf(12, 1, 1.1); }
    if (stage === 5) {
      g.ellipse(9, 7.5, 1.4, 2, "#f06a8a");
      g.px([[8, 9], [10, 9]], LEAF);
    }
    if (stage >= 6) {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        g.ellipse(9 + Math.cos(a) * 3, 6 + Math.sin(a) * 3, 1.9, 1.9, "#f4879c");
      }
      g.ellipse(9, 6, 1.6, 1.6, GOLD);
    }
    g.outline(K);
    g.px([[4, 23], [7, 22], [11, 24], [14, 23], [9, 24]], soilDk);
    if (stage === 0) g.px([[7, 22], [11, 22]], "#f3dfa8");
    if (stage >= 2) g.px([[7, 18], [11, 18]], LEAF_HI);
    if (stage >= 3) g.px([[6, 15], [12, 14]], LEAF_HI);
    if (stage >= 6) {
      g.px([[7, 2], [13, 4], [5, 8]], "#ffc2cf");
      g.px([[8, 5], [9, 5]], GOLD_HI);
    }
    return g;
  }

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
  function scene(canvas, time, px, groundCss) {
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

    // tilled patch where the crop grows
    const cx = Math.round(W / 2);
    const patchW = 20;
    fill(T.soil, cx - patchW / 2, H - 8, patchW, 7);
    for (let x = cx - patchW / 2; x < cx + patchW / 2; x += 2) fill(T.fenceDk, x, H - 5);
    fill(T.fenceDk, cx - patchW / 2, H - 8, patchW, 1);

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
        if (Math.abs(x - W / 2) < 14) continue; // leave the crop patch clear
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
    Object.entries(BUTTONS).forEach(([name, make]) => set("--img-btn-" + name, make()));
    Object.entries(SPRITES).forEach(([name, make]) => set("--img-" + name, make()));
    Object.entries(ITEMS).forEach(([name, make]) => set("--img-item-" + name, make()));
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = SPRITES.heart().url();
    document.documentElement.classList.add("px-ready");
  }

  window.Pixel = {
    Grid, fromRows, cat, crop, flower, leafSprite, cloud, scene, seeded,
    heart: () => SPRITES.heart(),
    heartSmall: () => SPRITES.heartSmall(),
    sun: () => SPRITES.sun(),
    moon: () => SPRITES.moon(),
    FLOWER_COUNT: FLOWER_COLORS.length,
    TIMES,
  };

  install();
})();
