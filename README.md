# HinduNaamKaran

Hindu baby-name suggestions from the baby's birth star, the traditional way, on your phone and
fully offline.

Enter a birth date, time and place. The app computes the Moon's sidereal position at that
moment to find the **Nakshatra**, its **pada** and the **Rashi**, looks up the traditional
naming syllable for that pada, and shows names beginning with that sound. Each name is then
ranked **Best / Good / Worst** by Chaldean numerology against the baby's birth number.

- **944 names**, each with a meaning and a citation down to the verse: Vishnu Sahasranama,
  Shiva Sahasranama, Lalita Sahasranama, and the Lakshmi, Durga, Gauri and Ganesha
  Ashtottara Shatanamavalis, plus widely used modern names.
- **No backend, no account, no network calls.** Birth details never leave the device.
- **Verified astronomy.** The nakshatra calculation reproduces a published Drik Panchang
  transition to within about a minute.

Published by **Vigyatri Solutions LLP**. Android and iOS via Expo.

## Repository layout

| Path | What it is |
|---|---|
| [`mobile/`](mobile/) | The Expo / React Native app (Expo Router, TypeScript) |
| [`mobile/lib/astro.ts`](mobile/lib/astro.ts) | Moon sidereal longitude → nakshatra, pada, rashi, syllable |
| [`mobile/lib/numerology.ts`](mobile/lib/numerology.ts) | Chaldean name numbers and the compatibility matrix |
| [`mobile/lib/suggest.ts`](mobile/lib/suggest.ts) | Filtering, ranking, fallback when a syllable is sparse |
| [`mobile/data/`](mobile/data/) | Names, the 108-pada syllable table, numerology tables |
| [`mobile/scripts/merge-names.js`](mobile/scripts/merge-names.js) | Validated way to add names in batches |

## Documentation

- [`mobile/MOBILE_BUILD.md`](mobile/MOBILE_BUILD.md) — run locally, build with EAS, the store timeline
- [`mobile/DATA_SOURCES.md`](mobile/DATA_SOURCES.md) — where every dataset comes from, the licensing
  position, known gaps, and the deliberately debatable numerology table
- [`mobile/store/PLAY_LISTING.md`](mobile/store/PLAY_LISTING.md) — Google Play listing copy and setup

## Quick start

```bash
cd mobile
npm install
npm test          # 19 tests: astronomy against a panchang reference, numerology, dataset integrity
npx expo start    # scan the QR with Expo Go
```

## A note on tradition

Naming customs vary by region and family, and numerology systems differ between
practitioners. The app says so on screen. Treat its suggestions as a starting point for
reflection and family discussion, not a substitute for a family priest or astrologer.

## Adding names

Names and verse numbers come from public-domain scripture. **Meanings are written for this
project, not copied** — the online editions that host these texts restrict commercial reuse of
their translations. Read the licensing section of `DATA_SOURCES.md` before contributing, then:

```bash
node scripts/merge-names.js my-batch.json
```

The script refuses anything that isn't one of the 108 pada syllables, any "exact" match that
doesn't truly begin with its syllable, and any duplicate.
