import cityTimezones from "city-timezones";

export type CityMatch = {
  city: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  timeZone: string;
};

const ALL_CITIES = cityTimezones.cityMapping as {
  city: string;
  city_ascii: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  pop: number;
  timezone: string;
}[];

// The bundled city-timezones data predates some Indian state changes. Coordinates and
// timezones (what the calculation uses) are correct; only the displayed state is fixed here.
const TELANGANA_CITIES = new Set(["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"]);
const RENAMED_STATES: Record<string, string> = { Orissa: "Odisha", Uttaranchal: "Uttarakhand" };

function currentProvince(c: { city_ascii: string; province: string; country: string }): string {
  if (c.country !== "India") return c.province;
  if (c.province === "Andhra Pradesh" && TELANGANA_CITIES.has(c.city_ascii)) return "Telangana";
  return RENAMED_STATES[c.province] ?? c.province;
}

export function searchCities(query: string, limit = 15): CityMatch[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  return ALL_CITIES.filter((c) => c.city_ascii.toLowerCase().startsWith(trimmed))
    .sort((a, b) => (b.pop || 0) - (a.pop || 0))
    .slice(0, limit)
    .map((c) => ({
      city: c.city,
      province: currentProvince(c),
      country: c.country,
      lat: c.lat,
      lng: c.lng,
      timeZone: c.timezone,
    }));
}
