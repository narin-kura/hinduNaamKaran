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

## Later: publish to Google Play / App Store

1. **Android**: pay the one-time **$25** Google Play developer registration, then
   `eas build --platform android --profile production` (produces an `.aab`), then
   `eas submit --platform android`.
2. **iOS**: requires an active Apple Developer Program membership ($99/yr), then
   `eas build --platform ios --profile production`, then `eas submit --platform ios`.

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
