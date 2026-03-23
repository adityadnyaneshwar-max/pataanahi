
const OFFLINE_MODE = process.argv.includes("--offline");

const PARTY_ALIASES = {
  dmk: ["DMK", "DMK alliance", "DMK-led alliance", "DMK+"],
  bjpAlliance: [
  dmk: ["DMK", "DMK alliance", "DMK-led alliance", "DMK+"],
  bjpAlliance: [
    "BJP alliance",
    "BJP-led alliance",
    "NDA",
    "AIADMK-led alliance",
    "AIADMK alliance",
    "AIADMK+"
  ],
  tvk: ["TVK", "Vijay's TVK", "Tamizhaga Vettri Kazhagam"],
  ],
  tvk: ["TVK", "Vijay's TVK", "Tamizhaga Vettri Kazhagam", "Tamilaga Vettri Kazhagam", "தமிழக வெற்றிக் கழகம்"],
  aiadmk: ["AIADMK", "AIADMK-led", "AIADMK party"]
};

  /ibctamil/i,
  /newstamil/i,
  /malaimurasu/i,
  /news18tamil/i
  /news18tamil/i,
  /tamil\.news18/i,
  /news9live/i
];

function loadJson(path) {
}

function isPollLike(text) {
  return /tamil nadu/i.test(text) && /(survey|opinion poll|pre poll|tracker|state vibe|vote vibe|parawheel|c-voter|axis my india|matrize|ians|channel survey|tv survey)/i.test(text);
  return (
    /(tamil nadu|தமிழ்நாடு)/i.test(text) &&
    /(survey|opinion poll|pre poll|tracker|state vibe|vote vibe|parawheel|c-voter|axis my india|matrize|ians|channel survey|tv survey|கருத்து கணிப்பு|கருத்துக் கணிப்பு|சர்வே)/i.test(text)
  );
}

function countSignals(poll) {
