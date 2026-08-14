export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  label: string;
}

export interface PlaceName {
  label: string;
  town: string;
  district: string;
  state: string;
  postcode: string;
  country: string;
}

export async function getPlaceName(
  latitude: number,
  longitude: number
): Promise<PlaceName | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address || {};
    const town =
      a.village || a.town || a.city || a.municipality || a.county || "";
    const district =
      a.city_district || a.suburb || a.county_district || "";
    const state = a.state || "";
    const postcode = a.postcode || "";
    const country = a.country || "";
    const parts = [town, district, state].filter(Boolean);
    if (postcode) parts.push(postcode);
    return {
      label: parts.join(", ") || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
      town,
      district,
      state,
      postcode,
      country,
    };
  } catch {
    return null;
  }
}

export async function getLocationByIP(): Promise<GeoLocation | null> {
  try {
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Number(data.latitude) && Number(data.longitude)) {
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);
        const city = data.city || "";
        const country = data.country || "";
        return {
          latitude,
          longitude,
          city,
          country,
          label: [city, country].filter(Boolean).join(", "),
        };
      }
    }
  } catch {}

  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data && Number(data.latitude) && Number(data.longitude)) {
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);
        const city = data.city || "";
        const country = data.country_name || "";
        return {
          latitude,
          longitude,
          city,
          country,
          label: [city, country].filter(Boolean).join(", "),
        };
      }
    }
  } catch {}

  return null;
}
