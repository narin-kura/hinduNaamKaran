import names from "../data/names.json";
import table from "../data/nakshatraPadaSyllables.json";

type Entry = (typeof names)[number];

const syllables = new Set(table.flatMap((n) => n.padas));

// Long vowels are doubled in common spellings (Deepika) but single in the
// table (Di). "Yna" is the gya/jna akshara.
const normalize = (s: string) => s.toLowerCase().replace(/aa/g, "a").replace(/ee/g, "i").replace(/oo/g, "u");
const ALIASES: Record<string, string[]> = { yna: ["yna", "gya", "jna"] };
const startsWithSyllable = (name: string, syl: string) => {
  const forms = ALIASES[syl.toLowerCase()] ?? [normalize(syl)];
  return forms.some((f) => normalize(name).startsWith(f));
};

describe("names.json integrity", () => {
  it("has no duplicate names", () => {
    const seen = new Map<string, number>();
    names.forEach((e) => seen.set(e.name.toLowerCase(), (seen.get(e.name.toLowerCase()) ?? 0) + 1));
    const dupes = [...seen.entries()].filter(([, c]) => c > 1).map(([n]) => n);
    expect(dupes).toEqual([]);
  });

  it("uses only the 108 pada syllables", () => {
    const bad = names.filter((e) => !syllables.has(e.startingSound)).map((e) => `${e.name}:${e.startingSound}`);
    expect(bad).toEqual([]);
  });

  it("every 'exact' match really begins with its syllable", () => {
    const bad = names
      .filter((e: Entry) => e.syllableMatch === "exact" && !startsWithSyllable(e.name, e.startingSound))
      .map((e) => `${e.name}:${e.startingSound}`);
    expect(bad).toEqual([]);
  });

  it("has complete, well-formed entries", () => {
    const bad = names
      .filter(
        (e: Entry) =>
          !e.name ||
          !["M", "F", "U"].includes(e.gender) ||
          !e.meaning ||
          e.meaning.length < 3 ||
          !e.origin ||
          !e.source ||
          !["exact", "consonant-family"].includes(e.syllableMatch)
      )
      .map((e) => e.name);
    expect(bad).toEqual([]);
  });

  it("scriptural citations carry a verse number", () => {
    const bad = names
      .filter((e: Entry) => !e.source.startsWith("Common") && !/#\d+/.test(e.source))
      .map((e) => `${e.name}: ${e.source}`);
    expect(bad).toEqual([]);
  });

  it("is a large enough list to be useful", () => {
    expect(names.length).toBeGreaterThan(800);
  });
});
