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
       { gift: "dawn" }               She picks a gift for him from her bag (gifts below). The ones he
                                      loves fill hearts; the rest break one
       { moment: "heart" }            A little thing she does with her fingers, against the clock (moments below):
                                      "heart" calms his heart, "jacket" gets her his jacket back from Tufo,
                                      "shawarma" catches falling shawarma before Tufo eats it.
                                      In time: two hearts. Too slow: one breaks
       { mei: "…" } / { tufo: "…" }   A cat chimes in (it doesn't wait for a tap)
       { tufo: "…", knock: true }     Tufo knocks the dialogue box crooked
       { loves: true }                He tells her the three things he loves (loves.items above)
       { plant: true }                He gives her a seed to plant (garden below). It grows all day
       { stars: true }                She joins up stars in the night sky (stars below). It fills the rest of the hearts
     A beat can also have place: "airport" | "docks" | "airbnb": the farm turns into that place
     for the whole beat (drawn in js/art/pixels.js, PLACES). In the Airbnb the two of them sit on the bed.
     He starts with heartsAtStart hearts. Ten and he asks the question.
     Zero and… well (boom below). */
  story: [
    // 6:10am
    {
      lines: [
        { mo: "Oh! Gabrielle! Hi. Hey. Good morning. Hi.", face: "nervous" },
        { mei: "psst… he's been out here since 5am. I've been out here since 5:05. for the lighting." },
        { plant: true },
        { mo: "Okay. Farm rules: you give someone a gift, their heart fills up. I didn't make that up. I did make that up.", face: "nervous" },
        { gift: "dawn" },
      ],
    },
    // 9:00am, at the airport
    {
      place: "airport",
      lines: [
        { memory: 0, face: "blush" },
        { tufo: "he was SO nervous. pathetic." },
        { moment: "heart" },
      ],
    },
    // 12:30pm, on the docks of Halifax
    {
      place: "docks",
      lines: [
        { memory: 1, face: "soft" },
        { tufo: "oops. not sorry.", knock: true },
        { moment: "jacket" },
      ],
    },
    // 3:40pm, back at the Airbnb
    {
      place: "airbnb",
      lines: [
        { memory: 2, face: "happy" },
        { tufo: "and nobody saved me any" },
        { moment: "shawarma" },
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
        { gift: "sunset" },
      ],
    },
    // 10:20pm
    {
      lines: [
        { mo: "Okay. Okay okay okay.", face: "nervous" },
        { stars: true },
      ],
    },
  ],

  // The gifts in her bag. item: its picture (drawn in js/art/pixels.js, ITEMS);
  // hearts: 2 for the ones he loves, 1 for the rest; mei / tufo: what a cat says about it
  gifts: {
    dawn: {
      ask: "So… did you bring me anything?",
      options: [
        { item: "rtx", label: "An RTX 5090", hearts: 2, face: "happy",
          reply: "An RTX 5090?? For ME?? Okay. I'm keeping you. And it." },
        { item: "rock", label: "A very nice rock", hearts: -1, face: "shocked",
          reply: "…a rock. Cool. Cool cool cool. I'll treasure it. I won't." },
        { item: "tufo", label: "Tufo", hearts: -1, face: "shocked",
          reply: "He bit me. He bit me and he's looking at me like I owe him money.", tufo: "I'm not a gift. I'm a warning." },
      ],
    },
    sunset: {
      ask: "Okay… your turn. Got anything else in that bag?",
      options: [
        { item: "shawarma", label: "The last bite of shawarma", hearts: 2, face: "happy",
          reply: "You saved me the LAST BITE?? That's love. That's actual love.", tufo: "traitor." },
        { item: "hug", label: "A big hug", hearts: 2, face: "blush",
          reply: "…okay, I'm not letting go. We live here now." },
        { item: "mei", label: "Mei", hearts: -1, face: "shocked",
          reply: "She sat down, looked at me, and left. I think I just got rejected by a cat.", mei: "I'm not a gift, darling. I'm a treasure." },
      ],
    },
  },

  // The little things she does with her fingers, one per memory
  moments: {
    // at the airport: his heart is racing, she taps it calm
    heart: {
      ask: "Seeing you again… my heart's doing the airport thing. It's going crazy. Can you calm it down?",
      hint: "Tap his heart to calm it down",
      taps: 5,
      seconds: 6,
      slow: "Too slow… it's still racing. I think I'm dying a little.",
      done: "…better. It's still beating fast, but that part's just you.",
      mei: "there. he's normal now. ish.",
    },
    // on the docks: he gives her his jacket, Tufo steals it, she gets it back
    jacket: {
      ask: "It's freezing out here. Here, take my jacket.",
      hint: "Tap the jacket to put it on",
      steal: "mine now.",
      chase: "Catch Tufo and tap him: {n} left",
      taps: 3,
      seconds: 12,
      dodge: ["nope.", "too slow."],
      slow: "Tufo has my jacket now. Tufo lives in my jacket now.",
      slowTufo: "it's mine. I live here.",
      caught: "fine. it smells like sand anyway.",
      done: "It looks better on you. It always did.",
    },
    // at the Airbnb: shawarma bites fall, she catches them before Tufo does
    shawarma: {
      ask: "Leftover shawarma, CaseOh on the TV. Quick, catch the bites before Tufo gets them!",
      hint: "Catch the shawarma: {n} of {total}",
      label: "Catch the shawarma bite",
      goal: 5,
      seconds: 14,
      stolen: ["MINE.", "delicious.", "thank you for your service."],
      slow: "…Tufo ate all of it. Every bite. He's lying down now.",
      slowTufo: "worth it.",
      done: "Elite. Honestly the best date night I've ever had.",
    },
  },

  // hearts he starts the day with
  heartsAtStart: 2,

  // zero hearts: he runs to her and they both blow up
  boom: {
    rush: "Zero hearts?! Gabrielle, wait, I— I'm coming over there—",
    tufo: "worth it.",
    title: "Mohaimen and Gabrielle have *exploded*",
    body: "Zero hearts was too much for them both. Luckily, sand people respawn.",
    tryAgain: "Try again",
  },

  // ten hearts: the night is almost over
  ending: "Ten hearts. That's all of them. Okay. Gabrielle…",

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
      boom: { title: "Kaboom", hint: "let his hearts run all the way out." },
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
