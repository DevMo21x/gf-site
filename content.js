/* ==========================================================================
   ✏️  EDIT THE WORDS HERE
   Everything she reads lives in this one object.
   Wrap a word in *asterisks* to make it red, e.g. "*angel*".
   ========================================================================== */

const CONTENT = {
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
    creditsTitle: "Credits",
    creditsLines: [
      "Made by Mohaimen, with love <3",
      "Starring Gabrielle, Mohaimen, Mei and Tufo",
      "Tufo did not agree to be in this",
    ],
    back: "Back",
  },

  mohaimen: { name: "Mohaimen" },

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
     A right answer fills a heart, a wrong one breaks one. Ten hearts and he asks the question.
     Zero hearts and… well. */
  story: [
    // 6:10am
    {
      lines: [
        { mo: "Oh! Gabrielle! Hi. Hey. Good morning. Hi.", face: "nervous" },
        { mei: "psst… he's been out here since 5am. I've been out here since 5:05. for the lighting." },
        { mo: "Okay. I'm going to ask you some questions. Every right answer, my heart gets fuller. Every wrong one… let's not talk about that.", face: "nervous" },
        { quiz: "First one. What do you call me?", answers: ["Sand person", "Sunshine", "Farm boy"], correct: 0,
          right: "Sand person. Correct. Unfortunately." },
        { quiz: "What time did I get out here this morning?", answers: ["5am", "Noon", "I never went to bed"], correct: 0,
          right: "5am. Mei told you, didn't she. Snitch." },
        { quiz: "How far apart do we live?", answers: ["About 2000km", "About 20km", "Same street"], correct: 0,
          right: "2000km. Way too far. Still worth it." },
      ],
    },
    // 9:00am
    {
      lines: [
        { memory: 0, face: "blush" },
        { tufo: "he was SO nervous. pathetic." },
        { quiz: "The first time we met in person, how was I?", answers: ["So, so nervous", "Totally chill", "Asleep"], correct: 0,
          right: "Shaking. I'm kind of shaking right now, honestly." },
        { quiz: "Which cat is the mean one?", answers: ["Tufo", "Mei", "They're both angels"], correct: 0,
          right: "Tufo. Obviously Tufo." },
      ],
    },
    // 12:30pm
    {
      lines: [
        { memory: 1, face: "soft" },
        { tufo: "oops. not sorry.", knock: true },
        { quiz: "Where was our jacket moment?", answers: ["The docks of Halifax", "A Tim Hortons", "The airport"], correct: 0,
          right: "Halifax. I still think about it." },
        { quiz: "And whose jacket was it?", answers: ["Mine", "Yours", "Tufo's"], correct: 0,
          right: "Mine. Well. Basically yours now." },
      ],
    },
    // 3:40pm
    {
      lines: [
        { memory: 2, face: "happy" },
        { tufo: "and nobody saved me any" },
        { quiz: "What did we eat late at night?", answers: ["Leftover shawarma", "Fresh sushi", "Cereal"], correct: 0,
          right: "Leftover shawarma. Elite." },
        { quiz: "Who were we watching?", answers: ["CaseOh", "MrBeast", "The news"], correct: 0,
          right: "CaseOh. The third wheel. A very funny third wheel." },
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
        { quiz: "What colour are Tufo's eyes?", answers: ["Pink", "Green", "Blue"], correct: 0,
          right: "Pink. Evil pink." },
      ],
    },
    // 10:20pm
    {
      lines: [
        { mo: "Okay. Okay okay okay.", face: "nervous" },
        { quiz: "What does Mei think of you?", answers: ["Mei approves of you", "Mei ignores you", "Mei bites you"], correct: 0,
          right: "She approves. And Mei is never wrong." },
        { quiz: "What's the best kind of night?", answers: ["Shawarma and CaseOh with you", "Doing taxes", "Any night without you"], correct: 0,
          right: "Top three nights ever. Maybe top one." },
      ],
    },
  ],

  // The quiz game around the questions above
  quiz: {
    start: 2,   // hearts he starts with (out of 10)
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

  question: {
    lead: "Gabrielle Doney,",
    title: "Will you be my *girlfriend*?",
    yes: "Yes",
    // The No button cycles through these every time it runs away
    no: ["No", "Are you sure?", "Really?", "Think again", "Nope, try Yes", "Bruh"],
  },

  celebration: {
    title: "Sand person *achievement unlocked*",
    body: "Got the girl. Now the real mistakes begin.",
    signoff: "Mohaimen, your new owner :)",
    replay: "Play again",
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
    },
    dodge: ["hehe, the drama", "that button has no star power", "the big one, sweetie. the BIG one"],
    startled: "EXCUSE me??",
    // when Tufo gets his stuffed cat out
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
