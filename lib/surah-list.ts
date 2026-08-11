import { getSurahs } from "./quran-api";

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const CACHE_KEY = "surah-list-cache";
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function getSurahList(force = false): Promise<SurahMeta[]> {
  if (!force && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          return parsed.list as SurahMeta[];
        }
      }
    } catch {}
  }

  const surahs = await getSurahs();
  const list: SurahMeta[] = surahs.map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), list })
      );
    } catch {}
  }

  return list;
}

export function searchSurahs(list: SurahMeta[], query: string): SurahMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return list
    .filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        String(s.number) === q ||
        (q.length <= 3 && Number(q) === s.number)
    )
    .slice(0, 15);
}
