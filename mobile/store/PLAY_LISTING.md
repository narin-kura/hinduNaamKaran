# Google Play listing — HinduNaamKaran (Vigyatri Solutions)

Paste-ready content for the Play Console. Character limits are Google's.

---

## Identity

| Field | Value |
|---|---|
| Developer account | **Vigyatri Solutions** (organization account — exempt from the 12-tester rule) |
| App name (≤30) | `HinduNaamKaran` |
| Package name | `com.vigyatri.hindunaamkaran` — **cannot change after first upload** |
| Category | Parenting |
| Contact email | info@vigyatrisolutions.com |
| Website | https://vigyatri.com |
| Privacy policy URL | https://vigyatri.com/hindunaamkaran/privacy/ |
| Price | Free |
| Contains ads | No |
| In-app purchases | No |

## Short description (≤80 chars)

```
Hindu baby names by birth star (Nakshatra), ranked with numerology. Works offline.
```
(78 characters)

## Full description (≤4000 chars)

```
HinduNaamKaran suggests auspicious Hindu baby names the traditional way — from the baby's birth star.

HOW IT WORKS
Enter the date, time and place of birth. The app calculates the Moon's position at that moment to find the baby's Nakshatra (birth star), its pada (quarter), and the Rashi (moon sign). Each pada has a traditional naming syllable, and the app shows names beginning with that sound — the same method a family priest uses for Naamakaran.

Names are then ranked Best, Good or Worst using Chaldean numerology, comparing each name's number with the baby's birth number.

NAMES FROM SCRIPTURE
Names are drawn from the Vishnu Sahasranama, the Lalita Sahasranama and the Ganesha Ashtottara Shatanamavali, alongside widely used Sanskrit and Hindi names. Every name shows its meaning and cites where it comes from, down to the verse number.

WORKS COMPLETELY OFFLINE
Everything runs on your phone. No account, no sign-in, no internet needed. Birth details are never sent anywhere and are not stored.

WHAT YOU SEE
• Nakshatra, pada, Rashi and naming syllable for the birth
• Names grouped as Best, Good and Worst matches
• Meaning and scriptural source for every name
• Birth number vs name number, explained
• Filter by boy, girl, or either

A NOTE ON TRADITION
Naming customs vary by region and family. Numerology systems differ between practitioners. Treat these suggestions as a starting point for reflection and family discussion, not a substitute for guidance from your family priest or astrologer.

Made by Vigyatri Solutions.
```

## Data safety form

Answer **"No"** to data collection and **"No"** to data sharing. The app makes zero network
requests and requests zero permissions — this is verifiable in the source
(`grep -r "fetch(" app lib components` returns nothing).

## Content rating questionnaire

No violence, sexuality, profanity, controlled substances, gambling, or user-generated
content. Expect a rating of **Everyone**.

## Graphics

| Asset | Requirement | Status |
|---|---|---|
| App icon | 512×512 PNG | export from `assets/icon.png` (1024²; Play accepts it or downscale) |
| Feature graphic | 1024×500 | `store/feature-graphic-1024x500.png` ✅ |
| Phone screenshots | 2–8, 16:9 to 9:16, ≥320px | **take from the preview APK on a real phone** — home, results, name detail |

Suggested screenshot sequence: (1) birth-details form, (2) results with Best/Good/Worst,
(3) a name-detail card showing the meaning and source citation.

---

## First-time setup for the Vigyatri organization account

You only do this once.

1. **Google account for the org.** Use a Google Workspace account on the vigyatri.com domain
   if you have one; otherwise a Gmail account you control. Google verifies the *organization*,
   not the email domain, but a matching domain looks legitimate and avoids questions.
2. **D-U-N-S number.** Organization accounts require one. Free from Dun & Bradstreet
   (https://www.dnb.com/duns.html). Usually a few days; can take up to 30. **Start this first
   — it is the long pole.**
3. **Register** at https://play.google.com/console → choose **Organization** → pay the
   one-time $25 → enter legal name, address, website (vigyatri.com), D-U-N-S, and contact
   phone/email. Google verifies identity; allow a few days.
4. **Create the app** in the Console: name `HinduNaamKaran`, free, app (not game).
5. **Service account for `eas submit`** (optional but saves manual uploads):
   Play Console → Setup → API access → create a Google Cloud service account → grant it
   *Release manager* on the app → download the JSON key → save it as
   `mobile/play-service-account.json` (already gitignored).

## Build and submit

```bash
cd mobile
eas login
eas build --platform android --profile production   # produces an .aab
eas submit --platform android                       # uploads to the Internal testing track as a draft
```

`eas.json` deliberately targets the **internal** track as a **draft**. Review the draft in the
Console, add screenshots and listing text, then promote to Production yourself. Organization
accounts can go straight to Production — no closed-test wait.

Without a service account, skip `eas submit` and upload the `.aab` by hand under
Release → Production → Create new release.
