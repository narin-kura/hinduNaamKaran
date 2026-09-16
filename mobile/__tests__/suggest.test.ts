import { getBirthChart } from "../lib/astro";
import { suggestNames, findNameById } from "../lib/suggest";

describe("suggestNames", () => {
  it("buckets ranked names into best/good/worst with no overlap", () => {
    const chart = getBirthChart({ date: "2026-09-04", time: "12:00", timeZone: "Asia/Kolkata" });
    const result = suggestNames(chart, 4);

    const allIds = [...result.best, ...result.good, ...result.worst].map((n) => n.id);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds.length).toBeGreaterThan(0);
  });

  it("falls back to the wider Nakshatra when a syllable has too few names", () => {
    // Ardra pada 3 ("Ing") has no names in the seed dataset -- must widen.
    const chart = { siderealLongitude: 0, nakshatraIndex: 5, nakshatraName: "Ardra", padaIndex: 2, syllable: "Ing", rashiIndex: 0, rashiName: "Mesha" };
    const result = suggestNames(chart, 10);
    expect(result.usedFallback).toBe(true);
    expect([...result.best, ...result.good, ...result.worst].length).toBeGreaterThan(0);
  });

  it("respects a gender filter", () => {
    const chart = getBirthChart({ date: "2026-09-04", time: "12:00", timeZone: "Asia/Kolkata" });
    const result = suggestNames(chart, 4, "F");
    const all = [...result.best, ...result.good, ...result.worst];
    expect(all.every((n) => n.gender === "F" || n.gender === "U")).toBe(true);
  });
});

describe("findNameById", () => {
  it("finds a seeded name case-insensitively by id", () => {
    expect(findNameById("arjun")?.name).toBe("Arjun");
  });
});

describe("result ordering", () => {
  it("lists everyday names before scriptural epithets within a rank", () => {
    const chart = getBirthChart({ date: "2026-09-04", time: "12:00", timeZone: "Asia/Kolkata" });
    const result = suggestNames(chart, 4);
    for (const bucket of [result.best, result.good, result.worst]) {
      const tiers = bucket.map((n) => (n.source.startsWith("Common") ? 0 : 1));
      const sorted = [...tiers].sort((a, b) => a - b);
      expect(tiers).toEqual(sorted);
    }
  });
});
