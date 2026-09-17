import { getBirthChart, getNakshatraSyllables, getRashiSyllables } from "../lib/astro";
import { suggestNames, findNameById, syllablesForScope, MIN_RESULTS } from "../lib/suggest";
import { detectSyllable, syllableVariants } from "../lib/syllable";
import { suggestSpellings } from "../lib/variants";
import { getBirthNumber, getCompatibility, getNameNumber } from "../lib/numerology";

const chart = getBirthChart({ date: "2026-09-04", time: "12:00", timeZone: "Asia/Kolkata" }); // Rohini pada 3, Vi

describe("syllable sets", () => {
  it("gives the four syllables of the nakshatra", () => {
    expect(getNakshatraSyllables(chart.nakshatraIndex)).toEqual(["O", "Va", "Vi", "Vu"]);
  });

  it("gives the nine pada syllables of the rashi", () => {
    // Vrishabha = Krittika padas 2-4, Rohini 1-4, Mrigashira 1-2
    expect(getRashiSyllables(chart.rashiIndex)).toEqual(["I", "U", "E", "O", "Va", "Vi", "Vu", "Ve", "Vo"]);
  });

  it("scopes widen from pada to nakshatra to rashi", () => {
    expect(syllablesForScope(chart, "pada")).toEqual(["Vi"]);
    expect(syllablesForScope(chart, "nakshatra").length).toBe(4);
    expect(syllablesForScope(chart, "rashi").length).toBe(9);
  });
});

describe("suggestNames", () => {
  it("buckets ranked names into best/good/worst with no overlap", () => {
    const result = suggestNames(chart, 4);
    const allIds = [...result.best, ...result.good, ...result.worst].map((n) => n.id);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(result.total).toBe(allIds.length);
  });

  it("defaults to the nakshatra scope and returns a usable list", () => {
    const result = suggestNames(chart, 4);
    expect(result.scopeUsed).toBe("nakshatra");
    expect(result.total).toBeGreaterThanOrEqual(MIN_RESULTS);
  });

  it("widens automatically when the requested scope is too thin", () => {
    // Ardra pada 3 ("Ing") has no names -> must widen beyond pada.
    const ardra = { siderealLongitude: 0, nakshatraIndex: 5, nakshatraName: "Ardra", padaIndex: 2, syllable: "Ing", rashiIndex: 2, rashiName: "Mithuna" };
    const result = suggestNames(ardra, 10, undefined, "pada");
    expect(result.autoWidened).toBe(true);
    expect(result.scopeUsed).not.toBe("pada");
    expect(result.total).toBeGreaterThanOrEqual(MIN_RESULTS);
  });

  it("respects a gender filter", () => {
    const result = suggestNames(chart, 4, "F");
    const all = [...result.best, ...result.good, ...result.worst];
    expect(all.every((n) => n.gender === "F" || n.gender === "U")).toBe(true);
  });

  it("lists exact-pada names first, then everyday names before scriptural ones", () => {
    const result = suggestNames(chart, 4, undefined, "nakshatra");
    const key = (n: { padaMatch: boolean; source: string }) =>
      (n.padaMatch ? 0 : 10) + (n.source.startsWith("Common") ? 0 : 1);
    for (const bucket of [result.best, result.good, result.worst]) {
      const keys = bucket.map(key);
      expect(keys).toEqual([...keys].sort((a, b) => a - b));
    }
  });
});

describe("detectSyllable", () => {
  it("finds exact pada syllables, vowel-length aware", () => {
    expect(detectSyllable("Vihaan")).toEqual({ syllable: "Vi", match: "exact" });
    expect(detectSyllable("Deepika")).toEqual({ syllable: "Di", match: "exact" });
    expect(detectSyllable("Chhaya")).toEqual({ syllable: "Chha", match: "exact" });
    expect(detectSyllable("Gyan")).toEqual({ syllable: "Yna", match: "exact" });
  });

  it("groups consonant clusters by family", () => {
    expect(detectSyllable("Shiva")).toEqual({ syllable: "Sha", match: "consonant-family" });
    expect(detectSyllable("Pradyumna")).toEqual({ syllable: "Pa", match: "consonant-family" });
  });

  it("treats Ba as Va", () => {
    expect(detectSyllable("Balaram")).toEqual({ syllable: "Va", match: "consonant-family" });
    expect(detectSyllable("Bhavya").syllable).toBe("Bha"); // Bha is its own letter
  });

  it("lists display variants", () => {
    expect(syllableVariants("Vi")).toEqual(["Vee", "Bi"]);
    expect(syllableVariants("Yna")).toEqual(["Gya", "Jna"]);
  });
});

describe("suggestSpellings", () => {
  it("returns nothing when the name already ranks best", () => {
    // Shanta: name number 1; birth day 3 -> Jupiter counts the Sun as a friend -> best
    expect(suggestSpellings("Shanta", 3)).toEqual([]);
  });

  it("offers same-sound spellings that improve the rank and keep the first syllable", () => {
    // Udit: U D I T = 6 4 1 4 = 15 -> 6; birth day 3 (Jupiter) vs Venus -> worst
    const base = getCompatibility(getBirthNumber(3), getNameNumber("Udit"));
    expect(base).toBe("worst");
    const variants = suggestSpellings("Udit", 3);
    expect(variants.length).toBeGreaterThan(0);
    for (const v of variants) {
      expect(["best", "good"]).toContain(v.rank);
      expect(detectSyllable(v.spelling).syllable).toBe("U");
      expect(v.spelling.toLowerCase()).not.toBe("udit");
    }
    // best-ranked variants come first
    const ranks = variants.map((v) => v.rank);
    const firstGood = ranks.indexOf("good");
    const lastBest = ranks.lastIndexOf("best");
    if (firstGood >= 0 && lastBest >= 0) expect(lastBest).toBeLessThan(firstGood);
  });
});

describe("findNameById", () => {
  it("finds a seeded name case-insensitively by id", () => {
    expect(findNameById("arjun")?.name).toBe("Arjun");
  });
});
