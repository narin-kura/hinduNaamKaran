// The static SEO pages (scripts/build-seo.js) use plain-JS copies of the app's
// numerology and syllable logic (seo/naming.js). These tests pin the copies to the
// lib/ originals, and check the generated site has no broken links or duplicates.
import namesData from "../data/names.json";
import nakshatraPadaSyllables from "../data/nakshatraPadaSyllables.json";
import { getNameNumber, getNameNumberBreakdown, getCompatibility, getBirthNumber } from "../lib/numerology";
import { syllableVariants } from "../lib/syllable";
import { getNakshatraSyllables, getRashiSyllables } from "../lib/astro";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const naming = require("../seo/naming");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildSite } = require("../scripts/build-seo");

describe("seo/naming.js matches lib/", () => {
  it("name numbers and breakdowns for every name", () => {
    for (const n of namesData) {
      expect(naming.getNameNumber(n.name)).toBe(getNameNumber(n.name));
      expect(naming.getNameNumberBreakdown(n.name)).toEqual(getNameNumberBreakdown(n.name));
    }
  });

  it("compatibility table and birth numbers", () => {
    for (let b = 1; b <= 9; b++) for (let k = 1; k <= 9; k++) expect(naming.getCompatibility(b, k)).toBe(getCompatibility(b, k));
    for (let d = 1; d <= 31; d++) expect(naming.getBirthNumber(d)).toBe(getBirthNumber(d));
  });

  it("syllable variants for all 108 pada syllables", () => {
    for (const s of nakshatraPadaSyllables.flatMap((n) => n.padas)) expect(naming.syllableVariants(s)).toEqual(syllableVariants(s));
  });

  it("pada -> nakshatra and rashi layout", () => {
    for (let k = 0; k < 27; k++) {
      const syl = naming.unique(naming.PADAS.filter((p: any) => p.nakshatraIndex === k).map((p: any) => p.syllable));
      expect(syl).toEqual(getNakshatraSyllables(k));
    }
    for (let r = 0; r < 12; r++) {
      const syl = naming.unique(naming.PADAS.filter((p: any) => p.rashiIndex === r).map((p: any) => p.syllable));
      expect(syl).toEqual(getRashiSyllables(r));
    }
  });
});

describe("generated site", () => {
  const site = buildSite();
  const paths = new Set<string>(site.pages.map((p: any) => p.urlPath));
  const indexed = site.pages.filter((p: any) => p.index);

  it("has a page for every name, nakshatra and rashi", () => {
    for (const n of namesData) expect(paths.has(`/names/${naming.slugify(n.name)}`)).toBe(true);
    expect(site.pages.filter((p: any) => p.urlPath.startsWith("/nakshatra/"))).toHaveLength(27);
    expect(site.pages.filter((p: any) => p.urlPath.startsWith("/rashi/"))).toHaveLength(12);
  });

  it("every name's starting syllable is a real pada syllable", () => {
    for (const n of namesData) expect(naming.padasForSyllable(n.startingSound).length).toBeGreaterThan(0);
  });

  it("titles and descriptions are filled in and unique", () => {
    const titles = new Set<string>();
    for (const p of indexed) {
      expect(p.title).toBeTruthy();
      expect(p.description.length).toBeGreaterThan(50);
      expect(titles.has(p.title)).toBe(false);
      titles.add(p.title);
      expect(p.html).not.toMatch(/\{\{\{?\w+\}?\}\}/);
    }
  });

  it("every internal link points at a page that exists", () => {
    const appPaths = new Set(["/", "/method"]);
    const assets = new Set(["/favicon.ico"]);
    for (const p of site.pages) {
      for (const [, href] of p.html.matchAll(/href="(\/[^"#?]*)/g)) {
        if (!(paths.has(href) || appPaths.has(href) || assets.has(href) || href === "/site.css")) {
          throw new Error(`Broken link ${href} on ${p.urlPath}`);
        }
      }
    }
  });

  it("in-page anchors used by name pages exist on the target page", () => {
    const byPath = new Map<string, string>(site.pages.map((p: any) => [p.urlPath, p.html]));
    for (const p of site.pages) {
      for (const [, target, anchor] of p.html.matchAll(/href="(\/[^"#]+)#([^"]+)"/g)) {
        expect(byPath.get(target)).toContain(`id="${anchor}"`);
      }
    }
  });

  it("sitemap lists the app pages and every indexable page, all on hindunaamkaran.com", () => {
    expect(site.sitemapUrls).toContain("https://hindunaamkaran.com/");
    expect(site.sitemapUrls).toHaveLength(indexed.length + 2);
    expect(new Set(site.sitemapUrls).size).toBe(site.sitemapUrls.length);
    expect(site.robots).toContain("Sitemap: https://hindunaamkaran.com/sitemap.xml");
    expect(site.sitemapUrls.some((u: string) => u.includes("404"))).toBe(false);
  });
});
