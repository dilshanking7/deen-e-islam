import { loadTranslation } from "./translation-loader";
import { LanguageCode } from "./languages";
import { SURAH_PAGE_MAP } from "@/lib/surah-page-map";

export interface PageTranslation {
  surahNumber: number;
  surahName: string;
  page: number;
  ayahs: unknown[];
}

export async function loadPageTranslation(
  page: number,
  language: LanguageCode
): Promise<PageTranslation | null> {

  // Current page kis Surah me hai
  let current = SURAH_PAGE_MAP[0];

  for (let i = 0; i < SURAH_PAGE_MAP.length; i++) {
    if (page >= SURAH_PAGE_MAP[i].page) {
      current = SURAH_PAGE_MAP[i];
    }
  }

  const translation = await loadTranslation(
    current.number,
    language
  );

  return {
    surahNumber: current.number,
    surahName: current.englishName,
    page,
    ayahs: translation,
  };
}