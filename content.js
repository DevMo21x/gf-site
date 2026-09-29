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
    ribbon: "a very short dating sim",
    greeting: "Hey my sweet beautiful *angel*… I made you a little game. Turn your sound on if you can.",
    plaque: "Starring: you",
    play: "Play",
    load: "Load game",
    credits: "Credits",
    // what the cats say when she taps "Load game"
    loadJoke: { tufo: "no saves. you get ONE try.", mei: "just press Play!" },
    creditsTitle: "Credits",
    creditsLines: [
      "Made by Mohaimen, nervously",
      "Starring Gabrielle, Mohaimen, Mei and Tufo",
      "Tufo did not agree to be in this",
      "Music: Gymnopédie No. 1 by Erik Satie, performed by Michael Laucke (public domain)",
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
       { choose: [ … ] }              She picks what to say. Each choice: { say: "…", reply: [ lines ], emote: "heart" }
       { mei: "…" } / { tufo: "…" }   A cat chimes in (it doesn't wait for a tap)
       { tufo: "…", knock: true }     Tufo knocks the dialogue box crooked
       { loves: true }                He tells her the three things he loves (loves.items above)
     Every choice fills a heart. After the last beat, he asks the question. */
  story: [
    // 6:10am
    {
      lines: [
        { mo: "Oh! Gabrielle! Hi. Hey. Good morning. Hi.", face: "nervous" },
        { mei: "psst… he's been out here since 5am" },
        { choose: [
          { say: "Hi, sand person.", emote: "note", reply: [
            { mo: "Six in the morning and you're already bullying me. …I missed you too.", face: "happy" },
          ] },
          { say: "Why are you sweating?", emote: "dots", reply: [
            { mo: "I'm not sweating. That's dew. Farm dew. A very normal farm thing.", face: "nervous" },
          ] },
          { say: "Are you okay??", emote: "exclaim", reply: [
            { mo: "Me? Totally fine! Why wouldn't I be fine. Ha. Ha. …ha.", face: "nervous" },
          ] },
        ] },
        { mo: "Okay. I have something I want to ask you. But first, can I show you a few things? It'll be quick. Probably.", face: "soft" },
      ],
    },
    // 9:00am
    {
      lines: [
        { memory: 0, face: "blush" },
        { tufo: "he was SO nervous. pathetic." },
        { choose: [
          { say: "You were SO nervous.", emote: "note", reply: [
            { mo: "I was shaking. I'm kind of shaking right now, honestly.", face: "nervous" },
          ] },
          { say: "I was nervous too.", emote: "heart", reply: [
            { mo: "Wait, really? Okay. That makes me feel so much better.", face: "happy" },
          ] },
          { say: "You hid it well.", emote: "dots", reply: [
            { mo: "Thank you for lying to me. That's love.", face: "happy" },
          ] },
        ] },
      ],
    },
    // 12:30pm
    {
      lines: [
        { memory: 1, face: "soft" },
        { tufo: "oops. not sorry.", knock: true },
        { choose: [
          { say: "I think about it too.", emote: "heart", reply: [
            { mo: "…Okay, you can't just say that. My heart can't take it this early in the day.", face: "blush" },
          ] },
          { say: "Is this about the jacket AGAIN?", emote: "dots", reply: [
            { mo: "It's a very important jacket. It has history now.", face: "happy" },
          ] },
          { say: "Can I keep it?", emote: "exclaim", reply: [
            { mo: "It's basically yours already. I'm just holding it for you.", face: "soft" },
          ] },
        ] },
      ],
    },
    // 3:40pm
    {
      lines: [
        { memory: 2, face: "happy" },
        { tufo: "and nobody saved me any" },
        { choose: [
          { say: "Best kind of night.", emote: "heart", reply: [
            { mo: "Right?? Top three nights ever. Maybe top one.", face: "happy" },
          ] },
          { say: "Was CaseOh the real date?", emote: "note", reply: [
            { mo: "He was the third wheel. A very funny third wheel.", face: "happy" },
          ] },
          { say: "Again tonight?", emote: "exclaim", reply: [
            { mo: "Say less. I'm already thinking about it.", face: "blush" },
          ] },
        ] },
        { mei: "I would've eaten that shawarma" },
      ],
    },
    // 6:50pm
    {
      lines: [
        { mo: "Okay. Can I tell you some things I love about you?", face: "soft" },
        { choose: [
          { say: "Go on…", emote: "heart", reply: [
            { mo: "Okay. Deep breath.", face: "nervous" },
          ] },
          { say: "Only if they're good.", emote: "dots", reply: [
            { mo: "They're so good. I checked them twice.", face: "happy" },
          ] },
          { say: "Obviously.", emote: "note", reply: [
            { mo: "Obviously. Okay. Here we go.", face: "blush" },
          ] },
        ] },
        { loves: true },
        { mei: "all true, I checked" },
        { tufo: "eh. I'm funnier" },
      ],
    },
    // 10:20pm
    {
      lines: [
        { mo: "Okay. Okay okay okay.", face: "nervous" },
        { choose: [
          { say: "Just say it, sand person.", emote: "note", reply: [
            { mo: "Right. Yes. Saying it. Right now.", face: "nervous" },
          ] },
          { say: "Take your time.", emote: "heart", reply: [
            { mo: "Thank you. You're the only person who makes me this nervous, you know that?", face: "blush" },
          ] },
          { say: "Are you… proposing?", emote: "exclaim", reply: [
            { mo: "What?! No! Not THAT. Something smaller. Still big. Medium.", face: "shocked" },
          ] },
        ] },
        { mo: "Gabrielle…", face: "soft" },
      ],
    },
  ],

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
    title: { src: "images/us-cheek.webp", alt: "Gabrielle and Mohaimen cheek to cheek under the trees, smiling" },
    celebration: { src: "images/us-cake.webp", alt: "Gabrielle holding a slice of cake next to Mohaimen doing a peace sign" },
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
    label: "Mei the cat. Tap to pet her.",
    hint: "psst… you can pet me",
    hello: "hi! I'm Mei",
    purr: "prrrrrr…",
    blink: "*slow blink* (that means I love you)",
    lines: ["mrrp?", "meow!", "Mei approves of you", "again. pet me again.", "you smell like shawarma", "I'm on your side"],
    // things she says when these screens open
    pages: {
      question: "psst… say yes",
      yay: "achievement unlocked!",
    },
    dodge: ["hehe, nope", "that button's shy", "try the big one"],
    startled: "eep!",
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
    jealous: ["why does SHE get pets", "ew. affection.", "Mei is a suck-up"],
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
      meiStart: "not again!!",
      meiEnd: "he does this EVERY day",
    },
  },

  // Background music. Swap the file in /audio and change src to use another song.
  music: {
    src: "audio/gymnopedie.m4a",
    volume: 1,     // 0–1 (the file itself is already mixed soft; iPhones ignore this and play at 1)
    startAt: 0,    // seconds into the song to begin from
    credit: "Music: Gymnopédie No. 1 by Erik Satie, performed by Michael Laucke (public domain)",
  },
};
