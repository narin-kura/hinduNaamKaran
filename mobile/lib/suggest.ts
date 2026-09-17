import namesData from "../data/names.json";
import { BirthChart, getSiblingPadaSyllables } from "./astro";
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
};

export type SuggestionResult = {
  syllableUsed: string;
  usedFallback: boolean;
  best: RankedName[];
  good: RankedName[];
  worst: RankedName[];
};

const allNames = namesData as NameEntry[];

function matchesSyllable(entry: NameEntry, syllable: string): boolean {
  return entry.startingSound.toLowerCase() === syllable.toLowerCase();
}

function filterByGender(entries: NameEntry[], gender?: Gender): NameEntry[] {
  if (!gender) return entries;
  return entries.filter((e) => e.gender === gender || e.gender === "U");
}

export function nameId(entry: NameEntry): string {
  return entry.name.toLowerCase();
}

export function suggestNames(
  chart: BirthChart,
  birthDay: number,
  gender?: Gender
): SuggestionResult {
  const birthNumber = getBirthNumber(birthDay);

  let candidates = filterByGender(
    allNames.filter((entry) => matchesSyllable(entry, chart.syllable)),
    gender
  );
  let syllableUsed = chart.syllable;
  let usedFallback = false;

  // The seed name list doesn't have entries for every one of the 108 rare
  // syllables yet -- widen to the nakshatra's other 3 padas rather than show nothing.
  if (candidates.length < 3) {
    const siblingSyllables = getSiblingPadaSyllables(chart.nakshatraIndex, chart.padaIndex);
    const widened = filterByGender(
      allNames.filter((entry) =>
        siblingSyllables.some((syllable) => matchesSyllable(entry, syllable))
      ),
      gender
    );
    if (widened.length > 0) {
      candidates = [...candidates, ...widened];
      syllableUsed = chart.nakshatraName;
      usedFallback = true;
    }
  }

  const ranked: RankedName[] = candidates.map((entry) => {
    const nameNumber = getNameNumber(entry.name);
    return {
      ...entry,
      id: nameId(entry),
      nameNumber,
      rank: getCompatibility(birthNumber, nameNumber),
      reason: explainCompatibility(birthNumber, nameNumber).short,
    };
  });

  // Everyday names first, then scriptural epithets; alphabetical within each.
  // With ~60 names per syllable, a parent should see Sagar and Sahil before
  // Sahasraksha, not interleaved with it.
  const familiarity = (n: RankedName) => (n.source.startsWith("Common") ? 0 : 1);
  const sortByName = (a: RankedName, b: RankedName) =>
    familiarity(a) - familiarity(b) || a.name.localeCompare(b.name);

  return {
    syllableUsed,
    usedFallback,
    best: ranked.filter((n) => n.rank === "best").sort(sortByName),
    good: ranked.filter((n) => n.rank === "good").sort(sortByName),
    worst: ranked.filter((n) => n.rank === "worst").sort(sortByName),
  };
}

export function findNameById(id: string): NameEntry | undefined {
  return allNames.find((entry) => nameId(entry) === id);
}
