#!/usr/bin/env node
/**
 * Builds the crawlable web pages that search engines index, into dist/ after
 * `expo export --platform web` (run both with `npm run build:web`):
 *
 *   /names                      hub: boy/girl, A-Z, nakshatra, rashi, collections
 *   /names/boy, /names/girl     every boy / girl name, grouped by letter
 *   /names/starting-with/<l>    names starting with a letter
 *   /names/<name>               one page per name (meaning, nakshatra fit, numerology)
 *   /names/<collection-slug>    themed lists (Vishnu names, Telugu names, ...)
 *   /nakshatra, /nakshatra/<n>  27 birth stars with their pada syllables and names
 *   /rashi, /rashi/<r>          12 moon signs with their syllables and names
 *   /404.html, /sitemap.xml, /robots.txt, /site.css
 *
 * All wording (titles, descriptions, headings, search terms) lives in seo/*.json and
 * the HTML in seo/templates/; this file only wires data into them. Pages are plain HTML
 * with no JavaScript, so every crawler (Google, Bing, AI assistants) can read them.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const naming = require("../seo/naming");

const ROOT = path.join(__dirname, "..");
const SEO_DIR = path.join(ROOT, "seo");
const config = require("../seo/config.json");
const collectionsConfig = require("../seo/collections.json");
const nakshatraAka = require("../seo/nakshatras.json");
const { rashis: RASHIS } = require("../seo/rashis.json");
const NAMES = require("../data/names.json");

const SITE = config.site;
const P = config.pages;

// ---------- templating ----------

function loadTemplates() {
  const out = {};
  const walk = (dir, prefix) => {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) walk(full, `${prefix}${f}/`);
      else if (f.endsWith(".html")) out[`${prefix}${f.replace(/\.html$/, "")}`] = fs.readFileSync(full, "utf8");
    }
  };
  walk(path.join(SEO_DIR, "templates"), "");
  return out;
}
const T = loadTemplates();

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** {{key}} is HTML-escaped, {{{key}}} is inserted as-is. Every key must be supplied. */
function render(name, vars) {
  const tpl = T[name];
  if (tpl === undefined) throw new Error(`No template seo/templates/${name}.html`);
  return tpl.replace(/\{\{\{(\w+)\}\}\}|\{\{(\w+)\}\}/g, (_, raw, plain) => {
    const key = raw || plain;
    if (!(key in vars)) throw new Error(`Template ${name}: no value for {{${key}}}`);
    return raw ? String(vars[key]) : esc(vars[key]);
  }).trim();
}

/** Fill {{placeholders}} in a plain-text string from seo/*.json (escaped later, by render). */
function fill(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`"${str}": no value for {{${key}}}`);
    return String(vars[key]);
  });
}

const renderAll = (name, list) => list.map((vars) => render(name, vars)).join("\n");
const abs = (p) => SITE.origin + (p === "/" ? "/" : p);
const fmtCount = (n) => n.toLocaleString("en-IN");

/** "a, b and c" */
const andList = (xs) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const ordinal = (n) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th");
  return `${n}${s}`;
};

// ---------- data ----------

const GENDER = {
  M: { key: "m", short: "Boy", title: "Boy", label: "Boy", phrase: "baby boy", plural: "boy" },
  F: { key: "f", short: "Girl", title: "Girl", label: "Girl", phrase: "baby girl", plural: "girl" },
  U: { key: "u", short: "Unisex", title: "Unisex", label: "Boy or girl (unisex)", phrase: "boy or girl", plural: "unisex" },
};

const byName = (a, b) => a.name.localeCompare(b.name, "en");
const names = NAMES.map((e) => ({
  ...e,
  slug: naming.slugify(e.name),
  href: `/names/${naming.slugify(e.name)}`,
  letter: e.name[0].toUpperCase(),
})).sort(byName);

const nakshatras = naming.NAKSHATRAS.map((n, i) => ({
  index: i,
  name: n.nakshatra,
  slug: naming.slugify(n.nakshatra),
  href: `/nakshatra/${naming.slugify(n.nakshatra)}`,
  aka: nakshatraAka[n.nakshatra] || [],
  padas: naming.PADAS.filter((p) => p.nakshatraIndex === i),
}));
const rashis = RASHIS.map((r, i) => ({
  ...r,
  index: i,
  slug: naming.slugify(r.name),
  href: `/rashi/${naming.slugify(r.name)}`,
  padas: naming.PADAS.filter((p) => p.rashiIndex === i),
}));
const nakshatraByIndex = (i) => nakshatras[i];
const rashiByIndex = (i) => rashis[i];

const namesBySyllable = new Map();
for (const n of names) {
  if (!namesBySyllable.has(n.startingSound)) namesBySyllable.set(n.startingSound, []);
  namesBySyllable.get(n.startingSound).push(n);
}
const namesFor = (syllable) => namesBySyllable.get(syllable) || [];

const letters = naming.unique(names.map((n) => n.letter)).sort();
const letterHref = (l) => `/names/starting-with/${l.toLowerCase()}`;

const collections = collectionsConfig.collections
  .map((c) => ({
    ...c,
    href: `/names/${c.slug}`,
    members: names.filter((n) => c.origins.includes(n.origin) || c.sourcePrefixes.some((p) => n.source.startsWith(p))),
  }))
  .filter((c) => c.members.length >= collectionsConfig.minNames);

// Every /names/<x> path must be unique: a name can never be called "boy" or "vishnu-names".
{
  const taken = new Set(["boy", "girl", "starting-with", ...collections.map((c) => c.slug)]);
  for (const n of names) {
    if (!n.slug) throw new Error(`Name "${n.name}" has an empty slug`);
    if (taken.has(n.slug)) throw new Error(`Name slug "${n.slug}" clashes with another /names page`);
    taken.add(n.slug);
  }
}

// ---------- shared fragments ----------

const syllableAnchor = (s) => `syl-${naming.slugify(s)}`;

function nameItems(list) {
  return renderAll(
    "partials/name-item",
    list.map((n) => ({ href: n.href, name: n.name, genderKey: GENDER[n.gender].key, genderShort: GENDER[n.gender].short, meaning: n.meaning }))
  );
}

function nameSection(id, heading, list, noteText) {
  return render("partials/name-section", {
    id,
    heading,
    note: noteText ? render("partials/note", { text: noteText }) : "",
    items: nameItems(list),
  });
}

function tileSection(heading, tiles) {
  return render("partials/tile-section", {
    heading,
    items: renderAll(
      "partials/tile",
      tiles.map((t) => ({ href: t.href, label: t.label, sub: t.sub ? `<span class="sub">${esc(t.sub)}</span>` : "" }))
    ),
  });
}

function breadcrumbs(trail) {
  const items = trail.map((c, i) =>
    i === trail.length - 1 ? render("partials/crumb-current", { label: c.label }) : render("partials/crumb", c)
  );
  return render("partials/breadcrumbs", { items: items.join("") });
}

function breadcrumbLd(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: abs(c.href) })),
  };
}

const sourcesHtml = (keys) =>
  renderAll("partials/source-item", keys.map((k) => ({ url: config.sources[k].url, label: config.sources[k].label })));

const prevNext = (prev, next) =>
  [prev && render("partials/link", { href: prev.href, rel: "prev", label: `← ${prev.label}` }), next && render("partials/link", { href: next.href, rel: "next", label: `${next.label} →` })]
    .filter(Boolean)
    .join("");

const HOME = { label: "Home", href: "/" };
const NAMES_HUB = { label: "Hindu baby names", href: P.namesHub.path };
const NAK_HUB = { label: "Nakshatra names", href: P.nakshatraHub.path };
const RASHI_HUB = { label: "Rashi names", href: P.rashiHub.path };

// ---------- page assembly ----------

let cssHref = "/site.css";

function page({ urlPath, title, description, content, trail, ld = [], sources = ["padaTable", "nameData", "method"], index = true }) {
  const canonical = abs(urlPath);
  const graph = [
    { "@type": "WebSite", "@id": `${SITE.origin}/#website`, name: SITE.name, url: `${SITE.origin}/`, inLanguage: "en-IN", publisher: { "@id": `${SITE.makerUrl}/#org` } },
    { "@type": "Organization", "@id": `${SITE.makerUrl}/#org`, name: SITE.makerName, url: SITE.makerUrl },
    ...(trail ? [breadcrumbLd(trail)] : []),
    ...ld.map((x) => ({ url: canonical, ...x })),
  ];
  const html = render("layout", {
    title,
    description,
    robots: index ? "index, follow, max-image-preview:large" : "noindex, follow",
    canonical,
    themeColor: SITE.themeColor,
    siteName: SITE.name,
    locale: SITE.locale,
    ogImage: abs(SITE.ogImage),
    cssHref,
    jsonld: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
    breadcrumbs: trail ? breadcrumbs(trail) : "",
    content,
    playUrl: SITE.playUrl,
    sources: sourcesHtml(sources),
    tagline: SITE.tagline,
    makerUrl: SITE.makerUrl,
    makerName: SITE.makerName,
  });
  return { urlPath, html: html + "\n", index, title, description };
}

function namePage(n, i) {
  const g = GENDER[n.gender];
  const padas = naming.padasForSyllable(n.startingSound);
  const number = naming.getNameNumber(n.name);
  const planet = naming.PLANET_OF_NUMBER[number];
  const bd = naming.getNameNumberBreakdown(n.name);
  const days = naming.birthDaysByRank(number);
  const variants = naming.syllableVariants(n.startingSound);

  const fitShort = padas.length
    ? andList(padas.map((p) => `${p.nakshatra} pada ${p.pada} (${p.rashi} rashi)`))
    : "no single nakshatra pada";
  const vars = {
    name: n.name,
    genderTitle: g.title,
    genderPhrase: g.phrase,
    meaning: n.meaning.replace(/[.;\s]+$/, ""),
    syllable: n.startingSound,
    fitShort,
    number,
  };

  // Up to 12 other names with the same syllable, same gender first, nearest alphabetically.
  const pool = namesFor(n.startingSound).filter((x) => x.slug !== n.slug);
  const pos = pool.findIndex((x) => x.name.localeCompare(n.name, "en") > 0);
  const near = (x) => Math.abs(pool.indexOf(x) - (pos === -1 ? pool.length : pos));
  const similarList = [...pool]
    .sort((a, b) => (a.gender === n.gender ? 0 : 1) - (b.gender === n.gender ? 0 : 1) || near(a) - near(b))
    .slice(0, 12)
    .sort(byName);
  const firstNak = padas[0] && nakshatraByIndex(padas[0].nakshatraIndex);
  const similar = similarList.length
    ? render("partials/similar", {
        heading: `More names starting with ${n.startingSound}`,
        items: nameItems(similarList),
        moreHref: firstNak ? `${firstNak.href}#${syllableAnchor(n.startingSound)}` : letterHref(n.letter),
        moreLabel: firstNak ? `All ${firstNak.name} nakshatra names` : `All names starting with ${n.letter}`,
      })
    : "";

  const breakdown =
    bd.letters.map((l) => `${l.letter} ${l.value}`).join(" + ") + ` = ${bd.total}` + bd.steps.map((s) => ` → ${s}`).join("");
  const dayList = (ds) => andList(ds.map(ordinal));
  const prev = names[i - 1], next = names[i + 1];
  const trail = [HOME, NAMES_HUB, { label: `Names starting with ${n.letter}`, href: letterHref(n.letter) }, { label: n.name, href: n.href }];

  const content = render("name", {
    ...vars,
    genderLabel: g.label,
    origin: n.origin,
    source: n.source,
    syllableVariants: variants.length ? ` (also written ${andList(variants)})` : "",
    planet,
    fitList: padas.length
      ? renderAll(
          "partials/fit-item",
          padas.map((p) => ({
            nakshatraHref: `${nakshatraByIndex(p.nakshatraIndex).href}#${syllableAnchor(p.syllable)}`,
            nakshatra: p.nakshatra,
            pada: p.pada,
            rashiHref: rashiByIndex(p.rashiIndex).href,
            rashi: p.rashi,
            english: rashiByIndex(p.rashiIndex).english,
          }))
        )
      : "<li>No single pada uses this syllable.</li>",
    clusterNote:
      n.syllableMatch === "consonant-family"
        ? render("partials/note", {
            text: `${n.name}'s first sound is not itself one of the 108 pada syllables, so it is grouped with the closest one in the same consonant family, ${n.startingSound}.`,
          })
        : "",
    breakdown,
    bestDays: dayList(days.best),
    goodDays: dayList(days.good),
    worstLine: days.worst.length ? render("partials/rank-avoid", { days: dayList(days.worst) }) : "",
    similar,
    prevNext: prevNext(prev && { href: prev.href, label: prev.name }, next && { href: next.href, label: next.name }),
  });

  return page({
    urlPath: n.href,
    title: fill(P.name.title, vars),
    description: fill(P.name.description, vars),
    content,
    trail,
    ld: [
      {
        "@type": "DefinedTerm",
        name: n.name,
        description: vars.meaning,
        inDefinedTermSet: { "@type": "DefinedTermSet", name: "Hindu baby names", url: abs(P.namesHub.path) },
      },
    ],
  });
}

function letterJump(currentLetter) {
  return render("partials/jump", {
    items: letters
      .map((l) => (l === currentLetter ? `<strong>${esc(l)}</strong>` : render("partials/link", { href: letterHref(l), rel: "", label: l })))
      .join(""),
  });
}

function anchorJump(groups) {
  return render("partials/jump", {
    items: groups.map((g) => render("partials/link", { href: `#${g.id}`, rel: "", label: g.label })).join(""),
  });
}

function letterPage(letter) {
  const list = names.filter((n) => n.letter === letter);
  const boys = list.filter((n) => n.gender === "M");
  const girls = list.filter((n) => n.gender === "F");
  const unisex = list.filter((n) => n.gender === "U");
  const vars = { letter, slug: letter.toLowerCase(), count: fmtCount(list.length), boys: fmtCount(boys.length), girls: fmtCount(girls.length) };
  const urlPath = fill(P.letter.path, vars);
  const sections = [
    boys.length && nameSection("boys", `Hindu baby boy names starting with ${letter}`, boys),
    girls.length && nameSection("girls", `Hindu baby girl names starting with ${letter}`, girls),
    unisex.length && nameSection("unisex", `Unisex names starting with ${letter}`, unisex),
  ].filter(Boolean).join("\n");
  const i = letters.indexOf(letter);
  return page({
    urlPath,
    title: fill(P.letter.title, vars),
    description: fill(P.letter.description, vars),
    trail: [HOME, NAMES_HUB, { label: `Starting with ${letter}`, href: urlPath }],
    content: render("list", {
      h1: fill(P.letter.h1, vars),
      intro: fill(P.letter.description, vars),
      jump: letterJump(letter),
      sections,
      related: render("partials/prevnext", {
        label: "Neighbouring letters",
        links: prevNext(
          i > 0 && { href: letterHref(letters[i - 1]), label: `Names starting with ${letters[i - 1]}` },
          i < letters.length - 1 && { href: letterHref(letters[i + 1]), label: `Names starting with ${letters[i + 1]}` }
        ),
      }),
    }),
    ld: [{ "@type": "CollectionPage", name: fill(P.letter.h1, vars) }],
  });
}

/** A long list split into one section per first letter, with a jump bar. */
function byLetterSections(list, headingFor) {
  const groups = letters
    .map((l) => ({ id: `letter-${l.toLowerCase()}`, label: l, list: list.filter((n) => n.letter === l) }))
    .filter((g) => g.list.length);
  return {
    jump: anchorJump(groups),
    sections: groups.map((g) => nameSection(g.id, headingFor(g.label), g.list)).join("\n"),
  };
}

function genderPage(gender) {
  const cfg = P.gender[gender];
  const list = names.filter((n) => n.gender === gender || n.gender === "U");
  const vars = { count: fmtCount(list.length) };
  const word = GENDER[gender].plural;
  const { jump, sections } = byLetterSections(list, (l) => `Hindu baby ${word} names starting with ${l}`);
  return page({
    urlPath: cfg.path,
    title: fill(cfg.title, vars),
    description: fill(cfg.description, vars),
    trail: [HOME, NAMES_HUB, { label: `${GENDER[gender].title} names`, href: cfg.path }],
    content: render("list", {
      h1: cfg.h1,
      intro: `${fill(cfg.description, vars)} Unisex names, used for both boys and girls, are included and marked.`,
      jump,
      sections,
      related: "",
    }),
    ld: [{ "@type": "CollectionPage", name: cfg.h1 }],
  });
}

function collectionPage(c) {
  const vars = { count: fmtCount(c.members.length) };
  const { jump, sections } = byLetterSections(c.members, (l) => `${c.h1} starting with ${l}`);
  const siblings = collections.filter((x) => x.group === c.group && x.slug !== c.slug);
  return page({
    urlPath: c.href,
    title: c.title,
    description: fill(c.description, vars),
    trail: [HOME, NAMES_HUB, { label: c.h1.replace(/^./, (s) => s.toUpperCase()), href: c.href }],
    content: render("list", {
      h1: c.h1.replace(/^./, (s) => s.toUpperCase()),
      intro: fill(c.intro, vars),
      jump: c.members.length > 40 ? jump : "",
      sections,
      related: siblings.length
        ? tileSection(collectionsConfig.groups[c.group], siblings.map((x) => ({ href: x.href, label: x.h1.replace(/^./, (s) => s.toUpperCase()), sub: `${fmtCount(x.members.length)} names` })))
        : "",
    }),
    ld: [{ "@type": "CollectionPage", name: c.h1 }],
  });
}

/** Sections of names for each distinct syllable in a set of padas (nakshatra or rashi page). */
function syllableSections(padas, contextFor) {
  return naming.unique(padas.map((p) => p.syllable)).map((syl) => {
    const list = namesFor(syl);
    const variants = naming.syllableVariants(syl);
    const notes = [
      variants.length ? `Also written ${andList(variants)}.` : "",
      list.length ? "" : `No names in our list start with ${syl} yet. Families often use any syllable of the nakshatra or rashi instead.`,
    ].filter(Boolean).join(" ");
    return nameSection(syllableAnchor(syl), `Names starting with ${syl} (${contextFor(syl)})`, list, notes);
  }).join("\n");
}

function nakshatraPage(nk) {
  const syllables = naming.unique(nk.padas.map((p) => p.syllable));
  const count = naming.unique(syllables.flatMap((s) => namesFor(s))).length;
  const vars = {
    nakshatra: nk.name,
    syllables: syllables.join(", "),
    count: fmtCount(count),
    akaShort: nk.aka.length ? ` (${nk.aka.slice(0, 3).join(", ")})` : "",
  };
  const prev = nakshatras[nk.index - 1], next = nakshatras[nk.index + 1];
  const content = render("nakshatra", {
    ...vars,
    number: nk.index + 1,
    h1: fill(P.nakshatra.h1, vars).replace(/^./, (s) => s.toUpperCase()),
    rashiSpan: naming.unique(nk.padas.map((p) => p.rashi)).join(" / "),
    akaLine: nk.aka.length ? render("partials/aka", { aka: andList(nk.aka) }) : "",
    padaRows: renderAll(
      "partials/pada-row",
      nk.padas.map((p) => ({
        pada: p.pada,
        anchor: syllableAnchor(p.syllable),
        syllable: p.syllable,
        variants: naming.syllableVariants(p.syllable).join(", ") || "—",
        rashiHref: rashiByIndex(p.rashiIndex).href,
        rashi: p.rashi,
        count: namesFor(p.syllable).length,
      }))
    ),
    sections: syllableSections(nk.padas, (syl) =>
      `${nk.name} pada ${andList(nk.padas.filter((p) => p.syllable === syl).map((p) => String(p.pada)))}`
    ),
    prevNext: prevNext(prev && { href: prev.href, label: `${prev.name}` }, next && { href: next.href, label: `${next.name}` }),
  });
  return page({
    urlPath: nk.href,
    title: fill(P.nakshatra.title, vars),
    description: fill(P.nakshatra.description, vars),
    trail: [HOME, NAK_HUB, { label: nk.name, href: nk.href }],
    content,
    ld: [{ "@type": "CollectionPage", name: fill(P.nakshatra.h1, vars) }],
  });
}

function rashiPage(r) {
  const syllables = naming.unique(r.padas.map((p) => p.syllable));
  const count = naming.unique(syllables.flatMap((s) => namesFor(s))).length;
  const vars = {
    rashi: r.name,
    english: r.english,
    syllables: syllables.join(", "),
    count: fmtCount(count),
    akaShort: r.aka.length ? `, ${r.aka.slice(0, 2).join(", ")}` : "",
  };
  const prev = rashis[r.index - 1], next = rashis[r.index + 1];
  return page({
    urlPath: r.href,
    title: fill(P.rashi.title, vars),
    description: fill(P.rashi.description, vars),
    trail: [HOME, RASHI_HUB, { label: r.name, href: r.href }],
    content: render("rashi", {
      ...vars,
      number: r.index + 1,
      h1: fill(P.rashi.h1, vars).replace(/^./, (s) => s.toUpperCase()),
      akaLine: r.aka.length ? render("partials/aka", { aka: andList(r.aka) }) : "",
      padaRows: renderAll(
        "partials/rashi-pada-row",
        r.padas.map((p) => ({
          nakshatraHref: nakshatraByIndex(p.nakshatraIndex).href,
          nakshatra: p.nakshatra,
          pada: p.pada,
          anchor: syllableAnchor(p.syllable),
          syllable: p.syllable,
          count: namesFor(p.syllable).length,
        }))
      ),
      sections: syllableSections(r.padas, (syl) =>
        andList(r.padas.filter((p) => p.syllable === syl).map((p) => `${p.nakshatra} pada ${p.pada}`))
      ),
      prevNext: prevNext(prev && { href: prev.href, label: prev.name }, next && { href: next.href, label: next.name }),
    }),
    ld: [{ "@type": "CollectionPage", name: fill(P.rashi.h1, vars) }],
  });
}

function namesHub() {
  const vars = { count: fmtCount(names.length) };
  const countOf = (g) => names.filter((n) => n.gender === g || n.gender === "U").length;
  const groupTiles = (group) =>
    collections.filter((c) => c.group === group).map((c) => ({ href: c.href, label: c.h1.replace(/^./, (s) => s.toUpperCase()), sub: `${fmtCount(c.members.length)} names` }));
  const sections = [
    tileSection("Boy and girl names", [
      { href: P.gender.M.path, label: "Hindu baby boy names", sub: `${fmtCount(countOf("M"))} names` },
      { href: P.gender.F.path, label: "Hindu baby girl names", sub: `${fmtCount(countOf("F"))} names` },
    ]),
    tileSection("Names A to Z", letters.map((l) => ({ href: letterHref(l), label: `Names starting with ${l}`, sub: `${fmtCount(names.filter((n) => n.letter === l).length)} names` }))),
    tileSection("Names by nakshatra (birth star)", nakshatras.map((nk) => ({ href: nk.href, label: `${nk.name} nakshatra`, sub: naming.unique(nk.padas.map((p) => p.syllable)).join(", ") }))),
    tileSection("Names by rashi (moon sign)", rashis.map((r) => ({ href: r.href, label: `${r.name} rashi (${r.english})`, sub: naming.unique(r.padas.map((p) => p.syllable)).join(", ") }))),
    ...Object.keys(collectionsConfig.groups).map((g) => tileSection(collectionsConfig.groups[g], groupTiles(g))),
  ].join("\n");
  return page({
    urlPath: P.namesHub.path,
    title: fill(P.namesHub.title, vars),
    description: fill(P.namesHub.description, vars),
    trail: [HOME, NAMES_HUB],
    content: render("hub", { h1: P.namesHub.h1.replace(/^./, (s) => s.toUpperCase()), intro: fill(P.namesHub.intro, vars), sections }),
    ld: [{ "@type": "CollectionPage", name: P.namesHub.h1 }],
  });
}

function nakshatraHub() {
  return page({
    urlPath: P.nakshatraHub.path,
    title: P.nakshatraHub.title,
    description: P.nakshatraHub.description,
    trail: [HOME, NAK_HUB],
    content: render("hub", {
      h1: P.nakshatraHub.h1.replace(/^./, (s) => s.toUpperCase()),
      intro: P.nakshatraHub.intro,
      sections: tileSection(
        "The 27 nakshatras",
        nakshatras.map((nk) => ({
          href: nk.href,
          label: `${nk.index + 1}. ${nk.name}`,
          sub: `${naming.unique(nk.padas.map((p) => p.syllable)).join(", ")} · ${naming.unique(nk.padas.map((p) => p.rashi)).join(" / ")}${nk.aka.length ? ` · ${nk.aka.slice(0, 2).join(", ")}` : ""}`,
        }))
      ),
    }),
    ld: [{ "@type": "CollectionPage", name: P.nakshatraHub.h1 }],
  });
}

function rashiHub() {
  return page({
    urlPath: P.rashiHub.path,
    title: P.rashiHub.title,
    description: P.rashiHub.description,
    trail: [HOME, RASHI_HUB],
    content: render("hub", {
      h1: P.rashiHub.h1.replace(/^./, (s) => s.toUpperCase()),
      intro: P.rashiHub.intro,
      sections: tileSection(
        "The 12 rashis",
        rashis.map((r) => ({ href: r.href, label: `${r.index + 1}. ${r.name} (${r.english})`, sub: naming.unique(r.padas.map((p) => p.syllable)).join(", ") }))
      ),
    }),
    ld: [{ "@type": "CollectionPage", name: P.rashiHub.h1 }],
  });
}

function notFoundPage() {
  return page({
    urlPath: "/404",
    title: P.notFound.title,
    description: P.notFound.description,
    content: render("404", { h1: P.notFound.h1 }),
    sources: ["method"],
    index: false,
  });
}

// ---------- whole site ----------

/** Every page this script owns, plus the app pages the sitemap should list. */
function buildSite() {
  const css = fs.readFileSync(path.join(SEO_DIR, "site.css"), "utf8");
  cssHref = `/site.css?v=${crypto.createHash("sha1").update(css).digest("hex").slice(0, 10)}`;
  const pages = [
    namesHub(),
    genderPage("M"),
    genderPage("F"),
    ...letters.map(letterPage),
    ...collections.map(collectionPage),
    nakshatraHub(),
    ...nakshatras.map(nakshatraPage),
    rashiHub(),
    ...rashis.map(rashiPage),
    ...names.map(namePage),
    notFoundPage(),
  ];
  // App screens worth indexing. /check, /results and /name/* need a family's birth
  // details, so they are noindex (components/PageHead.tsx) and left out.
  const appPaths = ["/", "/method"];
  const sitemapUrls = [...appPaths, ...pages.filter((p) => p.index).map((p) => p.urlPath)].map(abs);
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemapUrls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n") +
    "\n</urlset>\n";
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`;
  return { pages, css, sitemap, robots, sitemapUrls };
}

/** "/names/aarav" -> dist/names/aarav.html (Caddy's try_files maps {path}.html). */
const fileFor = (outDir, urlPath) => path.join(outDir, `${urlPath.replace(/^\//, "")}.html`);

function writeSite(outDir) {
  if (!fs.existsSync(path.join(outDir, "index.html"))) {
    throw new Error(`${outDir}/index.html not found: run \`expo export --platform web\` first (npm run build:web does both).`);
  }
  const site = buildSite();
  for (const p of site.pages) {
    const file = fileFor(outDir, p.urlPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, p.html);
  }
  fs.writeFileSync(path.join(outDir, "site.css"), site.css);
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), site.sitemap);
  fs.writeFileSync(path.join(outDir, "robots.txt"), site.robots);
  // Expo Router's dev-only route list; not a page anyone should land on from search.
  fs.rmSync(path.join(outDir, "_sitemap.html"), { force: true });
  return site;
}

module.exports = { buildSite, writeSite, render, esc };

if (require.main === module) {
  const outDir = path.resolve(process.argv[2] || path.join(ROOT, "dist"));
  const site = writeSite(outDir);
  console.log(`SEO pages: wrote ${site.pages.length} pages, sitemap with ${site.sitemapUrls.length} URLs, robots.txt -> ${outDir}`);
}
