# NaamKaran — Android/iOS Build Guide

The mobile app is an [Expo](https://expo.dev) (React Native) app using Expo Router.
Unlike the other apps in this workspace, **NaamKaran has no backend** — the Nakshatra
calculation, numerology, and names dataset all run on-device from bundled JSON, so it
works fully offline. There is no `apiUrl` to configure.

---

## 1. Prerequisites (one-time)

```bash
npm install -g eas-cli      # or use npx eas-cli@latest below
eas login                   # sign in with your free Expo account (expo.dev/signup)
```

## 2. Install deps & link the project to EAS

```bash
cd mobile
npm install
eas init                    # creates/links an EAS project, writes extra.eas.projectId
```

## 3. Run the calculation-engine tests

Before building, it's worth re-running the unit tests that validate the Nakshatra/pada
math against a published panchang reference:

```bash
npm test
```

## 4. Build the APK (cloud build)

```bash
eas build --platform android --profile preview
```

- `preview` profile (see [`eas.json`](./eas.json)) produces an **APK** for internal
  distribution.
- The build runs on Expo's servers; when done you get a URL to download the `.apk`.
- First build also prompts to generate an Android Keystore — let EAS manage it (just
  press Enter / "yes").

## 5. Install on a phone

- Open the build URL on the Android device and download the `.apk`, **or**
- `eas build:run -p android` to install the latest build to a connected device/emulator.
- The phone must allow "Install unknown apps" for the browser/file manager.

---

## Profiles in `eas.json`

| Profile | Output | Use for |
|---|---|---|
| `development` | APK + dev client | live-reload debugging on device |
| `preview` | APK | **share with testers** (sideload) |
| `production` | AAB (app bundle) | Google Play submission |

## Going live — the real timeline

**The build is not the bottleneck. Store access is.**

### Android (Google Play)

Google requires **personal developer accounts created after 13 Nov 2023** to run a closed
test with **12 testers opted in continuously for 14 days**, then apply for production access
(review usually <= 7 days). Realistically **about 3 weeks** from account creation to a public
listing. "Opted in" means the tester accepted the invite *and installed* the app.

Exempt: **organization accounts**, and personal accounts created before 13 Nov 2023. If you
want to skip the 12-tester wait, register as an organization instead — it needs a D-U-N-S
number, which takes its own verification time but runs in parallel.

Fastest sensible order:

1. Pay the $25 and create the account **today** — the 14-day clock cannot start until it exists.
2. `eas build --platform android --profile production` (AAB) and upload to a **closed test**.
3. Recruit 12 testers and get them installed. The clock starts when 12 are opted in, and
   **resets if you drop below 12**.
4. While the clock runs, ship APK builds to family and friends for real feedback (below).
5. Day 14: apply for production access.

### iOS (App Store)

Apple Developer Program is **$99/year** with no tester gate. Build with
`eas build --platform ios --profile production`, then `eas submit --platform ios`. Review is
typically 1-3 days, so iOS can genuinely be live sooner than Android here — but the annual
fee is the trade-off.

### Available immediately: a sideloadable APK

```bash
eas build --platform android --profile preview
```

Produces an installable `.apk` you can send to anyone today. No store, no review, no waiting.
This is the right way to get the name data in front of family members who can tell you whether
the meanings and gender tags read correctly.

## Quick local preview (no build)

```bash
cd mobile
npx expo start          # scan the QR with Expo Go (expo.dev/go) on your phone
```

## Before shipping — things to revisit

- **App icon/splash**: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`,
  and `assets/favicon.png` are currently placeholders copied over from CareerBandhu for
  scaffolding purposes — swap in real NaamKaran branding before a store submission.
- **Names dataset** (`data/names.json`): seeded with ~100 well-known names covering about
  half of the 108 Nakshatra-pada syllables. Expand it over time — the ranking pipeline
  (`lib/suggest.ts`) already falls back gracefully to the rest of the Nakshatra when a
  specific syllable has too few names.
- **Numerology compatibility table** (`data/numerologyCompatibility.json`): built from the
  classical Vedic planetary-friendship chart, but numerologists differ on this table (especially
  the rows for numbers 4 and 7, tied to the shadow planets Rahu/Ketu). Worth a sanity check
  against a source/pandit you trust before treating it as authoritative.
