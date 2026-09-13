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

export function searchCities(query: string, limit = 15): CityMatch[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  return ALL_CITIES.filter((c) => c.city_ascii.toLowerCase().startsWith(trimmed))
    .sort((a, b) => (b.pop || 0) - (a.pop || 0))
    .slice(0, limit)
    .map((c) => ({
      city: c.city,
      province: c.province,
      country: c.country,
      lat: c.lat,
      lng: c.lng,
      timeZone: c.timezone,
    }));
}
