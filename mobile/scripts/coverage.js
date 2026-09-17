#!/usr/bin/env node
/**
 * Coverage report: for every pada syllable and every birth number, how many
 * names rank "best"? Target: at least MIN per (syllable, birth number).
 * Birth numbers 4 and 7 are skipped: Rahu/Ketu rank nothing "best" by design.
 *
 *   node scripts/coverage.js            # summary + gap list
 *   node scripts/coverage.js --json     # machine-readable gaps
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const names = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "names.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "nakshatraPadaSyllables.json"), "utf8"));
const letters = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "chaldeanLetterValues.json"), "utf8"));
const compat = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "numerologyCompatibility.json"), "utf8"));

const MIN = Number(process.env.MIN || 2);
const BIRTH_NUMBERS = [1, 2, 3, 5, 6, 8, 9];
const syllables = [...new Set(table.flatMap((n) => n.padas))];

const reduce = (n) => { let v = n; while (v > 9) v = String(v).split("").reduce((s, d) => s + Number(d), 0); return v; };
const nameNumber = (name) => reduce(name.toUpperCase().split("").reduce((s, c) => s + (letters[c] || 0), 0));

/** which name numbers rank best for a birth number */
const bestNumbersFor = (b) => Object.entries(compat[String(b)]).filter(([, r]) => r === "best").map(([n]) => Number(n));

const bySyl = {};
for (const e of names) (bySyl[e.startingSound] ||= []).push({ ...e, n: nameNumber(e.name) });

const gaps = [];
let cells = 0, ok = 0;
for (const s of syllables) {
  const list = bySyl[s] || [];
  for (const b of BIRTH_NUMBERS) {
    cells++;
    const bestNs = new Set(bestNumbersFor(b));
    const best = list.filter((e) => bestNs.has(e.n));
    if (best.length >= MIN) ok++;
    else gaps.push({ syllable: s, birthNumber: b, have: best.length, need: MIN - best.length, wantNumbers: [...bestNs], totalNames: list.length });
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(gaps, null, 1));
  process.exit(0);
}

console.log(`cells (syllable x birth number): ${cells}, satisfied: ${ok}, gaps: ${gaps.length}`);
const bySylGap = {};
for (const g of gaps) (bySylGap[g.syllable] ||= []).push(g);
const sylOrder = Object.keys(bySylGap).sort((a, b) => bySylGap[b].length - bySylGap[a].length);
for (const s of sylOrder) {
  const gs = bySylGap[s];
  const total = (bySyl[s] || []).length;
  console.log(`  ${s.padEnd(5)} (${String(total).padStart(2)} names)  missing best for birth#: ${gs.map((g) => `${g.birthNumber}(has ${g.have}, wants #${g.wantNumbers.join("/")})`).join("  ")}`);
}
