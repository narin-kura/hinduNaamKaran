# HinduNaamKaran — Android/iOS Build Guide

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

### Android (Google Play) — publishing as Vigyatri Solutions

Publishing under the **Vigyatri Solutions organization account** sidesteps Google's
12-tester / 14-day closed-testing requirement, which only applies to *personal* accounts
created after 13 Nov 2023. Organization accounts can release straight to Production.

The trade-off: an organization account needs a **D-U-N-S number** (free, but a few days to
a few weeks from Dun & Bradstreet) plus identity verification. Start the D-U-N-S request
first — it is the long pole. Everything else (account, listing, build) can proceed in parallel.

Step-by-step setup, paste-ready listing text, the data-safety answers, and the
`eas submit` service-account wiring are all in **[`store/PLAY_LISTING.md`](./store/PLAY_LISTING.md)**.
The feature graphic is already generated at `store/feature-graphic-1024x500.png`.

Package name is `com.vigyatri.hindunaamkaran`. **It cannot be changed after the first upload.**

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

- **Names dataset** (`data/names.json`): 441 names covering 71 of the 95 pada syllables.
  24 syllables still have no names and 13 have only one — see `DATA_SOURCES.md`. Filling
  those needs regional/modern name sources, not more Sanskrit scripture.
- **Gender tags on scriptural epithets**: names were tagged from the text they appear in.
  A masculine epithet of Vishnu is not automatically a workable modern boy's name. A few
  were corrected by hand; more deserve a review by someone who knows current usage.
- **Numerology compatibility table** (`data/numerologyCompatibility.json`): the most
  debatable file in the project. Worth checking against a source or pandit you trust.
- **City provinces are dated** in the bundled `city-timezones` data (Hyderabad shows as
  Andhra Pradesh, not Telangana). Coordinates and timezones — what the maths actually
  uses — are correct.
- **Privacy policy**: both stores require one. The honest version is short: this app makes
  no network calls and collects nothing; birth details never leave the device.
