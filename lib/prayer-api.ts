import axios from "axios";

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface PrayerDay {
  timings: PrayerTimings;
  date: string;
  weekday: string;
  hijri: { date: string; weekday: string; month: string; year: string };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: { name: string };
    location: { city: string; country: string; latitude: number; longitude: number };
  };
}

export const PRAYER_ORDER = [
  { key: "Fajr", name: "Fajr", arabic: "الفجر", icon: "🌅" },
  { key: "Sunrise", name: "Sunrise", arabic: "الشروق", icon: "🌄" },
  { key: "Dhuhr", name: "Dhuhr", arabic: "الظهر", icon: "☀️" },
  { key: "Asr", name: "Asr", arabic: "العصر", icon: "🌤️" },
  { key: "Maghrib", name: "Maghrib", arabic: "المغرب", icon: "🌇" },
  { key: "Isha", name: "Isha", arabic: "العشاء", icon: "🌙" },
] as const;

export type PrayerKey = (typeof PRAYER_ORDER)[number]["key"];

export const ADHAN_URL = "https://cdn.aladhan.com/audio/adhans/a9.mp3";
export const FAJR_ADHAN_URL = "https://cdn.aladhan.com/audio/adhans/a4.mp3";

export const CALCULATION_METHODS: Record<number, string> = {
  1: "University of Karachi (India/Pakistan)",
  2: "ISNA (North America)",
  3: "Muslim World League",
  4: "Umm al-Qura (Makkah)",
  5: "Egyptian General Authority",
  7: "Institute of Geophysics (Tehran)",
  8: "Gulf Region",
  9: "Kuwait",
  10: "Qatar",
  11: "Singapore",
  12: "France (UOIF)",
  15: "Diyanet (Turkey)",
};

// Pick a sensible default calculation method for the user's region so the
// prayer times shown are accurate for their country without any manual setup.
export function defaultPrayerMethod(): number {
  if (typeof window === "undefined" || typeof Intl === "undefined") return 1;
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return 1;
  }
  if (/Asia\/Karachi|Asia\/Calcutta|Asia\/Kolkata|Asia\/Dhaka|Asia\/Colombo|Asia\/Kathmandu/.test(tz))
    return 1;
  if (/America\//.test(tz)) return 2;
  if (/Asia\/Riyadh|Asia\/Jeddah|Asia\/Makkah|Asia\/Baghdad|Asia\/Bahrain|Asia\/Muscat|Asia\/Aden/.test(tz))
    return 4;
  if (/Asia\/Tehran/.test(tz)) return 7;
  if (/Asia\/Kuwait/.test(tz)) return 9;
  if (/Asia\/Qatar|Asia\/Doha/.test(tz)) return 10;
  if (/Asia\/Singapore|Asia\/Kuala_Lumpur/.test(tz)) return 11;
  if (/Europe\/Paris|Europe\/London/.test(tz)) return 12;
  if (/Europe\/Istanbul/.test(tz)) return 15;
  if (/Africa\/Cairo|^Africa/.test(tz)) return 5;
  return 1;
}

const PRAYER_CACHE_KEY = "islaam-prayer-cache";

function readCachedPrayerDay(latitude: number, longitude: number, method: number) {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(localStorage.getItem(PRAYER_CACHE_KEY) || "null") as
      | (PrayerDay & { cachedAt?: number; cachedMethod?: number })
      | null;
    if (!cached) return null;
    const stale = !cached.cachedAt || new Date(cached.cachedAt).toDateString() !== new Date().toDateString();
    if (stale) return null;
    const sameMethod = cached.cachedMethod === method;
    const nearLocation =
      Math.abs((cached.meta?.latitude || 0) - latitude) < 0.75 &&
      Math.abs((cached.meta?.longitude || 0) - longitude) < 0.75;
    if (!sameMethod || !nearLocation) return null;
    return cached;
  } catch {
    return null;
  }
}

function cachePrayerDay(day: PrayerDay, method: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      PRAYER_CACHE_KEY,
      JSON.stringify({ ...day, cachedAt: Date.now(), cachedMethod: method })
    );
  } catch {}
}

export function formatPrayerTime(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return time;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function toMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const h = parseInt(match[1], 10) % 24;
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}

export function getTimeZoneOffset(timezone?: string): number {
  if (!timezone || typeof Intl === "undefined") return 0;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    if (!parts) return 0;
    // Android Chrome returns compact offsets like "GMT+5" or "GMT+5:30"
    // (single-digit hour), so allow 1-2 hour digits with optional minutes.
    const match = parts.match(/^GMT([+-])(\d{1,2}):?(\d{1,2})?$/);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    const h = parseInt(match[2], 10);
    const m = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (h + m / 60);
  } catch {
    return 0;
  }
}

export function prayerTimeInLocal(time: string, timezone?: string): Date {
  const today = new Date();
  const [hm, ampm] = time.trim().split(" ");
  const [hStr, mStr] = hm.split(":");
  let h = parseInt(hStr, 10) % 24;
  const m = parseInt(mStr, 10);
  if (ampm) {
    const isPM = ampm.toUpperCase() === "PM";
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
  }
  const base = new Date(today);
  base.setHours(0, 0, 0, 0);
  const serverOffset = timezone ? getTimeZoneOffset(timezone) : null;
  if (serverOffset === null) {
    base.setHours(h, m, 0, 0);
    return base;
  }
  const deviceOffset = -new Date().getTimezoneOffset() / 60;
  const minutesFromMidnight = h * 60 + m + (deviceOffset - serverOffset) * 60;
  base.setMinutes(minutesFromMidnight);
  return base;
}

export async function getPrayerTimings(params: {
  latitude: number;
  longitude: number;
  method?: number;
}): Promise<PrayerDay> {
  const { latitude, longitude, method = 1 } = params;
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;

  try {
    const res = await axios.get(
      `https://api.aladhan.com/v1/timings/${dateStr}`,
      {
        params: {
          latitude,
          longitude,
          method,
        },
      }
    );

    const day = toPrayerDay(res.data.data, latitude, longitude);
    cachePrayerDay(day, method);
    return day;
  } catch (error) {
    const cached = readCachedPrayerDay(latitude, longitude, method);
    if (cached) return cached;
    throw error;
  }
}

export interface CityTimingsParams {
  city: string;
  country?: string;
  state?: string;
  method?: number;
}

export async function getPrayerTimingsByCity(
  params: CityTimingsParams
): Promise<PrayerDay> {
  const { city, country, state, method = 1 } = params;
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;

  const res = await axios.get(
    `https://api.aladhan.com/v1/timingsByCity/${dateStr}`,
    {
      params: { city, country, state, method },
    }
  );

  const raw = res.data.data;
  const lat = Number(raw.meta?.latitude) || 0;
  const lng = Number(raw.meta?.longitude) || 0;
  return toPrayerDay(raw, lat, lng);
}

interface RawAladhan {
  timings: PrayerTimings;
  date?: {
    readable?: string;
    hijri?: { date: string; weekday: { en: string }; month: { en: string }; year: string };
  };
  meta?: {
    timezone?: string;
    method?: { name: string };
    latitude?: number;
    longitude?: number;
    location?: PrayerDay["meta"]["location"];
  };
}

function toPrayerDay(raw: RawAladhan, latitude: number, longitude: number): PrayerDay {
  return {
    timings: raw.timings,
    date: raw.date?.readable || "",
    weekday: raw.date?.hijri?.weekday?.en || "",
    hijri: {
      date: raw.date?.hijri?.date || "",
      weekday: raw.date?.hijri?.weekday?.en || "",
      month: raw.date?.hijri?.month?.en || "",
      year: raw.date?.hijri?.year || "",
    },
    meta: {
      latitude,
      longitude,
      timezone: raw.meta?.timezone || "",
      method: raw.meta?.method || { name: "" },
      location: raw.meta?.location || {
        city: "",
        country: "",
        latitude,
        longitude,
      },
    },
  };
}

export async function getPrayerCalendar(params: {
  latitude: number;
  longitude: number;
  method?: number;
  month: number;
  year: number;
}): Promise<PrayerDay[]> {
  const { latitude, longitude, method = 1, month, year } = params;
  interface CalendarDay {
    timings: PrayerTimings;
    date: { readable: string; hijri: { date: string; weekday: { en: string }; month: { en: string }; year: string } };
    meta?: { timezone?: string; method?: { name: string }; location?: PrayerDay["meta"]["location"] };
  }
  const res = await axios.get("https://api.aladhan.com/v1/calendar", {
    params: { latitude, longitude, method, month, year },
  });
  return (res.data.data as CalendarDay[]).map((d) => ({
    timings: d.timings,
    date: d.date.readable,
    weekday: d.date.hijri.weekday.en,
    hijri: {
      date: d.date.hijri.date,
      weekday: d.date.hijri.weekday.en,
      month: d.date.hijri.month.en,
      year: d.date.hijri.year,
    },
    meta: {
      latitude,
      longitude,
      timezone: d.meta?.timezone || "",
      method: d.meta?.method || { name: "" },
      location: d.meta?.location || { city: "", country: "", latitude: 0, longitude: 0 },
    },
  }));
}
