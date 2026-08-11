export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  label: string;
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
