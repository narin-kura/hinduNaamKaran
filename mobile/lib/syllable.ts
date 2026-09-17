import nakshatraPadaSyllables from "../data/nakshatraPadaSyllables.json";

/** All distinct pada syllables, longest first so "Chha" wins over "Cha" over "Ch". */
const SYLLABLES: string[] = nakshatraPadaSyllables
  .flatMap((n) => n.padas)
  .filter((s, i, arr) => arr.indexOf(s) === i)
  .sort((a, b) => b.length - a.length);

// Common English spellings double long vowels (Deepika, Meena, Poonam) while
// the pada table uses single letters (Di, Mi, Pu). Same akshara.
const normalize = (s: string) => s.toLowerCase().replace(/aa/g, "a").replace(/ee/g, "i").replace(/oo/g, "u");

// "Yna" in the table is the gya / jna akshara.
const ALIASES: Record<string, string[]> = { yna: ["yna", "gya", "jna"] };

// Names that begin with a consonant cluster whose exact akshara is not one of
// the 108 pada syllables are grouped with the closest syllable in the same
// consonant family. Same table as scripts/merge-names.js and the dataset.
const CLUSTER_MAP: [string, string][] = [
  ["shri", "Sha"], ["shre", "Sha"], ["shru", "Sha"], ["shra", "Sha"], ["shi", "Sha"], ["shu", "Sha"], ["sho", "Sha"], ["she", "Sha"],
  ["shl", "Sha"], ["shv", "Sha"], ["shw", "Sha"],
  ["sva", "Sa"], ["svi", "Sa"], ["swa", "Sa"], ["swi", "Sa"], ["sthi", "Sa"], ["stha", "Sa"], ["sta", "Sa"], ["sthu", "Sa"], ["stu", "Sa"],
  ["sra", "Sa"], ["sri", "Sa"], ["sma", "Sa"], ["smri", "Sa"], ["ska", "Sa"], ["sna", "Sa"], ["sne", "Sa"], ["sni", "Sa"],
  ["pra", "Pa"], ["pri", "Pa"], ["pre", "Pa"], ["pru", "Pa"], ["pro", "Pa"],
  ["dhra", "Dha"], ["dhri", "Dha"], ["dhru", "Dha"], ["dhi", "Dha"], ["dhe", "Dha"], ["dho", "Dha"], ["dhu", "Dha"],
  ["jya", "Ja"], ["jyo", "Ja"], ["jye", "Ja"],
  ["kra", "Ka"], ["kri", "Ka"], ["kru", "Ka"], ["kre", "Ka"], ["ksha", "Ka"], ["kshe", "Ka"], ["kshi", "Ka"],
  ["mri", "Mi"], ["mra", "Ma"],
  ["nya", "Na"], ["hri", "Hi"], ["hra", "Ha"],
  ["tra", "Ti"], ["tri", "Ti"], ["tru", "Ti"], ["tva", "Ta"], ["tya", "Ta"],
  ["vri", "Vi"], ["vra", "Va"], ["vya", "Va"], ["vyo", "Va"],
  ["gra", "Ga"], ["gri", "Ga"], ["gla", "Ga"], ["bhra", "Bha"], ["bhri", "Bha"],
  ["dra", "Da"], ["dri", "Da"], ["dva", "Da"], ["dvi", "Da"], ["dya", "Da"],
  ["pla", "Pa"], ["kla", "Ka"], ["kva", "Ka"], ["gya", "Yna"], ["jna", "Yna"],
  // Va and Ba are the same akshara in many traditions (Sanskrit व is written
  // and pronounced ब across eastern India and elsewhere), so Ba-names take
  // the Va padas. Bha is a different letter and is matched exactly above.
  ["ba", "Va"], ["bi", "Vi"], ["bu", "Vu"], ["be", "Ve"], ["bo", "Vo"], ["bra", "Va"], ["bri", "Vi"],
];

export type SyllableDetection = {
  /** The pada-table syllable this name is grouped under, or null if none fits. */
  syllable: string | null;
  match: "exact" | "consonant-family" | null;
};

/** Work out which of the 108 pada syllables a freely typed name begins with. */
export function detectSyllable(name: string): SyllableDetection {
  const n = normalize(name.trim());
  if (!n) return { syllable: null, match: null };
  for (const s of SYLLABLES) {
    const forms = ALIASES[s.toLowerCase()] ?? [normalize(s)];
    if (forms.some((f) => n.startsWith(f))) return { syllable: s, match: "exact" };
  }
  for (const [prefix, syl] of CLUSTER_MAP) {
    if (n.startsWith(prefix)) return { syllable: syl, match: "consonant-family" };
  }
  return { syllable: null, match: null };
}

/**
 * Other ways the same pada sound is commonly written, for display. Long vowels
 * are doubled in everyday spelling, and Va-padas also cover Ba.
 */
export function syllableVariants(syllable: string): string[] {
  const out: string[] = [];
  const doubled = syllable.replace(/a$/, "aa").replace(/i$/, "ee").replace(/u$/, "oo");
  if (doubled !== syllable && !/^[AIUEO]$/.test(syllable) && syllable !== "Yna") out.push(doubled);
  if (/^V/.test(syllable)) out.push("B" + syllable.slice(1));
  if (syllable === "Yna") out.push("Gya", "Jna");
  if (syllable === "Ing") out.push("Ng");
  return out;
}
