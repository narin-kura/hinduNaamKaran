import * as Astronomy from "astronomy-engine";
import { fromZonedTime } from "date-fns-tz";
import nakshatraPadaSyllables from "../data/nakshatraPadaSyllables.json";

const NAKSHATRA_SPAN = 360 / 27; // 13.3333...deg
const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.3333...deg

const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena",
];

export type BirthChart = {
  siderealLongitude: number;
  nakshatraIndex: number; // 0-26
  nakshatraName: string;
  padaIndex: number; // 0-3
  syllable: string;
  rashiIndex: number; // 0-11
  rashiName: string;
};

export type BirthInput = {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm", 24-hour, local to timeZone
  timeZone: string; // IANA zone, e.g. "Asia/Kolkata"
};

/**
 * Approximate Lahiri ayanamsa (tropical -> sidereal offset), in degrees.
 * Linear fit around J2000 (~23.853deg, precessing ~50.29"/year). This is
 * arc-minute-grade, not ephemeris-grade -- plenty for picking a naming
 * syllable, but not for muhurta-precision astrology.
 */
function lahiriAyanamsaDegrees(utcDate: Date): number {
  const julianDay = utcDate.getTime() / 86400000 + 2440587.5;
  const julianCenturiesSinceJ2000 = (julianDay - 2451545.0) / 36525.0;
  const julianYearsSinceJ2000 = julianCenturiesSinceJ2000 * 100;
  return 23.85333 + 0.013971 * julianYearsSinceJ2000;
}

function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Geocentric apparent sidereal (Lahiri) ecliptic longitude of the Moon, in degrees [0, 360). */
export function getMoonSiderealLongitude(utcDate: Date): number {
  const eclipticOfDate = Astronomy.EclipticGeoMoon(utcDate);
  return normalizeDegrees(eclipticOfDate.lon - lahiriAyanamsaDegrees(utcDate));
}

export function getBirthChart(input: BirthInput): BirthChart {
  const utcDate = fromZonedTime(`${input.date}T${input.time}:00`, input.timeZone);
  const siderealLongitude = getMoonSiderealLongitude(utcDate);

  const nakshatraIndex = Math.floor(siderealLongitude / NAKSHATRA_SPAN) % 27;
  const positionInNakshatra = siderealLongitude - nakshatraIndex * NAKSHATRA_SPAN;
  const padaIndex = Math.min(3, Math.floor(positionInNakshatra / PADA_SPAN));
  const rashiIndex = Math.floor(siderealLongitude / 30) % 12;

  const nakshatraEntry = nakshatraPadaSyllables[nakshatraIndex];

  return {
    siderealLongitude,
    nakshatraIndex,
    nakshatraName: nakshatraEntry.nakshatra,
    padaIndex,
    syllable: nakshatraEntry.padas[padaIndex],
    rashiIndex,
    rashiName: RASHI_NAMES[rashiIndex],
  };
}

// All 108 pada syllables in zodiac order. Nakshatra k, pada j is index 4k + j;
// each rashi spans nine consecutive padas, so rashi r is indices 9r .. 9r+8.
const ALL_PADA_SYLLABLES: string[] = nakshatraPadaSyllables.flatMap((n) => n.padas);

const unique = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) === i);

/** The four syllables of a nakshatra. Common practice accepts any of them. */
export function getNakshatraSyllables(nakshatraIndex: number): string[] {
  return unique(nakshatraPadaSyllables[nakshatraIndex].padas);
}

/** The nine pada syllables that fall within a rashi. Also widely used for naming. */
export function getRashiSyllables(rashiIndex: number): string[] {
  return unique(ALL_PADA_SYLLABLES.slice(rashiIndex * 9, rashiIndex * 9 + 9));
}
