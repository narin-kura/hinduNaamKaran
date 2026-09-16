# Google Play listing — HinduNaamKaran (Vigyatri Solutions LLP)

Paste-ready content for the Play Console. Character limits are Google's.

---

## Identity

| Field | Value |
|---|---|
| Developer account | **Vigyatri Solutions LLP** (organization account — exempt from the 12-tester rule) |
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

Made by Vigyatri Solutions LLP.
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

The legal entity is the **Indian LLP**. Publishing from an Indian entity to a worldwide (or
India-only) audience is completely normal; the entity's country does not limit where the app
is sold. You only do this once.

1. **D-U-N-S number from D&B India** — https://www.dnb.co.in/duns/get-a-duns
   Apply as **Vigyatri Solutions LLP** — the exact legal name on the MCA Certificate of Incorporation.
   Have ready: Certificate of Incorporation / LLPIN, PAN, registered-office address proof,
   and a partner's name and contact details.
   - **Free route: 30-45 days.** D&B India first sends a basic form, then emails a link for
     detailed information 1-2 weeks later, then issues the number.
   - **Paid express: about 5-7 days.** Check D&B India's current price. Given the goal of
     going live soon, this is the difference between roughly two weeks and roughly six weeks
     to launch, and the number is reused for the Apple organization account later.
2. **Google account for the org.** Any Google account you control works; Google verifies the
   *organization*, not the email domain. Use one you will keep long-term — it becomes the
   account owner.
3. **Register** at https://play.google.com/console → choose **Organization** → pay the
   one-time $25 → enter **Vigyatri Solutions LLP** (must match the D-U-N-S record exactly), Indian
   registered address, website (vigyatri.com), D-U-N-S, and a contact phone and email. Google
   verifies the organization and your identity; allow a few days. Have the Certificate of
   Incorporation as a PDF in case a document is requested.
4. **Create the app** in the Console: name `HinduNaamKaran`, free, app (not game).
5. **Service account for `eas submit`** (optional but saves manual uploads):
   Play Console → Setup → API access → create a Google Cloud service account → grant it
   *Release manager* on the app → download the JSON key → save it as
   `mobile/play-service-account.json` (already gitignored).

**Timeline reality check:** organization route with express D-U-N-S ≈ 2 weeks to a live
listing, and no closed-test requirement. The personal-account alternative is ≈ 3 weeks and
publishes under your own name. The organization route with the *free* D-U-N-S is the slowest
of the three (≈ 6 weeks).

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
