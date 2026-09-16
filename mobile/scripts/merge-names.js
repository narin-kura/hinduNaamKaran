#!/usr/bin/env node
/**
 * Merge a batch of names into data/names.json with validation.
 *
 *   node scripts/merge-names.js path/to/batch.json
 *
 * Batch entries: { name, gender: "M"|"F"|"U", meaning, startingSound,
 *                  origin?, source?, syllableMatch? }
 * Defaults: origin "Sanskrit", source "Common Sanskrit/Hindi usage",
 *           syllableMatch "exact".
 *
 * Rejects (and does not write) if any entry has a startingSound that is not
 * one of the 108 pada syllables, a bad gender, or a missing meaning.
 * Skips entries whose name already exists (case-insensitive).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NAMES = path.join(ROOT, "data", "names.json");
const TABLE = path.join(ROOT, "data", "nakshatraPadaSyllables.json");

const batchPath = process.argv[2];
if (!batchPath) {
  console.error("usage: node scripts/merge-names.js <batch.json>");
  process.exit(2);
}

const table = JSON.parse(fs.readFileSync(TABLE, "utf8"));
const syllables = new Set(table.flatMap((n) => n.padas));
const existing = JSON.parse(fs.readFileSync(NAMES, "utf8"));
const seen = new Set(existing.map((e) => e.name.toLowerCase()));
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));

// Long vowels are written doubled in common English spellings (Deepika, Meena,
// Poonam) but the pada table uses single letters (Di, Mi, Pu). Same akshara.
// "Yna" in the table is the gya/jna akshara.
function normalizeRoman(s) {
  return s.toLowerCase().replace(/aa/g, "a").replace(/ee/g, "i").replace(/oo/g, "u");
}
const SYLLABLE_ALIASES = { yna: ["yna", "gya", "jna"] };
function startsWithSyllable(name, syllable) {
  const n = normalizeRoman(name);
  const forms = SYLLABLE_ALIASES[syllable.toLowerCase()] || [normalizeRoman(syllable)];
  return forms.some((f) => n.startsWith(f));
}

const errors = [];
const added = [];
let skipped = 0;

batch.forEach((raw, i) => {
  const e = {
    name: raw.name,
    gender: raw.gender,
    meaning: raw.meaning,
    origin: raw.origin || "Sanskrit",
    startingSound: raw.startingSound,
    source: raw.source || "Common Sanskrit/Hindi usage",
    syllableMatch: raw.syllableMatch || "exact",
  };
  const where = `#${i + 1} ${e.name || "(no name)"}`;
  if (!e.name) errors.push(`${where}: missing name`);
  if (!["M", "F", "U"].includes(e.gender)) errors.push(`${where}: bad gender ${e.gender}`);
  if (!e.meaning || e.meaning.length < 3) errors.push(`${where}: missing meaning`);
  if (!syllables.has(e.startingSound)) errors.push(`${where}: "${e.startingSound}" is not a pada syllable`);
  if (!["exact", "consonant-family"].includes(e.syllableMatch)) errors.push(`${where}: bad syllableMatch`);
  if (e.syllableMatch === "exact" && e.name && !startsWithSyllable(e.name, e.startingSound)) {
    errors.push(`${where}: marked exact but does not start with "${e.startingSound}"`);
  }
  if (errors.length) return;
  if (seen.has(e.name.toLowerCase())) { skipped++; return; }
  seen.add(e.name.toLowerCase());
  added.push(e);
});

if (errors.length) {
  console.error("REJECTED - fix these and re-run:\n  " + errors.join("\n  "));
  process.exit(1);
}

const merged = existing.concat(added).sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(NAMES, JSON.stringify(merged, null, 1) + "\n", "utf8");

const g = merged.reduce((a, e) => ((a[e.gender] = (a[e.gender] || 0) + 1), a), {});
const cov = new Set(merged.map((e) => e.startingSound));
const empty = [...syllables].filter((s) => !cov.has(s));
console.log(`added ${added.length}, skipped ${skipped} duplicates -> total ${merged.length}`);
console.log(`gender: M ${g.M || 0}  F ${g.F || 0}  U ${g.U || 0}`);
console.log(`syllables covered: ${cov.size}/${syllables.size}; still empty: ${empty.join(" ") || "none"}`);
