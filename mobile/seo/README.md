# Search pages (SEO)

The app at hindunaamkaran.com is one page that needs JavaScript, so on its own search
engines see a single page. `npm run build:web` therefore does two things:

1. `expo export --platform web` builds the app into `dist/`. Each screen's `<title>`,
   description and canonical URL come from `components/PageHead.tsx`.
2. `node scripts/build-seo.js` adds about 3,000 plain HTML pages to `dist/`. They
   need no JavaScript, so Google, Bing and AI assistants can all read them:

| URL | Page |
|---|---|
| `/names` | hub: boy/girl, A to Z, nakshatra, rashi, collections |
| `/names/boy`, `/names/girl` | every boy / girl name, grouped by letter |
| `/names/starting-with/a` | names starting with a letter |
| `/names/aarav` | one page per name: meaning, nakshatra/rashi fit, numerology |
| `/names/vishnu-names`, `/names/telugu-baby-names`, ... | themed collections |
| `/nakshatra`, `/nakshatra/ashwini` | the 27 nakshatras, their pada syllables and names |
| `/rashi`, `/rashi/mesha` | the 12 rashis, their syllables and names |
| `/sitemap.xml`, `/robots.txt`, `/404.html` | for crawlers |

## Where to change wording

| To change | Edit |
|---|---|
| Page titles, descriptions, headings, home-page browse links | `seo/config.json` |
| Other spellings / regional names of nakshatras (Aswini, Karthigai, Atham...) | `seo/nakshatras.json` |
| Rashi English names and other spellings | `seo/rashis.json` |
| Themed collections (which names, title, intro) | `seo/collections.json` |
| HTML layout | `seo/templates/` (`partials/` for repeated bits) |
| Styling | `seo/site.css` |

Google reads titles, headings, link text and body text; the old `<meta keywords>` tag
is ignored, so search phrases belong in those places, not in a keywords list.

`seo/naming.js` is a plain-JS copy of the numerology and syllable logic in `lib/`.
`__tests__/seo.test.ts` checks it against `lib/` for every name, and checks the built
site for broken links, missing anchors and duplicate titles.

## Hosting

Caddy on the Oracle VM serves `dist/` (see `deploy-oracle/Caddyfile`): `/x` serves
`x.html`, `/name/*` serves the app's `name/[id].html`, unknown paths get `404.html`
with a real 404, and `www.` and `hindunaamkaran.vigyatri.com` redirect to
`https://hindunaamkaran.com`.
