import React from "react";
import { Platform } from "react-native";
import Head from "expo-router/head";
import seo from "../seo/config.json";

type AppPage = keyof typeof seo.app;

/**
 * Web-only <head> for an app screen: title, description, canonical URL and social
 * preview, all worded in seo/config.json. Rendered into the static HTML at build
 * time, so search engines see it without running JavaScript.
 *
 * `noindex` is for screens whose content depends on a family's birth details
 * (results, name detail): useful to them, empty to a search engine.
 */
export function PageHead({ page, path, noindex = false, jsonLd }: { page: AppPage; path: string; noindex?: boolean; jsonLd?: object }) {
  if (Platform.OS !== "web") return null;
  const { title, description } = seo.app[page];
  const url = seo.site.origin + path;
  const image = seo.site.origin + seo.site.ogImage;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large"} />
      {!noindex && <link rel="canonical" href={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={seo.site.name} />
      <meta property="og:locale" content={seo.site.locale} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Head>
  );
}

/** Structured data for the home page: the site, its maker, and the app itself. */
export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${seo.site.origin}/#website`,
      name: seo.site.name,
      alternateName: seo.site.alternateNames,
      url: `${seo.site.origin}/`,
      inLanguage: "en-IN",
      publisher: { "@id": `${seo.site.makerUrl}/#org` },
    },
    { "@type": "Organization", "@id": `${seo.site.makerUrl}/#org`, name: seo.site.makerName, url: seo.site.makerUrl },
    {
      "@type": "WebApplication",
      name: seo.site.name,
      url: `${seo.site.origin}/`,
      description: seo.app.home.description,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web, Android",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      sameAs: [seo.site.playUrl],
      publisher: { "@id": `${seo.site.makerUrl}/#org` },
    },
  ],
};

/** Web-only row of plain links from the home page into the static name pages. */
export function BrowseLinks() {
  if (Platform.OS !== "web") return null;
  return React.createElement(
    "nav",
    { className: "hnk-browse", "aria-label": seo.homeLinks.heading },
    React.createElement("h2", null, seo.homeLinks.heading),
    React.createElement(
      "ul",
      null,
      seo.homeLinks.links.map((l) => React.createElement("li", { key: l.href }, React.createElement("a", { href: l.href }, l.label)))
    )
  );
}
