import axios from "axios";
import { DEFAULT_LANGUAGE, LanguageCode } from "./languages";

const quranApi = axios.create({
  baseURL: "https://api.quran.com/api/v4",
  timeout: 15000,
});

const cloudApi = axios.create({
  baseURL: "https://api.alquran.cloud/v1",
  timeout: 15000,
});

const TRANSLATION_IDS: Record<LanguageCode, number> = {
  en: 20,   // Sahih International
  ur: 97,   // Urdu
  hi: 122,  // Hindi
};

export async function loadTranslation(
  surah: number,
  language: LanguageCode = DEFAULT_LANGUAGE
) {
  try {
    const { data } = await quranApi.get(
      `/quran/translations/${TRANSLATION_IDS[language]}?chapter_number=${surah}`
    );

    return data.translations;
  } catch {
    console.log("Quran.com failed, using backup...");

    const backup: Record<LanguageCode, string> = {
      en: "en.asad",
      ur: "ur.jalandhry",
      hi: "hi.hindi",
    };

    const { data } = await cloudApi.get(
      `/surah/${surah}/${backup[language]}`
    );

    return data.data.ayahs;
  }
}