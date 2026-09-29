# Architecture

A single-page, Stardew-style dialogue game that asks Gabrielle to be Mohaimen's girlfriend. Plain HTML, CSS and JavaScript: no build step, no dependencies, no backend. It must run from `file://` as well as from Netlify, so every script is a classic `<script defer>`, not an ES module.

## 1. Project structure

```
gf-site/
├── index.html            # The only page. All screens live here; loads every CSS and JS file below
├── content.js            # EVERY word she reads (CONTENT). Edit copy here, nowhere else
├── assets/
│   ├── images/           # The two real photos (.webp)
│   └── audio/            # Background music tracks (.m4a)
├── css/                  # Loaded in this order; later files may override earlier ones
│   ├── base.css          # Design tokens (custom properties), @property, resets, base elements
│   ├── world.css         # The farm backdrop, HUD (clock, sound toggle), stage and pages
│   ├── components.css    # Reusable pieces: dialogue box, wooden buttons, picture frames
│   ├── screens.css       # Per-screen styles: start menu, talk, memory item, hearts, question, celebration
│   ├── characters.css    # Gabrielle and Mohaimen, the cats, full-screen canvases
│   └── responsive.css    # Small phones, larger screens, reduced motion
└── js/
    ├── art/pixels.js     # All pixel art drawn from code; exposes window.Pixel, sets --img-* CSS vars
    ├── core/
    │   ├── dom.js        # $, $$, reduced-motion check, art-pixel sizing helpers
    │   └── text.js       # CONTENT lookup, *red* markup, typewriter (Typer), renderContent()
    ├── world/
    │   ├── scene.js      # Sky and time of day (Scene)
    │   └── clock.js      # Clock in the corner (Clock)
    ├── ui/
    │   ├── pages.js      # Page transitions (Pages, arrive/depart, animate helpers)
    │   ├── meter.js      # Friendship hearts (Meter)
    │   └── dodge.js      # The No button that runs away (Dodge)
    ├── audio/music.js    # Background track + Web Audio sound effects (Music)
    ├── cats/
    │   ├── cat.js        # Shared cat machinery: sprite, speech bubble, moods (makeCat, Chatter)
    │   ├── mei.js        # Mei: sweet, follows you (Mei)
    │   └── tufo.js       # Tufo: mean, chases Mei (Tufo)
    ├── fx/
    │   ├── petals.js     # Falling hearts and confetti (Petals)
    │   ├── fireworks.js  # Celebration fireworks (Fireworks)
    │   └── lilies.js     # Flower burst after Play (Lilies)
    ├── story/
    │   ├── actors.js     # Gabrielle and Mohaimen on the grass, their faces (Actors, FACES)
    │   ├── portrait.js   # Mohaimen's portrait in the boxes (Portrait)
    │   ├── dialogue.js   # Dialogue box: his lines, her choices (Dialogue)
    │   ├── story.js      # Runs CONTENT.story beat by beat, quiz scoring (Story)
    │   └── boom.js       # Zero-hearts explosion and reset (Boom)
    └── main.js           # Boot: sound toggle, init calls, global click handler. Loaded last
```

## 2. How the pieces fit

```
index.html
  ├─ css/*            styles, reading --img-* sprites that pixels.js sets
  ├─ js/art/pixels.js ─► window.Pixel (sprites) + CSS custom properties
  ├─ content.js       ─► global CONTENT (all copy, photo and music paths)
  └─ js/**            game modules, sharing one global scope
        main.js ─► Scene/Pages/Mei/Tufo init ─► click "Play" ─► Lilies ─► Story
        Story ─► Dialogue + Meter + Actors + cats ─► 10 hearts: question page, 0 hearts: Boom
```

### Module rules

- Each game file declares its module as a top-level `const` (for example `const Music = (() => { … })();`). Classic scripts share one global scope, so later files can use earlier ones directly.
- **Load order matters.** A file can use anything loaded above it in `index.html` while it initialises. At runtime (in event handlers and timers) it can use anything. When you add a file, add a `<script defer>` tag in the right place.
- Top-level names must be unique across all files. A duplicate `const` throws a SyntaxError and stops the page.
- Put each file's public surface in the object its IIFE returns, and keep helpers inside the IIFE.
- Copy never goes in JS or HTML. Add it to `content.js` and read it through `CONTENT`.

## 3. Content

`content.js` holds the start menu, memories, the story beats (lines, memories, quizzes, cat interjections), quiz reactions, the question, the celebration, every cat line, photo paths and the music path. The comment above `story` documents the beat format. Wrap a word in `*asterisks*` to make it red.

## 4. Deployment

Static hosting on Netlify: publish the repository root. There is no build. For local work, open `index.html` directly, or run `python3 -m http.server` in the root.

## 5. Constraints

- Classic scripts only (it must work from `file://`). Don't convert to ES modules without dropping that requirement.
- The only external request is Google Fonts (Pixelify Sans). All art is drawn in code, and the only binary files are the photos and the music.
- Respect `prefers-reduced-motion`. Every animated module checks `reducedMotion()`.

## 6. Tooling folders (gitignored)

`.impeccable/`, `.playwright-mcp/` and `graphify-out/` hold design reviews, browser logs and a code graph. They are not part of the site.

## 7. Project identification

- Project: For Gabrielle (gf-site)
- Owner: Mohaimen (DevMo21x)
- Last updated: 2026-09-29
