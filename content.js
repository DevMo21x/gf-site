/* ==========================================================================
   ✏️  EDIT THE WORDS HERE
   Everything she reads lives in this one object.
   Wrap a word in *asterisks* to make it red, e.g. "*angel*".
   ========================================================================== */

const CONTENT = {
  // the link preview (title, description, image) is in index.html's <head>: crawlers don't run this file
  pageTitle: "For Gabrielle",

  // The start menu
  title: {
    logo: "For Gabrielle",
    ribbon: "Love from 2000km away",
    greeting: "My sweet angel… every pixel of this was made thinking about you. Turn your sound on and come play with me <3.",
    plaque: "Starring: you",
    play: "Play",
    load: "Load game",
    credits: "Credits",
    // what the cats say when she taps "Load game"
    loadJoke: { tufo: "no saves. you get ONE try.", mei: "just press Play!" },
    // …and once she's said yes, "Load game" takes her back to the farm
    loadSaved: { tufo: "ugh. fine. you have a save now.", mei: "welcome home, darling." },
    creditsTitle: "Credits",
    creditsLines: [
      "Made by Mohaimen, with love",
      "Starring Gabrielle, Mohaimen, Mei and Tufo",
      "Tufo did not agree to be in this",
    ],
    back: "Back",
  },

  mohaimen: { name: "Mohaimen" },
  gabrielle: { name: "Gabrielle" },

  // the sign that drops in when a memory takes them somewhere else (the clock gives the time)
  places: {
    airport: "The airport",
    docks: "The docks of Halifax",
    airbnb: "Our Airbnb",
  },

  // The memories he shows her. item: the little picture that pops up (nervous, jacket, shawarma)
  memories: [
    {
      item: "nervous",
      title: "The first time I saw you in *person*",
      body: "Our first time meeting in person, and how nervous I was. So, so nervous. Worth every second of it.",
    },
    {
      item: "jacket",
      title: "Me, you, my jacket, and the docks of *Halifax*",
      body: "Our cute, intense little moment over my jacket on the docks of Halifax. I still think about it.",
    },
    {
      item: "shawarma",
      title: "Leftover shawarma, *late* at night",
      body: "Eating the leftover shawarma while watching CaseOh late at night. Honestly one of my favourite kinds of night.",
    },
  ],

  loves: {
    items: [
      "You're the funniest girl I've ever met in my life.",
      "You're kind-hearted, gentle and caring with every living organism around you.",
      "You're thoughtful, and the most beautiful girl on this whole hooooole planet!",
    ],
  },

  /* ---------- The conversation ----------
     One beat per hour of the day (dawn, morning, noon, afternoon, sunset, night).
     A beat is a list of lines, played in order:
       { mo: "…", face: "…" }         Mohaimen says something. face: neutral, nervous, happy, blush, soft, shocked
       { memory: 0, face: "…" }       He shows her a memory (from memories above), with its item
       { quiz: "…", answers: [ … ], correct: 0 }
                                      A question. correct is the number of the right answer (0 = first).
                                      The answers get shuffled, so the right one isn't always first.
                                      Add right: "…" / wrong: "…" for his own reaction, or leave them out
                                      and he picks one from quiz.right / quiz.wrong below.
       { mei: "…" } / { tufo: "…" }   A cat chimes in (it doesn't wait for a tap)
       { tufo: "…", knock: true }     Tufo knocks the dialogue box crooked
       { loves: true }                He tells her the three things he loves (loves.items above)
       { plant: true }                He gives her a seed to plant (garden below). It grows all day
       { stars: true }                She joins up stars in the night sky (stars below)
     A beat can also have place: "airport" | "docks" | "airbnb": the farm turns into that place
     for the whole beat (drawn in js/art/pixels.js, PLACES). In the Airbnb the two of them sit on the bed.
     A right answer fills a heart, a wrong one breaks one. Ten hearts and he asks the question.
     Zero hearts and… well. */
  story: [
    // 6:10am
    {
      lines: [
        { mo: "Oh! Gabrielle! Hi. Hey. Good morning. Hi.", face: "nervous" },
        { mei: "psst… he's been out here since 5am. I've been out here since 5:05. for the lighting." },
        { plant: true },
        { mo: "Okay. I'm going to ask you some questions. Every right answer, my heart gets fuller. Every wrong one… let's not talk about that.", face: "nervous" },
        { quiz: "First one. What do you call me?", answers: ["Sand person", "Sunshine", "Farm boy"], correct: 0,
          right: "Sand person. Correct. Unfortunately." },
      ],
    },
    // 9:00am, at the airport
    {
      place: "airport",
      lines: [
        { memory: 0, face: "blush" },
        { tufo: "he was SO nervous. pathetic." },
        { quiz: "The first time we met in person, how was I?", answers: ["So, so nervous", "Totally chill", "Asleep"], correct: 0,
          right: "Shaking. I'm kind of shaking right now, honestly." },
      ],
    },
    // 12:30pm, on the docks of Halifax
    {
      place: "docks",
      lines: [
        { memory: 1, face: "soft" },
        { tufo: "oops. not sorry.", knock: true },
        { quiz: "Where was our jacket moment?", answers: ["The docks of Halifax", "A Tim Hortons", "The airport"], correct: 0,
          right: "Halifax. I still think about it." },
      ],
    },
    // 3:40pm, back at the Airbnb
    {
      place: "airbnb",
      lines: [
        { memory: 2, face: "happy" },
        { tufo: "and nobody saved me any" },
        { quiz: "What did we eat late at night?", answers: ["Leftover shawarma", "Fresh sushi", "Cereal"], correct: 0,
          right: "Leftover shawarma. Elite." },
        { mei: "shawarma? at 2am? I only eat off fine china, darling" },
      ],
    },
    // 6:50pm
    {
      lines: [
        { mo: "Okay. Can I tell you some things I love about you?", face: "soft" },
        { loves: true },
        { mei: "all true. almost as true as things about me." },
        { tufo: "eh. I'm funnier" },
        { quiz: "So which one is true?", answers: ["You're the funniest girl I've ever met", "You're mid, honestly", "Tufo is funnier"], correct: 0,
          right: "Exactly. Tufo is NOT funnier." },
      ],
    },
    // 10:20pm
    {
      lines: [
        { mo: "Okay. Okay okay okay.", face: "nervous" },
        { stars: true },
        { quiz: "What does Mei think of you?", answers: ["Mei approves of you", "Mei ignores you", "Mei bites you"], correct: 0,
          right: "She approves. And Mei is never wrong." },
      ],
    },
  ],

  // The quiz game around the questions above
  quiz: {
    start: 4,   // hearts he starts with (out of 10)
    // what he says when she's right or wrong, when a question has no right/wrong of its own
    right: ["Yes! Correct!", "You remembered!", "That's my girl.", "See, this is why I like you."],
    wrong: ["…no. That hurt a little.", "Wrong! My heart!", "Ouch. Okay. I'm fine. I'm fine.", "Did you forget?? Already??"],
    // Tufo, every time she gets one wrong
    tufo: ["HA.", "wrong. obviously.", "he's doomed", "do it again"],
    // the day is over but the hearts aren't full: he asks the missed ones again
    retry: "Wait. Not yet. I need a few more hearts before I ask. Let me try that one again…",
    // ten hearts
    full: "Ten hearts. That's all of them. Okay. Gabrielle…",
    // zero hearts
    boom: {
      rush: "Zero hearts?! Gabrielle, wait, I— I'm coming over there—",
      tufo: "worth it.",
      title: "Mohaimen and Gabrielle have *exploded*",
      body: "Zero hearts was too much for them both. Luckily, sand people respawn.",
      tryAgain: "Try again",
    },
  },

  // The seed she plants at dawn. It grows through the day and blooms right before he asks.
  garden: {
    variant: 0, // which flower it grows into: 0 white lily, 1 pink, 2 sunflower, 3 sweet pea, 4 blue jazz, 5 coral
    give: "Oh, and… here. A seed. Plant it with me? Let's see what it is by tonight.",
    plant: "Plant it",
    planted: "Okay. Now we wait. I'm very good at waiting. I'm not.",
    mei: "I'll guard it. mostly from Tufo.",
    bloom: "Look. It grew all day. Kind of like something else did.",
    // Mei, when she taps the lily on the farm
    tap: "careful. that's OUR flower now.",
  },

  // Connect the stars, at night. points: where each star sits (x, y in % of a small box
  // in the sky), in the order she joins them. The last one joins back to the first.
  stars: {
    intro: "Look up. See those stars? Connect them for me. In order. I checked.",
    label: "Star {n} of {total}",
    done: "…yeah. That's what I see too, every time I think about you.",
    points: [[50, 94], [18, 62], [6, 30], [26, 6], [50, 26], [74, 6], [94, 30], [82, 62]],
  },

  // The bouquet he gives her right before he asks (on the farm, that's how dating starts)
  bouquet: {
    give: "…I brought you these. Out here on the farm, a bouquet means *something*.",
    // her relationship status on the celebration page
    status: "Status: Dating",
  },

  question: {
    lead: "Gabrielle Doney,",
    title: "Will you be my *girlfriend*?",
    yes: "Yes",
    // The No button cycles through these every time it runs away
    no: ["No", "Are you sure?", "Really?", "Think again", "Nope, try Yes", "Bruh"],
    // after Tufo sits on the No button long enough, it gets up as this
    noBecomesYes: "Yes (obviously)",
  },

  celebration: {
    title: "Sand person *achievement unlocked*",
    body: "Got the girl. Now the real mistakes begin.",
    signoff: "Mohaimen, your new owner :)",
  },

  // The letter that floats down after she says yes. Write the real thing here.
  // body is a list of paragraphs; *word* makes a word red.
  letter: {
    envelope: "A letter for you",
    title: "Dear Gabrielle,",
    body: [
      "TODO: write the first paragraph here.",
      "TODO: and the second one. As many as you like.",
    ],
    signoff: "Mohaimen",
    close: "Keep it",
  },

  // Secrets for the curious
  eggs: {
    // tap the moon at night
    moon: {
      label: "Make a wish on the moon",
      wish: ["a shooting star! quick, make a wish.", "wish granted. probably. I have connections.", "I wished for tuna. don't tell."],
    },
    // tap Mohaimen twice
    kiss: {
      label: "Kiss Mohaimen",
      mei: "get a room. not MY room.",
      tufo: "gross.",
    },
    // type "sand person" anywhere
    sand: {
      tufo: "great. now I'm itchy.",
      mei: "sand?? in MY fur??",
    },
  },

  // After she says yes: the farm, to play around on
  farm: {
    stay: "Stay on the farm",
    hint: "The festival's still on. Tap around, everyone's here. Tap the sky, too.",
    letter: "Letter",
    menu: "Play again",
  },

  // Little Stardew-style achievements for the secrets. Counted in Credits.
  // hint: what Credits shows while one is still locked
  achievements: {
    toast: "Achievement unlocked",
    found: "Secrets found: {n}/{total}",
    locked: "???",
    list: {
      mei: { title: "Cat whisperer", hint: "Mei wants more pets." },
      tufo: { title: "Tufo tolerated you", hint: "keep trying with the mean one." },
      moon: { title: "Wished on the moon", hint: "look up at night." },
      sand: { title: "Certified sand person", hint: "type what you call me." },
      kiss: { title: "Smooch", hint: "he looks kissable. tap tap." },
      stars: { title: "Stargazer", hint: "stay up late with me." },
      no: { title: "Caught the No button", hint: "impossible. obviously." },
    },
    // every secret found: a golden moment, once
    complete: {
      title: "Every secret found",
      line: "{n} of {total}. You know us too well, darling.",
      mei: "I always knew you'd find them all.",
      tufo: "fine. you're… acceptable.",
    },
  },

  photos: {
    title: { src: "assets/images/us-cheek.webp", alt: "Gabrielle and Mohaimen cheek to cheek under the trees, smiling" },
    celebration: { src: "assets/images/us-cake.webp", alt: "Gabrielle holding a slice of cake next to Mohaimen doing a peace sign" },
  },

  sound: {
    mute: "Mute music",
    unmute: "Play music",
  },

  // The clock in the corner: one day on the farm, a little later with every beat
  hud: {
    day: "Sat.",
    times: ["6:10am", "9:00am", "12:30pm", "3:40pm", "6:50pm", "10:20pm", "11:50pm"],
  },

  // Friendship hearts, read aloud to screen readers
  hearts: "Friendship with Mohaimen: {n} of 10 hearts",

  // Mei the cat: everything she says
  mei: {
    label: "Mei the cat. Tap to pet her. She expects it.",
    hint: "psst… you may pet me. you're welcome.",
    hello: "hi. I'm Mei. yes, THE Mei.",
    purr: "prrrr… don't stop. I didn't say stop.",
    blink: "*slow blink* (you've been blessed. no photos.)",
    lines: [
      "left side. it's my good side.",
      "did I SAY you could stop?",
      "Mei approves of you. don't make it weird.",
      "I woke up like this",
      "you smell like shawarma. unacceptable.",
      "I'm the main character. you're the love interest.",
      "no photos. okay ONE photo.",
      "my fur costs more than his car",
    ],
    // things she says when these screens open
    pages: {
      question: "say yes, darling. I didn't do my fur for nothing.",
      yay: "I'd like to thank me. mostly me.",
      farm: "stay as long as you like. I'm not going anywhere.",
    },
    dodge: ["hehe, the drama", "that button has no star power", "the big one, sweetie. the BIG one"],
    startled: "EXCUSE me??",
    // when Tufo gets his stuffed cat out
    sitOnNo: "finally, he's useful.",
    plush: ["EW. not in front of me.", "I'm calling my agent.", "this is beneath me. literally.", "I need a new brother. and a spa day."],
  },

  // Tufo the cat: white, pink-eyed, mean. Everything he says.
  tufo: {
    label: "Tufo the cat. He does not like being touched.",
    intro: "I'm Tufo. I don't do cute.",
    hello: "don't. touch. me.",
    hiss: ["hsssss", "back OFF", "I bite. hard."],
    swat: ["*swat*", "no touching", "that was a warning"],
    ignore: "I'm ignoring you now",
    rude: ["your hands are cold", "mid petting, honestly", "I was here first", "don't look at me", "go pet the other one"],
    allow: "…fine. ONE pet.",
    allowAfter: "okay that's enough",
    jealous: ["why does SHE get pets", "ew. affection.", "Mei is a diva and a narc"],
    // Kevin, his stuffed cat. Sometimes he gets him out and… gets busy
    plush: {
      start: ["don't look. this is private.", "me and Kevin need a minute.", "avert your eyes, human."],
      during: ["Kevin knows what he did.", "this is cardio. mind your business.", "*aggressive biscuits*"],
      end: ["…what. it's cardio.", "Kevin and I are done. for now.", "you saw nothing."],
      caught: ["DO YOU MIND.", "can't a cat have ONE moment", "KNOCK first??"],
    },
    hissAtMei: "hsss. MY human.",
    // things he says when these screens open
    pages: {
      question: "press No. I dare you.",
      yay: "ugh. fine. welcome, I guess",
      farm: "you're still here? …fine. stay.",
    },
    // the No button runs out of steam and he sits on it
    sitOnNo: {
      go: "mine.",
      sit: "this button is taken. forever.",
      off: "there. fixed it for you.",
    },
    dodge: ["HA. coward button", "even No is scared of you", "just press it. oh wait."],
    // when he chases Mei around (like he does at home)
    chase: {
      start: ["zoomies.", "RUN, Mei.", "tag. you're it."],
      end: ["that's cardio.", "she started it", "I let her win"],
      meiStart: "NOT THE FUR!!",
      meiEnd: "he does this EVERY day. I'm suing.",
    },
  },

  // Background music. Swap the file in /assets/audio and change src to use another song.
  music: {
    src: "assets/audio/gymnopedie.m4a",
    volume: 1,     // 0–1 (the file itself is already mixed soft; iPhones ignore this and play at 1)
    startAt: 0,    // seconds into the song to begin from
    credit: "Music: original cozy farm loop in the spirit of Stardew Valley",
  },
};
