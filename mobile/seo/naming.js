// Plain-JS twins of the bits of lib/*.ts that the static SEO pages need, so
// scripts/build-seo.js can run under plain Node (no TypeScript build step).
// __tests__/seo.test.ts checks every function here against the lib/ original
// for every name and syllable, so the two cannot drift apart silently.

const chaldeanLetterValues = require("../data/chaldeanLetterValues.json");
const numerologyCompatibility = require("../data/numerologyCompatibility.json");
const nakshatraPadaSyllables = require("../data/nakshatraPadaSyllables.json");

const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena",
];

const PLANET_OF_NUMBER = {
  1: "the Sun", 2: "the Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
  6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars",
};

function reduceToSingleDigit(n) {
  let value = n;
  while (value > 9) {
    value = String(value).split("").reduce((sum, d) => sum + Number(d), 0);
  }
  return value;
}

const getBirthNumber = (day) => reduceToSingleDigit(day);

function getNameNumberBreakdown(name) {
  const letters = name
    .toUpperCase()
    .split("")
    .filter((c) => chaldeanLetterValues[c] !== undefined)
    .map((c) => ({ letter: c, value: chaldeanLetterValues[c] }));
  const total = letters.reduce((s, l) => s + l.value, 0);
  const steps = [];
  let v = total;
  while (v > 9) {
    v = String(v).split("").reduce((s, d) => s + Number(d), 0);
    steps.push(v);
  }
  return { letters, total, steps, result: v };
}

const getNameNumber = (name) => getNameNumberBreakdown(name).result;

const getCompatibility = (birthNumber, nameNumber) =>
  numerologyCompatibility[String(birthNumber)][String(nameNumber)];

/** Birth days of the month (1-31) grouped by how well they suit a name number. */
function birthDaysByRank(nameNumber) {
  const out = { best: [], good: [], worst: [] };
  for (let day = 1; day <= 31; day++) out[getCompatibility(getBirthNumber(day), nameNumber)].push(day);
  return out;
}

/** Same as lib/syllable.ts syllableVariants: other everyday spellings of a pada syllable. */
function syllableVariants(syllable) {
  const out = [];
  const doubled = syllable.replace(/a$/, "aa").replace(/i$/, "ee").replace(/u$/, "oo");
  if (doubled !== syllable && !/^[AIUEO]$/.test(syllable) && syllable !== "Yna") out.push(doubled);
  if (/^V/.test(syllable)) out.push("B" + syllable.slice(1));
  if (syllable === "Yna") out.push("Gya", "Jna");
  if (syllable === "Ing") out.push("Ng");
  return out;
}

const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Every one of the 108 padas, in zodiac order. Nakshatra k, pada j is index 4k + j;
 * each rashi spans nine consecutive padas (same layout as lib/astro.ts).
 */
const PADAS = nakshatraPadaSyllables.flatMap((n, k) =>
  n.padas.map((syllable, j) => {
    const index = 4 * k + j;
    return { index, nakshatraIndex: k, nakshatra: n.nakshatra, pada: j + 1, syllable, rashiIndex: Math.floor(index / 9), rashi: RASHI_NAMES[Math.floor(index / 9)] };
  })
);

/** The padas whose naming syllable is `syllable`. */
const padasForSyllable = (syllable) => PADAS.filter((p) => p.syllable === syllable);

const unique = (xs) => xs.filter((x, i) => xs.indexOf(x) === i);

module.exports = {
  RASHI_NAMES,
  PLANET_OF_NUMBER,
  NAKSHATRAS: nakshatraPadaSyllables,
  PADAS,
  getBirthNumber,
  getNameNumber,
  getNameNumberBreakdown,
  getCompatibility,
  birthDaysByRank,
  syllableVariants,
  padasForSyllable,
  slugify,
  unique,
};
