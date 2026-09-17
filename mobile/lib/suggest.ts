import namesData from "../data/names.json";
import { BirthChart, getNakshatraSyllables, getRashiSyllables } from "./astro";
import { getBirthNumber, getCompatibility, getNameNumber, explainCompatibility, Rank } from "./numerology";

export type Gender = "M" | "F" | "U";

export type NameEntry = {
  name: string;
  gender: Gender;
  meaning: string;
  origin: string;
  startingSound: string;
  /** Where the name is attested, e.g. "Vishnu Sahasranama #29". */
  source: string;
  /**
   * "exact" = the name begins with this pada syllable outright.
   * "consonant-family" = the name begins with a consonant cluster whose exact
   * akshara is not one of the 108 pada syllables, so it is grouped with the
   * closest syllable in the same consonant family (e.g. Shiva -> Sha).
   */
  syllableMatch: "exact" | "consonant-family";
};

export type RankedName = NameEntry & {
  id: string;
  nameNumber: number;
  rank: Rank;
  /** Why it got that rank, in one line. */
  reason: string;
  /** True when the name begins with the exact pada syllable, not just a sibling one. */
  padaMatch: boolean;
};

/**
 * How widely to match syllables.
 *  pada       - only the Moon's exact pada syllable (strictest).
 *  nakshatra  - any of the birth star's four syllables (common practice).
 *  rashi      - any of the nine pada syllables in the Moon sign (also widely used).
 */
export type Scope = "pada" | "nakshatra" | "rashi";
export const SCOPES: Scope[] = ["pada", "nakshatra", "rashi"];

/** Fewer than this and the scope is widened automatically. */
export const MIN_RESULTS = 12;

export type SuggestionResult = {
  scopeRequested: Scope;
  scopeUsed: Scope;
  /** True when scopeUsed is wider than scopeRequested because too few names matched. */
  autoWidened: boolean;
  syllables: string[];
  padaSyllable: string;
  best: RankedName[];
  good: RankedName[];
  worst: RankedName[];
  total: number;
};

const allNames = namesData as NameEntry[];

export function syllablesForScope(chart: BirthChart, scope: Scope): string[] {
  if (scope === "pada") return [chart.syllable];
  if (scope === "nakshatra") return getNakshatraSyllables(chart.nakshatraIndex);
  return getRashiSyllables(chart.rashiIndex);
}

function filterByGender(entries: NameEntry[], gender?: Gender): NameEntry[] {
  if (!gender) return entries;
  return entries.filter((e) => e.gender === gender || e.gender === "U");
}

function candidatesFor(syllables: string[], gender?: Gender): NameEntry[] {
  const wanted = new Set(syllables.map((s) => s.toLowerCase()));
  return filterByGender(
    allNames.filter((e) => wanted.has(e.startingSound.toLowerCase())),
    gender
  );
}

export function nameId(entry: NameEntry): string {
  return entry.name.toLowerCase();
}

export function suggestNames(
  chart: BirthChart,
  birthDay: number,
  gender?: Gender,
  scope: Scope = "nakshatra"
): SuggestionResult {
  const birthNumber = getBirthNumber(birthDay);

  // Start at the requested scope; widen while the list is too thin.
  let scopeUsed: Scope = scope;
  let syllables = syllablesForScope(chart, scopeUsed);
  let candidates = candidatesFor(syllables, gender);
  while (candidates.length < MIN_RESULTS && SCOPES.indexOf(scopeUsed) < SCOPES.length - 1) {
    scopeUsed = SCOPES[SCOPES.indexOf(scopeUsed) + 1];
    syllables = syllablesForScope(chart, scopeUsed);
    candidates = candidatesFor(syllables, gender);
  }

  const pada = chart.syllable.toLowerCase();
  const ranked: RankedName[] = candidates.map((entry) => {
    const nameNumber = getNameNumber(entry.name);
    return {
      ...entry,
      id: nameId(entry),
      nameNumber,
      rank: getCompatibility(birthNumber, nameNumber),
      reason: explainCompatibility(birthNumber, nameNumber).short,
      padaMatch: entry.startingSound.toLowerCase() === pada,
    };
  });

  // Exact-pada names first, then everyday names before scriptural epithets,
  // alphabetical within each group.
  const familiarity = (n: RankedName) => (n.source.startsWith("Common") ? 0 : 1);
  const order = (a: RankedName, b: RankedName) =>
    Number(b.padaMatch) - Number(a.padaMatch) ||
    familiarity(a) - familiarity(b) ||
    a.name.localeCompare(b.name);

  const best = ranked.filter((n) => n.rank === "best").sort(order);
  const good = ranked.filter((n) => n.rank === "good").sort(order);
  const worst = ranked.filter((n) => n.rank === "worst").sort(order);

  return {
    scopeRequested: scope,
    scopeUsed,
    autoWidened: scopeUsed !== scope,
    syllables,
    padaSyllable: chart.syllable,
    best,
    good,
    worst,
    total: ranked.length,
  };
}

export function findNameById(id: string): NameEntry | undefined {
  return allNames.find((entry) => nameId(entry) === id);
}
