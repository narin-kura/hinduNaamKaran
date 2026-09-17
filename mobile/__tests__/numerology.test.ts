import { getBirthNumber, getNameNumber, getCompatibility } from "../lib/numerology";

describe("getBirthNumber", () => {
  it("reduces a birth day to a single digit", () => {
    expect(getBirthNumber(15)).toBe(6); // 1+5
    expect(getBirthNumber(29)).toBe(2); // 2+9=11 -> 1+1
    expect(getBirthNumber(7)).toBe(7);
  });
});

describe("getNameNumber", () => {
  it("sums Chaldean letter values and reduces to a single digit", () => {
    // R=2, A=1, M=4 -> 7
    expect(getNameNumber("Ram")).toBe(7);
    // O=7, M=4 -> 11 -> 1+1=2
    expect(getNameNumber("Om")).toBe(2);
  });

  it("ignores case", () => {
    expect(getNameNumber("ram")).toBe(getNameNumber("RAM"));
  });
});

describe("getCompatibility", () => {
  it("looks up the birth-number x name-number matrix", () => {
    expect(getCompatibility(2, 2)).toBe("best");
    expect(getCompatibility(6, 7)).toBe("good");
    expect(getCompatibility(1, 6)).toBe("worst");
  });

  it("is asymmetric for shadow-planet-adjacent pairs, matching classical Graha Maitri", () => {
    // Saturn (8) treats Mars (9) as an enemy, but Mars (9) treats Saturn (8) as neutral.
    expect(getCompatibility(8, 9)).toBe("worst");
    expect(getCompatibility(9, 8)).toBe("good");
  });
});

import { explainCompatibility, getNameNumberBreakdown } from "../lib/numerology";

describe("explainCompatibility", () => {
  it("names the planets and the friendship relation", () => {
    const e = explainCompatibility(3, 6); // Jupiter vs Venus -> enemy -> worst
    expect(e.rank).toBe("worst");
    expect(e.relation).toBe("enemy");
    expect(e.long).toContain("Jupiter");
    expect(e.long).toContain("Venus");
    expect(e.long).toContain("enemy");
  });

  it("treats a shared planet as reinforcing", () => {
    expect(explainCompatibility(3, 3).relation).toBe("same");
  });

  it("flags Rahu and Ketu as having no classical rule", () => {
    expect(explainCompatibility(7, 1).relation).toBe("no-rule");
    expect(explainCompatibility(1, 4).relation).toBe("no-rule");
  });
});

describe("getNameNumberBreakdown", () => {
  it("shows the letters, total and reduction steps", () => {
    const b = getNameNumberBreakdown("Shanta"); // S3 H5 A1 N5 T4 A1 = 19 -> 10 -> 1
    expect(b.letters.map((l) => l.value)).toEqual([3, 5, 1, 5, 4, 1]);
    expect(b.total).toBe(19);
    expect(b.steps).toEqual([10, 1]);
    expect(b.result).toBe(1);
  });
});
