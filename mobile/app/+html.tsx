import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Web-only page shell. Adds a soft festive background: warm marigold / pink glows and a faint
// rangoli dot pattern. Screens are transparent on the web (SCREEN_BG) so this shows through.
const RANGOLI = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>` +
    `<g fill='#0e7490' fill-opacity='0.12'>` +
    `<circle cx='28' cy='28' r='2.2'/>` +
    `<ellipse cx='28' cy='21.5' rx='1.6' ry='3.4'/><ellipse cx='28' cy='34.5' rx='1.6' ry='3.4'/>` +
    `<ellipse cx='21.5' cy='28' rx='3.4' ry='1.6'/><ellipse cx='34.5' cy='28' rx='3.4' ry='1.6'/>` +
    `<circle cx='0' cy='0' r='1.4'/><circle cx='56' cy='0' r='1.4'/><circle cx='0' cy='56' r='1.4'/><circle cx='56' cy='56' r='1.4'/>` +
    `<circle cx='14' cy='14' r='0.9'/><circle cx='42' cy='14' r='0.9'/><circle cx='14' cy='42' r='0.9'/><circle cx='42' cy='42' r='0.9'/>` +
    `</g></svg>`
);

const css = `
body {
  background-color: #f4fbfb;
  background-image:
    radial-gradient(ellipse at 0% 0%, rgba(103, 232, 249, 0.40), transparent 45%),
    radial-gradient(ellipse at 100% 12%, rgba(253, 224, 71, 0.38), transparent 42%),
    radial-gradient(ellipse at 10% 100%, rgba(167, 243, 208, 0.40), transparent 48%),
    radial-gradient(ellipse at 100% 100%, rgba(250, 204, 21, 0.30), transparent 45%),
    url("data:image/svg+xml,${RANGOLI}");
  background-attachment: fixed;
}
/* Colourful layers drawn behind RN views on the web (see app/index.tsx). */
.hnk-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #0e7490 0%, #6d4fc4 55%, #db2777 100%); }
.hnk-cta-bg { position: absolute; inset: 0; background: linear-gradient(90deg, #f97316 0%, #ec4899 100%); }
/* Header bar: saffron (brand) flowing into peacock blue. Older browsers get the fixed-stop version. */
.hnk-header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #c2410c 0%, #b8336a 40%, #6d4fc4 72%, #0e7490 100%);
  background: linear-gradient(in oklch shorter hue 90deg, #c2410c, #0e7490);
}
/* Home-page links into the static name pages (components/PageHead.tsx BrowseLinks). */
.hnk-browse { margin: 18px 0 6px; }
.hnk-browse h2 { font: 800 16px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 0 0 8px; text-align: center; }
.hnk-browse ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.hnk-browse a {
  display: inline-block; padding: 7px 12px; border-radius: 999px; text-decoration: none;
  font: 600 13px/1.2 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #0e7490; background: #fff; border: 1px solid #cbe7ec;
}
.hnk-browse a:hover { color: #c2410c; border-color: #f5c3a5; }
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#c2410c" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
