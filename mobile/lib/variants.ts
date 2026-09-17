import { getBirthNumber, getCompatibility, getNameNumber, explainCompatibility, Rank } from "./numerology";
import { detectSyllable } from "./syllable";

export type SpellingVariant = {
  spelling: string;
  nameNumber: number;
  rank: Rank;
  /** How many spelling changes from the original. */
  edits: number;
  reason: string;
};

const RANK_VALUE: Record<Rank, number> = { worst: 0, good: 1, best: 2 };

type Edit = { at: number; from: string; to: string };

/**
 * Spelling changes that keep the pronunciation: doubling a long vowel
 * (Rahul -> Raahul), undoubling one (Meena -> Mina), doubling a consonant
 * (Tushar -> Tusshar), and v/w (Vivek -> Vivek stays, Pavan -> Pawan).
 */
function possibleEdits(name: string): Edit[] {
  const s = name.toLowerCase();
  const edits: Edit[] = [];
  const isVowel = (c: string) => "aeiou".includes(c);
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = s[i - 1] ?? "";
    const next = s[i + 1] ?? "";
    // double a single long-able vowel: a, i, u
    // (an initial vowel is only ever doubled for A: Aakash, Aarav - never Uu or Ii)
    if ("aiu".includes(c) && prev !== c && next !== c && !(c === "a" && (next === "i" || next === "u")) && !(i === 0 && c !== "a")) {
      edits.push({ at: i, from: c, to: c + c });
    }
    // undouble ee / oo / aa
    if ((c === "e" || c === "o" || c === "a") && next === c) {
      edits.push({ at: i, from: c + c, to: c === "e" ? "i" : c === "o" ? "u" : "a" });
    }
    // double a single consonant that is not first, and not already doubled
    if ("nltsmrkpd".includes(c) && i > 0 && prev !== c && next !== c && !isVowel(c)) {
      edits.push({ at: i, from: c, to: c + c });
    }
    // v <-> w after the first letter
    if (i > 0 && c === "v") edits.push({ at: i, from: "v", to: "w" });
    if (i > 0 && c === "w") edits.push({ at: i, from: "w", to: "v" });
  }
  return edits;
}

function apply(name: string, edits: Edit[]): string {
  // apply from the end so earlier indices stay valid
  const sorted = [...edits].sort((a, b) => b.at - a.at);
  let s = name.toLowerCase();
  for (const e of sorted) s = s.slice(0, e.at) + e.to + s.slice(e.at + e.from.length);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function overlapping(a: Edit, b: Edit): boolean {
  const aEnd = a.at + a.from.length;
  const bEnd = b.at + b.from.length;
  return a.at < bEnd && b.at < aEnd;
}

/**
 * Alternative spellings of `name` that keep its sound and its first syllable
 * but land on a better numerology rank for this birth day. Best rank first,
 * then fewest changes. Empty if the name already ranks Best or nothing helps.
 */
export function suggestSpellings(name: string, birthDay: number, limit = 10): SpellingVariant[] {
  const original = name.trim();
  if (original.length < 2) return [];
  const birthNumber = getBirthNumber(birthDay);
  const baseRank = getCompatibility(birthNumber, getNameNumber(original));
  if (baseRank === "best") return [];
  const baseSyllable = detectSyllable(original).syllable;

  const edits = possibleEdits(original);
  const candidates = new Set<string>();
  const withEdits: { spelling: string; edits: number }[] = [];
  const push = (spelling: string, n: number) => {
    if (spelling.toLowerCase() === original.toLowerCase() || candidates.has(spelling)) return;
    candidates.add(spelling);
    withEdits.push({ spelling, edits: n });
  };
  for (const e of edits) push(apply(original, [e]), 1);
  for (let i = 0; i < edits.length; i++) {
    for (let j = i + 1; j < edits.length; j++) {
      if (overlapping(edits[i], edits[j])) continue;
      push(apply(original, [edits[i], edits[j]]), 2);
      if (withEdits.length > 400) break;
    }
  }

  const out: SpellingVariant[] = [];
  for (const c of withEdits) {
    // must keep the same pada syllable, or it is a different name for naming purposes
    if (detectSyllable(c.spelling).syllable !== baseSyllable) continue;
    const nameNumber = getNameNumber(c.spelling);
    const rank = getCompatibility(birthNumber, nameNumber);
    if (RANK_VALUE[rank] <= RANK_VALUE[baseRank]) continue;
    out.push({ spelling: c.spelling, nameNumber, rank, edits: c.edits, reason: explainCompatibility(birthNumber, nameNumber).short });
  }
  out.sort((a, b) => RANK_VALUE[b.rank] - RANK_VALUE[a.rank] || a.edits - b.edits || a.spelling.localeCompare(b.spelling));
  return out.slice(0, limit);
}
