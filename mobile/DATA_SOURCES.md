# HinduNaamKaran — data sources, provenance and licensing

Everything the app shows is bundled on-device. There is no backend. This file records
where each dataset came from and why we are entitled to ship it.

---

## 1. Names (`data/names.json`) — 644 entries

| Origin | Entries | Gender |
|---|---|---|
| Vishnu Sahasranama | 187 | masculine (some unisex) |
| Lalita Sahasranama | 134 | feminine (some unisex) |
| Ganesha Ashtottara Shatanamavali | 21 | masculine |
| Common Sanskrit/Hindi usage | 302 | mixed (322 M / 285 F / 37 U overall) |

Add names in batches with `node scripts/merge-names.js batch.json`. It rejects any entry whose
syllable is not one of the 108, whose "exact" match does not actually start with that syllable
(vowel-length aware: Deepika ↔ `Di`), or that duplicates an existing name.

### Licensing position — read this before adding more names

The **Sanskrit names themselves and their canonical numbering are ancient, public-domain
scripture**. Transliterating them into Roman script is a mechanical transformation, not a
creative act, so the name list is free to use.

**The English meanings in this app were written for this project.** They were *not* copied
from any of the sites that host these texts. This matters: the well-known online editions
(for example sanskritdocuments.org) carry an explicit notice restricting commercial use and
redistribution, and their English translations are the creative work of named translators.
Citing such a site would not grant a licence to redistribute its translations inside a
shipped app.

So the rule for anyone extending this dataset:

- **Do** take names and verse numbers from the scripture.
- **Do not** paste in meanings from a website, PDF, or book that is still in copyright.
- Write the gloss yourself, or use a translation that is genuinely public domain.

Each entry carries a `source` field (e.g. `"Vishnu Sahasranama #582"`) which is rendered on
the name detail screen, so every meaning shown to a user is attributed to the primary text.

### `syllableMatch`

- `exact` — the name literally begins with one of the 108 pada syllables.
- `consonant-family` — the name begins with a consonant cluster whose exact akshara is not
  one of the 108 pada syllables, so it is grouped with the closest syllable in the same
  consonant family (Shiva → `Sha`, Pradyumna → `Pa`, Trilochana → `Ti`). This is a
  documented approximation, surfaced to the user in the detail screen.

### Known gaps

14 of the 95 distinct pada syllables still have **no** names: Cho, Vu, Vo, Ing, Ho, Do, Tha, Po, No, Yi, Ye, Khi, Kho, Ge.
These sounds essentially never begin a Sanskrit or Hindi given name — a search across
~2,000 scriptural names and the common modern vocabulary found nothing honest to add.
`lib/suggest.ts` handles this by widening to the rest of the nakshatra and telling the user
it has done so. Do not fill these with invented names.

5 syllables have only one name: Gha, Pe, Bhe, Khe, Jha.

### Gender tagging caveat

Names attested in both a masculine text (Vishnu/Ganesha) and the feminine Lalita
Sahasranama are tagged unisex (28 names). A few scriptural epithets that are masculine in
context but unambiguously feminine in modern Indian usage were overridden to feminine by
hand (Durga, Mahamaya, Dhanya). **More of these probably need review** — a scriptural
epithet of Vishnu is not automatically a workable modern boy's name.

---

## 2. Nakshatra → naming syllable table (`data/nakshatraPadaSyllables.json`)

The standard 27 × 4 = 108 pada syllable table, cross-checked against
[Drik Panchang's Nakshatra Pada Swar table](https://www.drikpanchang.com/swar-siddhanta/nakshatra/nakshatra-pada-swar-siddhanta.html).
This is traditional reference data, not one author's creation.

Romanisation is normalised to single-vowel forms (`Laa`→`La`, `Vaa`→`Va`, `Kee`→`Ki`) so it
matches the names dataset consistently.

---

## 3. Numerology tables

- `data/chaldeanLetterValues.json` — the standard Chaldean letter→number chart (1–8, no 9).
- `data/numerologyCompatibility.json` — **the most debatable file in the project.** It is
  derived from the classical Vedic *Graha Maitri* (planetary friendship) chart applied to the
  standard Chaldean number→planet rulership. Rows for 4 (Rahu) and 7 (Ketu) are uniformly
  neutral because the classical seven-planet texts do not define friendships for the shadow
  planets. Numerologists genuinely differ here. Treat it as a reasonable default and adjust
  it against a source you trust — it is a plain JSON matrix, no code changes needed.

Relationship asymmetry (Saturn treats Mars as an enemy; Mars treats Saturn as neutral) is
intentional and matches classical doctrine. It is not a bug.

---

## 4. Cities (`city-timezones` npm package)

7,326 cities with latitude, longitude and IANA timezone, bundled offline so no geocoding API
is needed. Note the province names are dated — Hyderabad is listed under "Andhra Pradesh"
rather than Telangana (formed 2014). Coordinates and timezones, which are what the
calculation actually uses, are correct.

---

## 5. Astronomy

Moon position comes from the `astronomy-engine` npm package (MIT licence, pure TypeScript,
no native modules). Sidereal longitude uses a linear Lahiri ayanamsa approximation —
arc-minute grade, documented in `lib/astro.ts`.

**Validation:** for New Delhi on 2026-09-04, Drik Panchang publishes the Rohini → Mrigashira
transition at 11:04 PM IST. `lib/astro.ts` puts the boundary at sidereal longitude 53.336°
against a true boundary of 53.333° — about 11 arcseconds, roughly a minute of clock time.
This is covered by `__tests__/astro.test.ts`.
