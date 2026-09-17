# HinduNaamKaran — data sources, provenance and licensing

Everything the app shows is bundled on-device. There is no backend. This file records
where each dataset came from and why we are entitled to ship it.

---

## 1. Names (`data/names.json`) — 2099 entries

| Source | Entries |
|---|---|
| Common Sanskrit/Hindi usage | 1043 |
| Vishnu Sahasranama | 187 |
| Shiva Sahasranama (Linga Purana) | 139 |
| Lalita Sahasranama | 134 |
| Named after a holy place | 70 |
| Historical figure | 58 |
| Saraswati Ashtottara Shatanamavali | 38 |
| Lakshmi Ashtottara Shatanamavali | 32 |
| Subrahmanya Ashtottara Shatanamavali | 31 |
| Durga Ashtottara Shatanamavali | 30 |
| Character in the Mahabharata | 29 |
| Character in the Ramayana | 23 |
| Gauri Ashtottara Shatanamavali | 22 |
| Ganesha Ashtottara Shatanamavali | 21 |
| Character in the Bhagavata Purana | 19 |
| Name of Shiva | 19 |
| Name of Vishnu | 17 |
| Vedic rishi | 15 |
| Form of the Devi | 14 |
| Name of Krishna | 12 |
| Name of Ganesha | 11 |
| Name of Kartikeya | 9 |
| Puranic rishi | 8 |
| Form of the Devi (Navadurga) | 7 |
| Navagraha (Moon) | 7 |
| Ashta Dikpalaka (Kubera, north) | 6 |
| Name of Hanuman | 6 |
| Name of Lakshmi | 6 |
| Name of Brahma | 6 |
| Named after a holy river | 5 |
| Navagraha (Sun) | 5 |
| Ashta Dikpalaka (Agni, south-east) | 4 |
| Navagraha (Mars) | 4 |
| Divine object | 4 |
| Vedic rishika | 4 |
| Ashta Dikpalaka (Vayu, north-west) | 4 |
| Form of the Devi (Mahavidya) | 3 |
| Divine vehicle (Vishnu) | 3 |
| Divine object (Vishnu) | 3 |
| Divine vehicle (Kartikeya) | 3 |
| Ashta Dikpalaka (Indra, east) | 3 |
| Divine vehicle (Indra) | 2 |
| Wife of a Vedic rishi | 2 |
| Navagraha (Venus) | 2 |
| Navagraha (Jupiter) | 2 |
| Divine object (Shiva) | 2 |
| Ashta Dikpalaka (Yama, south) | 2 |
| Consort of Kartikeya | 2 |
| Name of Parvati | 2 |
| Name of Ayyappa | 2 |
| Ashta Dikpalaka (Varuna, west) | 2 |
| Divine vehicle (Ganesha) | 2 |
| Name of Rama | 2 |
| Navagraha (Saturn) | 2 |
| Divine object (Arjuna) | 1 |
| Divine vehicle (Saraswati) | 1 |
| Divine being | 1 |
| Character in the Katha Upanishad | 1 |
| Divine vehicle (Shiva) | 1 |
| Divine object (Krishna) | 1 |
| Divine vehicle (Kubera) | 1 |
| Divine object (Indra) | 1 |
| Vedic deity | 1 |

Overall: 1197 masculine, 804 feminine, 98 unisex.

Regional and language origins include Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Rajasthani and Persian-Hindi loanwords in everyday Hindu use. Names without a verse number are attributed by category (character in an epic, form of the Devi, name of a deity, divine vehicle or object, holy place, historical figure).

**Coverage rule** (`__tests__/coverage.test.ts`): every syllable that has any names must offer at least two Best-ranked names for every birth number, counting natural spelling variations. The app also fills a thin Best bucket at runtime with labelled spelling variations of real names, and shows alternate spellings with their ranks on every card.

`__tests__/names-data.test.ts` runs the same checks over the whole file on every `npm test`.

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

1 of the 95 pada syllables has no names: Yi. No Hindu given name begins with this sound.
Regional usage filled the others that Sanskrit alone could not (Tamil "Tha" and "Cho" names,
Kannada "Ho", Telugu "Ye", Gujarati "Kho", Bengali "No" and "Do"). `lib/suggest.ts` widens to the
nakshatra or rashi syllables when a list is thin and says so on screen.

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
