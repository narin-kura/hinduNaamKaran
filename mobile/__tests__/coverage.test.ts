import names from "../data/names.json";
import table from "../data/nakshatraPadaSyllables.json";
import { getBirthNumber, getCompatibility, getNameNumber } from "../lib/numerology";
import { suggestSpellings } from "../lib/variants";
import { suggestNames, MIN_BEST } from "../lib/suggest";

// Birth numbers 4 and 7 (Rahu/Ketu) rank nothing Best by design.
const BIRTH_DAYS = [1, 2, 3, 5, 6, 8, 9];
const syllables = [...new Set(table.flatMap((n) => n.padas))];

describe("Best-name coverage: at least two Best names per syllable per birth number", () => {
  it("holds for every syllable that has names, counting spelling variations", () => {
    const failures: string[] = [];
    for (const syl of syllables) {
      const list = names.filter((e) => e.startingSound === syl);
      if (list.length === 0) continue; // e.g. "Yi": no Hindu given name begins with this sound
      for (const day of BIRTH_DAYS) {
        const b = getBirthNumber(day);
        let best = list.filter((e) => getCompatibility(b, getNameNumber(e.name)) === "best").length;
        if (best < MIN_BEST) {
          for (const e of list) {
            if (best >= MIN_BEST) break;
            if (suggestSpellings(e.name, day, 1).some((v) => v.rank === "best")) best++;
          }
        }
        if (best < MIN_BEST) failures.push(`${syl} / birth number ${b}: ${best}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("the ranking itself fills a thin Best bucket with labelled spelling variations", () => {
    // Ardra pada 1, "Ku": pick a birth day and scope where the strict list is thin.
    const chart = { siderealLongitude: 0, nakshatraIndex: 5, nakshatraName: "Ardra", padaIndex: 0, syllable: "Ku", rashiIndex: 2, rashiName: "Mithuna" };
    for (const day of BIRTH_DAYS) {
      const r = suggestNames(chart, day, undefined, "pada");
      const variants = r.best.filter((n) => n.variantOf);
      for (const v of variants) {
        expect(v.rank).toBe("best");
        expect(typeof v.variantOf).toBe("string");
      }
      expect(r.best.length).toBeGreaterThanOrEqual(Math.min(MIN_BEST, r.total));
    }
  });
});
